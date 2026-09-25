import type { Attribution, Finding, FindingStatus, RatingBand, RosterEntry, SourceChannel } from "./types";

/**
 * SYNTHETIC findings for interface demonstration.
 *
 * Nothing in this file describes a real investigation, audit, hearing or
 * Hansard record. Bands are assigned by a hash of the profile slug against
 * fixed quotas, so a person's mock rating is independent of their public
 * reputation. Replace this module with live ingestion before any real use.
 */

export const MOCK_DISCLOSURE =
  "Synthetic record generated for interface demonstration. No such record exists.";

/** Target distribution across the 20 profiled nominees. */
export const MOCK_BAND_QUOTA: Array<[RatingBand, number]> = [
  ["clear", 8],
  ["low", 6],
  ["elevated", 4],
  ["high", 2],
];

export const PORTALS: Record<SourceChannel, { label: string; url: string }> = {
  eacc: { label: "Ethics and Anti-Corruption Commission", url: "https://eacc.go.ke/" },
  oag: { label: "Office of the Auditor-General", url: "https://www.oagkenya.go.ke/" },
  parliament: { label: "Parliament of Kenya, National Assembly", url: "http://www.parliament.go.ke/the-national-assembly" },
  mzalendo: { label: "Mzalendo", url: "https://mzalendo.com/" },
};

type Template = {
  channel: SourceChannel;
  status: FindingStatus;
  attribution: Attribution;
  /** Year range the synthetic record is dated within */
  years: [number, number];
  title: string;
  summary: (entity: string) => string;
  amount?: [number, number];
};

const T: Record<string, Template> = {
  eaccClosed: {
    channel: "eacc", status: "eacc_closed_no_action", attribution: "direct", years: [2014, 2021],
    title: "Inquiry closed with no further action",
    summary: (e) => `A complaint concerning ${e} was reviewed and closed without a recommendation to prosecute.`,
  },
  oagResolved: {
    channel: "oag", status: "oag_query_resolved", attribution: "political_head", years: [2016, 2024],
    title: "Audit query resolved",
    summary: (e) => `An audit query on supporting documents at ${e} was answered and marked resolved in the following audit cycle.`,
    amount: [4, 60],
  },
  vettingCleared: {
    channel: "parliament", status: "parl_vetting_concern_cleared", attribution: "direct", years: [2022, 2024],
    title: "Vetting question answered to committee's satisfaction",
    summary: () => "A question on declared assets was raised at the approval hearing and the committee report records it as satisfactorily answered.",
  },
  oagQualified: {
    channel: "oag", status: "oag_qualified_opinion", attribution: "political_head", years: [2017, 2024],
    title: "Qualified audit opinion on entity accounts",
    summary: (e) => `The financial statements of ${e} received a qualified opinion over unsupported pending bills.`,
    amount: [80, 900],
  },
  hansardMention: {
    channel: "mzalendo", status: "mz_hansard_allegation", attribution: "direct", years: [2015, 2025],
    title: "Allegation raised on the floor of the House",
    summary: () => "A Member raised a procurement concern during debate. The Hansard records the statement; no follow-up inquiry is on record.",
  },
  vettingConcern: {
    channel: "parliament", status: "parl_vetting_concern_raised", attribution: "direct", years: [2022, 2024],
    title: "Integrity question left open at vetting",
    summary: () => "A petition on a past land transaction was tabled at the approval hearing; the committee report does not record a finding on it.",
  },
  eaccOpened: {
    channel: "eacc", status: "eacc_investigation_opened", attribution: "direct", years: [2016, 2025],
    title: "Investigation opened into procurement",
    summary: (e) => `An investigation was opened into the award of a supply tender at ${e}. No outcome is on record.`,
    amount: [150, 2400],
  },
  oagUnresolved: {
    channel: "oag", status: "oag_query_unresolved", attribution: "accounting_officer", years: [2018, 2025],
    title: "Unresolved audit query: unsupported expenditure",
    summary: (e) => `Expenditure at ${e} lacked supporting documents and remained unresolved across two audit cycles.`,
    amount: [200, 3500],
  },
  eaccProsecution: {
    channel: "eacc", status: "eacc_prosecution_recommended", attribution: "direct", years: [2019, 2025],
    title: "Prosecution recommended to the ODPP",
    summary: (e) => `Following an investigation into payments at ${e}, a file was forwarded to the ODPP recommending charges. No court outcome is on record.`,
    amount: [400, 5200],
  },
  oagAdverse: {
    channel: "oag", status: "oag_adverse_opinion", attribution: "political_head", years: [2019, 2025],
    title: "Adverse audit opinion",
    summary: (e) => `The Auditor-General issued an adverse opinion on the accounts of ${e}.`,
    amount: [900, 7800],
  },
  committeeAdverse: {
    channel: "parliament", status: "parl_committee_adverse_mention", attribution: "direct", years: [2019, 2025],
    title: "Named in a Public Accounts Committee report",
    summary: (e) => `A committee report on ${e} recommended further investigation of the office holder's role in irregular payments.`,
  },
  wealthGap: {
    channel: "mzalendo", status: "mz_wealth_declaration_gap", attribution: "direct", years: [2018, 2025],
    title: "Wealth declaration gap discussed in the House",
    summary: () => "Debate recorded in the Hansard questioned a gap between declared income and assets. No determination is on record.",
  },
  legacy: {
    channel: "eacc", status: "eacc_investigation_opened", attribution: "direct", years: [2008, 2011],
    title: "Legacy inquiry outside the 15-year window",
    summary: (e) => `An inquiry concerning ${e}. Excluded from the rating: older than the 15-year lookback.`,
  },
};

