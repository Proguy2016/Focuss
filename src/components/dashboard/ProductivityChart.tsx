import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';
import { useApp } from '../../contexts/AppContext';

export const ProductivityChart: React.FC = () => {
  const { state } = useApp();

  // Generate weekly productivity data from dailyActivity
  const chartData = useMemo(() => {
    const dailyActivity = state.analytics?.dailyActivity || {};

    // Calculate the date for 7 days ago and 7 days in the future
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAhead = new Date();
    sevenDaysAhead.setDate(today.getDate() + 7);

    // Create array of the date range (7 days back and 7 days forward)
    const dateRange = [];
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      const dailyData = dailyActivity[dateKey] || { focusSessions: 0, focusTime: 0, tasksCompleted: 0 };

      // Calculate a productivity score from the day's data
      const focusTimeHours = (dailyData.focusTime || 0) / 60; // Convert minutes to hours
      const focusSessions = dailyData.focusSessions || 0;
      const tasksCompleted = dailyData.tasksCompleted || 0;

      // Simple scoring formula: tasks are weighted more heavily
      const score = Math.min(100, Math.round(
        (focusTimeHours * 10) + // 10 points per hour of focus
        (focusSessions * 5) +   // 5 points per session
        (tasksCompleted * 15)   // 15 points per completed task
      ));

      // Mark whether this date is in the past, present or future
      const isPast = date < today && date.getDate() !== today.getDate();
      const isFuture = date > today && date.getDate() !== today.getDate();
      const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      dateRange.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: date, // Keep full date for sorting and comparison
        score: isPast ? score : isFuture ? 0 : score, // Only show scores for today and past days
        focusTime: isPast ? focusTimeHours : isFuture ? 0 : focusTimeHours,
        sessions: focusSessions,
        tasksCompleted: tasksCompleted,
        isPast,
        isToday,
        isFuture
      });
    }

    // Sort by date
    dateRange.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

    // Keep only the past 7 days and today (8 days total)
    const pastAndToday = dateRange.filter(d => !d.isFuture);

    // Remove the full date before returning
    return pastAndToday.map(({ fullDate, isPast, isToday, isFuture, ...rest }) => rest);
  }, [state.analytics?.dailyActivity]);

  // Calculate averages for the bottom stats
  const averageScore = useMemo(() => {
    const pastAndTodayData = chartData.filter(day => day.score > 0);
    if (!pastAndTodayData.length) return 0;
    const sum = pastAndTodayData.reduce((acc, day) => acc + day.score, 0);
    return Math.round(sum / pastAndTodayData.length);
  }, [chartData]);

  const totalFocusTime = useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, day) => acc + day.focusTime, 0);
    return Math.round(sum);
  }, [chartData]);

  const completionRate = useMemo(() => {
    if (!state.analytics?.tasks.totalTasks) return 0;
    return Math.round((state.analytics?.tasks.totalCompleted || 0) / state.analytics?.tasks.totalTasks * 100);
  }, [state.analytics?.tasks]);

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Productivity Trends</h2>
          <p className="text-white/60 text-sm">Last 7 days performance</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-400" />
            <span className="text-white/60">Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary-400" />
            <span className="text-white/60">Focus Time (h)</span>
          </div>
        </div>
      </div>

      <motion.div
        className="h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                domain={[0, 'dataMax + 10']} // Add some padding at the top
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value, name) => {
                  if (name === 'score') return [`${value} points`, 'Productivity'];
                  if (name === 'focusTime') return [`${value} hrs`, 'Focus Time'];
                  if (name === 'sessions') return [`${value}`, 'Sessions'];
                  if (name === 'tasksCompleted') return [`${value}`, 'Tasks Completed'];
                  return [value, name];
                }}
                labelFormatter={(dateStr) => {
                  return `${dateStr}`;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
              <Area
                type="monotone"
                dataKey="focusTime"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#timeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/60">
              <p className="text-lg font-semibold">No data yet!</p>
              <p className="text-sm">Start a focus session to see your progress.</p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-400">
            {averageScore}
          </p>
          <p className="text-white/60 text-xs">Avg Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary-400">
            {totalFocusTime}h
          </p>
          <p className="text-white/60 text-xs">Total Focus</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent-400">
            {completionRate}%
          </p>
          <p className="text-white/60 text-xs">Completion</p>
        </div>
      </div>
    </div>
  );
};