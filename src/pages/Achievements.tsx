import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Target, Zap, Calendar, Award, 
  Crown, Medal, Shield, Flame, Lock, CheckCircle2,
  TrendingUp, Clock, Users, BookOpen, Filter, Search
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'focus' | 'habit' | 'task' | 'streak' | 'level' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  earnedAt: Date;
}

type FilterType = 'all' | 'unlocked' | 'locked' | 'focus' | 'habit' | 'task' | 'streak' | 'level' | 'social';

export const Achievements: React.FC = () => {
  const { state } = useApp();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first focus session',
      icon: Target,
      type: 'focus',
      tier: 'bronze',
      requirement: 1,
      progress: 1,
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
      xpReward: 50,
      rarity: 'common',
    },
    {
      id: '2',
      name: 'Focus Apprentice',
      description: 'Complete 10 focus sessions',
      icon: Target,
      type: 'focus',
      tier: 'bronze',
      requirement: 10,
      progress: 10,
      unlocked: true,
      unlockedAt: new Date('2024-01-20'),
      xpReward: 100,
      rarity: 'common',
    },
    {
      id: '3',
      name: 'Focus Warrior',
      description: 'Complete 50 focus sessions',
      icon: Target,
      type: 'focus',
      tier: 'silver',
      requirement: 50,
      progress: 50,
      unlocked: true,
      unlockedAt: new Date('2024-02-01'),
      xpReward: 250,
      rarity: 'rare',
    },
    {
      id: '4',
      name: 'Focus Master',
      description: 'Complete 100 focus sessions',
      icon: Target,
      type: 'focus',
      tier: 'gold',
      requirement: 100,
      progress: 87,
      unlocked: false,
      xpReward: 500,
      rarity: 'epic',
    },
    {
      id: '5',
      name: 'Focus Legend',
      description: 'Complete 500 focus sessions',
      icon: Crown,
      type: 'focus',
      tier: 'platinum',
      requirement: 500,
      progress: 87,
      unlocked: false,
      xpReward: 1000,
      rarity: 'legendary',
    },
    {
      id: '6',
      name: 'Habit Builder',
      description: 'Maintain a 7-day habit streak',
      icon: Flame,
      type: 'streak',
      tier: 'bronze',
      requirement: 7,
      progress: 7,
      unlocked: true,
      unlockedAt: new Date('2024-01-25'),
      xpReward: 150,
      rarity: 'common',
    },
    {
      id: '7',
      name: 'Consistency King',
      description: 'Maintain a 30-day habit streak',
      icon: Flame,
      type: 'streak',
      tier: 'gold',
      requirement: 30,
      progress: 12,
      unlocked: false,
      xpReward: 750,
      rarity: 'epic',
    },
    {
      id: '8',
      name: 'Task Crusher',
      description: 'Complete 100 tasks',
      icon: CheckCircle2,
      type: 'task',
      tier: 'silver',
      requirement: 100,
      progress: 73,
      unlocked: false,
      xpReward: 300,
      rarity: 'rare',
    },
    {
      id: '9',
      name: 'Level Up',
      description: 'Reach level 10',
      icon: Star,
      type: 'level',
      tier: 'silver',
      requirement: 10,
      progress: 12,
      unlocked: true,
      unlockedAt: new Date('2024-02-05'),
      xpReward: 500,
      rarity: 'rare',
    },
    {
      id: '10',
      name: 'Social Butterfly',
      description: 'Join 3 focus groups',
      icon: Users,
      type: 'social',
      tier: 'bronze',
      requirement: 3,
      progress: 1,
      unlocked: false,
      xpReward: 200,
      rarity: 'common',
    },
    {
      id: '11',
      name: 'Knowledge Seeker',
      description: 'Create 50 notes',
      icon: BookOpen,
      type: 'task',
      tier: 'silver',
      requirement: 50,
      progress: 23,
      unlocked: false,
      xpReward: 350,
      rarity: 'rare',
    },
    {
      id: '12',
      name: 'Time Master',
      description: 'Accumulate 100 hours of focus time',
      icon: Clock,
      type: 'focus',
      tier: 'gold',
      requirement: 6000, // 100 hours in minutes
      progress: 2940,
      unlocked: false,
      xpReward: 800,
      rarity: 'epic',
    },
  ];

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Early Adopter',
      description: 'Joined Focus Ritual in its first month',
      icon: Star,
      color: '#8B5CF6',
      earnedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Streak Keeper',
      description: 'Never missed a day for a week',
      icon: Flame,
      color: '#F59E0B',
      earnedAt: new Date('2024-01-25'),
    },
    {
      id: '3',
      name: 'Community Helper',
      description: 'Helped 10 people in focus groups',
      icon: Users,
      color: '#10B981',
      earnedAt: new Date('2024-02-01'),
    },
  ];

  const filteredAchievements = achievements.filter(achievement => {
    // Search filter
    if (searchTerm && !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    switch (filterType) {
      case 'unlocked':
        return achievement.unlocked;
      case 'locked':
        return !achievement.unlocked;
      case 'focus':
      case 'habit':
      case 'task':
      case 'streak':
      case 'level':
      case 'social':
        return achievement.type === filterType;
      default:
        return true;
    }
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-amber-700';
      case 'silver': return 'from-slate-400 to-slate-500';
      case 'gold': return 'from-yellow-400 to-yellow-500';
      case 'platinum': return 'from-cyan-400 to-cyan-500';
      case 'diamond': return 'from-purple-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min((achievement.progress / achievement.requirement) * 100, 100);
  };

  const formatProgress = (achievement: Achievement) => {
    if (achievement.type === 'focus' && achievement.requirement > 100) {
      // Convert minutes to hours for large focus requirements
      const currentHours = Math.floor(achievement.progress / 60);
      const targetHours = Math.floor(achievement.requirement / 60);
      return `${currentHours}/${targetHours} hours`;
    }
    return `${achievement.progress}/${achievement.requirement}`;
  };

  const AchievementCard: React.FC<{ achievement: Achievement; index: number }> = ({ achievement, index }) => {
    const IconComponent = achievement.icon;
    const progressPercentage = getProgressPercentage(achievement);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <Card 
          variant="glass" 
          hover 
          className={`p-6 cursor-pointer transition-all duration-300 ${
            achievement.unlocked ? 'ring-2 ring-success-500/30' : 'opacity-75'
          }`}
          onClick={() => setSelectedAchievement(achievement)}
        >
          <div className="flex items-start gap-4">
            <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center ${
              !achievement.unlocked ? 'grayscale' : ''
            }`}>
              {achievement.unlocked ? (
                <IconComponent className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white/60" />
              )}
              
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{achievement.name}</h3>
                  <p className="text-white/60 text-sm">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${getRarityColor(achievement.rarity)} capitalize`}>
                    {achievement.rarity}
                  </div>
                  <div className="text-white/60 text-xs">{achievement.xpReward} XP</div>
                </div>
              </div>
              
              {!achievement.unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white/60">{formatProgress(achievement)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${getTierColor(achievement.tier)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
              
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-white/60 text-xs mt-2">
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    totalXP: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0),
    rarest: achievements.filter(a => a.unlocked && a.rarity === 'legendary').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Achievements</h1>
          <p className="text-white/60">
            Track your progress and unlock rewards
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{stats.unlocked}/{stats.total}</div>
            <div className="text-white/60 text-sm">Unlocked</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-success-400 mb-2">{stats.unlocked}</div>
          <div className="text-white/60 text-sm">Achievements Unlocked</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-warning-400 mb-2">{stats.totalXP}</div>
          <div className="text-white/60 text-sm">XP Earned</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{stats.rarest}</div>
          <div className="text-white/60 text-sm">Legendary Unlocked</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">
            {Math.round((stats.unlocked / stats.total) * 100)}%
          </div>
          <div className="text-white/60 text-sm">Completion Rate</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'unlocked', label: 'Unlocked' },
              { value: 'locked', label: 'Locked' },
              { value: 'focus', label: 'Focus' },
              { value: 'habit', label: 'Habits' },
              { value: 'task', label: 'Tasks' },
              { value: 'streak', label: 'Streaks' },
              { value: 'level', label: 'Levels' },
              { value: 'social', label: 'Social' },
            ].map(filter => (
              <Button
                key={filter.value}
                variant={filterType === filter.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterType(filter.value as FilterType)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement, index) => (
              <AchievementCard key={achievement.id} achievement={achievement} index={index} />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/60 mb-2">No achievements found</h3>
              <p className="text-white/40">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Unlocks */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Unlocks</h3>
            <div className="space-y-3">
              {achievements
                .filter(a => a.unlocked)
                .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
                .slice(0, 3)
                .map(achievement => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white/80 text-sm">{achievement.name}</div>
                        <div className="text-white/60 text-xs">
                          {achievement.unlockedAt?.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-warning-400 text-xs">+{achievement.xpReward} XP</div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Badges */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Special Badges</h3>
            <div className="space-y-3">
              {badges.map(badge => {
                const IconComponent = badge.icon;
                return (
                  <div key={badge.id} className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${badge.color}20` }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: badge.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/80 text-sm">{badge.name}</div>
                      <div className="text-white/60 text-xs">{badge.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Progress to Next */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Close to Unlocking</h3>
            <div className="space-y-4">
              {achievements
                .filter(a => !a.unlocked)
                .sort((a, b) => getProgressPercentage(b) - getProgressPercentage(a))
                .slice(0, 3)
                .map(achievement => {
                  const IconComponent = achievement.icon;
                  const progress = getProgressPercentage(achievement);
                  return (
                    <div key={achievement.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-white/60" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white/80 text-sm">{achievement.name}</div>
                          <div className="text-white/60 text-xs">{formatProgress(achievement)}</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div
                          className={`bg-gradient-to-r ${getTierColor(achievement.tier)} h-1 rounded-full`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAchievement(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${getTierColor(selectedAchievement.tier)} flex items-center justify-center ${
                !selectedAchievement.unlocked ? 'grayscale' : ''
              }`}>
                {selectedAchievement.unlocked ? (
                  <selectedAchievement.icon className="w-12 h-12 text-white" />
                ) : (
                  <Lock className="w-12 h-12 text-white/60" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{selectedAchievement.name}</h2>
              <p className="text-white/70 mb-4">{selectedAchievement.description}</p>
              
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getRarityColor(selectedAchievement.rarity)} capitalize`}>
                    {selectedAchievement.rarity}
                  </div>
                  <div className="text-white/60 text-sm">Rarity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning-400">{selectedAchievement.xpReward}</div>
                  <div className="text-white/60 text-sm">XP Reward</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-400 capitalize">{selectedAchievement.tier}</div>
                  <div className="text-white/60 text-sm">Tier</div>
                </div>
              </div>
              
              {!selectedAchievement.unlocked && (
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white/60">{formatProgress(selectedAchievement)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${getTierColor(selectedAchievement.tier)} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${getProgressPercentage(selectedAchievement)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                <div className="text-success-400 text-sm mb-6">
                  ✓ Unlocked on {selectedAchievement.unlockedAt.toLocaleDateString()}
                </div>
              )}
              
              <Button
                variant="primary"
                onClick={() => setSelectedAchievement(null)}
                fullWidth
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};