import type { Cycle, CycleId, Source } from "../types";

/**
 * Source register. Records cite these ids. Press sources were located and
 * date-checked on 24 Sep 2026; each record still needs a reviewer to pin the
 * Kenya Gazette notice or Hansard page before it is "gazette_verified".
 */
export const SOURCES: Source[] = [
  { id: "star-2022-10-26", publisher: "The Star", date: "2022-10-26", title: "MPs approve Ruto's Cabinet nominees, overturn Malonza rejection", url: "https://www.the-star.co.ke/counties/nyanza/2022-10-26-mps-approve-rutos-cabinet-nominees-overturn-malonza-rejection" },
  { id: "standard-2022-10-27", publisher: "The Standard", date: "2022-10-27", title: "President Ruto appoints 22 Cabinet Secretaries, Attorney General and Secretary to the Cabinet", url: "https://www.standardmedia.co.ke/national/article/2001459125/president-ruto-appoints-22-cabinet-secretaries-attorney-general-and-secretary-to-the-cabinet" },
  { id: "citizen-2022-11-ps", publisher: "Citizen Digital", date: "2022-11-30", title: "President Ruto's 51 PS nominees approved by National Assembly", url: "https://www.citizen.digital/news/president-rutos-51-ps-nominees-approved-by-national-assembly-set-to-be-sworn-in-on-friday-n310415" },
  { id: "star-2022-12-02", publisher: "The Star", date: "2022-12-02", title: "Ruto presides over swearing-in of new Principal Secretaries", url: "https://www.the-star.co.ke/news/2022-12-02-ruto-presides-over-swearing-in-of-new-principal-secretaries" },
  { id: "citizen-2024-04-goma", publisher: "Citizen Digital", date: "2024-04-01", title: "DRC Consul-General nominee shocks MPs with glaring inexperience", url: "https://citizen.digital/article/charles-githinji-drc-consul-general-nominee-shocks-mps-with-glaring-inexperience-limited-education-n340295" },
  { id: "star-2024-04-09", publisher: "The Star", date: "2024-04-09", title: "Ambassadorial nominee Kemosi declines Ghana envoy job", url: "https://www.the-star.co.ke/news/2024-04-09-ambassadorial-nominee-kemosi-declines-ghana-envoy-job/" },
  { id: "star-2024-05-04", publisher: "The Star", date: "2024-05-04", title: "Ruto revokes appointment of ex-MP Mogaka as ambassador", url: "https://www.the-star.co.ke/news/2024-05-04-ruto-revokes-appointment-of-ex-mp-mogaka-as-ambassador" },
  { id: "capitalfm-2024-07-11", publisher: "Capital FM", date: "2024-07-11", title: "Ruto dismisses entire Cabinet apart from Mudavadi", url: "https://www.capitalfm.co.ke/news/2024/07/breaking-ruto-dismisses-entire-cabinet-apart-from-mudavadi/" },
  { id: "star-2024-07-30", publisher: "The Star", date: "2024-07-30", title: "Nominated Attorney General: who is Dorcas Oduor", url: "https://www.the-star.co.ke/news/2024-07-30-nominated-attorney-general-who-is-dorcas-oduor" },
  { id: "star-2024-08-07", publisher: "The Star", date: "2024-08-07", title: "Why vetting committee rejected Gender CS nominee Soi Lang'at", url: "https://www.the-star.co.ke/news/2024-08-07-why-vetting-committee-rejected-gender-cs-nominee-soi-langat" },
  { id: "nairobileo-2024-08-07", publisher: "Nairobi Leo", date: "2024-08-07", title: "National Assembly vetting committee approves 19 CS nominees, rejects one", url: "https://nairobileo.co.ke/news/article/16751/national-assembly-vetting-committee-approves-19-cs-nominees-rejects-one" },
  { id: "k24-2024-08-20", publisher: "K24 Digital", date: "2024-08-20", title: "Dorcas Oduor sworn in as Attorney General", url: "https://k24.digital/411/dorcas-oduor-sworn-in-as-attorney-general" },
  { id: "star-2024-10-18", publisher: "The Star", date: "2024-10-18", title: "MPs approve Kithure Kindiki as new Deputy President", url: "https://www.the-star.co.ke/news/realtime/2024-10-18-mps-approve-kithure-kindiki-as-new-deputy-president" },
  { id: "allafrica-2024-11-01", publisher: "allAfrica", date: "2024-11-01", title: "Kindiki sworn in as Deputy President", url: "https://allafrica.com/stories/202411010094.html" },
  { id: "eastleigh-2024-12-19", publisher: "The Eastleigh Voice", date: "2024-12-19", title: "Cabinet reshuffle: Murkomen moved to Interior as Mvurya takes over Sports", url: "https://eastleighvoice.co.ke/national/98534/cabinet-reshuffle:-murkomen-moved-to-interior-ministry-as-mvurya-takes-over-sports-docket" },
  { id: "capitalfm-2025-01-10", publisher: "Capital FM", date: "2025-01-10", title: "Former ICT CS Margaret Ndung'u declines Ghana ambassador nomination", url: "https://capitalfm.africa/former-ict-cs-margaret-ndungu-declines-ghana-ambassador-nomination/" },
  { id: "star-2025-01-17", publisher: "The Star", date: "2025-01-17", title: "Kabogo, Kagwe and Lee to be sworn in as CSs today", url: "https://www.the-star.co.ke/news/realtime/2025-01-17-kabogo-kagwe-and-lee-to-be-sworn-in-as-css-today" },
  { id: "ntv-2025-03-26", publisher: "NTV Kenya", date: "2025-03-26", title: "Justin Muturi sacked in Ruto reshuffle, Duale moved to Health", url: "https://ntvkenya.co.ke/news/justin-muturi-sacked-in-ruto-reshuffle-duale-moved-to-health-docket/" },
  { id: "nation-2025-03-26", publisher: "Daily Nation", date: "2025-03-26", title: "Ruto appoints Ruku, Hanna Cheptumo as Cabinet Secretaries", url: "https://nation.africa/kenya/news/ruto-appoints-ruku-hanna-cheptumo-as-cabinet-secretaries--5005950" },
  { id: "peopledaily-2025-08-15", publisher: "People Daily", date: "2025-08-15", title: "Ruto nominates former CS Florence Bore to diplomatic post", url: "https://peopledaily.digital/news/ruto-nominates-former-cs-florence-bore-to-diplomatic-post-in-major-shakeup" },
  { id: "parliament-2025-09-goma", publisher: "Parliament of Kenya", date: "2025-09-01", title: "Defence, Intelligence and Foreign Relations Committee vetting of envoy nominees", url: "https://www.parliament.go.ke/node/24532" },
  { id: "citizen-2025-10-03", publisher: "Citizen Digital", date: "2025-10-03", title: "Ruto appoints former CS Bore, 8 other ambassadors after Parliament's approval", url: "https://www.citizen.digital/news/ruto-appoints-former-cs-bore-8-other-ambassadors-after-parliaments-approval-n370810" },
  { id: "wiki-cabinet", publisher: "Wikipedia (cross-check only)", date: "2026-09-24", title: "Cabinet of Kenya", url: "https://en.wikipedia.org/wiki/Cabinet_of_Kenya" },
  { id: "gazette", publisher: "Kenya Law", date: "2026-09-24", title: "Kenya Gazette archive (verification index)", url: "https://new.kenyalaw.org/gazettes/" },
];

