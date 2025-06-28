@echo off
echo Starting Focuss Collaboration Server...
echo.
echo This script will start ONLY the collaboration server on port 4000.
echo You can use this to test the server separately from the frontend.
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

cd /d "%~dp0"
call npm run server 