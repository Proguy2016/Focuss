import React, { useState, useEffect } from 'react';
import { FriendChat } from './FriendChat';
import { MinimizedChatBubble } from './MinimizedChatBubble';
// Import removed to prevent accidental API calls
// import api from '../../services/api';

interface Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
}

interface ChatState {
    friendId: string;
    friendName: string;
    friendProfilePic?: string;
    isMinimized: boolean;
    hasUnread: boolean;
}

interface SimpleChatManagerProps {
    activeFriend: Friend | null;
    onClose: (friendId: string) => void;
}

export const SimpleChatManager: React.FC<SimpleChatManagerProps> = ({ activeFriend, onClose }) => {
    const [chats, setChats] = useState<ChatState[]>([]);
    // Remove unreadCounts state to prevent unnecessary renders

    // Remove all API polling completely

    // Only handle friend management - no API calls
    useEffect(() => {
        if (activeFriend) {
            const existingChatIndex = chats.findIndex(chat => chat.friendId === activeFriend._id);

            if (existingChatIndex >= 0) {
                // Chat exists, unminimize it
                setChats(prev =>
                    prev.map((chat, i) =>
                        i === existingChatIndex ? { ...chat, isMinimized: false, hasUnread: false } : chat
                    )
                );
            } else {
                // Add new chat
                setChats(prev => [
                    ...prev,
                    {
                        friendId: activeFriend._id,
                        friendName: `${activeFriend.firstName} ${activeFriend.lastName}`,
                        friendProfilePic: activeFriend.profilePicture,
                        isMinimized: false,
                        hasUnread: false
                    }
                ]);
            }
        }
    }, [activeFriend]);

    const handleMinimize = (friendId: string) => {
        setChats(prev =>
            prev.map(chat =>
                chat.friendId === friendId ? { ...chat, isMinimized: true } : chat
            )
        );
    };

    const handleMaximize = (friendId: string) => {
        setChats(prev =>
            prev.map(chat =>
                chat.friendId === friendId ? { ...chat, isMinimized: false, hasUnread: false } : chat
            )
        );
    };

    const handleClose = (friendId: string) => {
        setChats(prev => prev.filter(chat => chat.friendId !== friendId));
        onClose(friendId);
    };

    // Separate visible and minimized chats
    const visibleChats = chats.filter(chat => !chat.isMinimized).slice(0, 3); // Limit to 3 visible chats
    const minimizedChats = chats.filter(chat => chat.isMinimized);

    // Calculate the offset based on the number of visible chats
    // Each chat window is approximately 320px wide with some gap
    const chatWidth = 320;
    const chatGap = 16;
    const totalVisibleWidth = visibleChats.length * (chatWidth + chatGap);

    return (
        <>
            {/* Visible chat windows */}
            <div className="fixed bottom-0 right-4 flex items-end gap-4 z-50">
                {visibleChats.map(chat => (
                    <FriendChat
                        key={chat.friendId}
                        friendId={chat.friendId}
                        friendName={chat.friendName}
                        friendProfilePic={chat.friendProfilePic}
                        onClose={() => handleClose(chat.friendId)}
                        onMinimize={() => handleMinimize(chat.friendId)}
                    />
                ))}
            </div>

            {/* Minimized chat bubbles - positioned with enough margin from active chats */}
            <div
                className="fixed bottom-4 flex flex-row-reverse gap-3 z-50"
                style={{
                    right: visibleChats.length > 0 ? `${totalVisibleWidth + 40}px` : '20px'
                }}
            >
                {minimizedChats.map(chat => (
                    <MinimizedChatBubble
                        key={chat.friendId}
                        friendId={chat.friendId}
                        friendName={chat.friendName}
                        friendProfilePic={chat.friendProfilePic}
                        hasUnreadMessages={false} // Always false to prevent API calls
                        onMaximize={handleMaximize}
                        onClose={handleClose}
                    />
                ))}
            </div>
        </>
    );
};

export default SimpleChatManager; 