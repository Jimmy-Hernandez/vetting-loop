# The Vetting Loop — Product Roadmap

> Status: Hackathon MVP → Production Civic Tool

---

## Phase 0 · Hackathon MVP (September 2026 Weekend)

**Goal:** One real episode, end-to-end, demo-ready in 48 hours.

| Deliverable | Status |
|-------------|--------|
| Nominee dossier with source-linked integrity flags | ✓ Built |
| Public question queue with upvotes | ✓ Built |
| Hearing record: asked-vs-ignored log | ✓ Built |
| Per-MP vote trail with source links | ✓ Built |
| Cloudflare Workers API + D1 database | ✓ Built |
| Next.js 14 App Router frontend | ✓ Built |
| CI/CD via GitHub Actions | ✓ Built |
| Demo seed data (1 episode) | ☐ Seed URLs needed |

**The signature demo moment:** integrity flag + no MP asked + unanimous approval — all on one screen.

---

## Phase 1 · Post-Hackathon Hardening (October–November 2026)

**Goal:** Reliable enough for real Kenyan civil society to use.

### 1.1 Data Pipeline
- [ ] Mzalendo nightly sync via Workers Cron Trigger
- [ ] Kenya Gazette RSS watcher → auto-create nominee stub
- [ ] Hansard PDF parser → structured JSON → D1 import
- [ ] EACC adverse report scraper (monthly)

### 1.2 Auth & Participation
- [ ] Clerk sign-up flow with Google + Email
- [ ] Citizen question submission (authenticated)
- [ ] CSO submission portal with file upload to R2
- [ ] Admin dashboard: approve/reject community flags

### 1.3 Search & Discovery
- [ ] Cloudflare Vectorize integration for semantic search
- [ ] Nominee name search with autocomplete
- [ ] Filter by status, appointment type, ministry

### 1.4 Quality & Ops
- [ ] Playwright E2E test suite (5 critical flows)
- [ ] Error boundary + structured logging via Cloudflare Logpush
- [ ] Rate limiting on upvote + question endpoints
- [ ] GDPR-compatible anonymous submissions

---

## Phase 2 · Multi-Episode & Longitudinal Tracking (Q1 2027)

**Goal:** Move from episode-viewer to accountability database.

- Multi-episode history with timeline view
- MP vetting scorecard: participation rate, questions asked, vote record
- "Has this nominee been vetted before?" cross-reference
- Committee quality score: % citizen questions addressed
- Constituency dashboard: "how did your MP vote on all appointments this year?"
- Chapter Six compliance index (composite score from public sources)

---

## Phase 3 · Citizen Reach (Q2 2027)

**Goal:** Reach citizens who don't use the web.

- Kiswahili UI (`next-intl` internationalization)
- SMS question submission via Africa's Talking API
- WhatsApp chatbot (webhook to Workers AI)
- Email digest: "New vetting gazetted in your constituency"
- Embeddable flag widget for Kenyan news sites
- Press release generator for CSO partners

---

## Phase 4 · Institutional Integration (Q3 2027)

**Goal:** Become the default tool for parliamentary accountability orgs.

- Mzalendo deep integration (co-branded dossier export)
- Parliamentary calendar sync (auto-schedule hearings)
- Official API for CSOs and researchers (documented, rate-limited)
- Data export: structured JSON, CSV, OpenDocument
- Kenya Open Data Initiative publication

---

## Non-Goals (permanent)

- Do not editorialize on nominees — cite sources, never opinions
- Do not expose personal data beyond what is public record
- Do not take political positions — vocabulary is procedural, not partisan
- Do not build live-streaming infrastructure (link to KNA/Parliament channel)

---

*Updated: September 2026 · Team: Caroline Gaita, Jimmy, Terry Richards (Agent9)*
