import { useState, useEffect } from 'react';

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
}

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room>({
    id: roomId,
    name: 'Design System Review',
    participants: [
      { id: '1', name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', status: 'online' },
      { id: '2', name: 'Marcus Johnson', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', status: 'online' },
      { id: '3', name: 'Elena Rodriguez', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', status: 'away' },
      { id: '4', name: 'David Kim', status: 'online' },
      { id: '5', name: 'Priya Patel', status: 'online' },
      { id: '6', name: 'Alex Thompson', status: 'online' },
    ],
    messages: [
      { id: '1', userId: '1', content: 'Let\'s start reviewing the new component library', timestamp: new Date(Date.now() - 300000), type: 'text' },
      { id: '2', userId: '2', content: 'The button variants look great! Should we discuss the color tokens?', timestamp: new Date(Date.now() - 240000), type: 'text' },
      { id: '3', userId: '3', content: 'design-tokens.figma', timestamp: new Date(Date.now() - 180000), type: 'file' },
    ],
    tasks: [
      { id: '1', title: 'Review color palette', status: 'in-progress', priority: 'high', assigneeId: '1', createdAt: new Date() },
      { id: '2', title: 'Update button components', status: 'todo', priority: 'medium', assigneeId: '2', createdAt: new Date() },
      { id: '3', title: 'Test accessibility compliance', status: 'completed', priority: 'high', assigneeId: '3', createdAt: new Date() },
    ],
    files: [
      { id: '1', name: 'design-tokens.figma', size: 2048000, type: 'application/figma', uploadedBy: '3', uploadedAt: new Date(), url: '#' },
      { id: '2', name: 'component-specs.pdf', size: 1024000, type: 'application/pdf', uploadedBy: '1', uploadedAt: new Date(), url: '#' },
    ],
    isRecording: false,
    sessionTimer: 3420, // 57 minutes
  });

  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      userId: '1', // Current user
      content,
      timestamp: new Date(),
      type: 'text',
    };
    setRoom(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setRoom(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  };

  const toggleRecording = () => {
    setRoom(prev => ({
      ...prev,
      isRecording: !prev.isRecording,
    }));
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRoom(prev => ({
        ...prev,
        sessionTimer: prev.sessionTimer + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    room,
    isLoading,
    sendMessage,
    updateTask,
    toggleRecording,
  };
}