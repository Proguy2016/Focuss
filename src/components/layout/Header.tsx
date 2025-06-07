import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { state, dispatch } = useApp();

  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  return (
    <motion.header
      className="glass border-b border-white/10 px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={Menu}
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="lg:hidden"
          />
          
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-xl min-w-80">
            <Search size={20} className="text-white/60" />
            <input
              type="text"
              placeholder="Search tasks, habits, or notes..."
              className="flex-1 bg-transparent text-white placeholder-white/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Current session indicator */}
          {state.currentSession && (
            <motion.div
              className="flex items-center gap-2 glass px-3 py-2 rounded-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-sm text-white/80">Focus Session Active</span>
            </motion.div>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            icon={Bell}
            className="relative"
          >
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            icon={state.theme === 'dark' ? Sun : Moon}
            onClick={toggleTheme}
          />

          {/* Profile */}
          <motion.div
            className="flex items-center gap-2 glass px-3 py-2 rounded-xl cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {state.user?.name.charAt(0)}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{state.user?.name}</p>
              <p className="text-xs text-white/60">Level {state.user?.level}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};