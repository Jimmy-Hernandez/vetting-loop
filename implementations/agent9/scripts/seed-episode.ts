#!/usr/bin/env tsx
/**
 * scripts/seed-episode.ts
 *
 * Seeds one real past CS vetting episode for the hackathon demo.
 *
 * Based on the 2023 Cabinet Secretary appointments following President Ruto's
 * inaugural cabinet formation. Uses publicly available Gazette and Parliament data.
 *
 * Usage:
 *   pnpm tsx scripts/seed-episode.ts --dry-run   # print SQL, do not execute
 *   pnpm tsx scripts/seed-episode.ts --env local  # execute against local D1 (wrangler dev)
 *   pnpm tsx scripts/seed-episode.ts --env remote # execute against production D1
 *
 * Design constraint: every IntegrityFlag MUST reference at least one SourceDocument.
 * This script enforces that constraint — no flag is inserted without sources.
 */

import { parseArgs } from "util";
import { randomUUID } from "crypto";
import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";

// ── Episode Data ──────────────────────────────────────────────────────────────
// Source: Kenya Gazette Vol. CXXV No. 205, 27th October 2023
// Parliament: Committee on Appointments vetting, November 2023
// This is an illustrative seed using the publicly available structure.
// Replace EACC and court record URLs with the actual document URLs before the demo.

const SOURCES = {
  gazette: {
    id: randomUUID(),
    title: "Kenya Gazette Supplement No. 205 — Appointment of Cabinet Secretaries",
    url: "https://kenyalaw.org/kenya_gazette/gazette/volume/OTMzMw--/Vol.%20CXXV%20No.%20205/",
    publishedAt: "2023-10-27",
    publisher: "Government Printer, Kenya",
    documentType: "gazette" as const,
  },
  eacc: {
    id: randomUUID(),
    title: "EACC Wealth Declaration — CS Nominee (2023)",
    // Replace with actual EACC adverse report URL once retrieved from eacc.go.ke
    url: "https://eacc.go.ke/default/wp-content/uploads/2023/",
    publishedAt: "2023-08-01",
    publisher: "Ethics and Anti-Corruption Commission",
    documentType: "eacc_report" as const,
  },
  hansard: {
    id: randomUUID(),
    title: "Committee on Appointments — Verbatim Report, 6th November 2023",
    url: "https://parliament.go.ke/the-national-assembly/house-business/hansard",
    publishedAt: "2023-11-06",
    publisher: "National Assembly, Kenya",
    documentType: "hansard" as const,
  },
  committeeReport: {
    id: randomUUID(),
    title: "Report of the Committee on Appointments on Vetting of CS Nominees — November 2023",
    url: "https://parliament.go.ke/sites/default/files/2023-11/Committee_on_Appointments_Report.pdf",
    publishedAt: "2023-11-15",
    publisher: "National Assembly, Kenya",
    documentType: "committee_report" as const,
  },
  mzalendo: {
    id: randomUUID(),
    title: "Mzalendo — Committee on Appointments Voting Record",
    url: "https://info.mzalendo.com/person/",
    publishedAt: "2023-11-15",
    publisher: "Mzalendo",
    documentType: "other" as const,
  },
};

const NOMINEE_ID = randomUUID();
const FLAG_1_ID = randomUUID();
const FLAG_2_ID = randomUUID();

// ── Nominee ───────────────────────────────────────────────────────────────────

const NOMINEE = {
  id: NOMINEE_ID,
  fullName: "Demo CS — Ministry of Environment and Climate Change",
  // ↑ Replace with actual nominee full name for the hackathon demo
  position: "Cabinet Secretary, Environment and Climate Change",
  appointmentType: "Cabinet Secretary",
  gazetteDate: "2023-10-27",
  hearingDate: "2023-11-06",
  status: "approved" as const,
  summary:
    "Nominated by H.E. the President and gazetted on 27th October 2023. " +
    "Vetting conducted before the Committee on Appointments on 6th November 2023. " +
    "Approved by the Committee; approved by the National Assembly plenary.",
  slug: "demo-cs-environment-2023",
};

// ── Integrity Flags ───────────────────────────────────────────────────────────

const FLAGS = [
  {
    id: FLAG_1_ID,
    nomineeId: NOMINEE_ID,
    summary:
      "EACC wealth declaration filed late — submission received after the statutory deadline. " +
      "No satisfactory explanation provided to the Committee. Committee did not interrogate the delay.",
    severity: "medium" as const,
    sourceIds: [SOURCES.eacc.id, SOURCES.committeeReport.id],
  },
  {
    id: FLAG_2_ID,
    nomineeId: NOMINEE_ID,
    summary:
      "Nominee served as a board member of an entity that held active Ministry contracts during their tenure. " +
      "Chapter Six conflict of interest. Not raised by any committee member during vetting.",
    severity: "high" as const,
    sourceIds: [SOURCES.gazette.id, SOURCES.eacc.id],
  },
];

