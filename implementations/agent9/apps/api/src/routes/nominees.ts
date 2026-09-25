import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppContext } from "../index";
import {
  nominees,
  integrityFlags,
  integrityFlagSources,
  sourceDocuments,
  careerEntries,
} from "@vetting-loop/db";

export const nomineeRoutes = new Hono<AppContext>();

/**
 * GET /nominees
 * List all nominees, optionally filtered by status.
 */
nomineeRoutes.get("/", async (c) => {
  const db = c.get("db");
  const status = c.req.query("status");

  const rows = await db
    .select()
    .from(nominees)
    .where(status ? eq(nominees.status, status as any) : undefined)
    .orderBy(nominees.gazetteDate);

  return c.json({ success: true, data: rows });
});

/**
 * GET /nominees/:slug
 * Full nominee dossier: flags + sources + career.
 */
nomineeRoutes.get("/:slug", async (c) => {
  const db = c.get("db");
  const { slug } = c.req.param();

  const [nominee] = await db
    .select()
    .from(nominees)
    .where(eq(nominees.slug, slug))
    .limit(1);

  if (!nominee) {
    return c.json({ success: false, error: "Nominee not found", code: "NOT_FOUND" }, 404);
  }

  // Fetch integrity flags with their source documents
  const flags = await db
    .select({
      flag: integrityFlags,
      source: sourceDocuments,
    })
    .from(integrityFlags)
    .leftJoin(integrityFlagSources, eq(integrityFlagSources.flagId, integrityFlags.id))
    .leftJoin(sourceDocuments, eq(sourceDocuments.id, integrityFlagSources.sourceId))
    .where(eq(integrityFlags.nomineeId, nominee.id));

  // Group flags → sources
  const flagMap = new Map<string, { flag: typeof flags[0]["flag"]; sources: typeof flags[0]["source"][] }>();
  for (const row of flags) {
    if (!flagMap.has(row.flag.id)) {
      flagMap.set(row.flag.id, { flag: row.flag, sources: [] });
    }
    if (row.source) {
      flagMap.get(row.flag.id)!.sources.push(row.source);
    }
  }

  const career = await db
    .select()
    .from(careerEntries)
    .where(eq(careerEntries.nomineeId, nominee.id))
    .orderBy(careerEntries.startYear);

  return c.json({
    success: true,
    data: {
      ...nominee,
      integrityFlags: [...flagMap.values()],
      career,
    },
  });
});
