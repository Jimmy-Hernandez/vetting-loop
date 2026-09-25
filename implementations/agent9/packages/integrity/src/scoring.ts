import type {
  Attribution,
  ChannelScore,
  Finding,
  FindingStatus,
  Rating,
  RatingBand,
  SourceChannel,
} from "./types";

/** Hard limit on how far back a profile looks. */
export const LOOKBACK_YEARS = 15;

/** Kenya's next general election: second Tuesday of August 2027. */
export const DEFAULT_AS_OF = "2027-08-10";

export const CHANNELS: SourceChannel[] = ["eacc", "oag", "parliament", "mzalendo"];

/**
 * Base points per record status. Weights follow the strength of the
 * institutional process behind the record, not the gravity of the
 * allegation: a filed asset-recovery suit outweighs an opened file,
 * and a closed or resolved matter carries zero.
 */
export const STATUS_POINTS: Record<FindingStatus, number> = {
  eacc_investigation_opened: 10,
  eacc_prosecution_recommended: 25,
  eacc_asset_recovery_filed: 30,
  eacc_closed_no_action: 0,
  oag_query_unresolved: 12,
  oag_query_resolved: 0,
  oag_qualified_opinion: 5,
  oag_adverse_opinion: 14,
  parl_vetting_concern_raised: 6,
  parl_vetting_concern_cleared: 0,
  parl_committee_adverse_mention: 12,
  parl_censure_or_impeachment_motion: 15,
  mz_hansard_allegation: 3,
  mz_wealth_declaration_gap: 5,
};

/** Entity-level audit findings count less than records naming the person. */
export const ATTRIBUTION_WEIGHT: Record<Attribution, number> = {
  direct: 1,
  accounting_officer: 0.8,
  political_head: 0.5,
};

/** Upper bounds (inclusive) for each band. 0 points is always "clear". */
export const BAND_THRESHOLDS = { low: 14, elevated: 34 } as const;

export const BAND_LABEL: Record<RatingBand, string> = {
  clear: "No adverse record",
  low: "Low concern",
  elevated: "Elevated concern",
  high: "High concern",
};

const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

export function windowStart(asOf: string = DEFAULT_AS_OF): string {
  const d = new Date(`${asOf}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - LOOKBACK_YEARS);
  return d.toISOString().slice(0, 10);
}

export function isInWindow(date: string, asOf: string = DEFAULT_AS_OF): boolean {
  return date >= windowStart(asOf) && date <= asOf;
}

/** Linear decay from 1.0 (today) to 0.5 (at the edge of the window). */
export function recencyWeight(date: string, asOf: string = DEFAULT_AS_OF): number {
  const age = (Date.parse(asOf) - Date.parse(date)) / MS_PER_YEAR;
  if (age <= 0) return 1;
  return Math.max(0.5, 1 - 0.5 * (age / LOOKBACK_YEARS));
}

export function findingPoints(f: Finding, asOf: string = DEFAULT_AS_OF): number {
  return STATUS_POINTS[f.status] * ATTRIBUTION_WEIGHT[f.attribution] * recencyWeight(f.date, asOf);
}

export function bandFor(score: number): RatingBand {
  if (score <= 0) return "clear";
  if (score <= BAND_THRESHOLDS.low) return "low";
  if (score <= BAND_THRESHOLDS.elevated) return "elevated";
  return "high";
}

export function rate(findings: Finding[], asOf: string = DEFAULT_AS_OF): Rating {
  const start = windowStart(asOf);
  const inWindow = findings
    .filter((f) => f.date >= start && f.date <= asOf)
    .sort((a, b) => b.date.localeCompare(a.date));
  const excludedOutsideWindow = findings.filter((f) => f.date < start).length;

  const byChannel: ChannelScore[] = CHANNELS.map((channel) => {
    const rows = inWindow.filter((f) => f.channel === channel);
    const points = rows.reduce((sum, f) => sum + findingPoints(f, asOf), 0);
    return { channel, points: Math.round(points * 10) / 10, findings: rows.length };
  });

  const raw = inWindow.reduce((sum, f) => sum + findingPoints(f, asOf), 0);
  const score = Math.min(100, Math.round(raw));

  return {
    score,
    band: bandFor(score),
    byChannel,
    inWindow,
    excludedOutsideWindow,
    windowStart: start,
    windowEnd: asOf,
    containsMock: findings.some((f) => f.mock),
  };
}
