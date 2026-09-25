# Vetta — Vetting in Action

A public record of parliamentary vetting in Kenya: who was nominated, what citizens
submitted, what the committee asked, and how the decision was actually made.

Vetta exists because the decision is public but the accountability often isn't. In
August 2024 the National Assembly approved 19 Cabinet Secretaries on a **voice vote**.
The official record contains six words — *"(Question put and agreed to)"* — and no
recorded vote. There is nowhere a citizen can look up how their MP voted on the people
who now govern them. Vetta is that missing record.

## What's in the record

- **93 people** across **111 nominations** in **10 vetting cycles**, 2022–2025
- The August 2024 episode in depth: **20 nominees, 19 approved, 1 rejected**
- **510** committee questions reconstructed from the committee's own 258-page report, each line-referenced
- **1,300+** citizen memoranda; **33** sourced integrity flags beside **82** documented strengths
- Recorded divisions for contrast: the Finance Bill 2024 divided **192–105**, every name logged

Every claim carries a quote, a URL, a date and a legal status. Where the record is
empty, the emptiness is rendered as data — `NO RECORDED VOTE` — never invented.
No rankings, no bare allegations, and positive findings published with the same
prominence as flags. `needs_verification` marks anything not yet checked against a
primary source.

## Run it

```bash
cd app
npm install
npm run dev        # local dev server
npm run build      # production bundle -> app/dist
```

The app is a static bundle over data-thin JSON in `app/public/data/`. There is no
database, no login, and no server-side component required to serve the record.

Node scripts:

```bash
bash scripts/nostr/demo-preflight.sh          # asserts the Nostr lane is OFF (see below)
node scripts/nostr/verify-relay.mjs  <relay>  # read-only: verify signatures on any relay
node scripts/nostr/purge-events.mjs           # read-only inventory of our published records
```

## Status

**Recording layer: shipped.** The app renders the record from sourced data.

**Nostr publication layer: built, tested, and intentionally OFF.** The record is
designed to publish as cryptographically signed Nostr events, so that no single host
can quietly edit or delete it. That layer is implemented and verified — and it is
currently switched off pending a further due-diligence pass over the underlying data.
Publishing requires two explicit gates, and nothing from this project is published on
any public relay at present. The app's offline route says so plainly rather than
implying a live network. See `DEMO-RUNBOOK.md` for the current state and the re-enable
procedure.

**Data verification: in progress.** Items carrying `needs_verification` should not be
cited externally until checked against the primary source.

## Sources and attribution

See `ATTRIBUTION.md`. Primary sources include the National Assembly's Hansard, the
Committee on Appointments' own reports (OCR'd and line-referenced in this repo), and
Mzalendo's published voting records (CC BY-SA 4.0).

## Layout

```
/app          Vite + React + TypeScript app (the record's public face)
/data         source documents, OCR output, compiled ledger, memoranda extracts
/deck         the original problem statement
/mockups      design explorations
/scripts      data assembly, Nostr lane (currently disabled), pre-flight checks
```

## License

Code: MIT (`LICENSE`). Data and content: see `ATTRIBUTION.md` — third-party sources
retain their own licenses.
