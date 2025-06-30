import { useState, useEffect, useCallback } from 'react';

export interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  lastSeen: Date;
}

export function useLiveCursors() {
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [isEnabled, setIsEnabled] = useState(true);

  const updateCursor = useCallback((x: number, y: number) => {
    if (!isEnabled) return;
    
    // In a real implementation, this would send to WebSocket
    // For now, we'll simulate other users' cursors
    setCursors(prev => ({
      ...prev,
      'current': {
        userId: 'current',
        userName: 'You',
        x,
        y,
        lastSeen: new Date(),
      }
    }));
  }, [isEnabled]);

  useEffect(() => {
    // Simulate other users' cursors moving
    const interval = setInterval(() => {
      setCursors(prev => ({
        ...prev,
        'user-2': {
          userId: 'user-2',
          userName: 'Marcus Johnson',
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          lastSeen: new Date(),
        },
        'user-3': {
          userId: 'user-3',
          userName: 'Elena Rodriguez',
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          lastSeen: new Date(),
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
    cursors: Object.values(cursors).filter(c => c.userId !== 'current'),
    updateCursor,
    isEnabled,
    setIsEnabled,
  };
}