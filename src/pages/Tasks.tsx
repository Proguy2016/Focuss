import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Calendar, Clock, Flag, CheckCircle2,
  Circle, MoreHorizontal, Edit, Trash2, Star, Target,
  ArrowUp, ArrowDown, Minus, Grid, List, Kanban, X, Play, ChevronDown, Move, AlertCircle, Zap
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/common/Button';
import { Task, TaskStatus, TaskPriority, SubTask } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';

type ViewMode = 'list' | 'kanban';
type FilterType = 'all' | 'todo' | 'inProgress' | 'completed' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'created' | 'alphabetical';
type SortKey = 'dueDate' | 'priority' | 'createdAt';
type FilterStatus = 'all' | 'todo' | 'completed';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#FBBF24',
  low: '#3B82F6',
  urgent: '#DC2626',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  urgent: 'Urgent',
};

// Priority icon component with colors and animations
const PriorityIcon: React.FC<{ priority: string }> = ({ priority }) => {
  const priorityLower = priority.toLowerCase();

  const getIconAndStyle = () => {
    switch (priorityLower) {
      case 'urgent':
        return {
          icon: Zap,
          color: '#DC2626',
          bgColor: 'rgba(220, 38, 38, 0.1)',
          animate: true
        };
      case 'high':
        return {
          icon: AlertCircle,
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          animate: false
        };
      case 'medium':
        return {
          icon: Flag,
          color: '#FBBF24',
          bgColor: 'rgba(251, 191, 36, 0.1)',
          animate: false
        };
      case 'low':
        return {
          icon: Minus,
          color: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          animate: false
        };
      default:
        return {
          icon: Flag,
          color: '#9CA3AF',
          bgColor: 'rgba(156, 163, 175, 0.1)',
          animate: false
        };
    }
  };

  const { icon: Icon, color, bgColor, animate } = getIconAndStyle();

  return (
    <motion.div
      className="flex items-center gap-1.5 px-2 py-1 rounded-md"
      style={{ backgroundColor: bgColor }}
      animate={animate ? { scale: [1, 1.05, 1] } : {}}
      transition={animate ? { duration: 1.5, repeat: Infinity } : {}}
    >
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-xs font-medium" style={{ color }}>
        {PRIORITY_LABELS[priorityLower] || priority}
      </span>
    </motion.div>
  );
};

