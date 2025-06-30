import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveCursorProps {
  userName: string;
  x: number;
  y: number;
  color?: string;
}

export function LiveCursor({ userName, x, y, color = '#04d9d9' }: LiveCursorProps) {
  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-100 ease-out"
      style={{
        left: x,
        top: y,
        transform: 'translate(-2px, -2px)',
      }}
    >
      <div className="relative">
        <MousePointer2 
          className="w-5 h-5 drop-shadow-lg" 
          style={{ color }}
          fill={color}
        />
        <div 
          className="absolute top-5 left-3 px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg whitespace-nowrap"
          style={{ backgroundColor: color }}
        >
          {userName}
        </div>
      </div>
    </div>
  );
}