@echo off
echo 🚀 Starting Rock Paper Scissors Maze Game Development Server...
echo 📍 Server will be available at: http://localhost:8000
echo 🔧 Open your browser and navigate to the URL above
echo 📝 Press Ctrl+C to stop the server
echo.

REM Check if Python 3 is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 🐍 Using Python server...
    python -m http.server 8000
) else (
    echo ❌ Python not found. Please install Python 3 or use a different server.
    echo 💡 Alternative: Use 'npx serve .' if you have Node.js installed
    pause
)