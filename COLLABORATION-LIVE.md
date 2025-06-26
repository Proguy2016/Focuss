# Making the Collaboration Room Live and Functional

This guide explains how to set up and run the live collaboration features.

## Overview

The collaboration room uses Socket.IO to provide real-time functionality:

1. A Socket.IO server running on port 4000 handles room management, messaging, file sharing, etc.
2. The React application connects to this server to send and receive real-time updates.

## Setup Instructions

### Method 1: Using the provided scripts

1. Run the setup script to install required dependencies:
   ```
   setup-server.bat
   ```

2. Start both the server and frontend:
   ```
   start-collaboration.bat
   ```

### Method 2: Manual setup

1. Install the server dependencies:
   ```
   npm install express cors socket.io
   ```

2. Start both the server and frontend:
   ```
   npm run dev:all
   ```

## Verifying It's Working

When the collaboration room is running correctly, you should see:

1. Console messages showing successful connection to the socket server.
2. The connection status indicator in the UI showing "online".
3. Real-time updates when you send messages, create tasks, etc.

## Troubleshooting

If you encounter issues:

1. **Socket Connection Errors:**
   - Make sure port 4000 is available
   - Check console for any CORS errors
   - Try restarting both the server and client

2. **Features Not Working:**
   - Check the browser console for errors
   - Verify that the server is running (look for "[Server] Collaboration server running" message)
   - Make sure you're joining the same room code if testing with multiple tabs/browsers

3. **Server Crashes:**
   - Check for error messages in the terminal
   - Make sure all dependencies are installed

## How It Works

The collaboration features are implemented as follows:

1. **CollaborationContext.tsx**: Manages Socket.IO connection and state
2. **collaboration-server.js**: Implements the server-side Socket.IO handlers
3. **CollaborationRoom.tsx**: Handles room creation and joining
4. **StudentCollaborationRoom.tsx**: Implements the UI for all collaboration features

The server uses in-memory storage to maintain room state during your session.

## Multiple Users Testing

To test with multiple users:

1. Open the app in multiple browser tabs/windows
2. Use the same room code in each tab
3. Use different user names when prompted
4. Observe real-time updates across all tabs

You should see messages, reactions, task updates, etc. sync in real-time across all connected clients.

---

With these instructions, you should have a fully functional real-time collaboration experience! 