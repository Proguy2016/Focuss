import { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useCollaboration } from '@/contexts/CollaborationContext';

const COLLABORATION_SERVER_URL = 'http://localhost:4001';

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
  _id: string;
  id?: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'team';
  participants: Participant[];
  messages: Message[];
  tasks: Task[];
  files: RoomFile[];
  isRecording: boolean;
  sessionTimer: number;
  whiteboard: {
    elements: any[];
  };
  createdAt: Date;
}

export function useRoom(roomId?: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { joinRoom: joinCollabRoom, leaveRoom: leaveCollabRoom } = useCollaboration();

  // Initialize socket connection
  useEffect(() => {
    if (roomId) {
      const token = localStorage.getItem('token');
      const newSocket = io(COLLABORATION_SERVER_URL, {
        auth: { token },
        query: { roomId }
      });

      newSocket.on('connect', () => {
        console.log('Connected to collaboration server');
        // Join collaboration room after socket connection
        joinCollabRoom(roomId);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from collaboration server');
        leaveCollabRoom();
      });

      newSocket.on('room:update', (updatedRoom: Room) => {
        setRoom(updatedRoom);
      });

      newSocket.on('error', (err: string) => {
        setError(err);
      });

      setSocket(newSocket);

      return () => {
        leaveCollabRoom();
        newSocket.disconnect();
      };
    }
  }, [roomId, joinCollabRoom, leaveCollabRoom]);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setRoom(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${COLLABORATION_SERVER_URL}/api/rooms/${roomId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch room');
        }

        const data = await response.json();
        setRoom(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // Get available rooms
  const getRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${COLLABORATION_SERVER_URL}/api/rooms`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Create a new room
  const createRoom = useCallback(async (roomDetails: { name: string; description: string; type: string; members: any[]; userId: string; userName: string; }) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
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

  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!socket || !room) return;
    socket.emit('message:send', { content });
  }, [socket, room]);

  // Update a task
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    if (!socket || !room) return;
    socket.emit('task:update', { taskId, updates });
  }, [socket, room]);

  // Add a task
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!socket || !room) return;
    socket.emit('task:add', task);
  }, [socket, room]);

  // Delete a task
  const deleteTask = useCallback((taskId: string) => {
    if (!socket || !room) return;
    socket.emit('task:delete', { taskId });
  }, [socket, room]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('room:toggleRecording');
  }, [socket, room]);

  // Update whiteboard
  const updateWhiteboard = useCallback((elements: any[]) => {
    if (!socket || !room) return;
    socket.emit('whiteboard:update', { elements });
  }, [socket, room]);

  // Set typing status
  const setTypingStatus = useCallback((isTyping: boolean, location: string) => {
    if (!socket || !room) return;
    socket.emit('user:typing', { isTyping, location });
  }, [socket, room]);

  // Upload file
  const uploadFile = useCallback(async (file: File) => {
    if (!roomId) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${COLLABORATION_SERVER_URL}/api/rooms/${roomId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [roomId]);

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
    getRooms,
  };
}