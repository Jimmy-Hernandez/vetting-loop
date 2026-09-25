# Security and responsible reporting

Do not put credentials, private keys, anonymous submissions or exploitable private
details in public issues. Use GitHub's private vulnerability reporting facility if
enabled, or contact a repository maintainer privately to arrange a secure channel.
Do not assume a public issue is a confidential report.

The primary app serves public static JSON and has no login or submission backend.
The companion implementation includes experimental API, authentication and sealed
submission code; it is not enabled in the main demo. The optional relay source is
also outside the default runtime. Neither is a claim of audited security or anonymity.

Nostr publication remains disabled pending data due diligence. Signed events attest
to the publisher and bytes, not the truth of their contents; relay deletion is not
a reliable recall mechanism. No CI workflow in this repository publishes records
or deploys a service. Review dependency and data changes before enabling either.
