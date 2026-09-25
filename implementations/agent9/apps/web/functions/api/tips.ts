/**
 * Tip line. Accepts a sealed box produced in the browser, stores it under a
 * random receipt, and returns the receipt. The function never sees plaintext
 * and never stores the sender's IP address.
 *
 * Rate limiting counts requests under sha256(ip + daily salt). The counter
 * key expires in 24 hours and is not stored alongside any tip.
 */
import { isSealedBox } from "@vetting-loop/sealed/shape";

interface Env {
  TIPS: KVNamespace;
  /** Secret salt for the daily rate-limit hash. Set with `wrangler pages secret put RL_SALT`. */
  RL_SALT?: string;
}

const MAX_BODY = 20_000;
const PER_DAY = 8;
const TTL = 180 * 24 * 3600;
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const RECEIPT = /^VR-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });

function receipt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
  return `VR-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

async function rateKey(request: Request, env: Env): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${env.RL_SALT ?? "unsalted"}|${day}|${ip}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  return `rl:${[...digest.slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) return json({ error: "Expected JSON." }, 415);
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY) return json({ error: "Tip is too large." }, 413);

  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: "Tip is too large." }, 413);
  let box: unknown;
  try {
    box = JSON.parse(text);
  } catch {
    return json({ error: "Malformed request." }, 400);
  }
  if (!isSealedBox(box)) return json({ error: "Only sealed tips are accepted." }, 400);

  const rk = await rateKey(request, env);
  const count = Number((await env.TIPS.get(rk)) ?? "0");
  if (count >= PER_DAY) return json({ error: "Daily limit reached from this network. Try again tomorrow." }, 429);
  await env.TIPS.put(rk, String(count + 1), { expirationTtl: 86_400 });

  const id = receipt();
  const month = new Date().toISOString().slice(0, 7);
  await env.TIPS.put(`tip:${id}`, JSON.stringify({ ...box, month, status: "received" }), { expirationTtl: TTL });
  return json({ receipt: id }, 201);
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const id = new URL(request.url).searchParams.get("receipt") ?? "";
  if (!RECEIPT.test(id)) return json({ error: "Unknown receipt." }, 404);
  const raw = await env.TIPS.get(`tip:${id}`);
  if (!raw) return json({ error: "Unknown receipt." }, 404);
  const { status } = JSON.parse(raw) as { status: string };
  return json({ status });
};
