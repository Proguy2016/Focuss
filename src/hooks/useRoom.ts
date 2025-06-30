import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  isTyping?: boolean;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
}

export interface RoomFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface Room {
  id: string;
  name: string;
  participants: Participant[];
  messages: Message[];
  tasks: Task[];
  files: RoomFile[];
  isRecording: boolean;
  sessionTimer: number;
  whiteboard?: {
    elements: any[];
  };
}

const COLLABORATION_SERVER_URL = 'http://localhost:4001';

export function useRoom(roomId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }

    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Create socket with auth
    const newSocket = io(COLLABORATION_SERVER_URL, {
      auth: {
        token: token || undefined
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
      
      // Get user info from localStorage or context
      const userId = localStorage.getItem('userId') || `user-${Date.now()}`;
      const userName = localStorage.getItem('userName') || 'Anonymous User';
      const userAvatar = localStorage.getItem('userAvatar');
      
      // Join the room
      newSocket.emit('join-room', {
        roomId,
        user: {
          id: userId,
          name: userName,
          avatar: userAvatar
        }
      });
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to collaboration server');
      setIsLoading(false);
    });
    
    newSocket.on('error', (message) => {
      console.error('Server error:', message);
      setError(message);
    });
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.emit('leave-room', {
          roomId,
          userId: localStorage.getItem('userId') || `user-${Date.now()}`
        });
        newSocket.disconnect();
      }
    };
  }, [roomId]);
  
  // Handle room data updates
  useEffect(() => {
    if (!socket) return;
    
    // Initial room data
    socket.on('room-data', (data) => {
      setRoom(data);
      setIsLoading(false);
    });
    
    // New message
    socket.on('new-message', ({ message, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    // Task updates
    socket.on('task-updated', ({ task, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    // Task deletion
    socket.on('task-deleted', ({ taskId, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    // Participant joined
    socket.on('participant-joined', ({ userId, userName, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    // Participant left
    socket.on('participant-left', ({ userId, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    // Recording toggled
    socket.on('recording-toggled', ({ isRecording, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    // Whiteboard updates
    socket.on('whiteboard-updated', ({ elements, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    // Typing status updates
    socket.on('typing-status-updated', ({ userId, isTyping, location, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    // File uploaded
    socket.on('file-uploaded', ({ file, message, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
    
    return () => {
      socket.off('room-data');
      socket.off('new-message');
      socket.off('task-updated');
      socket.off('task-deleted');
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('recording-toggled');
      socket.off('whiteboard-updated');
      socket.off('typing-status-updated');
      socket.off('file-uploaded');
    };
  }, [socket]);
  
  // Update session timer locally
  useEffect(() => {
    if (!room) return;
    const interval = setInterval(() => {
      setRoom(prev => prev ? ({
        ...prev,
        sessionTimer: prev.sessionTimer + 1,
      }) : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [room]);

  // API functions
  const sendMessage = useCallback((content: string) => {
    if (!socket) return;
    
    const message: Message = {
      id: Date.now().toString(),
      userId: localStorage.getItem('userId') || `user-${Date.now()}`,
      content,
      timestamp: new Date(),
      type: 'text',
    };
    
    socket.emit('send-message', {
      roomId,
      message
    });
  }, [socket, roomId]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    if (!socket) return;
    
    socket.emit('update-task', {
      roomId,
      taskId,
      updates
    });
  }, [socket, roomId]);
  
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!socket) return;
    
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    socket.emit('update-task', {
      roomId,
      taskId: newTask.id,
      updates: newTask
    });
  }, [socket, roomId]);
  
  const deleteTask = useCallback((taskId: string) => {
    if (!socket) return;
    
    socket.emit('delete-task', {
      roomId,
      taskId
    });
  }, [socket, roomId]);

  const toggleRecording = useCallback(() => {
    if (!socket) return;
    
    socket.emit('toggle-recording', {
      roomId
    });
  }, [socket, roomId]);
  
  const updateWhiteboard = useCallback((elements: any[]) => {
    if (!socket) return;
    
    socket.emit('update-whiteboard', {
      roomId,
      elements
    });
  }, [socket, roomId]);
  
  const setTypingStatus = useCallback((isTyping: boolean, location: string) => {
    if (!socket) return;
    
    socket.emit('typing-status', {
      roomId,
      userId: localStorage.getItem('userId') || `user-${Date.now()}`,
      isTyping,
      location
    });
  }, [socket, roomId]);

  const uploadFile = useCallback((file: File) => {
    if (!socket) return;
    
    // Create a FileReader to read the file as an ArrayBuffer
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const buffer = e.target?.result;
      
      if (buffer) {
        socket.emit('upload-file', {
          roomId,
          userId: localStorage.getItem('userId') || `user-${Date.now()}`,
          file: {
            originalname: file.name,
            mimetype: file.type,
            size: file.size,
            buffer
          }
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, [socket, roomId]);

  const createRoom = useCallback(async (roomDetails: { name: string; description: string; type: string; members: any[]; userId: string; userName: string; }) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${COLLABORATION_SERVER_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(roomDetails),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }
      
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    room,
    isLoading,
    error,
    sendMessage,
    updateTask,
    addTask,
    deleteTask,
    toggleRecording,
    updateWhiteboard,
    setTypingStatus,
    uploadFile,
    createRoom,
  };
}