import { describe, expect, it } from "vitest";
import { bytesToHex } from "@noble/hashes/utils";
import { schnorr } from "@noble/curves/secp256k1";
import {
  COHORT_2024_SLUGS,
  PEOPLE,
  PERSON_BY_SLUG,
  SOURCE_BY_ID,
  buildManifest,
  canonicalJson,
  detect,
  detectAll,
  gateDecisions,
  gateStats,
  reconstitution2024,
  signEvent,
  toTemplate,
  vacancies,
  verifyEvent,
} from "../src";

const slugsWith = (signal: string) =>
  detectAll(PEOPLE)
    .filter((h) => h.signal === signal)
    .map((h) => h.slug)
    .sort();

describe("ledger integrity", () => {
  it("has unique slugs and appointment ids", () => {
    expect(PERSON_BY_SLUG.size).toBe(PEOPLE.length);
    const ids = PEOPLE.flatMap((p) => p.appointments.map((a) => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cites only registered sources, and every appointment cites one", () => {
    for (const a of PEOPLE.flatMap((p) => p.appointments)) {
      expect(a.sources.length).toBeGreaterThan(0);
      for (const s of a.sources) expect(SOURCE_BY_ID.has(s), `${a.id} cites ${s}`).toBe(true);
    }
  });

  it("holds the 20-member 2024 cohort and 51 Principal Secretaries", () => {
    expect(COHORT_2024_SLUGS).toHaveLength(20);
    expect(PEOPLE.filter((p) => p.appointments.some((a) => a.cycle === "ps-2022"))).toHaveLength(51);
  });

  it("contains no scores, ratings or allegations", () => {
    const text = JSON.stringify(PEOPLE).toLowerCase();
    for (const word of ["score", "rating", "corrupt", "fraud", "allegation", "mock"]) expect(text).not.toContain(word);
  });
});

describe("vetting gate", () => {
  it("counts 93 nominations and exactly one rejection across three cycles", () => {
    const g = gateStats(PEOPLE);
    expect(g.rows.map((r) => [r.cycle, r.nominated, r.rejected])).toEqual([
      ["cs-2022", 22, 0],
      ["ps-2022", 51, 0],
      ["cs-2024", 20, 1],
    ]);
    expect(g.nominated).toBe(93);
    expect(g.approved).toBe(92);
    expect(g.rejected).toBe(1);
  });

  it("records one committee rejection overturned by the House in 2022", () => {
    const d = gateDecisions(PEOPLE);
    expect(d.overturned.map((x) => x.person.slug)).toEqual(["peninah-malonza"]);
    expect(d.houseRejections.map((x) => x.person.slug).sort()).toEqual(["charles-githinji-kiiru", "stella-soi-langat"]);
  });

  it("measures the Gender docket vacancy from rejection to renomination", () => {
    expect(vacancies(PEOPLE)).toEqual([
      { portfolio: "Gender, Culture, Arts and Heritage", from: "2024-08-07", to: "2025-03-26", days: 231, reason: "Nominee rejected" },
    ]);
  });
});

describe("2024 reconstitution", () => {
  it("computes the returnee rate from linked histories", () => {
    const r = reconstitution2024(PEOPLE);
    expect(r).toMatchObject({ nominees: 20, approved: 19, rejected: 1, returnees: 10, returneesAsCs: 9, newFaces: 9 });
    expect(r.rotatedDocket).toBe(9);
  });
});

describe("pattern signals", () => {
  it("fires each rule on the expected people only", () => {
    expect(slugsWith("gate_rejection")).toEqual(["charles-githinji-kiiru", "stella-soi-langat"]);
    expect(slugsWith("floor_override")).toEqual(["peninah-malonza"]);
    expect(slugsWith("gazetted_without_approval")).toEqual(["vincent-mogaka-kemosi"]);
    expect(slugsWith("declined_nomination")).toEqual(["margaret-nyambura-ndungu", "vincent-mogaka-kemosi"]);
    expect(slugsWith("elevation_without_hearing")).toEqual(["kithure-kindiki"]);
    expect(slugsWith("soft_landing")).toEqual(["andrew-mwihia-karanja", "florence-bore", "margaret-nyambura-ndungu"]);
    expect(slugsWith("returnee")).toHaveLength(10);
  });

  it("quotes stated grounds verbatim", () => {
    const [h] = detect(PERSON_BY_SLUG.get("stella-soi-langat")!);
    expect(h.detail).toContain("failed to demonstrate adequate knowledge");
  });

  it("orders a rotation path chronologically", () => {
    const h = detect(PERSON_BY_SLUG.get("aden-barre-duale")!).find((x) => x.signal === "docket_rotation")!;
    expect(h.detail).toBe("3 portfolios: Defence → Environment, Climate Change and Forestry → Health.");
  });

  it("does not flag people with a single appointment", () => {
    expect(detect(PERSON_BY_SLUG.get("julius-migos-ogamba")!)).toEqual([]);
  });
});

describe("content hashing", () => {
  it("canonical JSON is key-order independent", () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 3, c: undefined }] })).toBe('{"a":[2,{"d":3}],"b":1}');
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
  });

  it("manifest root changes when any record changes", () => {
    const a = buildManifest(PEOPLE, "2026-09-24");
    const edited = PEOPLE.map((p, i) => (i === 5 ? { ...p, latestRole: `${p.latestRole} ` } : p));
    const b = buildManifest(edited, "2026-09-24");
    expect(a.records).toBe(PEOPLE.length);
    expect(a.root).not.toBe(b.root);
    expect(buildManifest([...PEOPLE].reverse(), "2026-09-24").root).toBe(a.root);
  });
});

describe("nostr export", () => {
  const sk = bytesToHex(schnorr.utils.randomPrivateKey());
  const person = PERSON_BY_SLUG.get("stella-soi-langat")!;

  it("signs and verifies an addressable kind-30078 event", () => {
    const e = signEvent(toTemplate(person, "2026-09-24"), sk);
    expect(e.kind).toBe(30078);
    expect(e.tags[0]).toEqual(["d", "ke-vetting-ledger:stella-soi-langat"]);
    expect(verifyEvent(e)).toBe(true);
  });

  it("rejects tampered content, even with a valid-looking id", () => {
    const e = signEvent(toTemplate(person, "2026-09-24"), sk);
    expect(verifyEvent({ ...e, content: e.content.replace("rejected", "approved") })).toBe(false);
  });

  it("uses a deterministic timestamp so rebuilds are reproducible", () => {
    expect(toTemplate(person, "2026-09-24")).toEqual(toTemplate(person, "2026-09-24"));
  });
});
