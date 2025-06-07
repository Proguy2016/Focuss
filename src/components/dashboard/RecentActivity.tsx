import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Target, Zap } from 'lucide-react';
import { Card } from '../common/Card';

interface Activity {
  id: string;
  type: 'focus' | 'task' | 'habit';
  title: string;
  time: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

export const RecentActivity: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'focus',
      title: 'Completed 25-minute focus session',
      time: '2 hours ago',
      icon: Target,
      color: 'text-primary-400',
    },
    {
      id: '2',
      type: 'task',
      title: 'Finished project proposal draft',
      time: '4 hours ago',
      icon: CheckCircle,
      color: 'text-success-400',
    },
    {
      id: '3',
      type: 'habit',
      title: 'Completed morning meditation',
      time: '6 hours ago',
      icon: Zap,
      color: 'text-accent-400',
    },
    {
      id: '4',
      type: 'focus',
      title: 'Started deep work session',
      time: '8 hours ago',
      icon: Clock,
      color: 'text-secondary-400',
    },
  ];

  return (
    <Card variant="glass" className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-2 rounded-lg bg-white/10 ${activity.color}`}>
              <activity.icon size={16} />
            </div>
            
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{activity.title}</p>
              <p className="text-white/50 text-xs">{activity.time}</p>
            </div>
            
            <motion.div
              className="w-2 h-2 rounded-full bg-current opacity-50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </div>
      
      <motion.div
        className="mt-6 pt-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button className="text-primary-400 text-sm hover:text-primary-300 transition-colors">
          View all activity →
        </button>
      </motion.div>
    </Card>
  );
};