# Source handover — 2026-09-25

Jimmy's `main` at `8e58704` was the integration base. The local Vetta continuation at
`b438d52` was merged with ancestry preserved. This brings the VETTA identity, clean
routes, revised navigation and corrected nomination counts into the existing app.
The newer upstream landing-page fix and Nostr publication pause are preserved.

Terry's separate Agent9 monorepo was captured from its working tree, including
uncommitted source changes, at base commit `0f8a51e`. It is preserved under
`implementations/agent9/` rather than overlaid onto the incompatible Vite layout.
The optional local Go relay source is under `services/relay/`. The combined snapshot
contains 156 source/configuration/documentation/assets files with SHA-256 checksums
in `source-sync-manifest.json`.

## Inclusion boundary

Application code, package locks, schemas, data fixtures, tests, project docs and
assets are included. Dependencies, compiled outputs, private environment files,
keys, runtime databases and transient audit binaries are excluded. The source
workspaces were not reset or cleaned. The older duplicate Vetta checkouts add no
new app code: one contains an unused dependency addition; another contains a
single correction-history wording edit superseded by the existing changelog.

The companion's original docs and deployment configuration are retained verbatim
for provenance. They are not the operating guide for the primary application.
No unrelated reference-project code, documents or branding were imported.

## Preserved versus integrated

The primary Vetta branch changes are integrated. The companion API, encrypted-tip,
integrity and ledger packages are available in this repository, but are not wired
into the primary app. Repository synchronization does not imply those services
were deployed. Nostr publication remains paused. This handover does not change
repository visibility or activate a public relay.

One integration correction enables `allowImportingTsExtensions` in the companion
ledger typecheck configuration, matching its existing `.ts` import and `noEmit`
mode. The manifest preserves both original and corrected checksums for that file.

The concurrent upstream `c4fee6c` wording correction was also merged: Nostr is
takedown-resistant, not takedown-proof; relay operators can delete their copies.
