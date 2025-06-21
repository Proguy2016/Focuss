import { useState } from "react";

export function useRoomCode() {
    const generateRoomCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    const [roomCode, setRoomCode] = useState<string>(generateRoomCode());
    const refreshRoomCode = () => setRoomCode(generateRoomCode());
    return { roomCode, refreshRoomCode };
} 