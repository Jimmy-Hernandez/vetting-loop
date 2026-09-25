import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppContext } from "../index";
import { hearingRecords, hearingExchanges, sourceDocuments } from "@vetting-loop/db";

export const hearingRoutes = new Hono<AppContext>();

/**
 * GET /hearings?nomineeId=xxx
 * List hearing records for a nominee.
 */
hearingRoutes.get("/", async (c) => {
  const db = c.get("db");
  const nomineeId = c.req.query("nomineeId");

  if (!nomineeId) {
    return c.json({ success: false, error: "nomineeId is required", code: "VALIDATION_ERROR" }, 400);
  }

  const hearings = await db
    .select()
    .from(hearingRecords)
    .where(eq(hearingRecords.nomineeId, nomineeId))
    .orderBy(hearingRecords.date);

  return c.json({ success: true, data: hearings });
});

/**
 * GET /hearings/:id
 * Full hearing record with all exchanges.
 */
hearingRoutes.get("/:id", async (c) => {
  const db = c.get("db");
  const { id } = c.req.param();

  const [hearing] = await db
    .select()
    .from(hearingRecords)
    .where(eq(hearingRecords.id, id))
    .limit(1);

  if (!hearing) {
    return c.json({ success: false, error: "Hearing not found", code: "NOT_FOUND" }, 404);
  }

  const exchanges = await db
    .select()
    .from(hearingExchanges)
    .where(eq(hearingExchanges.hearingId, id))
    .orderBy(hearingExchanges.timestamp);

  const [transcriptSource] = await db
    .select()
    .from(sourceDocuments)
    .where(eq(sourceDocuments.id, hearing.transcriptSourceId))
    .limit(1);

  // Compute ignore rate
  const total = hearing.citizenQuestionsAsked + hearing.citizenQuestionsIgnored;
  const ignoreRate = total > 0 ? Math.round((hearing.citizenQuestionsIgnored / total) * 100) : 0;

  return c.json({
    success: true,
    data: {
      ...hearing,
      transcriptSource,
      exchanges,
      summary: {
        totalCitizenQuestions: total,
        asked: hearing.citizenQuestionsAsked,
        ignored: hearing.citizenQuestionsIgnored,
        ignoreRate,
      },
    },
  });
});
