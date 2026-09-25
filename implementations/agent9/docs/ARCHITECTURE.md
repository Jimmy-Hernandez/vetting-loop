# Architecture

## System Diagram

```text
[ Browser / Client ]
        |
        v
[ Next.js (Cloudflare Pages) ]
        |
        v
[ Hono API (Cloudflare Workers) ]
        |
        +---> [ Clerk Auth ]
        |
        +---> [ Cloudflare D1 (SQL Database) ]
        |
        +---> [ Vectorize (Vector Search) ]
        |
        +---> [ R2 (Document Storage - Future) ]
```

## Data Flow Narrative

### Before (Dossier Phase)
1. Admin creates a Nominee Episode.
2. CSOs/Citizens submit IntegrityFlags with SourceDocument links via the Next.js UI.
3. Submissions hit Hono API, are validated, and stored in D1.
4. Citizens submit questions for the nominee, stored in D1.

### During (Hearing Phase)
1. Admins/volunteers monitor the live hearing.
2. They map asked questions to the submitted citizen questions.
3. The Silence Map is generated dynamically by comparing asked questions vs submitted questions, served by Hono API.

### After (Outcome Phase)
1. Official vote tally is retrieved.
2. MP votes are ingested via script (e.g., Hansard parser) into D1.
3. The Vote Trail is published, finalizing the episode.

## Auth Flow
- **Authentication**: Clerk handles user identity.
- **Middleware**: Cloudflare Worker middleware intercepts requests, verifies Clerk JWTs.
- **Role-based Access**: Users are assigned roles (Citizen, Admin). Admins have write access to create episodes and moderate flags.

## Data Ingestion Pipeline
- **Gazette Scraper**: Scrapes Kenya Gazette, runs seed script, populates D1.
- **Mzalendo API**: `sync-mzalendo` worker fetches MP profiles and upserts to D1.
- **Hansard PDF**: External parser converts PDF to structured JSON, pushes to D1 via API.

## Source Integrity Chain
Every `IntegrityFlag` requires a `SourceDocument`. When a flag is created, the API mandates a URL, publisher, and date. This ensures no bare allegations are published. If a flag is challenged, the source document provides the audit trail.

## Deployment Topology
- **Web**: Cloudflare Pages hosting the Next.js static export / SSR.
- **API**: Cloudflare Workers running the Hono backend.
- **Database**: Cloudflare D1 (SQLite) for relational data.
- **Search**: Cloudflare Vectorize for semantic search (e.g., matching questions).
- **Storage**: Cloudflare R2 for caching PDFs and assets (future).
