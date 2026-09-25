# Architecture Decision Records (ADRs)

## ADR-001: Turborepo Monorepo
**Date**: 2024-09-20
**Decision**: Use Turborepo for managing the monorepo.
**Context**: We need a way to manage multiple packages (Next.js web app, Hono API, shared TS types) efficiently.
**Consequences**: Faster builds due to caching, easier code sharing between frontend and backend, standard monorepo structure.

## ADR-002: Cloudflare Stack (Workers + D1 + Pages)
**Date**: 2024-09-20
**Decision**: Use Cloudflare Pages for Next.js hosting, Workers for the API, and D1 for the database.
**Context**: We want a serverless, scalable, and low-cost infrastructure for the hackathon MVP.
**Consequences**: Excellent edge performance, integrated ecosystem, but we must use SQLite (D1) instead of Postgres.

## ADR-003: Source-Linked Integrity Constraint
**Date**: 2024-09-21
**Decision**: Enforce a strict database constraint requiring a valid `SourceDocument` reference for every `IntegrityFlag`.
**Context**: To prevent defamation and maintain credibility, we cannot allow bare allegations on the platform.
**Consequences**: Higher friction for adding flags, but ensures high data quality and legal safety.

## ADR-004: Non-Partisanship Vocabulary Policy
**Date**: 2024-09-22
**Decision**: Implement a strict vocabulary policy requiring objective, fact-based language for all flags.
**Context**: The platform must remain a neutral accountability tool, not a partisan attack vector.
**Consequences**: Requires moderation of user-submitted flags to ensure compliance with the tone guidelines.

## ADR-005: Question Upvote Model
**Date**: 2024-09-24
**Decision**: Calculate upvotes purely server-side. No client-side optimistic updates or auth requirements for upvoting in MVP.
**Context**: We want to make it easy for users to upvote questions, but need to prevent vote manipulation.
**Consequences**: Slightly slower UX (waiting for server response), but prevents simple client-side vote manipulation without requiring full auth for upvoting.

## ADR-006: No Kiswahili at MVP
**Date**: 2024-09-24
**Decision**: Launch English-only for the hackathon, but scaffold with `next-intl` so strings are not hardcoded.
**Context**: Time constraints prevent full localization for the MVP, but architectural support is needed for future Kiswahili translation.
**Consequences**: Reduced accessibility at launch, but lower technical debt for future localization efforts.

## ADR-007: Source Document Delete Restriction
**Date**: 2024-09-24
**Decision**: SourceDocuments cannot be deleted if referenced by an IntegrityFlag (RESTRICT foreign key constraint).
**Context**: To maintain the accountability trail, we cannot allow a source document to be deleted if an active flag relies on it.
**Consequences**: Requires careful data management and prevents accidental erasure of evidence. Admins must remove flags before they can remove the underlying source document.
