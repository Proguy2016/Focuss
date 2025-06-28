"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { Users, Copy, X } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/collaboration/Input";
import { useRoomCode } from "../components/collaboration/useRoomCode";
import { ParticipantsPanel } from "../components/collaboration/ParticipantsPanel";
import { SharedFilesPanel } from "../components/collaboration/SharedFilesPanel";
import { MainContent } from "../components/collaboration/MainContent";
import { AiAssistantPanel } from "../components/collaboration/AiAssistantPanel";
import { CollaborationProvider, useCollaboration } from '../contexts/CollaborationContext';

function ActiveRoom({ roomCode, onLeaveRoom }: { roomCode: string, onLeaveRoom: () => void }) {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { joinRoom, leaveRoom, isConnected } = useCollaboration();

    useEffect(() => {
        // This effect runs when the component mounts, triggering the connection
        // to the server and joining the specific room.
        joinRoom(roomCode);

        // The cleanup function returned by useEffect will run when the component unmounts
        return () => {
            leaveRoom();
        };
    }, [roomCode, joinRoom, leaveRoom]);

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-screen w-full text-white">
                <div className="text-center">
                    <p className="text-2xl font-bold mb-2">Connecting to Collaboration Service...</p>
                    <p className="text-white/60">Please wait.</p>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <div className="h-screen w-full text-white p-4 flex flex-col gap-4">
                <header className="flex-shrink-0 flex justify-between items-center glass p-4 rounded-lg">
                    <div>
                        <h1 className="text-2xl font-bold">Collaboration Space</h1>
                        <p className="text-white/60">Room Code: <span className="font-mono text-primary-300">{roomCode}</span></p>
                    </div>
                    <div>
                        <Button variant="danger" onClick={onLeaveRoom}><X className="mr-2 h-4 w-4" /> Leave Room</Button>
                    </div>
                </header>
                <div className="flex-1 flex gap-4 overflow-hidden">
                    <aside className="w-1/4 flex flex-col gap-4">
                        <ParticipantsPanel roomCode={roomCode} onInvite={() => setShowInviteModal(true)} />
                        <div className="flex-1">
                            <SharedFilesPanel />
                        </div>
                    </aside>
                    <main className="flex-1">
                        <MainContent />
                    </main>
                    <aside className="w-1/4">
                        <AiAssistantPanel />
                    </aside>
                </div>
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
        <CollaborationProvider>
            <div className="w-full h-full">
                {activeRoom ? (
                    <ActiveRoom roomCode={activeRoom} onLeaveRoom={handleLeaveRoom} />
                ) : (
                    <CollaborationRoom onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />
                )}
            </div>
        </CollaborationProvider>
    );
} 