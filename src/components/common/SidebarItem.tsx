import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function SidebarItem({ 
  icon, 
  label, 
  isActive = false, 
  onClick, 
  children,
  className 
}: SidebarItemProps) {
  return (
    <div className={cn("group", className)}>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
          "hover:bg-theme-primary/10 active:bg-theme-primary/20",
          isActive && "bg-gradient-to-r from-theme-primary/20 to-theme-secondary/10 text-theme-primary-dark font-semibold border border-theme-primary/30 shadow-glow",
          !isActive && "text-theme-gray-dark hover:text-theme-dark"
        )}
      >
        {icon && <span className="flex-shrink-0 text-current">{icon}</span>}
        <span className="flex-1 text-left truncate">{label}</span>
      </button>
      {children && (
        <div className="ml-6 mt-1">
          {children}
        </div>
      )}
    </div>
  );
}