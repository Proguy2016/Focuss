@echo off
echo Installing dependencies for the collaboration server...
echo.

cd /d "%~dp0"
npm install express cors socket.io

echo.
echo Dependencies installed successfully!
echo Now you can run start-collaboration.bat to start the server and frontend. 