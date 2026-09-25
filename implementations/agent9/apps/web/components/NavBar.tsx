import * as React from "react";
import Link from "next/link";

const MZ = "https://mzalendo.com";

type Item = { label: string; href: string; badge?: string };

// Mirrors mzalendo.com's primary navigation so the tool drops into
// "Civic Tech Tools" without changing the host site's information architecture.
const MENU: Array<{ label: string; href: string; children?: Item[] }> = [
  { label: "About", href: `${MZ}/about/` },
  { label: "MPs Performance", href: `${MZ}/mps-performance/` },
  { label: "Elections Watch 2027", href: `${MZ}/elections-2027/` },
  {
    label: "Civic Tech Tools",
    href: "/civic-tech/",
    children: [
      { label: "Vetting Record", href: "/", badge: "New" },
      { label: "Promise Tracker", href: "https://tracker.mzalendo.com" },
      { label: "Bonga na Mzalendo", href: `${MZ}/democracy-tools/bonga/` },
      { label: "Hansard", href: `${MZ}/democracy-tools/hansard/` },
      { label: "Ask Mzalendo Bot", href: MZ },
      { label: "AI Search", href: MZ },
    ],
  },
  { label: "Bunge AI-Watch", href: MZ },
  { label: "Research & Knowledge", href: `${MZ}/research-and-knowledge/` },
  { label: "Media Centre", href: MZ },
  { label: "Contact", href: `${MZ}/contact/` },
];

/** Section navigation for the tool itself. */
export const TOOL_NAV: Item[] = [
  { label: "Overview", href: "/" },
  { label: "Ledger", href: "/ledger/" },
  { label: "Signals", href: "/signals/" },
  { label: "Vetting gate", href: "/cycles/" },
  { label: "Scoring sandbox", href: "/integrity/" },
  { label: "Report securely", href: "/report/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Resilience", href: "/resilience/" },
];

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Vetting Record home">
      <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden>
        <circle cx="24" cy="24" r="24" fill="#bd1419" />
        <path d="M14 25.5 21 32l13-15" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="19" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
      <span className="leading-tight">
        <span className="block text-[17px] font-bold tracking-tight text-mz-red">Vetting Record</span>
        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mz-green">Civic Tech Tools</span>
      </span>
    </Link>
  );
}

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-mz-border mz-glass">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3" aria-label="Primary">
        <Logo />

        <ul className="hidden items-center xl:flex">
          {MENU.map((item) => (
            <li key={item.label} className="group relative">
              <Link
                href={item.href}
                className={`block px-2.5 py-2 text-[13px] font-semibold tracking-tight transition-colors duration-250 hover:text-mz-red group-hover:text-mz-red ${
                  item.children ? "text-mz-red" : "text-mz-text"
                }`}
              >
                {item.label}
                {item.children && <span className="ml-1 text-[9px] opacity-60">▾</span>}
              </Link>
              {item.children && (
                <ul className="invisible absolute left-0 top-full min-w-[260px] rounded-card border border-mz-border bg-white py-2 opacity-0 shadow-card-hover transition-all duration-250 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {item.children.map((c) => (
                    <li key={c.label}>
                      <Link href={c.href} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-mz-subtle hover:text-mz-red transition-colors duration-250">
                        {c.label}
                        {c.badge && <span className="rounded-pill bg-mz-green px-2 py-0.5 text-[9px] font-bold uppercase text-white">{c.badge}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <details className="group relative xl:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-card border border-mz-border px-3 py-2 text-sm font-semibold text-mz-text marker:hidden hover:border-mz-red hover:text-mz-red transition-colors duration-250">
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              Menu
            </summary>
            <div className="absolute right-0 top-full mt-2 w-72 rounded-card border border-mz-border bg-white p-2 shadow-card-hover">
              <p className="mz-eyebrow px-3 pb-1 pt-2">Vetting Record</p>
              {TOOL_NAV.map((t) => (
                <Link key={t.href} href={t.href} className="block rounded-card px-3 py-2 text-sm font-medium hover:bg-mz-subtle hover:text-mz-red transition-colors duration-250">{t.label}</Link>
              ))}
              <p className="mz-eyebrow border-t border-mz-border px-3 pb-1 pt-3">Mzalendo</p>
              {MENU.filter((m) => !m.children).map((m) => (
                <Link key={m.label} href={m.href} className="block rounded-card px-3 py-2 text-sm text-mz-muted hover:bg-mz-subtle hover:text-mz-red transition-colors duration-250">{m.label}</Link>
              ))}
            </div>
          </details>
        </div>
      </nav>
      <div className="border-t border-mz-border bg-white/60">
        <ul className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 text-[12.5px] md:flex">
          {TOOL_NAV.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="block whitespace-nowrap border-b-2 border-transparent px-3 py-2 font-semibold text-mz-muted hover:border-mz-red hover:text-mz-red transition-colors duration-250">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
