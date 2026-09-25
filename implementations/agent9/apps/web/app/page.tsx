import Link from "next/link";
import { PEOPLE, SIGNALS, gateDecisions, gateStats, reconstitution2024, vacancies } from "@vetting-loop/ledger";
import { GateMatrix, ReconstitutionFlow } from "@/components/ledger/charts";
import { Callout, SectionTitle, SignalChip, Stat } from "@/components/ledger/ui";
import { MANIFEST, hitsBySignal } from "@/lib/ledger";

const PILLARS = [
  {
    title: "Evidence, not accusation",
    body: "Every entry is a dated public fact with its source and a verification tier. Signals are rules anyone can re-run by hand. Nothing here scores a real person.",
    href: "/signals/",
    cta: "How signals work",
  },
  {
    title: "Private by construction",
    body: "Tips are encrypted in your browser before they leave the device. The server stores ciphertext it cannot read. No accounts, no cookies, no trackers.",
    href: "/privacy/",
    cta: "Privacy architecture",
  },
  {
    title: "Hard to take down",
    body: "The whole site is static files. Every record carries a content hash and ships as a signed-ready Nostr event, so any mirror can serve it and anyone can verify it.",
    href: "/resilience/",
    cta: "Resilience plan",
  },
];

const PIPELINE = [
  { k: "Sources", v: "Gazette, Hansard, committee reports, dated press" },
  { k: "Ledger", v: "One linked record per person, every appointment cited" },
  { k: "Signals", v: "Deterministic rules over the record, no model guesses" },
  { k: "Record", v: "Per-person timelines, cycle views, verification tiers" },
  { k: "Mirrors", v: "Content-hashed JSON and Nostr events any relay can carry" },
];

