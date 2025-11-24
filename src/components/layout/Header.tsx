import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, LogOut, ChevronDown, VolumeX } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';
import { useFloatingTimer } from '../../contexts/FloatingTimerContext';
import { NavbarTimer } from '../common/NavbarTimer';
import { Button } from '../common/Button';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { audioState, stopAllTracks } = useAudio();
  const { timerState } = useFloatingTimer();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();

    // Close the profile menu
    setProfileMenuOpen(false);

    // Call the onLogout function passed from parent
    onLogout();

    // Navigate to the auth page
    navigate('/auth');
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input');
                if (searchInput && searchInput.value.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
                }
              }}
              className="flex-1"
            >
              <input
                type="text"
                placeholder="Search tasks, habits, or notes..."
                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none"
              />
            </form>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
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

          {/* Navbar Timer - Shows when timer is active */}
          {timerState.isActive && (
            <NavbarTimer />
          )}

          {/* Stop Music button - only show when audio is playing */}
          {audioState.isAnyTrackPlaying && (
            <Button
              variant="ghost"
              size="sm"
              icon={VolumeX}
              onClick={stopAllTracks}
              className="relative"
              title="Stop all sounds"
            >
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            icon={Bell}
            className="relative"
            onClick={() => navigate('/notifications')}
          >
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>

          {/* Theme toggle */}
          <label className="cosmic-toggle">
            <input
              className="toggle"
              type="checkbox"
              checked={state.theme === 'dark'}
              onChange={toggleTheme}
            />
            <div className="slider">
              <div className="cosmos"></div>
              <div className="energy-line"></div>
              <div className="energy-line"></div>
              <div className="energy-line"></div>
              <div className="toggle-orb">
                <div className="inner-orb"></div>
                <div className="ring"></div>
              </div>
              <div className="particles">
                <div style={{ '--angle': '30deg' } as React.CSSProperties} className="particle"></div>
                <div style={{ '--angle': '60deg' } as React.CSSProperties} className="particle"></div>
                <div style={{ '--angle': '90deg' } as React.CSSProperties} className="particle"></div>
                <div style={{ '--angle': '120deg' } as React.CSSProperties} className="particle"></div>
                <div style={{ '--angle': '150deg' } as React.CSSProperties} className="particle"></div>
                <div style={{ '--angle': '180deg' } as React.CSSProperties} className="particle"></div>
              </div>
            </div>
          </label>

          {/* Profile */}
          {user ? (
            <div className="relative">
              <motion.div
                className="flex items-center gap-2 glass px-3 py-2 rounded-xl cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-white/60">Level {state.analytics?.overall?.level || 1}</p>
                </div>
                <ChevronDown size={16} className={`text-white/60 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </motion.div>
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-black/50 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 z-50 p-2"
                  >
                    <div className="p-2">
                      <p className="text-xs text-white/60">User ID</p>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <span className="text-xs font-mono text-white/80 truncate" title={user.id}>
                          {user.id}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(user.id)}
                          className="px-2 py-1 flex-shrink-0"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-white/80 hover:bg-white/10 text-left rounded-lg transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="primary" size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
};