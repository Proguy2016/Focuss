import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface TimerState {
    isActive: boolean;
    isRunning: boolean;
    sessionName: string;
    totalDuration: number; // in seconds
    timeRemaining: number; // in seconds
    sessionType: 'work' | 'shortBreak' | 'longBreak';
}

interface FloatingTimerContextType {
    timerState: TimerState;
    startTimer: (sessionName: string, duration: number, sessionType?: 'work' | 'shortBreak' | 'longBreak') => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
}

const FloatingTimerContext = createContext<FloatingTimerContextType>({
    timerState: {
        isActive: false,
        isRunning: false,
        sessionName: 'Focus Session',
        totalDuration: 25 * 60,
        timeRemaining: 25 * 60,
        sessionType: 'work',
    },
    startTimer: () => { },
    pauseTimer: () => { },
    resumeTimer: () => { },
    stopTimer: () => { },
    resetTimer: () => { },
});

export const FloatingTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [timerState, setTimerState] = useState<TimerState>({
        isActive: false,
        isRunning: false,
        sessionName: 'Focus Session',
        totalDuration: 25 * 60,
        timeRemaining: 25 * 60,
        sessionType: 'work',
    });

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Timer countdown effect
    useEffect(() => {
        if (timerState.isRunning && timerState.timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimerState(prev => ({
                    ...prev,
                    timeRemaining: Math.max(0, prev.timeRemaining - 1),
                }));
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerState.isRunning, timerState.timeRemaining]);

    const startTimer = (sessionName: string, duration: number, sessionType: 'work' | 'shortBreak' | 'longBreak' = 'work') => {
        console.log("startTimer called", { sessionName, duration, sessionType });
        setTimerState({
            isActive: true,
            isRunning: true,
            sessionName,
            totalDuration: duration,
            timeRemaining: duration,
            sessionType,
        });
    };

    const pauseTimer = () => {
        console.log("pauseTimer called");
        setTimerState(prev => ({ ...prev, isRunning: false }));
    };

    const resumeTimer = () => {
        console.log("resumeTimer called");
        setTimerState(prev => ({ ...prev, isRunning: true }));
    };

    const stopTimer = () => {
        console.log("stopTimer called");
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTimerState({
            isActive: false,
            isRunning: false,
            sessionName: 'Focus Session',
            totalDuration: 25 * 60,
            timeRemaining: 25 * 60,
            sessionType: 'work',
        });
    };

    const resetTimer = () => {
        console.log("resetTimer called");
        setTimerState(prev => ({
            ...prev,
            timeRemaining: prev.totalDuration,
            isRunning: false,
        }));
    };

    return (
        <FloatingTimerContext.Provider value={{
            timerState,
            startTimer,
            pauseTimer,
            resumeTimer,
            stopTimer,
            resetTimer
        }}>
            {children}
        </FloatingTimerContext.Provider>
    );
};

export const useFloatingTimer = () => useContext(FloatingTimerContext); 