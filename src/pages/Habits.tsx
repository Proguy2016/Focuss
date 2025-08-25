import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Check, Calendar, MoreHorizontal, Edit, Trash2,
  Zap, ChevronRight, Filter, Search, CheckCircle2, Circle,
  Heart, Book, Briefcase, Brain, Dumbbell
} from 'lucide-react';
import { format, addDays, isToday, isPast, isSameDay } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Habit, HabitCategory } from '../types';
import { Description } from '@radix-ui/react-dialog';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { AxiosError } from 'axios';

type FilterType = 'all' | 'completed' | 'incomplete' | 'high' | 'medium' | 'low';

const iconMap: { [key: string]: React.ElementType } = {
  Heart,
  Book,
  Zap,
  Briefcase,
  Brain,
  Dumbbell,
};

const HabitIcon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, ...props }) => {
  const IconComponent = iconMap[name];
  return IconComponent ? <IconComponent {...props} /> : <Zap {...props} />;
};

export const Habits: React.FC = () => {
  const { state, dispatch, refreshStats } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'Wellness',
    frequency: 'daily',
    targetCount: 1,
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
  });

  // Available categories
  const categories: HabitCategory[] = [
    { id: '1', name: 'Wellness', color: '#10B981', icon: 'Heart' },
    { id: '2', name: 'Learning', color: '#3B82F6', icon: 'Book' },
    { id: '3', name: 'Fitness', color: '#F59E0B', icon: 'Dumbbell' },
    { id: '4', name: 'Productivity', color: '#8B5CF6', icon: 'Briefcase' },
    { id: '5', name: 'Mindfulness', color: '#EC4899', icon: 'Brain' },
  ];

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found');
          return;
        }

        const response = await api.get('/stats/getHabits');
        if (response.data && response.data.habits) {
          const transformedHabits = response.data.habits.map((habit: any) => {
            const categoryObj = categories.find(c => c.name === habit.category);
            const frequencyObj = typeof habit.frequency === 'string'
              ? { type: habit.frequency, customValue: null }
              : habit.frequency;

            return {
              ...habit,
              id: habit.habitId,
              name: habit.name,
              description: habit.description,
              frequency: frequencyObj,
              category: categoryObj || { name: habit.category, color: '#6B7280', icon: 'Zap' },
              targetCount: habit.targetCount,
              priority: habit.priority,
              currentStreak: habit.streak,
              progress: habit.progress,
              completed: habit.completed,
              lastCompleted: habit.lastCompleted,
              startDate: habit.startDate,
              resetDate: habit.resetDate,
            };
          });
          dispatch({ type: 'SET_HABITS', payload: transformedHabits });
        }
      } catch (error) {
        // Only log error if it's not a 404
        if ((error as AxiosError).response?.status !== 404) {
          console.error("Failed to fetch habits:", error);
        }
      }
    };

    fetchHabits();
  }, [dispatch]);

  // Check URL parameters for actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');

    if (action === 'new-goal') {
      setShowCreateModal(true);
      // Optionally set default values for a goal
      setNewHabit(prev => ({
        ...prev,
        category: 'Productivity',
        priority: 'High'
      }));
    }
  }, [location.search]);

  useEffect(() => {
    const checkAndResetHabits = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const habitsToReset = state.habits.filter(habit => {
        if (habit.frequency.type !== 'daily' || !habit.resetDate) {
          return false;
        }
        const resetDate = new Date(habit.resetDate);
        resetDate.setHours(0, 0, 0, 0);
        return resetDate < today;
      });

      if (habitsToReset.length > 0) {
        console.log('Resetting daily habits:', habitsToReset.map(h => h.name));

        try {
          // Reset habits in the backend
          for (const habit of habitsToReset) {
            await api.put('/api/stats/resetHabit', { habitId: habit.habitId });
          }

          // Fetch updated habits after reset
          const response = await api.get('/stats/getHabits');
          if (response.data && response.data.habits) {
            const transformedHabits = response.data.habits.map((habit: any) => {
              const categoryObj = categories.find(c => c.name === habit.category);
              const frequencyObj = typeof habit.frequency === 'string'
                ? { type: habit.frequency, customValue: null }
                : habit.frequency;

              return {
                ...habit,
                id: habit.habitId,
                name: habit.name,
                description: habit.description,
                frequency: frequencyObj,
                category: categoryObj || { name: habit.category, color: '#6B7280', icon: 'Zap' },
                targetCount: habit.targetCount,
                priority: habit.priority,
                currentStreak: habit.streak,
                progress: habit.progress,
                completed: habit.completed,
                lastCompleted: habit.lastCompleted,
                startDate: habit.startDate,
                resetDate: habit.resetDate,
              };
            });
            dispatch({ type: 'SET_HABITS', payload: transformedHabits });
          }
        } catch (error) {
          console.error("Failed to reset habits in backend:", error);

          // Fallback to local reset if API call fails
          const updatedHabits = state.habits.map(habit => {
            if (habitsToReset.some(h => h.habitId === habit.habitId)) {
              return { ...habit, progress: 0, completed: false };
            }
            return habit;
          });
          dispatch({ type: 'SET_HABITS', payload: updatedHabits });
        }
      }
    };

    // Run once on mount and then set an interval to check daily
    checkAndResetHabits();
    const interval = setInterval(checkAndResetHabits, 1000 * 60 * 60); // Check once an hour instead of once a day for more responsiveness

    return () => clearInterval(interval);
  }, [state.habits, dispatch]);

  const isHabitCompleted = (habit: Habit) => {
    return habit.completed;
  };

  // Check if a habit is completed for a specific date
  const isHabitCompletedForDate = (habit: Habit, date: Date) => {
    if (!habit.completions) {
      return false;
    }
    return habit.completions.some(c => {
      const completionDate = new Date(c.date);
      return completionDate.getFullYear() === date.getFullYear() &&
        completionDate.getMonth() === date.getMonth() &&
        completionDate.getDate() === date.getDate();
    });
  };

  const getCategory = (categoryName: string) => {
    return categories.find(c => c.name === categoryName);
  };

  const getCategoryColor = (categoryName: string) => {
    return getCategory(categoryName)?.color || '#6B7280'; // Default gray
  };

  const getCategoryIcon = (categoryName: string) => {
    return getCategory(categoryName)?.icon || 'Zap'; // Default icon
  };

  // Filter and sort habits
  const filteredAndSortedHabits = useMemo(() => {
    return [...state.habits]
      .filter(habit => {
        switch (filterType) {
          case 'completed':
            return isHabitCompletedForDate(habit, selectedDate);
          case 'incomplete':
            return !isHabitCompletedForDate(habit, selectedDate);
          case 'high':
            return habit.priority === 'High';
          case 'medium':
            return habit.priority === 'Medium';
          case 'low':
            return habit.priority === 'Low';
          default:
            return true;
        }
      })
      .filter(habit =>
        habit.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aCompleted = isHabitCompletedForDate(a, selectedDate);
        const bCompleted = isHabitCompletedForDate(b, selectedDate);
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;

        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        if (priorityOrder[a.priority] < priorityOrder[b.priority]) return -1;
        if (priorityOrder[a.priority] > priorityOrder[b.priority]) return 1;

        return 0;
      });
  }, [state.habits, searchTerm, selectedDate, filterType]);

  const handleCreateHabit = async () => {
    if (!newHabit.name.trim() || !newHabit.description.trim()) return;

    const habitPayload = {
      name: newHabit.name,
      description: newHabit.description,
      frequency: newHabit.frequency.charAt(0).toUpperCase() + newHabit.frequency.slice(1),
      category: newHabit.category,
      targetCount: newHabit.targetCount,
      priority: newHabit.priority,
    };

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5001/api/stats/addHabit', {
        method: 'POST',
        headers,
        body: JSON.stringify(habitPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const { habit: createdHabitFromBackend } = await response.json();

      const categoryObj = categories.find(c => c.name === createdHabitFromBackend.category);

      // Normalize backend shape and ensure required fields exist for immediate UI actions
      const normalizedHabitId = createdHabitFromBackend.habitId || createdHabitFromBackend.id || createdHabitFromBackend._id;

      const createdHabit = {
        ...createdHabitFromBackend,
        // ensure both habitId and id are present for consistency across the app
        habitId: normalizedHabitId,
        id: normalizedHabitId,
        category: categoryObj || { name: createdHabitFromBackend.category, color: '#6B7280', icon: 'Zap' },
        // fill in commonly expected fields with sensible defaults
        currentStreak: createdHabitFromBackend.streak ?? 0,
        progress: createdHabitFromBackend.progress ?? 0,
        completions: createdHabitFromBackend.completions ?? [],
        completed: createdHabitFromBackend.completed ?? false,
        lastCompleted: createdHabitFromBackend.lastCompleted ?? null,
        startDate: createdHabitFromBackend.startDate ?? null,
        resetDate: createdHabitFromBackend.resetDate ?? null,
        // keep frequency consistent (use lower-case type as used elsewhere)
        frequency: {
          type: (newHabit.frequency || 'daily').toLowerCase(),
          customValue: null
        }
      };

      dispatch({ type: 'ADD_HABIT', payload: createdHabit });

      // Reset form and close modal
      setShowCreateModal(false);
      setNewHabit({
        name: '',
        description: '',
        frequency: 'daily',
        category: 'Wellness',
        targetCount: 1,
        priority: 'Medium',
      });
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  const handleUpdateHabit = async () => {
    if (!editingHabit) return;
    const habitPayload = {
      ...editingHabit,
      habitId: editingHabit.habitId,
      frequency: editingHabit.frequency,
      priority: editingHabit.priority,
    };

    try {
      // Optimistically update the UI
      dispatch({ type: 'UPDATE_HABIT', payload: editingHabit });
      setEditingHabit(null);

      await api.put('/api/stats/updateHabit', habitPayload);
    } catch (error) {
      console.error("Failed to update habit:", error);
      // If the API call fails, we should probably revert the change
      // but for now, we'll just log the error.
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.delete('/api/stats/removeHabit', { data: { habitId } });
      dispatch({ type: 'DELETE_HABIT', payload: habitId });
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      // Check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        return;
      }

      const response = await api.put('/api/stats/progressHabit', { habitId });
      const progressResult = response.data;
      console.log('Progress result:', progressResult);

      // Refresh habits after progress
      const refreshResponse = await api.get('/stats/getHabits');
      const refreshData = refreshResponse.data;

      if (refreshData && refreshData.habits) {
        const transformedHabits = refreshData.habits.map((habit: any) => {
          const categoryObj = categories.find(c => c.name === habit.category);
          const frequencyObj = typeof habit.frequency === 'string'
            ? { type: habit.frequency, customValue: null }
            : habit.frequency;
          return {
            ...habit,
            id: habit.habitId,
            name: habit.name,
            description: habit.description,
            frequency: frequencyObj,
            category: categoryObj || { name: habit.category, color: '#6B7280', icon: 'Zap' },
            targetCount: habit.targetCount,
            priority: habit.priority,
            currentStreak: habit.streak,
            progress: habit.progress,
            completed: habit.completed,
            lastCompleted: habit.lastCompleted,
            startDate: habit.startDate,
            resetDate: habit.resetDate,
          };
        });
        dispatch({ type: 'SET_HABITS', payload: transformedHabits });
      }

      // We're removing this call to prevent sidebar refresh
      // await refreshStats();

    } catch (error) {
      // Only log error if it's not a 404
      if ((error as AxiosError).response?.status !== 404) {
        console.error("Failed to progress habit:", error);
      }
    }
  };

  const resetNewHabitForm = () => {
    setNewHabit({
      name: '',
      description: '',
      category: 'Wellness',
      frequency: 'daily',
      targetCount: 1,
      priority: 'Medium',
    });
  };

  // Generate dates for the date selector
  const dates = Array.from({ length: 7 }).map((_, index) => {
    return addDays(new Date(), index - 3); // 3 days before, today, and 3 days after
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gradient mb-2">Habit Tracker</h1>
        <p className="text-white/60 text-lg">
          Build consistency and track your progress over time
        </p>
      </motion.div>

      {/* Date Selector */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white/5 rounded-xl p-2 overflow-auto">
          {dates.map((date, index) => (
            <motion.button
              key={index}
              className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors
                ${isSameDay(date, selectedDate) ? 'bg-gradient-to-r from-primary-500/30 to-secondary-500/30 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              onClick={() => setSelectedDate(date)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xs font-medium uppercase">
                {format(date, 'EEE')}
              </span>
              <span className={`text-xl font-bold ${isToday(date) ? 'text-primary-400' : ''}`}>
                {format(date, 'd')}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('completed')}
            icon={Check}
          >
            Completed
          </Button>
          <Button
            variant={filterType === 'incomplete' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('incomplete')}
          >
            Incomplete
          </Button>
          <Button
            variant={filterType === 'high' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('high')}
          >
            High Priority
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
            />
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            New Habit
          </Button>
        </div>
      </div>

      {/* Habits List */}
      {filteredAndSortedHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAndSortedHabits.map((habit, index) => (
              <motion.div
                key={habit.habitId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  variant="glass"
                  className="p-5 border-l-4"
                  style={{ borderLeftColor: habit.category?.color || '#6B7280' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${habit.category?.color || '#6B7280'}30` }}
                      >
                        <HabitIcon name={habit.category?.icon || 'Zap'} className="w-5 h-5" style={{ color: habit.category?.color || '#6B7280' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{habit.name}</h3>
                        <p className="text-white/60 text-sm">{habit.category?.name || 'Uncategorized'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        disabled={habit.completed}
                        onClick={() => handleCompleteHabit(habit.habitId)}
                      >
                        {habit.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/40" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        icon={MoreHorizontal}
                        onClick={() => setEditingHabit(habit)}
                      />
                    </div>
                  </div>

                  {habit.description && (
                    <p className="text-white/70 text-sm mb-3">{habit.description}</p>
                  )}

                  <div className="flex justify-between items-center text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{habit.frequency?.type || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span><strong>{habit.currentStreak || 0}</strong> day streak</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Progress</span>
                      <span>
                        {habit.progress} / {habit.targetCount}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: '#4F46E5' }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(habit.progress / habit.targetCount) * 100}%`
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Card variant="glass" className="p-10">
            <Zap className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No habits found for this filter.
            </h3>
            <p className="text-white/60 mb-6">
              Ready to build some great habits? Let's start with the first one.
            </p>
            <Button
              size="lg"
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create a Habit
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Create Habit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Habit"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Habit Name</label>
            <input
              type="text"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              placeholder="e.g., Morning Meditation"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              placeholder="Why is this habit important to you?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-white mb-2">Category</label>
            <select
              value={newHabit.category}
              onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Frequency</label>
              <select
                value={newHabit.frequency}
                onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Target Count</label>
              <input
                type="number"
                min="1"
                value={newHabit.targetCount}
                onChange={(e) => setNewHabit({ ...newHabit, targetCount: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Priority</label>
            <div className="flex gap-2">
              <Button
                variant={newHabit.priority === 'Low' ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => setNewHabit({ ...newHabit, priority: 'Low' })}
              >
                Low
              </Button>
              <Button
                variant={newHabit.priority === 'Medium' ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => setNewHabit({ ...newHabit, priority: 'Medium' })}
              >
                Medium
              </Button>
              <Button
                variant={newHabit.priority === 'High' ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => setNewHabit({ ...newHabit, priority: 'High' })}
              >
                High
              </Button>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetNewHabitForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateHabit}
            >
              Create Habit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit"
      >
        {editingHabit && (
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Habit Name</label>
              <input
                type="text"
                value={editingHabit.name}
                onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Description</label>
              <textarea
                value={editingHabit.description || ''}
                onChange={(e) => setEditingHabit({ ...editingHabit, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Priority</label>
                <select
                  value={editingHabit.priority}
                  onChange={(e) => setEditingHabit({
                    ...editingHabit,
                    priority: e.target.value as 'Low' | 'Medium' | 'High'
                  })}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Target Count</label>
                <input
                  type="number"
                  min="1"
                  value={editingHabit.targetCount}
                  onChange={(e) => setEditingHabit({
                    ...editingHabit,
                    targetCount: parseInt(e.target.value) || 1
                  })}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                variant="danger"
                onClick={() => {
                  handleDeleteHabit(editingHabit.habitId);
                  setEditingHabit(null);
                }}
              >
                Delete
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingHabit(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateHabit}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};