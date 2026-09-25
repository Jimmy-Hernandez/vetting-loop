// Slug seam between OUR episode.json nominee slugs and Terry's ledger.json person slugs.
// Each mapping was verified one-to-one against data/terry/ledger.json people entries
// (names match; spelling variants only). If a slug is absent here, the two sides must
// match exactly for a dossier link to render.
export const SLUG_ALIASES: Record<string, string> = {
  // ours -> Terry's
  'debra-mlongo-barasa': 'deborah-mlongo-barasa',
  'eric-murithi-mugaa': 'eric-muriithi-mugaa',
  'onesimus-kipchumba-murkomen': 'kipchumba-murkomen',
  'justin-bedan-muturi': 'justin-bedan-njoka-muturi',
  // note: aden-bare-duale (ours) vs aden-barre-duale (Terry's)
  'aden-bare-duale': 'aden-barre-duale',
};

const REVERSE_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_ALIASES).map(([ours, theirs]) => [theirs, ours])
);

/** Terry slug -> our episode slug (identity when no alias). */
export function toOurSlug(terrySlug: string): string {
  return REVERSE_ALIASES[terrySlug] ?? terrySlug;
}
