import { useState, useEffect, useCallback } from 'react';

export interface TypingUser {
  userId: string;
  userName: string;
  location: 'chat' | 'whiteboard' | 'tasks';
  lastTyped: Date;
}

export function useTypingIndicators() {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const startTyping = useCallback((location: 'chat' | 'whiteboard' | 'tasks') => {
    // In real implementation, this would emit to WebSocket
    console.log(`Started typing in ${location}`);
  }, []);

  const stopTyping = useCallback((location: 'chat' | 'whiteboard' | 'tasks') => {
    // In real implementation, this would emit to WebSocket
    console.log(`Stopped typing in ${location}`);
  }, []);

  useEffect(() => {
    // Simulate other users typing
    const interval = setInterval(() => {
      const locations: Array<'chat' | 'whiteboard' | 'tasks'> = ['chat', 'whiteboard', 'tasks'];
      const users = [
        { userId: '2', userName: 'Marcus Johnson' },
        { userId: '3', userName: 'Elena Rodriguez' }
      ];

      if (Math.random() > 0.7) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== randomUser.userId);
          return [...filtered, {
            ...randomUser,
            location: randomLocation,
            lastTyped: new Date(),
          }];
        });

        // Remove after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== randomUser.userId));
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTypingUsersForLocation = useCallback((location: 'chat' | 'whiteboard' | 'tasks') => {
    return typingUsers.filter(user => user.location === location);
  }, [typingUsers]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    getTypingUsersForLocation,
  };
}