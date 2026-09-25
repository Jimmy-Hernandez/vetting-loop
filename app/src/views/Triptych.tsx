import type { Episode, Flag, HansardExcerpt } from '../types';

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

export default function Triptych({
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
                <a href={flag.url} target="_blank" rel="noopener noreferrer">{flag.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 64)}…</a>
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
                <div className="hansard-hero">
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
                <a href={voteUrl} target="_blank" rel="noopener noreferrer">mzalendo.com/…/hansard/wednesday-7th-august-2024-afternoon-sitting</a>
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
