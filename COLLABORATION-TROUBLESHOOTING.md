# Collaboration Room Troubleshooting Guide

This guide will help you resolve issues with the real-time collaboration feature.

## Quick Start

To get the collaboration room working properly:

1. **Start the server first**:
   ```
   npm run server
   ```
   or use the batch file:
   ```
   start-server-only.bat
   ```

2. **Start the frontend** (in a separate terminal):
   ```
   npm run dev
   ```

3. **Or start both at once** with:
   ```
   npm run dev:all
   ```
   or use the batch file:
   ```
   start-collaboration.bat
   ```

## Testing the Server

To verify the server is running correctly:
```
node test-server.js
```

You should see a success message if the server is running properly.

## Common Issues and Solutions

### 1. "The collaboration room doesn't connect to the server"

**Symptoms:**
- The UI loads but no real-time updates happen
- You only see yourself in the participants list
- Messages don't appear in other tabs/browsers

**Solutions:**
- Make sure the server is running on port 4000
- Check browser console for connection errors
- Ensure no firewall is blocking WebSocket connections
- Try using a different browser

### 2. "I get a connection error in the console"

**Symptoms:**
- Console shows "Connection Error" messages
- Socket.io fails to connect

**Solutions:**
- Verify the server is running (`npm run server`)
- Check if port 4000 is already in use by another application
- Try restarting both the server and the browser

### 3. "The room code doesn't work when sharing with others"

**Symptoms:**
- Others can't join your room with the same code

**Solutions:**
- Make sure everyone is connecting to the same server
- Check that the room code is exactly 6 digits
- Verify that the URL has the correct room parameter

### 4. "The server crashes or doesn't start"

**Symptoms:**
- Error messages when running `npm run server`
- The terminal exits immediately

**Solutions:**
- Check for Node.js version compatibility (use Node.js 14+)
- Run `npm install` to ensure all dependencies are installed
- Check the server logs for specific error messages

## Advanced Troubleshooting

### Checking Server Logs

If you're experiencing issues, check the server logs by running:
```
npm run server > server-log.txt 2>&1
```

### Testing WebSocket Connection

You can test the WebSocket connection with a simple client:
```javascript
const { io } = require("socket.io-client");
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected to server!");
  socket.emit("joinRoom", { roomCode: "123456", user: { name: "Test User" } });
});

socket.on("roomState", (data) => {
  console.log("Room state received:", data);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});
```

### Checking Network Traffic

Use browser developer tools (F12) > Network tab > WS filter to monitor WebSocket traffic.

## Getting Help

If you're still experiencing issues:
1. Collect the server logs
2. Take screenshots of any error messages
3. Note the steps to reproduce the problem
4. Contact support with this information 