import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, FocusSession, Habit, Task, Analytics, UserPreferences, HabitCompletion } from '../types';
import { DataService } from '../services/DataService';
import { getLevelFromXp } from '../utils/leveling';

interface AppState {
  user: User | null;
  currentSession: FocusSession | null;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  tasks: Task[];
  analytics: Analytics | null;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  activeView: string;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CURRENT_SESSION'; payload: FocusSession | null }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_HABIT_COMPLETION'; payload: HabitCompletion }
  | { type: 'SET_HABIT_COMPLETIONS'; payload: HabitCompletion[] }
  | { type: 'SET_ANALYTICS'; payload: Analytics }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'UPDATE_USER_LEVEL_AND_XP'; payload: { level: number; xp: number } };

const initialState: AppState = {
  user: null,
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
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER_LEVEL_AND_XP':
      if (state.user) {
        return {
          ...state,
          user: { ...state.user, level: action.payload.level, xp: action.payload.xp }
        };
      }
      return state;
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h)
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
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  dataService: DataService;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const dataService = new DataService();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Clear local storage for a fresh start
      localStorage.removeItem('habits');
      localStorage.removeItem('tasks');
      localStorage.removeItem('habitCompletions');
      localStorage.removeItem('analytics');

      // Initialize a new user
      const newUser: User = {
        id: 'user-1',
        name: 'New User',
        email: 'new@user.com',
        level: 1,
        xp: 0,
        totalFocusTime: 0,
        streak: 0,
        joinDate: new Date(),
        preferences: {
          theme: 'dark',
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4,
          soundEnabled: true,
          notificationsEnabled: true,
          focusMusic: 'none',
          ambientVolume: 50,
        },
        recentActivity: []
      };

      // Initialize with empty data for a new user
      const habits = await dataService.getHabits();
      const tasks = await dataService.getTasks();
      const habitCompletions = await dataService.getHabitCompletions();
      const analytics = await dataService.getAnalytics();

      dispatch({ type: 'SET_USER', payload: newUser });
      dispatch({ type: 'SET_HABITS', payload: habits });
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_HABIT_COMPLETIONS', payload: habitCompletions });
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    if (state.analytics && state.user) {
      const unlockedAchievements = state.analytics.overall.achievements.filter(a => a.unlocked);
      const totalXp = unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0);
      const level = getLevelFromXp(totalXp);
      if (totalXp !== state.user.xp || level !== state.user.level) {
        dispatch({
          type: 'UPDATE_USER_LEVEL_AND_XP',
          payload: { level, xp: totalXp }
        });
      }
    }
  }, [state.analytics, state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch, dataService }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};