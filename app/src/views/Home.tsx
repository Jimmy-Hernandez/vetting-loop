import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Episode } from '../types';
import { loadEpisode, placeholderEpisode, isPlaceholder } from '../data';

export default function Home() {
  const [ep, setEp] = useState<Episode | null>(null);
  useEffect(() => { loadEpisode().then((e) => setEp(e ?? placeholderEpisode())); }, []);
  if (!ep) return <main className="doc" />;

  const nom = ep.nominees ?? [];
  const approved = nom.filter((n) => n.status === 'approved').length;
  const rejected = nom.filter((n) => n.status === 'rejected').length;
  const ph = isPlaceholder(ep);

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Monitoring Register · Vetta · Act 3</p>
        <h1>{ep.title}</h1>
        <p className="standfirst">{ep.summary}</p>
        <div className="docmeta">
          <span>Record of proceedings</span><span className="dot">·</span>
          <span>{ep.date}</span><span className="dot">·</span>
          <span>Non-partisan</span>
        </div>
        {ph && <p style={{ marginTop: 16 }}><span className="chip-placeholder">Placeholder data</span></p>}
        <div className="close" aria-hidden="true"></div>
      </header>

      <figure className="hansard" style={{ margin: 0 }}>
        <div className="volline">Republic of Kenya · National Assembly · {ep.date}</div>
        <blockquote>“(Question put and agreed&nbsp;to)”</blockquote>
        <div className="thin-rule" aria-hidden="true"></div>
        <figcaption className="source">National Assembly Debates, {ep.date}</figcaption>
      </figure>

      <div className="gloss measure">
        <p>
          <strong>Nineteen Cabinet Secretaries approved by voice vote.</strong> No division was called — no
          Member’s name was ever recorded on any approval. This register reproduces what does exist, and marks
          plainly what does not.
        </p>
      </div>

      <div className="outcome" role="list" aria-label="Outcome of the 7 August 2024 motion">
        <div className="cell" role="listitem"><div className="fig">{approved}</div><div className="cap">Approved as CS</div></div>
        <div className="cell" role="listitem"><div className="fig neg">{rejected}</div><div className="cap">Rejected</div></div>
        <div className="cell" role="listitem"><div className="fig neg">No division</div><div className="cap">Passed by voice vote</div></div>
      </div>

      <section className="sec">
        <div className="sechead">
          <span className="no">The loop</span>
          <h2>Three acts, one paper trail</h2>
          <p className="dek">Before the hearing, during the sitting, after the vote. Follow the documents.</p>
        </div>
        <div className="acts-grid">
          <Link className="card" to="/nominees">
            <span className="act-no">Act 1 · Before</span>
            <h3>The nominees</h3>
            <p>Every nominee’s record: flags, positive findings, agency clearances — all sourced.</p>
            <span className="go">Open the register →</span>
          </Link>
          <Link className="card" to="/vote">
            <span className="act-no">Act 2 · During</span>
            <h3>The vote</h3>
            <p>The motion, the missing division, and what a recorded vote looks like by contrast.</p>
            <span className="go">Open the vote record →</span>
          </Link>
          <Link className="card" to="/nominees">
            <span className="act-no">Act 3 · After</span>
            <h3>The record</h3>
            <p>The accountability trail: what the documents say, and where they go silent.</p>
            <span className="go">Trace a nominee →</span>
          </Link>
        </div>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="no">By the numbers</span>
          <h2>Key figures from the data</h2>
        </div>
        <div className="outcome" style={{ marginTop: 0 }}>
          <div className="cell"><div className="fig">{nom.length}</div><div className="cap">Nominees vetted</div></div>
          <div className="cell"><div className="fig">{nom.reduce((a, n) => a + (n.flags?.length ?? 0), 0)}</div><div className="cap">Sourced flags</div></div>
          <div className="cell"><div className="fig">{nom.reduce((a, n) => a + (n.positiveFindings?.length ?? 0), 0)}</div><div className="cap">Positive findings</div></div>
        </div>
      </section>
    </main>
  );
}