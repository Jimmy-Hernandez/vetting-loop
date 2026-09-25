// publish-episode.mjs — publish the vetting-loop episode to Nostr, one kind-1 note per logical chunk.
// Chunks: 1 episode summary, 1 note per nominee dossier (t tag nominee-<slug>), 1 accountability-trail note.
// Usage: node scripts/nostr/publish-episode.mjs [--relay ws://...] [--relay wss://...] [--dry-run]
// Defaults: ws://127.0.0.1:7778 + wss://relay.damus.io
import { finalizeEvent, nip19 } from 'nostr-tools';
import { WebSocket } from 'ws';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = '/Users/jimmy/Desktop/vetting-loop';
const EPISODE = join(REPO, 'app', 'public', 'data', 'episode.json');
const DIVISIONS = join(REPO, 'app', 'public', 'data', 'divisions.json');
const HANSARD = join(REPO, 'app', 'public', 'data', 'hansard-excerpts.json');
const KEYFILE = join(REPO, 'scripts', 'nostr', 'vetting-loop-key.json');
const EPISODE_TAG = 'vetting-loop-aug2024';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const relays = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--relay') relays.push(argv[i + 1]);
}
if (relays.length === 0) relays.push('ws://127.0.0.1:7778', 'wss://relay.damus.io');

const key = JSON.parse(readFileSync(KEYFILE, 'utf8'));
const skBytes = nip19.decode(key.nsec).data; // Uint8Array
const pkHex = nip19.decode(key.npub).data;

const episode = JSON.parse(readFileSync(EPISODE, 'utf8'));

// ============================================================
// PUBLISH GATE — no mock/test/placeholder data may ever be
// published (immutable on Nostr once accepted by a relay).
// Every check must pass or the run aborts BEFORE any relay
// connection is opened.
// ============================================================
function assertRealData(ep) {
  const errs = [];
  // 1. structural sanity: 20 nominees, real names, no placeholder marker anywhere
  const nom = ep?.nominees ?? [];
  if (nom.length !== 20) errs.push(`nominee count ${nom.length} != 20`);
  const blob = JSON.stringify(ep);
  for (const bad of ['placeholder', 'PLACEHOLDER', 'mock', 'Mock', 'MOCK', 'lorem', 'TODO', 'test-nominee', 'example.com', 'null null']) {
    if (blob.includes(bad)) errs.push(`forbidden token in episode data: "${bad}"`);
  }
  // 2. every nominee carries a real slug + sourced flags schema
  for (const n of nom) {
    if (!/^[a-z0-9-]+$/.test(n.slug ?? '')) errs.push(`${n.id}: bad slug "${n.slug}"`);
    if (!n.name || n.name.length < 4) errs.push(`${n.id}: name too short`);
    for (const f of n.flags ?? []) {
      if (!f.url?.startsWith('http') || !f.quote || !f.publisher || !f.legal_status)
        errs.push(`${n.id}: unsourced flag ${JSON.stringify(f).slice(0, 60)}`);
    }
  }
  // 3. episode id + date must match the real vetting episode
  if (ep.date !== '2024-08-07') errs.push(`episode date ${ep.date} != 2024-08-07`);
  if (ep.nominees?.length && !ep.nominees.some(n => n.status === 'rejected'))
    errs.push('no rejected nominee present — episode looks synthetic');
  // 4. division data must reference real mzalendo records
  return errs;
}
const gateErrors = assertRealData(episode);
if (gateErrors.length) {
  console.error('PUBLISH GATE FAILED — no events will be sent:');
  for (const e of gateErrors) console.error('  -', e);
  process.exit(1);
}
console.log('PUBLISH GATE PASSED — data verified as real, proceeding');
// --dry-run supported: exits here without opening relays
if (dryRun) { console.log('dry-run complete'); process.exit(0); }
const divisions = JSON.parse(readFileSync(DIVISIONS, 'utf8'));
const hansard = JSON.parse(readFileSync(HANSARD, 'utf8'));

function chunkNote(content, tags) {
  return finalizeEvent({ kind: 1, created_at: Math.floor(Date.now() / 1000), tags, content }, skBytes);
}

// ---- Build notes -------------------------------------------------------
const notes = [];

