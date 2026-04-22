#!/usr/bin/env bash
# ─── JARVIS Launcher ────────────────────────────────────────────────
# Starts Ollama, Django backend, and React frontend in separate terminals

set -e

echo ""
echo "  ░░  J.A.R.V.I.S LAUNCHER  ░░"
echo ""

# 1. Check Ollama
if ! command -v ollama &>/dev/null; then
  echo "❌  Ollama not found. Install from https://ollama.com"
  exit 1
fi

echo "▶  Starting Ollama..."
ollama serve &>/dev/null &
sleep 2

# 2. Pull model if missing
ollama pull llama3 2>/dev/null || true

# 3. Django backend
echo "▶  Starting Django backend on :8000 ..."
cd "$(dirname "$0")/backend"
pip install -r requirements.txt -q
python manage.py migrate --run-syncdb -q
python manage.py runserver 8000 &
DJANGO_PID=$!

# 4. React frontend
echo "▶  Starting React frontend on :5173 ..."
cd "$(dirname "$0")/frontend"
npm install --silent
npm run dev &
REACT_PID=$!

echo ""
echo "  ✅  JARVIS is online!"
echo "  🌐  Open http://localhost:5173"
echo ""
echo "  Press Ctrl+C to shut everything down."
echo ""

# Cleanup on exit
trap "kill $DJANGO_PID $REACT_PID 2>/dev/null; echo 'JARVIS offline.'" EXIT
wait
