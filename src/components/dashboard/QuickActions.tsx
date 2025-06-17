import React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Target, CheckSquare, Music, Brain } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const actions = [
    {
      icon: Play,
      label: 'Start Focus Session',
      description: 'Begin a 25-minute focus session',
      color: 'from-primary-500 to-primary-600',
      action: () => {
        navigate('/focus');
        // Start a focus session immediately
        dispatch({
          type: 'SET_CURRENT_SESSION',
          payload: {
            id: `session-${Date.now()}`,
            userId: 'current-user',
            type: 'work',
            duration: 25,
            actualDuration: 0,
            startTime: new Date(),
            completed: false,
            distractions: 0,
            productivity: 0
          }
        });
      },
    },
    {
      icon: Plus,
      label: 'Add Task',
      description: 'Create a new task or habit',
      color: 'from-secondary-500 to-secondary-600',
      action: () => navigate('/tasks?action=new'),
    },
    {
      icon: Target,
      label: 'Set Goal',
      description: 'Define your daily objectives',
      color: 'from-accent-500 to-accent-600',
      action: () => navigate('/habits?action=new-goal'),
    },
    {
      icon: Music,
      label: 'Focus Music',
      description: 'Play ambient soundscapes',
      color: 'from-success-500 to-success-600',
      action: () => navigate('/soundscapes'),
    },
  ];

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-5 h-5 text-primary-400" />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="secondary"
              className={`w-full h-auto p-4 bg-gradient-to-r ${action.color} hover:scale-105 border-0`}
              onClick={action.action}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-white/20 rounded-lg">
                  <action.icon size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white">{action.label}</p>
                  <p className="text-xs text-white/80">{action.description}</p>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};