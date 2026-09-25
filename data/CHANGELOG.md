# Corrections log

The Vetting Loop record: corrections and provenance updates, newest first.

## 2026-09-24 · Punctuation pass on editorial fields (no factual change)

- **What:** replaced em dashes with commas, colons, semicolons or full stops in team-authored fields of `app/public/data/episode.json` (`title`, `summary`, `gateGaps[*]`, `subsequentEvents`, `stats.returnees_note`, `priorCycles.cabinet_2022` source/note/fate) and in the generator scripts that write them.
- **Why:** house style direction from Terry Richards (Agent9): no em dashes in published copy.
- **Not touched:** every `memoranda.quote` / `memoranda.summary` field. Those are verbatim Committee report text, and the dashes belong to the source.
- **Source:** no names, numbers, dates or outcomes changed. Verified by diff.
