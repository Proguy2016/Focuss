import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
}

interface PresenceAvatarGroupProps {
  participants: Participant[];
  maxVisible?: number;
  className?: string;
}

export function PresenceAvatarGroup({ 
  participants, 
  maxVisible = 5, 
  className 
}: PresenceAvatarGroupProps) {
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = Math.max(0, participants.length - maxVisible);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-theme-emerald ring-theme-emerald/20';
      case 'away':
        return 'bg-theme-yellow ring-theme-yellow/20';
      default:
        return 'bg-theme-gray ring-theme-gray/20';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visibleParticipants.map((participant) => (
        <div key={participant.id} className="relative">
          <Avatar className="w-9 h-9 border-2 border-white shadow-custom ring-1 ring-gray-200/50">
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
              {getInitials(participant.name)}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ring-2 shadow-custom",
            getStatusColor(participant.status)
          )} />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="relative">
          <Avatar className="w-9 h-9 border-2 border-white shadow-custom bg-theme-gray/20 ring-1 ring-gray-200/50">
            <AvatarFallback className="text-xs font-bold text-theme-gray-dark">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}