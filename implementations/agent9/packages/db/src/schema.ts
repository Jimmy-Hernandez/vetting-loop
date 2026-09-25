import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── Source Documents ──────────────────────────────────────────────────────────

export const sourceDocuments = sqliteTable("source_documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  publishedAt: text("published_at").notNull(),
  publisher: text("publisher").notNull(),
  documentType: text("document_type", {
    enum: ["gazette", "eacc_report", "court_record", "hansard", "committee_report", "media", "other"],
  }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Nominees ──────────────────────────────────────────────────────────────────

export const nominees = sqliteTable("nominees", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  position: text("position").notNull(),
  appointmentType: text("appointment_type").notNull(),
  gazetteDate: text("gazette_date").notNull(),
  hearingDate: text("hearing_date"),
  status: text("status", {
    enum: ["gazetted", "hearing_scheduled", "hearing_complete", "approved", "rejected"],
  })
    .notNull()
    .default("gazetted"),
  summary: text("summary"),
  slug: text("slug").notNull().unique(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Integrity Flags ───────────────────────────────────────────────────────────
// Every flag MUST reference at least one source_document via integrity_flag_sources.
// Constraint enforced at application layer (API rejects on insert if no sources).

export const integrityFlags = sqliteTable("integrity_flags", {
  id: text("id").primaryKey(),
  nomineeId: text("nominee_id")
    .notNull()
    .references(() => nominees.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  severity: text("severity", { enum: ["low", "medium", "high"] }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const integrityFlagSources = sqliteTable("integrity_flag_sources", {
  flagId: text("flag_id")
    .notNull()
    .references(() => integrityFlags.id, { onDelete: "cascade" }),
  sourceId: text("source_id")
    .notNull()
    .references(() => sourceDocuments.id, { onDelete: "restrict" }),
});

// ── Career Entries ────────────────────────────────────────────────────────────

export const careerEntries = sqliteTable("career_entries", {
  id: text("id").primaryKey(),
  nomineeId: text("nominee_id")
    .notNull()
    .references(() => nominees.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  organisation: text("organisation").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Questions ─────────────────────────────────────────────────────────────────

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  nomineeId: text("nominee_id")
    .notNull()
    .references(() => nominees.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  context: text("context"),
  upvotes: integer("upvotes").notNull().default(0),
  status: text("status", {
    enum: ["pending", "asked", "ignored", "partially_asked"],
  })
    .notNull()
    .default("pending"),
  askedAt: text("asked_at"),
  askedBy: text("asked_by"),
  submittedAt: text("submitted_at").default(sql`CURRENT_TIMESTAMP`),
  submitterLabel: text("submitter_label"),
});

// ── MPs ───────────────────────────────────────────────────────────────────────

export const mps = sqliteTable("mps", {
  id: text("id").primaryKey(),
  mzalendoId: text("mzalendo_id").unique(),
  fullName: text("full_name").notNull(),
  constituency: text("constituency").notNull(),
  party: text("party").notNull(),
  chamber: text("chamber", { enum: ["national_assembly", "senate"] }).notNull(),
  scorecardUrl: text("scorecard_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Hearing Records ───────────────────────────────────────────────────────────

export const hearingRecords = sqliteTable("hearing_records", {
  id: text("id").primaryKey(),
  nomineeId: text("nominee_id")
    .notNull()
    .references(() => nominees.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  committeeId: text("committee_id").notNull(),
  committeeName: text("committee_name").notNull(),
  transcriptSourceId: text("transcript_source_id")
    .notNull()
    .references(() => sourceDocuments.id),
  citizenQuestionsAsked: integer("citizen_questions_asked").notNull().default(0),
  citizenQuestionsIgnored: integer("citizen_questions_ignored").notNull().default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const hearingExchanges = sqliteTable("hearing_exchanges", {
  id: text("id").primaryKey(),
  hearingId: text("hearing_id")
    .notNull()
    .references(() => hearingRecords.id, { onDelete: "cascade" }),
  questionId: text("question_id").references(() => questions.id),
  topic: text("topic", {
    enum: ["integrity", "competence", "financial_disclosure", "track_record", "policy_position", "procedural", "other"],
  }).notNull(),
  askedBy: text("asked_by").notNull(),
  questionText: text("question_text").notNull(),
  responseText: text("response_text"),
  timestamp: text("timestamp"),
  addressesCitizenQuestion: integer("addresses_citizen_question", { mode: "boolean" })
    .notNull()
    .default(false),
});

// ── MP Votes ──────────────────────────────────────────────────────────────────

export const mpVotes = sqliteTable("mp_votes", {
  id: text("id").primaryKey(),
  nomineeId: text("nominee_id")
    .notNull()
    .references(() => nominees.id, { onDelete: "cascade" }),
  mpId: text("mp_id")
    .notNull()
    .references(() => mps.id),
  sourceId: text("source_id")
    .notNull()
    .references(() => sourceDocuments.id),
  choice: text("choice", { enum: ["aye", "nay", "abstain", "absent"] }).notNull(),
  recordedAt: text("recorded_at").notNull(),
});

// ── Committee Reports ─────────────────────────────────────────────────────────

export const committeeReports = sqliteTable("committee_reports", {
  id: text("id").primaryKey(),
  nomineeId: text("nominee_id")
    .notNull()
    .references(() => nominees.id, { onDelete: "cascade" }),
  publishedAt: text("published_at").notNull(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sourceDocuments.id),
  recommendation: text("recommendation", { enum: ["approve", "reject", "defer"] }).notNull(),
  submissionsReflected: integer("submissions_reflected", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const citizenSubmissions = sqliteTable("citizen_submissions", {
  id: text("id").primaryKey(),
  nomineeId: text("nominee_id")
    .notNull()
    .references(() => nominees.id, { onDelete: "cascade" }),
  reportId: text("report_id").references(() => committeeReports.id),
  submitterLabel: text("submitter_label"),
  summary: text("summary").notNull(),
  submittedAt: text("submitted_at").notNull(),
  outcome: text("outcome", { enum: ["reflected", "addressed", "absent"] })
    .notNull()
    .default("absent"),
  reportReference: text("report_reference"),
});
