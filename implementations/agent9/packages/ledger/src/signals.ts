import type { Appointment, OfficeKind, Person, SignalDef, SignalHit, SignalId } from "./types";

/**
 * Pattern signals. Each is a deterministic rule over the ledger. A signal
 * marks a pattern in the PUBLIC RECORD OF THE APPOINTMENT PROCESS that is
 * worth scrutiny. It is never a finding about a person's conduct.
 */
export const SIGNALS: SignalDef[] = [
  {
    id: "gate_rejection",
    label: "Rejected at the gate",
    rule: "The House rejected the nomination after a vetting hearing.",
    why: "Rejections are the rare documented cases where committee scrutiny changed an outcome. Their stated grounds are primary evidence.",
    requirement: 4,
  },
  {
    id: "returnee",
    label: "Returned after dissolution",
    rule: "Approved in the 2024 reconstitution after holding a cabinet seat (CS, Prime CS or Attorney General) in the cabinet dissolved on 11 Jul 2024.",
    why: "A protest-forced dissolution that returns many of the same people is only visible when appointment histories are linked per person.",
    requirement: 2,
  },
  {
    id: "docket_rotation",
    label: "Docket rotation",
    rule: "Held two or more different cabinet-level portfolios across the record.",
    why: "Rotation moves the same officials between ministries; the audit trail of each docket should follow the person.",
    requirement: 2,
  },
  {
    id: "soft_landing",
    label: "Soft landing",
    rule: "Left a cabinet office by dissolution, dismissal or removal, then was nominated to a different public office such as an envoy post.",
    why: "Removal is often a lateral move. When a removed official re-enters public office, the earlier record should resurface with them.",
    requirement: 3,
  },
  {
    id: "floor_override",
    label: "Committee overruled",
    rule: "The vetting committee recommended rejection; the House approved the nominee anyway.",
    why: "When the only committee rejection in a cycle is overturned on the floor, the gate is shown to be advisory. The override belongs in the record.",
    requirement: 4,
  },
  {
    id: "gazetted_without_approval",
    label: "Gazetted without approval",
    rule: "The appointment was published in the Kenya Gazette although the nominee never appeared and the House never approved it.",
    why: "The vetting gate only closes on nominees who walk through it. A no-show reaching the Gazette, even in error, is a control failure worth tracking.",
    requirement: 1,
  },
  {
    id: "declined_nomination",
    label: "Declined nomination",
    rule: "The nominee publicly declined the nomination.",
    why: "Declines are part of the exit pathway and are rarely recorded alongside outcomes.",
    requirement: 1,
  },
  {
    id: "elevation_without_hearing",
    label: "Elevated without a hearing",
    rule: "Assumed the office of Deputy President without a committee vetting hearing equivalent to a CS nomination.",
    why: "Lawful under Art. 149, but it is a gap between the rigour applied to appointments and the rigour applied to elevations.",
    requirement: 1,
  },
];

export const SIGNAL_BY_ID = new Map<SignalId, SignalDef>(SIGNALS.map((s) => [s.id, s]));

const CABINET_SEATS: OfficeKind[] = ["cabinet_secretary", "prime_cs", "attorney_general"];
const LEFT_CABINET = new Set(["dissolved", "dismissed", "removed"]);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-08-07" → "7 Aug 2024"; "2024-04" → "Apr 2024". */
export function humanDate(iso?: string): string {
  if (!iso) return "an unrecorded date";
  const [y, m, d] = iso.split("-");
  return d ? `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}` : `${MONTHS[Number(m) - 1]} ${y}`;
}

const isCabinetSeat = (a: Appointment) => CABINET_SEATS.includes(a.office);

function hit(signal: SignalId, p: Person, detail: string, appts: Appointment[]): SignalHit {
  return { signal, slug: p.slug, detail, appointmentIds: appts.map((a) => a.id) };
}

/** Evaluate every rule against one person. Output order follows SIGNALS. */
export function detect(p: Person): SignalHit[] {
  const hits: SignalHit[] = [];
  const A = p.appointments;

  for (const a of A.filter((x) => x.outcome === "rejected")) {
    hits.push(hit("gate_rejection", p, `Rejected for ${a.portfolio}${a.statedGrounds ? `: "${a.statedGrounds}"` : "."}`, [a]));
  }

  const dissolved = A.filter((a) => isCabinetSeat(a) && a.cycle === "cs-2022" && a.exit === "dissolved");
  const returned = A.find((a) => a.cycle === "cs-2024" && a.outcome === "approved");
  if (dissolved.length && returned) {
    const was = dissolved[0];
    hits.push(
      hit("returnee", p, `Held ${was.portfolio} in the dissolved cabinet; approved for ${returned.portfolio} on ${humanDate(returned.decided)}.`, [was, returned]),
    );
  }

  const seats = A.filter((a) => isCabinetSeat(a) && a.outcome !== "rejected");
  const portfolios = [...new Set(seats.map((a) => a.portfolio))];
  if (portfolios.length >= 2) {
    const ordered = [...seats].sort((x, y) => (x.from ?? x.nominated ?? "").localeCompare(y.from ?? y.nominated ?? ""));
    const path = [...new Set(ordered.map((a) => a.portfolio))];
    hits.push(hit("docket_rotation", p, `${path.length} portfolios: ${path.join(" → ")}.`, ordered));
  }

  const exits = A.filter((a) => isCabinetSeat(a) && a.exit && LEFT_CABINET.has(a.exit));
  for (const exit of exits) {
    const next = A.find((a) => !isCabinetSeat(a) && a.office !== "deputy_president" && (a.nominated ?? a.from ?? "") >= (exit.from ?? ""));
    if (next) {
      hits.push(hit("soft_landing", p, `Left ${exit.portfolio} (${exit.exit}); later nominated ${next.portfolio}.`, [exit, next]));
      break;
    }
  }

  for (const a of A.filter((x) => x.committeeRecommendation === "reject" && x.outcome === "approved")) {
    hits.push(hit("floor_override", p, `Committee recommended rejection for ${a.portfolio}; the House approved on ${humanDate(a.decided)}.`, [a]));
  }

  for (const a of A.filter((x) => x.gazettedWithoutApproval)) {
    const g = a.gazettedWithoutApproval!;
    hits.push(hit("gazetted_without_approval", p, `Gazetted as ${a.portfolio} (${g.notice}) without appearing or House approval; revoked by ${g.revokedBy}.`, [a]));
  }

  for (const a of A.filter((x) => x.outcome === "declined")) {
    hits.push(hit("declined_nomination", p, `Declined nomination as ${a.portfolio}.`, [a]));
  }

  for (const a of A.filter((x) => x.office === "deputy_president" && x.appearance !== "appeared")) {
    hits.push(hit("elevation_without_hearing", p, `Approved as Deputy President by House vote on ${humanDate(a.decided)} with no committee vetting hearing.`, [a]));
  }

  return hits;
}

export function detectAll(people: Person[]): SignalHit[] {
  return people.flatMap(detect);
}
