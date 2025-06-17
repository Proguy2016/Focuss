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
import { cn } from "../lib/utils";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Modal } from "../components/common/Modal";
import io, { Socket } from "socket.io-client";

// --- INLINE COMPONENTS (to avoid path issues) ---

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                'flex h-10 w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                className
            )}
            {...props}
        />
    )
);
Input.displayName = "Input";

function useRoomCode() {
    const generateRoomCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    const [roomCode, setRoomCode] = useState<string>(generateRoomCode());
    const refreshRoomCode = () => setRoomCode(generateRoomCode());
    return { roomCode, refreshRoomCode };
}

interface ChatBubbleProps {
    variant?: "sent" | "received";
    children: React.ReactNode;
}

function ChatBubble({ variant = "received", children }: ChatBubbleProps) {
    return (
        <div className={cn("flex items-start gap-2 mb-4", variant === "sent" && "flex-row-reverse")}>
            {children}
        </div>
    );
}

function ChatBubbleMessage({ variant = "received", children }: { variant?: "sent" | "received", children: React.ReactNode }) {
    return (
        <div className={cn("rounded-lg p-3", variant === "sent" ? "bg-primary-500 text-white" : "bg-white/10")}>
            {children}
        </div>
    );
}

function ChatBubbleAvatar({ src, fallback = "AI" }: { src?: string, fallback?: string }) {
    return (
        <Avatar className="h-8 w-8">
            {src && <AvatarImage src={src} />}
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    );
}


// --- DASHBOARD SUBCOMPONENTS ---

const ParticipantsPanel: React.FC<{ roomCode: string, onInvite: () => void }> = ({ roomCode, onInvite }) => (
    <Card variant="glass" className="p-4 h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 text-white">Participants (4)</h3>
        <div className="space-y-3 overflow-y-auto">
            {['You', 'Alex', 'Sarah', 'Mike'].map(name => (
                <div key={name} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarImage src={`https://i.pravatar.cc/40?u=${name}`} /><AvatarFallback>{name.charAt(0)}</AvatarFallback></Avatar>
                    <div><p className="font-semibold text-white/90">{name}</p><p className="text-xs text-green-400">Online</p></div>
                </div>
            ))}
        </div>
        <div className="mt-auto pt-4 border-t border-white/10"><Button variant="primary" className="w-full" onClick={onInvite}><Share2 className="mr-2 h-4 w-4" /> Invite</Button></div>
    </Card>
);

const SharedFilesPanel: React.FC = () => (
    <Card variant="glass" className="p-4 h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 text-white">Shared Files (2)</h3>
        <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10"><FileText className="h-6 w-6 text-primary-300" /><div className="flex-1"><p className="text-sm font-medium text-white/90">Project_Brief.pdf</p><p className="text-xs text-white/60">1.2 MB</p></div></div>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10"><Youtube className="h-6 w-6 text-red-400" /><div className="flex-1"><p className="text-sm font-medium text-white/90">Design_Inspiration.url</p><p className="text-xs text-white/60">Link</p></div></div>
        </div>
        <div className="mt-auto"><Button variant="secondary" className="w-full mt-4"><Paperclip className="mr-2 h-4 w-4" /> Upload File</Button></div>
    </Card>
);

const MainContent: React.FC = () => (
    <Tabs defaultValue="chat" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900/60"><TabsTrigger value="chat">Chat</TabsTrigger><TabsTrigger value="tasks">Tasks</TabsTrigger><TabsTrigger value="whiteboard">Whiteboard</TabsTrigger></TabsList>
        <TabsContent value="chat" className="flex-1 flex flex-col glass rounded-b-lg"><div className="flex-1 p-6 overflow-y-auto"><ChatBubble><ChatBubbleAvatar fallback="A" /><ChatBubbleMessage>Hey everyone, let's get started on the brainstorming.</ChatBubbleMessage></ChatBubble><ChatBubble variant="sent"><ChatBubbleAvatar fallback="Y" /><ChatBubbleMessage variant="sent">Sounds good! I've added the project brief to the shared files.</ChatBubbleMessage></ChatBubble></div><div className="p-4 border-t border-white/10"><div className="relative"><Input placeholder="Type your message..." className="pr-12" /><Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"><Send className="h-4 w-4" /></Button></div></div></TabsContent>
        <TabsContent value="tasks" className="flex-1 p-6 glass rounded-b-lg"><h3 className="text-xl font-bold text-white">Shared Task Board</h3></TabsContent>
        <TabsContent value="whiteboard" className="flex-1 p-6 glass rounded-b-lg"><h3 className="text-xl font-bold text-white">Collaborative Whiteboard</h3></TabsContent>
    </Tabs>
);

