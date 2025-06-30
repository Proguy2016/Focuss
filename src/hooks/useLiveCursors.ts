import { useState, useEffect, useCallback } from 'react';
import { useRoom } from './useRoom';

export interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  lastSeen: Date;
}

export function useLiveCursors(roomId: string) {
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [isEnabled, setIsEnabled] = useState(true);
  const { room } = useRoom(roomId);

  // Update local cursor and send to server
  const updateCursor = useCallback((x: number, y: number) => {
    if (!isEnabled || !room) return;
    
    // Update local state
    setCursors(prev => ({
      ...prev,
      'current': {
        userId: localStorage.getItem('userId') || 'current',
        userName: 'You',
        x,
        y,
        lastSeen: new Date(),
      }
    }));
    
    // Emit cursor position to server
    const socket = (window as any).socket;
    if (socket && socket.connected) {
      socket.emit('cursor-move', {
        roomId,
        userId: localStorage.getItem('userId') || 'current',
        x,
        y
      });
    }
  }, [isEnabled, roomId, room]);

  // Listen for cursor updates from other users
  useEffect(() => {
    if (!room) return;

    const socket = (window as any).socket;
    if (!socket) return;
    
    const handleCursorMoved = ({ userId, x, y }: { userId: string; x: number; y: number }) => {
      // Don't update for our own cursor
      if (userId === localStorage.getItem('userId') || userId === 'current') return;
      
      // Find user name from room participants
      const participant = room.participants.find(p => p.id === userId);
      const userName = participant ? participant.name : 'Unknown User';
      
      setCursors(prev => ({
        ...prev,
        [userId]: {
          userId,
          userName,
          x,
          y,
          lastSeen: new Date()
        }
      }));
    };
    
    socket.on('cursor-moved', handleCursorMoved);
    
    return () => {
      socket.off('cursor-moved', handleCursorMoved);
    };
  }, [room]);

  // Clean up old cursors
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      setCursors(prev => {
        const filtered = Object.fromEntries(
          Object.entries(prev).filter(([_, cursor]) => 
            now.getTime() - cursor.lastSeen.getTime() < 10000
          )
        );
        return filtered;
      });
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  return {
    cursors: Object.values(cursors).filter(c => c.userId !== 'current' && c.userId !== localStorage.getItem('userId')),
    updateCursor,
    isEnabled,
    setIsEnabled,
  };
}