import type { Metadata } from "next";
import Link from "next/link";
import { CYCLES, LEDGER_COMPILED, SIGNALS } from "@vetting-loop/ledger";
import { LedgerExplorer } from "@/components/ledger/LedgerExplorer";
import { PageHeader, VerificationTag } from "@/components/ledger/ui";
import { fmtDate, ledgerRows } from "@/lib/ledger";

export const metadata: Metadata = { title: "Appointment ledger" };

export default function LedgerPage() {
  const rows = ledgerRows();
  const byTier = (t: string) => rows.filter((r) => r.tier === t).length;
  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Ledger" }]}
        title="Appointment ledger"
        lede={
          <>
            Every person nominated to Cabinet, Principal Secretary and selected envoy posts in the 13th Parliament, with each appointment linked
            to its vetting cycle and sources. {byTier("cabinet")} cabinet-level records, {byTier("ps")} Principal Secretaries, {byTier("envoy")} envoy-only records.
            Compiled {fmtDate(LEDGER_COMPILED)}.
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-mz border border-mz-border bg-white p-4 text-xs text-mz-muted">
          <span className="font-semibold text-mz-text">Verification tiers:</span>
          <VerificationTag v="compiled" /> <span>published list, not yet cross-checked</span>
          <VerificationTag v="cross_checked" /> <span>dates and outcome matched to dated press</span>
          <VerificationTag v="gazette_verified" /> <span>pinned to Gazette or Hansard by a reviewer</span>
        </div>
        <LedgerExplorer rows={rows} signals={SIGNALS.map((s) => ({ id: s.id, label: s.label }))} />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="mz-card p-5 text-sm">
            <p className="mz-eyebrow mb-2">Cycles covered</p>
            <ul className="space-y-1.5">
              {CYCLES.map((c) => (
                <li key={c.id}><span className="font-semibold">{c.label}</span> <span className="text-mz-muted">· {fmtDate(c.date)} · {c.body}</span></li>
              ))}
            </ul>
          </div>
          <div className="mz-card p-5 text-sm text-mz-muted">
            <p className="mz-eyebrow mb-2">Known gaps</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Intra-term reshuffles of October 2023 are not yet compiled; 2022 portfolios are the dockets at nomination.</li>
              <li>Principal Secretary changes after 2022, including the March 2025 batch of 14, are not yet compiled.</li>
              <li>Individual Principal Secretary names are from the published nomination list and remain at the compiled tier.</li>
              <li>Download the full record as <Link className="mz-link" href="/data/ledger.json">JSON</Link> to audit it yourself.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
