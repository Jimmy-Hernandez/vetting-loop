import type { Metadata } from "next";
import Link from "next/link";
import { Callout, PageHeader, SectionTitle } from "@/components/ledger/ui";
import { REVIEWER_FINGERPRINT } from "@/lib/reviewer-key";

export const metadata: Metadata = { title: "Privacy architecture" };

const CONTROLS: Array<{ area: string; control: string; enforced: string }> = [
  { area: "Tips in transit and at rest", control: "Sealed in the browser: ephemeral ECDH P-256 → HKDF-SHA256 → AES-256-GCM. The server holds ciphertext only.", enforced: "packages/sealed, 7 unit tests including tamper and wrong-key cases" },
  { area: "Reviewer key", control: "Private key held offline by reviewers, never deployed. Public key fingerprint shown on every tip form.", enforced: "Only the public JWK is in the repository" },
  { area: "Identity of reporters", control: "No accounts, no cookies, no IP storage. Rate limiting uses sha256(IP + daily salt), which expires in 24 hours and is never stored with a tip.", enforced: "functions/api/tips.ts" },
  { area: "Tip retention", control: "Sealed tips expire automatically after 180 days. Receipts reveal only a status, never content.", enforced: "KV expirationTtl" },
  { area: "Tracking", control: "No analytics, no third-party scripts, fonts or images. The site makes no request to any other origin.", enforced: "Content-Security-Policy: default-src 'self'" },
  { area: "Referrers", control: "Outbound links send no referrer, so source sites cannot see which records readers checked.", enforced: "Referrer-Policy: no-referrer" },
  { area: "Device APIs", control: "Camera, microphone, location, payment and interest-cohort APIs disabled.", enforced: "Permissions-Policy" },
  { area: "Search and filtering", control: "The ledger is filtered in the browser. Searches never leave the device.", enforced: "Static export; no search endpoint exists" },
  { area: "People in the record", control: "Only public facts about public offices. No ratings of real people; integrity scoring runs on synthetic subjects only. Pages are not indexed while in prototype.", enforced: "Ledger tests assert no score, rating or allegation fields" },
];

export default function PrivacyPage() {
  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Privacy" }]}
        title="Privacy architecture"
        lede="Accountability tools attract two kinds of risk: to the people who report, and to the people reported on. This design limits both by construction rather than by policy."
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="mz-card border-t-4 border-t-mz-red p-6">
            <h2 className="text-lg font-bold">For people who report</h2>
            <p className="mt-2 text-sm text-mz-muted">
              A reporter&apos;s safety cannot depend on the operator&apos;s good behaviour. The server is designed so that seizing it, subpoenaing it, or
              compromising it yields ciphertext, random receipts, and nothing that links a tip to a person.
            </p>
          </div>
          <div className="mz-card border-t-4 border-t-mz-green p-6">
            <h2 className="text-lg font-bold">For people in the record</h2>
            <p className="mt-2 text-sm text-mz-muted">
              Officials are named only beside public facts about public offices, each with a source and a verification tier. Signals describe the
              process. Nothing on this site rates, ranks or accuses a real person.
            </p>
          </div>
        </div>

        <section className="mt-14">
          <SectionTitle eyebrow="Controls" title="What protects whom, and where it is enforced" />
          <div className="overflow-hidden rounded-mz border border-mz-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-mz-subtle text-xs uppercase tracking-wider text-mz-muted">
                <tr><th className="px-4 py-3">Area</th><th className="px-4 py-3">Control</th><th className="hidden px-4 py-3 md:table-cell">Enforced by</th></tr>
              </thead>
              <tbody className="divide-y divide-mz-border bg-white">
                {CONTROLS.map((c) => (
                  <tr key={c.area} className="align-top">
                    <td className="px-4 py-3 font-semibold">{c.area}</td>
                    <td className="px-4 py-3 text-mz-muted">{c.control}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-mz-muted md:table-cell">{c.enforced}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="mz-card p-6 text-sm">
            <h2 className="mb-3 text-lg font-bold text-mz-red">The sealed box</h2>
            <pre className="overflow-x-auto rounded-mz bg-mz-text p-4 font-mono text-xs leading-relaxed text-white/90">{`browser                              server              reviewers (offline)
───────                              ──────              ───────────────────
tip ─┐
     ├─ ephemeral P-256 key pair
     ├─ ECDH(eph_priv, reviewer_pub)
     ├─ HKDF-SHA256 → AES-256 key
     └─ AES-GCM(tip) ──{epk,iv,ct}──▶ store ct + receipt
                                        (no IP, no cookie)
                                                    ──▶ ECDH(rev_priv, epk)
                                                        AES-GCM open → tip`}</pre>
            <p className="mt-3 text-mz-muted">Reviewer key fingerprint: <strong className="font-mono text-mz-text">{REVIEWER_FINGERPRINT}</strong></p>
          </div>
          <div className="space-y-4">
            <Callout tone="info" title="What we can see">
              That a tip arrived, its size, and the month it arrived. Cloudflare terminates the connection, so its edge sees network metadata as any
              host would; the application does not record it.
            </Callout>
            <Callout tone="warn" title="What this does not protect against">
              A compromised device, someone watching your screen, or a tip whose content identifies you. For high-risk reports use Tor Browser on a
              device not linked to you.
            </Callout>
            <Callout tone="fix" title="Planned next">
              Tip delivery over Nostr encrypted direct messages (NIP-17 / NIP-44), so reporters can reach reviewers even if this site is offline. See{" "}
              <Link href="/resilience/" className="mz-link">Resilience</Link>.
            </Callout>
          </div>
        </section>
      </div>
    </main>
  );
}
