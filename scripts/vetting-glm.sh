#!/usr/bin/env bash
# Vetting Loop GLM 5.3 Flash worker lane (owner directive 2026-09-24: GLM 5.3 for this project).
# delegate_task cannot override its model pin — this spawns a real GLM-5.3 session instead.
# Usage: vetting-glm.sh <brief-file> [toolsets] [workdir]
set -euo pipefail
BRIEF_FILE="${1:?usage: vetting-glm.sh <brief-file> [toolsets] [workdir]}"
TOOLSETS="${2:-terminal,file}"
WORKDIR="${3:-$HOME/Desktop/vetting-loop}"
STAMP="$(date +%Y%m%d_%H%M%S)"
LOGFILE="$HOME/.hermes/logs/vetting-glm-$STAMP.txt"
BRIEF="$(cat "$BRIEF_FILE")"

echo "== VETTING LOOP GLM-5.3 WORKER =="
echo "   model:     z-ai/glm-5.3-flash (openrouter, 1.31M ctx)"
echo "   toolsets:  $TOOLSETS"
echo "   workdir:   $WORKDIR"
echo "   transcript:$LOGFILE"

cd "$WORKDIR"
# Idle watchdog (pattern from glm53-audit.sh 2026-09-15): kill only on output stall, not wall clock.
IDLE_TIMEOUT_S="${VETTING_GLM_IDLE_S:-240}"
WALL_TIMEOUT_S="${VETTING_GLM_WALL_S:-3600}"
OUT_FILE="$LOGFILE"
set +e
hermes chat -m "z-ai/glm-5.3-flash" --provider openrouter -t "$TOOLSETS" -q "$BRIEF" >"$OUT_FILE" 2>&1 &
CHAT_PID=$!
START_TS=$(date +%s); LAST_GROW_TS=$START_TS; LAST_SIZE=-1; KILL_REASON=""
while kill -0 "$CHAT_PID" 2>/dev/null; do
  sleep 5
  NOW=$(date +%s)
  SIZE=$(stat -f%z "$OUT_FILE" 2>/dev/null || echo 0)
  if [ "$SIZE" -ne "$LAST_SIZE" ]; then LAST_SIZE="$SIZE"; LAST_GROW_TS="$NOW"; fi
  IDLE=$(( NOW - LAST_GROW_TS )); WALL=$(( NOW - START_TS ))
  if [ "$IDLE" -ge "$IDLE_TIMEOUT_S" ]; then KILL_REASON="idle ${IDLE}s (limit ${IDLE_TIMEOUT_S}s)"; break; fi
  if [ "$WALL" -ge "$WALL_TIMEOUT_S" ]; then KILL_REASON="wall cap ${WALL}s (limit ${WALL_TIMEOUT_S}s)"; break; fi
done
if [ -n "$KILL_REASON" ]; then
  echo "KILLED: $KILL_REASON" | tee -a "$OUT_FILE"
  kill "$CHAT_PID" 2>/dev/null || true
  exit 1
fi
wait "$CHAT_PID"
RC=$?
echo "EXIT=$RC  transcript: $OUT_FILE"
exit $RC
