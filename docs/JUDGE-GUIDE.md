# Judge guide: the decision is public; the individual vote is absent

**Product:** Vetta — Vetting in Action. **Problem:** Citizens can submit concerns,
but following those concerns through hearings to a parliamentary decision requires
reading fragmented records. Vetta places those stages beside one another.

## Three-minute walkthrough

1. **0:00–0:30 — `/`:** Introduce the public-record problem. The ledger counts people
   and nominations separately: one person can have several appointments.
2. **0:30–1:15 — `/nominees`, then a dossier:** Open the August 2024 cohort. Show
   sourced allegations beside documented positive findings, with page/line references.
   Explain that an allegation is not a conviction and OCR is not authoritative.
3. **1:15–2:00 — `/hearings`:** Show reconstructed committee questions and the
   limits of memorandum extraction. Do not describe 11 provisional entries as a
   complete count of ignored citizen submissions.
4. **2:00–2:30 — `/vote`:** Show the voice-vote record and absence of an individual
   MP roll call. Contrast with a recorded division; never infer individual positions.
5. **2:30–3:00 — `/ledger`, `/methodology`, `/fallback`:** Show the broader chronology,
   how claims are sourced, and the explicit pause on Nostr publication.

## Run the exact build

```bash
npm ci
npm ci --prefix app
npm test
npm run check:record
npm run build
npm run preview --prefix app -- --host 127.0.0.1
```

Open the URL printed by Vite. All route refreshes must resolve to the app. The
GitHub Actions artifact contains the same static build, suitable for an HTTP
server with SPA fallback. External citation links still require internet access.

## What to claim

- Implemented: browser-based record, dossiers, hearing view, vote trail and ledger.
- Implemented but paused: optional Nostr code, pending editorial due diligence.
- Not claimed: verified completeness, legal judgment, a security audit, live AI
  inference, or resilience against a real censorship event.

The [event website](https://www.aihackforfreedom.org/) frames the event around
freedom, privacy and decentralized technology. Vetta's relevant contribution is
traceable public accountability. The public event page does not supply a detailed
scoring rubric or complete submission checklist; this guide is a presentation aid,
not a certification of contest eligibility or submission.
