#!/bin/bash
# Pre-flight for the Vetta presentation — NOSTR DISABLED state (2026-09-25).
# Run: bash scripts/nostr/demo-preflight.sh
#
# The Nostr lane is intentionally OFF pending data due diligence. This script
# asserts that it is genuinely off, so nobody demos a live relay by accident.
set -u
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
FAIL=0

echo "=== VETTA PRE-FLIGHT (Nostr disabled) ==="
echo

echo -n "1. publish path gated    : "
if grep -q "assertPublishEnabled" "$REPO/scripts/nostr/publish-episode.mjs" 2>/dev/null; then
  echo "yes (kill switch present)"
else
  echo "NO — publish-episode.mjs is NOT gated!"; FAIL=1
fi

echo -n "2. app flag default off  : "
if grep -q "VITE_NOSTR_ENABLED === '1'" "$REPO/app/src/nostr-fallback.ts" 2>/dev/null; then
  echo "yes (off unless explicitly enabled)"
else
  echo "NO — app flag missing!"; FAIL=1
fi

echo -n "3. tailnet exposure      : "
if lsof -nP -iTCP:7779 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "STILL OPEN on 7779 — the relay is reachable off-machine!"; FAIL=1
else
  echo "closed (no bridge listening)"
fi

echo -n "4. publish refuses now   : "
OUT=$(cd "$REPO" && node scripts/nostr/publish-episode.mjs 2>&1 | head -3)
if echo "$OUT" | grep -q "DISABLED"; then
  echo "yes — refuses with the disabled notice"
else
  echo "UNEXPECTED OUTPUT:"; echo "$OUT"; FAIL=1
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo "All green: Nostr is off, code intact, nothing can publish by accident."
else
  echo "SOMETHING IS NOT OFF — fix before presenting."
fi
echo "Deck backup slide (2nd to last) carries the architecture story if asked."
