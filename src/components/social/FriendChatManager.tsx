import React, { useState, useEffect } from 'react';
import { FriendChat } from './FriendChat';
import FriendsService, { FriendProfile } from '../../services/FriendsService';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActiveChat {
    friendId: string;
    friendName: string;
    friendProfilePic?: string;
    isMinimized: boolean;
}

interface Message {
    _id: string;
    sender: string;
    recipient: string;
    content: string;
    timestamp: Date;
    read: boolean;
}

// Access the same global socket instance used in FriendChat
declare global {
    var globalSocket: Socket | null;
}

export const FriendChatManager: React.FC = () => {
    const { user } = useAuth();
    const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [hasUnreadMessages, setHasUnreadMessages] = useState<Record<string, boolean>>({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    // Connect to socket or use existing connection
    useEffect(() => {
        console.log('FriendChatManager: Initializing socket connection...');

        if (!globalThis.globalSocket) {
            const token = localStorage.getItem('token');
            console.log('FriendChatManager: Creating new socket connection with token');

            globalThis.globalSocket = io('http://localhost:5001', {
                withCredentials: true,
                transports: ['websocket'],
                auth: {
                    token: token || undefined
                }
            });

            globalThis.globalSocket.on('connect', () => {
                console.log('FriendChatManager: Socket connected successfully', globalThis.globalSocket?.id);
                setSocketConnected(true);
                setIsInitialized(true);
            });

            globalThis.globalSocket.on('connect_error', (error) => {
                console.error('FriendChatManager: Socket connection error:', error);
                setSocketConnected(false);
            });

            globalThis.globalSocket.on('disconnect', () => {
                console.log('FriendChatManager: Socket disconnected');
                setSocketConnected(false);
            });
        } else {
            console.log('FriendChatManager: Using existing socket connection', globalThis.globalSocket.id);
            setSocketConnected(globalThis.globalSocket.connected);
            setIsInitialized(globalThis.globalSocket.connected);
        }

        setSocket(globalThis.globalSocket);

        return () => {
            // Don't disconnect the global socket, just clean up local listeners
            console.log('FriendChatManager: Cleaning up local socket listeners');
        };
    }, []);

    // Load friends
    useEffect(() => {
        const loadFriends = async () => {
            try {
                console.log('FriendChatManager: Loading friends list...');
                const friendsList = await FriendsService.getFriendList();
                console.log('FriendChatManager: Friends loaded:', friendsList.length);
                setFriends(friendsList);
            } catch (error) {
                console.error('FriendChatManager: Error loading friends:', error);
            }
        };

        if (isInitialized) {
            loadFriends();
        }
    }, [isInitialized]);

    // Listen for new messages
    useEffect(() => {
        if (!socket || !user?._id) return;

        console.log('FriendChatManager: Setting up socket event listeners...');

        const handleNewPrivateMessage = (message: Message) => {
            console.log('FriendChatManager: Received new private message:', message);

            // If the message is from someone we're not chatting with, mark as unread
            const isSender = message.sender === user._id;
            const isRecipient = message.recipient === user._id;

            if (isRecipient) {
                const senderId = message.sender;
                const isActiveChatOpen = activeChats.some(chat => chat.friendId === senderId && !chat.isMinimized);

                if (!isActiveChatOpen) {
                    setHasUnreadMessages(prev => ({
                        ...prev,
                        [senderId]: true
                    }));

                    const friend = friends.find(f => f._id === senderId);
                    if (friend) {
                        console.log('FriendChatManager: New message from friend:', friend.firstName, friend.lastName);
                        // Automatically open chat if it's not open
                        const existingChat = activeChats.find(chat => chat.friendId === senderId);
                        if (!existingChat) {
                            openChat(friend, true); // Open minimized
                        }
                    }
                }
            }
        };

        const handleNotification = (notification: any) => {
            console.log('FriendChatManager: Received notification:', notification);
            // We could display a toast notification here
        };

        socket.on('new_private_message', handleNewPrivateMessage);
        socket.on('notification:message', handleNotification);

        return () => {
            socket.off('new_private_message', handleNewPrivateMessage);
            socket.off('notification:message', handleNotification);
        };
    }, [socket, activeChats, user, friends]);

    const openChat = (friend: FriendProfile, minimize?: boolean) => {
        // Check if chat is already open
        const existingChatIndex = activeChats.findIndex(chat => chat.friendId === friend._id);

        if (existingChatIndex > -1) {
            // If chat exists, unminimize it if it was minimized
            setActiveChats(prev => prev.map((chat, index) =>
                index === existingChatIndex ? { ...chat, isMinimized: false } : chat
            ));
        } else {
            console.log('FriendChatManager: Opening chat with:', friend.firstName, friend.lastName);
            setActiveChats(prev => [
                ...prev,
                {
                    friendId: friend._id,
                    friendName: `${friend.firstName} ${friend.lastName}`,
                    friendProfilePic: friend.profilePicture,
                    isMinimized: minimize || false
                }
            ]);
        }

        // Clear unread status
        setHasUnreadMessages(prev => ({
            ...prev,
            [friend._id]: false
        }));
    };

    const closeChat = (friendId: string) => {
        console.log('FriendChatManager: Closing chat with friend ID:', friendId);
        setActiveChats(prev => prev.filter(chat => chat.friendId !== friendId));
    };

    const minimizeChat = (friendId: string) => {
        console.log('FriendChatManager: Minimizing chat with friend ID:', friendId);
        setActiveChats(prev =>
            prev.map(chat =>
                chat.friendId === friendId ? { ...chat, isMinimized: true } : chat
            )
        );
    };

    const unminimizeChat = (friendId: string) => {
        console.log('FriendChatManager: Unminimizing chat with friend ID:', friendId);
        setActiveChats(prev =>
            prev.map(chat =>
                chat.friendId === friendId ? { ...chat, isMinimized: false } : chat
            )
        );

        // Clear unread status when unminimizing
        setHasUnreadMessages(prev => ({
            ...prev,
            [friendId]: false
        }));
    };

    // Limit to 3 active (non-minimized) chat windows
    const visibleChats = activeChats.filter(chat => !chat.isMinimized).slice(0, 3);
    const minimizedChats = activeChats.filter(chat => chat.isMinimized);

    return (
        <>
            <div className="fixed bottom-0 right-4 flex gap-4 z-50">
                {visibleChats.map(chat => (
                    <FriendChat
                        key={chat.friendId}
                        friendId={chat.friendId}
                        friendName={chat.friendName}
                        friendProfilePic={chat.friendProfilePic}
                        onClose={() => closeChat(chat.friendId)}
                        onMinimize={() => minimizeChat(chat.friendId)}
                    />
                ))}
            </div>

            {/* Minimized Chat Bubbles */}
            <div className="fixed bottom-0 left-4 flex gap-2 z-50 p-4">
                {minimizedChats.map(chat => (
                    <Button
                        key={chat.friendId}
                        onClick={() => unminimizeChat(chat.friendId)}
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full bg-primary-600/70 hover:bg-primary-500 text-white shadow-lg flex items-center justify-center relative"
                    >
                        <MessageCircle className="w-6 h-6" />
                        {hasUnreadMessages[chat.friendId] && (
                            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500" />
                        )}
                    </Button>
                ))}
            </div>
        </>
    );
};

export default FriendChatManager; 