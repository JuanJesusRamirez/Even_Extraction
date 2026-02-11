#!/bin/bash
set -e

echo ""
echo "============================================="
echo "Starting Polymarket Development Environment"
echo "============================================="
echo ""

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed"
    echo "Please install uv from: https://github.com/astral-sh/uv"
    exit 1
fi

# Check if node/npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Sync Python dependencies with uv
echo "[1/4] Syncing Python dependencies with uv..."
uv sync
echo "[1/4] Done!"
echo ""

# Install frontend dependencies
echo "[2/4] Installing frontend dependencies..."
cd polymarket-dashboard
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..
echo "[2/4] Done!"
echo ""

# Start backend in background
echo "[3/4] Starting backend API on http://localhost:8000..."
uv run python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "[4/4] Starting frontend on http://localhost:3000..."
cd polymarket-dashboard
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================="
echo "Polymarket is running!"
echo "============================================="
echo "Frontend  : http://localhost:3000"
echo "Backend   : http://localhost:8000"
echo "API Docs  : http://localhost:8000/docs"
echo "Health    : http://localhost:8000/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" EXIT INT

wait
