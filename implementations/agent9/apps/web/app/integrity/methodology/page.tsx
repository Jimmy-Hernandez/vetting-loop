import type { Metadata } from "next";
import {
  ATTRIBUTION_WEIGHT,
  BAND_LABEL,
  BAND_THRESHOLDS,
  CHANNELS,
  DEFAULT_AS_OF,
  LOOKBACK_YEARS,
  STATUS_POINTS,
  windowStart,
  type FindingStatus,
} from "@vetting-loop/integrity";
import { BAND_STYLE, CHANNEL_META, formatDate } from "@/lib/integrity";
import { MockBanner, PageHeader } from "@/components/integrity/ui";

export const metadata: Metadata = {
  title: "Scoring methodology",
};

const STATUS_LABEL: Record<FindingStatus, string> = {
  eacc_investigation_opened: "Investigation opened",
  eacc_prosecution_recommended: "Prosecution recommended to ODPP",
  eacc_asset_recovery_filed: "Asset-recovery suit filed",
  eacc_closed_no_action: "Closed, no further action",
  oag_query_unresolved: "Audit query unresolved",
  oag_query_resolved: "Audit query resolved",
  oag_qualified_opinion: "Qualified audit opinion",
  oag_adverse_opinion: "Adverse audit opinion",
  parl_vetting_concern_raised: "Integrity question left open at vetting",
  parl_vetting_concern_cleared: "Vetting question answered",
  parl_committee_adverse_mention: "Adverse mention in committee report",
  parl_censure_or_impeachment_motion: "Censure or impeachment motion",
  mz_hansard_allegation: "Allegation recorded in Hansard",
  mz_wealth_declaration_gap: "Wealth-declaration gap debated",
};

const CHANNEL_OF: Record<string, (typeof CHANNELS)[number]> = { eacc: "eacc", oag: "oag", parl: "parliament", mz: "mzalendo" };

export default function MethodologyPage() {
  const statuses = Object.keys(STATUS_POINTS) as FindingStatus[];
  return (
    <main>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Civic Tech Tools", href: "/civic-tech" },
          { label: "Scoring sandbox", href: "/integrity/" },
          { label: "Methodology" },
        ]}
        title="How integrity scoring works"
        lede="The index rates the status of institutional records, not guilt. It never counts rumour, media reports without an institutional record, or anything older than 15 years."
      />
      <MockBanner compact />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
        <section>
          <h2 className="mb-2 text-xl font-bold text-mz-red">1. Four sources, nothing else</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {CHANNELS.map((c) => (
              <div key={c} className="mz-card p-4" style={{ borderLeft: `4px solid ${CHANNEL_META[c].color}` }}>
                <p className="font-semibold">{CHANNEL_META[c].long}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-mz-red">2. A hard {LOOKBACK_YEARS}-year lookback</h2>
          <p className="text-mz-muted">
            Ratings are computed as of the general election on {formatDate(DEFAULT_AS_OF)}. Only records dated on or after{" "}
            {formatDate(windowStart())} count. Older records are listed separately and contribute zero. Within the window,
            weight decays linearly from 1.0 for a current record to 0.5 at the window edge.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-mz-red">3. Points follow the process, not the headline</h2>
          <p className="mb-3 text-mz-muted">
            A record&apos;s base points reflect how far the institutional process went. Closed, resolved and answered
            matters carry zero.
          </p>
          <div className="overflow-x-auto rounded-mz border border-mz-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-mz-subtle text-xs uppercase tracking-wide text-mz-muted">
                <tr>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Record status</th>
                  <th className="px-4 py-2 text-right">Base points</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((s) => {
                  const ch = CHANNEL_OF[s.split("_")[0]!]!;
                  return (
                    <tr key={s} className="border-t border-mz-border">
                      <td className="px-4 py-2 font-semibold" style={{ color: CHANNEL_META[ch].color }}>
                        {CHANNEL_META[ch].short}
                      </td>
                      <td className="px-4 py-2">{STATUS_LABEL[s]}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${STATUS_POINTS[s] === 0 ? "text-mz-green" : ""}`}>
                        {STATUS_POINTS[s]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-mz-red">4. Attribution</h2>
          <p className="text-mz-muted">
            Audit findings concern entities, not people. They attach to a person only for the period that person led the
            entity: full weight for a record naming them directly ({ATTRIBUTION_WEIGHT.direct}×), {ATTRIBUTION_WEIGHT.accounting_officer}×
            as accounting officer, {ATTRIBUTION_WEIGHT.political_head}× as political head.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-mz-red">5. Bands</h2>
          <p className="mb-3 text-mz-muted">Score = sum of weighted points, capped at 100.</p>
          <ul className="grid gap-2 md:grid-cols-4">
            {(
              [
                ["clear", "0"],
                ["low", `1–${BAND_THRESHOLDS.low}`],
                ["elevated", `${BAND_THRESHOLDS.low + 1}–${BAND_THRESHOLDS.elevated}`],
                ["high", `${BAND_THRESHOLDS.elevated + 1}+`],
              ] as const
            ).map(([b, range]) => (
              <li key={b} className={`rounded-mz ${BAND_STYLE[b].bg} p-3 text-white`}>
                <p className="text-lg font-bold">{range}</p>
                <p className="text-sm">{BAND_LABEL[b]}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-mz-red">6. Safeguards</h2>
          <ul className="list-disc space-y-1 pl-5 text-mz-muted">
            <li>Every live record must link a source document from one of the four institutions. No bare allegations.</li>
            <li>Neutral language only: records describe process status, never character.</li>
            <li>Proposed: a right of reply before any live rating is published, shown beside the record.</li>
            <li>Mock-mode pages are excluded from search indexing and every rating is stamped MOCK.</li>
          </ul>
        </section>

        <section className="rounded-mz border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">About the current data</p>
          <p className="mt-1">
            The sandbox scores 20 synthetic subjects. Every subject, finding and rating is generated, with bands assigned by a
            hash of the synthetic identifier against a fixed distribution (8 clear, 6 low, 4 elevated, 2 high). No real person
            is scored. Real findings will attach to ledger records only with a document reference a reader can open.
          </p>
        </section>
      </div>
    </main>
  );
}
