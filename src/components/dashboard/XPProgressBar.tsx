import React from 'react';

interface XPProgressBarProps {
  level: number;
  xp: number;
  nextLevelXp: number;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ level, xp, nextLevelXp }) => {
  const progress = nextLevelXp > 0 ? (xp / nextLevelXp) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-primary-300">Level {level}</span>
        <span className="text-sm text-white/70">{xp} / {nextLevelXp} XP</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-primary-500 h-2.5 rounded-full"
          style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
        ></div>
      </div>
    </div>
  );
}; 