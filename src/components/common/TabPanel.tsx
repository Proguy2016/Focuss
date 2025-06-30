import React from 'react';
import { cn } from '@/lib/utils';

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <div className={cn("flex-1 p-4 overflow-hidden", className)}>
      {children}
    </div>
  );
}