const AiAssistantPanel: React.FC = () => (
    <Card variant="glass" className="p-4 h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><Bot className="text-primary-300" /> AI Assistant</h3>
        <p className="text-sm text-white/70 mb-4">Your smart companion for this session. Use it to summarize discussions or generate ideas.</p>
        <Button variant="primary"><BookOpen className="mr-2 h-4 w-4" /> Summarize Chat</Button>
        <div className="mt-6 border-t border-white/10 pt-4"><h4 className="font-semibold text-white/90 mb-2">Summary</h4><p className="text-sm text-white/60 italic">No summary generated yet.</p></div>
    </Card>
);

// --- MODIFIED ActiveRoom ---
function ActiveRoom({ roomCode, onLeaveRoom }: { roomCode: string, onLeaveRoom: () => void }) {
    const [showInviteModal, setShowInviteModal] = useState(false);
    return (
        <>
            <div className="h-screen w-full text-white p-4 grid grid-cols-12 grid-rows-6 gap-4">
                <div className="col-span-12 row-span-1 flex justify-between items-center glass p-4 rounded-lg">
                    <div><h1 className="text-2xl font-bold">Collaboration Space</h1><p className="text-white/60">Room Code: <span className="font-mono text-primary-300">{roomCode}</span></p></div>
                    <Button variant="danger" onClick={onLeaveRoom}><X className="mr-2 h-4 w-4" /> Leave Room</Button>
                </div>
                <div className="col-span-3 row-span-5 grid grid-rows-2 gap-4"><div className="row-span-1"><ParticipantsPanel roomCode={roomCode} onInvite={() => setShowInviteModal(true)} /></div><div className="row-span-1"><SharedFilesPanel /></div></div>
                <div className="col-span-6 row-span-5"><MainContent /></div>
                <div className="col-span-3 row-span-5"><AiAssistantPanel /></div>
            </div>
            <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite to Collaborate">
                <p>Share this room code with others.</p>
                <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-md mt-4">
                    <p className="text-lg font-mono text-white flex-1">{roomCode}</p>
                    <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(roomCode)}><Copy className="h-4 w-4" /></Button>
                </div>
            </Modal>
        </>
    );
}

// --- MODIFIED CollaborationRoom (Entry point) ---
function CollaborationRoom({ onJoinRoom, onCreateRoom }: { onJoinRoom: (code: string) => void, onCreateRoom: () => void }) {
    const [joinCode, setJoinCode] = useState<string>("");
    const { roomCode, refreshRoomCode } = useRoomCode();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showJoinDialog, setShowJoinDialog] = useState(false);

    const handleJoinSubmit = (e: FormEvent) => { e.preventDefault(); if (joinCode.length === 6) onJoinRoom(joinCode); };
    const handleCreate = () => onCreateRoom();

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-4 min-h-[70vh]">
            <Card variant="glass" className="w-full">
                <div className="p-6 text-center">
                    <Users className="mx-auto h-12 w-12 text-primary-300" />
                    <h2 className="mt-4 text-2xl font-bold">Collaboration Room</h2>
                    <p className="mt-2 text-white/70">Create or join a room to collaborate with your team in real-time.</p>
                </div>
                <div className="p-6 border-t border-white/10 grid grid-cols-2 gap-4">
                    <Button size="lg" onClick={() => setShowCreateDialog(true)}>Create Room</Button>
                    <Button variant="secondary" size="lg" onClick={() => setShowJoinDialog(true)}>Join Room</Button>
                </div>
            </Card>

            <Modal isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title="Create a New Room">
                <p className="text-white/70 mb-4">Share this code to invite others.</p>
                <div className="flex items-center justify-center bg-gray-800 p-4 rounded-lg w-full">
                    <span className="text-3xl font-mono font-bold tracking-widest">{roomCode}</span>
                    <Button variant="ghost" size="icon" className="ml-4" onClick={() => navigator.clipboard.writeText(roomCode)}><Copy className="h-5 w-5" /></Button>
                </div>
                <Button variant="outline" onClick={refreshRoomCode} className="w-full mt-4">Generate New Code</Button>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Create & Join</Button>
                </div>
            </Modal>

            <Modal isOpen={showJoinDialog} onClose={() => setShowJoinDialog(false)} title="Join an Existing Room">
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                    <p className="text-white/70">Enter the 6-digit code to join.</p>
                    <Input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="123456" maxLength={6} className="w-full text-center text-2xl font-mono tracking-widest" />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" type="button" onClick={() => setShowJoinDialog(false)}>Cancel</Button>
                        <Button type="submit" disabled={joinCode.length !== 6}>Join Room</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}


export default function CollaborationRoomApp() {
    const [activeRoom, setActiveRoom] = useState<string | null>(null);

    const handleJoinRoom = (code: string) => setActiveRoom(code);
    const handleCreateRoom = () => setActiveRoom(Math.floor(100000 + Math.random() * 900000).toString());
    const handleLeaveRoom = () => setActiveRoom(null);

    return (
        <div className="w-full h-full">
            {activeRoom ? (
                <ActiveRoom roomCode={activeRoom} onLeaveRoom={handleLeaveRoom} />
            ) : (
                <CollaborationRoom onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />
            )}
        </div>
    );
} 