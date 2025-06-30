import React, { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, Settings, Users, MessageSquare, Hand, Smile, MoreHorizontal, Volume2, VolumeX, SwordIcon as Record, Square, UserPlus, Shield, Clock, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useVideoConference } from '@/hooks/useVideoConference';
import { cn } from '@/lib/utils';

interface ConferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ConferencePanel({ isOpen, onClose, className }: ConferencePanelProps) {
  const {
    isInConference,
    isHost,
    participants,
    isLocalMuted,
    isLocalCameraOff,
    isScreenSharing,
    isRecording,
    stats,
    settings,
    localVideoRef,
    screenShareRef,
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
  } = useVideoConference();

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [volume, setVolume] = useState([80]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-theme-emerald';
      case 'good': return 'text-theme-yellow';
      case 'poor': return 'text-theme-red';
      default: return 'text-theme-gray';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-96 animated-bg border-l border-white/10 shadow-custom-lg flex flex-col z-50",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Conference</h3>
            {isInConference && (
              <div className="flex items-center gap-2 text-xs text-gray">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(stats.duration)}</span>
                {isRecording && (
                  <>
                    <div className="w-1 h-1 bg-theme-red rounded-full animate-pulse" />
                    <span className="text-theme-red">Recording</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray hover:text-white">
          <Phone className="w-4 h-4" />
        </Button>
      </div>

      {!isInConference ? (
        /* Pre-Conference State */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-theme-primary/20 to-theme-secondary/20 rounded-2xl flex items-center justify-center shadow-custom">
              <Video className="w-10 h-10 text-theme-primary" />
            </div>
            <h3 className="font-bold text-white mb-2">Start or Join Conference</h3>
            <p className="text-gray leading-relaxed">
              Connect with your team through high-quality video conferencing
            </p>
          </div>

          <div className="space-y-3 w-full">
            <Button 
              onClick={() => startConference()}
              className="w-full gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
            >
              <Video className="w-4 h-4" />
              Start New Conference
            </Button>
            <Button 
              onClick={() => joinConference('existing-meeting')}
              variant="outline"
              className="w-full gap-2 border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
            >
              <UserPlus className="w-4 h-4" />
              Join Existing Conference
            </Button>
          </div>
        </div>
      ) : (
        /* In-Conference State */
        <>
          {/* Video Grid */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Local Video */}
            <div className="relative bg-gradient-to-br from-theme-dark to-theme-slate-dark rounded-xl overflow-hidden aspect-video shadow-custom">
              {!isLocalCameraOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Avatar className="w-16 h-16 ring-2 ring-white/20 shadow-custom">
                    <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-secondary text-white text-lg font-bold">
                      You
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                <Badge className="bg-theme-glass backdrop-blur-glass text-white border-white/20">
                  You {isHost && '(Host)'}
                </Badge>
                <div className="flex items-center gap-2">
                  {isLocalMuted && (
                    <div className="bg-theme-red/90 backdrop-blur-glass p-1.5 rounded-lg shadow-custom">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isLocalCameraOff && (
                    <div className="bg-theme-red/90 backdrop-blur-glass p-1.5 rounded-lg shadow-custom">
                      <VideoOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Screen Share */}
            {isScreenSharing && (
              <div className="relative bg-theme-dark rounded-xl overflow-hidden aspect-video shadow-custom">
                <video
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-theme-glass backdrop-blur-glass text-white border-white/20 gap-2">
                    <Monitor className="w-3 h-3" />
                    Screen Share
                  </Badge>
                </div>
              </div>
            )}

            {/* Remote Participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="relative bg-gradient-to-br from-theme-dark to-theme-slate-dark rounded-xl overflow-hidden aspect-video shadow-custom">
                {!participant.isCameraOff ? (
                  <div className="w-full h-full bg-gradient-to-br from-theme-dark to-theme-slate-dark flex items-center justify-center">
                    <Video className="w-8 h-8 text-theme-gray" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Avatar className="w-16 h-16 ring-2 ring-white/20 shadow-custom">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-secondary text-white text-lg font-bold">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-theme-glass backdrop-blur-glass text-white border-white/20">
                      {participant.name}
                    </Badge>
                    <Signal className={cn("w-3 h-3", getConnectionQualityColor(participant.connectionQuality))} />
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.isMuted && (
                      <div className="bg-theme-red/90 backdrop-blur-glass p-1.5 rounded-lg shadow-custom">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {participant.isCameraOff && (
                      <div className="bg-theme-red/90 backdrop-blur-glass p-1.5 rounded-lg shadow-custom">
                        <VideoOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {isHost && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-6 h-6 p-0 bg-theme-glass backdrop-blur-glass hover:bg-white/20">
                            <MoreHorizontal className="w-3 h-3 text-white" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-dark border-white/10" align="end">
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start gap-2 text-white hover:bg-theme-primary/10"
                              onClick={() => muteParticipant(participant.id)}
                            >
                              <MicOff className="w-4 h-4" />
                              Mute
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start gap-2 text-theme-red hover:text-theme-red hover:bg-theme-red/10"
                              onClick={() => removeParticipant(participant.id)}
                            >
                              <Phone className="w-4 h-4" />
                              Remove
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conference Controls */}
          <div className="border-t border-white/10 p-4 bg-dark/50 backdrop-blur-glass">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Button
                variant={isLocalMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
                className={cn(
                  "w-11 h-11 p-0 rounded-xl shadow-custom transition-all duration-200",
                  isLocalMuted 
                    ? "bg-theme-red hover:bg-theme-red/80 text-white border-theme-red shadow-glow" 
                    : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
                )}
              >
                {isLocalMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Button
                variant={isLocalCameraOff ? "destructive" : "outline"}
                size="sm"
                onClick={toggleCamera}
                className={cn(
                  "w-11 h-11 p-0 rounded-xl shadow-custom transition-all duration-200",
                  isLocalCameraOff 
                    ? "bg-theme-red hover:bg-theme-red/80 text-white border-theme-red shadow-glow" 
                    : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
                )}
              >
                {isLocalCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </Button>

              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="sm"
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className={cn(
                  "w-11 h-11 p-0 rounded-xl shadow-custom transition-all duration-200",
                  isScreenSharing 
                    ? "bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow" 
                    : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
                )}
              >
                {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </Button>

              {isHost && (
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                  className={cn(
                    "w-11 h-11 p-0 rounded-xl shadow-custom transition-all duration-200",
                    isRecording 
                      ? "bg-theme-red hover:bg-theme-red/80 text-white border-theme-red shadow-glow" 
                      : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
                  )}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Record className="w-4 h-4" />}
                </Button>
              )}

              <div className="w-px h-6 bg-white/10 mx-2" />

              <Button
                variant="destructive"
                size="sm"
                onClick={leaveConference}
                className="w-11 h-11 p-0 rounded-xl bg-theme-red hover:bg-theme-red/80 shadow-custom shadow-glow"
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2 text-gray hover:text-white">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{participants.length + 1}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-gray hover:text-white">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-gray hover:text-white">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-dark border-white/10" align="end">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-white">Volume</label>
                        <div className="flex items-center gap-3 mt-2">
                          <VolumeX className="w-4 h-4 text-gray" />
                          <Slider
                            value={volume}
                            onValueChange={setVolume}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Volume2 className="w-4 h-4 text-gray" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {isHost && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray hover:text-white">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-dark border-white/10" align="end">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Conference Settings</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-white">Allow participant mute</label>
                            <Switch 
                              checked={settings.allowParticipantMute}
                              onCheckedChange={(checked) => updateSettings({ allowParticipantMute: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-white">Allow screen sharing</label>
                            <Switch 
                              checked={settings.allowScreenShare}
                              onCheckedChange={(checked) => updateSettings({ allowScreenShare: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-white">Enable waiting room</label>
                            <Switch 
                              checked={settings.enableWaitingRoom}
                              onCheckedChange={(checked) => updateSettings({ enableWaitingRoom: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-white">Record meeting</label>
                            <Switch 
                              checked={settings.recordMeeting}
                              onCheckedChange={(checked) => updateSettings({ recordMeeting: checked })}
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}