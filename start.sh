#!/bin/bash

echo "🚀 Starting Veterinary Website..."

# Start Node backend server (server.js)
echo "📡 Starting Node backend server (server.js)..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Seed the database
echo "🌱 Seeding database with sample data..."
curl -X POST http://localhost:5001/api/seed

# Start frontend server
echo "🎨 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ All services are starting..."
echo "📱 Frontend (CRA): http://localhost:3000"
echo "🔧 Node Backend (Express): http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Gracefully stop all on exit
trap "echo '🛑 Stopping services...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null" INT TERM
wait
