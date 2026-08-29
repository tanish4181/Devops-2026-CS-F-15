#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "==> Installing frontend dependencies..."
  npm install
fi

if [ ! -d server/node_modules ]; then
  echo "==> Installing server dependencies..."
  cd server && npm install && cd ..
fi

echo "==> Starting BugPilot (frontend + backend)..."
echo "    Frontend: http://localhost:5173"
echo "    Backend:  http://localhost:3001"
echo "    Press Ctrl+C to stop."
npm run dev
