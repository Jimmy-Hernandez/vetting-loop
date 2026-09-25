/**
 * Verify a mirror: recompute every record hash from a downloaded ledger.json
 * and check the root against the mirror's manifest and against the root
 * compiled into this package.
 *
 *   pnpm --filter @vetting-loop/ledger verify ledger.json manifest.json
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LEDGER_COMPILED, PEOPLE, buildManifest, type Manifest, type Person } from "../src";

const [ledgerPath, manifestPath] = process.argv.slice(2).map((p) => resolve(process.env.INIT_CWD ?? process.cwd(), p));
if (!ledgerPath) {
  console.error("usage: verify <ledger.json> [manifest.json]");
  process.exit(2);
}

const mirror = JSON.parse(readFileSync(ledgerPath, "utf8")) as { people: Person[]; compiled: string };
const recomputed = buildManifest(mirror.people, mirror.compiled);
const reference = buildManifest(PEOPLE, LEDGER_COMPILED);
let failures = 0;

if (manifestPath) {
  const claimed = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  for (const [slug, hash] of Object.entries(claimed.hashes)) {
    if (recomputed.hashes[slug] !== hash) {
      console.log(`MISMATCH  ${slug}`);
      failures++;
    }
  }
  console.log(`${claimed.root === recomputed.root ? "OK  " : "FAIL"}  mirror manifest root matches mirror ledger`);
  if (claimed.root !== recomputed.root) failures++;
}

const same = recomputed.root === reference.root;
console.log(`${same ? "OK  " : "DIFF"}  mirror root ${recomputed.root.slice(0, 16)}… vs this build ${reference.root.slice(0, 16)}…`);
if (!same) {
  const changed = Object.keys(reference.hashes).filter((s) => recomputed.hashes[s] !== reference.hashes[s]);
  console.log(`      ${changed.length} record(s) differ from this build: ${changed.slice(0, 10).join(", ")}`);
}
console.log(`${recomputed.records} records checked`);
process.exit(failures ? 1 : 0);
