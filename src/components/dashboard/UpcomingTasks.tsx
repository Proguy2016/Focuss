import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const UpcomingTasks: React.FC = () => {
  const { state } = useApp();
  
  // Get upcoming tasks (next 5 tasks with due dates)
  const upcomingTasks = state.tasks
    .filter(task => task.dueDate && task.status.type !== 'completed')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Due today';
    } else if (diffInHours < 48) {
      return 'Due tomorrow';
    } else {
      return `Due ${Math.ceil(diffInHours / 24)} days`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-error-400 bg-error-500/10';
      case 'medium':
        return 'text-warning-400 bg-warning-500/10';
      default:
        return 'text-success-400 bg-success-500/10';
    }
  };

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Upcoming Tasks</h2>
        <Calendar className="w-5 h-5 text-primary-400" />
      </div>
      
      {upcomingTasks.length === 0 ? (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle2 className="w-12 h-12 text-success-400 mx-auto mb-3" />
          <p className="text-white/60">No upcoming tasks with due dates</p>
          <p className="text-white/40 text-sm mt-1">You're all caught up!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {upcomingTasks.map((task, index) => (
            <motion.div
              key={task.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`p-2 rounded-lg ${getPriorityColor(task.priority.level)}`}>
                <AlertCircle size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={12} className="text-white/40" />
                  <p className="text-white/50 text-xs">
                    {formatDueDate(new Date(task.dueDate!))}
                  </p>
                  {task.estimatedTime && (
                    <span className="text-white/40 text-xs">
                      • {task.estimatedTime}min
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${task.priority.color === '#EF4444' ? 'bg-error-400' : task.priority.color === '#F59E0B' ? 'bg-warning-400' : 'bg-success-400'}`} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <motion.div
        className="mt-6 pt-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-primary-400 hover:text-primary-300"
        >
          View all tasks →
        </Button>
      </motion.div>
    </Card>
  );
};