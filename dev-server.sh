#!/bin/bash

echo "🚀 Starting Rock Paper Scissors Maze Game Development Server..."
echo "📍 Server will be available at: http://localhost:8000"
echo "🔧 Open your browser and navigate to the URL above"
echo "📝 Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python 3 server..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🐍 Using Python server..."
    python -m http.server 8000
else
    echo "❌ Python not found. Please install Python 3 or use a different server."
    echo "💡 Alternative: Use 'npx serve .' if you have Node.js installed"
    exit 1
fi