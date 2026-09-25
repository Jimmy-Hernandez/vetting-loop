import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppContext } from "../index";
import { mpVotes, mps, sourceDocuments } from "@vetting-loop/db";

export const voteRoutes = new Hono<AppContext>();

/**
 * GET /votes?nomineeId=xxx
 * Per-MP vote trail for a nominee. Every record links to a source document.
 */
voteRoutes.get("/", async (c) => {
  const db = c.get("db");
  const nomineeId = c.req.query("nomineeId");

  if (!nomineeId) {
    return c.json({ success: false, error: "nomineeId is required", code: "VALIDATION_ERROR" }, 400);
  }

  const rows = await db
    .select({
      vote: mpVotes,
      mp: mps,
      source: sourceDocuments,
    })
    .from(mpVotes)
    .leftJoin(mps, eq(mps.id, mpVotes.mpId))
    .leftJoin(sourceDocuments, eq(sourceDocuments.id, mpVotes.sourceId))
    .where(eq(mpVotes.nomineeId, nomineeId))
    .orderBy(mps.fullName);

  // Summary tally
  const tally = { aye: 0, nay: 0, abstain: 0, absent: 0 };
  for (const row of rows) {
    tally[row.vote.choice]++;
  }

  return c.json({
    success: true,
    data: {
      votes: rows,
      tally,
      total: rows.length,
    },
  });
});
