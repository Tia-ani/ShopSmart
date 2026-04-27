#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting backend and frontend..."

cd "$ROOT_DIR"
npm run dev:server &
SERVER_PID=$!

npm run dev:client &
CLIENT_PID=$!

cleanup() {
  echo ""
  echo "Stopping backend and frontend..."
  kill "$SERVER_PID" "$CLIENT_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

wait "$SERVER_PID" "$CLIENT_PID"