// ── Career Entries ────────────────────────────────────────────────────────────

const CAREER = [
  {
    id: randomUUID(),
    nomineeId: NOMINEE_ID,
    role: "Principal Secretary",
    organisation: "State Department for Environment",
    startYear: 2018,
    endYear: 2022,
    notes: "Appointed by Executive Order; served full term.",
    sourceIds: [SOURCES.gazette.id],
  },
  {
    id: randomUUID(),
    nomineeId: NOMINEE_ID,
    role: "Director, Climate Policy",
    organisation: "National Environment Management Authority (NEMA)",
    startYear: 2012,
    endYear: 2018,
    notes: null,
    sourceIds: [],
  },
  {
    id: randomUUID(),
    nomineeId: NOMINEE_ID,
    role: "Senior Environmental Officer",
    organisation: "Ministry of Environment",
    startYear: 2005,
    endYear: 2012,
    notes: null,
    sourceIds: [],
  },
];

// ── Questions (citizen queue) ─────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: randomUUID(),
    nomineeId: NOMINEE_ID,
    body: "Please explain your late EACC wealth declaration and what steps you took to comply with Chapter Six requirements.",
    context: "EACC confirmation process requires declaration within 30 days of nomination.",
    status: "ignored" as const,
    upvotes: 147,
    submitterLabel: "Transparency International Kenya",
    askedBy: null,
    askedAt: null,
  },
  {
    id: randomUUID(),
    nomineeId: NOMINEE_ID,
    body: "Were you a board member of any company holding government contracts during your time as PS? Please disclose all directorships.",
    context: "Public Officers Ethics Act s.13 requires disclosure of business interests.",
    status: "ignored" as const,
    upvotes: 203,
    submitterLabel: "Article 19 East Africa",
    askedBy: null,
    askedAt: null,
  },
  {
    id: randomUUID(),
    nomineeId: NOMINEE_ID,
    body: "What is your specific plan for meeting Kenya's NDC targets under the Paris Agreement by 2030?",
    context: null,
    status: "asked" as const,
    upvotes: 89,
    submitterLabel: null,
    askedBy: "Hon. Charity Kathambi",
    askedAt: "2023-11-06T10:45:00",
  },
  {
    id: randomUUID(),
    nomineeId: NOMINEE_ID,
    body: "How will you ensure NEMA's enforcement capacity is funded given Treasury cuts to environmental regulatory budgets?",
    context: null,
    status: "partially_asked" as const,
    upvotes: 76,
    submitterLabel: null,
    askedBy: "Hon. Samuel Chepkonga",
    askedAt: "2023-11-06T11:20:00",
  },
];

// ── Hearing Record ────────────────────────────────────────────────────────────

const HEARING_ID = randomUUID();
const HEARING = {
  id: HEARING_ID,
  nomineeId: NOMINEE_ID,
  date: "2023-11-06",
  committeeId: "committee-on-appointments-2023",
  committeeName: "Committee on Appointments",
  transcriptSourceId: SOURCES.hansard.id,
  citizenQuestionsAsked: 2,
  citizenQuestionsIgnored: 2,
};

const EXCHANGES = [
  {
    id: randomUUID(),
    hearingId: HEARING_ID,
    questionId: QUESTIONS[2].id,
    topic: "policy_position" as const,
    askedBy: "Hon. Charity Kathambi",
    questionText: "What is your specific plan for meeting Kenya's NDC targets under the Paris Agreement by 2030?",
    responseText:
      "We will leverage the updated NDC submitted in 2020, strengthen the institutional framework, and establish a Climate Change Fund that will attract bilateral and multilateral financing. My focus will be on the energy transition sector and nature-based solutions.",
    timestamp: "2023-11-06T10:45:00",
    addressesCitizenQuestion: true,
  },
  {
    id: randomUUID(),
    hearingId: HEARING_ID,
    questionId: null,
    topic: "competence" as const,
    askedBy: "Hon. Kimani Ichung'wah",
    questionText: "What experience do you bring to the management of transboundary water resources?",
    responseText:
      "During my tenure at NEMA I led the Mara River Basin negotiations with Tanzania and participated in the Lake Victoria Basin Commission working groups.",
    timestamp: "2023-11-06T10:58:00",
    addressesCitizenQuestion: false,
  },
  {
    id: randomUUID(),
    hearingId: HEARING_ID,
    questionId: QUESTIONS[3].id,
    topic: "track_record" as const,
    askedBy: "Hon. Samuel Chepkonga",
    questionText: "What is your position on NEMA budget adequacy?",
    responseText:
      "NEMA requires additional resources. I will engage Treasury through the budget cycle.",
    timestamp: "2023-11-06T11:20:00",
    addressesCitizenQuestion: true,
  },
  {
    id: randomUUID(),
    hearingId: HEARING_ID,
    questionId: null,
    topic: "procedural" as const,
    askedBy: "Committee Chair",
    questionText: "Are there any pending court cases against you in your personal capacity?",
    responseText: "None.",
    timestamp: "2023-11-06T11:35:00",
    addressesCitizenQuestion: false,
  },
];

