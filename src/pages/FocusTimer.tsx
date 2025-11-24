import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Brain, Target, Clock, Zap, SkipForward, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useFloatingTimer } from '../contexts/FloatingTimerContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { FocusSession } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgressBar } from '../components/common/CircularProgressBar';
import api from '../services/api';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  volume: number;
}

export const FocusTimer: React.FC = () => {
  const { state, dispatch, dataService, refreshStats } = useApp();
  const { startTimer, pauseTimer, resumeTimer, stopTimer, resetTimer: resetContextTimer, timerState } = useFloatingTimer();
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [currentTask, setCurrentTask] = useState<{ id: string; title: string } | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { user } = useAuth();
  const LOCAL_STORAGE_PREFS_KEY = `focus-ritual-preferences-${user?.id || 'default'}`;

  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    volume: 50,
  });

  // Helper to get preferences from localStorage
  const getLocalPreferences = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFS_KEY);
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
      soundEnabled: true,
      ambientVolume: 60,
      focusMusic: 'nature',
      weekStartsOn: 'monday',
      timeFormat: '24h',
      dateFormat: 'MM/DD/YYYY',
    };
  };

  // On mount, always use the latest preferences from localStorage
  useEffect(() => {
    const prefs = getLocalPreferences();
    setSettings(prev => ({ ...prev, ...prefs }));
    // Also update timer if not running
    if (!isRunning) {
      if (sessionType === 'work') setTimeLeft((prefs.workDuration || 25) * 60);
      else if (sessionType === 'shortBreak') setTimeLeft((prefs.shortBreakDuration || 5) * 60);
      else if (sessionType === 'longBreak') setTimeLeft((prefs.longBreakDuration || 15) * 60);
    }
    // Listen for storage changes (other tabs/windows)
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_PREFS_KEY) {
        const newPrefs = getLocalPreferences();
        setSettings(prev => ({ ...prev, ...newPrefs }));
        if (!isRunning) {
          if (sessionType === 'work') setTimeLeft((newPrefs.workDuration || 25) * 60);
          else if (sessionType === 'shortBreak') setTimeLeft((newPrefs.shortBreakDuration || 5) * 60);
          else if (sessionType === 'longBreak') setTimeLeft((newPrefs.longBreakDuration || 15) * 60);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line
  }, [user?.id, sessionType, isRunning]);

  useEffect(() => {
    // If a task was passed from the Tasks page, set it as the current task
    if (location.state?.taskId && location.state?.taskTitle) {
      setCurrentTask({ id: location.state.taskId, title: location.state.taskTitle });
      // Clear location state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Initialize timer based on session type
    resetTimer();
  }, [sessionType]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning) {
      if (sessionType === 'work') {
        setTimeLeft((settings.workDuration || 25) * 60);
      } else if (sessionType === 'shortBreak') {
        setTimeLeft((settings.shortBreakDuration || 5) * 60);
      } else if (sessionType === 'longBreak') {
        setTimeLeft((settings.longBreakDuration || 15) * 60);
      }
    }
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration, sessionType, isRunning]);

  // Sync local timer with navbar timer state
  useEffect(() => {
    if (timerState.isActive && timerState.timeRemaining !== timeLeft) {
      setTimeLeft(timerState.timeRemaining);
    }
  }, [timerState.timeRemaining, timerState.isActive]);

  // Sync local state when navigating back to focus timer page with active navbar timer
  useEffect(() => {
    if (timerState.isActive && !isRunning && timerState.isRunning) {
      // Navbar timer is running, sync local state
      setIsRunning(true);
      setTimeLeft(timerState.timeRemaining);

      // Set the correct session type based on navbar timer
      if (timerState.sessionType !== sessionType) {
        setSessionType(timerState.sessionType);
      }
    }
  }, [timerState.isActive, timerState.isRunning, isRunning, sessionType]);

  // Sync navbar timer when a session starts
  useEffect(() => {
    if (isRunning && sessionType === 'work') {
      startTimer(
        currentTask?.title || 'Focus Session',
        settings.workDuration * 60,
        'work'
      );
    } else if (isRunning && sessionType === 'shortBreak') {
      startTimer('Short Break', settings.shortBreakDuration * 60, 'shortBreak');
    } else if (isRunning && sessionType === 'longBreak') {
      startTimer('Long Break', settings.longBreakDuration * 60, 'longBreak');
    }
    // Remove the auto-pause logic that was interfering with navigation
  }, [isRunning, sessionType, currentTask, settings]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    stopTimer(); // Stop the navbar timer

    if (sessionType === 'work' && currentSession) {
      // Complete current work session
      const completedSession: FocusSession = {
        ...currentSession,
        completed: true,
        endTime: new Date(),
        actualDuration: Math.floor((new Date().getTime() - new Date(currentSession.startTime).getTime()) / 60000),
        distractions,
        productivity: 10 // Can implement user rating here
      };

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
          time: settings.workDuration,
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
      const nextType = newSessionsCompleted % settings.sessionsUntilLongBreak === 0
        ? 'longBreak'
        : 'shortBreak';

      setSessionType(nextType);
      setTimeLeft(nextType === 'longBreak'
        ? settings.longBreakDuration * 60
        : settings.shortBreakDuration * 60
      );

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      setSessionType('work');
      setTimeLeft(settings.workDuration * 60);
      setDistractions(0);

      if (settings.autoStartWork) {
        startNewWorkSession();
      }
    }

    // Play completion sound
    if (settings.soundEnabled) {
      playNotificationSound();
    }
  };

  const startNewWorkSession = async () => {
    if (sessionType !== 'work') {
      setSessionType('work');
      setTimeLeft(settings.workDuration * 60);
    }

    const now = new Date();
    setSessionStartTime(now);

    // Start the navbar timer
    startTimer(
      currentTask?.title || 'Focus Session',
      settings.workDuration * 60,
      'work'
    );

    // Create a new focus session
    try {
      const newSession: Omit<FocusSession, 'id'> = {
        userId: user?.id || 'user-1',
        type: 'work',
        duration: settings.workDuration,
        actualDuration: 0,
        startTime: now,
        completed: false,
        distractions: 0,
        productivity: 0,
        tags: currentTask ? [currentTask.title] : []
      };

      const createdSession = await dataService.createFocusSession(newSession);
      setCurrentSession(createdSession);
      dispatch({ type: 'SET_CURRENT_SESSION', payload: createdSession });
      setIsRunning(true);
    } catch (error) {
      console.error('Failed to create focus session:', error);
    }
  };

  const toggleTimer = () => {
    if (!isRunning && !currentSession && sessionType === 'work') {
      startNewWorkSession();
    } else {
      setIsRunning(!isRunning);
      // Toggle navbar timer
      if (isRunning) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60
    );

    // Reset the navbar timer as well
    if (timerState.isActive) {
      resetContextTimer();
    }

    if (currentSession) {
      // Cancel current session
      dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
      setCurrentSession(null);
    }

    setDistractions(0);
  };

  const skipSession = () => {
    setTimeLeft(sessionType === 'work' ? settings.workDuration * 60 : sessionType === 'shortBreak' ? settings.shortBreakDuration * 60 : settings.longBreakDuration * 60);
    handleSessionComplete();// Setting time to 0 will trigger the handleSessionComplete function
  };

  const addDistraction = () => {
    if (isRunning && sessionType === 'work') {
      setDistractions(prev => prev + 1);
    }
  };

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    setShowSettings(false);

    // Reset timer with new durations
    resetTimer();
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = settings.volume / 100;
    audio.play();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalDuration =
    sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return 'from-primary-500 to-secondary-500';
      case 'shortBreak':
        return 'from-success-500 to-accent-500';
      case 'longBreak':
        return 'from-warning-500 to-error-500';
      default:
        return 'from-primary-500 to-secondary-500';
    }
  };

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'work':
        return Target;
      case 'shortBreak':
        return Clock;
      case 'longBreak':
        return Zap;
      default:
        return Target;
    }
  };

  const SessionIcon = getSessionIcon();

  const sessionsUntilLongBreak = settings.sessionsUntilLongBreak - (sessionsCompleted % settings.sessionsUntilLongBreak);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Focus Timer</h1>
            <p className="text-white/60">Stay focused and track your productivity</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="p-8 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <SessionIcon className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-semibold text-white capitalize">
                  Focus Session
                </h2>
              </div>

              {/* Focus Task */}
              {currentTask && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
                  <p className="text-white/60">Focusing on:</p>
                  <p className="font-semibold text-lg">{currentTask.title}</p>
                </motion.div>
              )}

              {/* Timer Display */}
              <div className="my-8 flex justify-center">
                <CircularProgressBar
                  progress={progress}
                  size={300}
                  strokeWidth={15}
                  gradient={getSessionColor()}
                >
                  <div className="text-center">
                    <motion.div
                      key={sessionType}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-semibold uppercase tracking-widest text-white/70 mb-2"
                    >
                      {sessionType.replace('Break', ' Break')}
                    </motion.div>
                    <div className="text-7xl font-bold text-white tabular-nums">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </CircularProgressBar>
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center gap-4">
                <Button variant="secondary" size="icon" onClick={resetTimer} title="Reset Timer">
                  <RotateCcw className="w-8 h-8" />
                </Button>
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className="w-32 h-32 rounded-full text-2xl"
                >
                  {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
                <Button variant="secondary" size="icon" onClick={skipSession} title="Skip Session">
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>

              <div className="mt-8 text-center text-white/50">
                <p>Sessions completed: {sessionsCompleted}</p>
              </div>

              {/* Quick Stats */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <StatCard icon={Target} label="Current Task" value={currentTask?.title || 'None'} />
                <StatCard icon={RefreshCw} label="Sessions" value={`${sessionsCompleted} / ${settings.sessionsUntilLongBreak}`} />
                <StatCard icon={Zap} label="Distractions" value={distractions} />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Progress */}
            <Card variant="glass" className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Session Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Completed Sessions</span>
                  <span className="text-white font-semibold">{sessionsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Until Long Break</span>
                  <span className="text-white font-semibold">{sessionsUntilLongBreak}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Distractions</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{distractions}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addDistraction}
                      disabled={!isRunning || sessionType !== 'work'}
                    >
                      +1
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Settings */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Quick Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Settings}
                  onClick={() => setShowSettings(true)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Sound</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={settings.soundEnabled ? Volume2 : VolumeX}
                    onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Volume</span>
                    <span className="text-white">{settings.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => setSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* AI Insights */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary-400" />
                <h3 className="text-xl font-semibold text-white">AI Insights</h3>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-white/80">
                  Your focus is strongest between 9-11 AM. Consider scheduling important tasks during this time.
                </p>
                <p className="text-white/80">
                  You've completed 87% of your sessions this week. Great consistency!
                </p>
                <p className="text-white/80">
                  Try the 52-17 technique for your next session - 52 minutes work, 17 minutes break.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Settings Modal */}
        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="Timer Settings"
        >
          <SettingsPanel
            settings={settings}
            onSave={updateSettings}
            onCancel={() => setShowSettings(false)}
          />
        </Modal>

        <AnimatePresence>
          {isRunning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-4 right-4">
              {/* Removed the Capture Thought button as requested */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="bg-white/5 p-4 rounded-lg">
    <Icon className="w-6 h-6 text-white/70 mx-auto mb-2" />
    <p className="text-sm text-white/60">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

const SettingsPanel = ({ settings, onSave, onCancel }: { settings: TimerSettings, onSave: (s: TimerSettings) => void, onCancel: () => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-6">Timer Settings</h3>
      <div className="space-y-4">
        <SettingInput
          label="Work Duration (minutes)"
          type="number"
          value={localSettings.workDuration}
          onChange={(e) => setLocalSettings(s => ({ ...s, workDuration: parseInt(e.target.value) }))}
        />
        <SettingInput
          label="Short Break (minutes)"
          type="number"
          value={localSettings.shortBreakDuration}
          onChange={(e) => setLocalSettings(s => ({ ...s, shortBreakDuration: parseInt(e.target.value) }))}
        />
        <SettingInput
          label="Long Break (minutes)"
          type="number"
          value={localSettings.longBreakDuration}
          onChange={(e) => setLocalSettings(s => ({ ...s, longBreakDuration: parseInt(e.target.value) }))}
        />
        <SettingInput
          label="Sessions until Long Break"
          type="number"
          value={localSettings.sessionsUntilLongBreak}
          onChange={(e) => setLocalSettings(s => ({ ...s, sessionsUntilLongBreak: parseInt(e.target.value) }))}
        />
        <div className="flex justify-between items-center pt-2">
          <label className="text-white/80">Auto-start Breaks</label>
          <input
            type="checkbox"
            checked={localSettings.autoStartBreaks}
            onChange={(e) => setLocalSettings(s => ({ ...s, autoStartBreaks: e.target.checked }))}
            className="toggle-switch"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-white/80">Auto-start Work</label>
          <input
            type="checkbox"
            checked={localSettings.autoStartWork}
            onChange={(e) => setLocalSettings(s => ({ ...s, autoStartWork: e.target.checked }))}
            className="toggle-switch"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(localSettings)}>Save</Button>
      </div>
    </div>
  );
};

const SettingInput = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label className="block text-sm text-white/60 mb-1">{props.label}</label>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  </div>
);