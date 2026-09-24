# DEMO-RUNBOOK — Nostr censorship-resistance crash demo (The Vetting Loop)

Staged demo: crash the local web server, show the record still reachable via
Nostr relays. Three copies exist at the end: (1) Mac mini relay `vetting-relay`
on 127.0.0.1:7778, (2) Terry's Raspberry Pi relay, (3) a public relay
(default: wss://relay.damus.io — swap for any public relay you prefer).

**SatPicks boundary:** this demo uses ONLY the `vetting-relay` container and
the standalone keypair in `scripts/nostr/vetting-loop-key.json` (gitignored).
Never touch `satpicks-relay`, satpicks keys, or relay.satpicks.com.

Absolute paths throughout; all commands run from `/Users/jimmy/Desktop/vetting-loop`.

---

## 0. One-time setup (already done)

- Standalone keypair generated: `node scripts/nostr/generate-key.mjs` →
  `scripts/nostr/vetting-loop-key.json`. The npub printed to stdout was:
  `npub1nawjp2mh56kgukt54p887usfa3r8qcj7srgacpka3aqm34e9zzcqaz0rfu`
  (record it somewhere safe; the nsec stays in the gitignored file, never in logs).

## 1. Start the relay (Mac mini)

```bash
bash scripts/nostr/run-relay-macmini.sh
# expect: HEALTH OK — relay answering on ws://127.0.0.1:7778
# teardown later: bash scripts/nostr/run-relay-macmini.sh --down
```

## 2. Publish the episode

```bash
node scripts/nostr/publish-episode.mjs --relay ws://127.0.0.1:7778 --relay wss://relay.damus.io
# 22 kind-1 notes: 1 episode summary + 20 nominee dossiers (t: nominee-<slug>)
# + 1 accountability-trail note. Wait for per-relay OKs; event ids print to stdout.
# Add --dry-run to inspect without connecting.
```

## 3. Verify from a second machine

From any machine on the tailnet/LAN (or Terry's Pi):

```bash
# wscat read-only subscription
npx --yes wscat -c ws://<mac-mini-ip>:7778 \
  -x '{"kinds":[1],"#t":["vetting-loop-aug2024"],"limit":500}'
```

Or paste one printed event id into https://nostr.chat / any Nostr client and
search by author npub (see §0). Expect 22 events tagged `vetting-loop-aug2024`.

Note: the relay binds to 127.0.0.1 on the Mac mini by default (private demo).
For the second machine to read it, publish an SSH tunnel:
`ssh -N -L 7778:127.0.0.1:7778 mini` — then point wscat at `ws://127.0.0.1:7778`
locally. Do NOT expose the port publicly unless the owner says so.

## 4. The crash sequence (the demo moment)

1. Confirm the app is live: `http://localhost:5173` renders the record normally.
2. Kill the web server:
   ```bash
   lsof -ti tcp:5173 | xargs kill    # dev server
   # or, for a static deploy: stop whatever serves the bundle (nginx/`npx serve` etc.)
   ```
3. Show the app is down: `curl -s http://localhost:5173/` → connection refused.
4. Open the static fallback bundle — served from anywhere the crash didn't touch
   (a second machine, a USB stick, GitHub Pages of the bundle): open
   `app/dist/index.html`, navigate to `/#/fallback` (or serve dist/ with
   `npx serve app/dist --listen 5199` and open `http://localhost:5199/fallback`).
   Banner reads: "Primary server unreachable — reading the record from the Nostr network."
5. The fallback view subscribes to the relay list (default
   `ws://127.0.0.1:7778` + `wss://relay.damus.io`; override with
   `?relays=ws://host:port,wss://other` or localStorage key `vetting-nostr-relays`),
   filters tag `vetting-loop-aug2024`, and renders the nominee list with
   status + flag counts. Footer: "Fetched from Nostr event <id> @ <relay>."
6. The record survives the crash. (And it survives relay #1 dying too — copies 2 and 3.)

## 5. Terry's Pi as relay #2

Give Terry this agent prompt verbatim:

> On the Raspberry Pi, set up a strfry Nostr relay:
> - Install Docker (`curl -fsSL https://get.docker.com | sh`) if not present.
> - Run: `docker run -d --name vetting-relay -p 7778:7778 -v vetting-relay-data:/data --restart unless-stopped dockurr/strfry`
> - No auth, no TLS needed on the tailnet; open port 7778 to the tailnet only.
> - Install as a systemd service so it survives reboot (the --restart policy covers docker; enable docker itself: `sudo systemctl enable --now docker`).
> - Health check: `curl -s -o /dev/null -w '%{http_code}' -H 'Upgrade: websocket' -H 'Connection: Upgrade' -H 'Sec-WebSocket-Key: x' -H 'Sec-WebSocket-Version: 13' http://127.0.0.1:7778/` → expect 101/200/400/426.
> - Report back the reachable relay URL (e.g. `ws://<pi-tailnet-ip>:7778`).
> - NO keys, NO nsec, nothing secret goes on the Pi. It is a dumb copy machine.

Then republish with the extra relay (the script takes multiple --relay args):

```bash
node scripts/nostr/publish-episode.mjs \
  --relay ws://127.0.0.1:7778 \
  --relay ws://<pi-url>:7778 \
  --relay wss://relay.damus.io
```

Three independent copies. Demo complete.

---

## Hygiene rules (enforced)

- Private keys never printed to logs; `scripts/nostr/*key*.json`, `*nsec*`,
  `*.key.json` are gitignored.
- App-side network code is subscribe/fetch ONLY — nothing in `app/src` publishes.
- The `vetting-relay` container is disposable (`--down`), volume retained.
- SatPicks infra is off-limits for this demo.


## Server toggle (MacBook DSH launchd — prevents auto-respawn during the kill step)

```bash
# CRASH DEMO: disable auto-respawn BEFORE killing the server
launchctl bootout gui/$(id -u)/com.dsh.vettingloop

# ... run the kill + fallback steps ...

# RESTORE after the demo
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.dsh.vettingloop.plist
```

## Fallback URL (verified)

The app uses **HashRouter**: the fallback works from BOTH the dev server and the static bundle:
- dev: http://localhost:5173/fallback (or /#/fallback)
- static file:// or `npx serve app/dist`: open `index.html#/fallback`
