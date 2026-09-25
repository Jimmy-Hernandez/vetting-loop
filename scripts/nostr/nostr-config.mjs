// Single source of truth for the Nostr lane.
//
// STATUS: DISABLED as of 2026-09-25. The team is doing further due diligence on
// the underlying record before anything is published to a public network, so the
// publish path is hard-gated OFF. Read-only tooling (verify-relay.mjs) still works
// for internal audit.
//
// To re-enable publishing you must BOTH:
//   1. export NOSTR_PUBLISH_ENABLED=1
//   2. pass --i-have-verified-the-data to publish-episode.mjs
//
// Deliberately two gates: an env var alone is too easy to leave exported in a
// shell, and this lane writes to third-party public relays once it runs.
export const NOSTR_PUBLISH_ENABLED = process.env.NOSTR_PUBLISH_ENABLED === '1';

export const DISABLED_MESSAGE = `
────────────────────────────────────────────────────────────────────────
NOSTR PUBLISHING IS DISABLED
────────────────────────────────────────────────────────────────────────
The team paused all publishing pending further due diligence on the record.
Nothing was sent to any relay. The code is intact and documented in
DEMO-RUNBOOK.md.

To publish again, set both gates explicitly:
  export NOSTR_PUBLISH_ENABLED=1
  node scripts/nostr/publish-episode.mjs --i-have-verified-the-data --relay <url>
────────────────────────────────────────────────────────────────────────
`;

export function assertPublishEnabled(argv = []) {
  const ack = argv.includes('--i-have-verified-the-data');
  if (NOSTR_PUBLISH_ENABLED && ack) return true;
  console.log(DISABLED_MESSAGE);
  const why = !NOSTR_PUBLISH_ENABLED
    ? 'NOSTR_PUBLISH_ENABLED is not set to 1'
    : 'the --i-have-verified-the-data confirmation flag is missing';
  console.log(`Refusing to publish: ${why}.\n`);
  return false;
}
