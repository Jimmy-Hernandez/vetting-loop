// Mirrors CONTRACTS.md §2 exactly. Do not deviate.

export interface Flag {
  claim: string;
  quote: string;
  publisher: string;
  url: string;
  date: string;
  legal_status: string;
}

export interface PositiveFinding {
  claim: string;
  page: number;
  ocr_confidence: 'high' | 'medium';
  needs_verification: boolean;
}

export interface BackgroundCheck {
  outcome: string;
  page: number;
  quote: string;
}

export type BackgroundChecks = {
  eacc: BackgroundCheck;
  helb: BackgroundCheck;
  dci: BackgroundCheck;
  orpp: BackgroundCheck;
  kra: BackgroundCheck;
  cue: BackgroundCheck;
};

export interface AskedQuestion {
  text: string;
  source: 'mp' | 'committee';
  mp_name: string;
  source_url: string;
  line: number;
}

export interface IgnoredQuestion {
  text: string;
  source: 'citizen';
  source_url: string;
  line: number;
  needs_verification: boolean;
  kind?: string;
  line_end?: number;
}

export interface HearingQuestions {
  asked: AskedQuestion[];
  ignored: IgnoredQuestion[];
}

export interface Memoranda {
  header_found: boolean;
  count: number;
  summary: string;
  report_page: string;
  hdr_line?: number;
  first_line?: number;
  quote?: string;
  needs_verification?: boolean;
}

export interface PriorRole {
  prior_role: string | null;
  prior_portfolio: string | null;
  priorRoleType?: 'constitutional_office';
  needs_verification: boolean;
}

export interface Nominee {
  id: string;
  name: string;
  slug: string;
  portfolio: string;
  party: string | null;
  status: 'approved' | 'rejected';
  priorRole?: PriorRole;
  flags: Flag[];
  positiveFindings: PositiveFinding[];
  backgroundChecks: BackgroundChecks;
  hearingQuestions: HearingQuestions;
  memoranda: Memoranda;
  reportPageRef: string;
}

export interface Episode {
  slug: string;
  title: string;
  date: string;
  summary: string;
  nominees: Nominee[];
}

export interface Division {
  id: number;
  title: string;
  date: string;
  house: string;
  yes: number;
  no: number;
  result_url: string;
  per_mp_csv_url: string;
}

export interface VettingVote {
  motion_text: string;
  mechanism: 'voice_vote';
  recorded_votes: Division[];
  hansard_line: string;
  hansard_date: string;
}

export interface DivisionsFile {
  divisions: Division[];
  vetting_vote: VettingVote;
}

export interface HansardExcerpt {
  speaker: string;
  role: string;
  text: string;
  date: string;
  url: string;
}

export interface HansardExcerptsFile {
  excerpts: HansardExcerpt[];
}