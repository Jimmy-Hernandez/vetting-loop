import { describe, expect, it } from "vitest";
import { MAX_PLAINTEXT_BYTES, fingerprint, fromB64u, generateRecipientKeys, isSealedBox, open, seal, toB64u } from "../src";

describe("sealed box", () => {
  it("round-trips a message, including non-ASCII text", async () => {
    const { publicJwk, privateJwk } = await generateRecipientKeys();
    const msg = "Uteuzi: tender ya barabara — KES 1.2bn, 2023 ✓";
    const box = await seal(msg, publicJwk);
    expect(isSealedBox(box)).toBe(true);
    expect(await open(box, privateJwk)).toBe(msg);
  });

  it("uses a fresh ephemeral key and nonce every time", async () => {
    const { publicJwk } = await generateRecipientKeys();
    const [a, b] = await Promise.all([seal("same", publicJwk), seal("same", publicJwk)]);
    expect(a.epk).not.toBe(b.epk);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it("cannot be opened with a different private key", async () => {
    const r1 = await generateRecipientKeys();
    const r2 = await generateRecipientKeys();
    const box = await seal("for r1 only", r1.publicJwk);
    await expect(open(box, r2.privateJwk)).rejects.toThrow();
  });

  it("detects tampering with the ciphertext", async () => {
    const { publicJwk, privateJwk } = await generateRecipientKeys();
    const box = await seal("integrity", publicJwk);
    const ct = fromB64u(box.ct);
    ct[0] ^= 1;
    await expect(open({ ...box, ct: toB64u(ct) }, privateJwk)).rejects.toThrow();
  });

  it("rejects oversize input before encrypting", async () => {
    const { publicJwk } = await generateRecipientKeys();
    await expect(seal("x".repeat(MAX_PLAINTEXT_BYTES + 1), publicJwk)).rejects.toThrow(/exceeds/);
  });

  it("validates untrusted shapes strictly", async () => {
    const { publicJwk } = await generateRecipientKeys();
    const box = await seal("ok", publicJwk);
    expect(isSealedBox({ ...box, extra: 1 })).toBe(false);
    expect(isSealedBox({ ...box, v: 2 })).toBe(false);
    expect(isSealedBox({ ...box, ct: "<script>" })).toBe(false);
    expect(isSealedBox(null)).toBe(false);
  });

  it("produces a stable, readable fingerprint", async () => {
    const { publicJwk } = await generateRecipientKeys();
    const fp = await fingerprint(publicJwk);
    expect(fp).toMatch(/^([0-9A-F]{4} ){4}[0-9A-F]{4}$/);
    expect(await fingerprint(publicJwk)).toBe(fp);
  });
});
