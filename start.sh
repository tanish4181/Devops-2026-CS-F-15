#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "Starting BugPilot..."
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"

node server/index.js &
SERVER_PID=$!

npx vite --host &
VITE_PID=$!

trap "kill $SERVER_PID $VITE_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
