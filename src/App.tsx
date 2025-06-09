import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { FocusTimer } from './pages/FocusTimer';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { Analytics } from './pages/Analytics';
import { Social } from './pages/Social';
import { Soundscapes } from './pages/Soundscapes';
import { Knowledge } from './pages/Knowledge';
import { AICoach } from './pages/AICoach';
import { Achievements } from './pages/Achievements';
import { Settings } from './pages/Settings';
import Auth from './pages/Auth';
import PDFViewer from './pages/PDFViewer';
import CollaborationRoomApp from './pages/CollaborationRoom';

// Layout components
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={logout} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Loading component
const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-dark">
    <div className="space-y-4 text-center">
      <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
      <p className="text-white/70">Loading...</p>
    </div>
  </div>
);

// Route Guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen text-white">
        <AnimatedBackground variant="particles" />

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth initialView="login" />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth initialView="signup" />} />

            {/* App routes */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute><AppLayout><FocusTimer /></AppLayout></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><AppLayout><Tasks /></AppLayout></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><AppLayout><Habits /></AppLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
            <Route path="/social" element={<ProtectedRoute><AppLayout><Social /></AppLayout></ProtectedRoute>} />
            <Route path="/pdf-viewer" element={<ProtectedRoute><AppLayout><PDFViewer /></AppLayout></ProtectedRoute>} />
            <Route path="/soundscapes" element={<ProtectedRoute><AppLayout><Soundscapes /></AppLayout></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><AppLayout><Knowledge /></AppLayout></ProtectedRoute>} />
            <Route path="/ai-coach" element={<ProtectedRoute><AppLayout><AICoach /></AppLayout></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AppLayout><Achievements /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/collaboration" element={<ProtectedRoute><AppLayout><CollaborationRoomApp /></AppLayout></ProtectedRoute>} />

            {/* Default route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;