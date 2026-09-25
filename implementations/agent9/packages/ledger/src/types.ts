/**
 * Appointment Ledger — domain types.
 *
 * The ledger holds FACTS ONLY: who was nominated to which office, whether
 * they were vetted, what the House decided, and what happened next. It holds
 * no allegations, scores or opinions. Pattern signals are derived from these
 * facts by deterministic rules (see signals.ts) and describe the appointment
 * PROCESS, never a person's conduct.
 */

export type OfficeKind =
  | "prime_cs"
  | "cabinet_secretary"
  | "principal_secretary"
  | "attorney_general"
  | "deputy_president"
  | "envoy"
  | "other";

/** What happened at the vetting gate for one nomination. */
export type VettingOutcome =
  /** Heard by a committee and approved by the House. */
  | "approved"
  /** Heard and rejected by the House. */
  | "rejected"
  /** Nominee declined before or instead of vetting. */
  | "declined"
  /** Office filled without a parliamentary approval hearing. */
  | "not_vetted"
  /** Moved between dockets by the President without a new hearing. */
  | "reassigned"
  /** Nominated; the outcome is not yet in the compiled record. */
  | "unrecorded";

/** Did the nominee actually sit before the vetting committee? */
export type Appearance = "appeared" | "did_not_appear" | "not_required" | "unknown";

/** How the appointment ended, if it has. */
export type ExitKind = "dissolved" | "dismissed" | "removed" | "resigned" | "elevated" | "reassigned";

/**
 * Verification tiers. Every record starts as "compiled" (assembled from
 * press and official releases) and must be promoted by a named reviewer
 * against the Kenya Gazette or Hansard before it is cited externally.
 */
export type Verification = "compiled" | "cross_checked" | "gazette_verified";

export type Source = {
  id: string;
  publisher: string;
  title: string;
  date: string;
  url: string;
};

export type Appointment = {
  id: string;
  office: OfficeKind;
  /** Docket, ministry, state department or station. */
  portfolio: string;
  cycle: CycleId;
  nominated?: string;
  /** Date of the House (or committee) decision on the nomination. */
  decided?: string;
  /** Date the office was assumed (swearing-in or effective date). */
  from?: string;
  to?: string;
  outcome: VettingOutcome;
  appearance: Appearance;
  exit?: ExitKind;
  /** The committee's recommendation, where it differed from the House outcome. */
  committeeRecommendation?: "approve" | "reject";
  /** Gazetted although the House never approved; later revoked. */
  gazettedWithoutApproval?: { notice: string; revokedBy: string };
  /** Stated grounds, quoted verbatim where the record provides them. */
  statedGrounds?: string;
  note?: string;
  sources: string[];
  verification: Verification;
};

export type Person = {
  slug: string;
  name: string;
  /** Short neutral descriptor of the latest known role. */
  latestRole: string;
  appointments: Appointment[];
};

export type CycleId =
  | "cs-2022"
  | "ps-2022"
  | "cs-2024"
  | "reshuffle-2024-12"
  | "reshuffle-2025-03"
  | "envoys-2024"
  | "envoys-2024-11"
  | "envoys-2025"
  | "elevation-2024"
  | "ag-2024";

export type Cycle = {
  id: CycleId;
  label: string;
  date: string;
  body: string;
  summary: string;
  /** Counted in the vetting-gate statistics (a formal nomination batch). */
  gate: boolean;
};

export type SignalId =
  | "gate_rejection"
  | "returnee"
  | "docket_rotation"
  | "soft_landing"
  | "floor_override"
  | "gazetted_without_approval"
  | "declined_nomination"
  | "elevation_without_hearing";

export type SignalHit = {
  signal: SignalId;
  slug: string;
  /** Plain factual statement of what the rule matched. */
  detail: string;
  appointmentIds: string[];
};

export type SignalDef = {
  id: SignalId;
  label: string;
  /** The rule, stated so a reader can re-derive every hit by hand. */
  rule: string;
  /** Why the pattern matters for accountability. */
  why: string;
  /** Design requirement from the vetting observations it serves. */
  requirement: 1 | 2 | 3 | 4;
};
