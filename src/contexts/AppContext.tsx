import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
}

// Define the actions for the reducer
type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' | 'sunset' | 'oceanic' }
  | { type: 'UPDATE_APPEARANCE_SETTING'; payload: { key: keyof AppState; value: any } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'RESET' };

// Initial state for the app
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