#!/bin/bash
# BohrLab 一键启动脚本
set -e

echo "========================================"
echo "  BohrLab — 材料逆向设计智能体"
echo "========================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 not found"; exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "Error: Node.js not found"; exit 1
fi

# Check .env
if [ ! -f backend/.env ]; then
    if [ -f .env.example ]; then
        cp .env.example backend/.env
        echo "⚠️  Created backend/.env from template."
        echo "    Please add your DeepSeek API Key to backend/.env"
    fi
fi

# Install backend deps
echo ""
echo "→ Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt -q
cd ..

# Install frontend deps
echo "→ Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

# Start both servers
echo ""
echo "→ Starting backend (port 8000)..."
cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

sleep 2

echo "→ Starting frontend (port 5173)..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ BohrLab running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
