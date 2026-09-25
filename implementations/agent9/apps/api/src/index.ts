import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@vetting-loop/db";

import { nomineeRoutes } from "./routes/nominees";
import { questionRoutes } from "./routes/questions";
import { hearingRoutes } from "./routes/hearings";
import { voteRoutes } from "./routes/votes";
import { reportRoutes } from "./routes/reports";
import { adminRoutes } from "./routes/admin";

export type Env = {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  CLERK_SECRET_KEY: string;
  API_INTERNAL_SECRET: string;
  MZALENDO_API_KEY: string;
  ENVIRONMENT: string;
};

export type AppContext = {
  Bindings: Env;
  Variables: {
    db: ReturnType<typeof drizzle>;
  };
};

const app = new Hono<AppContext>();

// ── Global middleware ─────────────────────────────────────────────────────────

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://vettingloop.ke"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Attach drizzle instance to every request context
app.use("*", async (c, next) => {
  c.set("db", drizzle(c.env.DB, { schema }));
  await next();
});

app.use("*", clerkMiddleware());

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

// ── Public routes ─────────────────────────────────────────────────────────────

app.route("/nominees", nomineeRoutes);
app.route("/hearings", hearingRoutes);
app.route("/votes", voteRoutes);
app.route("/reports", reportRoutes);

// Questions: read is public, write requires auth
app.route("/questions", questionRoutes);

// ── Admin routes (internal secret + Clerk admin role) ─────────────────────────

app.route("/admin", adminRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────

app.notFound((c) => c.json({ success: false, error: "Not found", code: "NOT_FOUND" }, 404));

app.onError((err, c) => {
  console.error("[API Error]", err);
  return c.json({ success: false, error: "Internal error", code: "INTERNAL_ERROR" }, 500);
});

export default app;