const RECIPES: Record<RatingBand, Array<keyof typeof T>[]> = {
  clear: [[], ["eaccClosed"], ["oagResolved", "vettingCleared"], ["vettingCleared"]],
  low: [["oagQualified", "hansardMention"], ["vettingConcern", "oagResolved"], ["hansardMention", "oagQualified", "vettingCleared"]],
  elevated: [
    ["eaccOpened", "oagUnresolved", "vettingConcern"],
    ["eaccOpened", "oagUnresolved", "oagQualified", "hansardMention"],
  ],
  high: [["eaccProsecution", "oagAdverse", "committeeAdverse", "oagUnresolved", "wealthGap"]],
};

/** FNV-1a 32-bit. Stable across runtimes. */
export function hashSlug(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function prng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Assign bands to slugs by hash order against MOCK_BAND_QUOTA. */
export function assignMockBands(slugs: string[]): Map<string, RatingBand> {
  const ordered = [...slugs].sort((a, b) => hashSlug(a) - hashSlug(b) || a.localeCompare(b));
  const out = new Map<string, RatingBand>();
  let i = 0;
  for (const [band, count] of MOCK_BAND_QUOTA) {
    for (let n = 0; n < count && i < ordered.length; n++) out.set(ordered[i++]!, band);
  }
  while (i < ordered.length) out.set(ordered[i++]!, "clear");
  return out;
}

function entityFor(person: RosterEntry, year: number): string {
  const match = [...person.appointments]
    .sort((a, b) => a.from.localeCompare(b.from))
    .filter((a) => Number(a.from.slice(0, 4)) <= year && a.office !== "Deputy President")
    .pop();
  return match ? `the Ministry of ${match.portfolio}` : "a prior public office";
}

export function mockFindings(person: RosterEntry, band: RatingBand): Finding[] {
  const rand = prng(hashSlug(person.slug));
  const recipes = RECIPES[band];
  const recipe = recipes[Math.floor(rand() * recipes.length)]!;
  const keys = [...recipe];
  // Roughly one profile in four also carries a record outside the window,
  // so the lookback rule is visible in the demo.
  if (rand() < 0.25) keys.push("legacy");

  return keys.map((key, idx) => {
    const t = T[key]!;
    const year = t.years[0] + Math.floor(rand() * (t.years[1] - t.years[0] + 1));
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 27);
    let date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // Vetting records must sit on an actual vetting date from the roster.
    if (t.status.startsWith("parl_vetting")) {
      const vetted = person.appointments.filter((a) => a.vetting === "approved" || a.vetting === "rejected");
      const pick = vetted[Math.floor(rand() * vetted.length)];
      if (pick) date = pick.from;
    }
    const entity = entityFor(person, Number(date.slice(0, 4)));
    const portal = PORTALS[t.channel];
    const amountKes = t.amount
      ? Math.round((t.amount[0] + rand() * (t.amount[1] - t.amount[0])) * 1e6)
      : undefined;
    return {
      id: `${person.slug}-${idx + 1}`,
      channel: t.channel,
      status: t.status,
      attribution: t.attribution,
      date,
      title: t.title,
      summary: `${t.summary(entity)} ${MOCK_DISCLOSURE}`,
      entity,
      amountKes,
      source: {
        label: portal.label,
        url: portal.url,
        reference: `MOCK-${t.channel.toUpperCase()}-${year}-${String(hashSlug(person.slug + idx) % 10000).padStart(4, "0")}`,
      },
      mock: true,
    };
  });
}
