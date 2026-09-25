# Caroline: VETTA ownership and recovery

Status: operator-side recovery tested; recipient delivery and recipient recovery not completed.

## Public identity

The recovery-backed organization public key is `1a1c8a2d1e84562e51053eac7c6fbff1a20731c200b14585a898b18d15cf1bdb`.
The earlier separate key is not trusted by the new reader. It has not been deleted or revoked; historical publications may still use it. Confirm the new public fingerprint with Terry through a known channel before accepting credentials.

## Secure turnover

1. Confirm Caroline's recipient identity and a secure delivery channel with Terry. Never send secrets to an address inferred from a document or an unverified message.
2. Deliver only the NIP-49 encrypted key file through the agreed channel. Deliver its passphrase separately over a second verified channel. Do not email both together and do not attach plaintext keys.
3. On Caroline's trusted device, import the encrypted key into software supporting NIP-49. Match the derived public fingerprint above. Keep the secret out of browser extensions, screenshots, shared folders and chat histories.
4. Have Caroline sign a fresh random challenge and verify it against the pinned public key. The challenge must include date, handover ID and purpose; do not use a generic reusable string.
5. Verify Caroline can decrypt a synthetic NIP-17 tip locally, authenticate to the relay, read it, and restore from her own encrypted backup. Test failure with the wrong recipient key.
6. Record recipient receipt, public-key match, challenge verification and recovery outcome without recording secrets. Only then enable production tips and finalize custody. Do not destroy existing recovery files until the replacement has been tested and retention approved.

## Current limitations

The existing encrypted backup and passphrase are colocated on Finestra. Local decrypt-and-public-key verification passed, but this is not independent off-device recovery. No credentials have been delivered to Caroline. The tip form remains disabled to prevent accepting messages without a confirmed reviewing owner.

## Publishing and corrections

Every release must pass the claim register gate. Withheld source material stays outside the public directory. Reviewers must record exact primary-source passages and independent review for any newly published field. Rebuild hashes and offline artifacts after changes, sign the exact manifest, and request a new timestamp. A pending calendar receipt is not Bitcoin confirmation.

The Nostr publisher supports reviewed snapshots at stable address `30378:<public-key>:vetta:episode:aug2024`. Correction notes link each snapshot to its predecessor. Replacement does not erase copies held by other relays or readers. Retain local correction receipts and review evidence.

## Donations

Caroline must provide and confirm control of the payment destination. Enable the donation URL only after that confirmation. Never route donations through an operator's substitute account. No destination is configured yet.
