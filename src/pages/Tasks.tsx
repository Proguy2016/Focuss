import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Calendar, Clock, Flag, CheckCircle2,
  Circle, MoreHorizontal, Edit, Trash2, Star, Target,
  ArrowUp, ArrowDown, Minus, Grid, List, Kanban, X
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Task, TaskStatus, TaskPriority, SubTask } from '../types';

type ViewMode = 'list' | 'grid' | 'kanban';
type FilterType = 'all' | 'todo' | 'inProgress' | 'completed' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'created' | 'alphabetical';

export const Tasks: React.FC = () => {
  const { state, dispatch, dataService, refreshStats } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('dueDate');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority['level'],
    category: '',
    tags: [] as string[],
    subtasks: [] as { title: string }[],
    dueDate: '',
    estimatedTime: '',
  });

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = state.tasks.filter(task => {
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      switch (filterType) {
        case 'todo':
          return task.status.type === 'todo';
        case 'inProgress':
          return task.status.type === 'inProgress';
        case 'completed':
          return task.status.type === 'completed';
        case 'overdue':
          return task.dueDate && new Date(task.dueDate) < new Date() && task.status.type !== 'completed';
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority.level] - priorityOrder[a.priority.level];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [state.tasks, searchTerm, filterType, sortType]);

  const getPriorityColor = (level: TaskPriority['level']) => {
    switch (level) {
      case 'urgent':
      case 'high':
        return '#EF4444'; // Red
      case 'medium':
        return '#F59E0B'; // Orange
      case 'low':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: state.user?.id || '',
      title: newTask.title,
      description: newTask.description || undefined,
      priority: {
        level: newTask.priority,
        color: getPriorityColor(newTask.priority)
      },
      urgency: {
        level: newTask.priority,
        color: getPriorityColor(newTask.priority)
      },
      status: { type: 'todo', label: 'To Do', color: '#6B7280' },
      category: newTask.category || 'General',
      tags: newTask.tags,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      estimatedTime: newTask.estimatedTime ? parseInt(newTask.estimatedTime) : undefined,
      subtasks: newTask.subtasks.map(st => ({ id: Date.now().toString() + st.title, title: st.title, completed: false })),
      dependencies: [],
    };

    try {
      const createdTask = await dataService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: createdTask });
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        tags: [],
        subtasks: [],
        dueDate: '',
        estimatedTime: '',
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      await dataService.updateTask(editingTask);
      dispatch({ type: 'UPDATE_TASK', payload: editingTask });
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatusType: TaskStatus['type'] = task.status.type === 'completed' ? 'todo' : 'completed';
    const updatedTask: Task = {
      ...task,
      status: {
        type: newStatusType,
        label: newStatusType === 'completed' ? 'Completed' : 'To Do',
        color: newStatusType === 'completed' ? '#10B981' : '#6B7280'
      },
      completedAt: newStatusType === 'completed' ? new Date() : undefined
    };

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await dataService.updateTask(updatedTask);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      if (newStatusType === 'completed') {
        try {
          await fetch('http://localhost:5001/api/stats/task', {
            method: 'PUT',
            credentials: 'include',
            headers,
          });
          await refreshStats();
        } catch (err) {
          console.error('Failed to update completed tasks on server:', err);
        }
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await dataService.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <ArrowUp className="w-4 h-4 text-error-400" />;
      case 'high':
        return <ArrowUp className="w-4 h-4 text-warning-400" />;
      case 'medium':
        return <Minus className="w-4 h-4 text-primary-400" />;
      case 'low':
        return <ArrowDown className="w-4 h-4 text-success-400" />;
      default:
        return <Minus className="w-4 h-4 text-primary-400" />;
    }
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return 'Overdue';
    if (diffInDays === 0) return 'Due today';
    if (diffInDays === 1) return 'Due tomorrow';
    return `Due in ${diffInDays} days`;
  };

  const TaskCard: React.FC<{ task: Task; index: number }> = ({ task, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card
        variant="glass"
        hover
        className={`p-4 cursor-pointer transition-all duration-200 ${task.status.type === 'completed' ? 'opacity-60' : ''
          }`}
        style={{ borderLeft: `4px solid ${getPriorityColor(task.priority.level)}` }}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTaskStatus(task)}
            className="mt-1 transition-colors"
          >
            {task.status.type === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-success-400" />
            ) : (
              <Circle className="w-5 h-5 text-white/40 hover:text-white" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-semibold text-white ${task.status.type === 'completed' ? 'line-through' : ''
                }`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit}
                  onClick={() => setEditingTask(task)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => deleteTask(task.id)}
                />
              </div>
            </div>

            {task.description && (
              <p className="text-white/60 text-sm mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                {getPriorityIcon(task.priority.level)}
                <span className="text-white/60 capitalize">{task.priority.level}</span>
              </div>

              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span className={`text-sm ${new Date(task.dueDate) < new Date() && task.status.type !== 'completed'
                    ? 'text-error-400'
                    : 'text-white/60'
                    }`}>
                    {formatDueDate(new Date(task.dueDate))}
                  </span>
                </div>
              )}

              {task.estimatedTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span className="text-white/60">{task.estimatedTime}m</span>
                </div>
              )}

              {task.category && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-md text-xs">
                  {task.category}
                </span>
              )}
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {task.subtasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Subtasks</span>
                  <span className="text-white/60">
                    {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                  <div
                    className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const KanbanColumn: React.FC<{ status: string; tasks: Task[] }> = ({ status, tasks }) => (
    <div className="flex-1 min-w-80">
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white capitalize">
            {status === 'inProgress' ? 'In Progress' : status}
          </h3>
          <span className="text-white/60 text-sm">{tasks.length}</span>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Tasks</h1>
          <p className="text-white/60">
            Organize and track your tasks efficiently
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          New Task
        </Button>
      </motion.div>

      {/* Filters and Controls */}
      <Card variant="glass" className="p-4 glass-pane">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Tasks</option>
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Created</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* View Mode */}
            <div className="flex glass rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                icon={List}
                onClick={() => setViewMode('list')}
              />
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                icon={Grid}
                onClick={() => setViewMode('grid')}
              />
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
                size="sm"
                icon={Target}
                onClick={() => setViewMode('kanban')}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Task Views */}
      <div className="mt-8">
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn
              status="To Do"
              tasks={filteredAndSortedTasks.filter(t => t.status.type === 'todo')}
            />
            <KanbanColumn
              status="In Progress"
              tasks={filteredAndSortedTasks.filter(t => t.status.type === 'inProgress')}
            />
            <KanbanColumn
              status="Completed"
              tasks={filteredAndSortedTasks.filter(t => t.status.type === 'completed')}
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </div>
        )}

        {filteredAndSortedTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card variant="glass" className="p-10 inline-block">
              <CheckCircle2 className="w-16 h-16 text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">You're all caught up!</h3>
              <p className="text-white/60 mb-6">No tasks match the current filter.</p>
              <Button
                size="lg"
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create a Task
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Title *</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="input-field w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              className="input-field w-full h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                className="input-field w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Category</label>
              <input
                type="text"
                value={newTask.category}
                onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Work, Personal"
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Estimated Time (minutes)</label>
              <input
                type="number"
                value={newTask.estimatedTime}
                onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder="30"
                className="input-field w-full"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Subtasks</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                className="input-field w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && subtaskTitle.trim()) {
                    e.preventDefault();
                    setNewTask(prev => ({ ...prev, subtasks: [...prev.subtasks, { title: subtaskTitle }] }));
                    setSubtaskTitle('');
                  }
                }}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  if (subtaskTitle.trim()) {
                    setNewTask(prev => ({ ...prev, subtasks: [...prev.subtasks, { title: subtaskTitle }] }));
                    setSubtaskTitle('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {newTask.subtasks.map((sub, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded-md">
                  <span className="text-white/80">{sub.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setNewTask(prev => ({ ...prev, subtasks: prev.subtasks.filter((_, i) => i !== index) }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="input-field w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    if (!newTask.tags.includes(tagInput.trim())) {
                      setNewTask(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                    }
                    setTagInput('');
                  }
                }}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  if (tagInput.trim() && !newTask.tags.includes(tagInput.trim())) {
                    setNewTask(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                    setTagInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {newTask.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                  <span className="text-white/80 text-sm">#{tag}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    className="w-4 h-4"
                    onClick={() => setNewTask(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleCreateTask}
              fullWidth
              disabled={!newTask.title.trim()}
            >
              Create Task
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

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Title *</label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                placeholder="Enter task title..."
                className="input-field w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Description</label>
              <textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                placeholder="Enter task description..."
                className="input-field w-full h-24 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Priority</label>
                <select
                  value={editingTask.priority.level}
                  onChange={(e) => {
                    const newLevel = e.target.value as TaskPriority['level'];
                    setEditingTask({
                      ...editingTask,
                      priority: { level: newLevel, color: getPriorityColor(newLevel) }
                    });
                  }}
                  className="input-field w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Category</label>
                <input
                  type="text"
                  value={editingTask.category}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                  placeholder="e.g., Work, Personal"
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: new Date(e.target.value) })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Estimated Time (minutes)</label>
                <input
                  type="number"
                  value={editingTask.estimatedTime}
                  onChange={(e) => setEditingTask({ ...editingTask, estimatedTime: parseInt(e.target.value) })}
                  placeholder="30"
                  className="input-field w-full"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Subtasks</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask..."
                  className="input-field w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && subtaskTitle.trim()) {
                      e.preventDefault();
                      setEditingTask({ ...editingTask, subtasks: [...editingTask.subtasks, { id: Date.now().toString(), title: subtaskTitle, completed: false }] });
                      setSubtaskTitle('');
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (subtaskTitle.trim()) {
                      setEditingTask({ ...editingTask, subtasks: [...editingTask.subtasks, { id: Date.now().toString(), title: subtaskTitle, completed: false }] });
                      setSubtaskTitle('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {editingTask.subtasks.map((sub, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => {
                          const newSubtasks = [...editingTask.subtasks];
                          newSubtasks[index].completed = !newSubtasks[index].completed;
                          setEditingTask({ ...editingTask, subtasks: newSubtasks });
                        }}
                        className="form-checkbox h-4 w-4 bg-transparent"
                      />
                      <span className={`text-white/80 ${sub.completed ? 'line-through' : ''}`}>{sub.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={() => setEditingTask({ ...editingTask, subtasks: editingTask.subtasks.filter((_, i) => i !== index) })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="input-field w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      if (!editingTask.tags.includes(tagInput.trim())) {
                        setEditingTask({ ...editingTask, tags: [...editingTask.tags, tagInput.trim()] });
                      }
                      setTagInput('');
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (tagInput.trim() && !editingTask.tags.includes(tagInput.trim())) {
                      setEditingTask({ ...editingTask, tags: [...editingTask.tags, tagInput.trim()] });
                      setTagInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {editingTask.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                    <span className="text-white/80 text-sm">#{tag}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      className="w-4 h-4"
                      onClick={() => setEditingTask({ ...editingTask, tags: editingTask.tags.filter((_, i) => i !== index) })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleUpdateTask}
              fullWidth
              disabled={!editingTask.title.trim()}
            >
              Save Changes
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditingTask(null)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};