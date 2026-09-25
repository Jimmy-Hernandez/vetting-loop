import type { Appointment, Person } from "../types";
import { DISSOLUTION_2024 } from "./sources";

/**
 * Cabinet-level appointment histories, 2022–2025.
 *
 * Dates and outcomes were cross-checked against dated press reports on
 * 24 Sep 2026 (see sources.ts). Records become "gazette_verified" only when
 * a reviewer pins the Gazette notice. Known gap: intra-term reshuffles of
 * Oct 2023 are not yet compiled, so 2022 portfolios are the dockets at
 * nomination.
 */

const APPROVED_2022 = "2022-10-26";
const SWORN_2022 = "2022-10-27";
const BATCH1_2024 = "2024-07-19";
const BATCH2_2024 = "2024-07-24";
const APPROVED_2024 = "2024-08-07";
const RESHUFFLE_DEC_2024 = "2024-12-19";
const RESHUFFLE_MAR_2025 = "2025-03-26";

const S2022 = ["standard-2022-10-27", "star-2022-10-26"];
const S2024 = ["nairobileo-2024-08-07", "capitalfm-2024-07-11"];

type Extra = Partial<Appointment>;

function cs2022(slug: string, portfolio: string, extra: Extra = {}): Appointment {
  return {
    id: `${slug}:cs-2022`,
    office: "cabinet_secretary",
    portfolio,
    cycle: "cs-2022",
    nominated: "2022-09-27",
    decided: APPROVED_2022,
    from: SWORN_2022,
    to: DISSOLUTION_2024,
    outcome: "approved",
    appearance: "appeared",
    exit: "dissolved",
    sources: S2022,
    verification: "cross_checked",
    ...extra,
  };
}

function cs2024(slug: string, portfolio: string, batch: 1 | 2, extra: Extra = {}): Appointment {
  return {
    id: `${slug}:cs-2024`,
    office: "cabinet_secretary",
    portfolio,
    cycle: "cs-2024",
    nominated: batch === 1 ? BATCH1_2024 : BATCH2_2024,
    decided: APPROVED_2024,
    from: "2024-08-08",
    outcome: "approved",
    appearance: "appeared",
    sources: S2024,
    verification: "cross_checked",
    ...extra,
  };
}

function moved(slug: string, portfolio: string, from: string, cycle: Appointment["cycle"], sources: string[]): Appointment {
  return {
    id: `${slug}:${cycle}`,
    office: "cabinet_secretary",
    portfolio,
    cycle,
    from,
    outcome: "reassigned",
    appearance: "not_required",
    note: "Moved between dockets by the President; no new approval hearing.",
    sources,
    verification: "cross_checked",
  };
}

function person(slug: string, name: string, latestRole: string, build: (slug: string) => Appointment[]): Person {
  return { slug, name, latestRole, appointments: build(slug) };
}

const ODM = { note: "Opposition (ODM) figure in the broad-based cabinet." };

