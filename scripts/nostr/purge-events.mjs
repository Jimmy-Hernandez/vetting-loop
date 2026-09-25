// purge-events.mjs — withdraw Vetta's published records from public relays (NIP-09).
//
// DRY-RUN BY DEFAULT. Nothing is sent unless you pass --confirm.
//
// Why: the team paused Nostr publication pending a data due-diligence pass, so no
// project record should be readable on a public relay.
//
// Design rule learned the hard way: a relay that does not answer is reported as
// UNVERIFIED, never as "0 events". Reporting a failed connection as empty reads as
// "verified clean" and hides live copies. Widen PUBLIC_RELAYS whenever a new relay
// is used: a purge that does not check a relay is not a purge.
//
// Usage:
//   node scripts/nostr/purge-events.mjs              # inventory only
//   node scripts/nostr/purge-events.mjs --confirm    # send deletion requests
import { finalizeEvent, nip19 } from 'nostr-tools';
import { WebSocket } from 'ws';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const KEYFILE = join(REPO, 'scripts', 'nostr', 'vetting-loop-key.json');
const CONFIRM = process.argv.includes('--confirm');

const PUBLIC_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net',
  'wss://offchain.pub',
];

const key = JSON.parse(readFileSync(KEYFILE, 'utf8'));
const sk = nip19.decode(key.nsec).data;
const pkHex = nip19.decode(key.npub).data;

// status 'ok' means the relay answered and the result is trustworthy.
function query(relay, timeoutMs = 30000) {
  return new Promise((resolve) => {
    const events = [];
    let done = false;
    let ws;
    const finish = (status, detail) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { ws.onmessage = null; ws.onerror = null; ws.onclose = null; ws.close(); } catch {}
      resolve({ status, detail, events });
    };
    try {
      ws = new WebSocket(relay, { handshakeTimeout: 25000 });
    } catch (e) {
      return resolve({ status: 'bad-url', detail: e.message, events: [] });
    }
    const timer = setTimeout(() => finish('timeout'), timeoutMs);
    ws.on('open', () => ws.send(JSON.stringify(['REQ', 'vetta-purge', { kinds: [1, 5], authors: [pkHex], limit: 500 }])));
    ws.on('message', (d) => {
      try {
        const m = JSON.parse(d.toString());
        if (m[0] === 'EVENT') events.push(m[2]);
        if (m[0] === 'EOSE') finish('ok');
        if (m[0] === 'CLOSED') finish('closed', String(m[2] ?? '').slice(0, 100));
        if (m[0] === 'NOTICE') finish('notice', String(m[1] ?? '').slice(0, 100));
      } catch {}
    });
    ws.on('error', () => finish('error'));
    ws.on('close', () => finish('closed'));
  });
}

function send(relay, event, timeoutMs = 20000) {
  return new Promise((resolve) => {
    let done = false;
    let ws;
    const finish = (ok, detail) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { ws.onmessage = null; ws.onerror = null; ws.onclose = null; ws.close(); } catch {}
      resolve({ ok, detail });
    };
    try {
      ws = new WebSocket(relay, { handshakeTimeout: 25000 });
    } catch (e) {
      return resolve({ ok: false, detail: e.message });
    }
    const timer = setTimeout(() => finish(false, 'timeout'), timeoutMs);
    ws.on('open', () => ws.send(JSON.stringify(['EVENT', event])));
    ws.on('message', (d) => {
      try {
        const m = JSON.parse(d.toString());
        if (m[0] === 'OK' && m[1] === event.id) finish(m[2], m[3] || '');
      } catch {}
    });
    ws.on('error', (e) => finish(false, e.message));
  });
}

// Relays flake (handshake errors, momentary rate limits). Retry before calling a
// relay unverified, and pause between relays so we do not trip rate limits.
async function queryWithRetry(relay, attempts = 3, pauseMs = 2000) {
  let last = null;
  for (let i = 1; i <= attempts; i++) {
    last = await query(relay);
    if (last.status === 'ok') return last;
    if (i < attempts) await new Promise((r) => setTimeout(r, pauseMs));
  }
  return last;
}

console.log(`\nAuthor: ${pkHex}`);
console.log(`Mode: ${CONFIRM ? 'SEND DELETION REQUESTS' : 'DRY RUN (nothing will be sent)'}\n`);

let liveTotal = 0;
const unverified = [];

for (const relay of PUBLIC_RELAYS) {
  console.log(`── ${relay}`);
  const { status, detail, events } = await queryWithRetry(relay);

  if (status !== 'ok') {
    unverified.push(relay);
    console.log(`   UNVERIFIED — relay did not answer (${status}${detail ? ': ' + detail : ''})`);
    console.log('   It could still be holding copies; absence is NOT proven here.');
    console.log();
    continue;
  }

  const live = events.filter((e) => e.kind !== 5);
  const notices = events.length - live.length;
  liveTotal += live.length;
  console.log(
    `   found: ${live.length} record(s) from this key` +
      (notices ? ` (+${notices} deletion notice(s) already on file)` : ''),
  );

  if (live.length === 0) {
    console.log();
    continue;
  }

  if (!CONFIRM) {
    for (const e of live.slice(0, 3)) {
      const when = new Date(e.created_at * 1000).toISOString().slice(0, 16);
      console.log(`   · ${e.id.slice(0, 16)}… ${when} ${e.content.slice(0, 44).replace(/\n/g, ' ')}`);
    }
    if (live.length > 3) console.log(`   · …and ${live.length - 3} more`);
    console.log();
    continue;
  }

  // One kind-5 event referencing every id we hold on this relay.
  const del = finalizeEvent(
    {
      kind: 5,
      created_at: Math.floor(Date.now() / 1000),
      tags: [...live.map((e) => ['e', e.id]), ['k', '1']],
      content: 'Withdrawn by the publisher pending a data-integrity review.',
    },
    sk,
  );

  const res = await send(relay, del);
  console.log(`   deletion request ${del.id.slice(0, 16)}… -> accepted=${res.ok} ${res.detail}`);
  await new Promise((r) => setTimeout(r, 3000));

  const after = await queryWithRetry(relay, 2);
  if (after.status !== 'ok') {
    console.log('   re-query could not be completed — relay did not answer');
  } else {
    const stillLive = after.events.filter((e) => e.kind !== 5);
    console.log(`   re-query after request: ${stillLive.length} record(s) still served`);
    if (stillLive.length > 0) {
      console.log('   NOTE: relay has not honoured the deletion yet (relays may ignore NIP-09).');
    }
  }
  console.log();
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`Total records found on relays that answered: ${liveTotal}`);
if (unverified.length) {
  console.log(`\nUNVERIFIED relays (${unverified.length}): ${unverified.join(', ')}`);
  console.log('Re-run later. Do not describe the record as withdrawn while any relay is unverified.');
}
console.log(
  CONFIRM
    ? '\nDone. Verify again later — relays are not obliged to honour NIP-09.'
    : '\nDry run only. Re-run with --confirm to send deletion requests.',
);
process.exit(CONFIRM && unverified.length ? 3 : 0);
