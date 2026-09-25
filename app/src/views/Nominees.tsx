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
            <section style={{ marginTop: 'var(--s4)' }}>
              <p className="standfirst" style={{ marginTop: 0 }}>
                <b>Context.</b> The cabinet nominated {pc.nominated} — {pc.nominees.length} CS nominees —
                was vetted and {pc.outcome.toLowerCase()}. {rets.length} of them reappear among the {' '}
                {nom.filter((x) => x.status === 'approved').length} approvals vetted {ep.date}.
                {pc.needs_verification && <span className="chip">verify vs Kenya Gazette</span>}
              </p>
              <h2 style={{ marginTop: 'var(--s6)', fontSize: '1.15rem' }}>The 2022 slate — 22 nominees, and what became of each</h2>
              <p className="standfirst" style={{ marginTop: 'var(--s2)' }}>
                The full original list, preserved as published. Each entry links to its dossier where
                the nominee returned in this episode's reconstitution.
              </p>
              <div className="nomgrid" style={{ marginTop: 'var(--s3)' }}>
                {pc.nominees.map((x) => {
                  const inner = (
                    <>
                      <strong>{x.name}</strong>
                      <span style={{ display: 'block', opacity: 0.75, marginTop: 2 }}>{x.portfolio}</span>
                      <span style={{ display: 'block', marginTop: 6 }}>
                        <span className={`badge approved`}>approved {x.approval_cycle ?? ''}</span>
                        {x.returned_in_2024
                          ? <span style={{ fontSize: '0.85em', marginLeft: 6 }}>↳ returned in the August 2024 reconstitution</span>
                          : <span style={{ fontSize: '0.85em', marginLeft: 6 }}>{x.fate}</span>}
                      </span>
                      {x.note && <span style={{ display: 'block', marginTop: 4, fontSize: '0.8em', opacity: 0.7 }}>{x.note}</span>}
                    </>
                  );
                  return x.returned_in_2024 ? (
                    <Link key={x.name} to={'/nominee/' + x.returned_in_2024} className="nomcard">{inner}</Link>
                  ) : (
                    <div key={x.name} className="nomcard" style={{ opacity: 0.82 }}>{inner}</div>
                  );
                })}
              </div>
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
            const memHeaderFound = !!(n.memoranda?.header_found);
            return (
              <Link key={n.id} to={`/nominee/${n.slug || n.id}`} className={`nomcard${n.status === 'rejected' ? ' rejected' : ''}`}>
                <span className={`badge ${n.status}`}>{n.status}</span>
                {n.priorRole?.prior_role && <span className="badge prior">Returned from 2022 Cabinet</span>}
                <h3>{n.name}</h3>
                <p className="portfolio">{n.portfolio}</p>
                <div className="counts">
                  <span className="fl" title={c.flags === 0 ? 'No documented flags in sources reviewed' : ''}><b>{c.flags}</b> flags</span>
                  <span title={c.positive === 0 ? 'No positive findings recorded' : ''}><b>{c.positive}</b> positive</span>
                  <span title={memHeaderFound ? undefined : 'No formal memoranda section in the committee report — inline narrative only'}>
                    <b>{memHeaderFound ? c.memoranda : '—'}</b> memoranda
                  </span>
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