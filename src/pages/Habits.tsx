import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, Flame, Target, TrendingUp, CheckCircle2, 
  Circle, Edit, Trash2, MoreHorizontal, Star, Clock, Zap
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Habit, HabitFrequency } from '../types';

export const Habits: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'Wellness',
    frequency: 'daily' as const,
    targetCount: 1,
    color: '#10B981',
    icon: 'Heart',
    priority: 'medium' as const,
    reminderTime: '09:00',
    reminderEnabled: true,
  });

  const categories = [
    { name: 'Wellness', color: '#10B981', icon: 'Heart' },
    { name: 'Learning', color: '#3B82F6', icon: 'Book' },
    { name: 'Fitness', color: '#F59E0B', icon: 'Zap' },
    { name: 'Productivity', color: '#8B5CF6', icon: 'Target' },
    { name: 'Social', color: '#EC4899', icon: 'Users' },
    { name: 'Creative', color: '#06B6D4', icon: 'Palette' },
  ];

  const handleCreateHabit = () => {
    if (!newHabit.name.trim()) return;

    const habit: Omit<Habit, 'id'> = {
      userId: state.user?.id || '',
      name: newHabit.name,
      description: newHabit.description || undefined,
      category: {
        id: '1',
        name: newHabit.category,
        color: newHabit.color,
        icon: newHabit.icon,
      },
      frequency: { type: newHabit.frequency },
      targetCount: newHabit.targetCount,
      currentStreak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      color: newHabit.color,
      icon: newHabit.icon,
      priority: newHabit.priority,
      createdAt: new Date(),
      reminders: newHabit.reminderEnabled ? [{
        id: '1',
        time: newHabit.reminderTime,
        enabled: true,
        message: `Time for ${newHabit.name}`,
      }] : [],
    };

    console.log('Creating habit:', habit);
    setShowCreateModal(false);
    setNewHabit({
      name: '',
      description: '',
      category: 'Wellness',
      frequency: 'daily',
      targetCount: 1,
      color: '#10B981',
      icon: 'Heart',
      priority: 'medium',
      reminderTime: '09:00',
      reminderEnabled: true,
    });
  };

  const toggleHabitCompletion = (habit: Habit) => {
    // In a real app, this would track completion for today
    console.log('Toggling habit completion:', habit.id);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-400';
    if (streak >= 14) return 'text-primary-400';
    if (streak >= 7) return 'text-success-400';
    return 'text-white/60';
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth();
  };

  const HabitCard: React.FC<{ habit: Habit; index: number }> = ({ habit, index }) => {
    const isCompletedToday = Math.random() > 0.3; // Mock completion status

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card variant="glass" hover className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${habit.color}20` }}
              >
                <Zap className="w-6 h-6" style={{ color: habit.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{habit.name}</h3>
                <p className="text-white/60 text-sm">{habit.category.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                icon={Edit}
                onClick={() => setEditingHabit(habit)}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => console.log('Delete habit:', habit.id)}
              />
            </div>
          </div>

          {habit.description && (
            <p className="text-white/70 text-sm mb-4">{habit.description}</p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStreakColor(habit.currentStreak)}`}>
                {habit.currentStreak}
              </div>
              <div className="text-white/60 text-xs">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">
                {habit.bestStreak}
              </div>
              <div className="text-white/60 text-xs">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-400">
                {habit.totalCompletions}
              </div>
              <div className="text-white/60 text-xs">Total</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${habit.currentStreak > 0 ? 'text-orange-400' : 'text-white/40'}`} />
              <span className="text-white/60 text-sm">
                {habit.frequency.type === 'daily' ? 'Daily' : 'Weekly'}
              </span>
            </div>
            
            <Button
              variant={isCompletedToday ? 'success' : 'secondary'}
              size="sm"
              icon={isCompletedToday ? CheckCircle2 : Circle}
              onClick={() => toggleHabitCompletion(habit)}
            >
              {isCompletedToday ? 'Done' : 'Mark Done'}
            </Button>
          </div>

          {/* Progress bar for weekly habits */}
          {habit.frequency.type === 'weekly' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">This week</span>
                <span className="text-white/60">3/7</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '43%' }}
                />
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Habits</h1>
          <p className="text-white/60">
            Build lasting habits and track your progress
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          New Habit
        </Button>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">
            {state.habits.length}
          </div>
          <div className="text-white/60 text-sm">Active Habits</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-success-400 mb-2">
            {Math.round(state.analytics?.habits.completionRate || 0)}%
          </div>
          <div className="text-white/60 text-sm">Completion Rate</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-accent-400 mb-2">
            {Math.round(state.analytics?.habits.averageStreak || 0)}
          </div>
          <div className="text-white/60 text-sm">Avg Streak</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-warning-400 mb-2">
            {state.user?.streak || 0}
          </div>
          <div className="text-white/60 text-sm">Current Streak</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Habits List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Habits</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">All</Button>
              <Button variant="ghost" size="sm">Today</Button>
              <Button variant="ghost" size="sm">Overdue</Button>
            </div>
          </div>

          {state.habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/60 mb-2">No habits yet</h3>
              <p className="text-white/40 mb-6">
                Create your first habit to start building better routines
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Habit
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {state.habits.map((habit, index) => (
                <HabitCard key={habit.id} habit={habit} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Calendar and Analytics */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                >
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                >
                  ›
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-white/60 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((date, index) => {
                const hasCompletions = Math.random() > 0.7; // Mock data
                return (
                  <button
                    key={index}
                    className={`
                      aspect-square text-sm rounded-lg transition-colors relative
                      ${isCurrentMonth(date) ? 'text-white hover:bg-white/10' : 'text-white/30'}
                      ${isToday(date) ? 'bg-primary-500 text-white' : ''}
                    `}
                  >
                    {date.getDate()}
                    {hasCompletions && isCurrentMonth(date) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-success-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-3">
              {state.analytics?.habits.categoryBreakdown.map(category => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-white/80 text-sm">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">{category.count}</div>
                    <div className="text-white/60 text-xs">{category.completionRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Pattern */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Pattern</h3>
            <div className="space-y-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const pattern = state.analytics?.habits.weeklyPatterns[index];
                return (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-8 text-white/60 text-sm">{day}</div>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                        style={{ width: `${pattern?.completionRate || 0}%` }}
                      />
                    </div>
                    <div className="text-white/60 text-sm w-8 text-right">
                      {pattern?.completionRate || 0}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Create Habit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Habit"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Habit Name *</label>
            <input
              type="text"
              value={newHabit.name}
              onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Morning meditation"
              className="input-field w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Description</label>
            <textarea
              value={newHabit.description}
              onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your habit..."
              className="input-field w-full h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Category</label>
              <select
                value={newHabit.category}
                onChange={(e) => {
                  const category = categories.find(c => c.name === e.target.value);
                  setNewHabit(prev => ({ 
                    ...prev, 
                    category: e.target.value,
                    color: category?.color || '#10B981',
                    icon: category?.icon || 'Heart'
                  }));
                }}
                className="input-field w-full"
              >
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Frequency</label>
              <select
                value={newHabit.frequency}
                onChange={(e) => setNewHabit(prev => ({ ...prev, frequency: e.target.value as any }))}
                className="input-field w-full"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Target Count</label>
              <input
                type="number"
                value={newHabit.targetCount}
                onChange={(e) => setNewHabit(prev => ({ ...prev, targetCount: parseInt(e.target.value) }))}
                className="input-field w-full"
                min="1"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Priority</label>
              <select
                value={newHabit.priority}
                onChange={(e) => setNewHabit(prev => ({ ...prev, priority: e.target.value as any }))}
                className="input-field w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-sm">Daily Reminder</label>
              <input
                type="checkbox"
                checked={newHabit.reminderEnabled}
                onChange={(e) => setNewHabit(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>
            
            {newHabit.reminderEnabled && (
              <div>
                <label className="block text-white/60 text-sm mb-2">Reminder Time</label>
                <input
                  type="time"
                  value={newHabit.reminderTime}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, reminderTime: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleCreateHabit}
              fullWidth
              disabled={!newHabit.name.trim()}
            >
              Create Habit
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
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