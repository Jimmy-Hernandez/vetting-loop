# VETTA implementation status, 25 September 2026

The release publishes an independently reviewed historical roster. It does not claim full dataset accuracy clearance.

| Item | Implemented and tested | Operational limit |
| --- | --- | --- |
| Backup reader | Pinned author, event hash/Schnorr validation, strict schema, deterministic replacements, socket cleanup | Existing public relay configured; signed publication and independent readback recorded in qa/nostr-live-results.json |
| Fingerprints | File and nominee SHA-256, signed manifest, browser match/tamper verifier | Integrity is not factual accuracy |
| Bitcoin timestamp | Detached OpenTimestamps proof matching manifest, four pending calendars | No Bitcoin block attestation or independent block verification |
| Corrections | Public correction history, gated publisher, addressable snapshots and predecessor-linked correction notes | New correction chain published; older decentralized copies cannot be erased |
| Nostr identity | Matching domain document with CORS; signed profile artifact | Profile published; domain mapping verified over HTTPS |
| Encrypted tips | NIP-17 synthetic crypto roundtrip, disabled form, delivery ACK logic | Disabled until relay and recipient recovery handover |
| Offline | ZIP and single-file HTML; 20 records render without network | External source links need network |
| Owned relay | Build, eight relay test cases, live/stored/count privacy fixes, exact service/tunnel artifacts | Automatic approval review blocked permanent installation/activation |
| Donations | Destination-controlled UI, closed when unconfigured | Caroline-controlled destination not supplied |
| Handover | Written guide, local encrypted recovery matched pinned public key | No verified recipient/channel; no credential delivery or recipient recovery |

Original research data preserved privately. All 6,730 scalar fields accounted for (metadata included): 57 retained, 3 corrected, 6,670 withheld. The three public edits remove two OCR name artifacts and a rejection label from a portfolio. An additional unpublished dataset contains 596 source-backed repairs: 510 hearing references, 70 heading cleanups, 15 unknown memoranda counts and one job title. These repairs are not publication clearance.

Initial source coverage now includes the six previously omitted dossiers. Expanded allegations, positive findings, career histories and the 93-person ledger remain uncleared. The restricted release labels Soi as committee-recommended rejection because the local Hansard does not separately record the second House vote.

Production Pages deployments: vetta 1ace1b38, vetta-ke 88069c4b. All 27 endpoint checks passed after explicit legacy withdrawals; the signed data manifest was preserved across the final CSS-only change because all covered data bytes were unchanged. Zone cache-purge API returned unauthorized, but subsequent direct checks confirmed withdrawal notices on all 12 legacy data endpoints.

The public relay intermittently refused connections during follow-up checks. Successful independent readback verified all four signed events; this does not guarantee continuing relay availability. The publisher uses bounded idempotent retries. A separately operated owned relay remains an unmet resilience requirement.

Final display verification: deployed mobile homepage and signed manifest passed. The fallback rendered the actual signed 20-record publication without horizontal overflow using a captured signed-response replay; live relay connections remained intermittent. This UI replay is not an additional live availability check. Source push was initially blocked by automatic review, then allowed after authenticated GitHub metadata confirmed the existing repository is private and the account has push permission.
