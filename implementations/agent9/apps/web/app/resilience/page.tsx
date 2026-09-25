import type { Metadata } from "next";
import Link from "next/link";
import { D_PREFIX, LEDGER_COMPILED, LEDGER_KIND, PERSON_BY_SLUG, toTemplate } from "@vetting-loop/ledger";
import { Callout, Hash, PageHeader, SectionTitle } from "@/components/ledger/ui";
import { MANIFEST, fmtDate } from "@/lib/ledger";

export const metadata: Metadata = { title: "Resilience and Nostr" };

const LAYERS: Array<{ layer: string; status: "live" | "ready" | "planned"; detail: string }> = [
  { layer: "Static site", status: "live", detail: "The whole site is a folder of static files. Any host, mirror or USB stick can serve it; there is no database to take down." },
  { layer: "Content hashes", status: "live", detail: "Every record has a sha256 over its canonical JSON, and a root hash covers the whole ledger. Tampering on any mirror is detectable." },
  { layer: "Open data export", status: "live", detail: "ledger.json, manifest.json and nostr-events.json are published with the site for independent archiving." },
  { layer: "Nostr events", status: "ready", detail: `Each record is exported as an addressable kind-${LEDGER_KIND} event. Corrections replace the old event on every relay instead of piling up.` },
  { layer: "Signed publishing", status: "ready", detail: "scripts/nostr-publish.ts signs with the publisher key held offline, verifies every signature, and publishes only with an explicit --publish flag." },
  { layer: "Tips over Nostr DMs", status: "planned", detail: "NIP-17 sealed direct messages to the reviewer key, so reporters can reach reviewers even if this domain is blocked." },
  { layer: "NIP-05 identity", status: "planned", detail: "A /.well-known/nostr.json entry binding the publisher key to the host domain, once the key holder is agreed." },
];

const STATUS_STYLE = {
  live: "bg-mz-green text-white",
  ready: "bg-sky-600 text-white",
  planned: "border border-mz-border text-mz-muted",
};

export default function ResiliencePage() {
  const example = toTemplate(PERSON_BY_SLUG.get("stella-soi-langat")!, LEDGER_COMPILED);
  const shown = { ...example, content: `${example.content.slice(0, 140)}…` };
  return (
    <main>
      <PageHeader
        crumbs={[{ label: "Vetting Record", href: "/" }, { label: "Resilience" }]}
        title="Built to stay up"
        lede="A public record is only useful if it survives pressure. Vetting Record is designed so that blocking one domain, one server or one host does not remove the record, and so that anyone can prove a mirror has not been altered."
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="mz-card p-5">
            <p className="mz-eyebrow">Ledger root sha256</p>
            <p className="mt-2"><Hash value={MANIFEST.root} full /></p>
          </div>
          <div className="mz-card p-5">
            <p className="mz-eyebrow">Records sealed</p>
            <p className="mt-1 text-3xl font-extrabold text-mz-green">{MANIFEST.records}</p>
          </div>
          <div className="mz-card p-5">
            <p className="mz-eyebrow">Compiled</p>
            <p className="mt-1 text-3xl font-extrabold text-mz-green">{fmtDate(LEDGER_COMPILED)}</p>
          </div>
        </div>

        <section className="mt-14">
          <SectionTitle eyebrow="Layers" title="What is live, what is ready, what is next" />
          <div className="overflow-hidden rounded-mz border border-mz-border bg-white">
            {LAYERS.map((l) => (
              <div key={l.layer} className="grid gap-2 border-b border-mz-border px-5 py-4 last:border-0 md:grid-cols-[200px_90px_1fr] md:items-center">
                <p className="font-semibold">{l.layer}</p>
                <span className={`w-fit rounded-mz px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLE[l.status]}`}>{l.status}</span>
                <p className="text-sm text-mz-muted">{l.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Nostr" title="One record, one addressable event" />
            <p className="text-sm text-mz-muted">
              The <code className="mz-mono">d</code> tag (<code className="mz-mono">{D_PREFIX}:&lt;slug&gt;</code>) makes each record replaceable, the{" "}
              <code className="mz-mono">x</code> tag carries its content hash, and the timestamp is the compile date so rebuilds are byte-for-byte
              reproducible. Relays store what they are given; readers verify the signature and the hash.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-mz bg-mz-text p-4 font-mono text-[11px] leading-relaxed text-white/90">{JSON.stringify(shown, null, 2)}</pre>
          </div>
          <div className="space-y-4">
            <SectionTitle eyebrow="Verify a mirror" title="Three commands, no trust required" />
            <pre className="overflow-x-auto rounded-mz bg-mz-text p-4 font-mono text-[11px] leading-relaxed text-white/90">{`# 1. fetch the record and its manifest from any mirror
curl -sO https://<mirror>/data/ledger.json
curl -sO https://<mirror>/data/manifest.json

# 2. recompute every record hash and the root, and
#    compare with the root compiled into this build
pnpm --filter @vetting-loop/ledger verify ledger.json manifest.json

# expected root
#    ${MANIFEST.root.slice(0, 32)}…`}</pre>
            <Callout tone="info" title="Downloads">
              <Link className="mz-link" href="/data/ledger.json">ledger.json</Link> (full record) ·{" "}
              <Link className="mz-link" href="/data/manifest.json">manifest.json</Link> (hashes) ·{" "}
              <Link className="mz-link" href="/data/nostr-events.json">nostr-events.json</Link> (unsigned templates)
            </Callout>
            <Callout tone="warn" title="Decision needed before publishing to relays">
              Nostr events are effectively permanent once relays accept them. The publisher key holder, the relay list, and Gazette verification of each
              record should be settled before the first signed publish. The tooling is ready; nothing has been published.
            </Callout>
          </div>
        </section>
      </div>
    </main>
  );
}
