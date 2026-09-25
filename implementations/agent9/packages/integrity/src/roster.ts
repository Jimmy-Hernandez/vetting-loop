import type { Appointment, RosterEntry } from "./types";

/**
 * Appointment roster. FACTUAL fields only — no findings, no ratings.
 *
 * Compiled 24 Sep 2026 from The Star (27 Sep 2022, 2 Nov 2022), the
 * Parliament of Kenya approval record (8 Aug 2024), President.go.ke and a
 * cross-check against Wikipedia "Cabinet of Kenya". Verify against the
 * Kenya Gazette before external use.
 *
 * This roster is the 2027 pre-election placeholder. When the 2027
 * candidate list is known, replace PROFILED_ROSTER and keep the shape.
 */
export const ROSTER_PROVENANCE =
  "Agent9 roster compiled 24 Sep 2026 from The Star, Parliament of Kenya and President.go.ke. Pending Kenya Gazette verification.";

export const COHORTS = {
  "cs-2024": "Cabinet reconstitution vetted Jul–Aug 2024",
  "cs-2022": "Cabinet nominated 27 Sep 2022",
  "ps-2022": "Principal Secretaries nominated 2 Nov 2022",
} as const;

export type CohortKey = keyof typeof COHORTS;

const NOMINATED_2024 = "2024-07-20";
const APPROVED_2024 = "2024-08-08";
const NOMINATED_2022 = "2022-09-27";

function cs2024(portfolio: string, extra: Partial<Appointment> = {}): Appointment {
  return { office: "Cabinet Secretary", portfolio, from: APPROVED_2024, vetting: "approved", ...extra };
}

function cs2022(portfolio: string, extra: Partial<Appointment> = {}): Appointment {
  return {
    office: "Cabinet Secretary",
    portfolio,
    from: NOMINATED_2022,
    to: "2024-07-11",
    vetting: "approved",
    note: "Cabinet dissolved 11 Jul 2024",
    ...extra,
  };
}

/**
 * The 20 nominees vetted by the Committee on Appointments in the 2024
 * reconstitution: 19 approved on 8 Aug 2024, one rejected. These are the
 * profiled individuals in the Integrity Index.
 */
