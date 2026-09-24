#!/usr/bin/env bash
# run-relay-macmini.sh — spin up the vetting-loop crash-demo relay (strfry).
# INDEPENDENT of SatPicks: new container name 'vetting-relay', own volume,
# loopback port 7778. Does NOT touch the running satpicks-relay container.
#
# Usage:
#   scripts/nostr/run-relay-macmini.sh            # start (idempotent)
#   scripts/nostr/run-relay-macmini.sh --down     # teardown
set -euo pipefail

CONTAINER=vetting-relay
IMAGE=dockurr/strfry:latest
PORT=7778
VOLUME=vetting-relay-data

case "${1:-}" in
  --down)
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    echo "Relay '$CONTAINER' removed (volume '$VOLUME' kept)."
    exit 0
    ;;
  "") ;;
  *) echo "Usage: $0 [--down]"; exit 2 ;;
esac

# Safety: confirm we are NOT operating on the satpicks relay.
if docker ps --format '{{.Names}}' | grep -Fx 'satpicks-relay' >/dev/null; then
  echo "NOTE: satpicks-relay is running and will NOT be touched."
fi

if docker ps --format '{{.Names}}' | grep -Fxq "$CONTAINER"; then
  echo "Relay '$CONTAINER' already running on ws://127.0.0.1:${PORT}"
else
  if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo "Pulling $IMAGE…"
    docker pull "$IMAGE"
  fi
  docker run -d --name "$CONTAINER" \
    -p "127.0.0.1:${PORT}:7778" \
    -v "${VOLUME}:/data" \
    --restart unless-stopped \
    "$IMAGE"
fi

# Health check: WebSocket handshake (strfry answers any HTTP GET on 7778).
sleep 2
CODE=$(curl -s -o /dev/null -w '%{http_code}' \
  -H 'Connection: Upgrade' -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
  -H 'Sec-WebSocket-Version: 13' \
  "http://127.0.0.1:${PORT}/" || true)
case "$CODE" in
  101|200|400|426) echo "HEALTH OK — relay answering on ws://127.0.0.1:${PORT} (http ${CODE})" ;;
  *)   echo "HEALTH FAIL — http code: ${CODE:-none}. Check: docker logs $CONTAINER"; exit 1 ;;
esac
docker ps --filter "name=${CONTAINER}" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'