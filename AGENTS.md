# AGENTS.md — The Vetting Loop (DSH handover brief)

**You are the DSH agent on jimmys-macbook-pro-2, taking over this project as its primary builder.** This file is your complete briefing — read it fully before any work. Your operator is Jimmy (Discord), coordinating with KITT (orchestrator on the Mac mini) and a human co-developer, Terry (separate implementation, merge later). Work autonomously; push everything; never fabricate.

---

## 1. What this project is

**The Vetting Loop** — a civic-tech module for Kenyan parliamentary vetting accountability, built for a hackathon (deadline: tomorrow morning, 2026-09-25). Designed to eventually embed in mzalendo.com's Civic Tech Tools section.

**The episode:** the August 2024 CS vetting. President Ruto nominated 20 Cabinet Secretaries (15–23 July); public hearings ran 4 days at County Hall; 1,300+ citizen memoranda; the Committee on Appointments reported 19 approved / 1 rejected (Ms Stella Soi Lang'at) on 7 Aug 2024. **The core finding: the 19 approvals passed by VOICE VOTE** — Hansard records only `(Question put and agreed to)`. No per-MP vote record exists anywhere. The app renders that absence as data, contrasted against real recorded divisions (Finance Bill 2024) from Mzalendo.

**The three acts (routes):**
- `/` landing — masthead, hero display type '(Question put and agreed to)', outcome strip, three-act loop cards
- `/nominees` — 20-nominee grid, status badges
- `/nominee/:id` — dossier: flags[] (sourced allegations) AND positiveFindings[] (sourced clean records) as co-equal sections, backgroundChecks grid (EACC/HELB/DCI/ORPP/KRA/CUE), hearingQuestions asked[] vs ignored[], memoranda block
- `/vote` — accountability trail: verbatim motion blockquote, 19-row register, 'NO RECORDED VOTE' treatment, Finance Bill 2024 contrast bar

## 2. Repo map (absolute paths on this machine)

```
~/Desktop/vetting-loop/                  ← your clone (origin: github.com/Jimmy-Hernandez/vetting-loop, PRIVATE — your token has write access)
├── AGENTS.md                            ← this file
├── CONTRACTS.md                         ← DATA+DESIGN CONTRACTS v1 (frozen). READ FIRST after this file. Schemas, OCR line map, tokens, rules.
├── DATA-GUARDRAILS.md                   ← DATA INTEGRITY GATES. READ SECOND. These are hard rules, not guidelines.
├── data/
│   ├── EPISODE-NOTES.md                 ← episode skeleton + source table
│   ├── hansard/aug7-2024-na.txt         ← Hansard 7 Aug 2024, full text (1,510 lines)
│   ├── parliament-pdf/ocr-2024-report.txt ← OCR of the 258-page Committee report (12,274 lines)
│   │   (also the source PDFs: COA-2nd-report-aug2024.pdf is the Aug 2024 one)
│   ├── flags/news-flags.json            ← 33 sourced integrity flags (schema: nominee, claim, quote, publisher, url, date, legal_status)
│   ├── processed/positive-findings-2024.json ← positive findings + agency clearances, all 20 nominees
│   ├── processed/memoranda-extracts/    ← per-nominee memoranda extracts, line-refed ("line|text" format), 15/20 nominees
│   └── mzalendo/                        ← votes-na.csv (10 divisions index) + divisions/*.csv (per-MP vote rows) + mps/mps.json (13 committee MP profiles) + samples/
├── mockups/
│   ├── DESIGN-TOKENS.md                 ← Mzalendo live-CSS token survey
│   ├── variant-b-record.html            ← THE FROZEN DESIGN (owner+team ruled 2026-09-24). Editorial/documentary register.
│   ├── variant-a-ledger.html            ← kept as component reference (per-MP ledger table)
│   └── variant-c-juxtaposition.html     ← kept as component reference (3-card triptych, may become /vote hero)
├── app/                                 ← THE APP. Vite + React + TS. THIS IS YOUR MAIN WORKSPACE.
│   ├── public/data/episode.json         ← REAL DATA: 20 nominees, 33 flags, 82 positive findings, 510 asked questions (line-refed)
│   ├── public/data/divisions.json       ← 10 real divisions + vetting_vote block (voice_vote mechanism)
│   ├── public/data/hansard-excerpts.json ← 7 verbatim Hansard excerpts
│   └── src/                             ← types.ts, data.ts, routes/, views/, global CSS
└── scripts/
    └── vetting-glm.sh                   ← (Mac mini only) GLM worker lane — ignore here
```

## 3. Non-negotiable rules (violating any of these = product failure)

1. **Every claim is sourced.** Flags: quote + publisher + URL + date + legal_status. Positive findings: page + confidence. Nothing unsourced renders. Ever.
2. **Symmetric evidence bar.** flags[] and positiveFindings[] get identical treatment. Zero findings → honest empty state ("No documented findings in sources reviewed"). Never pad, never imply.
3. **Legal-status taxonomy** (DATA-GUARDRAILS Gate 2): convicted / charged / case_filed / self_admitted / accused_reported / official_clearance / no_action_recorded. Never collapse distinctions. "Accused" ≠ "guilty."
4. **Voice-vote absence is data.** Never render an invented per-MP vote. The /vote view shows the absence + the real contrast division.
5. **Non-partisan.** Criticise process, not persons. No ethnicity/religion/gender commentary. Soi's rejection card: visually distinct, NOT red (outcomes, not verdicts).
6. **No invented data.** OCR-uncertain → needs_verification:true (renders as 'unverified' chip). If a number doesn't exist in the data, the UI doesn't show a number.
7. **Design tokens are frozen** (CONTRACTS §5). Mzalendo red #b5212c family, Montserrat, 4/8/14 radii, editorial register. Do not re-theme. Component references (A/C variants) slot inside B's frame using the same tokens.
8. **Components are data-thin.** Every name/number/quote from the JSON. Zero hard-coded nominee content in components.
9. **Credibility > convenience.** If something can't be sourced, show the absence, honestly labeled.

## 4. Known state & current issues (as of handover, 2026-09-24 ~15:00 ET)

- App builds (`npx vite build` exit 0), runs (`npm run dev` → localhost:5173), deploys as static bundle (dist/ works from file://)
- Data: real 20-nominee episode.json landed (270KB). **KNOWN GAP being fixed by the Mac-mini lane in parallel: memoranda.header_found=false and ignored[] count is LOW (10 total) — the memoranda side of asked-vs-ignored is underpopulated. Salvaged extracts for 15/20 nominees sit in data/processed/memoranda-extracts/. Do NOT "fix" this yourself unless it's still broken after your first git pull — a fix lane is on it; avoid merge collisions by pulling before starting any data work.**
- One correction already applied: the mockup's "Obokato" quote is actually Ichung'wah's line (Hansard L589) — excerpts use the correct attribution. Watch for stale copies of the wrong attribution in any UI copy.
- git: branch `main`, pulls work with your read-only token. Tag `contracts-v1` marks the frozen contract point. Private repo.

## 5. Your mandate (push rights, full ownership)

You are the primary builder now. Priority order:

**P0 — Get the app running locally and verified on this machine:**
1. `cd ~/Desktop/vetting-loop/app && npm install && npx vite build` — confirm exit 0
2. `npm run dev` — open localhost:5173, click through all 4 routes
3. Report/fix anything broken. Data renders? Badges correct? /vote shows the voice-vote treatment?

**P1 — Visual & content QA (be strict; this is the credibility product):**
- Every nominee's dossier: flags render with quote/publisher/url/date? positiveFindings present? asked/ignored lists sane? Empty states honest?
- /nominees: 20 cards, 19 green + 1 distinct-outline (Soi)
- /vote: motion verbatim? NO RECORDED VOTE prominent? Finance Bill contrast bar with real numbers (192/105)?
- Responsive: no horizontal overflow at 390px
- Fix what you find, commit narrowly ("fix: ..." messages), push.

**P2 — Build out the three-act completeness (the hackathon demo):**
- Landing page should tell the whole story in one scroll: the episode, the finding, the three acts, the numbers
- /vote hero may adopt variant C's triptych (flag → question → outcome) inside B's frame — see mockups/variant-c-juxtaposition.html
- Consider a per-nominee "asked vs ignored" visual ratio (e.g. 36 asked / 1 raised for Joho) — data supports it
- Any new UI: data-thin, tokens respected, sourcing visible

**P3 — Breadth (only if P0-P2 are solid and time remains):**
- Kiswahili UI strings for key labels (deck's out-of-scope list said mocked is OK, but real is better)
- Print/export styles for the dossier (citable-document feel — journalists are a target audience)

**Commit discipline:** narrow commits, imperative messages ("fix: X", "feat: Y", "data: Z"), push after every verified unit. Never commit broken builds. Never commit to anything except main (this is a single-lane sprint; Terry's lane lives in a different repo entirely).

## 6. What NOT to do

- Do NOT touch `data/` source files (EPISODE-NOTES, ocr txt, flags JSON) unless fixing a verified factual error — log any such fix in the commit message with the source that proves it
- Do NOT re-theme, add UI frameworks, or add dependencies beyond react/react-dom/react-router-dom without need
- Do NOT publish/deploy anywhere public. The demo is local + static bundle. This repo stays PRIVATE.
- Do NOT write new data-extraction code unless the memoranda gap is still unfilled after a fresh pull (see §4)
- Do NOT modify CONTRACTS.md or DATA-GUARDRAILS.md (frozen; changes go through Jimmy/KITT)

## 7. If something breaks

- Build fails: read the error, fix, rebuild — don't switch models or tools
- Data looks wrong: check the source file it came from (line refs are in every item), not the component
- git push auth fails: your token may need re-paste; ask Jimmy in Discord
- Model/API issues on this laptop: the DSH credentials store (Models page in the web UI) is the fix path, not shell env
- Anything ambiguous about intent: default to §3's rules; they encode every decision the team already made

## 8. The demo (tomorrow morning)

The bar: **one real episode, fully sourced, with the voice-vote absence as the centerpiece.** The signature moment is the juxtaposition — a sourced integrity flag, beside the transcript where no MP asked about it, beside the approval that passed on a voice vote. Everything you build should make that moment sharper. The audience is hackathon judges + (eventually) Mzalendo's editors; the credibility of every number is the product.
