import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  APPEARANCE_LABEL,
  LEDGER_COMPILED,
  OFFICE_LABEL,
  OUTCOME_LABEL,
  PEOPLE,
  PERSON_BY_SLUG,
  SIGNAL_BY_ID,
  SOURCE_BY_ID,
  detect,
  toTemplate,
  type Appointment,
} from "@vetting-loop/ledger";
import { Callout, Hash, Monogram, PageHeader, SignalChip, VerificationTag } from "@/components/ledger/ui";
import { MANIFEST, apptDate, cycleLabel, fmtDate } from "@/lib/ledger";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const p = PERSON_BY_SLUG.get(params.slug);
  return { title: p ? `${p.name}: appointment record` : "Record not found" };
}

const OUTCOME_STYLE: Record<Appointment["outcome"], string> = {
  approved: "bg-mz-green text-white",
  rejected: "bg-mz-red text-white",
  declined: "bg-slate-600 text-white",
  not_vetted: "bg-amber-600 text-white",
  reassigned: "bg-white text-mz-text border border-mz-border",
  unrecorded: "bg-white text-mz-muted border border-dashed border-mz-border",
};

function Milestones({ a }: { a: Appointment }) {
  const steps: Array<[string, string | undefined]> = [
    ["Nominated", a.nominated],
    ["Decided", a.decided],
    ["In office", a.from],
    ["Left", a.to],
  ];
  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
      {steps.map(([k, v]) => (
        <div key={k}>
          <dt className="text-mz-muted">{k}</dt>
          <dd className={`font-semibold ${v ? "text-mz-text" : "text-mz-border"}`}>{fmtDate(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PersonPage({ params }: Props) {
  const p = PERSON_BY_SLUG.get(params.slug);
  if (!p) notFound();
  const hits = detect(p);
  const timeline = [...p.appointments].sort((x, y) => apptDate(y).localeCompare(apptDate(x)));
  const sourceIds = [...new Set(p.appointments.flatMap((a) => a.sources))];
  const nostr = toTemplate(p, LEDGER_COMPILED);
  const hash = MANIFEST.hashes[p.slug]!;

  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Ledger", href: "/ledger/" }, { label: p.name }]}
        title={p.name}
        lede={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-mz-text">{p.latestRole}</span>
            {[...new Set(hits.map((h) => h.signal))].map((s) => <SignalChip key={s} id={s} link />)}
          </span>
        }
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-5 text-xl font-bold text-mz-red">Appointment history</h2>
          <ol className="relative space-y-6 border-l-2 border-mz-border pl-7">
            {timeline.map((a) => (
              <li key={a.id} className="relative">
                <span className={`absolute -left-[37px] top-4 h-4 w-4 rounded-full border-4 border-white ${a.outcome === "rejected" ? "bg-mz-red" : a.outcome === "approved" ? "bg-mz-green" : "bg-slate-400"}`} aria-hidden />
                <article className="mz-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="mz-eyebrow">{cycleLabel(a)} · {OFFICE_LABEL[a.office]}</p>
                      <h3 className="mt-1 text-lg font-bold">{a.portfolio}</h3>
                    </div>
                    <span className={`rounded-mz px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${OUTCOME_STYLE[a.outcome]}`}>{OUTCOME_LABEL[a.outcome]}</span>
                  </div>
                  <Milestones a={a} />
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`mz-chip ${a.appearance === "did_not_appear" ? "border-mz-red/40 text-mz-red" : "border-mz-border text-mz-muted"}`}>{APPEARANCE_LABEL[a.appearance]}</span>
                    {a.committeeRecommendation === "reject" && <span className="mz-chip border-mz-red/40 text-mz-red">Committee recommended rejection</span>}
                    {a.exit && <span className="mz-chip border-mz-border text-mz-muted">Exit: {a.exit}</span>}
                    <VerificationTag v={a.verification} />
                  </div>
                  {a.statedGrounds && (
                    <blockquote className="mt-4 border-l-4 border-mz-red bg-red-50/50 px-4 py-2 text-sm italic">
                      &ldquo;{a.statedGrounds}&rdquo;
                      <span className="mt-1 block text-xs not-italic text-mz-muted">Stated grounds, verbatim</span>
                    </blockquote>
                  )}
                  {a.gazettedWithoutApproval && (
                    <p className="mt-3 text-sm text-mz-red">Gazetted in {a.gazettedWithoutApproval.notice}; revoked by {a.gazettedWithoutApproval.revokedBy}.</p>
                  )}
                  {a.note && <p className="mt-3 text-sm leading-relaxed text-mz-muted">{a.note}</p>}
                  <p className="mt-3 text-xs text-mz-muted">
                    Sources:{" "}
                    {a.sources.map((id, i) => {
                      const s = SOURCE_BY_ID.get(id)!;
                      return (
                        <span key={id}>
                          {i > 0 && " · "}
                          <a href={s.url} rel="noopener noreferrer" className="mz-link">{s.publisher}, {fmtDate(s.date)}</a>
                        </span>
                      );
                    })}
                  </p>
                </article>
              </li>
            ))}
          </ol>

          {hits.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-bold text-mz-red">Pattern signals on this record</h2>
              <div className="space-y-3">
                {hits.map((h) => (
                  <div key={`${h.signal}-${h.appointmentIds.join()}`} className="mz-card p-4">
                    <SignalChip id={h.signal} link />
                    <p className="mt-2 text-sm">{h.detail}</p>
                    <p className="mt-1 text-xs text-mz-muted">Rule: {SIGNAL_BY_ID.get(h.signal)!.rule}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <div className="mz-card flex items-center gap-4 p-5">
            <Monogram name={p.name} size="lg" tone={hits.length ? "red" : "green"} />
            <div className="text-sm">
              <p className="font-bold">{p.appointments.length} appointment{p.appointments.length === 1 ? "" : "s"}</p>
              <p className="text-mz-muted">{hits.length} signal{hits.length === 1 ? "" : "s"} · {sourceIds.length} sources</p>
            </div>
          </div>
          <Callout tone="info" title="How to read this record">
            Signals describe the appointment process, not the person. A record with no signals is not an endorsement; a record with signals is not an
            accusation. Spot an error? <Link href="/report/" className="mz-link">Tell us securely</Link>.
          </Callout>
          <div className="mz-card p-5 text-xs">
            <p className="mz-eyebrow mb-2">Record integrity</p>
            <p className="text-mz-muted">sha256 of the canonical record</p>
            <p className="mt-1"><Hash value={hash} full /></p>
            <p className="mt-3 text-mz-muted">Nostr address (kind {nostr.kind})</p>
            <p className="mt-1"><code className="mz-mono break-all">{nostr.tags[0]![1]}</code></p>
            <p className="mt-3 text-mz-muted">
              Any mirror serving this record must reproduce this hash. <Link href="/resilience/" className="mz-link">How to verify</Link>
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
