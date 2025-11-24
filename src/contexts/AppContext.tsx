import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { FocusSession, Habit, Task, Analytics, UserPreferences, HabitCompletion, TaskStatus } from '../types';
import { DataService } from '../services/DataService';
import { getLevelFromXp, getXpToLevelUp, getTotalXpForLevel } from '../utils/leveling';
import { useAuth } from './AuthContext';

interface AppState {
  currentSession: FocusSession | null;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  tasks: Task[];
  analytics: Analytics | null;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  activeView: string;
  user?: any;
}

type AppAction =
  | { type: 'SET_CURRENT_SESSION'; payload: FocusSession | null }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: TaskStatus['type'] } }
  | { type: 'ADD_HABIT_COMPLETION'; payload: HabitCompletion }
  | { type: 'SET_HABIT_COMPLETIONS'; payload: HabitCompletion[] }
  | { type: 'SET_ANALYTICS'; payload: Analytics }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'RESET' };

const initialState: AppState = {
  currentSession: null,
  habits: [],
  habitCompletions: [],
  tasks: [],
  analytics: null,
  isLoading: true,
  theme: 'dark',
  sidebarOpen: true,
  activeView: 'dashboard',
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h =>
          h.habitId === action.payload.habitId ? action.payload : h
        )
      };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'UPDATE_TASK_STATUS': {
      const { taskId, status } = action.payload;
      const getStatusInfo = (statusType: TaskStatus['type']): TaskStatus => {
        switch (statusType) {
          case 'inProgress': return { type: 'inProgress', label: 'In Progress', color: '#F59E0B' };
          case 'completed': return { type: 'completed', label: 'Completed', color: '#10B981' };
          case 'todo':
          default:
            return { type: 'todo', label: 'To Do', color: '#6B7280' };
        }
      };

      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, status: getStatusInfo(status), updatedAt: new Date() }
            : task
        ),
      };
    }
    case 'ADD_HABIT_COMPLETION':
      return { ...state, habitCompletions: [...state.habitCompletions, action.payload] };
    case 'SET_HABIT_COMPLETIONS':
      return { ...state, habitCompletions: action.payload };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  dataService: DataService;
  refreshStats: () => Promise<void>;
  resetAppState: () => void;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();
  const dataService = useMemo(() => new DataService(), []);

  // Function to fetch stats from backend and update analytics
  const refreshStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      if (!token) {
        // No need to fetch if not logged in
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      // Fetch stats
      const res = await fetch('http://localhost:5001/api/stats/get', {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      const data = await res.json();

      // Fetch tasks
      try {
        const tasksRes = await fetch('http://localhost:5001/api/stats/getTasks', {
          method: 'GET',
          credentials: 'include',
          headers,
        });

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData && Array.isArray(tasksData.tasks)) {
            // Map backend task format to frontend Task interface
            const mappedTasks = tasksData.tasks
              .filter((t: any) => typeof t === 'object' && t.taskTitle)
              .map((task: any) => ({
                id: task._id || task.taskId || task.id,
                title: task.taskTitle || task.title,
                description: task.taskDescription || task.description || '',
                priority: task.priority || 'Medium',
                dueDate: task.dueDate,
                completed: task.completed || false,
                subtasks: Array.isArray(task.subTasks) ? [...task.subTasks] : (Array.isArray(task.subtasks) ? [...task.subtasks] : []),
                category: task.category || '',
                tags: task.tags || [],
                estimatedTime: task.estimatedTime || 0,
              }));

            dispatch({ type: 'SET_TASKS', payload: mappedTasks });
          }
        }
      } catch (taskError) {
        console.error('Failed to fetch tasks:', taskError);
        // Don't fail the whole refresh if tasks fail
      }

      if (data && data.stats) {
        const totalXp = Math.max(0, data.stats.xp || 0);
        const level = getLevelFromXp(totalXp);
        const xpForCurrentLevel = getTotalXpForLevel(level);
        const xpForNextLevel = getXpToLevelUp(level);
        const currentLevelXp = totalXp - xpForCurrentLevel;

        let productivityByHour = data.stats.productivityByHour || [];
        if (!Array.isArray(productivityByHour) || productivityByHour.length !== 24) {
          productivityByHour = Array.from({ length: 24 }, (_, i) => ({
            hour: i, productivityScore: 0, focusTime: 0, tasksCompleted: 0
          }));
        }

        dispatch({
          type: 'SET_ANALYTICS',
          payload: {
            overall: {
              productivityScore: data.stats.productivityScore,
              achievements: [],
              weeklyGoalProgress: 0,
              monthlyGoalProgress: 0,
              level: level,
              xp: currentLevelXp, // Use XP for the current level
              nextLevelXp: xpForNextLevel,
              totalXp: totalXp // Keep total XP for calculations
            },
            focusSessions: {
              totalSessions: data.stats.focusSessions,
              totalFocusTime: data.stats.focusTime,
              averageSessionLength: 0,
              completionRate: 0,
              streakData: [],
              productivityTrends: [],
              flowStateHours: [],
              distractionPatterns: [],
            },
            tasks: {
              totalTasks: data.stats.tasksCompleted.totalTasks,
              totalCompleted: data.stats.tasksCompleted.totalCompleted || 0,
              completionRate: data.stats.tasksCompleted.totalCompleted && data.stats.tasksCompleted.totalTasks ?
                (data.stats.tasksCompleted.totalCompleted / data.stats.tasksCompleted.totalTasks) * 100 : 0,
              averageCompletionTime: 0,
              priorityDistribution: [],
              productivityByHour: productivityByHour,
            },
            habits: {
              totalHabits: 0,
              completionRate: 0,
              averageStreak: 0,
              categoryBreakdown: [],
              weeklyPatterns: [],
            },
            dailyActivity: data.stats.dailyActivity || {},
          },
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const initializeApp = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const habitCompletions = await dataService.getHabitCompletions();
      const analytics = await dataService.getAnalytics();

      dispatch({ type: 'SET_HABIT_COMPLETIONS', payload: habitCompletions });
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });

    } catch (error) {
      console.error('Failed to initialize app data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dataService, dispatch]);

  useEffect(() => {
    if (user) {
      initializeApp();
      refreshStats(); // Always fetch stats on user change
    }
  }, [user, refreshStats, initializeApp]);

  // Function to reset app state
  const resetAppState = useCallback(() => {
    dispatch({ type: 'RESET' } as any);
  }, [dispatch]);

  const value = useMemo(() => ({
    state,
    dispatch,
    dataService,
    refreshStats,
    resetAppState,
  }), [state, dispatch, dataService, refreshStats, resetAppState]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};