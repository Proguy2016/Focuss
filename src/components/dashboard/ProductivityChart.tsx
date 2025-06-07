import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../common/Card';

export const ProductivityChart: React.FC = () => {
  const { state } = useApp();
  
  const chartData = state.analytics?.focusSessions.productivityTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: trend.score,
    sessions: trend.sessions,
    focusTime: Math.round(trend.focusTime / 60), // Convert to hours
  })) || [];

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Productivity Trends</h2>
          <p className="text-white/60 text-sm">Last 14 days performance</p>
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
      </motion.div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-400">
            {state.analytics?.overall.productivityScore || 0}
          </p>
          <p className="text-white/60 text-xs">Avg Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary-400">
            {Math.round((state.analytics?.focusSessions.totalFocusTime || 0) / 60)}h
          </p>
          <p className="text-white/60 text-xs">Total Focus</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent-400">
            {state.analytics?.focusSessions.completionRate || 0}%
          </p>
          <p className="text-white/60 text-xs">Completion</p>
        </div>
      </div>
    </Card>
  );
};