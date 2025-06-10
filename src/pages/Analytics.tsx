import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, Clock, Target, Zap, Award,
  BarChart3, PieChart, Activity, Brain, Filter, Download
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type MetricType = 'focus' | 'habits' | 'tasks' | 'productivity';

export const Analytics: React.FC = () => {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('focus');

  const productivityData = state.analytics?.focusSessions.productivityTrends || [];
  const habitCategoryData = state.analytics?.habits.categoryBreakdown || [];
  const taskPriorityData = state.analytics?.tasks.priorityDistribution || [];
  const hourlyProductivity = state.analytics?.tasks.productivityByHour || [];
  const weeklyPatterns = state.analytics?.habits.weeklyPatterns || [];

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div className={`text-sm font-medium ${change >= 0 ? 'text-success-400' : 'text-error-400'
          }`}>
          {change >= 0 ? '+' : ''}{change}%
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/60 text-sm">{title}</div>
    </Card>
  );

  if (!state.analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-white text-xl">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Analytics</h1>
          <p className="text-white/60">
            Insights into your productivity patterns and progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="glass px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <Button variant="secondary" icon={Download}>
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Focus Sessions"
          value={state.analytics?.focusSessions.totalSessions || 0}
          change={12}
          icon={Target}
          color="primary"
        />
        <MetricCard
          title="Focus Time"
          value={`${Math.floor((state.analytics?.focusSessions.totalFocusTime || 0) / 60)}h`}
          change={8}
          icon={Clock}
          color="secondary"
        />
        <MetricCard
          title="Productivity Score"
          value={state.analytics?.overall.productivityScore || 0}
          change={-3}
          icon={TrendingUp}
          color="accent"
        />
        <MetricCard
          title="Habit Streak"
          value={state.user?.streak || 0}
          change={15}
          icon={Zap}
          color="success"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trends */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Productivity Trends</h2>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'focus' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('focus')}
              >
                Focus
              </Button>
              <Button
                variant={selectedMetric === 'productivity' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('productivity')}
              >
                Score
              </Button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric === 'focus' ? 'focusTime' : 'score'}
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#productivityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hourly Productivity */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Productivity by Hour</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyProductivity.slice(6, 24)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="productivityScore" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habit Categories */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Habit Categories</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={habitCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="category"
                >
                  {habitCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {habitCategoryData.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-white/80">{category.category}</span>
                </div>
                <span className="text-white/60">{category.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Task Priority Distribution */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Task Priorities</h2>
          <div className="space-y-4">
            {taskPriorityData.map((priority, index) => (
              <div key={priority.priority} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{priority.priority}</span>
                  <span className="text-white/60">{priority.count} tasks</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: priority.color,
                      width: `${(priority.count / Math.max(...taskPriorityData.map(p => p.count))) * 100}%`
                    }}
                  />
                </div>
                <div className="text-xs text-white/60">
                  {priority.completionRate}% completion rate
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Pattern */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Weekly Pattern</h2>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const pattern = weeklyPatterns[index] || {};
              const completionRate = pattern.completionRate || 0;
              return (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-8 text-white/60 text-sm">{day}</div>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="text-white/60 text-sm w-12 text-right">
                    {Math.round(completionRate)}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-white">🎯 Focus Patterns</h3>
            <p className="text-white/70 text-sm">
              Your peak focus hours are between 9-11 AM with an average productivity score of 87.
              Consider scheduling your most important tasks during this window.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-white">📈 Improvement Areas</h3>
            <p className="text-white/70 text-sm">
              Your habit completion rate drops by 23% on weekends. Try setting easier weekend goals
              or using habit stacking to maintain consistency.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-white">🏆 Achievements</h3>
            <p className="text-white/70 text-sm">
              You've maintained a 7-day streak! Research shows that habits become automatic after
              66 days on average. Keep up the great work!
            </p>
          </div>
        </div>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">
            {state.analytics?.focusSessions.completionRate || 0}%
          </div>
          <div className="text-white/60 text-sm">Session Completion</div>
          <div className="text-white/40 text-xs mt-1">
            {state.analytics?.focusSessions.totalSessions || 0} total sessions
          </div>
        </Card>

        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-secondary-400 mb-2">
            {Math.round(state.analytics?.focusSessions.averageSessionLength || 0)}m
          </div>
          <div className="text-white/60 text-sm">Avg Session Length</div>
          <div className="text-white/40 text-xs mt-1">
            Target: 25 minutes
          </div>
        </Card>

        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-success-400 mb-2">
            {state.analytics?.tasks.completionRate || 0}%
          </div>
          <div className="text-white/60 text-sm">Task Completion</div>
          <div className="text-white/40 text-xs mt-1">
            {state.analytics?.tasks.totalTasks || 0} total tasks
          </div>
        </Card>

        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-accent-400 mb-2">
            {state.user?.level || 1}
          </div>
          <div className="text-white/60 text-sm">Current Level</div>
          <div className="text-white/40 text-xs mt-1">
            {state.user?.xp || 0} XP
          </div>
        </Card>
      </div>
    </div>
  );
};