import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { QuickActions } from '../components/dashboard/QuickActions';
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

interface ErrorResponse {
  message: string;
}

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const location = useLocation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found');
          return;
        }

        setLoading(true);
        const response = await api.get('/api/stats/get');
        const data = response.data;
        console.log('API Response Data:', data);

        if (data && data.stats) {
          dispatch({
            type: 'SET_ANALYTICS',
            payload: {
              overall: {
                productivityScore: data.stats.productivityScore,
                achievements: [],
                weeklyGoalProgress: 0,
                monthlyGoalProgress: 0,
                level: data.stats.level || 1,
                xp: data.stats.xp || 0,
                nextLevelXp: getXpToLevelUp(data.stats.level || 1),
              },
              focusSessions: {
                totalSessions: data.stats.focusSessions,
                totalFocusTime: data.stats.focusTime,
                averageSessionLength: 0,
                completionRate: 0,
                streakData: [],
                productivityTrends: [],
                flowStateHours: [],
                distractionPatterns: [],
              },
              tasks: {
                totalTasks: data.stats.tasksCompleted?.totalTasks || 0,
                completionRate: 0,
                averageCompletionTime: 0,
                priorityDistribution: [],
                productivityByHour: data.stats.productivityByHour || [],
              },
              habits: {
                totalHabits: 0,
                completionRate: 0,
                averageStreak: 0,
                categoryBreakdown: [],
                weeklyPatterns: [],
              },
            },
          });
        }
      } catch (err: unknown) {
        console.log('Stats fetch error:', err);
        // Only show error if it's not a 404 "Stats not found" error
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response?.status !== 404 ||
          axiosError.response?.data?.message !== "Stats not found for this user.") {
          console.error('Failed to fetch stats:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const fetchHabits = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found');
          return;
        }

        const response = await api.get('/api/stats/getHabits');
        if (response.data && response.data.habits) {
          dispatch({ type: 'SET_HABITS', payload: response.data.habits });
        }
      } catch (error) {
        // Only log error if it's not a 404
        if ((error as AxiosError).response?.status !== 404) {
          console.error("Failed to fetch habits for dashboard:", error);
        }
      }
    };

    fetchHabits();
  }, [state.user, dispatch, location.key]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const overallAnalytics = state.analytics?.overall;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen relative text-white">
      {/* Background Gradient removed to allow global background to show */}

      {loading && (
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

      {/* Quick Actions */}
      <QuickActions />

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
    </div>
  );
};