/** The 20 nominees vetted in the 2024 reconstitution. */
export const CABINET_2024: Person[] = [
  person("kithure-kindiki", "Kithure Kindiki", "Deputy President", (s) => [
    cs2022(s, "Interior and National Administration"),
    cs2024(s, "Interior and National Administration", 1, { to: "2024-11-01", exit: "elevated" }),
    {
      id: `${s}:elevation-2024`,
      office: "deputy_president",
      portfolio: "Office of the Deputy President",
      cycle: "elevation-2024",
      nominated: "2024-10-18",
      decided: "2024-10-18",
      from: "2024-11-01",
      outcome: "approved",
      appearance: "not_required",
      note: "Nominated after the impeachment of Rigathi Gachagua (National Assembly 8 Oct, Senate 17 Oct 2024). Approved by unanimous House vote under Art. 149(1); no committee hearing and no public participation.",
      sources: ["star-2024-10-18", "allafrica-2024-11-01"],
      verification: "cross_checked",
    },
  ]),
  person("deborah-mlongo-barasa", "Deborah Mlongo Barasa", "Cabinet Secretary, Environment, Climate Change and Forestry", (s) => [
    cs2024(s, "Health", 1, { to: RESHUFFLE_MAR_2025, exit: "reassigned" }),
    moved(s, "Environment, Climate Change and Forestry", RESHUFFLE_MAR_2025, "reshuffle-2025-03", ["ntv-2025-03-26"]),
  ]),
  person("alice-wahome", "Alice Wahome", "Cabinet Secretary, Lands, Public Works, Housing and Urban Development", (s) => [
    cs2022(s, "Water, Sanitation and Irrigation"),
    cs2024(s, "Lands, Public Works, Housing and Urban Development", 1),
  ]),
  person("julius-migos-ogamba", "Julius Migos Ogamba", "Cabinet Secretary, Education", (s) => [cs2024(s, "Education", 1)]),
  person("roselinda-soipan-tuya", "Roselinda Soipan Tuya", "Cabinet Secretary, Defence", (s) => [
    cs2022(s, "Environment, Climate Change and Forestry"),
    cs2024(s, "Defence", 1),
  ]),
  person("andrew-mwihia-karanja", "Andrew Mwihia Karanja", "Envoy nominee (Brazil)", (s) => [
    cs2024(s, "Agriculture and Livestock Development", 1, { to: RESHUFFLE_DEC_2024, exit: "removed" }),
    {
      id: `${s}:envoys-2024-11`,
      office: "envoy",
      portfolio: "Ambassador to Brazil",
      cycle: "envoys-2024-11",
      nominated: "2024-11-19",
      outcome: "unrecorded",
      appearance: "unknown",
      note: "Nominated as envoy while serving as CS; replaced in cabinet on 19 Dec 2024.",
      sources: ["capitalfm-2025-01-10", "star-2025-01-17"],
      verification: "cross_checked",
    },
  ]),
  person("aden-barre-duale", "Aden Barre Duale", "Cabinet Secretary, Health", (s) => [
    cs2022(s, "Defence"),
    cs2024(s, "Environment, Climate Change and Forestry", 1, { to: RESHUFFLE_MAR_2025, exit: "reassigned" }),
    moved(s, "Health", RESHUFFLE_MAR_2025, "reshuffle-2025-03", ["ntv-2025-03-26"]),
  ]),
  person("eric-muriithi-mugaa", "Eric Muriithi Mugaa", "Cabinet Secretary, Water, Sanitation and Irrigation", (s) => [
    cs2024(s, "Water, Sanitation and Irrigation", 1),
  ]),
  person("davis-chirchir", "Davis Chirchir", "Cabinet Secretary, Roads and Transport", (s) => [
    cs2022(s, "Energy and Petroleum"),
    cs2024(s, "Roads and Transport", 1),
  ]),
  person("margaret-nyambura-ndungu", "Margaret Nyambura Ndung'u", "Former Cabinet Secretary", (s) => [
    cs2024(s, "Information, Communication and the Digital Economy", 1, { to: RESHUFFLE_DEC_2024, exit: "removed" }),
    {
      id: `${s}:envoys-2024-11`,
      office: "envoy",
      portfolio: "High Commissioner to Ghana",
      cycle: "envoys-2024-11",
      nominated: "2024-11-19",
      decided: "2025-01-10",
      outcome: "declined",
      appearance: "not_required",
      note: "Nominated as envoy while serving as CS; declined the posting in writing on 10 Jan 2025.",
      sources: ["capitalfm-2025-01-10"],
      verification: "cross_checked",
    },
  ]),
  person("john-mbadi-ngongo", "John Mbadi Ng'ongo", "Cabinet Secretary, National Treasury and Economic Planning", (s) => [
    cs2024(s, "National Treasury and Economic Planning", 2, ODM),
  ]),
  person("salim-mvurya-mgala", "Salim Mvurya Mgala", "Cabinet Secretary, Youth Affairs, Creative Economy and Sports", (s) => [
    cs2022(s, "Mining, Blue Economy and Maritime Affairs"),
    cs2024(s, "Investments, Trade and Industry", 2, { to: RESHUFFLE_DEC_2024, exit: "reassigned" }),
    moved(s, "Youth Affairs, Creative Economy and Sports", RESHUFFLE_DEC_2024, "reshuffle-2024-12", ["eastleigh-2024-12-19"]),
  ]),
  person("rebecca-miano", "Rebecca Miano", "Cabinet Secretary, Tourism and Wildlife", (s) => [
    cs2022(s, "East African Community and Regional Development"),
    cs2024(s, "Tourism and Wildlife", 2),
  ]),
  person("james-opiyo-wandayi", "James Opiyo Wandayi", "Cabinet Secretary, Energy and Petroleum", (s) => [
    cs2024(s, "Energy and Petroleum", 2, ODM),
  ]),
  person("kipchumba-murkomen", "Kipchumba Murkomen", "Cabinet Secretary, Interior and National Administration", (s) => [
    cs2022(s, "Roads and Transport"),
    cs2024(s, "Youth Affairs, Creative Economy and Sports", 1, { to: RESHUFFLE_DEC_2024, exit: "reassigned" }),
    moved(s, "Interior and National Administration", RESHUFFLE_DEC_2024, "reshuffle-2024-12", ["eastleigh-2024-12-19"]),
  ]),
  person("hassan-ali-joho", "Hassan Ali Joho", "Cabinet Secretary, Mining, Blue Economy and Maritime Affairs", (s) => [
    cs2024(s, "Mining, Blue Economy and Maritime Affairs", 2, ODM),
  ]),
  person("alfred-nganga-mutua", "Alfred Nganga Mutua", "Cabinet Secretary, Labour and Social Protection", (s) => [
    cs2022(s, "Foreign and Diaspora Affairs"),
    cs2024(s, "Labour and Social Protection", 2),
  ]),
  person("wycliffe-ambetsa-oparanya", "Wycliffe Ambetsa Oparanya", "Cabinet Secretary, Cooperatives and MSME Development", (s) => [
    cs2024(s, "Cooperatives and MSME Development", 2, ODM),
  ]),
  person("justin-bedan-njoka-muturi", "Justin Bedan Njoka Muturi", "Former Cabinet Secretary", (s) => [
    cs2022(s, "Attorney General", { office: "attorney_general" }),
    cs2024(s, "Public Service and Human Capital Development", 2, {
      to: RESHUFFLE_MAR_2025,
      exit: "dismissed",
      note: "Dismissed on 26 Mar 2025 after public disagreement with the President over the 2024 abductions.",
      sources: [...S2024, "ntv-2025-03-26"],
    }),
  ]),
  person("stella-soi-langat", "Stella Soi Lang'at", "Nominee (not approved)", (s) => [
    cs2024(s, "Gender, Culture, Arts and Heritage", 2, {
      from: undefined,
      outcome: "rejected",
      committeeRecommendation: "reject",
      statedGrounds:
        "failed to demonstrate adequate knowledge of topical, administrative and technical issues touching on the portfolio",
      sources: ["star-2024-08-07", "nairobileo-2024-08-07"],
    }),
  ]),
];

