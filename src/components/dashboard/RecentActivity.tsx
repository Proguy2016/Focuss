import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Target, Zap, List } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../common/Card';
import { format as timeagoFormat } from 'timeago.js';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

interface Activity {
  id: string;
  type: string;
  title: string;
  time: Date | string;
  itemId?: string;
}

const activityConfig = {
  focus: { icon: Target, color: 'text-primary-400', route: '/focus' },
  task: { icon: CheckCircle, color: 'text-success-400', route: '/tasks' },
  habit: { icon: Zap, color: 'text-accent-400', route: '/habits' },
  default: { icon: List, color: 'text-secondary-400', route: '/dashboard' },
};

const getActivityIcon = (type: string) => {
  return activityConfig[type as keyof typeof activityConfig] || activityConfig.default;
};

export const RecentActivity: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  // Assuming state.user.recentActivity exists and has a similar structure
  const activities: Activity[] = state.user?.recentActivity?.slice(0, 4) || [];

  return (
    <Card variant="glass" className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>

      {activities.length === 0 ? (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Clock className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
          <p className="text-white/60">No recent activity to show.</p>
          <p className="text-white/40 text-sm mt-1">Get started by completing a task or a focus session.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity: Activity, index: number) => {
            const config = getActivityIcon(activity.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`${config.route}?id=${activity.itemId || ''}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`p-2 rounded-lg bg-white/10 ${config.color}`}>
                  <Icon size={16} />
                </div>

                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.title}</p>
                  <p className="text-white/50 text-xs">{timeagoFormat(activity.time)}</p>
                </div>

                <motion.div
                  className="w-2 h-2 rounded-full bg-current opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            );
          })}
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
          onClick={() => navigate('/activity')}
        >
          View all activity →
        </Button>
      </motion.div>
    </Card>
  );
};