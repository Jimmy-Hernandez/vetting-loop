import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Episode } from '../types';
import { loadEpisode, placeholderEpisode } from '../data';

// Act 2 · During — the hearing record at batch scale.
// What citizens submitted (memoranda) vs what the committee asked (hearing record),
// aggregated across all 20 nominees. Per-person depth lives in each dossier.

export default function Hearings() {
  const [ep, setEp] = useState<Episode | null>(null);
  useEffect(() => { loadEpisode().then((e) => setEp(e ?? placeholderEpisode())); }, []);
  if (!ep) return <main className="doc" />;

  const nom = ep.nominees ?? [];
  const rows = nom.map((n) => {
    const hq = n.hearingQuestions ?? {};
    const asked = hq.asked?.length ?? 0;
    const ignored = hq.ignored?.length ?? 0;
    const mem = n.memoranda ?? {};
    return { n, asked, ignored, mem };
  });
  const totAsked = rows.reduce((a, r) => a + r.asked, 0);
  const totIgnored = rows.reduce((a, r) => a + r.ignored, 0);
  const totMem = rows.reduce((a, r) => a + (r.mem.count ?? 0), 0);
  const headers = rows.filter((r) => r.mem.header_found).length;

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Act 2 · During — the hearing record</p>
        <h1>What was asked — and what was submitted</h1>
        <p className="standfirst">
          The public had already submitted their memoranda before the sitting began — that record
          lives in <Link to="/nominees">Act 1, with the nominees they were filed against</Link>. This page is what
          the committee did with them in the room: what <b>{nom.length} nominees</b> were actually asked
          across four days at County Hall, and how each submission was handled — preserved
          verbatim from the Committee's own report, page-referenced.</p>
        <div className="close" aria-hidden="true"></div>
      </header>

      <section className="sec" style={{ marginTop: 'var(--s6)' }}>
        <div className="sechead">
          <span className="no">The batch record</span>
          <h2>Two channels, one hearing</h2>
        </div>
        <div className="outcome" role="list" aria-label="Batch hearing figures, computed from the report">
          <div className="cell" role="listitem">
            <div className="fig">{totAsked}</div>
            <div className="cap">questions the committee asked</div>
          </div>
          <div className="cell" role="listitem">
            <div className="fig">{totMem}</div>
            <div className="cap">memoranda observations ({headers}/20 formal)</div>
          </div>
          <div className="cell" role="listitem">
            <div className="fig">{totIgnored}</div>
            <div className="cap">citizen affidavit clauses preserved</div>
          </div>
        </div>
        <p className="standfirst" style={{ marginTop: 'var(--s4)' }}>
          The record of what was asked is full. The record of what the public submitted — and whether
          each submission was answered — is thinner, because the Committee's own report preserves it
          unevenly: 15 of 20 nominees have a formal memoranda section; for the rest the observations
          survive only as inline narrative. We render both honestly, per nominee below.
        </p>
      </section>

      <section className="sec" style={{ marginTop: 'var(--s6)' }}>
        <div className="sechead">
          <span className="no">Per nominee</span>
          <h2>The hearing record, nominee by nominee</h2>
        </div>
        <div className="led-table-wrap" style={{ marginTop: 'var(--s4)' }}>
        <table className="led-table">
          <thead>
            <tr>
              <th>Nominee</th>
              <th>Questions asked</th>
              <th>Affidavit clauses</th>
              <th>Memoranda record</th>
              <th>Dossier</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ n, asked, ignored, mem }) => (
              <tr key={n.id}>
                <td>
                  <div className="led-name">{n.name}</div>
                  <div className="led-role">{n.portfolio}</div>
                </td>
                <td style={{ fontWeight: 700 }}>{asked}</td>
                <td>{ignored}</td>
                <td>
                  {mem.header_found
                    ? <span>{mem.count} observation{mem.count === 1 ? '' : 's'} · report p.{mem.report_page}</span>
                    : <span style={{ opacity: 0.7 }}>inline narrative only — honest absence</span>}
                </td>
                <td><Link to={`/nominee/${n.slug || n.id}`}>Open dossier →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="standfirst" style={{ marginTop: 'var(--s4)' }}>
          Why the memoranda column matters: the Committee invited the public to submit objections before
          the hearings. Where its report preserves those submissions formally, you can read what citizens
          said and what the Committee observed. Where it does not, we say so — an honest gap is part of
          the record too.
        </p>
      </section>

      <section className="prior-cycle" style={{ margin: 'var(--s6) 0' }}>
        <p style={{ margin: 0 }}>
          Next: how the batch was decided —{' '}
          <Link to="/vote" style={{ textDecoration: 'underline' }}>Act 3 · The Vote That Wasn't Recorded →</Link>
        </p>
      </section>
    </main>
  );
}
