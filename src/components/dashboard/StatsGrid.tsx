import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Zap, TrendingUp, Clock, Award } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../common/Card';
import { getXpToLevelUp, getTotalXpForLevel } from '../../utils/leveling';

export const StatsGrid: React.FC = () => {
  const { state } = useApp();
  const { analytics, user } = state;

  const totalXp = analytics?.overall?.xp || 0;
  const level = analytics?.overall?.level || 1;
  const xpForCurrentLevel = getTotalXpForLevel(level);
  const xpForNextLevel = getXpToLevelUp(level);
  const currentXpInLevel = totalXp - xpForCurrentLevel;

  const stats = [
    {
      icon: Target,
      label: 'Focus Sessions',
      value: analytics?.focusSessions.totalSessions || 0,
      subtext: 'This month',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
    },
    {
      icon: Clock,
      label: 'Focus Time',
      value: `${Math.floor((analytics?.focusSessions.totalFocusTime || 0) / 60)}h`,
      subtext: `${(analytics?.focusSessions.totalFocusTime || 0) % 60}m total`,
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-500/10',
    },
    {
      icon: CheckCircle,
      label: 'Tasks Completed',
      value: analytics?.tasks?.totalCompleted || 0,
      subtext: 'Completed tasks',
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-500/10',
    },
    {
      icon: Zap,
      label: 'Habit Streak',
      value: user?.streak || 0,
      subtext: 'Days in a row',
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Productivity Score',
      value: analytics?.overall.productivityScore || 0,
      subtext: 'Out of 100',
      color: 'from-warning-500 to-warning-600',
      bgColor: 'bg-warning-500/10',
    },
    {
      icon: Award,
      label: 'Level',
      value: level,
      subtext: `${currentXpInLevel} / ${xpForNextLevel} XP`,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="glass" hover glow className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium">{stat.label}</p>
                <motion.p
                  className="text-3xl font-bold text-white mt-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-white/40 text-xs mt-1">{stat.subtext}</p>
              </div>

              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Animated background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 -z-10`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </Card>
        </motion.div>
      ))}
    </div>
  );
};