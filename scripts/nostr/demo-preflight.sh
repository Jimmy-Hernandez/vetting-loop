#!/bin/bash
# Pre-flight for the Vetta presentation demo. Run: bash scripts/nostr/demo-preflight.sh
set -u
echo "=== VETTA DEMO PRE-FLIGHT ==="
echo

echo -n "1. relay container   : "
if docker ps --filter name=vetting-relay --format '{{.Status}}' | grep -q Up; then
  docker ps --filter name=vetting-relay --format '   {{.Status}} {{.Ports}}'
else
  echo "DOWN — start it: bash scripts/nostr/run-relay-macmini.sh"
fi

echo -n "2. tailnet bridge    : "
if lsof -nP -iTCP:7779 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "listening on 7779"
else
  echo "DOWN — start it: nohup python3 scripts/nostr/tailnet-bridge.py 7779 >/tmp/vetta_bridge.log 2>&1 &"
fi

echo -n "3. host stays awake  : "
if pgrep -x caffeinate >/dev/null 2>&1; then echo "caffeinate running"; else echo "NOT RUNNING — run: caffeinate -dimsu -t 21600 &"; fi
echo

echo "4. live signature check over the tailnet (the demo command):"
node "$(dirname "$0")/verify-relay.mjs" ws://100.97.35.100:7779 2>&1 | grep -E "Events pulled|events pass|FAILS|mismatch" | sed 's/^/   /'
echo
echo "If all four are green, the demo will work. Backup: advance to slide 7 in any deck."
