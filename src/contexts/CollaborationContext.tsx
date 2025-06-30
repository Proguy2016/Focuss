import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Types ---------------------------------------------------
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  isTyping?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
}

export interface CollaborationState {
  participants: Participant[];
  messages: ChatMessage[];
  isConnected: boolean;
}

interface CollaborationContextType extends CollaborationState {
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  setTyping: (isTyping: boolean) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

// Provider ------------------------------------------------
export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<CollaborationState>({
    participants: [],
    messages: [],
    isConnected: false,
  });
  const roomCodeRef = useRef<string | null>(null);

  // Helpers ----------------------------------------------
  const safeEmit = useCallback((event: string, payload: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, payload);
    }
  }, []);

  // Core API ---------------------------------------------
  const joinRoom = useCallback((roomCode: string) => {
    roomCodeRef.current = roomCode;

    // If already connected to this room, skip
    if (socketRef.current && socketRef.current.connected) {
      safeEmit("joinRoom", { roomCode, user: { id: socketRef.current.id!, name: "Anonymous" } });
      return;
    }

    // Init socket ---------------------------------------
    const socket = io("http://localhost:5001", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    // Listeners -----------------------------------------
    socket.on("connect", () => {
      setState(prev => ({ ...prev, isConnected: true }));
      const userData = { id: socket.id!, name: "Anonymous" };
      socket.emit("joinRoom", { roomCode, user: userData });
    });

    socket.on("roomState", (roomState: { participants: Participant[]; messages: ChatMessage[] }) => {
      setState(prev => ({ ...prev, participants: roomState.participants, messages: roomState.messages }));
    });

    socket.on("userJoined", (user: Participant) => {
      setState(prev => ({ ...prev, participants: [...prev.participants, user] }));
    });

    socket.on("userLeft", ({ userId }: { userId: string }) => {
      setState(prev => ({ ...prev, participants: prev.participants.filter(p => p.id !== userId) }));
    });

    socket.on("newMessage", (message: ChatMessage) => {
      setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
    });

    socket.on("reactionAdded", ({ messageId, emoji, userId }: { messageId: string; emoji: string; userId: string }) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions ? { ...msg.reactions } : {};
            if (!reactions[emoji]) reactions[emoji] = [];
            if (!reactions[emoji].includes(userId)) {
              reactions[emoji].push(userId);
            }
            return { ...msg, reactions };
          }
          return msg;
        }),
      }));
    });

    socket.on("typingStatusChanged", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => (p.id === userId ? { ...p, isTyping } : p)),
      }));
    });

    socket.on("disconnect", () => {
      setState(prev => ({ ...prev, isConnected: false }));
    });
  }, [safeEmit]);

  const leaveRoom = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    roomCodeRef.current = null;
    setState({ participants: [], messages: [], isConnected: false });
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!roomCodeRef.current || !socketRef.current) return;
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      senderId: socketRef.current.id!,
      senderName: "Anonymous",
      text,
      timestamp: Date.now(),
    };
    setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
    safeEmit("sendMessage", message);
  }, [safeEmit]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    const userId = socketRef.current?.id ?? "";
    if (!userId) return;
    safeEmit("addReaction", { messageId, emoji, userId });
  }, [safeEmit]);

  const setTyping = useCallback((isTyping: boolean) => {
    const userId = socketRef.current?.id ?? "";
    if (!userId) return;
    safeEmit("setTyping", { userId, isTyping });
  }, [safeEmit]);

  // Provide ------------------------------------------------
  const value: CollaborationContextType = {
    ...state,
    joinRoom,
    leaveRoom,
    sendMessage,
    addReaction,
    setTyping,
  };

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
};

// Hook ----------------------------------------------------
export const useCollaboration = () => {
  const ctx = useContext(CollaborationContext);
  if (!ctx) throw new Error("useCollaboration must be used within a CollaborationProvider");
  return ctx;
}; 