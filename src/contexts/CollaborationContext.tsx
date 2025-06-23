import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Import the useAuth hook
import axios from 'axios';

// --- TYPE DEFINITIONS ---

export interface Participant { // Exporting for use in components
    id: string;
    name: string;
    avatar: string;
    isSpeaking: boolean;
    isTyping: boolean;
    handRaised: boolean;
}

export interface SharedFile { // Exporting for use in components
    id: string;
    name: string;
    type: 'pdf' | 'link' | 'image' | 'video' | 'other';
    size: string;
    user: { id: string; name: string; avatar: string };
    date: string;
    downloadUrl?: string; // URL to download the file
}

export interface ChatMessage { // Exporting for use in components
    id: string;
    userId: string;
    avatar: string;
    name: string;
    message: string;
    timestamp: string;
    reactions: { [emoji: string]: string[] }; // Users who reacted
    replyTo?: string;
}

export interface AiInteraction { // For the AI assistant panel
    id: string;
    type: 'summary' | 'idea' | 'user_query' | 'ai_response';
    text: string;
}

interface CollaborationState {
    participants: Participant[];
    files: SharedFile[];
    messages: ChatMessage[];
    currentUser: Participant | null; // Can be null initially
    aiInteractions: AiInteraction[];
    isConnected: boolean;
    socketRef: React.RefObject<Socket | null>; // Expose socketRef for direct access
}

interface CollaborationContextType extends CollaborationState {
    joinRoom: (roomCode: string) => void;
    leaveRoom: () => void;
    sendMessage: (message: string) => void;
    addReaction: (messageId: string, emoji: string) => void;
    setTyping: (isTyping: boolean) => void;
    summarizeChat: () => void;
    askAi: (query: string) => void;
    uploadFile: (file: File) => Promise<void>;
}

// A mock current user. In a real app, this would come from an auth context.
const mockUser = { name: 'User' + Math.round(Math.random() * 100), avatar: 'https://i.pravatar.cc/40?u=user' + Date.now(), isSpeaking: false, isTyping: false, handRaised: false };

// --- CONTEXT CREATION ---

export const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

