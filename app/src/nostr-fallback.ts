import publisher from './publisher-config.json';
import { MAX_EVENT_BYTES, RECORD_ADDRESS, RECORD_KIND, selectRecord, validateRecord } from './nostr-security';
import type { FallbackEpisode } from './nostr-security';
export type { FallbackEpisode, FallbackFlag, FallbackNominee } from './nostr-security';
export type { Event as NostrEvent } from 'nostr-tools/pure';
export const DEFAULT_RELAYS: string[] = publisher.relays;
export const EPISODE_TAG = RECORD_ADDRESS;
export interface FallbackSource { eventId: string; relay: string }
const empty = (): FallbackEpisode => ({ title: '', date: '', summary: '', nominees: [], trail: null, trailEventId: null });
export function parseEvents(events: unknown[], pinnedPubkey = publisher.pubkey): FallbackEpisode {
  const selected = selectRecord(events, pinnedPubkey);
  if (!selected) return empty();
  const { event, payload } = selected;
  return { ...payload.episode, nominees: payload.episode.nominees.map(n => ({ ...n, eventId: event.id })), trailEventId: payload.episode.trail ? event.id : null };
}
/** Relay selection never alters the bundled publisher trust anchor. */
export function fetchEpisodeFromNostr(relays = DEFAULT_RELAYS, tag = EPISODE_TAG, timeoutMs = 8000): Promise<{ episode: FallbackEpisode; sources: FallbackSource[] }> {
  if (!/^[a-f0-9]{64}$/.test(publisher.pubkey) || tag !== RECORD_ADDRESS) return Promise.resolve({ episode: empty(), sources: [] });
  return new Promise(resolve => {
    const records = new Map<string, { event: unknown; relay: string }>();
    const sockets = new Set<WebSocket>();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      for (const ws of sockets) close(ws);
      const selected = selectRecord([...records.values()].map(r => r.event), publisher.pubkey);
      resolve({ episode: parseEvents(selected ? [selected.event] : []), sources: selected ? [{ eventId: selected.event.id, relay: records.get(selected.event.id)!.relay }] : [] });
    };
    const close = (ws: WebSocket) => {
      ws.onmessage = ws.onopen = ws.onerror = ws.onclose = null;
      try { if (ws.readyState === 1) ws.send(JSON.stringify(['CLOSE', 'vetta-approved'])); ws.close(); } catch { /* already closed */ }
      sockets.delete(ws);
    };
    const done = (ws: WebSocket) => { close(ws); if (!sockets.size) finish(); };
    const timer = setTimeout(finish, Math.max(1, Math.min(timeoutMs, 30000)));
    for (const url of [...new Set(relays)].slice(0, 8)) {
      if (!/^wss:\/\//.test(url) && !/^ws:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(url)) continue;
      let ws: WebSocket;
      try { ws = new WebSocket(url); } catch { continue; }
      sockets.add(ws);
      ws.onopen = () => ws.send(JSON.stringify(['REQ', 'vetta-approved', { kinds: [RECORD_KIND], authors: [publisher.pubkey], '#d': [RECORD_ADDRESS], limit: 20 }]));
      ws.onmessage = m => {
        if (typeof m.data !== 'string' || m.data.length > MAX_EVENT_BYTES + 100) return;
        try {
          const msg = JSON.parse(m.data);
          if (!Array.isArray(msg) || msg[1] !== 'vetta-approved') return;
          if (msg[0] === 'EOSE' || msg[0] === 'CLOSED') { done(ws); return; }
          if (msg[0] === 'EVENT') {
            const valid = validateRecord(msg[2], publisher.pubkey);
            if (valid && records.size < 160) records.set(valid.event.id, { event: valid.event, relay: url });
          }
        } catch { /* Untrusted relay data is discarded. */ }
      };
      ws.onerror = ws.onclose = () => done(ws);
    }
    if (!sockets.size) finish();
  });
}
