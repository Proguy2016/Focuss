import { useState, useCallback } from 'react';

export interface RemoteStream {
  userId: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
}

export function useCall() {
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [isLocalCameraOff, setIsLocalCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  
  const [remoteStreams] = useState<RemoteStream[]>([
    { userId: '1', stream: null, isMuted: false, isCameraOff: false },
    { userId: '2', stream: null, isMuted: true, isCameraOff: false },
    { userId: '4', stream: null, isMuted: false, isCameraOff: true },
  ]);

  const toggleMute = useCallback(() => {
    setIsLocalMuted(prev => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    setIsLocalCameraOff(prev => !prev);
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing(prev => !prev);
  }, []);

  const leaveCall = useCallback(() => {
    setIsCallActive(false);
  }, []);

  const joinCall = useCallback(() => {
    setIsCallActive(true);
  }, []);

  return {
    isLocalMuted,
    isLocalCameraOff,
    isScreenSharing,
    isCallActive,
    remoteStreams,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    leaveCall,
    joinCall,
  };
}