import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Smile, X, Image, Paperclip, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import debounce from 'lodash.debounce';

interface Message {
    _id: string;
    sender: string;
    recipient: string;
    content: string;
    timestamp: Date;
    read: boolean;
    delivered: boolean;
}

interface FriendChatProps {
    friendId: string;
    friendName: string;
    friendProfilePic?: string;
    onClose: () => void;
    onMinimize: () => void;
}

// Create a singleton socket instance to be reused across components
declare global {
    var globalSocket: Socket | null;
}

// Create a stable input component that doesn't cause re-renders
const StableInput = React.memo(({ value, onChange, placeholder, className, onKeyDown }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}) => {
    const [internalValue, setInternalValue] = useState(value);

    // Update internal value when external value changes
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    // Create a stable debounced callback
    const debouncedOnChange = useCallback(
        debounce((newValue: string) => {
            onChange(newValue);
        }, 100),
        [onChange]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        debouncedOnChange(newValue);
    };

    return (
        <input
            type="text"
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
            className={`bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 ${className || ''}`}
        />
    );
});

export const FriendChat: React.FC<FriendChatProps> = ({
    friendId,
    friendName,
    friendProfilePic,
    onClose,
    onMinimize
}) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [isMessageSending, setIsMessageSending] = useState(false);
    const [lastSentMessage, setLastSentMessage] = useState('');
    const [lastSentTimestamp, setLastSentTimestamp] = useState(0);
    const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(new Set());

    // Reset messages when friendId changes
    useEffect(() => {
        console.log('Friend ID changed, resetting messages');
        setMessages([]);
        setPage(0);
        setHasMore(true);
        setIsLoading(true);
        setProcessedMessageIds(new Set());
    }, [friendId]);

    // Connect to socket or use existing connection
    useEffect(() => {
        console.log('Initializing socket connection...');

        if (!globalThis.globalSocket) {
            const token = localStorage.getItem('token');
            console.log('Creating new socket connection with token');

            // Make sure we're connecting to the correct WebSocket server URL
            globalThis.globalSocket = io('http://localhost:5001', {
                withCredentials: true,
                transports: ['websocket'],
                auth: {
                    token: token || undefined
                },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            globalThis.globalSocket.on('connect', () => {
                console.log('Socket connected successfully', globalThis.globalSocket?.id);
                setSocketConnected(true);
            });

            globalThis.globalSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setSocketConnected(false);
            });

            globalThis.globalSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setSocketConnected(false);
            });
        } else {
            console.log('Using existing socket connection', globalThis.globalSocket.id);
            setSocketConnected(globalThis.globalSocket.connected);
        }

        setSocket(globalThis.globalSocket);

        return () => {
            // Don't disconnect the global socket, just clean up local listeners
            console.log('Cleaning up local socket listeners');
        };
    }, []);

    // Handle socket events
    useEffect(() => {
        if (!socket) return;

        console.log('Setting up socket event listeners for chat with friend:', friendId);

        // Let the server know we're opening a chat with this friend
        socket.emit('open chat', { friendId });
        console.log('Emitted open chat event with friendId:', friendId);

        // Listen for new messages
        const handleNewMessage = (serverMessage: Message) => {
            // Set delivered to true for all incoming messages from the server.
            const finalMessage = { ...serverMessage, delivered: true };

            setMessages(prevMessages => {
                // Check if we already have this message to prevent duplicates.
                const messageExists = prevMessages.some(m => m._id === finalMessage._id);
                if (messageExists) {
                    return prevMessages;
                }

                // Add the new message if it belongs to this chat.
                const isCurrentConversation =
                    (finalMessage.sender === friendId && finalMessage.recipient === user?.id) ||
                    (finalMessage.sender === user?.id && finalMessage.recipient === friendId);

                if (isCurrentConversation) {
                    return [...prevMessages, finalMessage];
                }

                return prevMessages;
            });

            // Scroll to bottom after the state has been updated
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        };

        // Listen for seen messages
        const handleSeenMessage = ({ readerId }: { readerId: string }) => {
            if (readerId === friendId) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.sender === user?.id && msg.recipient === friendId
                            ? { ...msg, read: true }
                            : msg
                    )
                );
            }
        };

        // Add event listeners
        socket.on('new_private_message', handleNewMessage);
        socket.on('seen_message', handleSeenMessage);

        // Force socket reconnection if not connected
        if (!socket.connected) {
            console.log('Socket not connected, attempting to reconnect...');
            socket.connect();
        }

        return () => {
            // Let the server know we're closing the chat
            socket.emit('close chat');
            console.log('Emitted close chat event');

            // Remove event listeners
            socket.off('new_private_message', handleNewMessage);
            socket.off('seen_message', handleSeenMessage);
        };
    }, [socket, friendId, user?.id]);

    // Add a heartbeat to keep the socket connection alive
    useEffect(() => {
        if (!socket) return;

        const heartbeatInterval = setInterval(() => {
            if (socket.connected) {
                console.log('Sending heartbeat to keep connection alive');
                socket.emit('heartbeat');
            } else {
                console.log('Socket not connected, attempting to reconnect...');
                socket.connect();
            }
        }, 30000); // Every 30 seconds

        return () => {
            clearInterval(heartbeatInterval);
        };
    }, [socket]);

    // Fetch chat history
    useEffect(() => {
        const fetchMessages = async () => {
            if (!friendId) {
                console.error('No friendId provided, cannot fetch messages');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                console.log(`Fetching messages for friend ${friendId}, page ${page}`);
                const response = await api.get(`/api/messages/${friendId}?page=${page}&limit=50`);
                const fetchedMessages = response.data;
                console.log(`Fetched ${fetchedMessages.length} messages for friend ${friendId}`);

                if (fetchedMessages.length === 0) {
                    setHasMore(false);
                } else {
                    setMessages(prev => {
                        // Only combine messages if we're still on the same friend
                        // This prevents messages from different conversations mixing
                        const currentFriendMessages = prev.filter(msg =>
                            (msg.sender === friendId && msg.recipient === user?.id) ||
                            (msg.sender === user?.id && msg.recipient === friendId)
                        );

                        // Combine messages
                        const combined = [...currentFriendMessages];

                        // Add only new messages that don't already exist
                        fetchedMessages.forEach(newMsg => {
                            const isDuplicate = combined.some(existingMsg =>
                                existingMsg._id === newMsg._id ||
                                (existingMsg.content === newMsg.content &&
                                    existingMsg.sender === newMsg.sender &&
                                    Math.abs(new Date(existingMsg.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 5000)
                            );

                            if (!isDuplicate) {
                                combined.push(newMsg);
                            }
                        });

                        return combined;
                    });
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (friendId) {
            fetchMessages();
        }
    }, [friendId, page, user?.id]);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView();
        }
    }, [isLoading]);

    // Debounced send message function to prevent double-sends
    const debouncedSendMessage = useRef(
        debounce((content: string) => {
            if (!socket) return;

            try {
                // Send message to server
                socket.emit('private_message', {
                    recipientId: friendId,
                    content
                });
                console.log('Emitted private_message event with content:', content);
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setIsMessageSending(false);
            }
        }, 300)
    ).current;

    const handleSendMessage = () => {
        if (!socket || !newMessage.trim()) return;

        // Directly send the message to the server without any temporary UI updates.
        socket.emit('private_message', {
            recipientId: friendId,
            content: newMessage,
        });

        setNewMessage(''); // Clear input
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEmojiSelect = (emoji: any) => {
        setNewMessage(prev => prev + emoji.native);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const loadMoreMessages = () => {
        if (!hasMore || isLoading) return;
        setPage(prev => prev + 1);
    };

    return (
        <Card className="w-[320px] h-[400px] flex flex-col bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl overflow-hidden">
            {/* Chat header */}
            <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={friendProfilePic} alt={friendName} />
                        <AvatarFallback>{getInitials(friendName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-sm font-medium text-white">{friendName}</h3>
                        <p className="text-xs text-white/60">
                            {socketConnected ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={onMinimize}
                        className="text-white/60 hover:text-white p-1"
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white p-1"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
                {isLoading && page === 0 ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin h-6 w-6 border-2 border-primary-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <div className="flex justify-center p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadMoreMessages}
                                    disabled={isLoading}
                                    className="text-xs text-white/50 hover:text-white"
                                >
                                    {isLoading ? 'Loading...' : 'Load more messages'}
                                </Button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {messages.map((message) => {
                                // Debug logging to understand the message structure
                                console.log('Message:', message);

                                // Try to determine if the message is sent by the current user
                                const isSentByMe = message.sender === user?.id;

                                // Debug logging
                                console.log('Message sender ID:', message.sender);
                                console.log('Current user ID:', user?.id);
                                console.log('Is sent by me:', isSentByMe);

                                return (
                                    <div
                                        key={message._id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: isSentByMe ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                                                color: 'white',
                                                maxWidth: '70%',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>{message.content}</div>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                                                {isSentByMe && (
                                                    <span className="text-xs">
                                                        {message.read ?
                                                            <span style={{ color: '#60a5fa' }}>✓✓</span> : // Blue for read
                                                            <span>✓✓</span> // Grey for delivered
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </>
                )}
            </ScrollArea>

            {/* Chat input */}
            <div className="p-3 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                                <Smile size={18} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-auto p-0 bg-transparent border-none">
                            <Picker
                                data={data}
                                onEmojiSelect={handleEmojiSelect}
                                theme="dark"
                            />
                        </PopoverContent>
                    </Popover>

                    <StableInput
                        value={newMessage}
                        onChange={setNewMessage}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyDown={handleKeyPress}
                    />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/60 hover:text-white"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isMessageSending}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}; 