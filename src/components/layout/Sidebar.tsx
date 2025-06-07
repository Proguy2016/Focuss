import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  Home, Target, CheckSquare, TrendingUp, Users, Settings,
  Book, Zap, Award, Music, Brain, X, Menu
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../common/Button';

const navigationItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Target, label: 'Focus Timer', path: '/focus' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Zap, label: 'Habits', path: '/habits' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Social', path: '/social' },
  { icon: Music, label: 'Soundscapes', path: '/soundscapes' },
  { icon: Book, label: 'Knowledge', path: '/knowledge' },
  { icon: Brain, label: 'AI Coach', path: '/ai-coach' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {state.sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {state.sidebarOpen && (
          <motion.aside
            className="fixed left-0 top-0 z-50 h-full w-80 glass border-r border-white/10 lg:relative lg:z-0"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Focus Ritual</h1>
                    <p className="text-sm text-white/60">Productivity Suite</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                  className="lg:hidden"
                />
              </div>

              {/* User Profile */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {state.user?.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{state.user?.name}</p>
                    <p className="text-sm text-white/60">Level {state.user?.level}</p>
                  </div>
                </div>
                
                {/* XP Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-white/60 mb-1">
                    <span>XP Progress</span>
                    <span>{state.user?.xp} / {state.analytics?.overall.nextLevelXp}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((state.user?.xp || 0) / (state.analytics?.overall.nextLevelXp || 1)) * 100}%` 
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`
                      }
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          dispatch({ type: 'TOGGLE_SIDEBAR' });
                        }
                      }}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-white/10">
                <div className="text-center text-sm text-white/40">
                  <p>© 2024 Focus Ritual</p>
                  <p className="mt-1">Version 1.0.0</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};