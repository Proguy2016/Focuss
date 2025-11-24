import React, { useState, useEffect, useRef } from 'react';
import { FloatingTimer } from './FloatingTimer';
import { TimerSettings, TimerSettingsData } from './TimerSettings';

const FloatingTimerTest: React.FC = () => {
    const [isVisible, setIsVisible] = useState(() => {
        const stored = localStorage.getItem('floatingTimerVisible');
        return stored === null ? true : stored === 'true';
    });

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<TimerSettingsData>(() => {
        const stored = localStorage.getItem('timerSettings');
        return stored ? JSON.parse(stored) : {
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartWork: false,
        };
    });

    const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // Initialize BroadcastChannel for cross-tab communication
        broadcastChannelRef.current = new BroadcastChannel('floatingTimer');

        // Listen for messages from other tabs
        broadcastChannelRef.current.onmessage = (event) => {
            if (event.data.type === 'visibility-change') {
                setIsVisible(event.data.isVisible);
            }
        };

        // Cleanup
        return () => {
            broadcastChannelRef.current?.close();
        };
    }, []);

    // Handle visibility changes and broadcast to other tabs
    const handleVisibilityChange = (newVisibility: boolean) => {
        setIsVisible(newVisibility);
        localStorage.setItem('floatingTimerVisible', String(newVisibility));
        broadcastChannelRef.current?.postMessage({
            type: 'visibility-change',
            isVisible: newVisibility
        });
    };

    // Check for timer visibility in all tabs on load
    useEffect(() => {
        const storedVisibility = localStorage.getItem('floatingTimerVisible');
        if (storedVisibility !== null) {
            handleVisibilityChange(storedVisibility === 'true');
        }
    }, []);

    const handleSaveSettings = (newSettings: TimerSettingsData) => {
        setSettings(newSettings);
        localStorage.setItem('timerSettings', JSON.stringify(newSettings));
        setIsSettingsOpen(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <FloatingTimer
                sessionName="Test Session"
                initialDuration={settings.workDuration * 60}
                onClose={() => handleVisibilityChange(false)}
            />

            <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                    text-white hover:bg-white/10 px-3 py-2 text-sm text-white/80"
                onClick={() => setIsSettingsOpen(true)}
                title="Timer Settings"
                tabIndex={0}
                style={{ transform: 'none' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-settings"
                >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </button>

            <TimerSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={handleSaveSettings}
                initialSettings={settings}
            />
        </>
    );
};

export default FloatingTimerTest; 