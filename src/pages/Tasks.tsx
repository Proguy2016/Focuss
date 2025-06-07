import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Calendar, Clock, Flag, CheckCircle2, 
  Circle, MoreHorizontal, Edit, Trash2, Star, Target, 
  ArrowUp, ArrowDown, Minus, Grid, List, Kanban
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Task, TaskStatus, TaskPriority } from '../types';

type ViewMode = 'list' | 'grid' | 'kanban';
type FilterType = 'all' | 'todo' | 'inProgress' | 'completed' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'created' | 'alphabetical';

export const Tasks: React.FC = () => {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('dueDate');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '',
    tags: [] as string[],
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

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: state.user?.id || '',
      title: newTask.title,
      description: newTask.description || undefined,
      priority: {
        level: newTask.priority,
        color: newTask.priority === 'high' ? '#EF4444' : 
               newTask.priority === 'medium' ? '#F59E0B' : '#10B981'
      },
      urgency: {
        level: newTask.priority,
        color: newTask.priority === 'high' ? '#EF4444' : 
               newTask.priority === 'medium' ? '#F59E0B' : '#10B981'
      },
      status: { type: 'todo', label: 'To Do', color: '#6B7280' },
      category: newTask.category || 'General',
      tags: newTask.tags,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      estimatedTime: newTask.estimatedTime ? parseInt(newTask.estimatedTime) : undefined,
      subtasks: [],
      dependencies: [],
    };

    // In a real app, this would call the data service
    console.log('Creating task:', task);
    setShowCreateModal(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      tags: [],
      dueDate: '',
      estimatedTime: '',
    });
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status.type === 'completed' ? 'todo' : 'completed';
    const updatedTask = {
      ...task,
      status: {
        type: newStatus,
        label: newStatus === 'completed' ? 'Completed' : 'To Do',
        color: newStatus === 'completed' ? '#10B981' : '#6B7280'
      }
    };
    // In a real app, this would update the task
    console.log('Toggling task status:', updatedTask);
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
        className={`p-4 cursor-pointer transition-all duration-200 ${
          task.status.type === 'completed' ? 'opacity-60' : ''
        }`}
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
              <h3 className={`font-semibold text-white ${
                task.status.type === 'completed' ? 'line-through' : ''
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
                  onClick={() => console.log('Delete task:', task.id)}
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
                  <span className={`text-sm ${
                    new Date(task.dueDate) < new Date() && task.status.type !== 'completed'
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
      <Card variant="glass" className="p-4">
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
                className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="glass px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="glass px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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

      {/* Tasks Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-6 overflow-x-auto pb-4"
          >
            <KanbanColumn
              status="todo"
              tasks={filteredAndSortedTasks.filter(t => t.status.type === 'todo')}
            />
            <KanbanColumn
              status="inProgress"
              tasks={filteredAndSortedTasks.filter(t => t.status.type === 'inProgress')}
            />
            <KanbanColumn
              status="completed"
              tasks={filteredAndSortedTasks.filter(t => t.status.type === 'completed')}
            />
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filteredAndSortedTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredAndSortedTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">No tasks found</h3>
          <p className="text-white/40">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first task to get started'}
          </p>
        </motion.div>
      )}

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
    </div>
  );
};