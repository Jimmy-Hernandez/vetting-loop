# Corrections log

The Vetting Loop record: corrections and provenance updates, newest first.

## 2026-09-25 · Accuracy audit hotfix (4 corrections)

- **Tuya, `subsequentEvents[0]` removed.** The entry said the Gender docket "she was rejected for" sat vacant. That event belongs to Stella Soi Lang'at, who was rejected. Tuya was approved as Defence CS (Hansard, 7 Aug 2024). It was copied onto the wrong nominee.
- **Muturi, `flags[1]` removed.** Its only source was Nairobi Wire, a Gate 0 DISALLOWED publisher. It can come back only with a PRIMARY or PRESS-T1 source.
- **Mvurya, `flags[0]`: "November 2022" corrected to "October 2022".** Source: Committee report OCR, line 7533 ("Economy and Maritime Affairs from October 2022 to July 2024").
- **`priorCycles.cabinet_2022.outcome` corrected.** It said "no rejections recorded". The Committee recommended rejecting Peninah Malonza (Tourism) and the House overturned that recommendation, as this repo's own ledger (`cs-2022` cycle, `floor_override` hit) already records. The entry keeps `needs_verification`.
- **Found by:** a six-agent source audit on 25 Sep 2026 (review/accuracy-audit-2026-09-25.json).

## 2026-09-24 · Punctuation pass on editorial fields (no factual change)

- **What:** replaced em dashes with commas, colons, semicolons or full stops in team-authored fields of `app/public/data/episode.json` (`title`, `summary`, `gateGaps[*]`, `subsequentEvents`, `stats.returnees_note`, `priorCycles.cabinet_2022` source/note/fate) and in the generator scripts that write them.
- **Why:** house style direction from Terry Richards (Agent9): no em dashes in published copy.
- **Not touched:** every `memoranda.quote` / `memoranda.summary` field. Those are verbatim Committee report text, and the dashes belong to the source.
- **Source:** no names, numbers, dates or outcomes changed. Verified by diff.

