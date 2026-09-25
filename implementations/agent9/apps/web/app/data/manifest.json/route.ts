import { MANIFEST } from "@/lib/ledger";

export const dynamic = "force-static";

/** Per-record sha256 hashes and the root hash. Mirrors must reproduce these. */
export function GET() {
  return Response.json(MANIFEST);
}