/** 2022 Cabinet members who were not renominated in 2024. */
export const CABINET_2022_ONLY: Person[] = [
  person("musalia-mudavadi", "Musalia Mudavadi", "Prime Cabinet Secretary", (s) => [
    cs2022(s, "Prime Cabinet Secretary", {
      office: "prime_cs",
      to: undefined,
      exit: undefined,
      note: "The only member retained when the cabinet was dissolved on 11 Jul 2024; also holds Foreign and Diaspora Affairs.",
      sources: [...S2022, "capitalfm-2024-07-11"],
    }),
  ]),
  person("njuguna-ndungu", "Njuguna Ndung'u", "Former Cabinet Secretary", (s) => [cs2022(s, "National Treasury and Economic Planning")]),
  person("aisha-jumwa", "Aisha Jumwa", "Former Cabinet Secretary", (s) => [cs2022(s, "Public Service and Gender")]),
  person("moses-kuria", "Moses Kuria", "Former Cabinet Secretary", (s) => [cs2022(s, "Investments, Trade and Industry")]),
  person("zachariah-mwangi-njeru", "Zachariah Mwangi Njeru", "Former Cabinet Secretary", (s) => [
    cs2022(s, "Lands, Public Works, Housing and Urban Development"),
  ]),
  person("peninah-malonza", "Peninah Malonza", "Former Cabinet Secretary", (s) => [
    cs2022(s, "Tourism and Wildlife", {
      committeeRecommendation: "reject",
      note: "The Committee on Appointments recommended rejection; the House overturned it on the floor on 26 Oct 2022.",
      sources: ["star-2022-10-26", "standard-2022-10-27"],
    }),
  ]),
  person("mithika-linturi", "Mithika Linturi", "Former Cabinet Secretary", (s) => [cs2022(s, "Agriculture and Livestock Development")]),
  person("ezekiel-machogu", "Ezekiel Machogu", "Former Cabinet Secretary", (s) => [cs2022(s, "Education")]),
  person("ababu-namwamba", "Ababu Namwamba", "Former Cabinet Secretary", (s) => [cs2022(s, "Youth Affairs, Sports and Arts")]),
  person("simon-chelugui", "Simon Chelugui", "Former Cabinet Secretary", (s) => [cs2022(s, "Cooperatives and MSME Development")]),
  person("florence-bore", "Florence Bore", "High Commissioner to Namibia", (s) => [
    cs2022(s, "Labour and Social Protection"),
    {
      id: `${s}:envoys-2025`,
      office: "envoy",
      portfolio: "High Commissioner to Namibia",
      cycle: "envoys-2025",
      nominated: "2025-08-15",
      decided: "2025-09",
      from: "2025-10-03",
      outcome: "approved",
      appearance: "appeared",
      note: "Vetted and cleared by the Defence, Intelligence and Foreign Relations Committee in September 2025.",
      sources: ["peopledaily-2025-08-15", "citizen-2025-10-03"],
      verification: "cross_checked",
    },
  ]),
  person("susan-nakhumicha-wafula", "Susan Nakhumicha Wafula", "Former Cabinet Secretary", (s) => [cs2022(s, "Health")]),
  person("eliud-owalo", "Eliud Owalo", "Former Cabinet Secretary", (s) => [
    cs2022(s, "Information, Communication and the Digital Economy"),
  ]),
];

