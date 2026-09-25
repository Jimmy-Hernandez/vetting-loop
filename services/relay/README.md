# Optional Vetta relay source

Preserved from the existing local relay implementation on 2026-09-25. Not required
for the primary static demo; not launched or deployed by repository CI.

`go.mod` records the source toolchain requirement. Configuration is through
`VETTA_PUBKEY`, `LISTEN`, `DB_PATH` and `SERVICE_URL`; keep signing keys and stored
submissions outside this directory. Read `main.go` before operating it.

This handover preserves source, not an independently audited security guarantee.
Keep the main project's publication pause in force pending editorial review.
