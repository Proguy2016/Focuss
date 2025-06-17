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
            <Button variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="icon" onClick={() => onSetViewMode('grid')}><Grid className="w-5 h-5" /></Button>
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

const TaskCard = ({ task, onEdit, onDelete }: { task: Task, onEdit: () => void, onDelete: () => void }) => {
  const { dispatch } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = (newStatus: TaskStatus['type']) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId: task.id, status: newStatus } });
    setIsMenuOpen(false);
  };

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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/5 backdrop-blur-sm p-4 rounded-md shadow-lg border-l-4"
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
                className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-lg z-20"
              >
                <div className="p-2">
                  <p className="text-xs text-white/50 px-2 py-1">Change Status</p>
                  {statusOptions.filter(s => s !== task.status.type).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full text-left px-2 py-1.5 text-sm text-white rounded hover:bg-primary-500/50"
                    >
                      {status === 'todo' ? 'To Do' : status === 'inProgress' ? 'In Progress' : 'Completed'}
                    </button>
                  ))}
                  <div className="border-t border-white/10 my-1"></div>
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

const TaskRow = ({ task, onFocus, onEdit, onDelete, onStatusToggle }: { task: Task, onFocus: () => void, onEdit: () => void, onDelete: () => void, onStatusToggle: () => void }) => {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
    >
      <td className="p-4">
        <button onClick={onStatusToggle} className="flex items-center justify-center group">
          {task.status.type === 'completed' ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-white/40 group-hover:text-white" />
          )}
        </button>
      </td>
      <td className="p-4">
        <p className={`font-medium ${task.status.type === 'completed' ? 'line-through text-white/50' : ''}`}>
          {task.title}
        </p>
        {task.description && <p className="text-sm text-white/40 mt-1 hidden sm:block">{task.description}</p>}
      </td>
      <td className="p-4 hidden md:table-cell">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
      </td>
      <td className="p-4 hidden sm:table-cell">
        <span className="flex items-center gap-2">
          <Flag className="w-4 h-4" style={{ color: task.priority.color }} />
          {task.priority.level.charAt(0).toUpperCase() + task.priority.level.slice(1)}
        </span>
      </td>
      <td className="p-4 hidden lg:table-cell">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status.type === 'completed' ? 'bg-green-500/20 text-green-300' :
            task.status.type === 'inProgress' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-gray-500/20 text-gray-300'
            }`}
        >
          {task.status.type === 'todo' ? 'To Do' : task.status.type === 'inProgress' ? 'In Progress' : 'Completed'}
        </span>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onFocus} title="Focus on this task">
            <Play className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} title="Edit task">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500/70 hover:bg-red-500/20" title="Delete task">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

export const Tasks: React.FC = () => {
  const { dispatch } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.tasks) {
        throw new Error("Tasks not found in response");
      }

      const priorityMap: Record<string, { level: TaskPriority['level'], color: string }> = {
        High: { level: 'high', color: '#EF4444' },
        Medium: { level: 'medium', color: '#FBBF24' },
        Low: { level: 'low', color: '#3B82F6' },
      };

      const transformedTasks = data.tasks.map((task: any): Task => ({
        id: task.taskId,
        title: task.taskTitle,
        description: task.taskDescription,
        status: { type: 'todo', color: 'gray' }, // Default status, will be overwritten if task exists
        priority: priorityMap[task.priority] || priorityMap.Medium,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        subtasks: Array.isArray(task.subTasks) ? task.subTasks.map((subtaskTitle: string, index: number) => ({
          id: `${task.taskId}-sub-${index}`,
          title: subtaskTitle,
          completed: false,
        })) : [],
        category: task.category,
        tags: task.tags,
      }));

      setTasks(prevTasks => {
        return transformedTasks.map(newTask => {
          const oldTask = prevTasks.find(t => t.id === newTask.id);
          return oldTask ? { ...newTask, status: oldTask.status } : newTask;
        });
      });

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
    if (filter && ['all', 'todo', 'inProgress', 'completed'].includes(filter)) {
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
      tasksToFilter = tasksToFilter.filter(t => t.status.type === filterStatus);
    }
    if (searchTerm) {
      tasksToFilter = tasksToFilter.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    tasksToFilter.sort((a, b) => {
      if (sortKey === 'dueDate' && a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortKey === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority.level] - priorityOrder[a.priority.level];
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    return tasksToFilter;
  }, [tasks, filterStatus, searchTerm, sortKey]);

  const handleFocusTask = (task: Task) => {
    dispatch({ type: 'SET_FOCUS_TASK', payload: task });
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

  const handleSaveTask = async (taskData: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    if (editingTask) {
      // TODO: Implement API call for updating a task
      console.warn("Update functionality is not yet implemented with the backend.");
      // For now, optimistic update on client-side and close modal
      const updatedTask = {
        ...editingTask,
        ...taskData,
        priority: {
          level: taskData.priority,
          color: (['high', 'medium', 'low'].includes(taskData.priority)) ? { high: '#EF4444', medium: '#FBBF24', low: '#3B82F6' }[taskData.priority] : '#FBBF24'
        },
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        subtasks: taskData.subtasks.map((st: any, i: number) => ({ ...st, id: st.id || `${editingTask.id}-sub-${i}` }))
      };
      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      closeModal();
    } else {
      const payload = {
        taskTitle: taskData.title,
        taskDescription: taskData.description,
        priority: taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1),
        category: "Work", // default
        estimatedTime: 120, // default
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : new Date().toISOString(),
        tags: [], // default
        subTasks: taskData.subtasks?.map((st: SubTask) => st.title) || [],
      };

      try {
        const response = await fetch('http://localhost:5001/api/stats/addTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }
        await fetchTasks();
        closeModal();
      } catch (e: any) {
        setError(e.message || 'Failed to create task.');
        console.error(e);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication token not found.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/stats/removeTask', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId: id }),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      await fetchTasks();
    } catch (e: any) {
      setError(e.message || 'Failed to delete task.');
      console.error(e);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatusType = task.status.type === 'completed' ? 'todo' : 'completed';
    const newStatus = { ...task.status, type: newStatusType };

    // Optimistic update
    setTasks(currentTasks => currentTasks.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    ));

    // TODO: Here you would ideally call an API to update the task status on the backend
    // Since there's no endpoint for this, the change remains on the client-side until the next full fetch.
    // The fetch logic will preserve this status change.
    console.log(`Task ${task.id} status changed to ${newStatusType} on client-side.`);
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
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {sortedAndFilteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={() => openEditModal(task)} onDelete={() => handleDeleteTask(task.id)} />
                  ))}
                </div>
              ) : viewMode === 'list' ? (
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
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex gap-6 p-6 overflow-x-auto">
                  <KanbanColumn title="To Do" tasks={sortedAndFilteredTasks.filter(t => t.status.type === 'todo')} onEdit={openEditModal} onDelete={handleDeleteTask} />
                  <KanbanColumn title="In Progress" tasks={sortedAndFilteredTasks.filter(t => t.status.type === 'inProgress')} onEdit={openEditModal} onDelete={handleDeleteTask} />
                  <KanbanColumn title="Completed" tasks={sortedAndFilteredTasks.filter(t => t.status.type === 'completed')} onEdit={openEditModal} onDelete={handleDeleteTask} />
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
      setTaskData({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority.level,
      });
    } else {
      setTaskData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        subtasks: []
      });
    }
  }, [task, isOpen]);

  const handleSubtaskChange = (index: number, field: string, value: any) => {
    const newSubtasks = [...(taskData.subtasks || [])];
    newSubtasks[index] = { ...newSubtasks[index], [field]: value };
    setTaskData({ ...taskData, subtasks: newSubtasks });
  };

  const addSubtask = () => {
    const newSubtasks = [...(taskData.subtasks || []), { id: `sub-${Date.now()}`, title: '', completed: false }];
    setTaskData({ ...taskData, subtasks: newSubtasks });
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
                        value={taskData.priority || 'medium'}
                        onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 block mb-2">Subtasks</label>
                    {taskData.subtasks?.map((subtask: SubTask, index: number) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleSubtaskChange(index, 'completed', !subtask.completed)}
                          className="h-5 w-5 rounded bg-white/10 border-white/20 text-primary-500 focus:ring-primary-500 shrink-0"
                        />
                        <input
                          type="text"
                          value={subtask.title}
                          onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                          className="w-full bg-white/5 border-none rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
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