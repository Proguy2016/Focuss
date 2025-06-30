import React from 'react';
import { Users, Wifi, WifiOff, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { cn } from '@/lib/utils';

interface RealtimeCollaborationIndicatorProps {
  location: string;
  className?: string;
}

export function RealtimeCollaborationIndicator({ location, className }: RealtimeCollaborationIndicatorProps) {
  const { 
    activeEdits, 
    isConnected, 
    latency, 
    getActiveEditorsForLocation, 
    hasConflict 
  } = useRealtimeCollaboration();

  const activeEditors = getActiveEditorsForLocation(location);
  const conflict = hasConflict(location);

  if (activeEditors.length === 0 && !conflict) return null;

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="w-3 h-3 text-theme-emerald" />
              ) : (
                <WifiOff className="w-3 h-3 text-theme-red" />
              )}
              <span className="text-xs text-theme-gray-dark">{latency}ms</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connection: {isConnected ? 'Connected' : 'Disconnected'}</p>
            <p>Latency: {latency}ms</p>
          </TooltipContent>
        </Tooltip>

        {/* Active Editors */}
        {activeEditors.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {activeEditors.slice(0, 3).map((editor) => (
                <Tooltip key={editor.id}>
                  <TooltipTrigger>
                    <Avatar className="w-5 h-5 border border-white ring-1 ring-theme-primary/30">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                        {editor.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{editor.userName} is editing</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {activeEditors.length > 3 && (
                <div className="w-5 h-5 bg-theme-gray/20 border border-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-theme-gray-dark">
                    +{activeEditors.length - 3}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-theme-primary rounded-full animate-pulse" />
              <span className="text-xs text-theme-gray-dark">editing</span>
            </div>
          </div>
        )}

        {/* Conflict Indicator */}
        {conflict && (
          <Badge variant="destructive" className="text-xs gap-1 bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30">
            <Clock className="w-3 h-3" />
            Conflict
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}