export const CollaborationProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser } = useAuth(); // Get the authenticated user
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [files, setFiles] = useState<SharedFile[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [aiInteractions, setAiInteractions] = useState<AiInteraction[]>([]);
    const [currentUser, setCurrentUser] = useState<Participant | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentRoomCode, setCurrentRoomCode] = useState<string>('');

    const socketRef = useRef<Socket | null>(null);

    const joinRoom = useCallback((roomCode: string) => {
        if (socketRef.current) return;

        setCurrentRoomCode(roomCode);

        // Get auth token from localStorage
        const token = localStorage.getItem('token') || 'guest-token';

        const socket = io('http://localhost:5001', {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            extraHeaders: {
                "Access-Control-Allow-Origin": "http://localhost:5173"
            },
            auth: {
                token: token // Pass token in auth object
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Client] Connected to socket server with ID:', socket.id);

            // Use authenticated user data or fallback to a default
            const participantName = authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Anonymous';
            const participantAvatar = authUser?.profilePicture || `https://i.pravatar.cc/40?u=${socket.id}`;

            const user = {
                name: participantName,
                avatar: participantAvatar,
                isSpeaking: false,
                isTyping: false,
                handRaised: false
            };
            const userWithId = { ...user, id: socket.id! };
            setCurrentUser(userWithId);

            console.log(`[Client] Emitting 'joinRoom' for room '${roomCode}' with user:`, userWithId);
            socket.emit('joinRoom', { roomCode, user: userWithId });
            setIsConnected(true);
        });

        socket.on('roomState', (state: { participants: Participant[], messages: ChatMessage[], files: SharedFile[] }) => {
            console.log('[Client] Received roomState:', state);
            setParticipants(state.participants);
            setMessages(state.messages);
            if (state.files) setFiles(state.files);
        });

        socket.on('fileAdded', (file: SharedFile) => {
            console.log('[Client] File added:', file);
            setFiles(prev => [...prev, file]);
        });

        // Document editing events
        socket.on('documentUpdate', ({ fileId, newContent, editedBy }) => {
            console.log(`[Client] Document ${fileId} updated by ${editedBy}`);
            // This will be handled by the DocumentEditor component
        });

        socket.on('documentSaved', ({ fileId, savedBy }) => {
            console.log(`[Client] Document ${fileId} saved by ${savedBy}`);
            // Could show a notification here
        });

        socket.on('disconnect', () => {
            console.log('[Client] Disconnected from socket server.');
            setIsConnected(false)
        });

        socket.on('connect_error', (err) => {
            console.error('[Client] Connection Error:', err);
            // Provide more detailed error information
            if (err.message.includes('Authentication')) {
                console.log('[Client] Authentication error - using fallback anonymous connection');
                // You could implement a fallback connection strategy here
            }
        });

        socket.on('userLeft', ({ userId }: { userId: string }) => setParticipants(prev => prev.filter(p => p.id !== userId)));
        socket.on('newMessage', (message: ChatMessage) => setMessages(prev => [...prev, message]));
        socket.on('reactionAdded', ({ messageId, emoji, userId }) => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === messageId) {
                    const newReactions = { ...msg.reactions };
                    if (!newReactions[emoji]) newReactions[emoji] = [];
                    if (!newReactions[emoji].includes(userId)) {
                        newReactions[emoji].push(userId);
                    } else {
                        // Allow toggling reaction off
                        newReactions[emoji] = newReactions[emoji].filter(id => id !== userId);
                    }
                    return { ...msg, reactions: newReactions };
                }
                return msg;
            }));
        });
        socket.on('typingStatusChanged', ({ userId, isTyping }) => {
            setParticipants(prev => prev.map(p => p.id === userId ? { ...p, isTyping } : p));
        });
    }, [authUser]);

    const leaveRoom = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        // Reset state
        setIsConnected(false);
        setParticipants([]);
        setMessages([]);
        setCurrentUser(null);
    }, []);

    // --- REAL-TIME FUNCTIONS ---

    const sendMessage = useCallback((message: string) => {
        if (!message.trim() || !socketRef.current || !currentUser) return;
        const newMessage = {
            id: `msg-${Date.now()}`, // Ensure unique message ID
            userId: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {},
        };
        socketRef.current.emit('sendMessage', newMessage);
    }, [currentUser]);

    const addReaction = useCallback((messageId: string, emoji: string) => {
        if (!socketRef.current || !currentUser) return;
        socketRef.current.emit('addReaction', { messageId, emoji, userId: currentUser.id });
    }, [currentUser]);

    const setTyping = useCallback((isTyping: boolean) => {
        if (!socketRef.current || !currentUser) return;
        socketRef.current.emit('setTyping', { userId: currentUser.id, isTyping });
    }, [currentUser]);

    const summarizeChat = useCallback(() => {
        // In a real app, you'd send `messages` to a backend service.
        const summaryText = `The chat has ${messages.length} messages. The main topics seem to be brainstorming and sharing initial project files.`;
        const summary: AiInteraction = {
            id: `ai${Date.now()}`,
            type: 'summary',
            text: summaryText
        };
        setAiInteractions(prev => [...prev, summary]);
    }, [messages]);

    const askAi = useCallback((query: string) => {
        if (!query.trim()) return;

        const userQuery: AiInteraction = { id: `ai${Date.now()}`, type: 'user_query', text: query };

        // Mock AI Response
        const aiResponseText = `Based on your query about "${query}", I suggest focusing on the key deliverables outlined in the project brief.`;
        const aiResponse: AiInteraction = { id: `ai${Date.now() + 1}`, type: 'ai_response', text: aiResponseText };

        setAiInteractions(prev => [...prev, userQuery, aiResponse]);
    }, []);

    // File upload function
    const uploadFile = useCallback(async (file: File) => {
        if (!socketRef.current || !currentUser || !currentRoomCode || !authUser) {
            console.error('[Client] Cannot upload file: missing socket, user, or room code');
            throw new Error('Cannot upload file: not connected to a room');
        }

        try {
            console.log('[Client] Uploading file:', file.name);

            // Create form data for the file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('roomCode', currentRoomCode);

            // Get the auth token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Upload the file to the backend
            const response = await axios.post(
                'http://localhost:5001/api/up/collaboration-upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('[Client] File upload response:', response.data);

            if (response.data && response.data.success) {
                // Notify the collaboration server about the new file
                socketRef.current.emit('fileShared', response.data);
            } else {
                throw new Error('File upload failed');
            }
        } catch (error) {
            console.error('[Client] Error uploading file:', error);
            throw error;
        }
    }, [currentUser, currentRoomCode, authUser]);

    const value = {
        participants,
        files,
        messages,
        currentUser,
        aiInteractions,
        isConnected,
        socketRef,
        joinRoom,
        leaveRoom,
        sendMessage,
        addReaction,
        setTyping,
        summarizeChat,
        askAi,
        uploadFile,
    };

    return (
        <CollaborationContext.Provider value={value}>
            {children}
        </CollaborationContext.Provider>
    );
};

// --- CUSTOM HOOK ---

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (!context) throw new Error('useCollaboration must be used within a CollaborationProvider');
    return context;
}; 