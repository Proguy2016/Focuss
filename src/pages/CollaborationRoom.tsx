"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
    Users,
    FileText,
    Youtube,
    Bot,
    Copy,
    X,
    Send,
    Paperclip,
    Share2,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import ColoredGlassCard from '@/components/ui/ColoredGlassCard';
import io, { Socket } from "socket.io-client";

// Custom hook for generating a random room code
function useRoomCode() {
    const generateRoomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const [roomCode, setRoomCode] = useState<string>(generateRoomCode());

    const refreshRoomCode = () => {
        setRoomCode(generateRoomCode());
    };

    return { roomCode, refreshRoomCode };
}

// Message Loading Component
function MessageLoading() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="text-foreground"
        >
            <circle cx="4" cy="12" r="2" fill="currentColor">
                <animate
                    id="spinner_qFRN"
                    begin="0;spinner_OcgL.end+0.25s"
                    attributeName="cy"
                    calcMode="spline"
                    dur="0.6s"
                    values="12;6;12"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
            </circle>
            <circle cx="12" cy="12" r="2" fill="currentColor">
                <animate
                    begin="spinner_qFRN.begin+0.1s"
                    attributeName="cy"
                    calcMode="spline"
                    dur="0.6s"
                    values="12;6;12"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
            </circle>
            <circle cx="20" cy="12" r="2" fill="currentColor">
                <animate
                    id="spinner_OcgL"
                    begin="spinner_qFRN.begin+0.2s"
                    attributeName="cy"
                    calcMode="spline"
                    dur="0.6s"
                    values="12;6;12"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
            </circle>
        </svg>
    );
}

// Chat Bubble Components
interface ChatBubbleProps {
    variant?: "sent" | "received";
    className?: string;
    children: React.ReactNode;
}

function ChatBubble({
    variant = "received",
    className,
    children,
}: ChatBubbleProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-2 mb-4",
                variant === "sent" && "flex-row-reverse",
                className,
            )}
        >
            {children}
        </div>
    );
}

interface ChatBubbleMessageProps {
    variant?: "sent" | "received";
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
}

function ChatBubbleMessage({
    variant = "received",
    isLoading,
    className,
    children,
}: ChatBubbleMessageProps) {
    return (
        <div
            className={cn(
                "rounded-lg p-3",
                variant === "sent" ? "bg-primary text-primary-foreground" : "bg-white/10",
                className
            )}
        >
            {isLoading ? (
                <div className="flex items-center space-x-2">
                    <MessageLoading />
                </div>
            ) : (
                children
            )}
        </div>
    );
}

interface ChatBubbleAvatarProps {
    src?: string;
    fallback?: string;
    className?: string;
}

function ChatBubbleAvatar({
    src,
    fallback = "AI",
    className,
}: ChatBubbleAvatarProps) {
    return (
        <Avatar className={cn("h-8 w-8", className)}>
            {src && <AvatarImage src={src} />}
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    );
}

// Main Collaboration Room Component
interface CollaborationRoomProps {
    onJoinRoom: (roomCode: string) => void;
    onCreateRoom: () => void;
}

