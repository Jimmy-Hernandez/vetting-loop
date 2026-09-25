import { CABINET_2022_ONLY, CABINET_2024, LATER_APPOINTEES } from "./data/cabinet";
import { PRINCIPAL_SECRETARIES } from "./data/principal-secretaries";
import type { Person } from "./types";

export * from "./types";
export * from "./signals";
export * from "./stats";
export * from "./integrity-hash";
export * from "./nostr";
export { SOURCES, SOURCE_BY_ID, CYCLES, CYCLE_BY_ID, LEDGER_COMPILED, DISSOLUTION_2024 } from "./data/sources";

/** Every person in the ledger, cabinet first, then Principal Secretaries. */
export const PEOPLE: Person[] = [...CABINET_2024, ...CABINET_2022_ONLY, ...LATER_APPOINTEES, ...PRINCIPAL_SECRETARIES];

export const PERSON_BY_SLUG = new Map(PEOPLE.map((p) => [p.slug, p]));

export const COHORT_2024_SLUGS = CABINET_2024.map((p) => p.slug);

export const OFFICE_LABEL: Record<Person["appointments"][number]["office"], string> = {
  prime_cs: "Prime Cabinet Secretary",
  cabinet_secretary: "Cabinet Secretary",
  principal_secretary: "Principal Secretary",
  attorney_general: "Attorney General",
  deputy_president: "Deputy President",
  envoy: "Envoy",
  other: "Public office",
};

export const OUTCOME_LABEL: Record<Person["appointments"][number]["outcome"], string> = {
  approved: "Approved",
  rejected: "Rejected",
  declined: "Declined",
  not_vetted: "Not vetted",
  reassigned: "Reassigned",
  unrecorded: "Outcome not recorded",
};

export const APPEARANCE_LABEL: Record<Person["appointments"][number]["appearance"], string> = {
  appeared: "Appeared before committee",
  did_not_appear: "Did not appear",
  not_required: "No hearing held",
  unknown: "Appearance not recorded",
};
