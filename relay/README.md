# VETTA relay completion package

Owner: Finestra. Correlation: vetta-20260925-completion.

The relay accepts organisation-signed records, giftwrap events addressed to that
organisation, and signed zap receipts tagging that organisation. Zap receipts are
not proof of a verified donation destination; validate the recipient/provider
before enabling any donations UI.

Privacy applies independently to persisted queries, live subscriptions (including
`limit: 0`), and COUNT. Anonymous clients may count explicit public event kinds;
broad counts and counts touching kind 1059 return zero with a restriction notice.
Only the configured public key, authenticated through NIP-42, may retrieve or
count giftwraps. The relay never receives an organisation private signing key.

## Deployment prerequisites

1. Confirm the organisation public key against the website reader, publisher,
   NIP-05 identity, and recovery inventory. Put only its lowercase hex public key
   and the canonical WebSocket URL in `~/.config/vetta-relay/relay.env`, based on
   `relay.env.example`.
2. Build and install the binary at `~/vetta-relay/vetta-relay`. Preserve any existing
   database. Create `~/.local/share/vetta-relay` with owner-only permissions.
3. Install `vetta-relay.service` as a user service. Validate host support for user
   namespace hardening and enable the service. It listens on 127.0.0.1:7447 only.
4. Route the authorised HTTPS/WebSocket hostname through the existing tunnel to
   localhost:7447; verify `/healthz`, NIP-11 metadata, and a synthetic WebSocket
   transaction through the public hostname. Do not publish live evidence as a test.
5. Verify unauthenticated and wrong-key clients cannot obtain stored/live giftwraps
   or COUNT metadata, and verify the actual reviewer client authenticates before
   showing encrypted tips. Review database backup and retention controls separately.

## Tests

`go test -v ./...` uses generated ephemeral keys, an isolated temporary database,
and a temporary local HTTP/WebSocket listener. Covers author rejection, bad
signatures, replaceable records, misaddressed tips, unauthenticated live and stored
giftwrap privacy, COUNT privacy, and authenticated reviewer retrieval/counting.

Encryption/decryption is a client responsibility: these relay tests use synthetic
payloads and do not establish end-to-end tip encryption or production availability.
