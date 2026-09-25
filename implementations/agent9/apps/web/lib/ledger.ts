import {
  CYCLE_BY_ID,
  LEDGER_COMPILED,
  PEOPLE,
  SIGNAL_BY_ID,
  buildManifest,
  detect,
  type Appointment,
  type Person,
  type SignalHit,
  type SignalId,
  type Verification,
} from "@vetting-loop/ledger";

export const MANIFEST = buildManifest(PEOPLE, LEDGER_COMPILED);

/** Tone per signal: process gaps in red, pathway patterns in amber, gate events in green. */
export const SIGNAL_TONE: Record<SignalId, { chip: string; dot: string }> = {
  gate_rejection: { chip: "border-mz-green/40 bg-green-50 text-mz-green-dark", dot: "bg-mz-green" },
  floor_override: { chip: "border-mz-red/30 bg-red-50 text-mz-red", dot: "bg-mz-red" },
  gazetted_without_approval: { chip: "border-mz-red/30 bg-red-50 text-mz-red", dot: "bg-mz-red" },
  elevation_without_hearing: { chip: "border-mz-red/30 bg-red-50 text-mz-red", dot: "bg-mz-red" },
  returnee: { chip: "border-amber-300 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  docket_rotation: { chip: "border-amber-300 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  soft_landing: { chip: "border-amber-300 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  declined_nomination: { chip: "border-slate-300 bg-slate-50 text-slate-700", dot: "bg-slate-500" },
};

export const VERIFICATION_META: Record<Verification, { label: string; className: string; blurb: string }> = {
  compiled: {
    label: "Compiled",
    className: "border-mz-border text-mz-muted",
    blurb: "Assembled from published lists; awaiting a dated cross-check.",
  },
  cross_checked: {
    label: "Cross-checked",
    className: "border-sky-300 bg-sky-50 text-sky-800",
    blurb: "Dates and outcome matched against dated press reports.",
  },
  gazette_verified: {
    label: "Gazette-verified",
    className: "border-mz-green bg-green-50 text-mz-green-dark",
    blurb: "Pinned to a Kenya Gazette notice or Hansard page by a named reviewer.",
  },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats full or month-precision ISO dates without timezone drift. */
export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const month = MONTHS[Number(m) - 1];
  if (!d) return `${month} ${y}`;
  return `${Number(d)} ${month} ${y}`;
}

export function signalLabel(id: SignalId): string {
  return SIGNAL_BY_ID.get(id)?.label ?? id;
}

export function cycleLabel(a: Appointment): string {
  return CYCLE_BY_ID.get(a.cycle)?.label ?? a.cycle;
}

export function initialsOf(name: string): string {
  return name
    .replace(/^(Prof\.|Dr\.|Amb\.|Eng\.)\s+/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Sort key for an appointment: the earliest date the record carries. */
export const apptDate = (a: Appointment) => a.nominated ?? a.decided ?? a.from ?? "";

export type LedgerRow = {
  slug: string;
  name: string;
  role: string;
  tier: "cabinet" | "ps" | "envoy";
  cycles: string[];
  signals: SignalId[];
  appointments: number;
  verification: Verification;
  hash: string;
};

function tierOf(p: Person): LedgerRow["tier"] {
  const offices = p.appointments.map((a) => a.office);
  if (offices.every((o) => o === "principal_secretary")) return "ps";
  if (offices.every((o) => o === "envoy")) return "envoy";
  return "cabinet";
}

const RANK: Record<Verification, number> = { compiled: 0, cross_checked: 1, gazette_verified: 2 };

export function ledgerRows(): LedgerRow[] {
  return PEOPLE.map((p) => {
    const hits = detect(p);
    const weakest = p.appointments.reduce<Verification>(
      (w, a) => (RANK[a.verification] < RANK[w] ? a.verification : w),
      "gazette_verified",
    );
    return {
      slug: p.slug,
      name: p.name,
      role: p.latestRole,
      tier: tierOf(p),
      cycles: [...new Set(p.appointments.map((a) => a.cycle))],
      signals: [...new Set(hits.map((h) => h.signal))],
      appointments: p.appointments.length,
      verification: weakest,
      hash: MANIFEST.hashes[p.slug]!,
    };
  });
}

export function hitsBySignal(): Map<SignalId, Array<SignalHit & { name: string }>> {
  const out = new Map<SignalId, Array<SignalHit & { name: string }>>();
  for (const p of PEOPLE) {
    for (const h of detect(p)) {
      const list = out.get(h.signal) ?? [];
      list.push({ ...h, name: p.name });
      out.set(h.signal, list);
    }
  }
  return out;
}
