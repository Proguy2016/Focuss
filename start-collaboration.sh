#!/bin/bash

echo "Starting Focuss Collaboration Platform..."
echo
echo "This script will start both the frontend and the mock collaboration server."
echo
echo "Press Ctrl+C in this window to stop both servers."
echo

# Navigate to the script's directory
cd "$(dirname "$0")"

# Run the development command
npm run dev:all 