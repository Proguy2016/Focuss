import React, { createContext, useContext, useState } from 'react';
import { FloatingTimer } from '../components/common/FloatingTimer';

interface TimerState {
    isVisible: boolean;
    sessionName: string;
    duration: number; // in seconds
}

interface FloatingTimerContextType {
    timerState: TimerState;
    showTimer: (sessionName?: string, duration?: number) => void;
    hideTimer: () => void;
}

const FloatingTimerContext = createContext<FloatingTimerContextType>({
    timerState: {
        isVisible: false,
        sessionName: 'Focus Session',
        duration: 25 * 60, // 25 minutes in seconds
    },
    showTimer: () => { },
    hideTimer: () => { },
});

export const FloatingTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [timerState, setTimerState] = useState<TimerState>({
        isVisible: false,
        sessionName: 'Focus Session',
        duration: 25 * 60, // 25 minutes in seconds
    });

    const showTimer = (sessionName?: string, duration?: number) => {
        console.log("showTimer called", { sessionName, duration });
        setTimerState({
            isVisible: true,
            sessionName: sessionName || 'Focus Session',
            duration: duration || 25 * 60,
        });
    };

    const hideTimer = () => {
        console.log("hideTimer called");
        setTimerState(prev => ({ ...prev, isVisible: false }));
    };

    console.log("FloatingTimerProvider rendering with state:", timerState);

    return (
        <FloatingTimerContext.Provider value={{ timerState, showTimer, hideTimer }}>
            {children}
            {timerState.isVisible && (
                <FloatingTimer
                    sessionName={timerState.sessionName}
                    initialDuration={timerState.duration}
                    onClose={hideTimer}
                />
            )}
        </FloatingTimerContext.Provider>
    );
};

export const useFloatingTimer = () => useContext(FloatingTimerContext); 