# Hackathon MVP — Weekend Scope

This document defines what is **In**, **Out**, and **Deferred** for the hackathon build. Changes to scope require explicit agreement from all three teammates.

---

## IN — Must ship by end of weekend

| Item | Owner | Notes |
|------|-------|-------|
| One real past CS vetting episode, seeded | Data lead | Source-linked; see `scripts/seed-episode.ts` |
| Nominee dossier page with integrity flags | Web | `apps/web/app/nominees/[slug]/page.tsx` |
| Public question queue with upvotes | Web + API | Read public; write requires Clerk session |
| Asked-vs-ignored hearing log | Web + API | `hearings` route; `summary.ignoreRate` displayed |
| Per-MP vote view | Web + API | `votes` route; filter by constituency TBD |
| Demo deploy: web on CF Pages, API on Workers | Infra | Use dev CF account; swap credentials post-hackathon |

---

## OUT (MOCKED) — Present in UI but data is illustrative

- Live-stream integration — UI shows placeholder
- Multi-episode history — single episode only
- Kiswahili UI — English only for MVP
- Accounts & notifications — Clerk installed; registration flows skipped

---

## THE SIGNATURE DEMO MOMENT

Judges must see, in one screen:

1. **An integrity flag** — with source citation (EACC report or court record)
2. **The transcript entry** — showing no MP asked about it (status: IGNORED)
3. **The vote tally** — unanimous approval

That juxtaposition is the problem statement demonstrated, not described.

---

## Acceptance Basis

Demo is accepted when:
- All three judges can navigate to the nominee dossier, see at least one source-linked flag
- The hearing record shows at least 2 citizen questions with ASKED/IGNORED status
- The vote page shows per-MP records with a source link
- No bare allegations appear anywhere in the rendered UI

---

## Post-Hackathon Backlog

1. Kiswahili UI (i18n with `next-intl`)
2. Email/SMS notifications on new vetting gazetted
3. Live Mzalendo sync cron (Workers Cron Triggers)
4. Semantic search over dossier documents (Vectorize)
5. CSO submission portal (auth + file upload to R2)
6. Multi-episode history and MP voting scorecard
