import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, X, Image, Paperclip, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { io, Socket } from 'socket.io-client';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Message {
    _id: string;
    sender: string;
    recipient: string;
    content: string;
    timestamp: Date;
    read: boolean;
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

    // Connect to socket or use existing connection
    useEffect(() => {
        console.log('Initializing socket connection...');

        if (!globalThis.globalSocket) {
            const token = localStorage.getItem('token');
            console.log('Creating new socket connection with token');

            globalThis.globalSocket = io('http://localhost:5001', {
                withCredentials: true,
                transports: ['websocket'],
                auth: {
                    token: token || undefined
                }
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
        const handleNewMessage = (message: Message) => {
            console.log('Received new private message:', message);
            console.log('Current user ID:', user?._id);
            console.log('Friend ID:', friendId);
            console.log('Message sender:', message.sender);
            console.log('Message recipient:', message.recipient);

            // Only process messages that are part of this conversation
            const isRelevantMessage =
                (message.sender === user?._id && message.recipient === friendId) ||
                (message.sender === friendId && message.recipient === user?._id);

            if (!isRelevantMessage) {
                console.log('Message not relevant to this chat window, ignoring');
                return;
            }

            console.log('Adding new message to chat');

            // Important: Use a callback to ensure we're working with the latest state
            setMessages(prevMessages => {
                // Check if message already exists in the array
                const exists = prevMessages.some(m => m._id === message._id);

                if (exists) {
                    console.log('Message already exists in chat, not adding duplicate');
                    return prevMessages;
                }

                const newMessages = [...prevMessages, message];
                console.log('Updated messages array:', newMessages);

                // Scroll to bottom on new message
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);

                return newMessages;
            });
        };

        // Listen for seen messages
        const handleSeenMessage = ({ readerId }: { readerId: string }) => {
            if (readerId === friendId) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.recipient === friendId ? { ...msg, read: true } : msg
                    )
                );
            }
        };

        // Add event listeners
        socket.on('new_private_message', handleNewMessage);
        socket.on('seen_message', handleSeenMessage);

        return () => {
            // Let the server know we're closing the chat
            socket.emit('close chat');
            console.log('Emitted close chat event');

            // Remove event listeners
            socket.off('new_private_message', handleNewMessage);
            socket.off('seen_message', handleSeenMessage);
        };
    }, [socket, friendId, user?._id]);

    // Fetch chat history
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setIsLoading(true);
                console.log(`Fetching messages for friend ${friendId}, page ${page}`);
                const response = await api.get(`/api/messages/${friendId}?page=${page}&limit=50`);
                const fetchedMessages = response.data;
                console.log(`Fetched ${fetchedMessages.length} messages`);

                if (fetchedMessages.length === 0) {
                    setHasMore(false);
                } else {
                    setMessages(prev => {
                        // Combine and deduplicate messages
                        const combined = [...prev, ...fetchedMessages];
                        const unique = combined.filter((message, index, self) =>
                            index === self.findIndex(m => m._id === message._id)
                        );
                        return unique;
                    });
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [friendId, page]);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView();
        }
    }, [isLoading]);

    const handleSendMessage = () => {
        if (!socket || !newMessage.trim()) return;

        console.log('Sending message to friend:', friendId, 'Content:', newMessage);

        // Create a temporary message object to show immediately
        const tempMessage: Message = {
            _id: `temp-${Date.now()}`,
            sender: user?._id || '',
            recipient: friendId,
            content: newMessage,
            timestamp: new Date(),
            read: false
        };

        // Add message to UI immediately
        setMessages(prev => [...prev, tempMessage]);
        console.log('Added temporary message to UI:', tempMessage);

        // Scroll to bottom
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // Send message to server
        socket.emit('private_message', {
            recipientId: friendId,
            content: newMessage
        });
        console.log('Emitted private_message event');

        setNewMessage('');
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
        <Card className="flex flex-col h-[500px] w-[350px] shadow-lg border border-white/10 bg-black/50 backdrop-blur-lg rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-primary-500/30 to-secondary-500/30">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={friendProfilePic} alt={friendName} />
                        <AvatarFallback className="bg-primary-500 text-white">
                            {getInitials(friendName)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-white">{friendName}</h3>
                        {!socketConnected && <span className="text-xs text-red-400">Reconnecting...</span>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={onMinimize} className="h-8 w-8 text-white/70 hover:text-white">
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/70 hover:text-white">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 p-3"
                onScrollCapture={(e) => {
                    // Load more messages when scrolling to top
                    const target = e.currentTarget as HTMLDivElement;
                    if (target.scrollTop === 0 && hasMore && !isLoading) {
                        loadMoreMessages();
                    }
                }}
            >
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
                                const isSentByMe = message.sender === user?._id;

                                return (
                                    <div
                                        key={message._id}
                                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-3 py-2 rounded-lg ${isSentByMe
                                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                                                : 'bg-white/10 text-white'
                                                }`}
                                        >
                                            <div className="text-sm break-words">{message.content}</div>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                                                {isSentByMe && (
                                                    <span className="text-xs">
                                                        {message.read ? '✓✓' : '✓'}
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

            {/* Message Input */}
            <div className="p-3 border-t border-white/10 bg-black/30">
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 border-none bg-transparent" align="start">
                                <Picker
                                    data={data}
                                    onEmojiSelect={handleEmojiSelect}
                                    theme="dark"
                                />
                            </PopoverContent>
                        </Popover>

                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 border-none bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                            disabled={!socketConnected}
                        />

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                            <Paperclip className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                            <Image className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleSendMessage}
                        className="rounded-full h-10 w-10 bg-gradient-to-r from-primary-500 to-secondary-500 p-0"
                        disabled={!socketConnected || !newMessage.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}; 