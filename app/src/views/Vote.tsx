import { useEffect, useState } from 'react';
import type { DivisionsFile, Episode, Flag, HansardExcerpt } from '../types';
import { loadDivisions, loadEpisode, loadHansardExcerpts, placeholderDivisions } from '../data';

// HERO TRIPTYCH — data-thin selection helpers (no hard-coded content).
// Card 1 flag: the strongest sourced flag = the EACC-relevant one (publisher/claim mention EACC), else flags[0].
function pickFlag(flags: Flag[] | null | undefined): Flag | null {
  if (!flags || flags.length === 0) return null;
  return flags.find((f) => /eacc|ethics and anti-corruption/i.test(`${f.claim} ${f.publisher} ${f.quote}`)) ?? flags[0];
}
// Card 2 excerpt: the voice-vote record, verbatim from the excerpt channel.
function pickVoteExcerpt(excerpts: HansardExcerpt[] | null | undefined): { ex: HansardExcerpt; line: string } | null {
  if (!excerpts || excerpts.length === 0) return null;
  for (const ex of excerpts) {
    const m = ex.text.match(/\(Question put and agreed to\)/);
    if (m) return { ex, line: m[0] };
  }
  return null;
}

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
  const fb = d.divisions?.find((x) => /finance bill 2024/i.test(x.title)) ?? d.divisions?.[0];
  const total = fb ? fb.yes + fb.no : 0;
  const ph = v.mechanism !== 'voice_vote' || !v.hansard_line;
  const placeholder = /PLACEHOLDER/.test(v.motion_text);

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Act 2 · During the sitting</p>
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
              {fb.result_url && <a href={fb.result_url}>Division result</a>}
              {fb.per_mp_csv_url && <> · <a href={fb.per_mp_csv_url}>Per-MP CSV</a></>}
              {' '}· <a href="https://mzalendo.com/research-and-knowledge/voting-patterns/na/1/">Voting patterns</a>
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
    </main>
  );
}

// ============ the signature moment: flag → question → outcome ============
function Triptych({
  ep,
  excerpts,
  hansardDate,
  hansardLine,
}: {
  ep: Episode | null;
  excerpts: HansardExcerpt[] | null;
  hansardDate: string;
  hansardLine: string;
}) {
  const op = ep?.nominees.find((n) => /oparanya/i.test(n.name)) ?? null;
  const flag = op ? pickFlag(op.flags) : null;
  const vote = pickVoteExcerpt(excerpts);
  const voteUrl = vote?.ex.url || '';

  return (
    <section className="tri" aria-label="Juxtaposition: flag, question, outcome — the approval record">
      <div className="tri-connect" aria-hidden="true">
        <div className="tnode"><span className="num">1</span><span className="tlabel">The Flag</span><span className="tline"></span></div>
        <div className="tnode"><span className="num">2</span><span className="tlabel">The Question in Parliament</span><span className="tline"></span></div>
        <div className="tnode"><span className="num">3</span><span className="tlabel">The Outcome</span><span className="tline"></span></div>
      </div>

      <div className="tri-grid">
        {/* CARD 1 — THE FLAG */}
        <article className="tcard c-flag">
          <div className="thead">
            <div className="t-kick">{op ? `Nominee file · ${op.reportPageRef || 'the record'}` : 'Nominee file'}</div>
            <h2>The Flag</h2>
          </div>
          <div className="tbody">
            {op && flag ? (
              <>
                <div>
                  <div className="dossier-name">{op.name.replace(/ \(OCR:.*\)/, '')}</div>
                  <div className="dossier-role">Nominee — {op.portfolio.replace(/^Cabinet Secretary for /, '')}</div>
                </div>
                <div className="chips">
                  <span className="chip chip-self">Sourced flag</span>
                  {op.party && <span className="chip chip-neutral">{op.party}</span>}
                </div>
                <blockquote className="flag-q"><p>{flag.quote}</p></blockquote>
                <p className="flag-claim">{flag.claim}</p>
                <p className="flag-status">
                  <b>Legal status</b> — {flag.legal_status}
                </p>
              </>
            ) : (
              <div className="empty">No sourced flag available — nothing is asserted here.</div>
            )}
          </div>
          {flag && (
            <div className="tfoot">
              <p className="src">
                Source: {flag.publisher}, {flag.date} —{' '}
                <a href={flag.url} target="_blank" rel="noreferrer">{flag.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 64)}…</a>
              </p>
            </div>
          )}
        </article>

        {/* CARD 2 — THE QUESTION IN PARLIAMENT */}
        <article className="tcard c-q">
          <div className="thead">
            <div className="t-kick">Hansard · National Assembly · {hansardDate}</div>
            <h2>The Question in Parliament</h2>
          </div>
          <div className="tbody">
            {vote ? (
              <>
                <div className="hansard">
                  <p className="vote-line">
                    <span className="speaker">{vote.ex.speaker} · putting the Question</span>
                    {vote.line}
                  </p>
                </div>
                <div className="empty-line">
                  <span><span className="dash">—</span>&nbsp; no member raised this on the floor · no recorded vote exists &nbsp;<span className="dash">—</span></span>
                </div>
              </>
            ) : (
              <div className="empty">Hansard excerpt channel unavailable — nothing is asserted here.</div>
            )}
          </div>
          {vote && (
            <div className="tfoot">
              <p className="src">
                Source: National Assembly Official Report (Hansard), {hansardDate} —{' '}
                <a href={voteUrl} target="_blank" rel="noreferrer">mzalendo.com/…/hansard/wednesday-7th-august-2024-afternoon-sitting</a>
              </p>
            </div>
          )}
        </article>

        {/* CARD 3 — THE OUTCOME */}
        <article className="tcard c-out">
          <div className="thead">
            <div className="t-kick">House decision · {hansardDate}</div>
            <h2>The Outcome</h2>
          </div>
          <div className="tbody">
            <div>
              <div className="verdict-word">{op?.status === 'rejected' ? 'NOT APPROVED' : 'APPROVED'}</div>
              <p className="verdict-sub">{op ? op.portfolio.replace(/^Cabinet Secretary for /, '') : 'Cabinet appointment'}</p>
            </div>
            <ul className="verdict-facts">
              <li><b>Margin:</b> voice vote — “{hansardLine || '(Question put and agreed to)'}”</li>
              <li><b>Recorded votes:</b> none exist for any of the 19 approvals</li>
            </ul>
            <div className="querybox">
              <div className="q">Query — “How did my MP vote on this nominee?”</div>
              <div className="a">No recorded vote<small>The record cannot answer “who approved?”</small></div>
            </div>
          </div>
          <div className="tfoot">
            <p className="src">Sources: Hansard, {hansardDate} (as card 2) · Committee on Appointments Second Report, Aug 2024</p>
          </div>
        </article>
      </div>

      <div className="tri-caption">
        <span className="qmark">¶</span>
        <p>
          The flag. The one-line record of debate. The green light — in that order.{' '}
          <span className="thin">Nothing here is editorial: the juxtaposition is the argument, and each card stands on its own sourced record.</span>
        </p>
      </div>
    </section>
  );
}