import * as React from "react";
import Link from "next/link";
import type { SignalId, Verification } from "@vetting-loop/ledger";
import { SIGNAL_TONE, VERIFICATION_META, initialsOf, signalLabel } from "@/lib/ledger";

export { PageHeader } from "@/components/integrity/ui";

export function SignalChip({ id, link = false }: { id: SignalId; link?: boolean }) {
  const t = SIGNAL_TONE[id];
  const body = (
    <>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden />
      {signalLabel(id)}
    </>
  );
  return link ? (
    <Link href={`/signals/#${id}`} className={`mz-chip ${t.chip} hover:brightness-95`}>{body}</Link>
  ) : (
    <span className={`mz-chip ${t.chip}`}>{body}</span>
  );
}

export function VerificationTag({ v }: { v: Verification }) {
  const m = VERIFICATION_META[v];
  return (
    <span title={m.blurb} className={`mz-chip ${m.className}`}>
      {v === "gazette_verified" ? "✓" : v === "cross_checked" ? "◐" : "○"} {m.label}
    </span>
  );
}

export function Monogram({ name, tone = "red", size = "md" }: { name: string; tone?: "red" | "green" | "muted"; size?: "md" | "lg" }) {
  const ring = tone === "red" ? "border-mz-red text-mz-red" : tone === "green" ? "border-mz-green text-mz-green" : "border-mz-border text-mz-muted";
  const dims = size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm";
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full border-2 bg-white font-bold ${ring} ${dims}`}>
      {initialsOf(name)}
    </span>
  );
}

export function Stat({ value, label, note, href, tone = "green" }: { value: React.ReactNode; label: string; note?: React.ReactNode; href?: string; tone?: "green" | "red" }) {
  return (
    <div className={`rounded-mz border border-mz-border border-t-4 bg-white p-5 ${tone === "red" ? "border-t-mz-red" : "border-t-mz-green"}`}>
      <p className={`text-4xl font-extrabold tracking-tight ${tone === "red" ? "text-mz-red" : "text-mz-green"}`}>{value}</p>
      <p className="mt-2 text-sm font-semibold leading-snug text-mz-text">{label}</p>
      {note && <p className="mt-1 text-xs leading-relaxed text-mz-muted">{note}</p>}
      {href && (
        <Link href={href} className="mt-3 inline-block text-xs font-semibold text-mz-red hover:underline">
          See the records →
        </Link>
      )}
    </div>
  );
}

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warn" | "fix"; title: string; children: React.ReactNode }) {
  const styles = {
    info: "border-sky-300 bg-sky-50 text-sky-950",
    warn: "border-amber-300 bg-amber-50 text-amber-950",
    fix: "border-mz-green/50 bg-green-50 text-green-950",
  }[tone];
  return (
    <aside role="note" className={`rounded-mz border-l-4 p-4 text-sm ${styles}`}>
      <p className="mb-1 font-bold">{title}</p>
      <div className="leading-relaxed">{children}</div>
    </aside>
  );
}

export function SectionTitle({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: React.ReactNode }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow && <p className="mz-eyebrow mb-2 text-mz-green">{eyebrow}</p>}
      <h2 className="mz-h2">{title}</h2>
      {lede && <div className="mt-3 text-mz-muted">{lede}</div>}
    </div>
  );
}

export function Hash({ value, full = false }: { value: string; full?: boolean }) {
  return (
    <code className="mz-mono break-all rounded bg-mz-subtle px-1.5 py-0.5 text-mz-muted" title={value}>
      {full ? value : `${value.slice(0, 12)}…${value.slice(-6)}`}
    </code>
  );
}
