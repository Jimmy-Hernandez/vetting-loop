import type { Metadata } from "next";
import Link from "next/link";
import { CYCLES, PEOPLE, gateDecisions, gateStats, reconstitution2024, vacancies } from "@vetting-loop/ledger";
import { GateBars, GateMatrix, ReconstitutionFlow } from "@/components/ledger/charts";
import { PageHeader, SectionTitle } from "@/components/ledger/ui";
import { fmtDate } from "@/lib/ledger";

export const metadata: Metadata = { title: "The vetting gate" };

export default function CyclesPage() {
  const gate = gateStats(PEOPLE);
  const r = reconstitution2024(PEOPLE);
  const d = gateDecisions(PEOPLE);
  const vac = vacancies(PEOPLE);
  const count = (id: string) => PEOPLE.flatMap((p) => p.appointments).filter((a) => a.cycle === id).length;

  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Vetting gate" }]}
        title="The vetting gate"
        lede="Under the Public Appointments (Parliamentary Approval) Act, nominees appear before a House committee, which reports to the House for a vote. This page measures what that gate did across the 13th Parliament."
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="mz-card p-6">
            <p className="mz-eyebrow mb-4">{gate.nominated} nominations across three formal cycles</p>
            <GateMatrix rows={gate.rows} />
          </div>
          <div className="mz-card p-6">
            <p className="mz-eyebrow mb-4">By cycle</p>
            <GateBars rows={gate.rows} />
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-mz-border pt-5 text-center">
              <div><dt className="text-xs text-mz-muted">Committee rejections</dt><dd className="text-2xl font-extrabold">{d.committeeRejections.length}</dd></div>
              <div><dt className="text-xs text-mz-muted">Overturned by House</dt><dd className="text-2xl font-extrabold text-mz-red">{d.overturned.length}</dd></div>
              <div><dt className="text-xs text-mz-muted">Rejections that stood</dt><dd className="text-2xl font-extrabold text-mz-green">{d.houseRejections.length}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-mz-muted">Includes envoy vetting. {d.houseRejections.map((x) => x.person.name).join(" and ")}.</p>
          </div>
        </div>

        <section className="mt-16">
          <SectionTitle
            eyebrow="July–August 2024"
            title="Dissolution and reconstitution"
            lede={`${r.nominees} nominees in two batches. ${r.approved} approved, ${r.rejected} rejected. ${r.returnees} had been members of the dissolved cabinet; ${r.newFaces} were new.`}
          />
          <div className="mz-card p-6"><ReconstitutionFlow r={r} dissolved={22} /></div>
        </section>

        {vac.length > 0 && (
          <section className="mt-16">
            <SectionTitle eyebrow="Vacancies" title="What a rejection costs" />
            {vac.map((v) => (
              <div key={v.portfolio} className="mz-card p-6">
                <p className="text-lg font-bold">{v.portfolio}</p>
                <p className="mt-1 text-sm text-mz-muted">{fmtDate(v.from)} → {fmtDate(v.to)} · {v.reason}</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-mz-subtle">
                  <div className="h-full bg-mz-red" style={{ width: `${Math.min(100, (v.days / 365) * 100)}%` }} />
                </div>
                <p className="mt-2 text-sm"><strong className="text-mz-red">{v.days} days</strong> without a Cabinet Secretary, measured to the next nomination.</p>
              </div>
            ))}
          </section>
        )}

        <section className="mt-16">
          <SectionTitle eyebrow="Timeline" title="Every cycle in the ledger" />
          <ol className="relative space-y-4 border-l-2 border-mz-border pl-6">
            {[...CYCLES].sort((a, b) => a.date.localeCompare(b.date)).map((c) => (
              <li key={c.id} className="relative">
                <span className={`absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-4 border-white ${c.gate ? "bg-mz-red" : "bg-mz-green"}`} aria-hidden />
                <p className="text-xs font-semibold text-mz-muted">{fmtDate(c.date)} · {c.body}</p>
                <p className="font-bold">{c.label} <span className="text-sm font-normal text-mz-muted">· {count(c.id)} record{count(c.id) === 1 ? "" : "s"}</span></p>
                <p className="text-sm text-mz-muted">{c.summary}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm"><Link href="/ledger/" className="mz-link">Open the full ledger →</Link></p>
        </section>
      </div>
    </main>
  );
}
