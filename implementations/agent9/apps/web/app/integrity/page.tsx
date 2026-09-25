import type { Metadata } from "next";
import Link from "next/link";
import {
  BAND_LABEL,
  CHANNELS,
  DEFAULT_AS_OF,
  LOOKBACK_YEARS,
  summarize,
  windowStart,
  type RatingBand,
  type SourceChannel,
} from "@vetting-loop/integrity";
import { BAND_STYLE, CHANNEL_META, formatDate, getProfiles } from "@/lib/integrity";
import { IndexTable, type IndexRow } from "@/components/integrity/IndexTable";
import { MockBanner, PageHeader } from "@/components/integrity/ui";

export const metadata: Metadata = {
  title: "Scoring sandbox",
  description: "15-year integrity records for Kenyan public officers from EACC, the Auditor-General, Parliament and Mzalendo.",
  // Mock ratings of real people must not be indexed by search engines.
  robots: { index: false, follow: false },
};

export default function IntegrityIndexPage() {
  const profiles = getProfiles();
  const s = summarize(profiles);
  const concern = s.byBand.elevated + s.byBand.high;

  const rows: IndexRow[] = profiles.map((p) => {
    const a2024 = p.appointments[0];
    const channelCounts = Object.fromEntries(
      CHANNELS.map((c) => [c, p.rating.inWindow.filter((f) => f.channel === c).length]),
    ) as Record<SourceChannel, number>;
    return {
      slug: p.slug,
      name: p.fullName,
      role: p.currentRole,
      vetting2024: a2024?.vetting ?? "not_vetted",
      returnee: p.cohorts.includes("cs-2022"),
      score: p.rating.score,
      band: p.rating.band,
      channelCounts,
      excluded: p.rating.excludedOutsideWindow,
    };
  });

  const bands: RatingBand[] = ["clear", "low", "elevated", "high"];

  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Scoring sandbox" }]}
        title="Integrity scoring sandbox"
        lede={
          <>
            How a {LOOKBACK_YEARS}-year integrity score would work once findings from the Ethics and Anti-Corruption Commission,
            the Office of the Auditor-General, parliamentary committees and Mzalendo are attached with document references.
            Demonstrated on twenty synthetic subjects, scored as at the {formatDate(DEFAULT_AS_OF)} general election. No real
            person is scored anywhere on this site.
          </>
        }
      />
      <MockBanner />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-1 text-xl font-bold text-mz-red">Synthetic cohort</h2>
        <p className="mb-6 text-sm text-mz-muted">
          Twenty synthetic subjects with a fixed 8/6/4/2 band distribution, generated to exercise every scoring rule. For real
          appointment records, use the <Link href="/ledger/" className="mz-link">ledger</Link>.
        </p>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="mz-stat">
            <p className="mz-eyebrow">Subjects</p>
            <p className="text-3xl font-bold text-mz-green">{s.total}</p>
            <p className="text-xs text-mz-muted">synthetic</p>
          </div>
          <div className="mz-stat">
            <p className="mz-eyebrow">No adverse record</p>
            <p className="text-3xl font-bold text-mz-green">{s.byBand.clear}</p>
            <p className="text-xs text-mz-muted">zero points in window</p>
          </div>
          <div className="mz-stat">
            <p className="mz-eyebrow">Elevated or high</p>
            <p className="text-3xl font-bold text-mz-green">{concern}</p>
            <p className="text-xs text-mz-muted">of {s.total} profiled</p>
          </div>
          <div className="mz-stat">
            <p className="mz-eyebrow">Lookback window</p>
            <p className="text-3xl font-bold text-mz-green">{LOOKBACK_YEARS} yrs</p>
            <p className="text-xs text-mz-muted">
              from {formatDate(windowStart())} · {s.excludedOutsideWindow} older records excluded
            </p>
          </div>
        </div>

        <section aria-label="Rating distribution" className="mb-10">
          <p className="mz-eyebrow mb-2">Rating distribution (mock)</p>
          <div className="flex h-8 overflow-hidden rounded-mz">
            {bands.map((b) =>
              s.byBand[b] > 0 ? (
                <div
                  key={b}
                  className={`${BAND_STYLE[b].bg} flex items-center justify-center text-xs font-bold text-white`}
                  style={{ width: `${(s.byBand[b] / s.total) * 100}%` }}
                  title={`${BAND_LABEL[b]}: ${s.byBand[b]}`}
                >
                  {s.byBand[b]}
                </div>
              ) : null,
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            {bands.map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <span className={`inline-block h-3 w-3 rounded-sm ${BAND_STYLE[b].bg}`} />
                {BAND_LABEL[b]} · {s.byBand[b]}
              </span>
            ))}
          </div>
        </section>

        <IndexTable rows={rows} />

        <section className="mt-12 grid gap-4 md:grid-cols-4">
          {CHANNELS.map((c) => (
            <div key={c} className="mz-card p-4" style={{ borderTop: `4px solid ${CHANNEL_META[c].color}` }}>
              <p className="font-semibold" style={{ color: CHANNEL_META[c].color }}>
                {CHANNEL_META[c].short}
              </p>
              <p className="text-sm text-mz-muted">{CHANNEL_META[c].long}</p>
            </div>
          ))}
        </section>
        <p className="mt-4 text-sm">
          How ratings are computed, what counts, and what never counts:{" "}
          <Link href="/integrity/methodology" className="mz-link">
            read the methodology
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
