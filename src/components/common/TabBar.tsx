import React from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTabId, onTabChange, className }: TabBarProps) {
  return (
    <div className={cn("border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50", className)}>
      <nav className="flex space-x-0 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs transition-all duration-200 relative whitespace-nowrap",
              activeTabId === tab.id
                ? "border-theme-primary text-theme-primary bg-gradient-to-t from-theme-primary/10 to-transparent shadow-glow"
                : "border-transparent text-theme-gray-dark hover:text-theme-dark hover:border-theme-primary/50 hover:bg-theme-primary/5"
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span className="font-semibold">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1rem] text-center shadow-custom text-[10px] leading-none",
                activeTabId === tab.id
                  ? "bg-gradient-to-r from-theme-primary to-theme-secondary text-white"
                  : "bg-theme-gray/20 text-theme-gray-dark"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}