export const PROFILED_ROSTER: RosterEntry[] = [
  {
    slug: "kithure-kindiki",
    fullName: "Kithure Kindiki",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Deputy President",
    appointments: [
      { office: "Deputy President", portfolio: "Office of the Deputy President", from: "2024-11-01", vetting: "not_vetted", note: "Sworn in after the impeachment of Rigathi Gachagua" },
      cs2024("Interior and National Administration", { to: "2024-11-01" }),
      cs2022("Interior and National Administration"),
    ],
    notes: ["Resigned as Interior CS on appointment as Deputy President, 1 Nov 2024."],
  },
  {
    slug: "deborah-mlongo-barasa",
    fullName: "Deborah Mlongo Barasa",
    cohorts: ["cs-2024"],
    currentRole: "Cabinet Secretary, Environment, Climate Change and Forestry",
    appointments: [
      { office: "Cabinet Secretary", portfolio: "Environment, Climate Change and Forestry", from: "2025-03-26", vetting: "not_vetted", note: "Moved in the 26 Mar 2025 reshuffle" },
      cs2024("Health", { to: "2025-03-26" }),
    ],
    notes: ["Moved from Health to Environment, 26 Mar 2025."],
  },
  {
    slug: "alice-wahome",
    fullName: "Alice Wahome",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary, Lands, Public Works, Housing and Urban Development",
    appointments: [cs2024("Lands, Public Works, Housing and Urban Development"), cs2022("Water, Sanitation and Irrigation")],
    notes: ["Returned in the 2024 reconstitution."],
  },
  {
    slug: "julius-migos-ogamba",
    fullName: "Julius Migos Ogamba",
    cohorts: ["cs-2024"],
    currentRole: "Cabinet Secretary, Education",
    appointments: [cs2024("Education")],
    notes: [],
  },
  {
    slug: "roselinda-soipan-tuya",
    fullName: "Roselinda Soipan Tuya",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary, Defence",
    appointments: [cs2024("Defence"), cs2022("Environment, Climate Change and Forestry")],
    notes: ["Returned in 2024, moved from Environment to Defence."],
  },
  {
    slug: "andrew-mwihia-karanja",
    fullName: "Andrew Mwihia Karanja",
    cohorts: ["cs-2024"],
    currentRole: "Nominated envoy (Brazil)",
    appointments: [cs2024("Agriculture and Livestock Development", { to: "2025-01-17", note: "Replaced by Mutahi Kagwe" })],
    notes: ["Replaced at Agriculture 17 Jan 2025; subsequently named envoy to Brazil."],
  },
  {
    slug: "aden-barre-duale",
    fullName: "Aden Barre Duale",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary, Health",
    appointments: [
      { office: "Cabinet Secretary", portfolio: "Health", from: "2025-03-26", vetting: "not_vetted", note: "Moved in the 26 Mar 2025 reshuffle" },
      cs2024("Environment, Climate Change and Forestry", { to: "2025-03-26" }),
      cs2022("Defence"),
    ],
    notes: ["Returned in 2024 at Environment; moved to Health 26 Mar 2025."],
  },
  {
    slug: "eric-muriithi-mugaa",
    fullName: "Eric Muriithi Mugaa",
    cohorts: ["cs-2024"],
    currentRole: "Cabinet Secretary, Water, Sanitation and Irrigation",
    appointments: [cs2024("Water, Sanitation and Irrigation")],
    notes: [],
  },
  {
    slug: "davis-chirchir",
    fullName: "Davis Chirchir",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary, Roads and Transport",
    appointments: [cs2024("Roads and Transport"), cs2022("Energy and Petroleum")],
    notes: ["Returned in 2024, moved from Energy to Roads."],
  },
  {
    slug: "margaret-nyambura-ndungu",
    fullName: "Margaret Nyambura Ndung'u",
    cohorts: ["cs-2024"],
    currentRole: "Former Cabinet Secretary",
    appointments: [cs2024("Information, Communication and the Digital Economy", { to: "2025-01-17", note: "Replaced by William Kabogo Gitau" })],
    notes: ["Replaced 17 Jan 2025; named envoy to Ghana and publicly declined the nomination."],
  },
  {
    slug: "john-mbadi-ngongo",
    fullName: "John Mbadi Ng'ongo",
    cohorts: ["cs-2024"],
    currentRole: "Cabinet Secretary, National Treasury and Economic Planning",
    appointments: [cs2024("National Treasury and Economic Planning", { note: "Opposition MP at nomination" })],
    notes: ["One of four opposition figures in the 2024 broad-based cabinet."],
  },
  {
    slug: "salim-mvurya-mgala",
    fullName: "Salim Mvurya Mgala",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary",
    appointments: [
      cs2024("Investments, Trade and Industry", { to: "2025-01-17", note: "Moved; Lee Kinyanjui appointed" }),
      cs2022("Mining, Blue Economy and Maritime Affairs"),
    ],
    notes: ["Returned in 2024 at Trade; moved in the 17 Jan 2025 changes."],
  },
  {
    slug: "rebecca-miano",
    fullName: "Rebecca Miano",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary, Tourism and Wildlife",
    appointments: [cs2024("Tourism and Wildlife"), cs2022("East African Community and Regional Development")],
    notes: ["Returned in 2024, moved from EAC to Tourism."],
  },
  {
    slug: "james-opiyo-wandayi",
    fullName: "James Opiyo Wandayi",
    cohorts: ["cs-2024"],
    currentRole: "Cabinet Secretary, Energy and Petroleum",
    appointments: [cs2024("Energy and Petroleum", { note: "Opposition MP at nomination" })],
    notes: ["One of four opposition figures in the 2024 broad-based cabinet."],
  },
  {
    slug: "kipchumba-murkomen",
    fullName: "Kipchumba Murkomen",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary, Interior and National Administration",
    appointments: [
      { office: "Cabinet Secretary", portfolio: "Interior and National Administration", from: "2025-03-26", vetting: "not_vetted", note: "Took the docket after Kindiki became Deputy President; date approximate" },
      cs2024("Youth Affairs, Creative Economy and Sports"),
      cs2022("Roads and Transport"),
    ],
    notes: ["Returned in 2024 at Youth and Sports; later listed as Interior CS."],
  },
  {
    slug: "hassan-ali-joho",
    fullName: "Hassan Ali Joho",
    cohorts: ["cs-2024"],
    currentRole: "Cabinet Secretary, Mining, Blue Economy and Maritime Affairs",
    appointments: [cs2024("Mining, Blue Economy and Maritime Affairs", { note: "Opposition figure at nomination" })],
    notes: ["One of four opposition figures in the 2024 broad-based cabinet."],
  },
  {
    slug: "alfred-nganga-mutua",
    fullName: "Alfred Nganga Mutua",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Cabinet Secretary, Labour and Social Protection",
    appointments: [cs2024("Labour and Social Protection"), cs2022("Foreign and Diaspora Affairs")],
    notes: ["Returned in 2024, moved from Foreign Affairs to Labour."],
  },
  {
    slug: "wycliffe-ambetsa-oparanya",
    fullName: "Wycliffe Ambetsa Oparanya",
    cohorts: ["cs-2024"],
    currentRole: "Cabinet Secretary, Cooperatives and MSME Development",
    appointments: [cs2024("Cooperatives and MSME Development", { note: "Opposition figure at nomination" })],
    notes: ["One of four opposition figures in the 2024 broad-based cabinet."],
  },
  {
    slug: "justin-bedan-njoka-muturi",
    fullName: "Justin Bedan Njoka Muturi",
    cohorts: ["cs-2024", "cs-2022"],
    currentRole: "Former Cabinet Secretary",
    appointments: [
      cs2024("Public Service and Human Capital Development", { to: "2025-03-26", note: "Dismissed 26 Mar 2025" }),
      { office: "Attorney General", portfolio: "Office of the Attorney General", from: NOMINATED_2022, to: "2024-07-11", vetting: "approved" },
    ],
    notes: ["Dismissed 26 Mar 2025 after a public disagreement with the President."],
  },
  {
    slug: "stella-soi-langat",
    fullName: "Stella Soi Lang'at",
    cohorts: ["cs-2024"],
    currentRole: "Nominee (not approved)",
    appointments: [
      {
        office: "Cabinet Secretary (nominee)",
        portfolio: "Gender, Culture, Arts and Heritage",
        from: NOMINATED_2024,
        vetting: "rejected",
        note: "Committee found she failed to demonstrate adequate knowledge of the portfolio",
      },
    ],
    notes: ["The only rejection of the 2024 cycle, on knowledge-of-docket grounds, not integrity grounds."],
  },
];

