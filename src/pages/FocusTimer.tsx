import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Settings, Volume2, VolumeX, Brain, Target, Clock, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

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
  const { state, dispatch } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [currentTask, setCurrentTask] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
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

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (sessionType === 'work') {
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
      
      if (settings.autoStartWork) {
        setIsRunning(true);
      }
    }

    // Play completion sound
    if (settings.soundEnabled) {
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' 
      ? settings.workDuration * 60 
      : sessionType === 'shortBreak' 
        ? settings.shortBreakDuration * 60 
        : settings.longBreakDuration * 60
    );
  };

  const skipSession = () => {
    setTimeLeft(0);
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
          {sessionType === 'work' ? 'Time to focus and get things done' : 'Take a well-deserved break'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <SessionIcon className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-semibold text-white capitalize">
                {sessionType === 'shortBreak' ? 'Short Break' : 
                 sessionType === 'longBreak' ? 'Long Break' : 'Focus Session'}
              </h2>
            </div>

            {/* Circular Progress */}
            <div className="relative w-80 h-80 mx-auto mb-8">
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
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="text-6xl font-bold text-white mb-2"
                    animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <p className="text-white/60 text-lg">
                    Session {sessionsCompleted + 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="primary"
                size="lg"
                icon={isRunning ? Pause : Play}
                onClick={toggleTimer}
                className={`bg-gradient-to-r ${getSessionColor()}`}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                icon={RotateCcw}
                onClick={resetTimer}
              >
                Reset
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                icon={Square}
                onClick={skipSession}
              >
                Skip
              </Button>
            </div>

            {/* Current Task */}
            <div className="glass p-4 rounded-xl">
              <label className="block text-white/60 text-sm mb-2">Current Task (Optional)</label>
              <input
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="What are you working on?"
                className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none text-lg"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Progress */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Session Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Completed Sessions</span>
                <span className="text-white font-semibold">{sessionsCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Until Long Break</span>
                <span className="text-white font-semibold">
                  {settings.sessionsUntilLongBreak - (sessionsCompleted % settings.sessionsUntilLongBreak)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Distractions</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{distractions}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDistractions(prev => prev + 1)}
                    className="text-xs px-2 py-1"
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
              <h3 className="text-lg font-semibold text-white">Quick Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                icon={Settings}
                onClick={() => setShowSettings(true)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Sound</span>
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
              <h3 className="text-lg font-semibold text-white">AI Insights</h3>
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
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Work Duration (minutes)</label>
              <input
                type="number"
                value={settings.workDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) }))}
                className="input-field w-full"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Short Break (minutes)</label>
              <input
                type="number"
                value={settings.shortBreakDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) }))}
                className="input-field w-full"
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Long Break (minutes)</label>
              <input
                type="number"
                value={settings.longBreakDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
                className="input-field w-full"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Sessions Until Long Break</label>
              <input
                type="number"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) }))}
                className="input-field w-full"
                min="2"
                max="10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Auto-start breaks</span>
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Auto-start work sessions</span>
              <input
                type="checkbox"
                checked={settings.autoStartWork}
                onChange={(e) => setSettings(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={() => {
                // Apply settings and reset timer
                setTimeLeft(sessionType === 'work' 
                  ? settings.workDuration * 60 
                  : sessionType === 'shortBreak' 
                    ? settings.shortBreakDuration * 60 
                    : settings.longBreakDuration * 60
                );
                setShowSettings(false);
              }}
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