#!/bin/bash
cd "$(dirname "$0")"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "First time setup: Installing dependencies..."
    npm install
fi

# Start the dev server
echo "Starting Content Creation Studio..."
open http://localhost:3005
npm run dev
