import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Brain, Target, Clock, Zap, SkipForward, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { FocusSession } from '../types';

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
  const { state, dispatch, dataService } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: state.user?.preferences.workDuration || 25,
    shortBreakDuration: state.user?.preferences.shortBreakDuration || 5,
    longBreakDuration: state.user?.preferences.longBreakDuration || 15,
    sessionsUntilLongBreak: state.user?.preferences.sessionsUntilLongBreak || 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: state.user?.preferences.soundEnabled || true,
    volume: state.user?.preferences.ambientVolume || 50,
  });

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

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
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
    
    // Create a new focus session
    try {
      const newSession: Omit<FocusSession, 'id'> = {
        userId: state.user?.id || 'user-1',
        type: 'work',
        duration: settings.workDuration,
        actualDuration: 0,
        startTime: now,
        completed: false,
        distractions: 0,
        productivity: 0,
        tags: currentTask ? [currentTask] : []
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const progress = sessionType === 'work' 
    ? ((settings.workDuration * 60 - timeLeft) / (settings.workDuration * 60)) * 100
    : sessionType === 'shortBreak'
      ? ((settings.shortBreakDuration * 60 - timeLeft) / (settings.shortBreakDuration * 60)) * 100
      : ((settings.longBreakDuration * 60 - timeLeft) / (settings.longBreakDuration * 60)) * 100;

  const SessionIcon = getSessionIcon();
  
  const sessionsUntilLongBreak = settings.sessionsUntilLongBreak - (sessionsCompleted % settings.sessionsUntilLongBreak);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gradient mb-2">Focus Timer</h1>
        <p className="text-white/60 text-lg">
          Time to focus and get things done
        </p>
      </motion.div>

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

            {/* Circular Progress */}
            <div className="relative w-72 h-72 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#timerGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="282.6"
                  strokeDashoffset={282.6 - (progress / 100) * 282.6}
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-6xl font-bold text-white font-mono">
                  {formatTime(timeLeft)}
                </h3>
                <p className="text-white/60 mt-2">
                  Session {sessionsCompleted + 1}
                </p>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full px-10"
                onClick={toggleTimer}
                icon={isRunning ? Pause : Play}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={RefreshCw}
                onClick={resetTimer}
              >
                Reset
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={SkipForward}
                onClick={skipSession}
              >
                Skip
              </Button>
            </div>
            
            {/* Current Task */}
            <div className="w-full mt-8">
              <div className="glass p-4 rounded-xl">
                <h3 className="text-white mb-2">Current Task (Optional)</h3>
                <input
                  type="text"
                  placeholder="What are you working on?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 border border-white/20 focus:outline-none"
                />
              </div>
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Work Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.workDuration}
                onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value) || 5})}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value) || 15})}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Sessions Until Long Break</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => setSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4})}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Auto-start breaks</span>
              <input
                type="checkbox"
                id="autoStartBreaks"
                checked={settings.autoStartBreaks}
                onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked})}
                className="w-4 h-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Auto-start work sessions</span>
              <input
                type="checkbox"
                id="autoStartWork"
                checked={settings.autoStartWork}
                onChange={(e) => setSettings({...settings, autoStartWork: e.target.checked})}
                className="w-4 h-4"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={() => updateSettings(settings)}
              fullWidth
            >
              Apply Settings
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowSettings(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};