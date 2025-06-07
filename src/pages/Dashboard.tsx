import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';

export const Dashboard: React.FC = () => {
  const { state } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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