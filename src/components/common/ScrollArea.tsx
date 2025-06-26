import React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  children, 
  className = '', 
  maxHeight = '400px' 
}) => {
  return (
    <div 
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${className}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}; 