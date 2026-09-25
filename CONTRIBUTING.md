# Contributing to Vetta

Start with [README](README.md), [architecture](docs/ARCHITECTURE.md),
[CONTRACTS](CONTRACTS.md) and [DATA-GUARDRAILS](DATA-GUARDRAILS.md).
The Vite application in `app/` is the primary product. The companion implementation
is preserved in `implementations/agent9/`; changes there do not change the main app.

## Local checks

Use Node 22.12 or newer. Run `npm ci`, `npm ci --prefix app`, `npm test`,
`npm run check:record`, `npm run lint` and `npm run build` from the root.
Smoke-test the routes in [the judge guide](docs/JUDGE-GUIDE.md). New data checks must
include a failing fixture, not only acceptance of the current JSON.

## Evidence changes

Cite the primary source, its page/line and the date of retrieval. Preserve original
legal status and distinguish an allegation from a conviction. Apply the same
sourcing standard to positive findings. Never create an individual MP vote where
the source records a voice vote. Log verified corrections in `data/CHANGELOG.md`.
Treat frozen contracts as versioned interfaces; propose changes for team review.

`npm run check:record` checks structure; it does **not** implement every editorial
gate. Read [the data audit](docs/DATA-QUALITY.md) before describing data as verified.

## Pull requests

Explain the user-visible change, relevant source evidence, checks run and remaining
limits. Include desktop/mobile screenshots for visual changes. Keep credentials,
private keys, runtime databases and generated dependencies out of Git. Do not
activate Nostr or deployment workflows as a side effect of a code contribution.
