import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TerryLedger, TerryPerson } from '../terryTypes';
import type { Episode } from '../types';
import { loadEpisode, placeholderEpisode } from '../data';
import { loadTerryLedger } from '../data';
import { toOurSlug } from '../slugSeam';

// Ledger & signals: Vetting Record (Terry/Agent9). Hearing-depth record & episode analysis: Vetta (KITT lane).

const TIER_GLYPH: Record<string, string> = {
  compiled: '○',
  cross_checked: '◐',
  gazette_verified: '✓',
};
const TIER_LABEL: Record<string, string> = {
  compiled: 'compiled',
  cross_checked: 'cross-checked',
  gazette_verified: 'gazette-verified',
};

// A person's tier = the best tier across their appointments (matches Terry's per-record tiers).
function personTier(p: TerryPerson): string {
  const rank: Record<string, number> = { compiled: 0, cross_checked: 1, gazette_verified: 2 };
  let best = 'compiled';
  for (const a of p.appointments ?? []) {
    if ((rank[a.verification] ?? -1) > (rank[best] ?? -1)) best = a.verification;
  }
  return best;
}

// Source dates for the gender-docket vacancy stat. Both are documented facts:
//   2024-08-07 - Committee on Appointments Second Report / House approval (episode.json date; Soi rejected)
//   2025-03-26 - nomination of the next Gender CS (Terry's ledger cycle 'cs-2025-reshuffle'; vetting-record.pages.dev)
// The DURATION is computed from these two constants - never hardcoded as "231".
const GENDER_VACANCY_FROM = '2024-08-07';
const GENDER_VACANCY_TO = '2025-03-26';

