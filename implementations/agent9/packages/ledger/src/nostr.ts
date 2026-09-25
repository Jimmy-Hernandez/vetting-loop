import { schnorr } from "@noble/curves/secp256k1";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { canonicalJson, recordHash, sha256Hex } from "./integrity-hash";
import type { Person } from "./types";

/**
 * Nostr export (NIP-01 events, NIP-78 kind 30078 addressable app data).
 *
 * Each ledger record becomes one addressable event keyed by its `d` tag, so
 * a corrected record REPLACES the old one on every relay instead of piling
 * up. The build emits unsigned templates only. Signing needs the publisher
 * key, which never enters the repository or the static site.
 */
export const LEDGER_KIND = 30078;
export const D_PREFIX = "ke-vetting-ledger";

export type EventTemplate = {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
};

export type NostrEvent = EventTemplate & { id: string; pubkey: string; sig: string };

export function toTemplate(p: Person, compiled: string): EventTemplate {
  const offices = [...new Set(p.appointments.map((a) => a.office))];
  return {
    kind: LEDGER_KIND,
    created_at: Math.floor(Date.parse(`${compiled}T00:00:00Z`) / 1000),
    tags: [
      ["d", `${D_PREFIX}:${p.slug}`],
      ["t", "kenya"],
      ["t", "vetting"],
      ...offices.map((o) => ["l", o, "ke.office"]),
      ["x", recordHash(p)],
      ["alt", `Kenya appointment ledger record: ${p.name}`],
    ],
    content: canonicalJson(p),
  };
}

/** NIP-01 event id: sha256 of [0, pubkey, created_at, kind, tags, content]. */
export function eventId(t: EventTemplate, pubkey: string): string {
  return sha256Hex(JSON.stringify([0, pubkey, t.created_at, t.kind, t.tags, t.content]));
}

export function publicKeyOf(secretKeyHex: string): string {
  return bytesToHex(schnorr.getPublicKey(hexToBytes(secretKeyHex)));
}

export function signEvent(t: EventTemplate, secretKeyHex: string): NostrEvent {
  const pubkey = publicKeyOf(secretKeyHex);
  const id = eventId(t, pubkey);
  const sig = bytesToHex(schnorr.sign(hexToBytes(id), hexToBytes(secretKeyHex)));
  return { ...t, id, pubkey, sig };
}

/** Verify id, signature, and that the content still matches its `x` hash. */
export function verifyEvent(e: NostrEvent): boolean {
  if (eventId(e, e.pubkey) !== e.id) return false;
  const x = e.tags.find((t) => t[0] === "x")?.[1];
  if (x && sha256Hex(e.content) !== x) return false;
  try {
    return schnorr.verify(hexToBytes(e.sig), hexToBytes(e.id), hexToBytes(e.pubkey));
  } catch {
    return false;
  }
}