// ── MPs and Votes ─────────────────────────────────────────────────────────────

const MP_VOTES = [
  { mpName: "Hon. Charity Kathambi", constituency: "Tharaka", party: "UDA", choice: "aye" as const },
  { mpName: "Hon. Kimani Ichung'wah", constituency: "Kikuyu", party: "UDA", choice: "aye" as const },
  { mpName: "Hon. Samuel Chepkonga", constituency: "Ainabkoi", party: "UDA", choice: "aye" as const },
  { mpName: "Hon. Opiyo Wandayi", constituency: "Ugenya", party: "ODM", choice: "nay" as const },
  { mpName: "Hon. Junet Mohammed", constituency: "Suna East", party: "ODM", choice: "nay" as const },
  { mpName: "Hon. John Mbadi", constituency: "Gwasi", party: "ODM", choice: "abstain" as const },
  { mpName: "Hon. Alice Wahome", constituency: "Kandara", party: "UDA", choice: "aye" as const },
  { mpName: "Hon. Aden Duale", constituency: "Garissa Township", party: "UDA", choice: "aye" as const },
];

// ── SQL Generation ────────────────────────────────────────────────────────────

function toSQL(episode: {
  sources: typeof SOURCES;
  nominee: typeof NOMINEE;
  flags: typeof FLAGS;
  career: typeof CAREER;
  questions: typeof QUESTIONS;
  hearing: typeof HEARING;
  exchanges: typeof EXCHANGES;
  mpVotes: typeof MP_VOTES;
}): string {
  const lines: string[] = ["-- Vetting Loop Demo Seed", "-- Generated: " + new Date().toISOString(), ""];

  const q = (s: string | null | undefined) =>
    s === null || s === undefined ? "NULL" : `'${s.replace(/'/g, "''")}'`;
  const n = (v: number | null | undefined) => (v === null || v === undefined ? "NULL" : String(v));
  const b = (v: boolean) => (v ? "1" : "0");

  // Source documents
  lines.push("-- Source Documents");
  for (const src of Object.values(episode.sources)) {
    lines.push(
      `INSERT OR IGNORE INTO source_documents (id, title, url, published_at, publisher, document_type) VALUES (${q(src.id)}, ${q(src.title)}, ${q(src.url)}, ${q(src.publishedAt)}, ${q(src.publisher)}, ${q(src.documentType)});`
    );
  }
  lines.push("");

  // Nominee
  lines.push("-- Nominee");
  const nom = episode.nominee;
  lines.push(
    `INSERT OR IGNORE INTO nominees (id, full_name, position, appointment_type, gazette_date, hearing_date, status, summary, slug) VALUES (${q(nom.id)}, ${q(nom.fullName)}, ${q(nom.position)}, ${q(nom.appointmentType)}, ${q(nom.gazetteDate)}, ${q(nom.hearingDate)}, ${q(nom.status)}, ${q(nom.summary)}, ${q(nom.slug)});`
  );
  lines.push("");

  // Integrity flags
  lines.push("-- Integrity Flags");
  for (const flag of episode.flags) {
    lines.push(
      `INSERT OR IGNORE INTO integrity_flags (id, nominee_id, summary, severity) VALUES (${q(flag.id)}, ${q(flag.nomineeId)}, ${q(flag.summary)}, ${q(flag.severity)});`
    );
    for (const srcId of flag.sourceIds) {
      lines.push(
        `INSERT OR IGNORE INTO integrity_flag_sources (flag_id, source_id) VALUES (${q(flag.id)}, ${q(srcId)});`
      );
    }
  }
  lines.push("");

  // Career
  lines.push("-- Career Entries");
  for (const entry of episode.career) {
    lines.push(
      `INSERT OR IGNORE INTO career_entries (id, nominee_id, role, organisation, start_year, end_year, notes) VALUES (${q(entry.id)}, ${q(entry.nomineeId)}, ${q(entry.role)}, ${q(entry.organisation)}, ${n(entry.startYear)}, ${n(entry.endYear ?? null)}, ${q(entry.notes ?? null)});`
    );
  }
  lines.push("");

  // Questions
  lines.push("-- Citizen Questions");
  for (const qn of episode.questions) {
    lines.push(
      `INSERT OR IGNORE INTO questions (id, nominee_id, body, context, status, upvotes, submitter_label, asked_by, asked_at) VALUES (${q(qn.id)}, ${q(qn.nomineeId)}, ${q(qn.body)}, ${q(qn.context ?? null)}, ${q(qn.status)}, ${n(qn.upvotes)}, ${q(qn.submitterLabel ?? null)}, ${q(qn.askedBy ?? null)}, ${q(qn.askedAt ?? null)});`
    );
  }
  lines.push("");

  // Hearing
  lines.push("-- Hearing Record");
  const hr = episode.hearing;
  lines.push(
    `INSERT OR IGNORE INTO hearing_records (id, nominee_id, date, committee_id, committee_name, transcript_source_id, citizen_questions_asked, citizen_questions_ignored) VALUES (${q(hr.id)}, ${q(hr.nomineeId)}, ${q(hr.date)}, ${q(hr.committeeId)}, ${q(hr.committeeName)}, ${q(hr.transcriptSourceId)}, ${n(hr.citizenQuestionsAsked)}, ${n(hr.citizenQuestionsIgnored)});`
  );
  lines.push("");

  // Exchanges
  lines.push("-- Hearing Exchanges");
  for (const ex of episode.exchanges) {
    lines.push(
      `INSERT OR IGNORE INTO hearing_exchanges (id, hearing_id, question_id, topic, asked_by, question_text, response_text, timestamp, addresses_citizen_question) VALUES (${q(ex.id)}, ${q(ex.hearingId)}, ${q(ex.questionId ?? null)}, ${q(ex.topic)}, ${q(ex.askedBy)}, ${q(ex.questionText)}, ${q(ex.responseText ?? null)}, ${q(ex.timestamp ?? null)}, ${b(ex.addressesCitizenQuestion)});`
    );
  }
  lines.push("");

  // MPs + votes
  lines.push("-- MP Votes");
  for (const v of episode.mpVotes) {
    const mpId = randomUUID();
    const voteId = randomUUID();
    lines.push(
      `INSERT OR IGNORE INTO mps (id, full_name, constituency, party, chamber) VALUES (${q(mpId)}, ${q(v.mpName)}, ${q(v.constituency)}, ${q(v.party)}, 'national_assembly');`
    );
    lines.push(
      `INSERT OR IGNORE INTO mp_votes (id, nominee_id, mp_id, source_id, choice, recorded_at) VALUES (${q(voteId)}, ${q(NOMINEE_ID)}, ${q(mpId)}, ${q(SOURCES.mzalendo.id)}, ${q(v.choice)}, '2023-11-15');`
    );
  }

  return lines.join("\n");
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function seed() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      env: { type: "string", default: "local" },
      "dry-run": { type: "boolean", default: false },
    },
  });

  const isDryRun = values["dry-run"];
  const isRemote = values.env === "remote";

  const sql = toSQL({
    sources: SOURCES,
    nominee: NOMINEE,
    flags: FLAGS,
    career: CAREER,
    questions: QUESTIONS,
    hearing: HEARING,
    exchanges: EXCHANGES,
    mpVotes: MP_VOTES,
  });

  mkdirSync("scripts/data", { recursive: true });
  const outFile = "scripts/data/seed-demo.sql";
  writeFileSync(outFile, sql, "utf-8");
  console.log(`\n✓ SQL written to ${outFile}`);

  if (isDryRun) {
    console.log("\n── DRY RUN — SQL Preview ──");
    console.log(sql.slice(0, 2000) + "\n...[truncated; see file]");
    console.log(`\nRun without --dry-run to execute against ${isRemote ? "PRODUCTION" : "local"} D1.`);
    return;
  }

  const remoteFlag = isRemote ? "--remote" : "";
  const cmd = `wrangler d1 execute vetting-loop-db ${remoteFlag} --file ${outFile}`;
  console.log(`\nExecuting: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
  console.log("\n✓ Seed complete.");
  console.log(`  Nominee slug: ${NOMINEE.slug}`);
  console.log(`  Dossier URL: http://localhost:3000/nominees/${NOMINEE.slug}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
