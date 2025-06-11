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
import { Habit, HabitCategory, HabitCompletion } from '../types';

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
  const { state, dispatch, dataService } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingHabit, setCompletingHabit] = useState<Habit | null>(null);
  const [completionCount, setCompletionCount] = useState(1);
  const [completionNote, setCompletionNote] = useState('');

  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'Wellness',
    frequency: 'daily',
    targetCount: 1,
    priority: 'medium' as 'low' | 'medium' | 'high',
    color: '#10B981',
    icon: 'Zap',
    reminders: [{
      time: '09:00',
      enabled: true,
      message: 'Time for your habit!',
    }]
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
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:5001/api/stats/getHabits', {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch habits');
        }

        const data = await response.json();
        if (data && data.habits) {
          dispatch({ type: 'SET_HABITS', payload: data.habits });
        }
      } catch (error) {
        console.error("Failed to fetch habits:", error);
      }
    };

    fetchHabits();
  }, [dispatch]);

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

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : '#6B7280'; // Default gray
  };

  // Filter and sort habits
  const filteredAndSortedHabits = useMemo(() => {
    return [...state.habits].sort((a, b) => {
      // Search filter
      if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase()) && !b.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return 0;
      }
      if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return 1;
      }
      if (searchTerm && !b.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return -1;
      }

      // Status filter
      const aCompleted = isHabitCompletedForDate(a, selectedDate);
      const bCompleted = isHabitCompletedForDate(b, selectedDate);
      if (aCompleted && !bCompleted) {
        return -1;
      }
      if (!aCompleted && bCompleted) {
        return 1;
      }

      // Priority filter
      if (a.priority === 'high' && b.priority !== 'high') {
        return -1;
      }
      if (a.priority !== 'high' && b.priority === 'high') {
        return 1;
      }

      // Frequency filter
      if (a.frequency.type === 'daily' && b.frequency.type !== 'daily') {
        return -1;
      }
      if (a.frequency.type !== 'daily' && b.frequency.type === 'daily') {
        return 1;
      }

      return 0;
    });
  }, [state.habits, state.habitCompletions, searchTerm, selectedDate]);

  const handleCreateHabit = async () => {
    if (!newHabit.name.trim()) return;

    const habitPayload = {
      name: newHabit.name,
      description: newHabit.description,
      frequency: newHabit.frequency.charAt(0).toUpperCase() + newHabit.frequency.slice(1),
      category: newHabit.category,
      targetCount: newHabit.targetCount,
      priority: newHabit.priority.charAt(0).toUpperCase() + newHabit.priority.slice(1),
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

      const { habit: createdHabit } = await response.json();

      dispatch({ type: 'ADD_HABIT', payload: createdHabit });

      // Reset form and close modal
      setShowCreateModal(false);
      setNewHabit({
        name: '',
        description: '',
        frequency: 'daily',
        category: '',
        targetCount: 1,
        priority: 'medium',
        currentStreak: 0,
        longestStreak: 0,
        completions: [],
      });
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  const handleUpdateHabit = async () => {
    if (!editingHabit) return;

    const habitPayload = {
      ...editingHabit,
      frequency: editingHabit.frequency.charAt(0).toUpperCase() + editingHabit.frequency.slice(1),
      priority: editingHabit.priority.charAt(0).toUpperCase() + editingHabit.priority.slice(1),
    };

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5001/api/stats/updateHabit', {
        method: 'PUT',
        headers,
        body: JSON.stringify(habitPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const { habit: updatedHabit } = await response.json();

      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit });
      setEditingHabit(null);
    } catch (error) {
      console.error("Failed to update habit:", error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5001/api/stats/removeHabit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ habitId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      dispatch({ type: 'DELETE_HABIT', payload: habitId });
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5001/api/stats/progressHabit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ habitId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const { habit: updatedHabit } = await response.json();
      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit });

    } catch (error) {
      console.error("Failed to progress habit:", error);
    }
  };

  const resetNewHabitForm = () => {
    setNewHabit({
      name: '',
      description: '',
      category: 'Wellness',
      frequency: 'daily',
      targetCount: 1,
      priority: 'medium',
      color: '#10B981',
      icon: 'Zap',
      reminders: [{
        time: '09:00',
        enabled: true,
        message: 'Time for your habit!',
      }]
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
                  style={{ borderLeftColor: habit.color }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${habit.color}30` }}
                      >
                        <HabitIcon name={habit.icon} className="w-5 h-5" style={{ color: habit.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{habit.name}</h3>
                        <p className="text-white/60 text-sm">{habit.category.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => {
                          if (!isHabitCompletedForDate(habit, selectedDate)) {
                            setCompletingHabit(habit);
                            setShowCompletionModal(true);
                          }
                        }}
                      >
                        {isHabitCompletedForDate(habit, selectedDate) ? (
                          <CheckCircle2 className="w-5 h-5 text-success-400" />
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
                      <span>{habit.frequency.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>{habit.currentStreak} day streak</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Progress</span>
                      <span>
                        {isHabitCompletedForDate(habit, selectedDate) ? habit.targetCount : 0} / {habit.targetCount}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: habit.color }}
                        initial={{ width: 0 }}
                        animate={{
                          width: isHabitCompletedForDate(habit, selectedDate) ? '100%' : '0%'
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
            <label className="block text-white mb-2">Description (Optional)</label>
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
                <option value="custom">Custom</option>
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
                variant={newHabit.priority === 'low' ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => setNewHabit({ ...newHabit, priority: 'low' })}
              >
                Low
              </Button>
              <Button
                variant={newHabit.priority === 'medium' ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => setNewHabit({ ...newHabit, priority: 'medium' })}
              >
                Medium
              </Button>
              <Button
                variant={newHabit.priority === 'high' ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => setNewHabit({ ...newHabit, priority: 'high' })}
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
                    priority: e.target.value as 'low' | 'medium' | 'high'
                  })}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
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
                  handleDeleteHabit(editingHabit.id);
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

      {/* Complete Habit Modal */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setCompletingHabit(null);
        }}
        title="Complete Habit"
      >
        {completingHabit && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${completingHabit.color}30` }}
              >
                <HabitIcon name={completingHabit.icon} className="w-5 h-5" style={{ color: completingHabit.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{completingHabit.name}</h3>
                <p className="text-white/60 text-sm">{completingHabit.category.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Count (How many times?)</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletionCount(Math.max(1, completionCount - 1))}
                >
                  -
                </Button>
                <input
                  type="number"
                  min="1"
                  value={completionCount}
                  onChange={(e) => setCompletionCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center px-2 py-1 bg-white/10 rounded-lg text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletionCount(completionCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Notes (Optional)</label>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                rows={3}
                placeholder="How did it go? Any observations?"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompletionModal(false);
                  setCompletingHabit(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleCompleteHabit(completingHabit.habitId)}
              >
                Mark as Complete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};