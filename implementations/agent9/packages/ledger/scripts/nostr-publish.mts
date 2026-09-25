/**
 * Sign every ledger record as a kind-30078 Nostr event and, only with
 * --publish, send them to relays.
 *
 *   NOSTR_SECRET_KEY=<hex> pnpm --filter @vetting-loop/ledger nostr:sign            # dry run → out/nostr-signed.json
 *   NOSTR_SECRET_KEY=<hex> NOSTR_RELAYS=wss://a,wss://b pnpm ... nostr:sign --publish
 *
 * The key is read from the environment and never written to disk. Events are
 * effectively permanent once relays accept them: publish only after records
 * are Gazette-verified and the key holder is agreed.
 */
import { mkdirSync, writeFileSync } from "node:fs";

import { LEDGER_COMPILED, PEOPLE, publicKeyOf, signEvent, toTemplate, verifyEvent, type NostrEvent } from "../src/index.ts";

// PUBLICATION PAUSE - see scripts/nostr/nostr-config.mjs (canonical gate).
// All Nostr publishing is paused pending a data due-diligence pass. Two gates
// are required: NOSTR_PUBLISH_ENABLED=1 AND an explicit acknowledgement flag.
// Kept in sync with the canonical gate so both publisher paths behave alike.
const publishEnabled = process.env.NOSTR_PUBLISH_ENABLED === "1";
const acknowledged = process.argv.includes("--i-have-verified-the-data");
if (!publishEnabled || !acknowledged) {
  console.error("");
  console.error("NOSTR PUBLISHING IS DISABLED");
  console.error("Nothing was sent to any relay. This is deliberate: the team paused");
  console.error("publishing pending further due diligence on the record.");
  console.error("");
  console.error("To publish deliberately (only after the audit closes):");
  console.error("  NOSTR_PUBLISH_ENABLED=1 ... nostr:sign --publish --i-have-verified-the-data");
  console.error("See DEMO-RUNBOOK.md for the re-enable procedure.");
  console.error("");
  process.exit(2);
}


const sk = process.env.NOSTR_SECRET_KEY ?? "";
if (!/^[0-9a-f]{64}$/.test(sk)) {
  console.error("Set NOSTR_SECRET_KEY to a 64-char hex secret key.");
  process.exit(2);
}

const events = PEOPLE.map((p) => signEvent(toTemplate(p, LEDGER_COMPILED), sk));
const bad = events.filter((e) => !verifyEvent(e));
if (bad.length) {
  console.error(`${bad.length} events failed self-verification; aborting.`);
  process.exit(1);
}
mkdirSync("out", { recursive: true });
writeFileSync("out/nostr-signed.json", JSON.stringify(events, null, 2));
console.log(`Signed ${events.length} events as ${publicKeyOf(sk)} → out/nostr-signed.json`);

if (!process.argv.includes("--publish")) {
  console.log("Dry run. Re-run with --publish and NOSTR_RELAYS to send.");
  process.exit(0);
}

const relays = (process.env.NOSTR_RELAYS ?? "").split(",").map((r) => r.trim()).filter((r) => r.startsWith("wss://"));
if (!relays.length) {
  console.error("Set NOSTR_RELAYS to a comma-separated list of wss:// relays.");
  process.exit(2);
}

async function publish(relay: string, list: NostrEvent[]): Promise<{ ok: number; failed: number }> {
  return new Promise((done) => {
    const ws = new WebSocket(relay);
    let ok = 0;
    let failed = 0;
    const pending = new Set(list.map((e) => e.id));
    const finish = () => { ws.close(); done({ ok, failed }); };
    const timer = setTimeout(() => { failed += pending.size; finish(); }, 30_000);
    ws.onopen = () => list.forEach((e) => ws.send(JSON.stringify(["EVENT", e])));
    ws.onmessage = (m) => {
      const [type, id, accepted] = JSON.parse(String(m.data));
      if (type !== "OK" || !pending.delete(id)) return;
      accepted ? ok++ : failed++;
      if (!pending.size) { clearTimeout(timer); finish(); }
    };
    ws.onerror = () => { clearTimeout(timer); failed = list.length; finish(); };
  });
}

for (const relay of relays) {
  const r = await publish(relay, events);
  console.log(`${relay}: ${r.ok} accepted, ${r.failed} rejected or timed out`);
}
