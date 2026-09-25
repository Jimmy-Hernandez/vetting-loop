import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  NOSTR_ENABLED,
  fetchEpisodeFromNostr,
  DEFAULT_RELAYS,
  type FallbackEpisode,
  type FallbackSource,
} from '../nostr-fallback';

const RELAYS_KEY = 'vetting-nostr-relays';

function getRelays(): string[] {
  try {
    const q = new URLSearchParams(window.location.search).get('relays');
    if (q) return q.split(',').map((s) => s.trim()).filter(Boolean);
    const stored = localStorage.getItem(RELAYS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* defaults */ }
  return DEFAULT_RELAYS;
}

export default function NostrFallback() {
  const [episode, setEpisode] = useState<FallbackEpisode | null>(null);
  const [sources, setSources] = useState<FallbackSource[]>([]);
  const [status, setStatus] = useState('Connecting to relays…');
  const [relays] = useState<string[]>(getRelays());

  useEffect(() => {
    if (!NOSTR_ENABLED) return;   // disabled: never open a socket to a relay
    let cancelled = false;
    fetchEpisodeFromNostr(relays).then(({ episode, sources }) => {
      if (cancelled) return;
      setEpisode(episode);
      setSources(sources);
      setStatus(
        episode.nominees.length > 0
          ? `Received ${episode.nominees.length} nominee dossiers from ${sources.length} events.`
          : 'No events received. Relays are unreachable or record not yet published.',
      );
    });
    return () => { cancelled = true; };
  }, [relays]);

  const sampleSource = sources[0];

  // DISABLED STATE — 2026-09-25. Publishing and reading are paused pending a
  // data due-diligence pass. We say so plainly rather than faking an outage.
  if (!NOSTR_ENABLED) {
    return (
      <main className="doc">
        <div className="banner" role="status" style={{
          border: '1px solid var(--line)', padding: 'var(--s4)', margin: 'var(--s6) 0',
        }}>
          Nostr publication is paused.
          <div style={{ marginTop: 'var(--s2)', fontSize: '0.85em', color: 'var(--ink-muted, #555)' }}>
            The team is completing a further due-diligence pass on the record before anything is
            published to public relays. No relay is being contacted, and no new events are being
            published. The signed-event layer is built, tested, and shipping with the app — it is
            switched off, not removed.
          </div>
        </div>
        <h1>The Vetting of the Cabinet — August 2024</h1>
        <p>
          The record is available in the app itself. This route exists for the integrity layer
          that keeps the record independently verifiable; it will be switched on once the review
          is complete.
        </p>
        <p style={{ fontSize: '0.9em' }}>
          Read the <Link to="/methodology">methodology</Link> for how the record is sourced, and{' '}
          <Link to="/vote">the vote record</Link> for what the absence of a division means here.
        </p>
      </main>
    );
  }

  return (
    <main className="doc">
      <div className="banner" role="status" style={{
        border: '1px solid var(--line)', padding: 'var(--s4)', margin: 'var(--s6) 0',
      }}>
        Primary server unreachable. Reading the record from the Nostr network.
        <div style={{ marginTop: 'var(--s2)', fontSize: '0.85em', color: 'var(--ink-muted, #555)' }}>
          Relays: {relays.join(' · ')}
        </div>
      </div>

      <h1>{episode?.title || 'The Vetting of the Cabinet, August 2024'}</h1>
      <p>{episode?.summary || 'Loading the record from Nostr…'}</p>
      <p style={{ fontSize: '0.9em' }}>{status}</p>

      <h2>Nominees</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(episode?.nominees ?? []).map((n) => (
          <li key={n.slug} style={{ padding: 'var(--s3) 0', borderBottom: '1px solid var(--line)' }}>
            <strong>{n.name}</strong>
            <span style={{ marginLeft: 'var(--s3)' }}>{n.status}</span>
            <span style={{ marginLeft: 'var(--s3)' }}>
              {n.flags.length} flag{n.flags.length === 1 ? '' : 's'}
            </span>
            <span style={{ marginLeft: 'var(--s3)', color: 'var(--ink-muted, #555)' }}>
              details unavailable offline
            </span>
          </li>
        ))}
        {episode && episode.nominees.length === 0 && (
          <li>No nominee dossiers received.</li>
        )}
      </ul>

      {episode?.trail && (
        <>
          <h2>Accountability trail</h2>
          <blockquote style={{ whiteSpace: 'pre-wrap' }}>{episode.trail}</blockquote>
        </>
      )}

      <footer style={{ marginTop: 'var(--s8)', fontSize: '0.85em', color: 'var(--ink-muted, #555)' }}>
        {sampleSource
          ? `Fetched from Nostr event ${sampleSource.eventId} @ ${sampleSource.relay}`
          : 'No Nostr source yet.'}
        {' '}Links are disabled in offline mode. <Link to="/methodology">Methodology</Link> (cached routes only).
      </footer>
    </main>
  );
}
