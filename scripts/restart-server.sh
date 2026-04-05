#!/usr/bin/env bash
# =============================================================
#  Pawfect FurEver — Idempotent Server Health Check & Restart
#  Safe to run multiple times. Won't break running processes.
# =============================================================
set -euo pipefail

APP_NAME="pawfect-server"
PORT="${PORT:-3000}"
HEALTH_URL="http://localhost:${PORT}/api/health"
MAX_RETRIES=5
RETRY_INTERVAL=2

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log "=== Health Check & Restart Script ==="

check_health() {
  curl -sf "$HEALTH_URL" &>/dev/null
}

# ─── Check if server is healthy ───────────────────────────────
if check_health; then
  log "✅ Server is healthy at $HEALTH_URL"
  exit 0
fi

log "⚠️  Server not responding. Attempting restart..."

# ─── Restart PM2 process (idempotent) ─────────────────────────
if pm2 describe "$APP_NAME" &>/dev/null; then
  pm2 restart "$APP_NAME"
  log "PM2 process restarted."
else
  log "ERROR: PM2 process '$APP_NAME' not found. Run deploy.sh first."
  exit 1
fi

# ─── Wait for server to come back up ──────────────────────────
log "Waiting for server to start..."
for i in $(seq 1 $MAX_RETRIES); do
  sleep "$RETRY_INTERVAL"
  if check_health; then
    log "✅ Server is back online after restart ($i attempts)"
    exit 0
  fi
  log "Attempt $i/$MAX_RETRIES..."
done

log "❌ Server failed to start after $MAX_RETRIES attempts"
log "Check logs with: pm2 logs $APP_NAME"
exit 1