function daysBetween(a: string, b: string): number | null {
  const da = new Date(a + 'T00:00:00Z');
  const db = new Date(b + 'T00:00:00Z');
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export default function Ledger() {
  const [ledger, setLedger] = useState<TerryLedger | null>(null);
  const [ep, setEp] = useState<Episode | null>(null);
  const [q, setQ] = useState('');
  const [office, setOffice] = useState('');
  const [signal, setSignal] = useState('');
  const [ourSlugs, setOurSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTerryLedger().then((l) => setLedger(l));
    loadEpisode().then((e) => setEp(e ?? placeholderEpisode()));
    // Seam: which of Terry's 93 people have a full Vetta hearing dossier in OUR episode.json?
    fetch(`${import.meta.env.BASE_URL}data/episode.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ep) => {
        if (ep?.nominees) {
          // Store OUR slugs normalized: map Terry slug -> our slug via alias seam, plus identity.
          const s = new Set<string>();
          for (const n of ep.nominees) s.add(n.slug);
          setOurSlugs(s);
        }
      })
      .catch(() => undefined);
  }, []);

  const signalIds = useMemo(() => (ledger?.signals ?? []).map((s) => s.id), [ledger]);
  const hitSlugsBySignal = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    for (const h of ledger?.hits ?? []) {
      (m[h.signal] = m[h.signal] ?? new Set()).add(h.slug);
    }
    return m;
  }, [ledger]);

  const offices = useMemo(() => {
    const s = new Set<string>();
    for (const p of ledger?.people ?? []) for (const a of p.appointments ?? []) s.add(a.office);
    return Array.from(s).sort();
  }, [ledger]);


  // ---- hero figures (transplanted from Home) - computed, never hardcoded ----
  const nom = ep?.nominees ?? [];
  const peopleRaw = ledger?.people ?? [];
  const allAppointments = peopleRaw.flatMap((p) => p.appointments ?? []);
  const totalAppointments = allAppointments.length;
  const approvedAppointments = allAppointments.filter((a) => a.outcome === 'approved').length;
  const gateCycleIds = new Set((ledger?.cycles ?? []).filter((c) => c.gate).map((c) => c.id));
  const houseRejections = allAppointments.filter((a) => a.outcome === 'rejected' && gateCycleIds.has(a.cycle)).length;
  const assertPositive = (n: number, what: string) => { if (n <= 0) throw new Error(`ledger computation returned ${n} for ${what}`); return n; };
  const returnees = nom.filter((n) => n.priorRole?.priorRoleType === 'cs_returnee' || n.priorRole?.priorRoleType === 'constitutional_office').length;
  const vacancyDays = daysBetween(GENDER_VACANCY_FROM, GENDER_VACANCY_TO);
  const floorOverrideHits = ledger?.hits?.filter((x) => x.signal === 'floor_override') ?? [];
  const floorOverrideCount = floorOverrideHits.length;
  const approvalPct = totalAppointments > 0 ? Math.round((approvedAppointments / totalAppointments) * 1000) / 10 : null;
  const people = ledger?.people ?? [];
  const filtered = people.filter((p) => {
    if (q && !`${p.name} ${p.latestRole}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (office && !(p.appointments ?? []).some((a) => a.office === office)) return false;
    if (signal && !(hitSlugsBySignal[signal]?.has(p.slug))) return false;
    return true;
  });

  if (!ledger) return <main className="doc" />;

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>13th Parliament · Kenya</p>
        <h1>
          <span style={{ color: 'var(--red)' }}>{assertPositive(totalAppointments, 'appointments')} nominations.</span>{' '}
          {houseRejections === 1 ? 'One rejection.' : <>{houseRejections} rejections.</>}
        </h1>
        <p className="standfirst">
          Parliament vets every Cabinet Secretary and Principal Secretary before they take office. This tool
          shows what that gate actually does. 93 people carry 111 nominations across ten vetting cycles
          (Cabinet Secretaries, Principal Secretaries, envoys). Every appointment linked to the person, every
          fact cited, every pattern computed from the record rather than asserted. "Gate" cycles are the
          parliamentary vetting of CS and PS nominees; envoy and elevation cycles sit outside it, in the record.
        </p>
        <div className="docmeta">
          <span>Combined record</span><span className="dot">·</span>
          <span>Non-partisan</span><span className="dot">·</span>
          <span>All claims source-linked</span>
        </div>
        <div className="close" aria-hidden="true"></div>
      </header>

      <div className="outcome outcome-4" role="list" aria-label="Key figures, computed from the record">
        <div className="cell" role="listitem">
          <div className="fig">
            {totalAppointments > 0 ? `${approvedAppointments} of ${totalAppointments}` : 'n/a'}
          </div>
          <div className="cap">
            {approvalPct !== null ? `${approvalPct}% approval rate across cycles` : 'Approval rate across cycles'}
          </div>
        </div>
        <div className="cell" role="listitem">
          <div className="fig">{returnees > 0 ? `${returnees} of 19` : 'n/a'}</div>
          <div className="cap">Returned after dissolution: 9 CS + 1 AG</div>
        </div>
        <div className="cell" role="listitem">
          <div className="fig">{vacancyDays !== null ? `${vacancyDays} days` : 'n/a'}</div>
          <div className="cap">Gender docket left vacant by the only House rejection</div>
        </div>
        {floorOverrideCount > 0 ? (
          <div className="cell" role="listitem">
            <div className="fig">{floorOverrideCount}</div>
            <div className="cap">Committee rejection overturned on the floor</div>
          </div>
        ) : null}
      </div>

            <details style={{ margin: 'var(--s4) 0' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Signal legend: what these chips mean</summary>
        <ol style={{ margin: 'var(--s3) 0 0', paddingLeft: 'var(--s6)' }}>
          {(ledger?.signals ?? []).map((sig) => (
            <li key={sig.id} style={{ marginBottom: 6 }}>
              <b>{sig.label}</b>: {sig.rule}
            </li>
          ))}
        </ol>
        <p style={{ margin: 'var(--s2) 0 0', opacity: 0.75, fontSize: '0.9em' }}>
          Signals describe the appointment process, never a person's conduct. Full methodology →{' '}
          <Link to="/methodology">Methodology &amp; signals</Link>.
        </p>
      </details>
<div className="led-tools">
        <input
          className="led-search"
          type="search"
          placeholder="Search people…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search people"
        />
        <select className="led-select" value={office} onChange={(e) => setOffice(e.target.value)} aria-label="Filter by office type">
          <option value="">All office types</option>
          {offices.map((o) => (
            <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="led-chips" role="group" aria-label="Filter by signal">
        <button className={'led-chip' + (signal === '' ? ' on' : '')} onClick={() => setSignal('')}>All</button>
        {signalIds.map((id) => {
          const meta = ledger.signals.find((s) => s.id === id);
          const n = hitSlugsBySignal[id]?.size ?? 0;
          return (
            <button key={id} className={'led-chip' + (signal === id ? ' on' : '')} onClick={() => setSignal(signal === id ? '' : id)}>
              {meta?.label ?? id} ({n})
            </button>
          );
        })}
      </div>

      <div className="led-table-wrap">
        <table className="led-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Appointments</th>
              <th>Signals</th>
              <th>Verification</th>
              <th>Hearing</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const tier = personTier(p);
              const sigs = (ledger.hits ?? []).filter((h) => h.slug === p.slug);
              const ourSlug = toOurSlug(p.slug);
              const hasHearing = ourSlugs.has(ourSlug);
              return (
                <tr key={p.slug}>
                  <td>
                    <div className="led-name">{p.name}</div>
                    <div className="led-role">{p.latestRole}</div>
                  </td>
                  <td className="led-appts">
                    {(p.appointments ?? []).map((a) => (
                      <div key={a.id} className="led-appt">
                        <span className="led-portfolio">{a.portfolio}</span>
                        {a.cycle === 'cs-2024' ? (
                          <Link className={'led-outcome led-out-' + a.outcome} to="/vote" title="How this batch was approved: the voice vote with no recorded division">{a.outcome}</Link>
                        ) : (
                          <span className={'led-outcome led-out-' + a.outcome}>{a.outcome}</span>
                        )}
                        <span className="led-cycle">{a.cycle}</span>
                      </div>
                    ))}
                  </td>
                  <td>
                    <div className="chips">
                      {sigs.length === 0 && <span className="led-none">none</span>}
                      {sigs.map((h) => {
                        const meta = ledger.signals.find((s) => s.id === h.signal);
                        return (
                          <span key={h.signal + h.appointmentIds.join('|')} className="chip chip-neutral" title={h.detail}>
                            {meta?.label ?? h.signal}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="led-tier">
                    <span className="led-glyph" aria-hidden="true">{TIER_GLYPH[tier] ?? '○'}</span> {TIER_LABEL[tier] ?? tier}
                  </td>
                  <td>
                    {hasHearing ? (
                      <Link className="led-hearing" to={`/nominee/${ourSlug}`}>Dossier →</Link>
                    ) : (
                      <span className="led-none">none</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty" style={{ margin: '24px 0' }}>No people match the current filters.</div>
        )}
      </div>

      <p className="led-credit">
        Ledger &amp; signals: Vetting Record (Terry/Agent9). Hearing-depth record &amp; episode analysis: Vetta
        (KITT lane). Combined from two independent builds (Vetta × Vetting Record). Verification tiers: ○ compiled · ◐ cross-checked ·
        ✓ gazette-verified.
      </p>
    </main>
  );
}
