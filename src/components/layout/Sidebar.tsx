import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  Home, Target, CheckSquare, TrendingUp, Users, Settings,
  Book, Zap, Award, Music, Brain, X, Menu, FileText, Library as LibraryIcon, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { getTotalXpForLevel, getXpToLevelUp, getLevelFromXp } from '../../utils/leveling';

const navigationItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Target, label: 'Focus Timer', path: '/focus' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Zap, label: 'Habits', path: '/habits' },
  { icon: Users, label: 'Social', path: '/social' },
  { icon: LibraryIcon, label: 'Library', path: '/library' },
  { icon: Users, label: 'Collaboration', path: '/collaboration' },
  { icon: Music, label: 'Soundscapes', path: '/soundscapes' },
  { icon: Brain, label: 'AI Coach', path: '/ai-coach' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalXp = state.analytics?.overall?.xp || 0;
  const level = getLevelFromXp(totalXp);

  const xpForCurrentLevel = getTotalXpForLevel(level);
  const xpForNextLevel = getXpToLevelUp(level);
  const currentXpInLevel = totalXp - xpForCurrentLevel;
  const progressPercentage = xpForNextLevel > 0 ? (currentXpInLevel / xpForNextLevel) * 100 : 0;

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const SidebarContent = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={`flex items-center p-6 border-b border-teal-500/20 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Focus Ritual Logo"
            className={`transition-all duration-300 hover:rotate-[-3deg] hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] rounded-xl ${isCollapsed ? 'w-10 h-10' : 'w-14 h-14'}`}
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div>
                  <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-green-400 to-emerald whitespace-nowrap">
                    Focus Ritual
                  </h1>
                  <p className="text-sm text-gray-400 whitespace-nowrap">Productivity Suite</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          icon={X}
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="text-gray-300 lg:hidden hover:bg-teal-900/20 group-hover/nav:text-teal-400"
        />
      </div>

      {/* User Profile */}
      <div className={`p-6 border-b border-teal-500/20 ${isCollapsed ? 'p-3' : 'p-6'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {user?.firstName?.charAt(0)}
            </span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-400">Level {level}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* XP Progress */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>XP Progress</span>
                <span>
                  {currentXpInLevel} / {xpForNextLevel}
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-green-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${progressPercentage}%`
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `group/nav flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${isCollapsed ? 'justify-center' : ''} ${isActive
                  ? 'bg-gradient-to-r from-slate-dark via-emerald to-slate-dark text-white'
                  : 'text-gray-300 hover:text-white hover:bg-teal-900/20'
                }`
              }
              onClick={() => {
                if (window.innerWidth < 1024) {
                  dispatch({ type: 'TOGGLE_SIDEBAR' });
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-teal-900/50' : 'group-hover/nav:bg-teal-600/30'}`}>
                    <item.icon size={20} className={`${isActive ? 'text-white' : 'text-teal-400'}`} />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                        {isActive && (
                          <motion.div
                            className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                            layoutId="underline"
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer & Collapse Toggle */}
      <div className={`p-6 border-t border-teal-500/20 ${isCollapsed ? 'p-3' : 'p-6'}`}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="text-center text-sm text-gray-500 mb-2">
                <p>© 2025 Focus Ritual</p>
                <p className="mt-1">Version 1.0.0</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="hidden lg:flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="rounded-full !w-10 !h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-teal-900/20"
            icon={isCollapsed ? ChevronsRight : ChevronsLeft}
          />
        </div>
      </div>
    </div>
  );
  return (
    <>
      {/* Mobile overlay and sidebar */}
      <div className="lg:hidden">
        <AnimatePresence>
          {state.sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              />
              <motion.aside
                className="fixed left-0 top-0 z-50 h-full w-80 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-sm border-r border-teal-500/20"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 30, stiffness: 220 }}
              >
                <SidebarContent isCollapsed={false} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-sm border-r border-teal-500/20 transition-all duration-300 ease-in-out relative`}
        style={{ width: isCollapsed ? '7rem' : '20rem' }}
      >
        <SidebarContent isCollapsed={isCollapsed} />
      </aside>
    </>
  );
};