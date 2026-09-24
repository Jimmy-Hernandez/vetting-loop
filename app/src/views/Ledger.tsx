import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TerryLedger, TerryPerson } from '../terryTypes';
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

export default function Ledger() {
  const [ledger, setLedger] = useState<TerryLedger | null>(null);
  const [q, setQ] = useState('');
  const [office, setOffice] = useState('');
  const [signal, setSignal] = useState('');
  const [ourSlugs, setOurSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTerryLedger().then((l) => setLedger(l));
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
        <p className="kicker"><span className="rule"></span>The people ledger</p>
        <h1>Who was nominated, vetted and approved</h1>
        <p className="standfirst">
          {people.length} people · {people.reduce((a, p) => a + (p.appointments?.length ?? 0), 0)} appointments ·{' '}
          {ledger.cycles?.length ?? 0} cycles. Every entry is a dated public fact with its source and a
          verification tier. Signals describe the appointment process, never a person's conduct.
        </p>
        <div className="close" aria-hidden="true"></div>
      </header>

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
                        <span className={'led-outcome led-out-' + a.outcome}>{a.outcome}</span>
                        <span className="led-cycle">{a.cycle}</span>
                      </div>
                    ))}
                  </td>
                  <td>
                    <div className="chips">
                      {sigs.length === 0 && <span className="led-none">—</span>}
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
                      <span className="led-none">—</span>
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
        (KITT lane). Combined for Mzalendo Civic Tech Tools. Verification tiers: ○ compiled · ◐ cross-checked ·
        ✓ gazette-verified.
      </p>
    </main>
  );
}
