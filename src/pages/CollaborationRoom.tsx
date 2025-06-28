"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { Users, Copy, X, Bot, Send, Upload, Share2, Calendar } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card, CardTitle, CardContent } from "../components/common/Card";
import { CardHeader } from "../components/ui/card";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/collaboration/Input";
import { useRoomCode } from "../components/collaboration/useRoomCode";
import { ParticipantsPanel } from "../components/collaboration/ParticipantsPanel";
import { SharedFilesPanel } from "../components/collaboration/SharedFilesPanel";
import { MainContent } from "../components/collaboration/MainContent";
import { AiAssistantPanel } from "../components/collaboration/AiAssistantPanel";
import { CollaborationProvider, useCollaboration } from '../contexts/CollaborationContext';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Timer } from "../components/collaboration/Timer";
import { SidebarTabs } from "../components/collaboration/SidebarTabs";
import StudentCollaborationRoom from '../components/collaboration/StudentCollaborationRoom';
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";

function ActiveRoom({ roomCode }: { roomCode: string }) {
    const { joinRoom, leaveRoom } = useCollaboration();
    
    // Explicitly join the room when this component mounts
    useEffect(() => {
        console.log(`[ActiveRoom] Joining room with code: ${roomCode}`);
        
        // Join the room
        joinRoom(roomCode);
        
        // Store the room code for future sessions
        localStorage.setItem('lastRoomCode', roomCode);
        
        return () => {
            console.log(`[ActiveRoom] Leaving room ${roomCode}`);
            leaveRoom();
        };
    }, [roomCode, joinRoom, leaveRoom]);
    
    // Instead of the old UI, render the new StudentCollaborationRoom
    return <StudentCollaborationRoom />;
}

function CollaborationRoom({ onJoinRoom, onCreateRoom }: { onJoinRoom: (code: string) => void, onCreateRoom: () => void }) {
    const [joinCode, setJoinCode] = useState<string>("");
    const { roomCode, refreshRoomCode } = useRoomCode();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showJoinDialog, setShowJoinDialog] = useState(false);

    const handleJoinSubmit = (e: FormEvent) => { 
        e.preventDefault(); 
        if (joinCode.length === 6) {
            console.log(`[CollaborationRoom] Joining room with code: ${joinCode}`);
            onJoinRoom(joinCode);
        }
    };
    
    const handleCreate = () => {
        console.log(`[CollaborationRoom] Creating and joining room with code: ${roomCode}`);
        onCreateRoom();
    };

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

    // Check if we have a stored room code on page load
    useEffect(() => {
        const storedRoomCode = localStorage.getItem('lastRoomCode');
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoomCode = urlParams.get('room');
        
        // Use URL parameter first, then stored room code
        if (urlRoomCode) {
            console.log(`[CollaborationRoomApp] Found room code in URL: ${urlRoomCode}`);
            setActiveRoom(urlRoomCode);
        } else if (storedRoomCode) {
            console.log(`[CollaborationRoomApp] Found stored room code: ${storedRoomCode}`);
            setActiveRoom(storedRoomCode);
        }
    }, []);

    const handleJoinRoom = (code: string) => {
        console.log(`[CollaborationRoomApp] Setting active room to: ${code}`);
        setActiveRoom(code);
        // Update URL with room code for sharing
        const url = new URL(window.location.href);
        url.searchParams.set('room', code);
        window.history.pushState({}, '', url);
    };
    
    const handleCreateRoom = () => {
        const newRoomCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[CollaborationRoomApp] Created new room with code: ${newRoomCode}`);
        handleJoinRoom(newRoomCode);
    };
    
    const handleLeaveRoom = () => {
        console.log(`[CollaborationRoomApp] Leaving room`);
        setActiveRoom(null);
        // Remove room code from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.pushState({}, '', url);
    };

    return (
        <CollaborationProvider>
            <div className="w-full h-full">
                {activeRoom ? (
                    <ActiveRoom roomCode={activeRoom} />
                ) : (
                    <CollaborationRoom onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />
                )}
            </div>
        </CollaborationProvider>
    );
} 