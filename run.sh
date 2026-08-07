#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "==> Installing dependencies..."
  npm install
fi

echo "==> Starting BugPilot..."
echo "    Open http://localhost:5173 in your browser"
echo "    Press Ctrl+C to stop."
npm run dev
