#!/usr/bin/env bash
# =============================================================
#  Pawfect FurEver — Idempotent EC2 Setup Script
#  Run this script as many times as needed safely.
#  It will NOT fail if resources already exist.
# =============================================================
set -euo pipefail

APP_DIR="/home/ubuntu/pawfect-furever"
APP_NAME="pawfect-server"
NODE_VERSION="20"
LOG_FILE="/var/log/pawfect-deploy.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "=== Pawfect FurEver: Idempotent Deploy Script ==="

# ─── 1. Install Node.js (idempotent) ──────────────────────────
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_VERSION" ]]; then
  log "Installing Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  log "Node.js $(node -v) already installed. Skipping."
fi

# ─── 2. Install PM2 (idempotent) ──────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log "Installing PM2..."
  sudo npm install -g pm2
else
  log "PM2 $(pm2 -v) already installed. Skipping."
fi

# ─── 3. Create app directory (idempotent: -p flag) ────────────
mkdir -p "$APP_DIR"
log "App directory ready: $APP_DIR"

# ─── 4. Clone or pull latest code (idempotent) ────────────────
cd "$APP_DIR"
if [ -d ".git" ]; then
  log "Repository exists. Pulling latest changes..."
  git fetch origin
  git reset --hard origin/main
else
  log "Cloning repository..."
  git clone https://github.com/YOUR_USERNAME/ShopSmart.git .
fi

# ─── 5. Install server dependencies (idempotent) ──────────────
log "Installing backend dependencies..."
cd "$APP_DIR/server"
npm ci --omit=dev
log "Dependencies installed."

# ─── 6. Configure environment (idempotent) ────────────────────
if [ ! -f "$APP_DIR/server/.env" ]; then
  log "Creating .env from example..."
  cp "$APP_DIR/server/.env.example" "$APP_DIR/server/.env"
  log "WARNING: Please update .env with production values!"
else
  log ".env already exists. Skipping."
fi

# ─── 7. Start or restart server (idempotent) ──────────────────
cd "$APP_DIR"
if pm2 describe "$APP_NAME" &>/dev/null; then
  log "Restarting existing PM2 process: $APP_NAME"
  pm2 restart "$APP_NAME" --update-env
else
  log "Starting new PM2 process: $APP_NAME"
  pm2 start server/src/index.js \
    --name "$APP_NAME" \
    --env production \
    --log "/var/log/pawfect-server.log" \
    --error "/var/log/pawfect-server-error.log"
fi

# ─── 8. Save PM2 process list and enable startup ──────────────
pm2 save
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true
log "PM2 startup configured."

# ─── 9. Health check ──────────────────────────────────────────
log "Running health check..."
sleep 3
PORT="${PORT:-3000}"
if curl -sf "http://localhost:${PORT}/api/health" &>/dev/null; then
  log "✅ Health check PASSED — Server is running on port $PORT"
else
  log "⚠️  Health check failed — Check logs: pm2 logs $APP_NAME"
fi

log "=== Deploy Complete ==="
