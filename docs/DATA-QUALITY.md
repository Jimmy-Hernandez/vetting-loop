# Data quality: software checks and editorial verification are separate

The 2026-09-25 offline audit finds **77 field-level review findings**, not 77 proven
factual errors: 33 free-text legal-status values outside the agreed taxonomy,
33 flags without an encoded `source_class`, and 11 provisional memorandum entries
with null source URLs already marked `needs_verification`.

See [machine-readable findings](data-audit.json). No factual records were silently
rewritten to make checks pass. Primary-source comparison, OCR attribution and
quotation fidelity remain editorial work. Several provisional memorandum entries
are affidavit clauses; they must not be promoted into a measured count of ignored
citizen questions without reviewing the underlying report.

## What CI checks

- Exactly 20 August 2024 nominees, 19 approvals and one rejection.
- Unique nominee IDs/slugs, sourced flag fields and positive-finding page references.
- Question line references and source URLs, or explicit unverified null-source state.
- Voice-vote mechanism and an empty individual-vote array.
- Ledger appointment references and publisher authorization gates.

These checks detect structural regressions. They do not satisfy every gate in
`DATA-GUARDRAILS.md`. In particular, they do not fetch all citations, compare every
quotation, verify line attribution against nominee boundaries, or establish that
all source classes and legal-status labels are valid.

## Required next editorial pass

A reviewer must map each flag to the agreed legal taxonomy using the source,
classify each publisher, verify question-to-nominee OCR attribution, and resolve
provisional memorandum entries. Document corrections in `data/CHANGELOG.md`, retain
uncertainty where evidence is insufficient, and re-run the structural checks.
Nostr publication must remain paused until that separate review is complete.