export const SOURCE_BY_ID = new Map(SOURCES.map((s) => [s.id, s]));

export const CYCLES: Cycle[] = [
  {
    id: "cs-2022",
    label: "Cabinet, 2022",
    date: "2022-09-27",
    body: "Committee on Appointments",
    summary: "Prime CS and 21 Cabinet Secretaries nominated 27 Sep 2022. The committee rejected one; the House overturned it and approved all 22 on 26 Oct 2022.",
    gate: true,
  },
  {
    id: "ps-2022",
    label: "Principal Secretaries, 2022",
    date: "2022-11-02",
    body: "National Assembly departmental committees",
    summary: "51 Principal Secretaries nominated 2 Nov 2022. All approved; sworn in 2 Dec 2022.",
    gate: true,
  },
  {
    id: "envoys-2024",
    label: "Envoys, 2024",
    date: "2024-03-08",
    body: "Defence, Intelligence and Foreign Relations Committee",
    summary: "One nominee rejected for lack of knowledge of the station; one declined, never appeared, and was gazetted in error before revocation.",
    gate: false,
  },
  {
    id: "cs-2024",
    label: "Cabinet reconstitution, 2024",
    date: "2024-07-19",
    body: "Committee on Appointments",
    summary: "After the 11 Jul 2024 dissolution, 20 nominees in two batches (19 and 24 Jul). 19 approved on 7 Aug 2024; one rejected.",
    gate: true,
  },
  {
    id: "ag-2024",
    label: "Attorney General, 2024",
    date: "2024-07-30",
    body: "Committee on Appointments",
    summary: "Attorney General office refilled after the dissolution; sworn in 20 Aug 2024.",
    gate: false,
  },
  {
    id: "elevation-2024",
    label: "Deputy President, 2024",
    date: "2024-10-18",
    body: "National Assembly plenary (Art. 149)",
    summary: "After the impeachment of Rigathi Gachagua, a sitting CS was approved as Deputy President by House vote with no committee hearing.",
    gate: false,
  },
  {
    id: "reshuffle-2024-12",
    label: "Reshuffle, Dec 2024",
    date: "2024-12-19",
    body: "Committee on Appointments",
    summary: "Three new Cabinet Secretaries (approved 16 Jan, sworn 17 Jan 2025); two CSs moved without new hearings.",
    gate: false,
  },
  {
    id: "envoys-2024-11",
    label: "Envoys, Nov 2024",
    date: "2024-11-19",
    body: "Defence, Intelligence and Foreign Relations Committee",
    summary: "Two sitting Cabinet Secretaries nominated as envoys, then replaced in cabinet a month later. One declined.",
    gate: false,
  },
  {
    id: "reshuffle-2025-03",
    label: "Reshuffle, Mar 2025",
    date: "2025-03-26",
    body: "Committee on Appointments",
    summary: "Public Service CS dismissed; Gender docket filled after a 231-day vacancy; Health and Environment swapped.",
    gate: false,
  },
  {
    id: "envoys-2025",
    label: "Envoys, 2025",
    date: "2025-08-15",
    body: "Defence, Intelligence and Foreign Relations Committee",
    summary: "A former Cabinet Secretary nominated to a diplomatic post; a second nominee to the Goma station after the 2024 rejection.",
    gate: false,
  },
];

export const CYCLE_BY_ID = new Map<CycleId, Cycle>(CYCLES.map((c) => [c.id, c]));

/** Date the ledger was compiled. Used as the deterministic Nostr timestamp. */
export const LEDGER_COMPILED = "2026-09-24";

/** The 2022 cabinet was dissolved on this date, except the Prime CS. */
export const DISSOLUTION_2024 = "2024-07-11";
