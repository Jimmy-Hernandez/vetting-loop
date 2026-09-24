# THE VETTING LOOP — Data Integrity Guardrails (v1)

**These are hard gates, not guidelines.** Every data unit must pass all applicable gates before commit. The credibility of the platform IS the product; a single fabricated or unsourced item on any surface voids the demo. Both implementations (KITT lane, Terry lane) are bound by this file — it rides with `CONTRACTS.md` at repo root.

## Gate 0 — Provenance classes (every data item carries one)

| Class | Definition | Allowed sources |
|---|---|---|
| **PRIMARY** | Official/parliamentary record | parliament.go.ke PDFs, Hansard (parliament or mzalendo), committee reports, gazette notices, EACC/DCI/KRA/HELB/CUE/ORPP official statements or letters |
| | | Mzalendo structured data (voting CSVs, MP profiles, Hansard text) |
| **PRESS-T1** | Established newsroom, named journalist | Daily Nation, The Standard, Business Daily, Capital FM, Citizen Digital, The Star, Kenyans.co.ke, BBC, Africa Check |
| **PRESS-T2** | Legit but secondary | The Eastleigh Voice, People Daily, regionals — allowed for claims ALSO carried by T1 sources, or as corroboration only |
| **DISALLOWED** | Blogs, aggregators, social posts, unnamed sources, AI-generated content sites | Nairobi Wire, random Substacks, random blogs — **auto-reject, do not cite** |

Every item records `source_class` + `publisher` + `url` + `date`. If the URL 404s at verification time, the item drops to `needs_verification: true` and is excluded from the default view.

## Gate 1 — Quotation fidelity
- Every `quote` must be verbatim from the cited source (verify by fetching the URL and string-matching, or by line reference to a repo file).
- OCR-derived quotes: normalized only for OCR artifacts (stray chars, broken words); any longer normalization requires `needs_verification: true`. Never paraphrase inside a quotation.

## Gate 2 — Legal status labeling
Every flag carries `legal_status` ∈ {`convicted`, `charged`, `case_filed`, `self_admitted`, `accused_reported`, `official_clearance`, `no_action_recorded`}. Mapping rules:
- Court ruling exists → convicted/charged/case_filed only if the source literally says so
- The person said it → self_admitted
- Clearance letter exists (e.g. EACC letter of 29 Jul 2024 for Joho) → official_clearance
- Press reports allegation only → accused_reported
- **Never** collapse these distinctions. "Accused" ≠ "charged" ≠ "guilty."

## Gate 3 — Symmetric evidence bar
- `flags[]` and `positiveFindings[]` obey identical structure and sourcing gates. A positive claim with a weak source is as unacceptable as a negative one.
- Zero findings (either direction) renders as an explicit empty state: "No documented findings in sources reviewed." Never padded, never implied.

## Gate 4 — No conflation
- Separate DISTINCT episodes (2022 vetting ≠ 2024 vetting). A flag from 2022 reporting must carry the 2022 date and, in multi-episode views, the episode id.
- Separate PERSON from OFFICE: criticism attaches to conduct/records, not identity. No ethnicity, religion, gender commentary. Ever.
- Distinguish `accused` (a person alleged to have done something) from `contested` (a fact in dispute, e.g. degree authenticity) — schema field `disputed: true` where the fact itself is contested.

## Gate 5 — Machine verification before commit
A data lane's "done" claim is only accepted when this script exits 0 (repo root, `scripts/verify-data.py`):

```
1. JSON parse + schema check (all required keys present, types correct)
2. URL hygiene: every url is http(s), no dead-bare hosts; dedupe check (same claim+url counted once)
3. Source-class check: every item's publisher ∈ Gate-0 allowlist (else needs_verification:true + flagged in stderr)
4. OCR line refs: every extracted item's 'line' falls inside the nominee's §4 map range in CONTRACTS.md
5. Episode integrity: exactly 20 nominees per episode, 19 approved + 1 rejected (Aug 2024)
6. Quote spot-check: random sample of 5 items — fetch source URL, confirm the quoted string appears (allowing OCR normalization); failures set needs_verification and print
7. Date sanity: no dates in the future; press dates precede or equal the hearing date unless the claim is explicitly historical
```
CI/local runner: `bash scripts/verify-data.sh` — data PRs/commits that fail do not push.

## Gate 6 — Correction & challenge protocol
- Any name/number challenge → re-verify against the primary source before touching the artifact; log the correction in `data/CHANGELOG.md` (what changed, why, source).
- Named-person accuracy trumps demo convenience: if we cannot source it, we show the absence ("No documented record found — not evidence of absence").
- Disputed facts (e.g. degree authenticity, which IS contested) render with both the allegation AND the nominee's response position, per the report's own fairness convention.

## Gate 7 — New-source onboarding (for the expanded episodes)
Adding Oct 2022 / 2025 episodes or Mzalendo profile mining requires:
1. Source registered in `EPISODE-NOTES.md` source table with class + retrieval date
2. PDFs verified by page count + spot-text match before extraction
3. New nominees follow the same §4-style line map (discovery agent maps first, per protocol)
4. All gates above apply per item