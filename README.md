# Accuracy-first release — 25 September 2026

The live release at https://vetta.agent9.dev publishes a reviewed 20-person historical roster. Dossier claims, hearing metrics and the expanded ledger remain withheld. The previous headline has been replaced with “Follow the record. Question the process.”

See [implementation status](docs/IMPLEMENTATION-STATUS.md), [release runbook](docs/RELEASE-RUNBOOK.md), and [Caroline handover](docs/CAROLINE-HANDOVER.md). The private `review/` directory must never be deployed. Production artifacts are in `app/dist`; original data URLs return withdrawal notices.

Development: run `npm ci` in `app`, then `npm run build`. Signing requires the confirmed external organization key; a normal build neither reads keys nor publishes. OpenTimestamps tooling is pinned in `scripts/release/requirements.txt` and can be installed in a virtual environment. Public Nostr publication requires the explicit `--publish` flag; `--retry` reuses a saved signed bundle after incomplete acknowledgments. `--dry-run` loads no key and opens no relay connection.

---

# starter

Neutral private workspace. Theme and contents get decided live — this repo just needs to exist and be ready.

## Layout (rename freely)

```
/app        # code
/docs       # notes, decisions, demo script
/scripts    # setup + run helpers
```

## Ground rules

- Commit early, commit often — history is part of the story.
- Keep this README updated as decisions land: what it is, how to run it, what's done.
- Pin dependency versions before demo day.

## Run

```
# fill in once stack is chosen
```
