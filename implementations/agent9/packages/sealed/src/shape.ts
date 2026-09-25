/**
 * Sealed box wire format and a dependency-free shape check, importable from
 * Workers without pulling in DOM crypto typings.
 */
export type SealedBox = {
  v: 1;
  /** Ephemeral public key, raw uncompressed P-256 point, base64url. */
  epk: string;
  /** AES-GCM nonce, base64url. */
  iv: string;
  /** Ciphertext with GCM tag, base64url. */
  ct: string;
};

/** Shape check for untrusted input at the server boundary. */
export function isSealedBox(x: unknown): x is SealedBox {
  if (!x || typeof x !== "object") return false;
  const b = x as Record<string, unknown>;
  const b64u = /^[A-Za-z0-9_-]+$/;
  return (
    b.v === 1 &&
    typeof b.epk === "string" && b.epk.length === 87 && b64u.test(b.epk) &&
    typeof b.iv === "string" && b.iv.length === 16 && b64u.test(b.iv) &&
    typeof b.ct === "string" && b.ct.length > 22 && b.ct.length <= 16_500 && b64u.test(b.ct) &&
    Object.keys(b).length === 4
  );
}
