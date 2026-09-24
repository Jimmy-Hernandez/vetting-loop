// Terry's ledger schema (Vetting Record / Agent9) — ke-vetting-ledger/1
// Source of truth: app/public/data/terry/ledger.json (fetched from vetting-record.pages.dev).

export interface TerryAppointment {
  id: string;
  office: string;
  portfolio: string;
  cycle: string;
  nominated?: string;
  decided?: string;
  from?: string;
  to?: string;
  outcome: 'approved' | 'rejected' | 'declined' | 'reassigned' | 'unrecorded';
  appearance?: string;
  exit?: string;
  note?: string;
  sources: string[];
  verification: 'compiled' | 'cross_checked' | 'gazette_verified';
}

export interface TerryPerson {
  slug: string;
  name: string;
  latestRole: string;
  appointments: TerryAppointment[];
}

export interface TerryCycle {
  id: string;
  label: string;
  date: string;
  body: string;
  summary: string;
  gate: boolean;
}

export interface TerrySignal {
  id: string;
  label: string;
  rule: string;
  why: string;
  requirement: number;
}

export interface TerryHit {
  signal: string;
  slug: string;
  detail: string;
  appointmentIds: string[];
}

export interface TerryLedger {
  schema: string;
  compiled: string;
  root: string;
  notice: string;
  people: TerryPerson[];
  cycles: TerryCycle[];
  sources: unknown;
  signals: TerrySignal[];
  hits: TerryHit[];
}
