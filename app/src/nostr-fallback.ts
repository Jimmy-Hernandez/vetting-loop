// nostr-fallback.ts - crash-demo fallback reader.
// READ-ONLY network code: subscribes to relays by tag, parses kind-1 notes into
// episode/nominee/trail payloads for the /fallback view. Never publishes.
//
// Notes are text-only kind-1 events tagged 'vetting-loop-aug2024'. The summary
// note contains the episode title/date/summary; per-nominee notes carry a
// 'nominee-<slug>' t tag and parse into { name, portfolio, status, flags,
// positiveFindings }; the accountability-trail note carries the voice-vote text.

// NOSTR LANE — DISABLED 2026-09-25 pending further due diligence on the record.
// The code ships with the build but is OFF unless VITE_NOSTR_ENABLED=1 is set at
// build time. When off: no relay is contacted and the offline route shows a paused
// state instead of the record. See DEMO-RUNBOOK.md §"Nostr status".
export const NOSTR_ENABLED = import.meta.env.VITE_NOSTR_ENABLED === '1';

export const DEFAULT_RELAYS = ['ws://127.0.0.1:7778', 'wss://relay.damus.io'];
export const EPISODE_TAG = 'vetting-loop-aug2024';

export interface FallbackFlag {
  legal_status: string;
  claim: string;
  publisher: string;
  date: string;
}
export interface FallbackNominee {
  slug: string;
  name: string;
  portfolio: string;
  status: string;
  flags: FallbackFlag[];
  positiveCount: number;
  eventId: string;
}
export interface FallbackEpisode {
  title: string;
  date: string;
  summary: string;
  nominees: FallbackNominee[];
  trail: string | null;
  trailEventId: string | null;
}
export interface FallbackSource {
  eventId: string;
  relay: string;
}

export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

function section(content: string, header: string): string[] {
  // Extract lines under "HEADER (n):" up to the next blank line/section.
  const re = new RegExp(`(?:^|\\n)${header}[^\\n]*:\\s*\\n([\\s\\S]*?)(?=\\n\\n|\\n[A-Z][A-Z ]+\\(|$)`);
  const m = content.match(re);
  if (!m) return [];
  return m[1].split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
}

const NAME_RE = /^NOMINEE: (.+)$/m;
const PORTFOLIO_RE = /^Portfolio: (.+)$/m;
const STATUS_RE = /^Status: (\S+)$/m;
const SLUG_RE = /^nominee-(.+)$/;

function parseNominee(ev: NostrEvent, slug: string): FallbackNominee | null {
  const name = ev.content.match(NAME_RE)?.[1] ?? 'Unknown nominee';
  const portfolio = ev.content.match(PORTFOLIO_RE)?.[1] ?? '';
  const status = ev.content.match(STATUS_RE)?.[1] ?? 'unknown';
  const flags: FallbackFlag[] = [];
  for (const line of section(ev.content, 'FLAGS')) {
    // "- [legal_status] claim (Publisher, date)"
    // section() already strips the leading "- ", so anchor on the bracket, not "- ["
    const m = line.match(/^\[(.+?)\] (.+) \(([^,]+), ([0-9-]+)\)$/);
    if (m) flags.push({ legal_status: m[1], claim: m[2], publisher: m[3], date: m[4] });
  }
  const positiveCount = section(ev.content, 'POSITIVE FINDINGS').length;
  return { slug, name, portfolio, status, flags, positiveCount, eventId: ev.id };
}

export function parseEvents(events: NostrEvent[]): FallbackEpisode {
  const sorted = [...events].sort((a, b) => a.created_at - b.created_at);
  let episode: FallbackEpisode = { title: '', date: '', summary: '', nominees: [], trail: null, trailEventId: null };
  for (const ev of sorted) {
    const slugTag = ev.tags.find((tg) => tg[0] === 't' && SLUG_RE.test(tg[1] ?? ''));
    if (slugTag) {
      const slug = (slugTag[1].match(SLUG_RE) as RegExpMatchArray)[1];
      const n = parseNominee(ev, slug);
      if (n) {
        const existing = episode.nominees.findIndex((x) => x.slug === slug);
        if (existing >= 0) episode.nominees[existing] = n;
        else episode.nominees.push(n);
      }
    } else if (ev.tags.some((tg) => tg[0] === 't' && tg[1] === 'vetting-accountability-trail')) {
      episode.trail = ev.content;
      episode.trailEventId = ev.id;
    } else {
      // summary note: title line, "(date)" in it, then summary paragraph
      const title = ev.content.match(/^(.+?) \(([0-9-]{10})\)$/m);
      if (title) {
        episode.title = title[1];
        episode.date = title[2];
        episode.summary = ev.content.split('\n\n')[1] ?? '';
      }
    }
  }
  episode.nominees.sort((a, b) => a.name.localeCompare(b.name));
  return episode;
}

// Subscribe to relays (read-only REQ) until timeout, resolve collected events.
export function fetchEpisodeFromNostr(
  relays: string[] = DEFAULT_RELAYS,
  tag: string = EPISODE_TAG,
  timeoutMs = 8000,
): Promise<{ episode: FallbackEpisode; sources: FallbackSource[] }> {
  return new Promise((resolve) => {
    const byId = new Map<string, { ev: NostrEvent; relay: string }>();
    let open = 0;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const sources: FallbackSource[] = [];
      const events: NostrEvent[] = [];
      for (const { ev, relay } of byId.values()) {
        events.push(ev);
        sources.push({ eventId: ev.id, relay });
      }
      resolve({ episode: parseEvents(events), sources });
    };
    const timer = setTimeout(finish, timeoutMs);

    const filter = JSON.stringify({ kinds: [1], '#t': [tag], limit: 500 });
    for (const url of relays) {
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        continue;
      }
      open++;
      ws.onopen = () => ws.send(JSON.stringify(['REQ', 'vetting-fallback', JSON.parse(filter)]));
      ws.onmessage = (m: MessageEvent) => {
        try {
          const msg = JSON.parse(m.data as string);
          if (msg[0] === 'EVENT' && msg[2]?.kind === 1) {
            byId.set(msg[2].id, { ev: msg[2], relay: url });
          }
        } catch { /* ignore malformed */ }
      };
      ws.onerror = () => { /* relay unavailable; others may answer */ };
      ws.onclose = () => { /* noop */ };
    }
    if (open === 0) { clearTimeout(timer); finish(); }
  });
}
