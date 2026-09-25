import { Hono } from "hono";
import { getAuth } from "@hono/clerk-auth";
import type { AppContext } from "../index";

export const adminRoutes = new Hono<AppContext>();

/**
 * Admin middleware: requires both Clerk auth AND internal API secret header.
 * Double-factor: compromised Clerk session alone cannot reach admin routes.
 */
adminRoutes.use("*", async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ success: false, error: "Authentication required", code: "UNAUTHORIZED" }, 401);
  }

  const secret = c.req.header("X-Admin-Secret");
  if (secret !== c.env.API_INTERNAL_SECRET) {
    return c.json({ success: false, error: "Forbidden", code: "FORBIDDEN" }, 403);
  }

  await next();
});

/**
 * GET /admin/health
 * Confirm admin credentials work — used by CI health check.
 */
adminRoutes.get("/health", (c) =>
  c.json({ ok: true, ts: new Date().toISOString(), env: c.env.ENVIRONMENT })
);

/**
 * POST /admin/nominees
 * Create a new nominee (admin only). Validates required fields.
 */
adminRoutes.post("/nominees", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();

  if (!body.fullName || !body.position || !body.slug || !body.gazetteDate) {
    return c.json(
      { success: false, error: "fullName, position, slug, gazetteDate required", code: "VALIDATION_ERROR" },
      400
    );
  }

  // Import here to avoid top-level Workers issue with node:crypto
  const { randomUUID } = await import("node:crypto");
  const { nominees } = await import("@vetting-loop/db");

  const [created] = await db
    .insert(nominees)
    .values({
      id: randomUUID(),
      fullName: body.fullName,
      position: body.position,
      appointmentType: body.appointmentType ?? "Cabinet Secretary",
      gazetteDate: body.gazetteDate,
      hearingDate: body.hearingDate,
      status: body.status ?? "gazetted",
      summary: body.summary,
      slug: body.slug,
    })
    .returning();

  return c.json({ success: true, data: created }, 201);
});

/**
 * POST /admin/flags
 * Create an integrity flag (admin only). Enforces: at least one sourceId.
 */
adminRoutes.post("/flags", async (c) => {
  const db = c.get("db");
  const body = await c.req.json<{
    nomineeId: string;
    summary: string;
    severity: "low" | "medium" | "high";
    sourceIds: string[];
  }>();

  if (!body.nomineeId || !body.summary || !body.severity) {
    return c.json(
      { success: false, error: "nomineeId, summary, severity required", code: "VALIDATION_ERROR" },
      400
    );
  }

  if (!body.sourceIds || body.sourceIds.length === 0) {
    return c.json(
      {
        success: false,
        error: "At least one sourceId required for integrity flags. No bare allegations.",
        code: "INTEGRITY_CONSTRAINT",
      },
      422
    );
  }

  const { randomUUID } = await import("node:crypto");
  const { integrityFlags, integrityFlagSources } = await import("@vetting-loop/db");

  const flagId = randomUUID();
  await db.insert(integrityFlags).values({
    id: flagId,
    nomineeId: body.nomineeId,
    summary: body.summary,
    severity: body.severity,
  });

  await db.insert(integrityFlagSources).values(
    body.sourceIds.map((sourceId) => ({ flagId, sourceId }))
  );

  return c.json({ success: true, data: { id: flagId } }, 201);
});
