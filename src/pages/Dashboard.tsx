import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5001/api/stats/get', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data && data.stats) {
          // Update analytics and user state
          dispatch({
            type: 'SET_ANALYTICS',
            payload: {
              overall: {
                productivityScore: data.stats.productivityScore,
                achievements: [],
              },
              focusSessions: {
                totalSessions: data.stats.focusSessions,
                totalFocusTime: data.stats.focusTime,
                averageSessionLength: 0,
                completionRate: 0,
                productivityTrends: [],
                peakProductivity: { time: '', day: '' },
              },
              tasks: {
                totalTasks: data.stats.tasksCompleted.Completedtasks,
                completionRate: 0,
                overdueTasks: 0,
              },
              habits: {
                totalHabits: 0,
                completionRate: 0,
                streaks: [],
              },
            },
          });
          // Optionally update user fields (level, streak, etc.)
          // You may want to update user context here if needed
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-white text-xl">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
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