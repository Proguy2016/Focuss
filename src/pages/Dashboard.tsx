import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { AiInsights } from '../components/dashboard/AiInsights';
import { TabbedCharts } from '../components/dashboard/TabbedCharts';
import { XPProgressBar } from '../components/dashboard/XPProgressBar';
import { MotivationalQuote } from '../components/dashboard/MotivationalQuote';
import api from '../services/api';
import { AxiosError } from 'axios';
import { TodaysHabits } from '../components/dashboard/TodaysHabits';
import { useLocation } from 'react-router-dom';
import { TimerSettings, TimerSettingsData } from '../components/common/TimerSettings';

export const Dashboard: React.FC = () => {
  const { state, dispatch, refreshStats } = useApp();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettingsData>(() => {
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

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      await refreshStats();
      // Also fetch habits, can be consolidated with refreshStats if needed
      try {
        const response = await api.get('/api/stats/getHabits');
        if (response.data && response.data.habits) {
          dispatch({ type: 'SET_HABITS', payload: response.data.habits });
        }
      } catch (error) {
        if ((error as AxiosError).response?.status !== 404) {
          console.error("Failed to fetch habits for dashboard:", error);
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    loadData();
  }, [dispatch, refreshStats, location.key]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const overallAnalytics = state.analytics?.overall;



  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen relative text-white">
      {/* We use the global loading state from AppContext */}
      {state.isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50 rounded-2xl"
        >
          <span className="text-white text-xl font-light">Loading dashboard...</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-1">
            {getGreeting()}, {state.user?.firstName}!
          </h1>
          <p className="text-white/60 text-base sm:text-lg font-light">
            Ready to make today count?
          </p>
        </div>
        <div className="w-full md:w-1/3">
          <XPProgressBar
            level={overallAnalytics?.level || 1}
            xp={overallAnalytics?.xp || 0}
            nextLevelXp={overallAnalytics?.nextLevelXp || 100}
          />
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-3 space-y-8">
          <StatsGrid />
          <TabbedCharts />
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-2 space-y-8">
          <UpcomingTasks />
          <TodaysHabits />
          <AiInsights />
          <RecentActivity />
        </div>
      </div>

      {/* Motivational Quote */}
      <MotivationalQuote />

      {/* Timer Settings Button */}
      <button
        type="button"
        className="fixed bottom-4 right-4 inline-flex items-center justify-center gap-2 rounded-xl font-semibold
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

      {/* Timer Settings Dialog */}
      <TimerSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => {
          setTimerSettings(newSettings);
          localStorage.setItem('timerSettings', JSON.stringify(newSettings));
          setIsSettingsOpen(false);
        }}
        initialSettings={timerSettings}
      />
    </div>
  );
};