function CollaborationRoom({ onJoinRoom, onCreateRoom }: CollaborationRoomProps) {
    const [joinCode, setJoinCode] = useState<string>("");
    const { roomCode, refreshRoomCode } = useRoomCode();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showJoinDialog, setShowJoinDialog] = useState(false);

    const handleJoinRoom = (e: FormEvent) => {
        e.preventDefault();
        if (joinCode.length === 6) {
            onJoinRoom(joinCode);
            setShowJoinDialog(false);
        }
    };

    const handleCreateRoom = () => {
        onCreateRoom();
        setShowCreateDialog(false);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-4 space-y-6 min-h-[60vh]">
            <ColoredGlassCard className="w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Collaboration Room</CardTitle>
                    <CardDescription>
                        Create or join a room to collaborate with others in real-time
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-center">
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="w-full md:w-auto" size="lg">
                                <Users className="mr-2 h-5 w-5" />
                                Create Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a New Room</DialogTitle>
                                <DialogDescription>
                                    Share this 6-digit code with others to invite them to your room.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                <div className="flex items-center justify-center bg-white/10 p-4 rounded-lg w-full">
                                    <span className="text-3xl font-mono font-bold tracking-widest">{roomCode}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="ml-2"
                                        onClick={() => {
                                            navigator.clipboard.writeText(roomCode);
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={refreshRoomCode}
                                    className="w-full"
                                >
                                    Generate New Code
                                </Button>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateRoom} className="w-full">
                                    Create & Join Room
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <span className="text-muted-foreground">or</span>

                    <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto" size="lg">
                                <Share2 className="mr-2 h-5 w-5" />
                                Join Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Join a Room</DialogTitle>
                                <DialogDescription>
                                    Enter the 6-digit room code to join an existing collaboration room.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleJoinRoom}>
                                <div className="flex flex-col space-y-4 py-4">
                                    <Input
                                        placeholder="Enter 6-digit code"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        maxLength={6}
                                        className="text-center text-xl font-mono tracking-widest"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        disabled={joinCode.length !== 6}
                                        className="w-full"
                                    >
                                        Join Room
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </ColoredGlassCard>

            <ColoredGlassCard className="w-full">
                <CardHeader>
                    <CardTitle>Collaboration Features</CardTitle>
                    <CardDescription>
                        Explore the powerful tools available in our collaboration rooms
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 p-4 border border-[#00a8a8]/40 rounded-lg">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-medium">Shared PDF Annotations</h3>
                            <p className="text-sm text-muted-foreground">
                                View and annotate PDFs together in real-time
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border border-[#00a8a8]/40 rounded-lg">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-medium">Shared Flashcards</h3>
                            <p className="text-sm text-muted-foreground">
                                Create and study flashcards collaboratively
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border border-[#00a8a8]/40 rounded-lg">
                        <Bot className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-medium">Shared AI Assistant</h3>
                            <p className="text-sm text-muted-foreground">
                                Ask questions and get answers together
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border border-[#00a8a8]/40 rounded-lg">
                        <Youtube className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-medium">Shared YouTube Player</h3>
                            <p className="text-sm text-muted-foreground">
                                Watch videos together with synchronized playback
                            </p>
                        </div>
                    </div>
                </CardContent>
            </ColoredGlassCard>
        </div>
    );
}

// Active Room Component
interface ActiveRoomProps {
    roomCode: string;
    onLeaveRoom: () => void;
}

function ActiveRoom({ roomCode, onLeaveRoom }: ActiveRoomProps) {
    const [activeUsers] = useState([
        { id: 1, name: "You", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop" },
        { id: 2, name: "Jane", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop" },
        { id: 3, name: "Mike", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&q=80&crop=faces&fit=crop" },
    ]);

    const [messages, setMessages] = useState<any[]>([
        {
            id: 1,
            content: "Welcome to the collaboration room! Send a message to get started.",
            sender: "System",
            avatar: "https://cdn-icons-png.flaticon.com/512/61/61457.png",
        }
    ]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io("http://localhost:5001", {
            auth: {
                token
            }
        });
        setSocket(newSocket);

        newSocket.emit("join_room", roomCode);

        newSocket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [roomCode]);

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        const messageData = {
            roomCode,
            id: Date.now(),
            content: input,
        };

        const selfMessage = {
            ...messageData,
            sender: "You",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop",
        }

        socket.emit("send_message", messageData);
        setMessages((prev) => [...prev, selfMessage]);
        setInput("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] max-w-6xl mx-auto">
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold">Room: {roomCode}</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(roomCode);
                        }}
                    >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                        {activeUsers.map((user) => (
                            <Avatar key={user.id} className="border-2 border-background">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">
                        {activeUsers.length} active
                    </span>
                    <Button variant="destructive" size="sm" onClick={onLeaveRoom}>
                        <X className="h-4 w-4 mr-1" />
                        Leave
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <TabsList className="mx-4 mt-2 justify-start">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="pdf">PDF Viewer</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                    <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                    <TabsTrigger value="youtube">YouTube</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 p-4 overflow-y-auto min-h-0">
                    <div className="space-y-4 h-full overflow-y-auto">
                        {messages.map((message) => (
                            <ChatBubble
                                key={message.id}
                                variant={message.sender === "You" ? "sent" : "received"}
                            >
                                <ChatBubbleAvatar src={message.avatar} fallback={message.sender[0]} />
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground mb-1">
                                        {message.sender}
                                    </span>
                                    <ChatBubbleMessage variant={message.sender === "You" ? "sent" : "received"}>
                                        {message.content}
                                    </ChatBubbleMessage>
                                </div>
                            </ChatBubble>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="pdf" className="flex-1 p-4">
                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-2 font-medium">PDF Viewer</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Upload a PDF to view and annotate together
                            </p>
                            <Button className="mt-4">Upload PDF</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="flashcards" className="flex-1 p-4">
                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-2 font-medium">Flashcards</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create and study flashcards together
                            </p>
                            <Button className="mt-4">Create Flashcard</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="ai" className="flex-1 p-4">
                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-2 font-medium">AI Assistant</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Ask questions and get answers together
                            </p>
                            <Button className="mt-4">Ask AI</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="youtube" className="flex-1 p-4">
                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <Youtube className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-2 font-medium">YouTube Player</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Watch videos together with synchronized playback
                            </p>
                            <Button className="mt-4">Add YouTube URL</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex items-center space-x-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button type="submit" disabled={!input.trim()}>
                        <Send className="h-4 w-4 mr-1" />
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Main Component
function CollaborationRoomApp() {
    const [activeRoom, setActiveRoom] = useState<string | null>(null);

    const handleJoinRoom = (roomCode: string) => {
        setActiveRoom(roomCode);
    };

    const handleCreateRoom = () => {
        // In a real app, you would create a room on the server
        // For now, we'll just use the generated code
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setActiveRoom(generatedCode);
    };

    const handleLeaveRoom = () => {
        setActiveRoom(null);
    };

    return (
        <div className="min-h-screen">
            <AnimatedBackground />
            <div className="relative z-10">
                {activeRoom ? (
                    <ActiveRoom roomCode={activeRoom} onLeaveRoom={handleLeaveRoom} />
                ) : (
                    <CollaborationRoom onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />
                )}
            </div>
        </div>
    );
}

export default CollaborationRoomApp; 