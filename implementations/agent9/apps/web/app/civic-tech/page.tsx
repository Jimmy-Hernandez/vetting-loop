import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/integrity/ui";

export const metadata: Metadata = {
  title: "Civic Tech Tools",
};

const MZ = "https://mzalendo.com";

const TOOLS: Array<{ name: string; href: string; blurb: string; icon: React.ReactNode; badge?: string }> = [
  {
    name: "Vetting Record",
    href: "/",
    badge: "New",
    blurb: "Who was nominated, vetted and approved to public office, linked per person, with pattern signals and a secure tip line.",
    icon: (
      <svg viewBox="0 0 64 64" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M32 6 10 14v16c0 14 9.5 24 22 28 12.5-4 22-14 22-28V14L32 6Z" fill="currentColor" fillOpacity=".12" />
        <path d="m22 32 7 7 13-14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Promise Tracker",
    href: "https://tracker.mzalendo.com",
    blurb: "Mzalendo's tracker of political commitments.",
    icon: (
      <svg viewBox="0 0 64 64" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="4">
        <circle cx="32" cy="32" r="24" />
        <circle cx="32" cy="32" r="12" />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Hansard",
    href: `${MZ}/democracy-tools/hansard/`,
    blurb: "Mzalendo's searchable record of parliamentary debate.",
    icon: (
      <svg viewBox="0 0 64 64" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M14 6h28l10 10v42H14Z" fill="currentColor" fillOpacity=".12" />
        <path d="M22 26h20M22 34h20M22 42h14" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function CivicTechPage() {
  return (
    <main>
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Civic Tech Tools" }]} title="Democracy Tools" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[220px_1fr]">
        <aside className="md:border-r md:border-mz-border md:pr-6">
          <p className="mz-eyebrow mb-3 flex items-center gap-2 text-mz-text">
            <span className="text-mz-red">✚</span> Civic Tech Tools
          </p>
          <ul className="space-y-1 text-sm">
            {TOOLS.map((t) => (
              <li key={t.name}>
                <Link href={t.href} className="flex items-center justify-between rounded-mz px-2 py-2 hover:bg-mz-subtle hover:text-mz-red">
                  {t.name}
                  {t.badge && <span className="rounded-mz bg-mz-green px-1.5 text-[10px] font-bold uppercase text-white">{t.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.name}
              href={t.href}
              className="mz-card relative flex flex-col items-center rounded-xl p-8 text-center text-mz-maroon transition hover:shadow-md"
            >
              {t.badge && (
                <span className="absolute right-3 top-3 rounded-mz bg-mz-green px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  {t.badge}
                </span>
              )}
              {t.icon}
              <span className="mt-4 text-lg font-bold text-mz-red">{t.name}</span>
              <span className="mt-2 text-sm text-mz-muted">{t.blurb}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
