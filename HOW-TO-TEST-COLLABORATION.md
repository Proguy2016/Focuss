# How to Test the Collaboration Feature

Follow these steps to verify that the real-time collaboration is working correctly:

## Step 1: Start the Server and Frontend

1. **Start the collaboration server**:
   ```
   npm run server
   ```
   You should see output like:
   ```
   [Server] Collaboration server running on port 4000
   [Server] Server is ready for connections
   ```

2. **Start the frontend** (in a separate terminal):
   ```
   npm run dev
   ```
   This will start the Vite development server.

## Step 2: Test in Multiple Browser Windows

1. **Open two browser windows** (or tabs) side by side.
2. **In both windows**, navigate to: http://localhost:5173 (or whatever URL Vite shows)
3. **Go to the Collaboration page** in both windows.

## Step 3: Create and Join a Room

1. **In the first window**:
   - Click "Create Room"
   - A 6-digit room code will be generated
   - Click "Create & Join"
   - You should see the collaboration room interface

2. **In the second window**:
   - Click "Join Room"
   - Enter the 6-digit code from the first window
   - Click "Join"
   - You should see the same collaboration room interface

## Step 4: Verify Real-Time Features

If everything is working correctly, you should be able to:

1. **See both participants** in the room (check the participant count)
2. **Send messages** that appear in both windows
3. **Upload files** that show up for both users
4. **Create tasks** that are visible to both users
5. **Use the whiteboard** with changes visible to both users

## Troubleshooting

If the real-time features aren't working:

1. **Check the browser console** (F12 > Console) for connection errors
2. **Verify the server is running** on port 4000
3. **Make sure both windows are connected to the same room** (check the URL)
4. **Try refreshing both windows** and rejoining the room

For more detailed troubleshooting, see `COLLABORATION-TROUBLESHOOTING.md`. 