export default function HomePage() {
  const gate = gateStats(PEOPLE);
  const r = reconstitution2024(PEOPLE);
  const [vacancy] = vacancies(PEOPLE);
  const decisions = gateDecisions(PEOPLE);
  const hits = hitsBySignal();
  const rate = ((gate.approved / gate.nominated) * 100).toFixed(1);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-mz-border bg-gradient-to-br from-white via-mz-subtle to-white">
        <div className="mz-accent-strip" />
        {/* Decorative radial glow */}
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-mz-red/5 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-mz-green/5 blur-3xl" aria-hidden />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="mz-rise">
            <p className="mz-eyebrow mb-4 text-mz-green">Civic Tech Tools · 13th Parliament</p>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-mz-red md:text-7xl">
              {gate.nominated} nominations.
              <br />
              <span className="text-mz-text">{gate.rejected === 1 ? "One" : gate.rejected} rejection.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mz-muted">
              Parliament vets every Cabinet Secretary and Principal Secretary before they take office. Vetting Record shows what that gate actually
              does: every nomination linked to the person, every fact cited, every pattern computed from the record rather than asserted.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ledger/" className="mz-btn-primary">Explore the ledger</Link>
              <Link href="/signals/" className="mz-btn-ghost">See the patterns</Link>
              <Link href="/report/" className="mz-btn-ghost">Report securely</Link>
            </div>
            <p className="mt-6 text-xs text-mz-muted">
              {PEOPLE.length} people · {PEOPLE.reduce((n, p) => n + p.appointments.length, 0)} appointments · {SIGNALS.length} signal rules · all records hash-sealed
            </p>
          </div>
          <div className="mz-card mz-rise-1 p-6 md:p-8">
            <p className="mz-eyebrow mb-1">The vetting gate, 2022–2024</p>
            <p className="mb-5 text-sm text-mz-muted">Cabinet 2022, Principal Secretaries 2022, and the 2024 Cabinet reconstitution.</p>
            <GateMatrix rows={gate.rows} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={`${rate}%`} label="Approval rate across three vetting cycles" note={`${gate.approved} of ${gate.nominated} nominees approved by the House.`} href="/cycles/" />
          <Stat tone="red" value={`${r.returnees} of ${r.approved}`} label="Approved in Aug 2024 had sat in the cabinet dissolved four weeks earlier" note={`${r.returneesAsCs} as Cabinet Secretaries, 1 as Attorney General. ${r.rotatedDocket} changed docket.`} href="/signals/#returnee" />
          <Stat tone="red" value={`${vacancy?.days ?? "—"} days`} label="Gender docket left vacant after the only House rejection" note="From the 7 Aug 2024 vote to the next nomination on 26 Mar 2025." href="/people/stella-soi-langat/" />
          <Stat value={decisions.overturned.length} label="Committee rejection overturned on the floor" note="In 2022 the House approved a nominee its own committee had rejected." href="/signals/#floor_override" />
        </div>
      </section>

      <section className="border-y border-mz-border bg-mz-subtle">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionTitle
              eyebrow="Dissolution without turnover"
              title="A mass dismissal that returned half the cabinet"
              lede={
                <>
                  On 11 Jul 2024, during the Finance Bill protests, the President dismissed the entire cabinet except the Prime CS. Within four weeks,
                  {` ${r.returnees} of the ${r.approved}`} nominees approved to replace it had been members of it.{" "}
                  <strong className="text-mz-text">{r.rotatedDocket} of those {r.returnees} simply changed ministry.</strong>
                </>
              }
            />
            <Callout tone="fix" title="Computed, not asserted">
              Working notes circulated with this project put the returnee figure at six of nineteen (32%). Six was the count in the first batch of
              eleven nominees on 19 Jul 2024. Linked across both batches, the ledger returns {r.returnees} of {r.approved} ({Math.round((r.returnees / r.approved) * 100)}%). A record that
              computes its own statistics catches errors like this before they reach print.
            </Callout>
          </div>
          <div className="mz-card p-5 md:p-6">
            <ReconstitutionFlow r={r} dissolved={22} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle
          eyebrow="Pattern signals"
          title="What the record shows when it is linked per person"
          lede="Each signal is a published rule over public facts. It flags a pattern in the appointment process worth scrutiny. It is never a finding about a person's conduct."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {SIGNALS.map((s) => (
            <Link key={s.id} href={`/signals/#${s.id}`} className="mz-card group flex flex-col p-5 transition hover:border-mz-red hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <SignalChip id={s.id} />
                <span className="text-2xl font-extrabold text-mz-text">{hits.get(s.id)?.length ?? 0}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mz-muted">{s.rule}</p>
              <span className="mt-auto pt-3 text-xs font-semibold text-mz-red opacity-0 transition group-hover:opacity-100">View matches →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-mz-text text-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="mz-eyebrow mb-2 text-emerald-300">Architecture</p>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">From public source to verifiable record</h2>
          <ol className="mt-10 grid gap-3 md:grid-cols-5">
            {PIPELINE.map((s, i) => (
              <li key={s.k} className="relative rounded-mz border border-white/15 bg-white/[0.04] p-4">
                <span className="text-xs font-bold text-emerald-300">0{i + 1}</span>
                <p className="mt-1 font-bold">{s.k}</p>
                <p className="mt-1 text-sm text-white/70">{s.v}</p>
                {i < PIPELINE.length - 1 && <span aria-hidden className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-white/40 md:block">›</span>}
              </li>
            ))}
          </ol>
          <p className="mt-6 font-mono text-xs text-white/50">manifest root sha256 {MANIFEST.root}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="mz-card border-t-4 border-t-mz-red p-6">
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mz-muted">{p.body}</p>
              <Link href={p.href} className="mt-4 inline-block text-sm font-semibold text-mz-red hover:underline">{p.cta} →</Link>
            </div>
          ))}
        </div>
        <blockquote className="mt-14 border-l-4 border-mz-green pl-5 text-lg italic text-mz-muted">
          &ldquo;The vetting gate only closes on nominees who walk through it.&rdquo;
          <span className="mt-1 block text-sm not-italic">From the project&apos;s vetting observations</span>
        </blockquote>
      </section>
    </main>
  );
}
