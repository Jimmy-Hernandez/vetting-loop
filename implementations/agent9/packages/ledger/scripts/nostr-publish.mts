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
