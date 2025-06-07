import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
          <AnimatedBackground variant="particles" />
          
          <div className="flex h-screen">
            <Sidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              
              <main className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/focus" element={<FocusTimer />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/habits" element={<Habits />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/social" element={<Social />} />
                    <Route path="/soundscapes" element={<Soundscapes />} />
                    <Route path="/knowledge" element={<Knowledge />} />
                    <Route path="/ai-coach" element={<AICoach />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </AnimatePresence>
              </main>
            </div>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;