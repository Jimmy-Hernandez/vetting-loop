import type { Metadata } from "next";
import Link from "next/link";
import { PEOPLE } from "@vetting-loop/ledger";
import { ReceiptCheck, TipForm } from "@/components/TipForm";
import { Callout, PageHeader } from "@/components/ledger/ui";
import { REVIEWER_FINGERPRINT } from "@/lib/reviewer-key";

export const metadata: Metadata = { title: "Report securely" };

const STEPS = [
  ["You write", "Your tip stays in this page. Nothing is sent while you type, and nothing is saved in your browser."],
  ["Your browser seals it", "A one-time key is generated on your device and the tip is encrypted to the reviewers' public key (ECDH P-256, AES-256-GCM)."],
  ["We store ciphertext", "The server keeps only the sealed box and a random receipt. It never sees your words, does not store your IP address, and sets no cookie."],
  ["Reviewers open it offline", "Only the reviewers' private key, which is never on the server, can open the box. Verified facts enter the ledger with a public source."],
];

export default function ReportPage() {
  const records = [...PEOPLE].sort((a, b) => a.name.localeCompare(b.name)).map((p) => ({ slug: p.slug, name: p.name }));
  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Report securely" }]}
        title="Report securely"
        lede="Send a correction, a missing appointment, or a lead on a vetting record. Your message is encrypted on your own device before it leaves. We cannot read it in transit or at rest, and we do not know who sent it."
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mz-card p-6 md:p-8">
            <TipForm records={records} />
          </div>
          <div className="mt-6 mz-card p-6">
            <p className="mb-3 text-sm font-semibold">Check a receipt</p>
            <ReceiptCheck />
          </div>
        </div>
        <aside className="space-y-5">
          <ol className="space-y-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mz-red text-xs font-bold text-white">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold">{t}</p>
                  <p className="text-sm text-mz-muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <Callout tone="warn" title="If you are at risk">
            Use a device and network that are not linked to your work. Tor Browser hides your network location from everyone, including us. Do not include
            details that only you could know unless you intend reviewers to identify you.
          </Callout>
          <div className="mz-card p-5 text-xs text-mz-muted">
            <p className="mz-eyebrow mb-2">Reviewer key fingerprint</p>
            <p className="font-mono text-base font-bold text-mz-text">{REVIEWER_FINGERPRINT}</p>
            <p className="mt-2">Compare it with the fingerprint published in the project repository, a separate channel from this site. If they differ, do not send.</p>
            <p className="mt-2"><Link href="/privacy/" className="mz-link">Full privacy architecture</Link></p>
          </div>
        </aside>
      </div>
    </main>
  );
}
