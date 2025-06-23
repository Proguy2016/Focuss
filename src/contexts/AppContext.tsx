import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define types for tasks and habits
interface Task {
  id: string;
  title: string;
  description?: string;
  status: {
    type: 'todo' | 'inProgress' | 'completed';
    label: string;
    color: string;
  };
  priority: {
    level: 'low' | 'medium' | 'high';
    color: string;
  };
  dueDate?: string;
  estimatedTime?: number;
  createdAt: Date;
  updatedAt?: Date;
}

interface HabitCompletion {
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  habitId?: string;
  name: string;
  description?: string;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[];
  };
  timeOfDay?: string;
  streak: number;
  completions?: HabitCompletion[];
  createdAt: Date;
}

// Define the types for the app state
interface AppState {
  theme: 'light' | 'dark' | 'auto' | 'sunset' | 'oceanic';
  accentColor: string;
  backgroundAnimation: string;
  reducedMotion: boolean;
  compactMode: boolean;
  fontSize: string;
  highContrast: boolean;
  isPremiumFeaturesEnabled: boolean;
  premiumBackground: string;
  sidebarOpen: boolean;
  activeView: string;
  tasks: Task[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
}

// Define the actions for the reducer
type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' | 'sunset' | 'oceanic' }
  | { type: 'UPDATE_APPEARANCE_SETTING'; payload: { key: keyof AppState; value: any } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_HABIT_COMPLETIONS'; payload: HabitCompletion[] }
  | { type: 'ADD_HABIT_COMPLETION'; payload: HabitCompletion }
  | { type: 'RESET' };

// Initial state for the app with empty tasks and habits arrays
const initialState: AppState = {
  theme: 'light',
  accentColor: '#007AFF',
  backgroundAnimation: 'particles',
  reducedMotion: false,
  compactMode: false,
  fontSize: 'medium',
  highContrast: false,
  isPremiumFeaturesEnabled: false,
  premiumBackground: 'default',
  sidebarOpen: true,
  activeView: 'dashboard',
  tasks: [],
  habits: [],
  habitCompletions: []
};

// Reducer function to handle state updates
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'UPDATE_APPEARANCE_SETTING':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => task.id === action.payload.id ? action.payload : task)
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          (habit.id === action.payload.id || habit.habitId === action.payload.habitId)
            ? action.payload
            : habit
        )
      };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(habit => habit.id !== action.payload) };
    case 'SET_HABIT_COMPLETIONS':
      return { ...state, habitCompletions: action.payload };
    case 'ADD_HABIT_COMPLETION':
      return { ...state, habitCompletions: [...state.habitCompletions, action.payload] };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

// Create the context with the appropriate type
export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  resetAppState: () => void;
} | null>(null);

// Provider component to wrap the app
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Load saved preferences from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      dispatch({
        type: 'SET_THEME',
        payload: savedTheme as 'light' | 'dark' | 'auto' | 'sunset' | 'oceanic'
      });
    }

    // Load mock data for tasks and habits
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Complete project proposal',
        description: 'Finish the draft and send for review',
        status: { type: 'inProgress' as const, label: 'In Progress', color: '#F59E0B' },
        priority: { level: 'high' as const, color: '#EF4444' },
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        estimatedTime: 60,
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Review feedback',
        description: 'Go through comments and make necessary changes',
        status: { type: 'todo' as const, label: 'To Do', color: '#6B7280' },
        priority: { level: 'medium' as const, color: '#F59E0B' },
        dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        estimatedTime: 30,
        createdAt: new Date(),
      },
      {
        id: '3',
        title: 'Schedule team meeting',
        description: 'Coordinate with team members for availability',
        status: { type: 'completed' as const, label: 'Completed', color: '#10B981' },
        priority: { level: 'low' as const, color: '#10B981' },
        createdAt: new Date(),
      }
    ];

    const mockHabits: Habit[] = [
      {
        id: '1',
        name: 'Morning meditation',
        description: '10 minutes of mindfulness',
        frequency: { type: 'daily' as const },
        timeOfDay: 'morning',
        streak: 5,
        completions: [
          { date: new Date().toISOString(), completed: true }
        ],
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Read for 30 minutes',
        description: 'Focus on personal development books',
        frequency: { type: 'daily' as const },
        timeOfDay: 'evening',
        streak: 3,
        createdAt: new Date()
      }
    ];

    dispatch({ type: 'SET_TASKS', payload: mockTasks });
    dispatch({ type: 'SET_HABITS', payload: mockHabits });

  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app-theme', state.theme);
  }, [state.theme]);

  // Function to reset app state
  const resetAppState = () => {
    dispatch({ type: 'RESET' });
  };

  // Context value
  const value = {
    state,
    dispatch,
    resetAppState,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined || context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Export an alias for useApp as useAppContext for backward compatibility
export const useAppContext = useApp; 