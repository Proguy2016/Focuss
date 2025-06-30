import React from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VideoTileProps {
  userId: string;
  name: string;
  avatar?: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isCurrentUser?: boolean;
  className?: string;
}

export function VideoTile({ 
  userId, 
  name, 
  avatar, 
  isMuted = false, 
  isCameraOff = false,
  isCurrentUser = false,
  className 
}: VideoTileProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={cn(
      "relative bg-gradient-to-br from-theme-dark to-theme-slate-dark rounded-xl overflow-hidden aspect-video shadow-custom-lg",
      isCurrentUser && "ring-2 ring-theme-primary ring-offset-2 shadow-glow",
      className
    )}>
      {/* Video placeholder or avatar */}
      <div className="w-full h-full flex items-center justify-center">
        {isCameraOff ? (
          <Avatar className="w-16 h-16 ring-2 ring-white/20 shadow-custom">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-secondary text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-theme-dark to-theme-slate-dark flex items-center justify-center">
            <Video className="w-8 h-8 text-theme-gray" />
          </div>
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <span className="text-white text-sm font-semibold bg-theme-glass backdrop-blur-glass px-3 py-1.5 rounded-lg truncate shadow-custom">
          {isCurrentUser ? 'You' : name}
        </span>
        <div className="flex items-center gap-2">
          {isMuted ? (
            <div className="bg-theme-red/90 backdrop-blur-glass p-1.5 rounded-lg shadow-custom">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="bg-theme-emerald/90 backdrop-blur-glass p-1.5 rounded-lg shadow-custom">
              <Mic className="w-3 h-3 text-white" />
            </div>
          )}
          {isCameraOff && (
            <div className="bg-theme-red/90 backdrop-blur-glass p-1.5 rounded-lg shadow-custom">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}