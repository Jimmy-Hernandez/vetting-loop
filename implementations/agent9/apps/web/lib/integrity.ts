import {
  getProfile as coreGetProfile,
  getProfiles as coreGetProfiles,
  type IdentityMode,
  type RatingBand,
  type SourceChannel,
} from "@vetting-loop/integrity";

/**
 * The scoring sandbox runs on a fully synthetic cohort by default, so no real
 * person ever appears beside a mock rating. NEXT_PUBLIC_MOCK_IDENTITY=named
 * exists only for closed internal review and must never be deployed.
 */
export const IDENTITY_MODE: IdentityMode = process.env.NEXT_PUBLIC_MOCK_IDENTITY === "named" ? "named" : "synthetic";

export const getProfiles = () => coreGetProfiles({ identity: IDENTITY_MODE });
export const getProfile = (slug: string) => coreGetProfile(slug, { identity: IDENTITY_MODE });

export const CHANNEL_META: Record<SourceChannel, { short: string; long: string; color: string }> = {
  eacc: { short: "EACC", long: "Ethics and Anti-Corruption Commission", color: "#8d1820" },
  oag: { short: "OAG", long: "Office of the Auditor-General", color: "#c2410c" },
  parliament: { short: "Parliament", long: "Parliamentary vetting / National Assembly", color: "#1d4ed8" },
  mzalendo: { short: "Mzalendo", long: "Mzalendo parliamentary record", color: "#008033" },
};

export const BAND_STYLE: Record<RatingBand, { bg: string; text: string; ring: string; hex: string }> = {
  clear: { bg: "bg-band-clear", text: "text-band-clear", ring: "border-band-clear", hex: "#008033" },
  low: { bg: "bg-band-low", text: "text-band-low", ring: "border-band-low", hex: "#9a6b00" },
  elevated: { bg: "bg-band-elevated", text: "text-band-elevated", ring: "border-band-elevated", hex: "#c2410c" },
  high: { bg: "bg-band-high", text: "text-band-high", ring: "border-band-high", hex: "#7a1620" },
};

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatKes(amount: number): string {
  if (amount >= 1e9) return `KES ${(amount / 1e9).toFixed(1)}bn`;
  return `KES ${Math.round(amount / 1e6)}m`;
}

export function initials(name: string): string {
  const subject = /^Subject (\d+)$/.exec(name);
  if (subject) return subject[1]!;
  return name
    .replace(/^(Prof\.|Dr\.|Amb\.|Eng\.)\s+/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
