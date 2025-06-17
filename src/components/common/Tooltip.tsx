"use client"

import React from 'react';

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="relative inline-block">{children}</div>;

export const TooltipTrigger: React.FC<{ children: React.ReactNode, asChild?: boolean }> = ({ children }) => <>{children}</>;

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute bottom-full mb-2 hidden group-hover:block">
    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2">
      {children}
    </div>
  </div>
); 