import type { Metadata } from "next";
import Link from "next/link";
import { PEOPLE, SIGNALS, reconstitution2024 } from "@vetting-loop/ledger";
import { Callout, PageHeader, SignalChip } from "@/components/ledger/ui";
import { hitsBySignal } from "@/lib/ledger";

export const metadata: Metadata = { title: "Pattern signals" };

const REQUIREMENT: Record<number, string> = {
  1: "Track appearances, not just outcomes",
  2: "Track personnel across cycles",
  3: "Track exit pathways",
  4: "Record stated grounds verbatim",
};

export default function SignalsPage() {
  const hits = hitsBySignal();
  const r = reconstitution2024(PEOPLE);
  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Signals" }]}
        title="Pattern signals"
        lede="Deterministic rules run over the ledger at build time. Each rule is stated in plain language so a reader can re-derive every match by hand. A signal marks a pattern in the appointment process worth scrutiny. It is never a finding about a person."
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <Callout tone="fix" title="Correction caught by the ledger: the returnee rate">
            Working notes put the 2024 returnee figure at 6 of 19 (32%). Six is the returnee count in the first batch of eleven nominees (19 Jul 2024).
            Across both batches the linked record gives <strong>{r.returnees} of {r.approved}</strong>: {r.returneesAsCs} former Cabinet Secretaries and one former
            Attorney General.
          </Callout>
          <Callout tone="fix" title="Correction caught by verification: the Ghana no-show">
            Working notes said a nominee who declined and never appeared was nonetheless posted to Accra. Dated reporting shows his name reached the
            Gazette on 3 May 2024, which State House called a mistake, and the appointment was then revoked. The signal now records what happened: the
            name was <em>gazetted without approval</em>, and the error was corrected afterwards.
          </Callout>
        </div>

        <div className="space-y-8">
          {SIGNALS.map((s) => {
            const list = hits.get(s.id) ?? [];
            return (
              <section key={s.id} id={s.id} className="mz-card scroll-mt-32 overflow-hidden">
                <header className="grid grid-cols-[1fr_auto] items-start gap-4 border-b border-mz-border bg-mz-subtle px-5 py-4">
                  <div>
                    <SignalChip id={s.id} />
                    <h2 className="mt-2 text-lg font-bold">{s.rule}</h2>
                    <p className="mt-1 max-w-3xl text-sm text-mz-muted">{s.why}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-mz-red">{list.length}</p>
                    <p className="text-xs text-mz-muted">match{list.length === 1 ? "" : "es"}</p>
                  </div>
                </header>
                <ul className="divide-y divide-mz-border">
                  {list.map((h) => (
                    <li key={`${h.slug}-${h.appointmentIds.join()}`} className="grid gap-1 px-5 py-3 text-sm md:grid-cols-[240px_1fr]">
                      <Link href={`/people/${h.slug}/`} className="font-semibold text-mz-red hover:underline">{h.name}</Link>
                      <span className="text-mz-muted">{h.detail}</span>
                    </li>
                  ))}
                  {list.length === 0 && <li className="px-5 py-4 text-sm text-mz-muted">No matches in the current ledger.</li>}
                </ul>
                <footer className="border-t border-mz-border px-5 py-2 text-xs text-mz-muted">
                  Design requirement {s.requirement}: {REQUIREMENT[s.requirement]}
                </footer>
              </section>
            );
          })}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="mz-card p-6 text-sm">
            <h2 className="mb-2 text-lg font-bold text-mz-red">What signals are not</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-mz-muted">
              <li>They are not machine-learning predictions. No model infers anything about anyone.</li>
              <li>They are not allegations of fraud, corruption or misconduct.</li>
              <li>They are not rankings. People are not scored, sorted or compared.</li>
            </ul>
          </div>
          <div className="mz-card p-6 text-sm">
            <h2 className="mb-2 text-lg font-bold text-mz-red">Where integrity findings will go</h2>
            <p className="text-mz-muted">
              Findings from the EACC, the Auditor-General and parliamentary committees will attach to records only when each carries a document
              reference a reader can open. Until then, the scoring method is demonstrated on synthetic subjects in the{" "}
              <Link href="/integrity/" className="mz-link">scoring sandbox</Link>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
