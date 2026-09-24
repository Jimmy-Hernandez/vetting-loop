import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Episode } from '../types';
import { loadEpisode, placeholderEpisode, isPlaceholder, countsFor } from '../data';

export default function Nominees() {
  const [ep, setEp] = useState<Episode | null>(null);
  useEffect(() => { loadEpisode().then((e) => setEp(e ?? placeholderEpisode())); }, []);
  if (!ep) return <main className="doc" />;

  const nom = ep.nominees ?? [];
  const ph = isPlaceholder(ep);

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Act 1 · Before the vote</p>
        <h1>The Register of Nominees</h1>
        <p className="standfirst">
          {nom.length} nominees vetted for the Cabinet, {ep.date}. Every flag and every positive finding is
          sourced; empty sections are rendered as empty, never padded.
        </p>
        {ph && <p style={{ marginTop: 16 }}><span className="chip-placeholder">Placeholder data</span></p>}
        <div className="close" aria-hidden="true"></div>
      </header>

      {nom.length === 0 ? (
        <div className="empty">No nominee data has been published yet.</div>
      ) : (
        <div className="nomgrid">
          {nom.map((n) => {
            const c = countsFor(n);
            return (
              <Link key={n.id} to={`/nominee/${n.id}`} className={`nomcard${n.status === 'rejected' ? ' rejected' : ''}`}>
                <span className={`badge ${n.status}`}>{n.status}</span>
                <h3>{n.name}</h3>
                <p className="portfolio">{n.portfolio}</p>
                <div className="counts">
                  <span className="fl"><b>{c.flags}</b> flags</span>
                  <span><b>{c.positive}</b> positive</span>
                  <span><b>{c.memoranda}</b> memoranda</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}