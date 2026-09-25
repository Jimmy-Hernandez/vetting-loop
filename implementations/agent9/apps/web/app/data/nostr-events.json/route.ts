import { LEDGER_COMPILED, PEOPLE, toTemplate } from "@vetting-loop/ledger";

export const dynamic = "force-static";

/**
 * Unsigned NIP-01 event templates (kind 30078), one per record. The publisher
 * signs them offline with scripts/nostr-publish.ts; the key never reaches the site.
 */
export function GET() {
  return Response.json(PEOPLE.map((p) => toTemplate(p, LEDGER_COMPILED)));
}
