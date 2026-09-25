# HANDOFF — Vetta project checkpoint (2026-09-24, post-merge)

## For Terry (primary dev from here)
- `main` is canonical (commit ff82ac9): the combined product — your ledger/skills/signals IA + Vetta's Aug-2024 episode depth, Vetta brand throughout. `merge-best-of-both` is synced to the same commit (safe to delete).
- Data seams: `CONTRACTS.md` (frozen, tag contracts-v1), your `ledger.json` at `data/terry/ledger.json` AND `app/public/data/terry/ledger.json` (served), bridge code `app/src/slugSeam.ts` + `terryTypes.ts`.
- Run: `cd app && npm install && npm run dev` (HashRouter — clean paths redirect via shim in index.html; keep the shim map current when adding routes).
- Non-negotiables: `DATA-GUARDRAILS.md` (every claim sourced, symmetric evidence bar, honest absences) + `CONTRACTS.md` §5 tokens. `verify-data.py`-style gates: the Nostr publish gate (scripts/nostr/publish-episode.mjs) refuses mock data — never bypass, it's the anti-takedown credibility layer.
- Nostr: local relay docker `vetting-relay` on 7778 (strfry; db dir must pre-exist; no writePolicy). 22/22 episode events already published. Pi relay prompt in DEMO-RUNBOOK.md. Crash demo: kill web server → /#/fallback reads the record from relays.
- Caroline's docs: data/sources/caroline-vetting-observations.md (design requirements = the product thesis). Her compiled trackers are PRESS-T1 with needs_verification — verify vs Kenya Gazette before external citation.
- Open items: (1) 1920 full-bleed h1 measurement anomaly on /ledger — re-verify with fresh build; (2) crash-demo rehearsal; (3) post-demo: ignored[] depth (11 entries — bounded by source extracts), CHANGELOG stub.

## Key decisions log
- Voice vote = the spine: Act 3 renders 'NO RECORDED VOTE' as data. One gate rejection in vetting cycles (Soi); full record has 2 (Goma envoy) — scope stats explicitly.
- Acts are chronological: submissions in Act 1, hearing record Act 2, vote Act 3 (Caroline's data-type split rejected, submissions-move honored).
- Design: Variant B editorial register, frozen tokens (red hsl(358 81% 41%), Montserrat, 1120px prose), honest absences rendered as '—' with titles, never bare '0' where the record has no section.
- Brand: Vetta. Header lockup = white-bg mark + single dark wordmark (brand strip has a gray second VETTA — crop carefully).
