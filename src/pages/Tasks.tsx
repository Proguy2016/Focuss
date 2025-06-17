import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Calendar, Clock, Flag, CheckCircle2,
  Circle, MoreHorizontal, Edit, Trash2, Star, Target,
  ArrowUp, ArrowDown, Minus, Grid, List, Kanban, X, Play, ChevronDown, Move
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/common/Button';
import { Task, TaskStatus, TaskPriority, SubTask } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';

type ViewMode = 'list' | 'grid' | 'kanban';
type FilterType = 'all' | 'todo' | 'inProgress' | 'completed' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'created' | 'alphabetical';
type SortKey = 'dueDate' | 'priority' | 'createdAt';
type FilterStatus = 'all' | 'todo' | 'inProgress' | 'completed';

const TasksHeader: React.FC<{
    onAddTask: (title: string) => void;
    viewMode: ViewMode;
    onSetViewMode: (mode: ViewMode) => void;
}> = ({ onAddTask, viewMode, onSetViewMode }) => {
    const [taskTitle, setTaskTitle] = useState('');

    const handleAddTask = () => {
        if (taskTitle.trim()) {
            onAddTask(taskTitle);
            setTaskTitle('');
        }
    };

    return (
        <div className="p-4 bg-gray-900/50 rounded-t-lg border-b border-white/10">
            <div className="flex items-center gap-4">
                {/* Quick Add */}
                <div className="flex-1 relative">
                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder="Add a new task..."
                        className="w-full h-10 bg-white/5 pl-10 pr-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <Button onClick={handleAddTask}>Add Task</Button>

                {/* View Switcher */}
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-md">
                    <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="icon" onClick={() => onSetViewMode('list')}><List className="w-5 h-5"/></Button>
                    <Button variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="icon" onClick={() => onSetViewMode('grid')}><Grid className="w-5 h-5"/></Button>
                    <Button variant={viewMode === 'kanban' ? 'primary' : 'ghost'} size="icon" onClick={() => onSetViewMode('kanban')}><Kanban className="w-5 h-5"/></Button>
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
        // Update URL with filter parameter
        navigate(`/tasks?filter=${status}`);
    };
    
    return (
        <div className="p-4 flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input
                    type="text"
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full h-10 bg-white/5 pl-10 pr-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            {/* Filter & Sort Dropdown */}
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
                    variant={currentFilter === 'inProgress' ? 'primary' : 'secondary'} 
                    onClick={() => handleFilterChange('inProgress')}
                 >
                    In Progress
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

const TaskCard = ({ task }: { task: Task }) => {
    const { dispatch } = useApp();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSubtasks, setShowSubtasks] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleStatusChange = (newStatus: TaskStatus['type']) => {
        dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId: task.id, status: newStatus } });
        setIsMenuOpen(false);
    };

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const statusOptions: TaskStatus['type'][] = ['todo', 'inProgress', 'completed'];

    const toggleSubtaskStatus = (subtaskId: string) => {
        const updatedSubtasks = task.subtasks.map(subtask => 
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        );
        
        dispatch({ 
            type: 'UPDATE_TASK', 
            payload: { ...task, subtasks: updatedSubtasks } 
        });
    };

    return (
        <div
            className="bg-gray-900/80 p-4 rounded-md shadow-md border-l-4"
            style={{ borderColor: task.priority.color }}
        >
            <div className="flex justify-between items-start">
                <p className="font-semibold pr-2">{task.title}</p>
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
                                className="absolute right-0 mt-2 w-40 bg-gray-800 border border-white/10 rounded-md shadow-lg z-10"
                            >
                                <p className="text-xs text-white/50 px-3 py-2">Move to...</p>
                                {statusOptions.filter(s => s !== task.status.type).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-primary-500/50"
                                    >
                                        {status === 'todo' ? 'To Do' : status === 'inProgress' ? 'In Progress' : 'Completed'}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-sm text-white/60 mt-1 line-clamp-2">{task.description}</p>
            
            {/* Subtasks section */}
            {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-3 border-t border-white/10 pt-2">
                    <div 
                        className="flex items-center cursor-pointer text-sm text-white/70 mb-1"
                        onClick={() => setShowSubtasks(!showSubtasks)}
                    >
                        <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showSubtasks ? 'rotate-180' : ''}`} />
                        <span>Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})</span>
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
                                    {task.subtasks.map(subtask => (
                                        <div 
                                            key={subtask.id} 
                                            className="flex items-center text-sm"
                                            onClick={() => toggleSubtaskStatus(subtask.id)}
                                        >
                                            <div className="flex-shrink-0 cursor-pointer">
                                                {subtask.completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-white/40" />
                                                )}
                                            </div>
                                            <span className={`ml-2 ${subtask.completed ? 'line-through text-white/40' : 'text-white/80'}`}>
                                                {subtask.title}
                                            </span>
                                        </div>
                                    ))}
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
        </div>
    );
};

const KanbanColumn: React.FC<{ title: string, tasks: Task[] }> = ({ title, tasks }) => (
    <div className="bg-white/5 rounded-lg p-3 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-4 px-2">{title} <span className="text-sm text-white/50">{tasks.length}</span></h3>
        <div className="overflow-y-auto space-y-3 pr-1">
            {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
            ))}
        </div>
    </div>
);

export const Tasks: React.FC = () => {
  const { state, dispatch, dataService, refreshStats } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('dueDate');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // If no token, don't fetch
          return;
        }
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/getTasks`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();

        if (data && data.tasks) {
          const getStatusInfo = (status?: string): TaskStatus => {
            const s = status?.toLowerCase().replace(' ', '');
            if (s === 'inprogress') {
              return { type: 'inProgress', label: 'In Progress', color: '#F59E0B' };
            }
            if (s === 'completed') {
              return { type: 'completed', label: 'Completed', color: '#10B981' };
            }
            return { type: 'todo', label: 'To Do', color: '#6B7280' };
          };

          const mappedTasks: Task[] = data.tasks.map((task: any): Task => {
            const priorityLevel = (task.priority?.toLowerCase() || 'medium') as TaskPriority['level'];

            return {
              id: task.taskId,
              userId: state.user?.id || '',
              title: task.taskTitle,
              description: task.taskDescription,
              priority: {
                level: priorityLevel,
                color: getPriorityColor(priorityLevel),
              },
              urgency: {
                level: priorityLevel,
                color: getPriorityColor(priorityLevel),
              },
              status: getStatusInfo(task.status),
              category: task.category,
              tags: task.tags || [],
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              estimatedTime: task.estimatedTime,
              subtasks: (task.subTasks || []).map((title: string, index: number): SubTask => ({
                id: `${task.taskId}-sub-${index}`,
                title,
                completed: false,
              })),
              dependencies: [],
              createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
              updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            };
          });

          dispatch({ type: 'SET_TASKS', payload: mappedTasks });
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    if (state.user?.id) {
      fetchTasks();
    }
  }, [dispatch, state.user?.id]);

  useEffect(() => {
    // Read filter from URL parameters
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter') as FilterStatus;
    if (filterParam && ['all', 'todo', 'inProgress', 'completed'].includes(filterParam)) {
      setFilterStatus(filterParam);
    }
    
    // Read task ID from URL parameters for direct task viewing
    const taskId = params.get('id');
    if (taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        setEditingTask(task);
        setShowDetails(true);
      }
    }
    
    // Handle action parameter
    const action = params.get('action');
    if (action === 'new') {
      setShowCreateModal(true);
    }
  }, [location.search, state.tasks]);

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

  const handleFocusTask = (task: Task) => {
    navigate('/focus-timer', { state: { taskId: task.id, taskTitle: task.title } });
  };

  const openCreateModal = () => {
    setEditingTask(null);
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
    setShowDetails(false);
    setShowCreateModal(true);
  };

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

    const taskPayload: any = {
      taskTitle: newTask.title,
      taskDescription: newTask.description,
      priority: newTask.priority.charAt(0).toUpperCase() + newTask.priority.slice(1),
      category: newTask.category || 'General',
      estimatedTime: newTask.estimatedTime ? parseInt(newTask.estimatedTime) : 0,
      tags: newTask.tags,
      subTasks: newTask.subtasks.map(st => st.title),
    };

    if (newTask.dueDate) {
      taskPayload.dueDate = new Date(newTask.dueDate).toISOString();
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/addTask`, {
        method: 'POST',
        headers,
        body: JSON.stringify(taskPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const apiResponse = await response.json();
      // Assuming the task is nested in the response under a 'task' key
      const returnedTask = apiResponse.task;

      if (!returnedTask || !returnedTask._id) {
        throw new Error("API did not return a valid task object with an _id");
      }

      const createdTaskForState: Task = {
        id: returnedTask._id, // from backend
        userId: state.user?.id || '', // from current state
        title: newTask.title,
        description: newTask.description,
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
        subtasks: newTask.subtasks.map((st, i) => ({ id: `${returnedTask._id}-sub-${i}`, title: st.title, completed: false })),
        dependencies: [],
        createdAt: new Date(returnedTask.createdAt), // from backend
        updatedAt: new Date(returnedTask.updatedAt), // from backend
      };

      dispatch({ type: 'ADD_TASK', payload: createdTaskForState });
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
      await refreshStats();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const taskPayload = {
      taskId: editingTask.id,
      taskTitle: editingTask.title,
      taskDescription: editingTask.description,
      priority: editingTask.priority.level.charAt(0).toUpperCase() + editingTask.priority.level.slice(1),
      category: editingTask.category,
      estimatedTime: editingTask.estimatedTime,
      dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString() : undefined,
      tags: editingTask.tags,
      subTasks: editingTask.subtasks.map(st => st.title),
    };

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/updateTask`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(taskPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      dispatch({ type: 'UPDATE_TASK', payload: editingTask });
      setEditingTask(null);
      await refreshStats();

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
          await fetch(`${import.meta.env.VITE_API_URL}/api/stats/task`, {
            method: 'PUT',
            credentials: 'include',
            headers,
          });
          await refreshStats();
        } catch (err) {
          console.error('Failed to update completed tasks on server:', err);
        }
      } else {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/stats/dec`, {
            method: 'PUT',
            credentials: 'include',
            headers,
          });
          await refreshStats();
        } catch (err) {
          console.error('Failed to decrement completed tasks on server:', err);
        }
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/removeTask`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      dispatch({ type: 'DELETE_TASK', payload: taskId });
      await refreshStats();
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
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status.type !== 'completed';
  };

  const tasksByStatus = useMemo(() => {
    return state.tasks.reduce((acc, task) => {
        const status = task.status.type;
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
    }, {} as Record<TaskStatus['type'], Task[]>);
  }, [state.tasks]);

  return (
    <div className="h-full flex flex-col text-white p-6 bg-gray-900">
      <TasksHeader onAddTask={openCreateModal} viewMode={viewMode} onSetViewMode={setViewMode} />
      <FilterBar onSearch={setSearchTerm} onSortChange={setSortKey} onFilterChange={setFilterStatus} currentFilter={filterStatus} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {viewMode === 'kanban' && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-6 h-full"
            >
              <KanbanColumn title="To Do" tasks={tasksByStatus.todo || []} />
              <KanbanColumn title="In Progress" tasks={tasksByStatus.inProgress || []} />
              <KanbanColumn title="Completed" tasks={tasksByStatus.completed || []} />
            </motion.div>
          )}
          {/* List and Grid views would be implemented here */}
        </AnimatePresence>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title={editingTask ? 'Edit Task' : 'Create New Task'}
          >
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task Title (e.g., Read Chapter 5 of Biology)"
                className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4">
                      <textarea
                        placeholder="Add a description..."
                        className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      />
                      
                      {/* Priority Selection */}
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Priority</label>
                        <div className="flex space-x-2">
                          {(['low', 'medium', 'high', 'urgent'] as const).map(priority => (
                            <button
                              key={priority}
                              type="button"
                              onClick={() => setNewTask({ ...newTask, priority })}
                              className={`px-3 py-2 rounded-md text-sm flex items-center ${
                                newTask.priority === priority 
                                  ? 'bg-primary-500 text-white' 
                                  : 'bg-gray-700 text-white/70 hover:bg-gray-600'
                              }`}
                            >
                              {getPriorityIcon(priority)}
                              <span className="ml-1 capitalize">{priority}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Due Date */}
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Due Date</label>
                        <input
                          type="date"
                          className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        />
                      </div>
                      
                      {/* Subtasks */}
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Subtasks</label>
                        <div className="space-y-2">
                          {newTask.subtasks.map((subtask, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="text"
                                className="flex-1 p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={subtask.title}
                                onChange={(e) => {
                                  const updatedSubtasks = [...newTask.subtasks];
                                  updatedSubtasks[index].title = e.target.value;
                                  setNewTask({ ...newTask, subtasks: updatedSubtasks });
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2"
                                onClick={() => {
                                  const updatedSubtasks = newTask.subtasks.filter((_, i) => i !== index);
                                  setNewTask({ ...newTask, subtasks: updatedSubtasks });
                                }}
                              >
                                <X className="w-4 h-4 text-white/70" />
                              </Button>
                            </div>
                          ))}
                          
                          <div className="flex items-center">
                            <input
                              type="text"
                              className="flex-1 p-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Add a subtask..."
                              value={subtaskTitle}
                              onChange={(e) => setSubtaskTitle(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && subtaskTitle.trim()) {
                                  setNewTask({
                                    ...newTask,
                                    subtasks: [...newTask.subtasks, { title: subtaskTitle.trim() }]
                                  });
                                  setSubtaskTitle('');
                                }
                              }}
                            />
                            <Button
                              variant="ghost"
                              className="ml-2"
                              onClick={() => {
                                if (subtaskTitle.trim()) {
                                  setNewTask({
                                    ...newTask,
                                    subtasks: [...newTask.subtasks, { title: subtaskTitle.trim() }]
                                  });
                                  setSubtaskTitle('');
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newTask.tags.map((tag, index) => (
                            <div key={index} className="bg-primary-500/30 text-white px-2 py-1 rounded-md flex items-center">
                              <span className="text-sm">{tag}</span>
                              <button
                                className="ml-1 text-white/70 hover:text-white"
                                onClick={() => {
                                  const updatedTags = newTask.tags.filter((_, i) => i !== index);
                                  setNewTask({ ...newTask, tags: updatedTags });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            className="flex-1 p-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Add a tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && tagInput.trim()) {
                                setNewTask({
                                  ...newTask,
                                  tags: [...newTask.tags, tagInput.trim()]
                                });
                                setTagInput('');
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            className="ml-2"
                            onClick={() => {
                              if (tagInput.trim()) {
                                setNewTask({
                                  ...newTask,
                                  tags: [...newTask.tags, tagInput.trim()]
                                });
                                setTagInput('');
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center">
                 <Button
                    variant="link"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Add'} Details
                 </Button>
                <div className="flex space-x-2">
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};