/** 2022 Cabinet nominees (27 Sep 2022), for the roster view. */
export const ROSTER_2022_CS: Array<{ name: string; portfolio: string }> = [
  { name: "Musalia Mudavadi", portfolio: "Prime Cabinet Secretary" },
  { name: "Kithure Kindiki", portfolio: "Interior and National Administration" },
  { name: "Prof. Njuguna Ndung'u", portfolio: "National Treasury and Economic Planning" },
  { name: "Aisha Jumwa", portfolio: "Public Service and Gender" },
  { name: "Aden Duale", portfolio: "Defence" },
  { name: "Alice Wahome", portfolio: "Water, Sanitation and Irrigation" },
  { name: "Alfred Mutua", portfolio: "Foreign and Diaspora Affairs" },
  { name: "Moses Kuria", portfolio: "Investments, Trade and Industry" },
  { name: "Rebecca Miano", portfolio: "East African Community and Regional Development" },
  { name: "Kipchumba Murkomen", portfolio: "Roads and Transport" },
  { name: "Zachariah Mwangi Njeru", portfolio: "Lands, Public Works, Housing and Urban Development" },
  { name: "Peninah Malonza", portfolio: "Tourism and Wildlife" },
  { name: "Mithika Linturi", portfolio: "Agriculture and Livestock Development" },
  { name: "Ezekiel Machogu", portfolio: "Education" },
  { name: "Davis Chirchir", portfolio: "Energy and Petroleum" },
  { name: "Ababu Namwamba", portfolio: "Youth Affairs, Sports and Arts" },
  { name: "Simon Chelugui", portfolio: "Cooperatives and MSME Development" },
  { name: "Salim Mvurya", portfolio: "Mining, Blue Economy and Maritime Affairs" },
  { name: "Florence Bore", portfolio: "Labour and Social Protection" },
  { name: "Susan Nakhumicha Wafula", portfolio: "Health" },
  { name: "Eliud Owalo", portfolio: "Information, Communication and the Digital Economy" },
  { name: "Roselinda Soipan Tuya", portfolio: "Environment, Climate Change and Forestry" },
];

