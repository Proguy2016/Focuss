import { useState, useCallback, useRef, useEffect } from 'react';

export interface ConferenceParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  joinedAt: Date;
  role?: string;
}

export interface ConferenceSettings {
  allowParticipantMute: boolean;
  allowParticipantVideo: boolean;
  allowScreenShare: boolean;
  recordMeeting: boolean;
  enableChat: boolean;
  enableReactions: boolean;
  maxParticipants: number;
  requireApproval: boolean;
  enableWaitingRoom: boolean;
}

export interface ConferenceStats {
  duration: number;
  participantCount: number;
  messagesCount: number;
  screenshareTime: number;
  recordingSize?: number;
}

export function useVideoConference() {
  const [isInConference, setIsInConference] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<ConferenceParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [isLocalCameraOff, setIsLocalCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conferenceId, setConferenceId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConferenceSettings>({
    allowParticipantMute: true,
    allowParticipantVideo: true,
    allowScreenShare: true,
    recordMeeting: false,
    enableChat: true,
    enableReactions: true,
    maxParticipants: 50,
    requireApproval: false,
    enableWaitingRoom: false,
  });
  const [stats, setStats] = useState<ConferenceStats>({
    duration: 0,
    participantCount: 0,
    messagesCount: 0,
    screenshareTime: 0,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);

  // Start conference
  const startConference = useCallback(async (meetingId?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setLocalStream(stream);
      setIsInConference(true);
      setIsHost(true);
      setConferenceId(meetingId || `conf-${Date.now()}`);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate other participants joining
      setTimeout(() => {
        setParticipants([
          {
            id: '2',
            name: 'Marcus Johnson',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            isHost: false,
            isMuted: false,
            isCameraOff: false,
            isScreenSharing: false,
            connectionQuality: 'excellent',
            joinedAt: new Date(),
            role: 'Backend Developer',
          },
          {
            id: '3',
            name: 'Elena Rodriguez',
            avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            isHost: false,
            isMuted: true,
            isCameraOff: false,
            isScreenSharing: false,
            connectionQuality: 'good',
            joinedAt: new Date(Date.now() - 30000),
            role: 'UX Designer',
          },
        ]);
      }, 2000);

    } catch (error) {
      console.error('Failed to start conference:', error);
    }
  }, []);

  // Join existing conference
  const joinConference = useCallback(async (conferenceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setLocalStream(stream);
      setIsInConference(true);
      setIsHost(false);
      setConferenceId(conferenceId);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to join conference:', error);
    }
  }, []);

  // Leave conference
  const leaveConference = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    setLocalStream(null);
    setIsInConference(false);
    setIsHost(false);
    setParticipants([]);
    setConferenceId(null);
    setIsScreenSharing(false);
    setIsRecording(false);
  }, [localStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsLocalMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsLocalCameraOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = screenStream;
      }
      
      setIsScreenSharing(true);
      
      // Stop screen sharing when user stops it from browser
      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenShareRef.current && screenShareRef.current.srcObject) {
      const stream = screenShareRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      screenShareRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
  }, []);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

  // Mute participant (host only)
  const muteParticipant = useCallback((participantId: string) => {
    if (!isHost) return;
    
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, isMuted: true } : p
    ));
  }, [isHost]);

  // Remove participant (host only)
  const removeParticipant = useCallback((participantId: string) => {
    if (!isHost) return;
    
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  }, [isHost]);

  // Update conference settings
  const updateSettings = useCallback((newSettings: Partial<ConferenceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Update stats
  useEffect(() => {
    if (!isInConference) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        duration: prev.duration + 1,
        participantCount: participants.length + 1, // +1 for local user
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isInConference, participants.length]);

  return {
    // State
    isInConference,
    isHost,
    participants,
    localStream,
    isLocalMuted,
    isLocalCameraOff,
    isScreenSharing,
    isRecording,
    conferenceId,
    settings,
    stats,
    
    // Refs
    localVideoRef,
    screenShareRef,
    
    // Actions
    startConference,
    joinConference,
    leaveConference,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    toggleRecording,
    muteParticipant,
    removeParticipant,
    updateSettings,
  };
}