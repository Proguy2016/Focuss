import React from 'react';
import { X } from 'lucide-react';

interface MinimizedChatBubbleProps {
    friendId: string;
    friendName: string;
    friendProfilePic?: string;
    hasUnreadMessages: boolean;
    onMaximize: (friendId: string) => void;
    onClose: (friendId: string) => void;
}

export const MinimizedChatBubble: React.FC<MinimizedChatBubbleProps> = ({
    friendId,
    friendName,
    friendProfilePic,
    hasUnreadMessages,
    onMaximize,
    onClose
}) => {
    return (
        <div className="relative">
            <button
                onClick={() => onMaximize(friendId)}
                className="
                    w-14 h-14 rounded-full 
                    bg-primary-600/80 backdrop-blur-md hover:bg-primary-500 
                    text-white shadow-lg flex items-center justify-center p-0
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
                    border border-white/10
                "
            >
                {friendProfilePic ? (
                    <img src={friendProfilePic} alt={friendName} className="w-full h-full object-cover rounded-full" />
                ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xl font-semibold">
                        {friendName.charAt(0).toUpperCase()}
                    </div>
                )}
                {hasUnreadMessages && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-gray-900" />
                )}
            </button>
            <button
                onClick={() => onClose(friendId)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-md flex items-center justify-center p-1"
            >
                <X size={12} />
            </button>
        </div>
    );
};

export default MinimizedChatBubble; 