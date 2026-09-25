import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppContext } from "../index";
import { questions, sourceDocuments } from "@vetting-loop/db";
import { getAuth } from "@hono/clerk-auth";

export const questionRoutes = new Hono<AppContext>();

/**
 * GET /questions?nomineeId=xxx
 * Public: list questions for a nominee, sorted by upvotes descending.
 */
questionRoutes.get("/", async (c) => {
  const db = c.get("db");
  const nomineeId = c.req.query("nomineeId");

  if (!nomineeId) {
    return c.json({ success: false, error: "nomineeId is required", code: "VALIDATION_ERROR" }, 400);
  }

  const rows = await db
    .select()
    .from(questions)
    .where(eq(questions.nomineeId, nomineeId))
    .orderBy(questions.upvotes);

  return c.json({ success: true, data: rows });
});

/**
 * POST /questions
 * Auth required: submit a new question for a nominee.
 * Body: { nomineeId, body, context?, submitterLabel? }
 */
questionRoutes.post("/", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ success: false, error: "Authentication required", code: "UNAUTHORIZED" }, 401);
  }

  const db = c.get("db");
  const body = await c.req.json<{
    nomineeId: string;
    body: string;
    context?: string;
    submitterLabel?: string;
  }>();

  if (!body.nomineeId || !body.body?.trim()) {
    return c.json({ success: false, error: "nomineeId and body are required", code: "VALIDATION_ERROR" }, 400);
  }

  if (body.body.trim().length < 10) {
    return c.json({ success: false, error: "Question must be at least 10 characters", code: "VALIDATION_ERROR" }, 400);
  }

  const { randomUUID } = await import("node:crypto");
  const [created] = await db
    .insert(questions)
    .values({
      id: randomUUID(),
      nomineeId: body.nomineeId,
      body: body.body.trim(),
      context: body.context?.trim(),
      submitterLabel: body.submitterLabel?.trim(),
      status: "pending",
      upvotes: 0,
    })
    .returning();

  return c.json({ success: true, data: created }, 201);
});

/**
 * POST /questions/:id/upvote
 * Auth required: upvote a question. Server-side only — prevents client-side manipulation.
 */
questionRoutes.post("/:id/upvote", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ success: false, error: "Authentication required", code: "UNAUTHORIZED" }, 401);
  }

  const db = c.get("db");
  const { id } = c.req.param();

  const [question] = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  if (!question) {
    return c.json({ success: false, error: "Question not found", code: "NOT_FOUND" }, 404);
  }

  const [updated] = await db
    .update(questions)
    .set({ upvotes: question.upvotes + 1 })
    .where(eq(questions.id, id))
    .returning();

  return c.json({ success: true, data: updated });
});
