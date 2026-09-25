# The Vetting Loop — UI Mockups

Four rendered screen mockups covering every act of the vetting journey.
Design language: dark background, emerald accent, monospace labels, source-attribution always visible.

---

## Screen 1 · Homepage

Active vettings feed with three-act framing and per-nominee integrity flag counts.

![Homepage](mockups/01-homepage.jpg)

---

## Screen 2 · Nominee Dossier (Act 1 — Before)

Source-linked integrity flags, career timeline, and public question queue with upvotes.

![Nominee Dossier](mockups/02-nominee-dossier.jpg)

---

## Screen 3 · Hearing Record / Silence Map (Act 2 — During)

Side-by-side citizen questions vs. committee questions. Color-coded: flagged, asked, inadequate, ignored.
Coverage metric (28%) is the signature signal — prominent and persistent.

![Hearing Record](mockups/03-hearing-record.jpg)

---

## Screen 4 · Vote Trail (Act 3 — After)

Per-MP vote table with constituency and party. Amber alert surfaces unaddressed integrity flags.
Export to CSV/JSON for investigative use.

![Vote Trail](mockups/04-vote-trail.jpg)

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0a` | Page background |
| Surface | `#111111` / `#1a1a1a` | Cards, panels |
| Border | `#262626` | Subtle dividers |
| Accent | `#10b981` (emerald-500) | Active states, CTAs, source links |
| Danger | `#ef4444` (red-500) | Flagged issues, NAY votes |
| Warning | `#f59e0b` (amber-500) | Inadequate responses, alerts |
| Text primary | `#ffffff` | Headlines |
| Text secondary | `#a3a3a3` (neutral-400) | Body, descriptions |
| Monospace label | `font-mono text-xs tracking-widest uppercase` | Act labels, status tags |