/** 2025 appointments made outside the 2024 vetting cycle. */
export const ROSTER_2025_CHANGES: Array<{ name: string; portfolio: string; date: string }> = [
  { name: "Mutahi Kagwe", portfolio: "Agriculture and Livestock Development", date: "2025-01-17" },
  { name: "Lee Kinyanjui", portfolio: "Investments, Trade and Industry", date: "2025-01-17" },
  { name: "William Kabogo Gitau", portfolio: "Information, Communication and Digital Economy", date: "2025-01-17" },
  { name: "Geoffrey Ruku", portfolio: "Public Service and Human Capital Development", date: "2025-03-26" },
  { name: "Hanna Wendot Cheptumo", portfolio: "Gender, Culture, Arts and Heritage", date: "2025-03-26" },
  { name: "Dorcas Oduor", portfolio: "Attorney General", date: "2025" },
];

/** Principal Secretaries nominated 2 Nov 2022 (51). */
export const ROSTER_2022_PS: Array<{ name: string; department: string }> = [
  ["Julius Korir", "Cabinet Affairs"],
  ["Teresia Mbaika Malokwe", "Devolution"],
  ["Esther Ngero", "Performance and Delivery Management"],
  ["Aurelia Rono", "Parliamentary Affairs"],
  ["Raymond Omollo", "Interior and National Administration"],
  ["Caroline Nyawira Murage", "Correctional Services"],
  ["Amb. Julius Bitok", "Citizen Services"],
  ["Dr. Chris Kiptoo", "The National Treasury"],
  ["James Muhati", "Economic Planning"],
  ["Patrick Mariro", "Defence"],
  ["Korir Sing'Oei", "Foreign Affairs"],
  ["Roseline Njogu", "Diaspora Affairs"],
  ["Amos Gathecha", "Public Service"],
  ["Veronica Mueni Nduva", "Gender and Affirmative Action"],
  ["Joseph Mungai Mbugua", "Roads"],
  ["Mohamed Dhagar", "Transport"],
  ["Nixon Korir", "Lands and Physical Planning"],
  ["Charles Hinga", "Housing and Urban Development"],
  ["Joel Arumonyang", "Public Works"],
  ["Prof. Edward Kisiangani", "Broadcasting and Telecommunications"],
  ["Eng. John Kipchumba Tanui", "ICT and Digital Economy"],
  ["Eng. Peter Tum", "Medical Services"],
  ["Dr. Joseph Mburu", "Health Standards and Professional Management"],
  ["Dr. Belio Kipsang", "Basic Education"],
  ["Esther Thaara Muhoria", "TVET"],
  ["Beatrice Inyangala", "Higher Education and Research"],
  ["Phillip Kello Harsama", "Crop Development"],
  ["Harry Kimutai", "Livestock Development"],
  ["Alfred K'Ombundo", "Trade"],
  ["Abubakar Hassan", "Investment Promotion"],
  ["Juma Mukhwana", "Industry"],
  ["Patrick Kiburi Kilemi", "Cooperatives"],
  ["Susan Mangeni", "MSMEs Development"],
  ["Ismail Madey", "Youth Affairs"],
  ["Jonathan Mueke", "Sports and The Arts"],
  ["Festus Ngeno", "Environment"],
  ["Ephantus Kimotho", "Forestry"],
  ["John Ololtuaa", "Tourism"],
  ["Sylvia Naseya Muhoro", "Wildlife"],
  ["Ummy Mohammed Bashir", "Culture and Heritage"],
  ["Dr. Paul Ronoh", "Water and Sanitation"],
  ["Gitonga Mugambi", "Irrigation"],
  ["Alex Wachira", "Energy"],
  ["Mohamed Liban", "Petroleum"],
  ["Geoffrey Kaituko", "Labour and Skills Development"],
  ["Joseph Mugosi Mutavi", "Social Protection and Senior Citizen Affairs"],
  ["Abdi Dubart", "East African Community Development"],
  ["Idris Dogota", "The ASALs and Regional Development"],
  ["Elijah Mwangi", "Mining"],
  ["Betsy Muthoni Njagi", "Blue Economy and Fisheries"],
  ["Shadrack Mwadime", "Shipping and Maritime Affairs"],
].map(([name, department]) => ({ name, department }));
