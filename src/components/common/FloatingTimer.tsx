import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Play, Pause, Settings } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import { FocusSession } from '../../types';

interface FloatingTimerProps {
    onClose: () => void;
    sessionName?: string;
    initialDuration?: number; // in seconds
    taskId?: string; // Optional task ID to track
}

export const FloatingTimer: React.FC<FloatingTimerProps> = ({
    onClose,
    sessionName = 'Focus Session',
    initialDuration = 25 * 60, // 25 minutes in seconds
    taskId
}) => {
    console.log("FloatingTimer component rendering", { sessionName, initialDuration });

    const { dataService, refreshStats, dispatch } = useApp();

    // Timer state
    const [totalSeconds, setTotalSeconds] = useState(initialDuration);
    const [remainingSeconds, setRemainingSeconds] = useState(initialDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [currentSessionType, setCurrentSessionType] = useState('work'); // 'work', 'shortBreak', 'longBreak'
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [showTaskList, setShowTaskList] = useState(false);
    const [distractions, setDistractions] = useState(0);
    const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Dragging state
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const dragOffset = useRef({ x: 0, y: 0 });

    // Reference for interval
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<HTMLDivElement | null>(null);

    // Get settings from localStorage
    const getTimerSettings = () => {
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || 'default';
        const saved = localStorage.getItem(`focus-ritual-preferences-${userId}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // fallback to defaults
            }
        }
        return {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartWork: false,
            soundEnabled: true
        };
    };

    const settings = getTimerSettings();

    // Example tasks - in a real app you would use your task management system
    const [tasks, setTasks] = useState([
        {
            id: 'task1', title: 'Complete project proposal', completed: false, subtasks: [
                { id: 'subtask1', title: 'Research competitors', completed: true },
                { id: 'subtask2', title: 'Write first draft', completed: false },
                { id: 'subtask3', title: 'Review with team', completed: false },
            ]
        },
        { id: 'task2', title: 'Prepare presentation', completed: false, subtasks: [] },
    ]);

    // Create a focus session when timer starts
    useEffect(() => {
        if (isRunning && currentSessionType === 'work' && !currentSession) {
            const createSession = async () => {
                try {
                    const newSession = await dataService.createFocusSession({
                        startTime: new Date(),
                        endTime: undefined,
                        completed: false,
                        duration: Math.round(totalSeconds / 60), // renamed from plannedDuration
                        actualDuration: 0,
                        type: 'work',
                        userId: JSON.parse(localStorage.getItem('user') || '{}')?.id || 'guest',
                        distractions: 0,
                        productivity: 0
                    });
                    setCurrentSession(newSession);
                    dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
                } catch (error) {
                    console.error('Failed to create focus session:', error);
                }
            };
            createSession();
        }
    }, [isRunning, currentSessionType, currentSession, dataService, dispatch, taskId, sessionName, totalSeconds]);

    // Initialize timer and set up event listeners
    useEffect(() => {
        console.log("FloatingTimer mounted");
        updateTimerDisplay();

        // Handle window resize to keep timer in viewport
        const handleResize = () => {
            if (timerRef.current) {
                const rect = timerRef.current.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                let newPos = { ...position };

                if (rect.right > windowWidth) {
                    newPos.x = windowWidth - rect.width - 20;
                }

                if (rect.bottom > windowHeight) {
                    newPos.y = windowHeight - rect.height - 20;
                }

                if (newPos.x !== position.x || newPos.y !== position.y) {
                    setPosition(newPos);
                }
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            console.log("FloatingTimer unmounting");
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle mouse events for dragging
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();

            const newX = e.clientX - dragOffset.current.x;
            const newY = e.clientY - dragOffset.current.y;

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            if (!isDragging) return;

            document.body.style.cursor = 'auto';
            document.body.style.userSelect = 'auto';

            // Snap to edges if near
            if (timerRef.current) {
                const rect = timerRef.current.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                let newPos = { ...position };

                if (rect.left < 50) {
                    newPos.x = 20;
                }

                if (rect.top < 50) {
                    newPos.y = 20;
                }

                if (windowWidth - rect.right < 50) {
                    newPos.x = windowWidth - rect.width - 20;
                }

                if (windowHeight - rect.bottom < 50) {
                    newPos.y = windowHeight - rect.height - 20;
                }

                setPosition(newPos);
            }

            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, position]);

    // Update timer display and progress circle
    const updateTimerDisplay = () => {
        // Update progress circle
        const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 163.36;
        const progressPercentage = Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100);

        return {
            minutes: Math.floor(remainingSeconds / 60).toString().padStart(2, '0'),
            seconds: (remainingSeconds % 60).toString().padStart(2, '0'),
            progress,
            progressPercentage,
        };
    };

    // Timer functions
    const toggleTimer = () => {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    };

    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);

            timerIntervalRef.current = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current as NodeJS.Timeout);
                        sessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const pauseTimer = () => {
        if (isRunning) {
            setIsRunning(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }
    };

    const resetTimer = () => {
        pauseTimer();
        setRemainingSeconds(totalSeconds);
    };

    const playNotificationSound = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio failed to play:', e));
    };

    const sessionComplete = async () => {
        // Play completion sound
        playNotificationSound();

        if (currentSessionType === 'work' && currentSession) {
            // Complete current work session
            const completedSession: FocusSession = {
                ...currentSession,
                completed: true,
                endTime: new Date(),
                actualDuration: Math.floor((new Date().getTime() - new Date(currentSession.startTime).getTime()) / 60000),
                distractions,
                productivity: 10 // Can implement user rating here
            };

            // Update any additional fields if needed
            if (!completedSession.type) {
                completedSession.type = 'work';
            }

            try {
                await dataService.updateFocusSession(completedSession);
                dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
                setCurrentSession(null);
            } catch (error) {
                console.error('Failed to save focus session:', error);
            }

            // --- API CALLS TO UPDATE SESSION AND FOCUS TIME ---
            try {
                // Increment session count
                await api.put('/api/stats/session');

                // Increment focus time (in minutes)
                await api.put('/api/stats/hours', {
                    time: Math.round(totalSeconds / 60),
                    distractions: distractions
                });

                // Refresh stats in real time
                await refreshStats();
            } catch (apiError) {
                console.error('Failed to update stats on server:', apiError);
            }
            // --- END API CALLS ---

            const newSessionsCompleted = sessionsCompleted + 1;
            setSessionsCompleted(newSessionsCompleted);

            // Determine next session type
            if (newSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
                setCurrentSessionType('longBreak');
                setTotalSeconds(settings.longBreakDuration * 60);
                setRemainingSeconds(settings.longBreakDuration * 60);
            } else {
                setCurrentSessionType('shortBreak');
                setTotalSeconds(settings.shortBreakDuration * 60);
                setRemainingSeconds(settings.shortBreakDuration * 60);
            }

            // Auto-start breaks if enabled
            if (settings.autoStartBreaks) {
                setIsRunning(true);
            }
        } else {
            // Break is over, start work session
            setCurrentSessionType('work');
            setTotalSeconds(settings.workDuration * 60);
            setRemainingSeconds(settings.workDuration * 60);
            setDistractions(0);

            // Auto-start work if enabled
            if (settings.autoStartWork) {
                setIsRunning(true);
            }
        }
    };

    // Improved draggable functions
    const startDrag = (e: React.MouseEvent) => {
        // Don't drag if clicking on buttons or controls
        if (
            e.target instanceof Element &&
            (e.target.closest('button') || e.target.closest('.floating-timer-options'))
        ) {
            return;
        }

        e.preventDefault();

        // Change cursor and disable text selection during drag
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';

        // Calculate the offset between mouse position and timer position
        if (timerRef.current) {
            const rect = timerRef.current.getBoundingClientRect();
            dragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        setIsDragging(true);
    };

    // Mouse enter/leave handlers for showing controls
    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        if (!isDragging) {
            setIsHovered(false);
        }
    };

    // Task handlers
    const toggleTaskCompletion = (taskId: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? {
                    ...task,
                    subtasks: task.subtasks.map(subtask =>
                        subtask.id === subtaskId
                            ? { ...subtask, completed: !subtask.completed }
                            : subtask
                    )
                }
                : task
        ));
    };

    // Get timer display values
    const display = updateTimerDisplay();

    // Get session color based on type
    const getSessionColor = () => {
        switch (currentSessionType) {
            case 'shortBreak':
                return '#34d399'; // emerald
            case 'longBreak':
                return '#f59e0b'; // yellow
            default:
                return '#04d9d9'; // primary
        }
    };

    // Get current session name
    const getSessionName = () => {
        switch (currentSessionType) {
            case 'shortBreak':
                return 'Short Break';
            case 'longBreak':
                return 'Long Break';
            default:
                return sessionName;
        }
    };

    console.log("FloatingTimer rendering with position:", position);

    const defaultBackgroundColor = 'rgba(0, 32, 36, 0.7)';
    const defaultPrimaryColor = '#04d9d9';
    const defaultGrayColor = '#bdbdbd';

    return (
        <div
            ref={timerRef}
            className="floating-timer"
            style={{
                position: 'fixed',
                zIndex: 99999, // Extra high z-index to ensure visibility
                top: position.y,
                left: position.x,
                width: '280px',
                background: defaultBackgroundColor,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                transition: isDragging ? 'none' : 'all 0.2s ease',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                ...(isRunning ? { boxShadow: '0 0 15px rgba(4, 217, 217, 0.5)' } : {})
            }}
            onMouseDown={startDrag}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#002024', // Explicit color instead of var(--dark)
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 1,
                }}
                onClick={() => setShowTaskList(!showTaskList)}
            >
                <Settings size={16} />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <div style={{
                    fontWeight: 600,
                    color: defaultPrimaryColor,
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                }}>
                    {getSessionName()}
                </div>
                <div
                    style={{
                        color: defaultGrayColor,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onClick={onClose}
                >
                    <X size={16} />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <svg width="60" height="60" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                        <circle
                            cx="30"
                            cy="30"
                            r="26"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="4"
                            fill="none"
                        />
                        <circle
                            cx="30"
                            cy="30"
                            r="26"
                            stroke={getSessionColor()}
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="163.36"
                            strokeDashoffset={163.36 - display.progress}
                            style={{ transition: 'stroke-dashoffset 0.3s' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: getSessionColor(),
                    }}>
                        {display.progressPercentage}%
                    </div>
                </div>

                <div style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    textAlign: 'center',
                    margin: '12px 0',
                    color: getSessionColor(),
                    fontFamily: '"Courier New", monospace',
                }}>
                    {display.minutes}:{display.seconds}
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                pointerEvents: isHovered ? 'auto' : 'none', // Disable interaction when hidden
                height: isHovered ? 'auto' : '0',
                overflow: 'hidden',
            }}>
                <button
                    onClick={resetTimer}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#ffffff', // Explicit color instead of var(--light)
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                    }}
                >
                    <RotateCcw size={16} />
                    Reset
                </button>
                <button
                    onClick={toggleTimer}
                    style={{
                        background: getSessionColor(),
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#002024', // Explicit color instead of var(--dark)
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                    }}
                >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    {isRunning ? 'Pause' : 'Start'}
                </button>
            </div>

            <div style={{
                maxHeight: showTaskList ? '300px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
                marginTop: showTaskList ? '12px' : '0',
                overflowY: showTaskList ? 'auto' : 'hidden',
            }}>
                {tasks.map(task => (
                    <div key={task.id}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            borderRadius: '6px',
                            marginBottom: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                        }}>
                            <input
                                type="checkbox"
                                id={task.id}
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(task.id)}
                                style={{ marginRight: '8px' }}
                            />
                            <label
                                htmlFor={task.id}
                                style={{
                                    fontSize: '13px',
                                    flexGrow: 1,
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? defaultGrayColor : '#ffffff',
                                }}
                            >
                                {task.title}
                            </label>
                        </div>

                        {task.subtasks.length > 0 && (
                            <div style={{ marginLeft: '20px', marginTop: '4px' }}>
                                {task.subtasks.map(subtask => (
                                    <div
                                        key={subtask.id}
                                        style={{
                                            fontSize: '12px',
                                            color: subtask.completed ? '#888888' : defaultGrayColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '4px 0',
                                            textDecoration: subtask.completed ? 'line-through' : 'none',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            id={subtask.id}
                                            checked={subtask.completed}
                                            onChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                            style={{ marginRight: '6px' }}
                                        />
                                        <label htmlFor={subtask.id}>
                                            {subtask.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}; 