import Link from "next/link";
import { LEDGER_COMPILED } from "@vetting-loop/ledger";
import { MANIFEST, fmtDate } from "@/lib/ledger";
import { TOOL_NAV } from "./NavBar";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 bg-[#0f0f0f] text-white/80">
      <div className="mz-accent-strip" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm md:grid-cols-[1.3fr_1fr_1.3fr]">
        <div>
          <p className="text-base font-bold text-mz-red">Vetting Record</p>
          <p className="mt-2 text-white/55 leading-relaxed">
            A public record of who was nominated to Kenyan public office, who was vetted, who was approved, and where they went
            next. Built as a prototype for Mzalendo&apos;s Civic Tech Tools by Agent9. Not an official Mzalendo service.
          </p>
          <p className="mt-4 text-xs text-white/40">
            No cookies. No analytics. No third-party requests.{" "}
            <Link className="underline underline-offset-2 hover:text-white transition-colors" href="/privacy/">How this site protects you</Link>
          </p>
        </div>
        <div>
          <p className="mz-eyebrow mb-3 text-white/40">The tool</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {TOOL_NAV.map((t) => (
              <li key={t.href}><Link className="text-white/65 hover:text-white transition-colors" href={t.href}>{t.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mz-eyebrow mb-3 text-white/40">Data notice</p>
          <p className="text-white/55 leading-relaxed">
            Appointment records are facts from published sources, each labelled with its verification tier. Pattern signals describe
            the appointment process, never a person&apos;s conduct. Integrity scores appear only in the synthetic sandbox.
          </p>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-white/35">
            Ledger compiled {fmtDate(LEDGER_COMPILED)} · {MANIFEST.records} records
            <br />
            root sha256 {MANIFEST.root.slice(0, 16)}…{" "}
            <Link className="underline hover:text-white/70 transition-colors" href="/resilience/">verify</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
