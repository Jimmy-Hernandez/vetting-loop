#!/usr/bin/env bash
# run-relay-macmini.sh — spin up the vetting-loop crash-demo relay (strfry).
# Fully independent: own container name 'vetting-relay', own volume,
# loopback port 7778. Does NOT touch any unrelated relay container on this host.
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

# Safety: confirm we are NOT operating on an unrelated relay container.
if docker ps --format '{{.Names}}' | grep -Fxv 'vetting-relay' | grep -q 'relay' >/dev/null; then
  echo "NOTE: another relay container is running and will NOT be touched."
fi

if docker ps --format '{{.Names}}' | grep -Fxq "$CONTAINER"; then
  echo "Relay '$CONTAINER' already running on ws://127.0.0.1:${PORT}"
else
  if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo "Pulling $IMAGE…"
    docker pull "$IMAGE"
  fi
  mkdir -p "${VOLUME_DIR}/db"
  # VERIFIED on this image: strfry needs the db dir to pre-exist (mdb_env_open fails
  # otherwise), conf must point db = "./strfry-db/" (relative), and the entrypoint
  # must pre-create it before /app/strfry.sh runs.
  docker run -d --name "$CONTAINER" \
    -p "127.0.0.1:${PORT}:7777" \
    -v "${VOLUME_DIR}/strfry.conf:/etc/strfry.conf:ro" \
    -v "${VOLUME_DIR}/db:/app/strfry-db" \
    --restart unless-stopped \
    --entrypoint sh "$IMAGE" -c "mkdir -p /app/strfry-db && /app/strfry.sh"
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