const TasksHeader: React.FC<{
  onAddTask: () => void;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
}> = ({ onAddTask, viewMode, onSetViewMode }) => {
  return (
    <div className="p-4 rounded-t-lg border-b border-white/10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-gradient">Tasks</h1>
        <div className="flex items-center gap-4">
          <Button onClick={onAddTask} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Create Task</span>
          </Button>

          {/* View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-md">
            <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="icon" onClick={() => onSetViewMode('list')}><List className="w-5 h-5" /></Button>
            <Button variant={viewMode === 'kanban' ? 'primary' : 'ghost'} size="icon" onClick={() => onSetViewMode('kanban')}><Kanban className="w-5 h-5" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterBar: React.FC<{
  onSearch: (term: string) => void;
  onSortChange: (key: SortKey) => void;
  onFilterChange: (status: FilterStatus) => void;
  currentFilter: FilterStatus;
}> = ({ onSearch, onSortChange, onFilterChange, currentFilter }) => {
  const navigate = useNavigate();

  const handleFilterChange = (status: FilterStatus) => {
    onFilterChange(status);
    navigate(`/tasks?filter=${status}`);
  };

  return (
    <div className="p-4 flex items-center gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full h-10 bg-white/5 pl-10 pr-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={currentFilter === 'all' ? 'primary' : 'secondary'}
          onClick={() => handleFilterChange('all')}
        >
          All
        </Button>
        <Button
          variant={currentFilter === 'todo' ? 'primary' : 'secondary'}
          onClick={() => handleFilterChange('todo')}
        >
          To Do
        </Button>
        <Button
          variant={currentFilter === 'completed' ? 'primary' : 'secondary'}
          onClick={() => handleFilterChange('completed')}
        >
          Completed
        </Button>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onEdit, onDelete }: { task: Task, onEdit: () => void, onDelete: () => void }) => {
  const { dispatch } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/5 backdrop-blur-sm p-4 rounded-md shadow-lg border-l-4"
      style={{ borderColor: PRIORITY_COLORS[task.priority] }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1">
          <p className="font-semibold pr-2">{task.title}</p>
          <PriorityIcon priority={task.priority} />
        </div>
        <div className="relative" ref={menuRef}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreHorizontal className="w-5 h-5" />
          </Button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-lg z-20"
              >
                <div className="p-2">
                  <button onClick={onEdit} className="w-full text-left px-2 py-1.5 text-sm text-white rounded hover:bg-white/10">Edit Task</button>
                  <button onClick={onDelete} className="w-full text-left px-2 py-1.5 text-sm text-red-400 rounded hover:bg-red-500/20">Delete Task</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className="text-sm text-white/60 mt-1 line-clamp-2">{task.description}</p>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 border-t border-white/10 pt-2">
          <div
            className="flex items-center cursor-pointer text-sm text-white/70 mb-1"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showSubtasks ? 'rotate-180' : ''}`} />
            <span>Subtasks ({task.subtasks.length})</span>
          </div>

          <AnimatePresence>
            {showSubtasks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-2 space-y-1 mt-1">
                  {task.subtasks.map((sub: any, idx) => {
                    // Handle both string and object subtasks for backwards compatibility
                    const subtaskText = typeof sub === 'string' ? sub : sub.title;
                    const isCompleted = typeof sub === 'object' && sub.completed;

                    return (
                      <div
                        key={idx}
                        className="flex items-center text-sm group"
                      >
                        <span className={`ml-2 ${isCompleted ? 'line-through text-white/40' : 'text-white/80'}`}>
                          {subtaskText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {task.dueDate && (
        <div className="flex items-center text-xs text-white/50 mt-3">
          <Calendar className="w-3 h-3 mr-1.5" />
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
};

const KanbanColumn: React.FC<{ title: string, tasks: Task[], onEdit: (task: Task) => void, onDelete: (id: string) => void }> = ({ title, tasks, onEdit, onDelete }) => (
  <div className="bg-black/10 backdrop-blur-md rounded-lg p-3 flex-1 flex flex-col min-w-[300px]">
    <h3 className="font-bold text-lg mb-4 px-2">{title} <span className="text-sm text-white/50">{tasks.length}</span></h3>
    <div className="overflow-y-auto space-y-3 pr-1 flex-1">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onEdit={() => onEdit(task)} onDelete={() => onDelete(task.id)} />
      ))}
    </div>
  </div>
);

const TaskRow = ({ task, onFocus, onEdit, onDelete, onStatusToggle, onUpdateTask }: {
  task: Task,
  onFocus: () => void,
  onEdit: () => void,
  onDelete: () => void,
  onStatusToggle: () => void,
  onUpdateTask: (updatedTask: Task) => void
}) => {
  return (
    <>
      <motion.tr
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={
          `border-b border-white/5 hover:bg-white/5 transition-colors duration-200`
        }
      >
        <td className="p-4 w-12">
          <button onClick={(e) => { e.stopPropagation(); onStatusToggle(); }} className="flex items-center justify-center group">
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-white/40 group-hover:text-white" />
            )}
          </button>
        </td>
        <td className="p-4">
          <div>
            <p className={`font-medium ${task.completed ? 'line-through text-white/50' : ''}`}>
              {task.title}
            </p>
          </div>
          {task.description && <p className="text-sm text-white/40 mt-1 hidden sm:block">{task.description}</p>}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="pl-4 mt-2 space-y-1">
              {task.subtasks.map((sub: any, idx) => {
                const subtaskText = typeof sub === 'string' ? sub : sub.title;
                const isCompleted = typeof sub === 'object' && sub.completed;
                return (
                  <div key={idx} className="flex items-center text-sm">
                    <span className={`text-white/80 ${isCompleted ? 'line-through text-white/50' : ''}`}>{subtaskText}</span>
                  </div>
                );
              })}
            </div>
          )}
        </td>
        <td className="p-4 hidden md:table-cell">
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
        </td>
        <td className="p-4 hidden sm:table-cell">
          <PriorityIcon priority={task.priority} />
        </td>
        <td className="p-4 hidden lg:table-cell">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${task.completed ? 'bg-green-500/20 text-green-300' :
              'bg-gray-500/20 text-gray-300'
              }`}
          >
            {task.completed ? 'Completed' : 'To Do'}
          </span>
        </td>
        <td className="p-4 text-right">
          <div className="flex justify-end items-center gap-2">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onFocus(); }} title="Focus on this task">
              <Play className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit task">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-500/70 hover:bg-red-500/20" title="Delete task">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </motion.tr>
    </>
  );
}

export const Tasks: React.FC = () => {
  const { dispatch } = useApp(); // Assuming useApp provides dispatch for global state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      const response = await fetch('http://localhost:5001/api/stats/getTasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        // No tasks found for this user, treat as empty list
        setTasks([]);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        console.log(`this is the token: ${token}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.tasks) {
        throw new Error("Tasks not found in response");
      }

      const mappedTasks = data.tasks.map((task: any) => ({
        id: task._id || task.taskId,
        title: task.taskTitle,
        description: task.taskDescription,
        priority: task.priority,
        dueDate: task.dueDate,
        completed: task.completed,
        subtasks: Array.isArray(task.subTasks) ? [...task.subTasks] : [],
        category: task.category,
        tags: task.tags,
        estimatedTime: task.estimatedTime,
      }));
      setTasks(mappedTasks);

    } catch (e: any) {
      setError(e.message || 'Failed to fetch tasks.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter') as FilterStatus;
    if (filter && ['all', 'todo', 'completed'].includes(filter)) {
      setFilterStatus(filter);
    }
    const action = params.get('action');
    if (action === 'new') {
      openCreateModal();
    }
  }, [location]);

  const sortedAndFilteredTasks = useMemo(() => {
    let tasksToFilter = [...tasks];
    if (filterStatus !== 'all') {
      tasksToFilter = tasksToFilter.filter(t => t.completed);
    }
    if (searchTerm) {
      tasksToFilter = tasksToFilter.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    tasksToFilter.sort((a, b) => {
      if (sortKey === 'dueDate' && a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortKey === 'priority') {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1, urgent: 4 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.title.localeCompare(b.title);
    });
    return tasksToFilter;
  }, [tasks, filterStatus, searchTerm, sortKey]);

  const handleFocusTask = (task: Task) => {
    // dispatch({ type: 'SET_FOCUS_TASK', payload: task });
    navigate('/focus');
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  const mapTaskFromBackend = (task: any) => ({
    id: task._id || task.taskId || task.id,
    title: task.taskTitle || task.title,
    description: task.taskDescription || task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    completed: task.completed,
    subtasks: Array.isArray(task.subTasks) ? [...task.subTasks] : (Array.isArray(task.subtasks) ? [...task.subtasks] : []),
    category: task.category,
    tags: task.tags,
    estimatedTime: task.estimatedTime,
  });

  const handleSaveTask = async (taskData: any) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // Transform subtasks to the format expected by backend
      const transformedSubtasks = (taskData.subtasks || []).map((sub: any) => {
        // If it's already an object with title property, return as is
        if (typeof sub === 'object' && sub.title) {
          return sub;
        }
        // If it's a string, convert to object format
        if (typeof sub === 'string') {
          return { title: sub, completed: false };
        }
        // Fallback for any other case
        return { title: String(sub), completed: false };
      });

      const payload: any = {
        ...(taskData.id && { taskId: taskData.id }),
        taskTitle: taskData.title,
        taskDescription: taskData.description,
        priority: taskData.priority,
        category: taskData.category,
        estimatedTime: taskData.estimatedTime,
        dueDate: taskData.dueDate || null,
        tags: taskData.tags || [],
        subTasks: transformedSubtasks,
        completed: taskData.completed || false,
      };

      let response;
      if (taskData.id) {
        response = await fetch(`http://localhost:5001/api/stats/updateTask`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('http://localhost:5001/api/stats/addTask', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to save task. Server responded with ${response.status}: ${errorBody}`);
      }

      const savedTask = await response.json();
      if (Array.isArray(savedTask.tasks)) {
        // Backend returned the full tasks array
        const mappedTasks = savedTask.tasks
          .filter((t: any) => typeof t === 'object' && t.taskTitle)
          .map(mapTaskFromBackend);
        setTasks(mappedTasks);
      } else {
        // Backend returned a single task
        const mappedTask = mapTaskFromBackend(savedTask.task || savedTask);
        setTasks(prevTasks => {
          if (taskData.id) {
            return prevTasks.map(task =>
              task.id === mappedTask.id ? mappedTask : task
            );
          } else {
            return [...prevTasks, mappedTask];
          }
        });
      }
      closeModal();
    } catch (e: any) {
      setError(e.message || 'An error occurred while saving the task.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication token not found.");
      return;
    }
    try {
      const payload = {
        taskId: id,
        deleteTask: true // or false, depending on your logic
      };
      const response = await fetch(`http://localhost:5001/api/stats/removeTask`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      // No need to fetch all tasks again, just remove the deleted one from state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));

    } catch (e: any) {
      setError(e.message || 'Failed to delete task.');
      console.error(e);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newCompletedStatus = !task.completed;

    // Optimistic update
    setTasks(currentTasks => currentTasks.map(t =>
      t.id === task.id ? { ...t, completed: newCompletedStatus } : t
    ));

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication token not found.");
      // Revert optimistic update
      setTasks(currentTasks => currentTasks.map(t =>
        t.id === task.id ? { ...t, completed: task.completed } : t
      ));
      return;
    }

    try {
      const endpoint = newCompletedStatus
        ? 'http://localhost:5001/api/stats/task'
        : 'http://localhost:5001/api/stats/dec';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId: task.id }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update task completion. Server responded with ${response.status}: ${errorBody}`);
      }

      // Assuming the backend returns the updated task
      const updatedTaskFromBackend = await response.json();

      // Update local state with the actual task data from the backend
      setTasks(currentTasks => currentTasks.map(t =>
        t.id === updatedTaskFromBackend.id ? updatedTaskFromBackend : t
      ));

      console.log(`Successfully updated task completion for task ${task.id}`);
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
      console.error(e);
      // Revert optimistic update on failure
      setTasks(currentTasks => currentTasks.map(t =>
        t.id === task.id ? { ...t, completed: task.completed } : t
      ));
    }
  };

  const handleQuickAddTask = (title: string) => {
    const newTaskData = {
      title,
      description: '',
      priority: 'medium',
      subtasks: [],
      dueDate: ''
    };
    handleSaveTask(newTaskData);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-black/20 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden">
        <TasksHeader
          onAddTask={openCreateModal}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
        />
        <FilterBar
          onSearch={setSearchTerm}
          onSortChange={setSortKey}
          onFilterChange={setFilterStatus}
          currentFilter={filterStatus}
        />

        {loading && <div className="p-6 text-center">Loading tasks...</div>}
        {error && <div className="p-6 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'list' ? (
                <div className="p-2 sm:p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-4 w-12"></th>
                        <th className="p-4">Task Name</th>
                        <th className="p-4 hidden md:table-cell">Due Date</th>
                        <th className="p-4 hidden sm:table-cell">Priority</th>
                        <th className="p-4 hidden lg:table-cell">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAndFilteredTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onFocus={() => handleFocusTask(task)}
                          onEdit={() => openEditModal(task)}
                          onDelete={() => handleDeleteTask(task.id)}
                          onStatusToggle={() => toggleTaskStatus(task)}
                          onUpdateTask={(updatedTask) => {
                            setTasks(currentTasks => currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                            // Potentially dispatch to global state or make API call if subtask changes need to be persisted
                            // For now, this matches TaskCard's local update behavior for subtasks.
                            // dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex gap-6 p-6 overflow-x-auto">
                  <KanbanColumn title="To Do" tasks={sortedAndFilteredTasks.filter(t => t.completed)} onEdit={openEditModal} onDelete={handleDeleteTask} />
                  <KanbanColumn title="Completed" tasks={sortedAndFilteredTasks.filter(t => !t.completed)} onEdit={openEditModal} onDelete={handleDeleteTask} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
};


const TaskModal = ({ isOpen, onClose, onSave, task }: { isOpen: boolean, onClose: () => void, onSave: (taskData: any) => void, task: Task | null }) => {
  const [taskData, setTaskData] = useState<any>({});

  useEffect(() => {
    if (task) {
      // Convert subtask objects to strings for editing in the dialog
      const subtasksForEditing = (task.subtasks || []).map((sub: any) =>
        typeof sub === 'string' ? sub : sub.title
      );

      setTaskData({
        ...task,
        subtasks: subtasksForEditing,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'Medium',
        category: task.category || '',
        estimatedTime: task.estimatedTime || '',
      });
    } else {
      setTaskData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        category: '',
        subtasks: [],
        estimatedTime: '',
      });
    }
  }, [task, isOpen]);

  const handleSubtaskChange = (index: number, field: string, value: any) => {
    const newSubtasks = [...(taskData.subtasks || [])];
    newSubtasks[index] = value;
    setTaskData({ ...taskData, subtasks: newSubtasks });
  };

  const addSubtask = () => {
    setTaskData({
      ...taskData,
      subtasks: [...(taskData.subtasks || []), '']
    });
  };

  const removeSubtask = (index: number) => {
    const newSubtasks = [...(taskData.subtasks || [])];
    newSubtasks.splice(index, 1);
    setTaskData({ ...taskData, subtasks: newSubtasks });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="relative bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl w-full max-w-2xl"
          >
            <form onSubmit={(e) => { e.preventDefault(); onSave(taskData); }}>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gradient">{task ? 'Edit Task' : 'Create New Task'}</h2>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:bg-white/10">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <label className="text-sm font-medium text-white/80 block mb-2">Task Title</label>
                    <input
                      type="text"
                      value={taskData.title || ''}
                      onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Finish the project report"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 block mb-2">Description</label>
                    <textarea
                      value={taskData.description || ''}
                      onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Add more details about your task..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 block mb-2">Estimated Time (minutes)</label>
                    <input
                      type="number"
                      value={taskData.estimatedTime || ''}
                      onChange={(e) => setTaskData({ ...taskData, estimatedTime: Number(e.target.value) })}
                      className="w-full bg-white/5 border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., 60"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-white/80 block mb-2">Due Date</label>
                      <input
                        type="date"
                        value={taskData.dueDate || ''}
                        onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/80 block mb-2">Priority</label>
                      <select
                        value={taskData.priority || 'Medium'}
                        onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                        className="w-full bg-white/5 border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 block mb-2">Category</label>
                    <input
                      type="text"
                      value={taskData.category || ''}
                      onChange={e => setTaskData({ ...taskData, category: e.target.value })}
                      className="w-full bg-white/5 border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Work, Personal, School"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 block mb-2">Subtasks</label>
                    {taskData.subtasks?.map((sub: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={sub}
                          onChange={(e) => handleSubtaskChange(index, '', e.target.value)}
                          className="w-full bg-white/5 border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Subtask name"
                          required
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeSubtask(index)} className="text-red-500/70 hover:bg-red-500/20 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addSubtask} className="mt-2 text-sm">
                      Add Subtask
                    </Button>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                  <Button type="submit">
                    {task ? 'Save Changes' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};