import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFloatingTimer } from '../../contexts/FloatingTimerContext';

export const NavbarTimer: React.FC = () => {
    const { timerState, pauseTimer, resumeTimer } = useFloatingTimer();
    const navigate = useNavigate();

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimerClick = () => {
        navigate('/focus');
    };

    const handlePlayPauseClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking play/pause
        if (timerState.isRunning) {
            pauseTimer();
        } else {
            resumeTimer();
        }
    };

    const progress = ((timerState.totalDuration - timerState.timeRemaining) / timerState.totalDuration) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-3 glass px-4 py-2 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
            onClick={handleTimerClick}
            title="Click to view Focus Timer"
        >
            {/* Circular Progress Indicator */}
            <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-white/20"
                    />
                    <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 16}`}
                        strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                        className={`transition-all duration-1000 ${timerState.sessionType === 'work'
                                ? 'text-emerald-400'
                                : timerState.sessionType === 'shortBreak'
                                    ? 'text-blue-400'
                                    : 'text-purple-400'
                            }`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white/80" />
                </div>
            </div>

            {/* Timer Info */}
            <div className="flex flex-col">
                <span className="text-xs text-white/60 font-medium">
                    {timerState.sessionType === 'work'
                        ? 'Focus'
                        : timerState.sessionType === 'shortBreak'
                            ? 'Short Break'
                            : 'Long Break'
                    }
                </span>
                <span className="text-sm font-bold text-white">
                    {formatTime(timerState.timeRemaining)}
                </span>
            </div>

            {/* Play/Pause Button */}
            <button
                onClick={handlePlayPauseClick}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title={timerState.isRunning ? 'Pause' : 'Resume'}
            >
                {timerState.isRunning ? (
                    <Pause className="w-4 h-4 text-white/80" />
                ) : (
                    <Play className="w-4 h-4 text-white/80" />
                )}
            </button>

            {/* Pulsing indicator when running */}
            {timerState.isRunning && (
                <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </motion.div>
    );
};
