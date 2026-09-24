import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Episode, HansardExcerpt } from '../types';
import { loadEpisode, loadHansardExcerpts, placeholderEpisode } from '../data';
import Triptych from './Triptych';

// /about — the tool's own page. Approved copy, verbatim (brief 2026-09-24).
// Static document register: same tokens, same .doc conventions as Methodology.
export default function About() {
  const [ep, setEp] = useState<Episode | null>(null);
  const [hx, setHx] = useState<HansardExcerpt[] | null>(null);
  useEffect(() => {
    loadEpisode().then((e) => setEp(e ?? placeholderEpisode()));
    loadHansardExcerpts().then((x) => setHx(x?.excerpts ?? null));
  }, []);
  const ep2 = ep; // for hero/triptych blocks below
  if (!ep2) return <main className="doc" />;
  const hansardLineConst = '(Question put and agreed to)';
  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>About the tool</p>
        <h1>Vetta — the public record of parliamentary vetting</h1>
        <p className="standfirst">
          Vetta is a public register of parliamentary vetting — who was nominated for office, what citizens
          submitted, what the committee asked, and how each decision was made. Every claim is sourced to a
          document; every number can be checked. It is built to live inside Mzalendo&rsquo;s Civic Tech Tools as a
          durable public instrument.
        </p>
        <div className="close" aria-hidden="true"></div>
      </header>

      <section className="sec" style={{ marginTop: 48 }}>
        <div className="sechead">
          <span className="no">Why it exists</span>
          <h2>Why it exists</h2>
        </div>
        <div className="prose">
          <p>
            The Constitution of Kenya promises transparency, accountability and public participation (Articles 10
            and 232), and demands integrity of anyone seeking state office (Chapter Six). Vetting — the public
            confirmation of Cabinet and other senior appointments — is where those promises are tested in the open.
          </p>
          <p>
            In practice, the record shows a gap. Across three vetting cycles in the 13th Parliament, 62 nominees
            faced the committee: 22 in 2022, 51 Principal Secretaries in 2022, 20 Cabinet Secretaries in August
            2024. One was rejected. The 19 approvals in August 2024 passed on a voice vote — the record shows only
            &ldquo;(Question put and agreed&nbsp;to)&rdquo;. A nominee in the 2024 diplomatic cycle declined vetting
            and was appointed anyway. The record exists; the accountability of the record is what Vetta adds.
          </p>
        </div>
        <div className="empty" style={{ maxWidth: 'var(--measure)', margin: '24px auto 0', fontStyle: 'normal' }}>
          <b style={{ color: 'var(--ink-strong)', fontStyle: 'normal' }}>Data note.</b>{' '}
          These counts are drawn from the compiled record in this tool, each traceable to its source (Hansard, the
          Committee&rsquo;s own reports, Mzalendo&rsquo;s voting records, and public reporting).
        </div>
      </section>

      
{/* ---- our voice-vote triptych as centerpiece ---- */}
      <section className="sec">
        <div className="sechead">
          <span className="no">The finding</span>
          <h2>“{hansardLineConst}”</h2>
          <p className="dek">
            Nineteen Cabinet Secretaries approved by voice vote on 7 August 2024. No division was called —
            no Member’s name was ever recorded on any approval. The juxtaposition below is the argument.
          </p>
        </div>
        <Triptych ep={ep} excerpts={hx} hansardDate={ep.date} hansardLine={hansardLineConst} />
        <p style={{ textAlign: 'center', marginTop: 'var(--s6)' }}>
          <Link to="/vote" style={{ fontWeight: 700, letterSpacing: '.08em', fontSize: 13 }}>
            See the full record →
          </Link>
        </p>
      </section>


<section className="sec">
        <div className="sechead">
          <span className="no">The loop</span>
          <h2>Three acts, one paper trail</h2>
          <p className="dek">Before the hearing, during the sitting, after the vote. Follow the documents.</p>
        </div>
        <div className="acts-grid">
          <Link className="card" to="/nominees">
            <span className="act-no">Act 1 · Before</span>
            <h3>The Nominee File</h3>
            <p>Source-linked dossier: CV, track record, integrity flags. Public question queue with upvotes.</p>
            <span className="go">Open the register →</span>
          </Link>
          <Link className="card" to="/hearings">
            <span className="act-no">Act 2 · During</span>
            <h3>The hearing record</h3>
            <p>Who asked what, tagged by topic — citizen questions shown alongside: asked vs. ignored.</p>
            <span className="go">Open the hearing record →</span>
          </Link>
          <Link className="card" to="/vote">
            <span className="act-no">Act 3 · After</span>
            <h3>The accountability trail</h3>
            <p>Report vs. submissions, side by side. Per-MP vote on every approval — one query.</p>
            <span className="go">Trace a nominee →</span>
          </Link>
        </div>
        <p className="standfirst" style={{ marginTop: 'var(--s3)', opacity: 0.75 }}>
          ↺ the next appointment re-opens the loop.
        </p>
      </section>



      <section className="sec">
        <div className="sechead">
          <span className="no">Design principles</span>
          <h2>Design principles</h2>
        </div>
        <ol className="gaps">
          <li>
            <span className="num">1</span>
            <div>
              <h4>Nothing to seize</h4>
              <p>
                Vetta is a static document, not a service — no database, no backend, no accounts. A copy is a
                complete copy.
              </p>
            </div>
          </li>
          <li>
            <span className="num">2</span>
            <div>
              <h4>Verifiable</h4>
              <p>
                Every claim carries its quote, publisher and link. Data manifests are signed; the published record
                carries event identifiers anyone can check.
              </p>
            </div>
          </li>
          <li>
            <span className="num">3</span>
            <div>
              <h4>Redundant by design</h4>
              <p>
                The record is published to Nostr relays — community networks no single authority controls — so it
                survives any one server&rsquo;s failure.
              </p>
            </div>
          </li>
          <li>
            <span className="num">4</span>
            <div>
              <h4>Non-partisan by construction</h4>
              <p>
                Vetta criticises process, not persons; the evidence bar is identical in both directions, for flags
                and for clean findings.
              </p>
            </div>
          </li>
          <li>
            <span className="num">5</span>
            <div>
              <h4>Built to outlive</h4>
              <p>
                The record is designed to be copied, mirrored and re-hosted by anyone. If this site disappears, the
                record does not.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="no">Who it is for</span>
          <h2>Who it is for</h2>
        </div>
        <div className="prose">
          <p>
            Citizens who want to know how their consent was sought. Journalists who need the primary documents.
            Researchers who need the receipts. And the next cycle&rsquo;s submitters, so the question &ldquo;will
            anyone read this?&rdquo; has an answer.
          </p>
          <p>
            What Vetta is <i>not</i>: not a court, not a fact-checking service, not a campaign. It publishes the
            record and lets the record ask the next question.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="no">Sources &amp; acknowledgment</span>
          <h2>Sources &amp; acknowledgment</h2>
        </div>
        <ul className="findings">
          <li>
            <span className="num">1</span>
            <div>
              <h4>Committee on Appointments, Second Report (August 2024), Parliament of Kenya</h4>
              <p>The primary record, cited by page.</p>
            </div>
          </li>
          <li>
            <span className="num">2</span>
            <div>
              <h4>Hansard, National Assembly, 7 August 2024</h4>
              <p>The floor record.</p>
            </div>
          </li>
          <li>
            <span className="num">3</span>
            <div>
              <h4>Mzalendo</h4>
              <p>Voting records and parliamentary data (CC BY-SA).</p>
            </div>
          </li>
          <li>
            <span className="num">4</span>
            <div>
              <h4>Public reporting</h4>
              <p>
                Nation, The Star, Capital FM, Citizen, Standard, Business Daily; every press item carries publisher
                and date.
              </p>
            </div>
          </li>
          <li>
            <span className="num">5</span>
            <div>
              <h4>Analysis: Caroline Gaita (activist)</h4>
              <p>Vetting-observations working notes; design requirements adapted with permission.</p>
            </div>
          </li>
        </ul>
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <b>Right of reply:</b> subjects of any adverse record may respond; responses are appended verbatim, and
            corrections are logged in the public changelog. Nothing on this site is an allegation without a source.
          </p>
        </div>
      </section>

      <section className="sec">
        <figure className="hansard" style={{ margin: 0 }}>
          <blockquote>Vetta exists so that when the record matters, someone has already kept it.</blockquote>
          <div className="thin-rule" aria-hidden="true"></div>
          <figcaption className="source"><Link to="/">Return to the record</Link></figcaption>
        </figure>
      </section>
    <section className="sec">
        <div className="sechead">
          <span className="no">The wider record</span>
          <h2>Beyond the August 2024 episode</h2>
        </div>
        <div className="acts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Link className="card" to="/ledger">
            <span className="act-no">Every person</span>
            <h3>The people ledger</h3>
            <p>93 people, 111 appointments, verification tiers on every entry.</p>
            <span className="go">Open the ledger →</span>
          </Link>
          <Link className="card" to="/signals">
            <span className="act-no">Pattern rules</span>
            <h3>The signals</h3>
            <p>Eight deterministic rules over the appointment record — computed, not asserted.</p>
            <span className="go">See the patterns →</span>
          </Link>
        </div>
      </section>
    
</main>
  );
}
