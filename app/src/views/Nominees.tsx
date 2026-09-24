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
          {(() => {
              const approved = nom.filter((x) => x.status === 'approved');
              const csRet = approved.filter((x) => x.priorRole?.priorRoleType === 'cs_returnee').length;
              const rotated = approved.filter((x) => x.priorRole?.docket_rotated).length;
              return <> · <b>{csRet} of {approved.length} approvals had served in the 2022 cabinet ({rotated} rotated dockets)</b>.</>;
            })()}
        </p>
        {ph && <p style={{ marginTop: 16 }}><span className="chip-placeholder">Placeholder data</span></p>}
        <div className="close" aria-hidden="true"></div>
              {ep.priorCycles?.cabinet_2022 && (() => {
          const pc = ep.priorCycles.cabinet_2022;
          const rets = pc.nominees.filter((x) => x.returned_in_2024);
          return (
            <section className="prior-cycle" style={{ marginTop: 'var(--s4)' }}>
              <p style={{ margin: 0 }}>
                <b>Context.</b> The original cabinet nominated {pc.nominated} — {pc.nominees.length} CS
                nominees{pc.sameAnnouncementOffices?.length ? ` plus ${pc.sameAnnouncementOffices.length} offices announced the same day` : ''} —
                was {' '}vetted and {pc.outcome.toLowerCase()}. Of these, <b>{rets.length}</b> reappear
                among the {nom.filter((x) => x.status === 'approved').length} approvals vetted {ep.date}.
                {pc.needs_verification && <span className="chip">verify vs Kenya Gazette</span>}
              </p>
            </section>
          );
        })()}
      </header>

      {nom.length === 0 ? (
        <div className="empty">No nominee data has been published yet.</div>
      ) : (
        <div className="nomgrid">
          {nom.map((n) => {
            const c = countsFor(n);
            return (
              <Link key={n.id} to={`/nominee/${n.slug || n.id}`} className={`nomcard${n.status === 'rejected' ? ' rejected' : ''}`}>
                <span className={`badge ${n.status}`}>{n.status}</span>
                {n.priorRole?.prior_role && <span className="badge prior">Returned from 2022 Cabinet</span>}
                <h3>{n.name}</h3>
                <p className="portfolio">{n.portfolio}</p>
                <div className="counts">
                  <span className="fl"><b>{c.flags}</b> flags</span>
                  <span><b>{c.positive}</b> positive</span>
                  <span><b>{c.memoranda}</b> memoranda</span>
                  {n.subsequentEvents?.length ? <span className="ev-dot" title="Has post-vote events" aria-label="Has post-vote events"></span> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}