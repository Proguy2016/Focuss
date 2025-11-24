import React, { useState, useEffect, useCallback } from 'react';
import { FriendChat } from './FriendChat';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FriendProfile } from '../../services/FriendsService';
import FriendsService from '../../services/FriendsService';

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

interface FriendChatManagerProps {
    activeChat?: FriendProfile | null;
    onClose?: (friendId: string) => void;
}

// Access the same global socket instance used in FriendChat
declare global {
    var globalSocket: Socket | undefined;
}

export const FriendChatManager: React.FC<FriendChatManagerProps> = ({
    activeChat = null,
    onClose = () => { }
}) => {
    const { user } = useAuth();
    const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [hasUnreadMessages, setHasUnreadMessages] = useState<Record<string, boolean>>({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    // Connect to socket or use existing connection
    useEffect(() => {
        if (user && !socket) {
            if (!globalThis.globalSocket) {
                const token = localStorage.getItem('token');
                globalThis.globalSocket = io('http://localhost:5001', {
                    auth: { token },
                    transports: ['websocket'],
                });
            }
            setSocket(globalThis.globalSocket);
        }
    }, [user, socket]);

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
        if (!socket || !user?.id) return;

        console.log('FriendChatManager: Setting up socket event listeners...');

        const handleNewPrivateMessage = (message: Message) => {
            console.log('FriendChatManager: Received new private message:', message);
            console.log('FriendChatManager: Current user ID:', user.id);
            console.log('FriendChatManager: Message sender:', message.sender);
            console.log('FriendChatManager: Message recipient:', message.recipient);

            // If the message is from someone we're not chatting with, mark as unread
            const isSender = message.sender === user.id;
            const isRecipient = message.recipient === user.id;

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

        // Force socket reconnection if not connected
        if (!socket.connected) {
            console.log('FriendChatManager: Socket not connected, attempting to reconnect...');
            socket.connect();
        }

        return () => {
            socket.off('new_private_message', handleNewPrivateMessage);
            socket.off('notification:message', handleNotification);
        };
    }, [socket, activeChats, user, friends]);

    // Effect to open a new chat window when a friend is selected from the Social page
    useEffect(() => {
        if (activeChat) {
            openChat(activeChat);
        }
    }, [activeChat]);

    const openChat = useCallback((friend: FriendProfile, minimize = false) => {
        const existingChat = activeChats.find(chat => chat.friendId === friend._id);

        if (existingChat) {
            // If chat exists, just unminimize it
            if (existingChat.isMinimized) {
                unminimizeChat(friend._id);
            }
        } else {
            // If chat doesn't exist, add it to the list
            const newChat: ActiveChat = {
                friendId: friend._id,
                friendName: `${friend.firstName} ${friend.lastName}`,
                friendProfilePic: friend.profilePicture,
                isMinimized: minimize,
            };
            setActiveChats(prev => [...prev, newChat]);
        }

        // Clear unread status
        setHasUnreadMessages(prev => {
            const newUnread = { ...prev };
            delete newUnread[friend._id];
            return newUnread;
        });
    }, [activeChats]);

    const closeChat = (friendId: string) => {
        setActiveChats(prev => prev.filter(chat => chat.friendId !== friendId));
        onClose(friendId); // Notify parent component
    };

    const minimizeChat = (friendId: string) => {
        setActiveChats(prev =>
            prev.map(chat =>
                chat.friendId === friendId ? { ...chat, isMinimized: true } : chat
            )
        );
    };

    const unminimizeChat = (friendId: string) => {
        setActiveChats(prev =>
            prev.map(chat =>
                chat.friendId === friendId ? { ...chat, isMinimized: false } : chat
            )
        );
        setHasUnreadMessages(prev => {
            const newUnread = { ...prev };
            delete newUnread[friendId];
            return newUnread;
        });
    };

    // Limit to 3 active (non-minimized) chat windows
    const visibleChats = activeChats.filter(chat => !chat.isMinimized).slice(0, 3);
    const minimizedChats = activeChats.filter(chat => chat.isMinimized);

    return (
        <>
            <div className="fixed bottom-0 right-4 flex items-end gap-4 z-50">
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
            <div className="fixed bottom-4 left-4 flex gap-2 z-50">
                {minimizedChats.map(chat => (
                    <div key={chat.friendId} className="relative">
                        <Button
                            onClick={() => unminimizeChat(chat.friendId)}
                            className="w-16 h-16 rounded-full bg-primary-600/80 backdrop-blur-md hover:bg-primary-500 text-white shadow-lg flex items-center justify-center p-0"
                        >
                            <img src={chat.friendProfilePic} alt={chat.friendName} className="w-full h-full object-cover rounded-full" />
                            {hasUnreadMessages[chat.friendId] && (
                                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full ring-2 ring-gray-900 bg-red-500" />
                            )}
                        </Button>
                        <Button
                            onClick={() => closeChat(chat.friendId)}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-md flex items-center justify-center p-1"
                        >
                            <X size={14} />
                        </Button>
                    </div>
                ))}
            </div>
        </>
    );
};

export default FriendChatManager; 