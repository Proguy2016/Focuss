import { useState, useEffect, useCallback } from 'react';

export interface CollaborativeEdit {
  id: string;
  userId: string;
  userName: string;
  type: 'text' | 'whiteboard' | 'task' | 'file';
  location: string;
  content: any;
  timestamp: Date;
  isActive: boolean;
}

export interface ConflictResolution {
  id: string;
  type: 'merge' | 'overwrite' | 'manual';
  conflictingEdits: CollaborativeEdit[];
  resolvedContent: any;
  resolvedBy: string;
  timestamp: Date;
}

export function useRealtimeCollaboration() {
  const [activeEdits, setActiveEdits] = useState<CollaborativeEdit[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [latency, setLatency] = useState(45);

  const startEdit = useCallback((type: string, location: string, content: any) => {
    const edit: CollaborativeEdit = {
      id: Date.now().toString(),
      userId: 'current',
      userName: 'You',
      type: type as any,
      location,
      content,
      timestamp: new Date(),
      isActive: true,
    };

    setActiveEdits(prev => [...prev.filter(e => e.location !== location), edit]);
  }, []);

  const endEdit = useCallback((location: string) => {
    setActiveEdits(prev => prev.filter(e => e.location !== location || e.userId !== 'current'));
  }, []);

  const resolveConflict = useCallback((conflictId: string, resolution: 'merge' | 'overwrite' | 'manual', content?: any) => {
    setConflicts(prev => prev.map(conflict => 
      conflict.id === conflictId 
        ? { ...conflict, type: resolution, resolvedContent: content, resolvedBy: 'current' }
        : conflict
    ));
  }, []);

  // Simulate real-time edits from other users
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const users = [
          { id: '2', name: 'Marcus Johnson' },
          { id: '3', name: 'Elena Rodriguez' }
        ];
        const locations = ['whiteboard-canvas', 'task-1', 'chat-input'];
        const types = ['whiteboard', 'task', 'text'];

        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomType = types[Math.floor(Math.random() * types.length)];

        const edit: CollaborativeEdit = {
          id: Date.now().toString(),
          userId: randomUser.id,
          userName: randomUser.name,
          type: randomType as any,
          location: randomLocation,
          content: { action: 'editing' },
          timestamp: new Date(),
          isActive: true,
        };

        setActiveEdits(prev => [...prev.filter(e => e.location !== randomLocation || e.userId !== randomUser.id), edit]);

        // Remove after 3-8 seconds
        setTimeout(() => {
          setActiveEdits(prev => prev.filter(e => e.id !== edit.id));
        }, 3000 + Math.random() * 5000);
      }

      // Simulate latency changes
      setLatency(prev => Math.max(20, Math.min(200, prev + (Math.random() - 0.5) * 20)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getActiveEditorsForLocation = useCallback((location: string) => {
    return activeEdits.filter(edit => edit.location === location && edit.userId !== 'current');
  }, [activeEdits]);

  const hasConflict = useCallback((location: string) => {
    const editorsAtLocation = activeEdits.filter(edit => edit.location === location);
    return editorsAtLocation.length > 1;
  }, [activeEdits]);

  return {
    activeEdits,
    conflicts,
    isConnected,
    latency,
    startEdit,
    endEdit,
    resolveConflict,
    getActiveEditorsForLocation,
    hasConflict,
  };
}