@echo off
echo Starting Focuss Collaboration Platform...
echo.
echo This script will start both the frontend and the mock collaboration server.
echo.
echo Press Ctrl+C in this window to stop both servers.
echo.

cd /d "%~dp0"
call npm run dev:all 