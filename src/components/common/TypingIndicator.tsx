import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  userNames: string[];
  className?: string;
}

export function TypingIndicator({ userNames, className }: TypingIndicatorProps) {
  if (userNames.length === 0) return null;

  const text = userNames.length === 1 
    ? `${userNames[0]} is typing...`
    : userNames.length === 2
    ? `${userNames[0]} and ${userNames[1]} are typing...`
    : `${userNames[0]} and ${userNames.length - 1} others are typing...`;

  return (
    <div className={cn("flex items-center gap-2 text-sm text-theme-gray-dark", className)}>
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="italic">{text}</span>
    </div>
  );
}