/**
 * Core domain types for The Vetting Loop.
 *
 * Design constraint: every integrity flag MUST carry a source reference.
 * No bare allegations — this is the credibility differentiator.
 */

// ── Source Documents ──────────────────────────────────────────────────────────

export type SourceDocument = {
  id: string;
  title: string;
  /** Publicly accessible URL or archive reference */
  url: string;
  /** ISO 8601 date the source document was published */
  publishedAt: string;
  publisher: string;
  documentType: "gazette" | "eacc_report" | "court_record" | "hansard" | "committee_report" | "media" | "other";
};

// ── Nominees ──────────────────────────────────────────────────────────────────

export type NomineeStatus = "gazetted" | "hearing_scheduled" | "hearing_complete" | "approved" | "rejected";

export type IntegrityFlag = {
  id: string;
  nomineeId: string;
  summary: string;
  /** Severity is editorial — must be grounded in source, not opinion */
  severity: "low" | "medium" | "high";
  /** At least one source is required; bare allegations are rejected */
  sources: SourceDocument[];
  createdAt: string;
};

export type CareerEntry = {
  id: string;
  nomineeId: string;
  role: string;
  organisation: string;
  startYear: number;
  endYear?: number;
  notes?: string;
  sources: SourceDocument[];
};

export type Nominee = {
  id: string;
  fullName: string;
  /** Position being vetted for */
  position: string;
  /** Cabinet, Principal Secretary, Board, etc. */
  appointmentType: string;
  /** ISO 8601 gazette date */
  gazetteDate: string;
  hearingDate?: string;
  status: NomineeStatus;
  /** Brief bio — factual only */
  summary?: string;
  career: CareerEntry[];
  integrityFlags: IntegrityFlag[];
  /** Slug for URL routing: e.g. "jane-doe-cs-health-2026" */
  slug: string;
};

// ── Question Queue ────────────────────────────────────────────────────────────

export type QuestionStatus = "pending" | "asked" | "ignored" | "partially_asked";

export type Question = {
  id: string;
  nomineeId: string;
  body: string;
  /** Optional supporting context — must cite source if specific claim */
  context?: string;
  sources?: SourceDocument[];
  upvotes: number;
  status: QuestionStatus;
  /** Set when committee used the question */
  askedAt?: string;
  /** Which committee member raised it */
  askedBy?: string;
  submittedAt: string;
  /** null = anonymous citizen; string = CSO name if disclosed */
  submitterLabel?: string;
};

// ── Hearing Record ────────────────────────────────────────────────────────────

export type HearingTopic =
  | "integrity"
  | "competence"
  | "financial_disclosure"
  | "track_record"
  | "policy_position"
  | "procedural"
  | "other";

export type HearingExchange = {
  id: string;
  hearingId: string;
  questionId?: string; // links to citizen queue if applicable
  topic: HearingTopic;
  askedBy: string; // MP name
  questionText: string;
  responseText?: string;
  timestamp?: string;
  /** Whether this exchange addressed a citizen question */
  addressesCitizenQuestion: boolean;
};

export type HearingRecord = {
  id: string;
  nomineeId: string;
  date: string;
  committeeId: string;
  committeeName: string;
  /** Source Hansard or transcript document */
  transcriptSource: SourceDocument;
  exchanges: HearingExchange[];
  /** Total citizen questions: asked vs ignored */
  citizenQuestionsAsked: number;
  citizenQuestionsIgnored: number;
};

// ── Votes ─────────────────────────────────────────────────────────────────────

export type VoteChoice = "aye" | "nay" | "abstain" | "absent";

export type MpVote = {
  id: string;
  nomineeId: string;
  mpId: string;
  mpName: string;
  constituency: string;
  party: string;
  choice: VoteChoice;
  /** Source: Mzalendo voting record */
  source: SourceDocument;
  recordedAt: string;
};

// ── MPs (from Mzalendo) ───────────────────────────────────────────────────────

export type Mp = {
  id: string;
  /** Mzalendo person ID for linking */
  mzalendoId?: string;
  fullName: string;
  constituency: string;
  party: string;
  chamber: "national_assembly" | "senate";
  /** Mzalendo scorecard URL */
  scorecardUrl?: string;
};

// ── Committee Reports ─────────────────────────────────────────────────────────

export type SubmissionOutcome = "reflected" | "addressed" | "absent";

export type CitizenSubmission = {
  id: string;
  nomineeId: string;
  submitterLabel?: string;
  summary: string;
  submittedAt: string;
  /** Whether the committee report engaged with this submission */
  outcome: SubmissionOutcome;
  /** Which paragraph/section of report addresses it, if any */
  reportReference?: string;
};

export type CommitteeReport = {
  id: string;
  nomineeId: string;
  publishedAt: string;
  source: SourceDocument;
  recommendation: "approve" | "reject" | "defer";
  /** Did the report reflect citizen submissions? */
  submissionsReflected: boolean;
  citizenSubmissions: CitizenSubmission[];
};

// ── API Response Envelope ─────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
