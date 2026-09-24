import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Episode, HansardExcerpt } from '../types';
import type { TerryLedger } from '../terryTypes';
import { loadEpisode, loadHansardExcerpts, loadTerryLedger, placeholderEpisode } from '../data';
import Triptych from './Triptych';

// Source dates for the gender-docket vacancy stat. Both are documented facts:
//   2024-08-07 — Committee on Appointments Second Report / House approval (episode.json date; Soi rejected)
//   2025-03-26 — nomination of the next Gender CS (Terry's ledger cycle 'cs-2025-reshuffle'; vetting-record.pages.dev)
// The DURATION is computed from these two constants — never hardcoded as "231".
const GENDER_VACANCY_FROM = '2024-08-07';
const GENDER_VACANCY_TO = '2025-03-26';

function daysBetween(a: string, b: string): number | null {
  const da = new Date(a + 'T00:00:00Z');
  const db = new Date(b + 'T00:00:00Z');
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export default function Home() {
  const [ep, setEp] = useState<Episode | null>(null);
  const [ledger, setLedger] = useState<TerryLedger | null>(null);
  const [hx, setHx] = useState<HansardExcerpt[] | null>(null);
  useEffect(() => {
    loadEpisode().then((e) => setEp(e ?? placeholderEpisode()));
    loadTerryLedger().then((l) => setLedger(l));
    loadHansardExcerpts().then((x) => setHx(x?.excerpts ?? null));
  }, []);
  if (!ep) return <main className="doc" />;

  const nom = ep.nominees ?? [];

  // ---- stat strip figures, all computed from repo JSON ----
  const people = ledger?.people ?? [];
  const allAppointments = people.flatMap((p) => p.appointments ?? []);
  const totalAppointments = allAppointments.length;
  const approvedAppointments = allAppointments.filter((a) => a.outcome === 'approved').length;
  // "One rejection": House rejections across the vetting-gate cycles (CS 2022, PS 2022, CS 2024) —
  // Terry's own framing. The third raw 'rejected' is an envoy-cycle rejection, not a gate rejection.
  const gateCycleIds = new Set((ledger?.cycles ?? []).filter((c) => c.gate).map((c) => c.id));
  const houseRejections = allAppointments.filter((a) => a.outcome === 'rejected' && gateCycleIds.has(a.cycle)).length;
  const nPeople = people.length;
  const assertPositive = (n: number, what: string) => {
    if (n <= 0) throw new Error(`ledger computation returned ${n} for ${what}`);
    return n;
  };

  // "10 of 19" returnees — from OUR episode.json priorRole data (9 CS + 1 AG).
  const returnees = nom.filter((n) => n.priorRole?.priorRoleType === 'cs_returnee' || n.priorRole?.priorRoleType === 'constitutional_office').length;

  // 231 days gender docket vacancy — computed from the two sourced constants above.
  const vacancyDays = daysBetween(GENDER_VACANCY_FROM, GENDER_VACANCY_TO);

  // Committee rejection overturned on the floor (Malonza 2022) — from Terry's signal data, if present.
  const floorOverrideHits = ledger?.hits?.filter((h) => h.signal === 'floor_override') ?? [];
  const floorOverrideCount = floorOverrideHits.length;

  const approvalPct = totalAppointments > 0 ? Math.round((approvedAppointments / totalAppointments) * 1000) / 10 : null;

  // The voice-vote record line, verbatim — anchored to the episode date.
  const hansardLineConst = '(Question put and agreed to)';

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Civic Tech Tools · 13th Parliament</p>
        <h1>
          {assertPositive(nPeople, 'people')} nominations.{' '}
          {houseRejections === 1 ? 'One rejection.' : <>{houseRejections} rejections.</>}
        </h1>
        <p className="standfirst">
          Parliament vets every Cabinet Secretary and Principal Secretary before they take office. This tool
          shows what that gate actually does: every nomination linked to the person, every fact cited, every
          pattern computed from the record rather than asserted.
        </p>
        <div className="docmeta">
          <span>Combined record</span><span className="dot">·</span>
          <span>Non-partisan</span><span className="dot">·</span>
          <span>All claims source-linked</span>
        </div>
        <div className="close" aria-hidden="true"></div>
      </header>

      {/* ---- stat strip: computed from terry/ledger.json + episode.json ---- */}
      <div className="outcome" role="list" aria-label="Key figures, computed from the record">
        <div className="cell" role="listitem">
          <div className="fig">
            {totalAppointments > 0 ? `${approvedAppointments} of ${totalAppointments}` : '—'}
          </div>
          <div className="cap">
            {approvalPct !== null ? `${approvalPct}% approval rate across cycles` : 'Approval rate across cycles'}
          </div>
        </div>
        <div className="cell" role="listitem">
          <div className="fig">{returnees > 0 ? `${returnees} of 19` : '—'}</div>
          <div className="cap">Returned after dissolution — 9 CS + 1 AG</div>
        </div>
        <div className="cell" role="listitem">
          <div className="fig">{vacancyDays !== null ? `${vacancyDays} days` : '—'}</div>
          <div className="cap">Gender docket left vacant by the only House rejection</div>
        </div>
        {floorOverrideCount > 0 ? (
          <div className="cell" role="listitem">
            <div className="fig">{floorOverrideCount}</div>
            <div className="cap">Committee rejection overturned on the floor</div>
          </div>
        ) : null}
      </div>

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

      {/* ---- three-act loop cards ---- */}
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

      {/* ---- link strip ---- */}
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
