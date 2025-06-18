import React from 'react';

interface CircularProgressBarProps {
  progress: number;
  size: number;
  strokeWidth: number;
  gradient: string;
  children?: React.ReactNode;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ progress, size, strokeWidth, gradient, children }) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-gray-700"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-500)" />
            <stop offset="100%" stopColor="var(--color-secondary-500)" />
          </linearGradient>
        </defs>
        <circle
          className="text-primary-500"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div className="absolute text-center">
        {children}
      </div>
    </div>
  );
}; 