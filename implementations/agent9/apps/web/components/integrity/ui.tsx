import * as React from "react";
import Link from "next/link";
import { BAND_LABEL, type RatingBand } from "@vetting-loop/integrity";
import { BAND_STYLE, initials } from "@/lib/integrity";

export function MockBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div role="note" className="border-y border-amber-200 bg-amber-50/80">
      <div className={`mx-auto max-w-7xl px-4 ${compact ? "py-2" : "py-3"} text-sm text-amber-900`}>
        <strong className="mr-2 rounded-pill bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
          Mock data
        </strong>
        Every subject, rating and finding on these pages is synthetic, generated to demonstrate the scoring method. None
        describes a real person, investigation, audit or hearing. Real findings will attach only with a document reference
        a reader can open.
      </div>
    </div>
  );
}

export function MockStamp() {
  return (
    <span className="rounded-mz border border-amber-400 bg-amber-50 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-amber-700">
      Mock
    </span>
  );
}

export function PageHeader({
  crumbs,
  title,
  lede,
}: {
  crumbs: Array<{ label: string; href?: string }>;
  title: string;
  lede?: React.ReactNode;
}) {
  return (
    <section className="relative border-b border-mz-border bg-gradient-to-b from-mz-subtle to-white">
      <div className="mz-accent-strip" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {i > 0 && <span className="mx-2 text-mz-border">/</span>}
              {c.href ? (
                <Link href={c.href} className="font-medium text-mz-green hover:underline transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="font-semibold text-mz-text">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-mz-red md:text-4xl lg:text-5xl">{title}</h1>
        {lede && <div className="mt-3 max-w-3xl text-base leading-relaxed text-mz-muted">{lede}</div>}
      </div>
    </section>
  );
}

export function RatingBadge({ band, score, size = "sm" }: { band: RatingBand; score: number; size?: "sm" | "lg" }) {
  const s = BAND_STYLE[band];
  if (size === "lg") {
    return (
      <div className={`rounded-card border-2 ${s.ring} bg-white p-6 text-center shadow-card`}>
        <div className={`text-6xl font-extrabold tabular-nums tracking-tight ${s.text}`}>{score}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-mz-muted">of 100 · risk score</div>
        <div className={`mt-4 inline-block rounded-pill ${s.bg} px-4 py-1.5 text-sm font-bold tracking-tight text-white shadow-sm`}>
          {BAND_LABEL[band]}
        </div>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={`inline-block min-w-[2.5rem] rounded-pill ${s.bg} px-2 py-0.5 text-center text-xs font-bold tabular-nums text-white shadow-inner`}>
        {score}
      </span>
      <span className={`text-sm font-semibold ${s.text}`}>{BAND_LABEL[band]}</span>
    </span>
  );
}

export function Avatar({ name, band }: { name: string; band: RatingBand }) {
  return (
    <span
      aria-hidden
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border-2 ${BAND_STYLE[band].ring} bg-mz-subtle text-sm font-bold text-mz-text shadow-inner`}
    >
      {initials(name)}
    </span>
  );
}

export function VettingPill({ outcome }: { outcome: string }) {
  const styles: Record<string, string> = {
    approved: "bg-green-50 text-mz-green border-green-200 shadow-inner",
    rejected: "bg-red-50 text-mz-red border-red-200 shadow-inner",
    withdrawn: "bg-neutral-50 text-mz-muted border-mz-border",
    not_vetted: "bg-neutral-50 text-mz-muted border-mz-border",
  };
  return (
    <span className={`rounded-pill border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${styles[outcome] ?? styles.not_vetted}`}>
      {outcome.replace("_", " ")}
    </span>
  );
}