function newCs(slug: string, portfolio: string, cycle: Appointment["cycle"], dates: Pick<Appointment, "nominated" | "decided" | "from">, sources: string[], extra: Extra = {}): Appointment {
  return { id: `${slug}:${cycle}`, office: "cabinet_secretary", portfolio, cycle, ...dates, outcome: "approved", appearance: "appeared", sources, verification: "cross_checked", ...extra };
}

const DEC_2024 = { nominated: RESHUFFLE_DEC_2024, decided: "2025-01-16", from: "2025-01-17" };
const MAR_2025 = { nominated: RESHUFFLE_MAR_2025, from: "2025-04-17" };

/** Appointments made after the 2024 reconstitution, and diplomatic cases. */
export const LATER_APPOINTEES: Person[] = [
  person("mutahi-kagwe", "Mutahi Kagwe", "Cabinet Secretary, Agriculture and Livestock Development", (s) => [
    newCs(s, "Agriculture and Livestock Development", "reshuffle-2024-12", DEC_2024, ["star-2025-01-17"]),
  ]),
  person("lee-kinyanjui", "Lee Kinyanjui", "Cabinet Secretary, Investments, Trade and Industry", (s) => [
    newCs(s, "Investments, Trade and Industry", "reshuffle-2024-12", DEC_2024, ["star-2025-01-17"]),
  ]),
  person("william-kabogo-gitau", "William Kabogo Gitau", "Cabinet Secretary, Information, Communication and the Digital Economy", (s) => [
    newCs(s, "Information, Communication and the Digital Economy", "reshuffle-2024-12", DEC_2024, ["star-2025-01-17"]),
  ]),
  person("geoffrey-ruku", "Geoffrey Ruku", "Cabinet Secretary, Public Service and Human Capital Development", (s) => [
    newCs(s, "Public Service and Human Capital Development", "reshuffle-2025-03", MAR_2025, ["nation-2025-03-26"]),
  ]),
  person("hanna-wendot-cheptumo", "Hanna Wendot Cheptumo", "Cabinet Secretary, Gender, Culture, Arts and Heritage", (s) => [
    newCs(s, "Gender, Culture, Arts and Heritage", "reshuffle-2025-03", MAR_2025, ["nation-2025-03-26"], {
      note: "Filled the docket left vacant since the 7 Aug 2024 rejection.",
    }),
  ]),
  person("dorcas-oduor", "Dorcas Oduor", "Attorney General", (s) => [
    {
      id: `${s}:ag-2024`,
      office: "attorney_general",
      portfolio: "Attorney General",
      cycle: "ag-2024",
      nominated: "2024-07-30",
      from: "2024-08-20",
      outcome: "approved",
      appearance: "appeared",
      note: "First woman to hold the office. Refilled the post vacant since the July 2024 dissolution.",
      sources: ["star-2024-07-30", "k24-2024-08-20"],
      verification: "cross_checked",
    },
  ]),
  person("vincent-mogaka-kemosi", "Vincent Mogaka Kemosi", "Former envoy nominee", (s) => [
    {
      id: `${s}:envoys-2024`,
      office: "envoy",
      portfolio: "High Commissioner to Ghana",
      cycle: "envoys-2024",
      nominated: "2024-03-08",
      decided: "2024-04-09",
      outcome: "declined",
      appearance: "did_not_appear",
      statedGrounds: "compelling personal and family matters",
      gazettedWithoutApproval: { notice: "Gazette Notice No. 5162 of 3 May 2024", revokedBy: "Gazette Notice No. 5351" },
      note: "Declined in writing on 9 Apr 2024 and never appeared for vetting. His name was still gazetted on 3 May 2024, which State House called a mistake, and the appointment was revoked days later.",
      sources: ["star-2024-04-09", "star-2024-05-04"],
      verification: "cross_checked",
    },
  ]),
  person("charles-githinji-kiiru", "Charles Githinji Kiiru", "Former envoy nominee", (s) => [
    {
      id: `${s}:envoys-2024`,
      office: "envoy",
      portfolio: "Consul-General, Goma (DR Congo)",
      cycle: "envoys-2024",
      decided: "2024-04",
      outcome: "rejected",
      appearance: "appeared",
      committeeRecommendation: "reject",
      note: "Rejected in April 2024 by the Defence, Intelligence and Foreign Relations Committee for lack of knowledge of the role and the station.",
      sources: ["citizen-2024-04-goma"],
      verification: "cross_checked",
    },
  ]),
  person("judy-kiaria-nkumiri", "Judy Kiaria Nkumiri", "Consul-General nominee, Goma", (s) => [
    {
      id: `${s}:envoys-2025`,
      office: "envoy",
      portfolio: "Consul-General, Goma (DR Congo)",
      cycle: "envoys-2025",
      decided: "2025-09",
      outcome: "unrecorded",
      appearance: "appeared",
      note: "During her hearing, members noted that a previous nominee to this station had been rejected for lack of basic knowledge.",
      sources: ["parliament-2025-09-goma"],
      verification: "cross_checked",
    },
  ]),
];