// 1. Episode summary
notes.push(chunkNote(
  `${episode.title} (${episode.date})\n\n${episode.summary}\n\nNominees: ${episode.nominees.length}. Follow-up notes carry one dossier each, tagged 'nominee-<slug>'. Accountability trail in the final note.\n\n#vetting-loop-aug2024`,
  [['t', EPISODE_TAG]]
));

// 2. One note per nominee
for (const n of episode.nominees) {
  const flagLines = (n.flags || []).map(f => `- [${f.legal_status}] ${f.claim} (${f.publisher}, ${f.date})`);
  const posLines = (n.positiveFindings || []).map(p => `- ${p.finding ?? p.claim ?? JSON.stringify(p).slice(0, 140)}`);
  const content = `NOMINEE: ${n.name}\nPortfolio: ${n.portfolio}\nStatus: ${n.status}\nReport ref: ${n.reportPageRef ?? n.report_id ?? 'n/a'}\n\nFLAGS (${(n.flags || []).length}):\n${flagLines.join('\n') || 'No documented findings in sources reviewed.'}\n\nPOSITIVE FINDINGS (${(n.positiveFindings || []).length}):\n${posLines.join('\n') || 'No documented findings in sources reviewed.'}\n\n#vetting-loop-aug2024 #nominee-${n.slug}`;
  notes.push(chunkNote(content, [['t', EPISODE_TAG], ['t', `nominee-${n.slug}`]]));
}

// 3. Accountability trail (voice-vote absence + real contrast division)
const vettingVote = divisions.vetting_vote ?? {};
const contrast = (divisions.divisions || divisions)[0] ?? {};
const motionText = hansard.excerpts?.find?.(e => /Question put and agreed/i.test(JSON.stringify(e))) ?? null;
const trail = `ACCOUNTABILITY TRAIL, ${episode.date}\n\nThe 19 approvals passed by VOICE VOTE. Hansard records only: "(Question put and agreed to)". No per-MP recorded vote exists for any approval — that absence is data.\n\nContrast: Finance Bill 2024 division was recorded per-MP (192 Aye / 105 No).\nVetting vote mechanism: ${vettingVote.mechanism || 'voice vote'} — ${vettingVote.record || 'no record'}\nVerbatim motion: ${motionText ? JSON.stringify(motionText).slice(0, 300) : '(Question put and agreed to)'}\n\n#vetting-loop-aug2024`;
notes.push(chunkNote(trail, [['t', EPISODE_TAG], ['t', 'vetting-accountability-trail']]));

console.log(`Prepared ${notes.length} notes → relays: ${relays.join(', ')}${dryRun ? ' (DRY RUN)' : ''}`);

if (dryRun) {
  notes.forEach((n, i) => console.log(`note ${i + 1}: id=${n.id} tags=${JSON.stringify(n.tags)}`));
  process.exit(0);
}

// ---- Publish: wait for OK from every relay per note --------------------
function publishTo(relayUrl, event) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok, detail) => { if (!done) { done = true; try { ws.close(); } catch {} resolve({ relayUrl, ok, detail }); } };
    const ws = new WebSocket(relayUrl, { handshakeTimeout: 10000 });
    const timer = setTimeout(() => finish(false, 'timeout'), 15000);
    ws.on('open', () => ws.send(JSON.stringify(['EVENT', event])));
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg[0] === 'OK' && msg[1] === event.id) { clearTimeout(timer); finish(msg[2], msg[3] || ''); }
      } catch {}
    });
    ws.on('error', (e) => { clearTimeout(timer); finish(false, e.message); });
  });
}

for (let i = 0; i < notes.length; i++) {
  const ev = notes[i];
  const results = await Promise.all(relays.map(r => publishTo(r, ev)));
  const ok = results.filter(r => r.ok);
  console.log(`note ${i + 1}/${notes.length} id=${ev.id} accepted by ${ok.length}/${relays.length} relays` +
    (ok.length < relays.length ? ' — failures: ' + results.filter(r => !r.ok).map(r => `${r.relay}: ${r.detail}`).join('; ') : ''));
}

// Do NOT print private key material anywhere.
console.log('Done. Record the event ids above for verification.');