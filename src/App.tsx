import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { FloatingTimerProvider } from './contexts/FloatingTimerContext';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { FocusTimer } from './pages/FocusTimer';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { Social } from './pages/Social';
import { Soundscapes } from './pages/Soundscapes';
import AICoach from './pages/AICoach';
import { Achievements } from './pages/Achievements';
import { Settings } from './pages/Settings';
import Auth from './pages/Auth';
import PDFViewer from './pages/PDFViewer';
import Library from './pages/Library';
import CollaborationRoom from './pages/CollaborationRoom';
import SearchResults from './pages/SearchResults';
import LandingPage from './pages/LandingPage';
import ResetPassword from './pages/ResetPassword';
import EmailSentConfirmation from './pages/EmailSentConfirmation';
import { FriendChatManager } from './components/social/FriendChatManager';
import TimerTest from './pages/TimerTest';

const LoadingScreen: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-dark">
    <div className="space-y-4 text-center">
      <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
      <p className="text-white/70">Loading...</p>
    </div>
  </div>
);

// Main layout for authenticated users
const MainLayout = () => {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={logout} />
        <main className="flex-1 overflow-y-auto">
          <Outlet /> {/* This is where nested routes will render */}
        </main>
      </div>
      <FriendChatManager />
    </div>
  );
};

// Protected route component that ensures authentication
const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/focus" element={<FocusTimer />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/social" element={<Social />} />
        <Route path="/library" element={<Library />} />
        <Route path="/pdf-viewer" element={<PDFViewer />} />
        <Route path="/pdf-viewer/:fileId" element={<PDFViewer />} />
        <Route path="/soundscapes" element={<Soundscapes />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/collaboration" element={<CollaborationRoom />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/timer-test" element={<TimerTest />} />
        <Route path="/notifications" element={<div className="p-6"><h1 className="text-3xl font-bold text-gradient">Notifications</h1><p className="mt-4 text-white/60">No new notifications</p></div>} />
        <Route path="/activity" element={<div className="p-6"><h1 className="text-3xl font-bold text-gradient">Activity History</h1><p className="mt-4 text-white/60">Your recent activity will appear here</p></div>} />
        {/* Catch-all for protected routes: if authenticated, redirect to dashboard for unknown paths */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  // Add a small delay to ensure AuthContext is fully initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen text-white">
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes - always accessible */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth initialView="login" />} />
          <Route path="/signup" element={<Auth initialView="signup" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-sent" element={<EmailSentConfirmation />} />
          <Route path="/timer-test-public" element={<TimerTest />} />

          {/* Protected Routes */}
          <Route path="/*" element={<ProtectedRoutes />} />

          {/* Fallback for any other unmatched routes, redirects to /auth */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppProvider>
          <AudioProvider>
            <FloatingTimerProvider>
              <AnimatedBackground variant="particles" />
              <AppContent />
            </FloatingTimerProvider>
          </AudioProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;