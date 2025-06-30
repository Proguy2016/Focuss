import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CallToolbarProps {
  isLocalMuted: boolean;
  isLocalCameraOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeaveCall: () => void;
  className?: string;
}

export function CallToolbar({
  isLocalMuted,
  isLocalCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onLeaveCall,
  className
}: CallToolbarProps) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-3 p-6 bg-white/90 backdrop-blur-glass border-t border-gray-200/60 shadow-custom",
      className
    )}>
      <Button
        variant={isLocalMuted ? "destructive" : "outline"}
        size="sm"
        onClick={onToggleMute}
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
        onClick={onToggleCamera}
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
        onClick={onToggleScreenShare}
        className={cn(
          "w-11 h-11 p-0 rounded-xl shadow-custom transition-all duration-200",
          isScreenSharing 
            ? "bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow" 
            : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
        )}
      >
        {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
      </Button>

      <div className="w-px h-6 bg-theme-gray/30 mx-2" />

      <Button
        variant="destructive"
        size="sm"
        onClick={onLeaveCall}
        className="w-11 h-11 p-0 rounded-xl bg-theme-red hover:bg-theme-red/80 shadow-custom shadow-glow"
      >
        <Phone className="w-4 h-4" />
      </Button>
    </div>
  );
}