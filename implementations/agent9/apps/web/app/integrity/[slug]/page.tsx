import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ATTRIBUTION_WEIGHT,
  BAND_LABEL,
  CHANNELS,
  LOOKBACK_YEARS,
  STATUS_POINTS,
  findingPoints,
  type Finding,
} from "@vetting-loop/integrity";
import { BAND_STYLE, CHANNEL_META, formatDate, formatKes, getProfile, getProfiles } from "@/lib/integrity";
import { Timeline } from "@/components/integrity/Timeline";
import { MockBanner, MockStamp, PageHeader, RatingBadge, VettingPill } from "@/components/integrity/ui";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getProfiles().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const p = getProfile(params.slug);
  return {
    title: p ? `${p.fullName} · Scoring sandbox` : "Scoring sandbox",
    robots: { index: false, follow: false },
  };
}

function FindingCard({ f, windowStart }: { f: Finding; windowStart: string }) {
  const counts = STATUS_POINTS[f.status] > 0;
  const outside = f.date < windowStart;
  const pts = outside ? 0 : findingPoints(f);
  return (
    <article className={`mz-card p-4 ${outside ? "opacity-60" : ""}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-mz-muted">
        <time dateTime={f.date}>{formatDate(f.date)}</time>
        <span>·</span>
        <span>{f.entity}</span>
        {f.amountKes !== undefined && (
          <>
            <span>·</span>
            <span>{formatKes(f.amountKes)}</span>
          </>
        )}
        <MockStamp />
      </div>
      <h4 className="font-semibold">{f.title}</h4>
      <p className="mt-1 text-sm text-mz-muted">{f.summary}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <a href={f.source.url} target="_blank" rel="noopener noreferrer" className="mz-link">
          {f.source.label} portal · ref {f.source.reference}
        </a>
        <span className={`font-semibold ${outside ? "text-mz-muted" : counts ? "text-mz-text" : "text-mz-green"}`}>
          {outside
            ? `Excluded: older than ${LOOKBACK_YEARS} years`
            : counts
              ? `+${pts.toFixed(1)} pts${f.attribution !== "direct" ? ` · ${f.attribution.replace("_", " ")} ×${ATTRIBUTION_WEIGHT[f.attribution]}` : ""}`
              : "0 pts · cleared or resolved"}
        </span>
      </div>
    </article>
  );
}

export default function ProfilePage({ params }: Props) {
  const p = getProfile(params.slug);
  if (!p) notFound();
  const r = p.rating;
  const outside = p.findings.filter((f) => f.date < r.windowStart);
  const maxPts = Math.max(1, ...r.byChannel.map((c) => c.points));

  return (
    <main>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Civic Tech Tools", href: "/civic-tech" },
          { label: "Scoring sandbox", href: "/integrity/" },
          { label: p.fullName },
        ]}
        title={p.fullName}
        lede={<span className="font-medium text-mz-text">{p.currentRole}</span>}
      />
      <MockBanner compact />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="mz-eyebrow">Integrity rating</p>
              <MockStamp />
            </div>
            <RatingBadge band={r.band} score={r.score} size="lg" />
            <p className="mt-2 text-xs text-mz-muted">
              Window {formatDate(r.windowStart)} – {formatDate(r.windowEnd)}. {r.inWindow.length} record
              {r.inWindow.length === 1 ? "" : "s"} in window
              {r.excludedOutsideWindow > 0 && `, ${r.excludedOutsideWindow} older excluded`}.
            </p>
          </div>

          <div>
            <p className="mz-eyebrow mb-2">Points by source</p>
            <ul className="space-y-2">
              {r.byChannel.map((c) => (
                <li key={c.channel}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: CHANNEL_META[c.channel].color }} className="font-semibold">
                      {CHANNEL_META[c.channel].short}
                    </span>
                    <span className="text-mz-muted">
                      {c.points} pts · {c.findings} rec
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-mz-subtle">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${(c.points / maxPts) * 100}%`, background: CHANNEL_META[c.channel].color }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mz-card p-4 text-sm">
            <p className="font-semibold">What this rating means</p>
            <p className="mt-1 text-mz-muted">
              {r.band === "clear"
                ? "No record in the four monitored sources carries points in the lookback window. Cleared and resolved matters are listed for completeness and count for nothing."
                : `${BAND_LABEL[r.band]} reflects the status of institutional records, not a finding of guilt. An opened file or audit query is not a conviction.`}
            </p>
            <Link href="/integrity/methodology" className="mz-link mt-2 inline-block">
              Methodology
            </Link>
          </div>
        </aside>

        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="mb-3 text-xl font-bold text-mz-red">{LOOKBACK_YEARS}-year record</h2>
            <div className="mz-card p-4">
              <Timeline findings={p.findings} windowStart={r.windowStart} windowEnd={r.windowEnd} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-mz-red">Findings by source</h2>
            <div className="space-y-6">
              {CHANNELS.map((c) => {
                const rows = r.inWindow.filter((f) => f.channel === c);
                return (
                  <div key={c}>
                    <h3 className="mb-2 flex items-center gap-2 font-semibold" style={{ color: CHANNEL_META[c].color }}>
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ background: CHANNEL_META[c].color }} />
                      {CHANNEL_META[c].long}
                    </h3>
                    {rows.length === 0 ? (
                      <p className="rounded-mz border border-dashed border-mz-border px-4 py-3 text-sm text-mz-muted">
                        No records in the {LOOKBACK_YEARS}-year window.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {rows.map((f) => (
                          <FindingCard key={f.id} f={f} windowStart={r.windowStart} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {outside.length > 0 && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-semibold text-mz-muted">
                  {outside.length} record{outside.length === 1 ? "" : "s"} older than {LOOKBACK_YEARS} years (not rated)
                </summary>
                <div className="mt-3 space-y-3">
                  {outside.map((f) => (
                    <FindingCard key={f.id} f={f} windowStart={r.windowStart} />
                  ))}
                </div>
              </details>
            )}
          </section>

          <section>
            <h2 className="mb-1 text-xl font-bold text-mz-red">Appointment and vetting history</h2>
            <p className="mb-3 text-xs text-mz-muted">Synthetic appointment history generated for the sandbox.</p>
            <div className="overflow-x-auto rounded-mz border border-mz-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-mz-subtle text-xs uppercase tracking-wide text-mz-muted">
                  <tr>
                    <th className="px-4 py-2 font-semibold">From</th>
                    <th className="px-4 py-2 font-semibold">Office</th>
                    <th className="px-4 py-2 font-semibold">Vetting</th>
                  </tr>
                </thead>
                <tbody>
                  {p.appointments.map((a) => (
                    <tr key={`${a.office}-${a.from}`} className="border-t border-mz-border align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-mz-muted">
                        {formatDate(a.from)}
                        {a.to && <span className="block text-xs">to {formatDate(a.to)}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{a.office}</span>, {a.portfolio}
                        {a.note && <span className="block text-xs text-mz-muted">{a.note}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <VettingPill outcome={a.vetting} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.notes.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-sm text-mz-muted">
                {p.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </section>

          <section className={`rounded-mz border-l-4 ${BAND_STYLE[r.band].ring} bg-mz-subtle p-4 text-sm`}>
            <p className="font-semibold">Right of reply (proposed rule)</p>
            <p className="mt-1 text-mz-muted">
              Before any live rating is published, the profiled person is notified and given time to respond.
              Responses appear beside the record they address.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
