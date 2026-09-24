import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TerryLedger, TerryHit } from '../terryTypes';
import { loadTerryLedger } from '../data';

// "What it is not" — Terry's verbatim framing from vetting-record.pages.dev/signals.
const WHAT_NOT = [
  'They are not machine-learning predictions. No model infers anything about anyone.',
  'They are not allegations of fraud, corruption or misconduct.',
  'They are not rankings. People are not scored, sorted or compared.',
];

// "Where integrity findings will go" — Terry's synthetic-sandbox boundary statement, verbatim.
const BOUNDARY =
  'Findings from the EACC, the Auditor-General and parliamentary committees will attach to records only ' +
  'when each carries a document reference a reader can open. Until then, the scoring method is ' +
  'demonstrated on synthetic subjects in the scoring sandbox.';

export default function Signals() {
  const [ledger, setLedger] = useState<TerryLedger | null>(null);
  const [ourSlugs, setOurSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTerryLedger().then((l) => setLedger(l));
    fetch(`${import.meta.env.BASE_URL}data/episode.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ep) => {
        if (ep?.nominees) setOurSlugs(new Set(ep.nominees.map((n: { slug: string }) => n.slug)));
      })
      .catch(() => undefined);
  }, []);

  const hitsBySignal = useMemo(() => {
    const m: Record<string, TerryHit[]> = {};
    for (const h of ledger?.hits ?? []) (m[h.signal] = m[h.signal] ?? []).push(h);
    return m;
  }, [ledger]);

  if (!ledger) return <main className="doc" />;
  const signals = ledger.signals ?? [];

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Pattern signals</p>
        <h1>Eight rules, computed from the record</h1>
        <p className="standfirst">
          Deterministic rules run over the ledger at build time. Each rule is stated in plain language so a
          reader can re-derive every match by hand. A signal marks a pattern in the appointment process worth
          scrutiny. It is never a finding about a person.
        </p>
        <div className="close" aria-hidden="true"></div>
      </header>

      <div className="sig-list">
        {signals.map((s) => {
          const matches = hitsBySignal[s.id] ?? [];
          return (
            <section key={s.id} className="sig-card">
              <div className="sig-head">
                <span className="sig-label">{s.label}</span>
                <p className="sig-rule">{s.rule}</p>
                <p className="sig-why">{s.why}</p>
              </div>
              <div className="sig-body">
                <div className="sig-count">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</div>
                {matches.length > 0 ? (
                  <ul className="sig-matches">
                    {matches.map((h) => (
                      <li key={h.slug + h.appointmentIds.join('|')}>
                        <div className="sig-m-name">
                          {ourSlugs.has(h.slug) ? (
                            <Link to={`/nominee/${h.slug}`}>{personName(ledger, h.slug)} →</Link>
                          ) : (
                            personName(ledger, h.slug)
                          )}
                        </div>
                        <div className="sig-m-detail">{h.detail}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty">not derivable from current record</div>
                )}
                <div className="sig-notblock">
                  <h4>What signals are not</h4>
                  <ul>
                    {WHAT_NOT.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="sig-boundary">
        <h4>Where integrity findings will go</h4>
        <p>{BOUNDARY}</p>
      </div>

      <p className="led-credit">
        Ledger &amp; signals: Vetting Record (Terry/Agent9). Hearing-depth record &amp; episode analysis: Vetta
        (KITT lane). Combined for Mzalendo Civic Tech Tools.
      </p>
    </main>
  );
}

function personName(ledger: TerryLedger, slug: string): string {
  return ledger.people.find((p) => p.slug === slug)?.name ?? slug;
}
