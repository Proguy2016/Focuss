/**
 * Mock Collaboration Server
 * 
 * This file provides a simple in-memory implementation of a collaboration server
 * to allow the UI to function without requiring a real backend.
 * 
 * In a production environment, this would be replaced with a real WebSocket server.
 */

const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Create an Express app
const app = express();

// Configure CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Collaboration server is running' });
});

// Create HTTP server
const httpServer = http.createServer(app);

// In-memory data store
const rooms = new Map();

// Initialize Socket.IO server with proper CORS
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Access-Control-Allow-Origin"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Helper to create a room if it doesn't exist
function ensureRoomExists(roomCode) {
    if (!rooms.has(roomCode)) {
        console.log(`[Server] Creating new room: ${roomCode}`);
        rooms.set(roomCode, {
            participants: [],
            messages: [],
            files: [],
            tasks: [],
            timer: { mode: 'work', timeRemaining: 25 * 60, isRunning: false }
        });
    }
    return rooms.get(roomCode);
}

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`[Server] New connection: ${socket.id}`);
    let currentRoom = null;

    // Handle room joining
    socket.on('joinRoom', ({ roomCode, user }) => {
        console.log(`[Server] User ${socket.id} attempting to join room ${roomCode}`);

        // Leave current room if in one
        if (currentRoom) {
            socket.leave(currentRoom);
            const room = rooms.get(currentRoom);
            if (room) {
                room.participants = room.participants.filter(p => p.id !== socket.id);
                io.to(currentRoom).emit('userLeft', { userId: socket.id });
            }
        }

        // Join the new room
        currentRoom = roomCode;
        socket.join(roomCode);

        const room = ensureRoomExists(roomCode);

        // Add user to participants (updating if they already exist)
        const existingUserIndex = room.participants.findIndex(p => p.id === socket.id);
        if (existingUserIndex >= 0) {
            room.participants[existingUserIndex] = {...user, id: socket.id };
        } else {
            room.participants.push({...user, id: socket.id });
        }

        // Send current room state to the joining user
        socket.emit('roomState', room);

        // Notify others that a new user joined
        socket.to(roomCode).emit('userJoined', { user: {...user, id: socket.id } });

        console.log(`[Server] User ${socket.id} joined room ${roomCode}`);
        console.log(`[Server] Room ${roomCode} now has ${room.participants.length} participants`);
    });

    // Handle chat messages
    socket.on('sendMessage', ({ roomCode, message }) => {
        console.log(`[Server] Message received from ${socket.id} in room ${roomCode}`);
        if (roomCode !== currentRoom) {
            console.log(`[Server] Error: User not in room ${roomCode}`);
            return;
        }

        const room = ensureRoomExists(roomCode);
        room.messages.push(message);

        // Broadcast to all users in the room (including sender for consistency)
        io.to(roomCode).emit('newMessage', message);

        console.log(`[Server] New message in room ${roomCode}: ${message.message}`);
    });

    // Handle reactions to messages
    socket.on('addReaction', ({ messageId, emoji, userId }) => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        const message = room.messages.find(m => m.id === messageId);

        if (message) {
            if (!message.reactions[emoji]) {
                message.reactions[emoji] = [];
            }

            const userIndex = message.reactions[emoji].indexOf(userId);
            if (userIndex === -1) {
                message.reactions[emoji].push(userId);
            } else {
                // Allow toggling reaction off
                message.reactions[emoji].splice(userIndex, 1);
            }

            io.to(currentRoom).emit('reactionAdded', { messageId, emoji, userId });
        }
    });

    // Handle typing status
    socket.on('setTyping', ({ userId, isTyping }) => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        const participant = room.participants.find(p => p.id === userId);

        if (participant) {
            participant.isTyping = isTyping;
            socket.to(currentRoom).emit('typingStatusChanged', { userId, isTyping });
        }
    });

    // Handle hand raised status
    socket.on('toggleHandRaised', ({ userId }) => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        const participant = room.participants.find(p => p.id === userId);

        if (participant) {
            participant.handRaised = !participant.handRaised;
            io.to(currentRoom).emit('handRaisedToggled', {
                userId,
                handRaised: participant.handRaised
            });
        }
    });

    // Handle file sharing
    socket.on('fileShared', (fileData) => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        room.files.push(fileData);

        io.to(currentRoom).emit('fileAdded', fileData);
    });

    // Handle whiteboard updates
    socket.on('tldrawUpdate', (data) => {
        if (!currentRoom) return;
        socket.to(currentRoom).emit('tldrawUpdate', data);
    });

    // Handle task management
    socket.on('addTask', ({ text }) => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        const newTask = {
            id: Date.now().toString(),
            title: text,
            description: '',
            assignee: '',
            status: 'todo',
            priority: 'medium',
            dueDate: new Date(),
            tags: [],
            completed: false,
            text: text
        };

        room.tasks.push(newTask);
        io.to(currentRoom).emit('tasksUpdate', room.tasks);
    });

    socket.on('toggleTask', ({ id }) => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        const task = room.tasks.find(t => t.id === id);

        if (task) {
            task.completed = !task.completed;
            io.to(currentRoom).emit('tasksUpdate', room.tasks);
        }
    });

    socket.on('deleteTask', ({ id }) => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        const taskIndex = room.tasks.findIndex(t => t.id === id);

        if (taskIndex !== -1) {
            room.tasks.splice(taskIndex, 1);
            io.to(currentRoom).emit('tasksUpdate', room.tasks);
        }
    });

    // Handle timer functions
    socket.on('startTimer', () => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        room.timer.isRunning = true;
        io.to(currentRoom).emit('timerUpdate', room.timer);

        // In a real implementation, you'd handle the actual countdown here
    });

    socket.on('pauseTimer', () => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        room.timer.isRunning = false;
        io.to(currentRoom).emit('timerUpdate', room.timer);
    });

    socket.on('resetTimer', () => {
        if (!currentRoom) return;

        const room = ensureRoomExists(currentRoom);
        room.timer = {
            mode: room.timer.mode,
            timeRemaining: room.timer.mode === 'work' ? 25 * 60 : 5 * 60,
            isRunning: false
        };
        io.to(currentRoom).emit('timerUpdate', room.timer);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`[Server] Client disconnected: ${socket.id}`);

        if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
                room.participants = room.participants.filter(p => p.id !== socket.id);
                io.to(currentRoom).emit('userLeft', { userId: socket.id });
                console.log(`[Server] Room ${currentRoom} now has ${room.participants.length} participants`);
            }
        }
    });
});

// Start the server on port 4000
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`[Server] Collaboration server running on port ${PORT}`);
    console.log(`[Server] Server is ready for connections`);
});

module.exports = { io, httpServer, app };