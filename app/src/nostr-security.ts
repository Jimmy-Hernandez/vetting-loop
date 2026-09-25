import { getEventHash, verifyEvent } from 'nostr-tools/pure';
import type { Event } from 'nostr-tools/pure';

export const RECORD_KIND = 30378;
export const RECORD_ADDRESS = 'vetta:episode:aug2024';
export const MAX_EVENT_BYTES = 1_000_000;
export interface FallbackFlag { legal_status: string; claim: string; publisher: string; date: string; url: string; quote: string }
export interface FallbackNominee { slug: string; name: string; portfolio: string; status: string; flags: FallbackFlag[]; positiveCount: number; eventId: string }
export interface FallbackEpisode { title: string; date: string; summary: string; nominees: FallbackNominee[]; trail: string | null; trailEventId: string | null }
export interface ApprovedPayload {
  schema: 'vetta.fallback'; version: 1;
  approval: { status: 'approved'; registerSha256: string; reviewedAt: string };
  episode: Omit<FallbackEpisode, 'trailEventId' | 'nominees'> & { nominees: Omit<FallbackNominee, 'eventId'>[] };
}
const hex64 = /^[a-f0-9]{64}$/;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max = 20000): v is string => typeof v === 'string' && v.length <= max;
const date = (v: unknown): v is string => text(v, 40) && Number.isFinite(Date.parse(v));
const statuses = ['convicted', 'charged', 'case_filed', 'self_admitted', 'accused_reported', 'official_clearance', 'no_action_recorded'];
function flag(v: unknown): boolean {
  return object(v) && text(v.legal_status) && statuses.includes(v.legal_status) && text(v.claim) && text(v.publisher, 300) && date(v.date) && text(v.quote) && text(v.url, 2000) && /^https?:\/\/[^/]+\/.+/.test(v.url);
}
function payload(v: unknown, now: number): v is ApprovedPayload {
  if (!object(v) || v.schema !== 'vetta.fallback' || v.version !== 1 || !object(v.approval) || v.approval.status !== 'approved' || typeof v.approval.registerSha256 !== 'string' || !hex64.test(v.approval.registerSha256) || !date(v.approval.reviewedAt) || Date.parse(v.approval.reviewedAt) > (now + 300) * 1000 || !object(v.episode)) return false;
  const e = v.episode;
  if (!text(e.title, 500) || !date(e.date) || !text(e.summary) || !(e.trail === null || text(e.trail)) || !Array.isArray(e.nominees) || e.nominees.length > 200) return false;
  const slugs = new Set();
  for (const n of e.nominees) {
    if (!object(n) || !text(n.slug, 100) || !/^[a-z0-9-]+$/.test(n.slug) || slugs.has(n.slug) || !text(n.name, 200) || !text(n.portfolio, 500) || !text(n.status, 100) || !Array.isArray(n.flags) || n.flags.length > 100 || !n.flags.every(flag) || !Number.isSafeInteger(n.positiveCount) || (n.positiveCount as number) < 0) return false;
    slugs.add(n.slug);
  }
  return true;
}
/** Never rely on nostr-tools' mutable verified-event cache: reconstruct the wire event. */
export function validateRecord(input: unknown, pinnedPubkey: string, now = Math.floor(Date.now() / 1000)): { event: Event; payload: ApprovedPayload } | null {
  try {
    if (!hex64.test(pinnedPubkey) || !object(input) || input.pubkey !== pinnedPubkey || input.kind !== RECORD_KIND || typeof input.id !== 'string' || !hex64.test(input.id) || typeof input.sig !== 'string' || !/^[a-f0-9]{128}$/.test(input.sig) || !Number.isSafeInteger(input.created_at) || (input.created_at as number) < 0 || (input.created_at as number) > now + 300 || !text(input.content, MAX_EVENT_BYTES) || !Array.isArray(input.tags) || input.tags.length > 100) return null;
    if (!input.tags.every(t => Array.isArray(t) && t.length <= 10 && t.every(s => text(s, 2000)))) return null;
    const tags = input.tags as string[][];
    const addresses = tags.filter(t => t[0] === 'd');
    if (addresses.length !== 1 || addresses[0].length !== 2 || addresses[0][1] !== RECORD_ADDRESS) return null;
    const event: Event = { id: input.id, pubkey: pinnedPubkey, kind: RECORD_KIND, created_at: input.created_at as number, content: input.content, tags: tags.map(t => [...t]), sig: input.sig };
    if (new TextEncoder().encode(JSON.stringify(event)).length > MAX_EVENT_BYTES || getEventHash(event) !== event.id || !verifyEvent(event)) return null;
    const content: unknown = JSON.parse(event.content);
    return payload(content, now) ? { event, payload: content } : null;
  } catch { return null; }
}
export function selectRecord(events: unknown[], pubkey: string, now?: number) {
  return events.map(e => validateRecord(e, pubkey, now)).filter(e => e !== null).sort((a, b) => b.event.created_at - a.event.created_at || a.event.id.localeCompare(b.event.id))[0] ?? null;
}
