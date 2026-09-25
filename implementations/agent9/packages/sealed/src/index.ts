/**
 * Sealed-box encryption for anonymous tips.
 *
 * The browser encrypts to the reviewers' public key before anything leaves
 * the device. The server stores ciphertext it cannot read. Only a holder of
 * the reviewer private key, kept offline, can open a tip.
 *
 *   ephemeral ECDH P-256  →  HKDF-SHA256 (salt = epk, info = SEALED_INFO)
 *   →  AES-256-GCM (additional data = SEALED_INFO)
 *
 * WebCrypto only: identical code runs in browsers, Workers and Node 20+.
 */

import type { SealedBox } from "./shape";

export type { SealedBox } from "./shape";

export const SEALED_INFO = "vetting-loop/tip/v1";
export const MAX_PLAINTEXT_BYTES = 12_000;

const subtle = () => crypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();
const ECDH = { name: "ECDH", namedCurve: "P-256" } as const;

export function toB64u(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromB64u(text: string): Uint8Array<ArrayBuffer> {
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4));
  const out = new Uint8Array(new ArrayBuffer(s.length));
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function deriveKey(privateKey: CryptoKey, publicKey: CryptoKey, salt: Uint8Array<ArrayBuffer>, usage: "encrypt" | "decrypt"): Promise<CryptoKey> {
  const shared = await subtle().deriveBits({ name: "ECDH", public: publicKey }, privateKey, 256);
  const hkdf = await subtle().importKey("raw", shared, "HKDF", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: enc.encode(SEALED_INFO) },
    hkdf,
    { name: "AES-GCM", length: 256 },
    false,
    [usage],
  );
}

export async function importRecipientKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return subtle().importKey("jwk", { ...jwk, key_ops: [] }, ECDH, false, []);
}

/** Encrypt a UTF-8 message to the recipient's public key. */
export async function seal(message: string, recipient: JsonWebKey): Promise<SealedBox> {
  const plain = enc.encode(message);
  if (plain.byteLength > MAX_PLAINTEXT_BYTES) throw new Error(`Message exceeds ${MAX_PLAINTEXT_BYTES} bytes`);
  const pub = await importRecipientKey(recipient);
  const eph = (await subtle().generateKey(ECDH, true, ["deriveBits"])) as CryptoKeyPair;
  const epk = new Uint8Array(await subtle().exportKey("raw", eph.publicKey));
  const key = await deriveKey(eph.privateKey, pub, epk, "encrypt");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle().encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(SEALED_INFO) }, key, plain);
  return { v: 1, epk: toB64u(epk), iv: toB64u(iv), ct: toB64u(ct) };
}

/** Decrypt with the reviewer private key. Throws if the box was altered. */
export async function open(box: SealedBox, recipientPrivate: JsonWebKey): Promise<string> {
  const priv = await subtle().importKey("jwk", recipientPrivate, ECDH, false, ["deriveBits"]);
  const epkBytes = fromB64u(box.epk);
  const epk = await subtle().importKey("raw", epkBytes, ECDH, false, []);
  const key = await deriveKey(priv, epk, epkBytes, "decrypt");
  const plain = await subtle().decrypt(
    { name: "AES-GCM", iv: fromB64u(box.iv), additionalData: enc.encode(SEALED_INFO) },
    key,
    fromB64u(box.ct),
  );
  return dec.decode(plain);
}

export async function generateRecipientKeys(): Promise<{ publicJwk: JsonWebKey; privateJwk: JsonWebKey }> {
  const pair = (await subtle().generateKey(ECDH, true, ["deriveBits"])) as CryptoKeyPair;
  const publicJwk = await subtle().exportKey("jwk", pair.publicKey);
  const privateJwk = await subtle().exportKey("jwk", pair.privateKey);
  return { publicJwk: { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x, y: publicJwk.y }, privateJwk };
}

/** Short fingerprint a reader can compare out of band: sha256(x||y), grouped. */
export async function fingerprint(jwk: JsonWebKey): Promise<string> {
  const digest = new Uint8Array(await subtle().digest("SHA-256", enc.encode(`${jwk.x}.${jwk.y}`)));
  const hex = [...digest.slice(0, 10)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return hex.match(/.{4}/g)!.join(" ");
}

export { isSealedBox } from "./shape";
