// generate-key.mjs — standalone Nostr keypair for the vetting-loop crash demo.
// Writes scripts/nostr/vetting-loop-key.json (gitignored). Never prints the nsec.
// Usage: node scripts/nostr/generate-key.mjs   (absolute paths enforced)
import { generateSecretKey, getPublicKey } from 'nostr-tools';
import { nip19 } from 'nostr-tools';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = '/Users/jimmy/Desktop/vetting-loop';
const OUT = join(REPO, 'scripts', 'nostr', 'vetting-loop-key.json');

if (existsSync(OUT)) {
  const existing = JSON.parse(readFileSync(OUT, 'utf8'));
  const npub = nip19.npubEncode(getPublicKey(existing.sk));
  console.error('Key already exists at', OUT, '— not regenerating. npub:', npub);
  process.exit(0);
}

const sk = generateSecretKey();
const pk = getPublicKey(sk);
const nsec = nip19.nsecEncode(sk);
const npub = nip19.npubEncode(pk);

writeFileSync(OUT, JSON.stringify({ npub, nsec, created: new Date().toISOString() }, null, 2) + '\n', { mode: 0o600 });

// stdout gets the npub ONLY. The nsec lives in the gitignored file.
console.log(npub);