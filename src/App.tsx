import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './contexts/AppContext';
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

// Layout components
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  // This would normally be determined by your auth service
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Simple function to log in - accepts any credentials
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen text-white">
          <AnimatedBackground variant="particles" />

          <AnimatePresence mode="wait">
            <Routes>
              {/* Auth routes without sidebar/header */}
              <Route path="/auth" element={
                isAuthenticated ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />
              } />
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" /> : <Auth initialView="login" onLogin={handleLogin} />
              } />
              <Route path="/signup" element={
                isAuthenticated ? <Navigate to="/" /> : <Auth initialView="signup" onLogin={handleLogin} />
              } />

              {/* App routes with sidebar/header */}
              <Route path="/" element={
                isAuthenticated ?
                  <AppLayout>
                    <Dashboard />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/focus" element={
                isAuthenticated ?
                  <AppLayout>
                    <FocusTimer />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/tasks" element={
                isAuthenticated ?
                  <AppLayout>
                    <Tasks />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/habits" element={
                isAuthenticated ?
                  <AppLayout>
                    <Habits />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/analytics" element={
                isAuthenticated ?
                  <AppLayout>
                    <Analytics />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/social" element={
                isAuthenticated ?
                  <AppLayout>
                    <Social />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/pdf-viewer" element={
                isAuthenticated ?
                  <AppLayout>
                    <PDFViewer />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/soundscapes" element={
                isAuthenticated ?
                  <AppLayout>
                    <Soundscapes />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/knowledge" element={
                isAuthenticated ?
                  <AppLayout>
                    <Knowledge />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/ai-coach" element={
                isAuthenticated ?
                  <AppLayout>
                    <AICoach />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/achievements" element={
                isAuthenticated ?
                  <AppLayout>
                    <Achievements />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
              <Route path="/settings" element={
                isAuthenticated ?
                  <AppLayout>
                    <Settings />
                  </AppLayout> :
                  <Navigate to="/auth" />
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;