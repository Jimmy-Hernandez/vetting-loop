import { CYCLES, LEDGER_COMPILED, PEOPLE, SIGNALS, SOURCES, detectAll } from "@vetting-loop/ledger";
import { MANIFEST } from "@/lib/ledger";

export const dynamic = "force-static";

/** The full ledger as one file: people, cycles, sources, rules and computed signals. */
export function GET() {
  return Response.json({
    schema: "ke-vetting-ledger/1",
    compiled: LEDGER_COMPILED,
    root: MANIFEST.root,
    notice: "Public facts about public offices. Signals describe the appointment process, not a person's conduct.",
    people: PEOPLE,
    cycles: CYCLES,
    sources: SOURCES,
    signals: SIGNALS,
    hits: detectAll(PEOPLE),
  });
}
