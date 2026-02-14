#!/bin/bash

echo "🔄 Restarting Backend in Mock Auth Mode..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Kill any existing processes on port 5001
echo "1️⃣ Killing processes on port 5001..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
sleep 1

# Verify .env configuration
echo ""
echo "2️⃣ Checking .env configuration..."
if grep -q "USE_MOCK_AUTH=true" .env; then
    echo "   ✅ USE_MOCK_AUTH=true (Mock mode enabled)"
else
    echo "   ⚠️  WARNING: USE_MOCK_AUTH is not set to true!"
    echo "   Edit .env and set: USE_MOCK_AUTH=true"
    exit 1
fi

# Start backend
echo ""
echo "3️⃣ Starting backend server..."
echo ""
npm run dev
