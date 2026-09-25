// purge-events.mjs — withdraw Vetta's published records from public relays (NIP-09).
//
// DRY-RUN BY DEFAULT. Nothing is sent unless you pass --confirm.
//
// Why: the team paused Nostr publication for a data due-diligence pass. The local
// relay can simply be wiped, but copies that already reached public relays can only
// be *requested* away with a kind-5 deletion event (NIP-09). Relays are not obliged
// to honour them, so this script re-queries afterwards and reports the truth rather
// than claiming success.
//
// Usage:
//   node scripts/nostr/purge-events.mjs                 # inventory only, no writes
//   node scripts/nostr/purge-events.mjs --confirm       # send deletion requests
import { finalizeEvent, nip19 } from 'nostr-tools';
import { WebSocket } from 'ws';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = '/Users/jimmy/Desktop/vetting-loop';
const KEYFILE = join(REPO, 'scripts', 'nostr', 'vetting-loop-key.json');
const TAG = 'vetting-loop-aug2024';

const PUBLIC_RELAYS = ['wss://relay.damus.io', 'wss://nos.lol'];
const CONFIRM = process.argv.includes('--confirm');

const key = JSON.parse(readFileSync(KEYFILE, 'utf8'));
const sk = nip19.decode(key.nsec).data;
const pkHex = nip19.decode(key.npub).data;

function query(relay, timeoutMs = 12000) {
  return new Promise((resolve) => {
    const out = [];
    let done = false;
    const finish = () => { if (!done) { done = true; try { ws.close(); } catch {} resolve(out); } };
    let ws;
    try { ws = new WebSocket(relay, { handshakeTimeout: 10000 }); } catch { return resolve([]); }
    const timer = setTimeout(finish, timeoutMs);
    ws.on('open', () => ws.send(JSON.stringify(['REQ', 'vetta-purge', { kinds: [1], authors: [pkHex], limit: 500 }])));
    ws.on('message', (d) => {
      try {
        const m = JSON.parse(d.toString());
        if (m[0] === 'EVENT') out.push(m[2]);
        if (m[0] === 'EOSE') { clearTimeout(timer); finish(); }
      } catch {}
    });
    ws.on('error', () => { clearTimeout(timer); finish(); });
  });
}

function send(relay, event, timeoutMs = 15000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok, detail) => { if (!done) { done = true; try { ws.close(); } catch {} resolve({ ok, detail }); } };
    let ws;
    try { ws = new WebSocket(relay, { handshakeTimeout: 10000 }); } catch (e) { return resolve({ ok: false, detail: e.message }); }
    const timer = setTimeout(() => finish(false, 'timeout'), timeoutMs);
    ws.on('open', () => ws.send(JSON.stringify(['EVENT', event])));
    ws.on('message', (d) => {
      try {
        const m = JSON.parse(d.toString());
        if (m[0] === 'OK' && m[1] === event.id) { clearTimeout(timer); finish(m[2], m[3] || ''); }
      } catch {}
    });
    ws.on('error', (e) => { clearTimeout(timer); finish(false, e.message); });
  });
}

console.log(`\nAuthor: ${pkHex}`);
console.log(`Mode: ${CONFIRM ? 'SEND DELETION REQUESTS' : 'DRY RUN (nothing will be sent)'}\n`);

let totalFound = 0;
for (const relay of PUBLIC_RELAYS) {
  const events = await query(relay);
  totalFound += events.length;
  console.log(`── ${relay}`);
  console.log(`   found: ${events.length} event(s) published by this key`);
  if (events.length === 0) { console.log(); continue; }

  if (!CONFIRM) {
    for (const e of events.slice(0, 3)) {
      console.log(`   · ${e.id.slice(0, 16)}… ${new Date(e.created_at * 1000).toISOString().slice(0, 16)} ${e.content.slice(0, 44).replace(/\n/g, ' ')}`);
    }
    if (events.length > 3) console.log(`   · …and ${events.length - 3} more`);
    console.log();
    continue;
  }

  // One kind-5 event referencing every id we hold for this relay.
  const del = finalizeEvent({
    kind: 5,
    created_at: Math.floor(Date.now() / 1000),
    tags: [...events.map((e) => ['e', e.id]), ['k', '1']],
    content: 'Withdrawn by the publisher pending a data-integrity review.',
  }, sk);

  const res = await send(relay, del);
  console.log(`   deletion request ${del.id.slice(0, 16)}… -> accepted=${res.ok} ${res.detail}`);
  await new Promise((r) => setTimeout(r, 2500));

  const after = await query(relay);
  console.log(`   re-query after request: ${after.length} event(s) still served`);
  if (after.length > 0) {
    console.log('   NOTE: relay has not honoured the deletion yet (relays may ignore NIP-09).');
  }
  console.log();
}

console.log(`Total found across public relays: ${totalFound}`);
console.log(CONFIRM ? 'Done. Verify again later — relays are not obliged to honour NIP-09.\n' : 'Dry run only. Re-run with --confirm to send deletion requests.\n');
process.exit(0);
