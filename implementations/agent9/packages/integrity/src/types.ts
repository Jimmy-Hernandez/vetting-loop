/**
 * Kenya Integrity Index — domain types.
 *
 * Two kinds of data live side by side and must never be confused:
 *  - RosterFacts: appointment history compiled from public records
 *    (nominations, vetting outcomes, reshuffles). Factual, but pending
 *    Kenya Gazette verification.
 *  - Findings: records from the four monitored channels. Until live
 *    ingestion exists, EVERY finding is synthetic and carries `mock: true`.
 */

/** The four monitored source channels. */
export type SourceChannel = "eacc" | "oag" | "parliament" | "mzalendo";

export type FindingStatus =
  // Ethics and Anti-Corruption Commission
  | "eacc_investigation_opened"
  | "eacc_prosecution_recommended"
  | "eacc_asset_recovery_filed"
  | "eacc_closed_no_action"
  // Office of the Auditor-General
  | "oag_query_unresolved"
  | "oag_query_resolved"
  | "oag_qualified_opinion"
  | "oag_adverse_opinion"
  // Parliamentary vetting / National Assembly
  | "parl_vetting_concern_raised"
  | "parl_vetting_concern_cleared"
  | "parl_committee_adverse_mention"
  | "parl_censure_or_impeachment_motion"
  // Mzalendo parliamentary record (Hansard, committee reports)
  | "mz_hansard_allegation"
  | "mz_wealth_declaration_gap";

/**
 * How the person relates to the record. OAG findings concern entities,
 * not people: they only attach to a person for the period that person was
 * the accounting officer or political head of the audited entity.
 */
export type Attribution = "direct" | "accounting_officer" | "political_head";

export type SourceRef = {
  /** Human label, e.g. "EACC Annual Report FY2019/20" */
  label: string;
  /** For mock data this is the institution's public portal, not a document. */
  url: string;
  /** Reference number. Mock references are always prefixed "MOCK-". */
  reference: string;
};

export type Finding = {
  id: string;
  channel: SourceChannel;
  status: FindingStatus;
  attribution: Attribution;
  /** ISO 8601 date of the record (report publication, filing, hearing). */
  date: string;
  title: string;
  summary: string;
  /** Entity the record concerns, e.g. a ministry or county. */
  entity: string;
  amountKes?: number;
  source: SourceRef;
  /** True for every synthetic record. The UI must label these. */
  mock: boolean;
};

export type VettingOutcome = "approved" | "rejected" | "withdrawn" | "not_vetted";

export type Appointment = {
  office: string;
  portfolio: string;
  /** ISO date of nomination or start */
  from: string;
  /** ISO date of exit, if known */
  to?: string;
  vetting: VettingOutcome;
  note?: string;
};

export type RosterEntry = {
  slug: string;
  fullName: string;
  /** Cohort keys the person belongs to, e.g. "cs-2024" */
  cohorts: string[];
  currentRole: string;
  appointments: Appointment[];
  /** Factual notes from the roster (reshuffles, exits). */
  notes: string[];
};

export type RatingBand = "clear" | "low" | "elevated" | "high";

export type ChannelScore = {
  channel: SourceChannel;
  points: number;
  findings: number;
};

export type Rating = {
  score: number;
  band: RatingBand;
  byChannel: ChannelScore[];
  /** Findings inside the lookback window, newest first. */
  inWindow: Finding[];
  /** Count of findings dropped for being older than the window. */
  excludedOutsideWindow: number;
  windowStart: string;
  windowEnd: string;
  /** True if any contributing finding is synthetic. */
  containsMock: boolean;
};

export type Profile = RosterEntry & {
  findings: Finding[];
  rating: Rating;
};
