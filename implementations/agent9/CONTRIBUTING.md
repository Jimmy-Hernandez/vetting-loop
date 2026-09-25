# Contributing to The Vetting Loop

Thank you for contributing! This project relies on community effort to maintain public accountability.

## Code Style
- **TypeScript Strict**: We use strict TypeScript. `any` types are strictly prohibited.
- **Formatting**: We use Prettier for formatting and ESLint for linting. Run `pnpm lint` and `pnpm format` before pushing.

## Branch Naming
- `feature/your-feature-name`
- `fix/bug-description`
- `data/nominee-name-update`

## PR Process
1. Fork the repo and create your branch.
2. Ensure local tests pass.
3. Open a PR using the provided template.
4. Wait for a maintainer to review.

## Integrity Flag Submission Process
If you are submitting new data (specifically Integrity Flags):
1. **Source Document Link Required**: You must provide a valid URL to the source document.
2. **Document Metadata**: Include the document type, publisher, and date.
3. Use the PR template checklist to verify compliance.

## Data Quality Standards
- No bare allegations. All claims must be backed by official reports (Auditor General, EACC, Courts, reputable journalism).
- Ensure dates and spelling match official records.

## Local Development Setup
1. Clone repo: `git clone ...`
2. Install dependencies: `pnpm install`
3. Setup local DB: `pnpm run db:setup`
4. Start dev server: `pnpm run dev`

## Testing Requirements
- Unit tests must pass (`pnpm test`).
- E2E tests (Playwright) must pass before merge.

## Non-Partisanship Policy
We maintain strict neutrality.
- **Acceptable**: "The Auditor General report (2022) flagged Ksh 5M in unaccounted funds under the nominee's tenure."
- **Unacceptable**: "The corrupt nominee stole our money."
Use objective, fact-based language. Avoid emotive adjectives.
