/**
 * Reviewer tool: list and decrypt sealed tips from the Pages KV namespace.
 * Runs on a reviewer machine only. The private key never leaves it.
 *
 *   REVIEWER_KEY=~/.config/vetting-loop/reviewer-private.jwk npx tsx scripts/open-tips.mts
 *
 * Requires wrangler to be authenticated to the account that hosts the site.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { open, type SealedBox } from "../packages/sealed/src/index.ts";

const keyPath = (process.env.REVIEWER_KEY ?? "~/.config/vetting-loop/reviewer-private.jwk").replace(/^~/, homedir());
const privateJwk = JSON.parse(readFileSync(keyPath, "utf8")) as JsonWebKey;
const wrangler = (...args: string[]) =>
  execFileSync("wrangler", ["kv", "key", ...args, "--binding", "TIPS", "--remote"], { cwd: "apps/web", encoding: "utf8" });

const keys = (JSON.parse(wrangler("list", "--prefix", "tip:")) as Array<{ name: string }>).map((k) => k.name);
console.log(`${keys.length} sealed tip(s)\n`);
for (const key of keys) {
  const stored = JSON.parse(wrangler("get", key)) as SealedBox & { month: string; status: string };
  const { v, epk, iv, ct } = stored;
  try {
    const tip = JSON.parse(await open({ v, epk, iv, ct }, privateJwk));
    console.log(`── ${key.slice(4)} · ${stored.month} · ${stored.status}`);
    console.log(JSON.stringify(tip, null, 2), "\n");
  } catch {
    console.log(`── ${key.slice(4)} · could not be opened with this key\n`);
  }
}
