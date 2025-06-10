import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';
import api from '../services/api';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Use the API service instead of fetch directly
        const response = await api.get('/stats/get');
        
        // Handle successful response
        const data = response.data;
        console.log('API Response Data:', data);
        
        if (data && data.stats) {
          // Update analytics and user state
          dispatch({
            type: 'SET_ANALYTICS',
            payload: {
              overall: {
                productivityScore: data.stats.productivityScore,
                achievements: [],
                weeklyGoalProgress: 0,
                monthlyGoalProgress: 0,
                level: data.stats.level || 0,
                xp: data.stats.xp || 0,
                nextLevelXp: data.stats.nextLevelXp || 0,
              },
              focusSessions: {
                totalSessions: data.stats.focusSessions,
                totalFocusTime: data.stats.focusTime,
                averageSessionLength: 0,
                completionRate: 0,
                productivityTrends: [
                  { date: new Date('2023-10-20'), score: 70, sessions: 2, focusTime: 60 },
                  { date: new Date('2023-10-21'), score: 75, sessions: 3, focusTime: 90 },
                  { date: new Date('2023-10-22'), score: 80, sessions: 4, focusTime: 120 },
                  { date: new Date('2023-10-23'), score: 85, sessions: 3, focusTime: 100 },
                  { date: new Date('2023-10-24'), score: 90, sessions: 5, focusTime: 150 },
                ], // Static data for now
                streakData: [],
                flowStateHours: [],
                distractionPatterns: [],
              },
              tasks: {
                totalTasks: data.stats.tasksCompleted?.totalCompleted || 0,
                completionRate: 0,
                averageCompletionTime: 0,
                priorityDistribution: [],
                productivityByHour: [],
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
        
        // Check if it's a 404 with the specific "Stats not found" message
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response && axiosError.response.status === 404 && 
            axiosError.response.data && axiosError.response.data.message === "Stats not found for this user.") {
          
          console.log("No stats found for this user. Using defaults.");
          
          // Create default empty stats
          dispatch({
            type: 'SET_ANALYTICS',
            payload: {
              overall: {
                productivityScore: 0,
                achievements: [],
                weeklyGoalProgress: 0,
                monthlyGoalProgress: 0,
                level: 1,
                xp: 0,
                nextLevelXp: 100,
              },
              focusSessions: {
                totalSessions: 0,
                totalFocusTime: 0,
                averageSessionLength: 0,
                completionRate: 0,
                productivityTrends: [],
                streakData: [],
                flowStateHours: [],
                distractionPatterns: [],
              },
              tasks: {
                totalTasks: 0,
                completionRate: 0,
                averageCompletionTime: 0,
                priorityDistribution: [],
                productivityByHour: [],
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
        } else {
          // Handle other errors
          console.error('Failed to fetch stats:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 space-y-8 min-h-screen relative">
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50 rounded-2xl"
        >
          <span className="text-white text-xl">Loading dashboard...</span>
        </motion.div>
      )}

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center lg:text-left"
      >
        <h1 className="text-4xl font-bold text-gradient mb-2">
          {getGreeting()}, {state.user?.name}!
        </h1>
        <p className="text-white/60 text-lg">
          Ready to boost your productivity today? Let's make it count.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <ProductivityChart />
          <QuickActions />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <UpcomingTasks />
          <RecentActivity />
        </div>
      </div>

      {/* Motivational Quote */}
      <motion.div
        className="text-center p-8 glass rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <blockquote className="text-xl text-white/80 italic mb-4">
          "The way to get started is to quit talking and begin doing."
        </blockquote>
        <cite className="text-primary-400 font-semibold">— Walt Disney</cite>
      </motion.div>
    </div>
  );
};