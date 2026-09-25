import { CYCLES } from "./data/sources";
import { detect } from "./signals";
import type { CycleId, Person } from "./types";

export type GateRow = { cycle: CycleId; label: string; nominated: number; approved: number; rejected: number };

const GATE_OFFICES = new Set(["prime_cs", "cabinet_secretary", "principal_secretary"]);

/** Nominations, approvals and rejections for each formal nomination batch. */
export function gateStats(people: Person[]): { rows: GateRow[]; nominated: number; approved: number; rejected: number } {
  const rows = CYCLES.filter((c) => c.gate).map((c) => {
    const appts = people.flatMap((p) => p.appointments).filter((a) => a.cycle === c.id && GATE_OFFICES.has(a.office));
    return {
      cycle: c.id,
      label: c.label,
      nominated: appts.length,
      approved: appts.filter((a) => a.outcome === "approved").length,
      rejected: appts.filter((a) => a.outcome === "rejected").length,
    };
  });
  const sum = (k: "nominated" | "approved" | "rejected") => rows.reduce((n, r) => n + r[k], 0);
  return { rows, nominated: sum("nominated"), approved: sum("approved"), rejected: sum("rejected") };
}

export type Reconstitution = {
  nominees: number;
  approved: number;
  rejected: number;
  returnees: number;
  returneesAsCs: number;
  rotatedDocket: number;
  newFaces: number;
};

/** The 2024 reconstitution, computed from the ledger rather than asserted. */
export function reconstitution2024(people: Person[]): Reconstitution {
  const cohort = people.filter((p) => p.appointments.some((a) => a.cycle === "cs-2024"));
  const approved = cohort.filter((p) => p.appointments.some((a) => a.cycle === "cs-2024" && a.outcome === "approved"));
  const returnees = approved.filter((p) => detect(p).some((h) => h.signal === "returnee"));
  const returneesAsCs = returnees.filter((p) =>
    p.appointments.some((a) => a.cycle === "cs-2022" && a.office === "cabinet_secretary"),
  );
  const rotated = returnees.filter((p) => {
    const was = p.appointments.find((a) => a.cycle === "cs-2022");
    const now = p.appointments.find((a) => a.cycle === "cs-2024");
    return was && now && was.portfolio !== now.portfolio;
  });
  return {
    nominees: cohort.length,
    approved: approved.length,
    rejected: cohort.length - approved.length,
    returnees: returnees.length,
    returneesAsCs: returneesAsCs.length,
    rotatedDocket: rotated.length,
    newFaces: approved.length - returnees.length,
  };
}

export type Vacancy = { portfolio: string; from: string; to: string; days: number; reason: string };

const DAY = 86_400_000;
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

/**
 * Dockets left without a holder after a rejection, measured from the House
 * decision to the next nomination for the same portfolio.
 */
export function vacancies(people: Person[]): Vacancy[] {
  const all = people.flatMap((p) => p.appointments);
  return all
    .filter((a) => a.outcome === "rejected" && a.decided && a.decided.length === 10)
    .flatMap((r) => {
      const decided = r.decided!;
      const next = all
        .filter((a) => a.portfolio === r.portfolio && a.outcome === "approved" && (a.nominated ?? a.from ?? "") > decided)
        .sort((x, y) => (x.nominated ?? "").localeCompare(y.nominated ?? ""))[0];
      const to = next?.nominated ?? next?.from;
      return to ? [{ portfolio: r.portfolio, from: decided, to, days: days(decided, to), reason: "Nominee rejected" }] : [];
    });
}

/** Committee recommendations the House overturned, and House rejections. */
export function gateDecisions(people: Person[]) {
  const all = people.flatMap((p) => p.appointments.map((a) => ({ person: p, a })));
  return {
    committeeRejections: all.filter(({ a }) => a.committeeRecommendation === "reject"),
    overturned: all.filter(({ a }) => a.committeeRecommendation === "reject" && a.outcome === "approved"),
    houseRejections: all.filter(({ a }) => a.outcome === "rejected"),
  };
}
