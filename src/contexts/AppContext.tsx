import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { FocusSession, Habit, Task, Analytics, UserPreferences, HabitCompletion } from '../types';
import { DataService } from '../services/DataService';
import { getLevelFromXp } from '../utils/leveling';
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
  | { type: 'ADD_HABIT_COMPLETION'; payload: HabitCompletion }
  | { type: 'SET_HABIT_COMPLETIONS'; payload: HabitCompletion[] }
  | { type: 'SET_ANALYTICS'; payload: Analytics }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_VIEW'; payload: string };

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
  const { user } = useAuth();
  const dataService = new DataService();

  useEffect(() => {
    if (user) {
      initializeApp();
    }
  }, [user]);

  const initializeApp = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const habits = await dataService.getHabits();
      const tasks = await dataService.getTasks();
      const habitCompletions = await dataService.getHabitCompletions();
      const analytics = await dataService.getAnalytics();

      dispatch({ type: 'SET_HABITS', payload: habits });
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_HABIT_COMPLETIONS', payload: habitCompletions });
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });

    } catch (error) {
      console.error('Failed to initialize app data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

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