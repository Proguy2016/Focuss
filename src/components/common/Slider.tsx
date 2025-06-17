"use client"
import React from 'react';

interface SliderProps {
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className = '',
  disabled = false
}) => {
  const [value, setValue] = React.useState(defaultValue[0]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={`relative flex w-full touch-none select-none items-center ${className}`}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-600">
        <div 
          className="absolute h-full bg-primary" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
      />
      <div 
        className="absolute h-5 w-5 rounded-full border-2 border-primary bg-white"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
}; 