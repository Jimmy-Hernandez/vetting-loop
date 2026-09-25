import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppContext } from "../index";
import { committeeReports, citizenSubmissions, sourceDocuments } from "@vetting-loop/db";

export const reportRoutes = new Hono<AppContext>();

/**
 * GET /reports?nomineeId=xxx
 * Committee report with citizen submission cross-reference.
 */
reportRoutes.get("/", async (c) => {
  const db = c.get("db");
  const nomineeId = c.req.query("nomineeId");

  if (!nomineeId) {
    return c.json({ success: false, error: "nomineeId is required", code: "VALIDATION_ERROR" }, 400);
  }

  const [report] = await db
    .select()
    .from(committeeReports)
    .where(eq(committeeReports.nomineeId, nomineeId))
    .limit(1);

  if (!report) {
    return c.json({ success: true, data: null });
  }

  const [source] = await db
    .select()
    .from(sourceDocuments)
    .where(eq(sourceDocuments.id, report.sourceId))
    .limit(1);

  const submissions = await db
    .select()
    .from(citizenSubmissions)
    .where(eq(citizenSubmissions.nomineeId, nomineeId))
    .orderBy(citizenSubmissions.submittedAt);

  // Outcome breakdown
  const outcomeBreakdown = { reflected: 0, addressed: 0, absent: 0 };
  for (const s of submissions) {
    outcomeBreakdown[s.outcome]++;
  }

  return c.json({
    success: true,
    data: {
      ...report,
      source,
      citizenSubmissions: submissions,
      submissionSummary: {
        total: submissions.length,
        ...outcomeBreakdown,
        reflectionRate:
          submissions.length > 0
            ? Math.round(
                ((outcomeBreakdown.reflected + outcomeBreakdown.addressed) / submissions.length) * 100
              )
            : 0,
      },
    },
  });
});
