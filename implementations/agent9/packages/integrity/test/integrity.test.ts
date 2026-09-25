import { describe, expect, it } from "vitest";
import {
  BAND_THRESHOLDS,
  DEFAULT_AS_OF,
  MOCK_BAND_QUOTA,
  PROFILED_ROSTER,
  assignMockBands,
  bandFor,
  getProfiles,
  isInWindow,
  rate,
  recencyWeight,
  summarize,
  windowStart,
  type Finding,
} from "../src";

function finding(overrides: Partial<Finding>): Finding {
  return {
    id: "f1",
    channel: "eacc",
    status: "eacc_investigation_opened",
    attribution: "direct",
    date: "2024-01-01",
    title: "t",
    summary: "s",
    entity: "e",
    source: { label: "l", url: "https://example.org", reference: "MOCK-1" },
    mock: true,
    ...overrides,
  };
}

describe("15-year lookback", () => {
  it("window starts exactly 15 years before the as-of date", () => {
    expect(windowStart("2027-08-10")).toBe("2012-08-10");
  });

  it("excludes records older than 15 years from the score", () => {
    const old = finding({ id: "old", status: "eacc_asset_recovery_filed", date: "2012-08-09" });
    const r = rate([old], "2027-08-10");
    expect(r.score).toBe(0);
    expect(r.band).toBe("clear");
    expect(r.inWindow).toHaveLength(0);
    expect(r.excludedOutsideWindow).toBe(1);
  });

  it("includes a record dated on the window boundary", () => {
    expect(isInWindow("2012-08-10", "2027-08-10")).toBe(true);
    expect(isInWindow("2012-08-09", "2027-08-10")).toBe(false);
  });

  it("no profiled finding inside the window predates the lookback", () => {
    for (const p of getProfiles()) {
      for (const f of p.rating.inWindow) expect(f.date >= windowStart(DEFAULT_AS_OF)).toBe(true);
    }
  });
});

describe("scoring", () => {
  it("closed and resolved matters carry zero points", () => {
    const r = rate([
      finding({ status: "eacc_closed_no_action" }),
      finding({ id: "b", channel: "oag", status: "oag_query_resolved" }),
      finding({ id: "c", channel: "parliament", status: "parl_vetting_concern_cleared" }),
    ]);
    expect(r.score).toBe(0);
    expect(r.band).toBe("clear");
  });

  it("recency decays to half weight at the window edge", () => {
    expect(recencyWeight("2027-08-10", "2027-08-10")).toBe(1);
    expect(recencyWeight("2012-08-10", "2027-08-10")).toBeCloseTo(0.5, 2);
  });

  it("political-head audit findings weigh half of direct records", () => {
    const direct = rate([finding({ channel: "oag", status: "oag_adverse_opinion", attribution: "direct", date: DEFAULT_AS_OF })]);
    const head = rate([finding({ channel: "oag", status: "oag_adverse_opinion", attribution: "political_head", date: DEFAULT_AS_OF })]);
    expect(head.score).toBe(Math.round(direct.score / 2));
  });

  it("caps at 100", () => {
    const many = Array.from({ length: 10 }, (_, i) => finding({ id: `x${i}`, status: "eacc_asset_recovery_filed", date: DEFAULT_AS_OF }));
    expect(rate(many).score).toBe(100);
  });

  it("band thresholds", () => {
    expect(bandFor(0)).toBe("clear");
    expect(bandFor(1)).toBe("low");
    expect(bandFor(BAND_THRESHOLDS.low)).toBe("low");
    expect(bandFor(BAND_THRESHOLDS.low + 1)).toBe("elevated");
    expect(bandFor(BAND_THRESHOLDS.elevated + 1)).toBe("high");
  });
});

describe("mock profiles", () => {
  const profiles = getProfiles();

  it("profiles all 20 vetted nominees", () => {
    expect(profiles).toHaveLength(20);
    expect(new Set(profiles.map((p) => p.slug)).size).toBe(20);
  });

  it("every finding is flagged mock and carries a MOCK- reference and disclosure", () => {
    for (const p of profiles) {
      expect(p.rating.containsMock || p.findings.length === 0).toBe(true);
      for (const f of p.findings) {
        expect(f.mock).toBe(true);
        expect(f.source.reference.startsWith("MOCK-")).toBe(true);
        expect(f.summary).toContain("Synthetic record");
      }
    }
  });

  it("computed bands match the assigned mock quota", () => {
    const assigned = assignMockBands(PROFILED_ROSTER.map((p) => p.slug));
    for (const p of profiles) expect(p.rating.band).toBe(assigned.get(p.slug));
    const counts = summarize(profiles).byBand;
    for (const [band, n] of MOCK_BAND_QUOTA) expect(counts[band]).toBe(n);
  });

  it("mock vetting records fall on a real vetting date from the roster", () => {
    for (const p of profiles) {
      const dates = new Set(p.appointments.filter((a) => a.vetting === "approved" || a.vetting === "rejected").map((a) => a.from));
      for (const f of p.findings.filter((x) => x.status.startsWith("parl_vetting"))) expect(dates.has(f.date)).toBe(true);
    }
  });

  it("is deterministic", () => {
    expect(JSON.stringify(getProfiles())).toBe(JSON.stringify(profiles));
  });

  it("pseudonym mode hides every real name", () => {
    const anon = getProfiles({ identity: "pseudonym" });
    const real = new Set(PROFILED_ROSTER.map((p) => p.fullName));
    for (const p of anon) expect(real.has(p.fullName)).toBe(false);
  });
});

describe("synthetic identity mode", () => {
  it("leaks no real name, slug or portfolio", async () => {
    const { getProfiles, PROFILED_ROSTER } = await import("../src");
    const text = JSON.stringify(getProfiles({ identity: "synthetic" }));
    for (const p of PROFILED_ROSTER) {
      expect(text).not.toContain(p.slug);
      for (const part of p.fullName.split(" ").filter((w) => w.length > 3)) expect(text).not.toContain(part);
      for (const a of p.appointments) expect(text).not.toContain(a.portfolio);
    }
  });

  it("keeps the 8/6/4/2 band distribution", async () => {
    const { getProfiles, summarize } = await import("../src");
    expect(summarize(getProfiles({ identity: "synthetic" })).byBand).toEqual({ clear: 8, low: 6, elevated: 4, high: 2 });
  });
});
