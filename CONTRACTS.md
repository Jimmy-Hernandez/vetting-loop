# THE VETTING LOOP — Data & Design Contracts (v1, frozen 2026-09-24)

**This is the seam between implementations.** Both the KITT lane and Terry's lane build against these contracts. Change them only by bumping the version and tagging `contracts-v2`.

## 1. Episode (ground truth)

August 2024 CS vetting: 20 nominees, 4 days of public hearings (County Hall), 19 approved / 1 rejected (Ms Stella Soi Lang'at). **The 19 approvals passed by voice vote** — Hansard records only `(Question put and agreed to)`, 7 Aug 2024. No per-MP recorded vote exists. This absence is the product's core message, always rendered as data (`"mechanism": "voice_vote"`, `"recorded_votes": []`), never as invented numbers.

Sources of record (all in this repo under `data/`):
- `EPISODE-NOTES.md` — episode skeleton + full source table
- `hansard/aug7-2024-na.txt` — Hansard 7 Aug 2024 (motion, register, vote line)
- `parliament-pdf/ocr-2024-report.txt` — OCR of the 258-page Committee on Appointments Second Report (see §4 for the line map)
- `flags/news-flags.json` — 33 sourced integrity flags
- `processed/positive-findings-2024.json` — positive findings + agency clearances, all 20 nominees
- `mzalendo/votes-na.csv` + `mzalendo/divisions/*.csv` — 10 real recorded divisions, per-MP rows

## 2. File contracts (app/public/data/)

### episode.json
```json
{
  "slug": "cs-vetting-august-2024",
  "title": "The Vetting of the Cabinet — August 2024",
  "date": "2024-08-07",
  "summary": "string",
  "nominees": [
    {
      "id": "nominee-01",
      "name": "canonical name",
      "portfolio": "string",
      "party": "string|null",
      "status": "approved" | "rejected",
      "flags": [ { "claim": "", "quote": "", "publisher": "", "url": "", "date": "", "legal_status": "" } ],
      "positiveFindings": [ { "claim": "", "page": 0, "ocr_confidence": "high|medium", "needs_verification": false } ],
      "backgroundChecks": { "eacc": {"outcome":"","page":0,"quote":""}, "helb": {}, "dci": {}, "orpp": {}, "kra": {}, "cue": {} },
      "hearingQuestions": {
        "asked":   [ { "text": "", "source": "mp|committee", "mp_name": "", "source_url": "", "line": 0 } ],
        "ignored": [ { "text": "", "source": "citizen", "source_url": "", "line": 0, "needs_verification": false } ]
      },
      "memoranda": { "header_found": true, "count": 0, "summary": "", "report_page": "" },
      "reportPageRef": "p.XX"
    }
  ]
}
```
`ignored` = a memorandum/allegation recorded in the report's memoranda observations with **no corresponding question** in the nominee's Q&A. Every item carries the OCR line number for audit.

### divisions.json
```json
{ "divisions": [ { "id": 0, "title": "", "date": "", "house": "National Assembly", "yes": 0, "no": 0, "result_url": "", "per_mp_csv_url": "" } ],
  "vetting_vote": { "motion_text": "<verbatim>", "mechanism": "voice_vote", "recorded_votes": [], "hansard_line": "(Question put and agreed to)", "hansard_date": "2024-08-07" } }
```

### hansard-excerpts.json
```json
{ "excerpts": [ { "speaker": "", "role": "", "text": "", "date": "2024-08-07", "url": "" } ] }
```
5–8 excerpts: the motion (Ichung'wah), the approval line, Soi rejection, Obokato quote, Wandayi recusal.

## 3. Content rules (bind both implementations)

1. **Every claim is sourced.** Flags: quote + publisher + URL + date + legal_status. Positive findings: page + OCR confidence. No bare allegations, no editorializing — this is defamation-sensitive civic tech.
2. **Symmetric evidence bar.** `flags[]` and `positiveFindings[]` render as co-equal sections. Zero findings is a valid, honest result — render the empty state, never pad.
3. **Voice-vote absence is data.** The /vote view shows `NO RECORDED VOTE — (Question put and agreed to)` contrasted with a real recorded division (Finance Bill 2024, 192/105).
4. **Non-partisan.** Criticise process, not persons. Rejection (Soi) is rendered as official outcome with her card visually distinct but NOT red.

## 4. OCR extraction map (from discovery, 2026-09-24)

Line numbers in `data/parliament-pdf/ocr-2024-report.txt`, per nominee `hdr | x.1 | x.2 | memoranda-hdr | x.3`:

```
4.1  Kindiki   2262|2270|2368|2848|2863      4.11 Mbadi    7066|7073|7155| 7440| 7444
4.2  Barasa    2934|2938|3032|  —  |3298      4.12 Mvurya   7510|7515|7617| 7936| 7946
4.3  Wahome    3359|3364|3473|3711|3730      4.13 Miano    8004|8011|8107| 8588| 8598
4.4  Ogamba    3789|3795|3856|4231|4242      4.14 Wandayi  8658|8665|8728| 9139| 9147
4.5  Tuya      4295|4300|4373|4696|  —†      4.15 Murkomen 9204|9211|9305| 9602| 9618
4.6  Karanja   4767|4772|4846|  —  |5116      4.16 Joho     9684|9691|9770|10232|10253
4.7  Duale     5179|5184|5276|5575|5598      4.17 Mutua   10309|10317|10431|10624|10641
4.8  Mugaa     5659|5664|5760|  —  |6050      4.18 Oparanya|10702|10710|10910|11145|11166
4.9  Chirchir  6109|6114|6211|6522|6542      4.19 Muturi |11227|11232|11340|11580|11610
4.10 Ndung'u   6601|6610|6740|  —  |6992      4.20 Soi    |11672|11677|11790|  —  |11962
```

- **Memoranda header missing for 5 nominees** (4.2, 4.6, 4.8, 4.10, 4.20): content is inline narrative — set `memoranda.header_found: false` and extract from the narrative using the "On [allegation]" pattern.
- Header OCR variants to accept: "Observation on Memoranda…" (singular), "Observations on Memoranda submitted against the Nominee" (lowercase), "Committees Observations on the Memoranda", "Committee's Observations on the Memoranda"; trailing punctuation variants on x.2/x.3 numbers; "4,19.3" comma.
- Q&A entries are numbered paragraphs; committee "On …" lead-ins inside the response narrative are asked-questions (27 in Joho's x.2 alone).

## 5. Design tokens (frozen — Variant B 'The Record')

```css
:root {
  --red:#b5212c; --red-dark:#8d1820; --red-tint:#f6e3e4;
  --green:hsl(144 100% 25%);           /* approved status ONLY */
  --paper:#f8f9fa; --grey-100:#f0f0f0; --grey-200:#e6e6e6;
  --line:#ddd; --grey-400:#ccc; --ink:#333; --ink-strong:#000;
  --measure:680px;                      /* prose measure */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s6:24px; --s8:32px; --s12:48px;
  --r1:4px; --r2:8px; --r3:14px;
  --font:'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
}
```
Full reference implementation: `mockups/variant-b-record.html` (frozen design decision, 2026-09-24). Container 1120px, editorial register, footnoted citations as red superscripts. Component B may embed variant C's triptych as the /vote hero and variant A's ledger as the deep-dive table — same tokens.

## 6. Serving

- `npm run dev` → port 5173, host 0.0.0.0 (tailnet-viewable)
- `npx vite build` must exit 0 before any "done" claim
- Static bundle must work standalone (file:// double-click) as a fallback demo mode
