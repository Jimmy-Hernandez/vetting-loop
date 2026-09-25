import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
import type { Person } from "./types";

/**
 * Canonical JSON: object keys sorted, no whitespace, undefined dropped.
 * Two parties holding the same record always produce the same bytes, so a
 * mirror (Nostr relay, IPFS, a USB stick) can be checked against the hash
 * published here.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v === undefined ? null : v)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

export const sha256Hex = (text: string): string => bytesToHex(sha256(utf8ToBytes(text)));

export function recordHash(p: Person): string {
  return sha256Hex(canonicalJson(p));
}

export type Manifest = {
  schema: "ke-vetting-ledger/1";
  compiled: string;
  records: number;
  /** sha256 over the sorted "slug:hash" lines. Changes if any record changes. */
  root: string;
  hashes: Record<string, string>;
};

export function buildManifest(people: Person[], compiled: string): Manifest {
  const hashes: Record<string, string> = {};
  for (const p of [...people].sort((a, b) => a.slug.localeCompare(b.slug))) hashes[p.slug] = recordHash(p);
  const root = sha256Hex(
    Object.entries(hashes)
      .map(([slug, h]) => `${slug}:${h}`)
      .join("\n"),
  );
  return { schema: "ke-vetting-ledger/1", compiled, records: people.length, root, hashes };
}
