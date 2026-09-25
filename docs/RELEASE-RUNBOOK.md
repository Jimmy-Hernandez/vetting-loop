# Reviewed release runbook

Owner: Finestra. Correlation: vetta-20260925-completion.

1. Keep original data in review/source-data. Register every scalar; separate provenance metadata from substantive claims. Review/roster-approvals.json contains source passages and independent decisions. The private corrected-review dataset holds 596 source-backed repairs that have not been granted publication clearance.
2. Run `node scripts/release/prepare.mjs`, then `node scripts/release/test-gate.mjs`. Only the approved projection goes under app/public/data.
3. Run `npm run build` in app. Build refuses a changed source, changed roster, stale register or unexpected legacy public JSON.
4. Run `node scripts/release/sign.mjs` with the confirmed external key path. Do not copy the key into the repository.
5. Stamp app/dist/manifest.json with OpenTimestamps. Save the detached proof; publish pending status until Bitcoin verification succeeds. Do not rebuild the manifest after stamping without regenerating the proof.
6. Run `node scripts/release/finalize.mjs` to package artifacts and verify the manifest/signature/archive. Test desktop, mobile, offline and malformed file behavior before deployment.
7. Deploy the same app/dist to each authorized Pages project. Verify served JSON hashes, signed manifest, identity CORS, archive and excluded legacy data. Deployment metadata alone is not verification.
8. After relay activation, configure its wss URL, rebuild, and run the Nostr publisher dry run before publication. Publish only on explicit authorization. Require matching relay acknowledgments, then independently fetch and validate the snapshot. Tip enablement additionally requires Caroline's completed recovery handover.

## Rollback

Retain deployment IDs. Prefer a forward correction; reverting to the earlier release would re-expose uncleared data and the unsigned fallback vulnerability. Stop the newly created relay/tunnel services only when necessary; do not alter unrelated fleet tunnels. No service was installed in this task unless later recorded in relay/VERIFICATION.md.
