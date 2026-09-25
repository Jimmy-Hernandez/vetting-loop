import ExtLink from '../ExtLink';
import { useEffect, useState } from 'react';
import type { DivisionsFile, Episode, HansardExcerpt } from '../types';
import { loadDivisions, loadEpisode, loadHansardExcerpts, placeholderDivisions } from '../data';
import Triptych from './Triptych';
import { Link } from 'react-router-dom';

export default function Vote() {
  const [d, setD] = useState<DivisionsFile | null>(null);
  const [ep, setEp] = useState<Episode | null>(null);
  const [hx, setHx] = useState<HansardExcerpt[] | null>(null);
  useEffect(() => {
    loadDivisions().then((x) => setD(x ?? placeholderDivisions()));
    loadEpisode().then((e) => setEp(e));
    loadHansardExcerpts().then((x) => setHx(x?.excerpts ?? null));
  }, []);
  if (!d) return <main className="doc" />;

  const v = d.vetting_vote;
  // Voice-vote motion is the anchor; recorded divisions list is data-driven.
  // Finance Bill 2024 contrast: first division whose title mentions Finance Bill 2024, else the first division.
  const fb = d.divisions?.find((x) => /finance bill 2024.*2nd reading/i.test(x.title) || /2nd reading.*finance bill 2024/i.test(x.title)) ?? d.divisions?.find((x) => /finance bill 2024/i.test(x.title)) ?? d.divisions?.[0];
  const total = fb ? fb.yes + fb.no : 0;
  const ph = v.mechanism !== 'voice_vote' || !v.hansard_line;
  const placeholder = /PLACEHOLDER/.test(v.motion_text);

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Act 3 · After — the accountability trail</p>
        <h1>The Vote That Wasn’t Recorded</h1>
        <p className="standfirst">
          {v.hansard_date}: nineteen Cabinet Secretaries approved by voice vote. Hansard’s complete record of
          the decision is a single line. Here is that line — and, by contrast, a division that was recorded.
        </p>
        {placeholder && <p style={{ marginTop: 16 }}><span className="chip-placeholder">Placeholder data</span></p>}
        <div className="close" aria-hidden="true"></div>
      </header>

      {/* ============ SIGNATURE TRIPTYCH: flag → question → outcome ============ */}
      <Triptych ep={ep} excerpts={hx} hansardDate={v.hansard_date} hansardLine={v.hansard_line} />

      <section className="sec" style={{ marginTop: 'var(--s8)' }}>
        <div className="sechead">
          <span className="no">§ 1 — The document</span>
          <h2>The motion, as it was actually moved</h2>
          <p className="dek">Text reproduced verbatim from Hansard, {v.hansard_date}.</p>
        </div>
        <div className="motion">
          <div className="mhead">
            <span className="tag">Motion</span>
            <span className="mover">Committee on Appointments · Second Report · {v.hansard_date}</span>
          </div>
          <div className="mbody">
            <blockquote className="motiontext">{v.motion_text}</blockquote>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="norecord">
          <blockquote>NO RECORDED VOTE — “{v.hansard_line}”</blockquote>
          <div className="nr-cap">
            mechanism: {v.mechanism} · recorded divisions on the approval: {v.recorded_votes?.length ?? 0} · {v.hansard_date}
          </div>
        </div>

        <p className="contrast-note measure">
          <strong>The contrast.</strong> The House does record divisions when it chooses to. Below: a real
          recorded division from the same session, with every Member’s vote captured per-MP — against the
          single line that carried nineteen Cabinet appointments.
        </p>

        {fb ? (
          <div className="divbar">
            <div className="db-head">
              <h4>{fb.title}</h4>
              <span className="db-date">{fb.date} · {fb.house}</span>
            </div>
            <div className="bar-track" role="img" aria-label={`${fb.yes} yes, ${fb.no} no`}>
              <div className="bar-fill" style={{ flex: fb.yes / (total || 1) }}>
                <span>AYE {fb.yes}</span>
              </div>
              <div className="bar-rest" style={{ flex: fb.no / (total || 1) }}>
                <span>NO {fb.no}</span>
              </div>
            </div>
            <p className="db-foot">
              Recorded per-MP.{' '}
              {fb.result_url && <ExtLink href={fb.result_url}>Division result</ExtLink>}
              {fb.per_mp_csv_url && <> · <ExtLink href={fb.per_mp_csv_url}>Per-MP CSV</ExtLink></>}
              {' '}· <ExtLink href="https://mzalendo.com/research-and-knowledge/voting-patterns/na/1/">Voting patterns</ExtLink>
            </p>
          </div>
        ) : (
          <div className="empty" style={{ maxWidth: 860, margin: '32px auto 0' }}>
            No recorded division data published yet.
          </div>
        )}
      </section>

      {ep?.gateGaps && ep.gateGaps.length > 0 && (
        <section className="sec">
          <div className="sechead">
            <span className="no">§ 3 — The gate itself</span>
            <h2>The gate has gaps</h2>
            <p className="dek">What the vetting gate catches — and what slips past it.</p>
          </div>
          <ol className="gaps">
            {ep.gateGaps.map((g, i) => (
              <li key={i}>
                <span className="num">{i + 1}</span>
                <div>
                  <h4>{g.title}</h4>
                  <p>{g.text}</p>
                  <span className="cite"><b>Source</b> {g.source}</span>
                  {g.needs_verification && <span className="src-chip unverified">needs verification</span>}
                </div>
              </li>
            ))}
          </ol>
        </section>
            )}

      {ph && (
        <section className="sec">
          <div className="sechead">
            <span className="no">§ 2 — The voice</span>
            <h2>What was said</h2>
          </div>
          <p className="prose" style={{ color: '#888', fontStyle: 'italic', fontSize: 14 }}>
            Hansard excerpt channel available at <code>/data/hansard-excerpts.json</code>.
          </p>
        </section>
      )}
          <section className="prior-cycle" style={{ margin: 'var(--s6) 0' }}>
        <p style={{ margin: 0 }}>
          This episode is one batch of <b>93 nominations across 10 vetting cycles</b> since 2022.{' '}
          <Link to="/ledger" style={{ textDecoration: 'underline' }}>View the full people ledger →</Link>
        </p>
      </section>
</main>
  );
}
