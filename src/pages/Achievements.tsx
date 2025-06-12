import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Target, Zap, Calendar, Award,
  Crown, Medal, Shield, Flame, Lock, CheckCircle2,
  TrendingUp, Clock, Users, BookOpen, Filter, Search,
  MessageSquare, UserPlus, PlusSquare, Brain, Lightbulb, Bug, Moon, BrainCircuit
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Focus' | 'Streaks' | 'Tasks' | 'Community' | 'Level' | 'Special' | 'Badges';
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

type FilterType = 'all' | 'unlocked' | 'locked';
const achievementCategories = ['Focus', 'Streaks', 'Tasks', 'Community', 'Level', 'Special', 'Badges'];
type CategoryFilterType = 'all' | (typeof achievementCategories)[number];

export const Achievements: React.FC = () => {
  const { state } = useApp();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Mock achievements data with categories
  const baseAchievements: Achievement[] = [
    // Focus Sessions
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first focus session',
      icon: Target,
      category: 'Focus',
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
      category: 'Focus',
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
      category: 'Focus',
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
      category: 'Focus',
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
      category: 'Focus',
      tier: 'platinum',
      requirement: 500,
      progress: 87,
      unlocked: false,
      xpReward: 1000,
      rarity: 'legendary',
    },
    // Focus Time
    {
      id: '12',
      name: 'Time Master',
      description: 'Accumulate 100 hours of focus time',
      icon: Clock,
      category: 'Focus',
      tier: 'gold',
      requirement: 6000, // 100 hours in minutes
      progress: 2940,
      unlocked: false,
      xpReward: 800,
      rarity: 'epic',
    },
    {
      id: '17',
      name: 'Quick Sprint',
      description: 'Accumulate 10 hours of focus time',
      icon: Clock,
      category: 'Focus',
      tier: 'bronze',
      requirement: 600, // 10 hours in minutes
      progress: 600,
      unlocked: true,
      unlockedAt: new Date('2024-02-12'),
      xpReward: 100,
      rarity: 'common',
    },
    {
      id: '18',
      name: 'Marathon Runner',
      description: 'Accumulate 50 hours of focus time',
      icon: Clock,
      category: 'Focus',
      tier: 'silver',
      requirement: 3000, // 50 hours in minutes
      progress: 2940,
      unlocked: false,
      xpReward: 400,
      rarity: 'rare',
    },
    {
      id: '19',
      name: 'Endurance Expert',
      description: 'Accumulate 200 hours of focus time',
      icon: Clock,
      category: 'Focus',
      tier: 'gold',
      requirement: 12000, // 200 hours in minutes
      progress: 2940,
      unlocked: false,
      xpReward: 1200,
      rarity: 'epic',
    },
    {
      id: '20',
      name: 'Timeless',
      description: 'Accumulate 1000 hours of focus time',
      icon: Clock,
      category: 'Focus',
      tier: 'diamond',
      requirement: 60000, // 1000 hours in minutes
      progress: 2940,
      unlocked: false,
      xpReward: 5000,
      rarity: 'legendary',
    },
    // Habits & Streaks
    {
      id: '6',
      name: 'Habit Builder',
      description: 'Maintain a 7-day habit streak',
      icon: Flame,
      category: 'Streaks',
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
      category: 'Streaks',
      tier: 'gold',
      requirement: 30,
      progress: 12,
      unlocked: false,
      xpReward: 750,
      rarity: 'epic',
    },
    {
      id: '22',
      name: 'Perfect Week',
      description: 'Complete all habits for 7 days in a row',
      icon: Calendar,
      category: 'Streaks',
      tier: 'silver',
      requirement: 7,
      progress: 3,
      unlocked: false,
      xpReward: 300,
      rarity: 'rare',
    },
    // Tasks
    {
      id: '8',
      name: 'Task Crusher',
      description: 'Complete 100 tasks',
      icon: CheckCircle2,
      category: 'Tasks',
      tier: 'silver',
      requirement: 100,
      progress: 73,
      unlocked: false,
      xpReward: 300,
      rarity: 'rare',
    },
    {
      id: '11',
      name: 'Knowledge Seeker',
      description: 'Create 50 notes',
      icon: BookOpen,
      category: 'Tasks',
      tier: 'silver',
      requirement: 50,
      progress: 23,
      unlocked: false,
      xpReward: 350,
      rarity: 'rare',
    },
    {
      id: '21',
      name: 'Task Manager',
      description: 'Complete 50 tasks',
      icon: CheckCircle2,
      category: 'Tasks',
      tier: 'bronze',
      requirement: 50,
      progress: 50,
      unlocked: true,
      unlockedAt: new Date('2024-02-18'),
      xpReward: 200,
      rarity: 'common',
    },
    {
      id: '31',
      name: 'Task Enthusiast',
      description: 'Complete 10 tasks',
      icon: CheckCircle2,
      category: 'Tasks',
      tier: 'bronze',
      requirement: 10,
      progress: 10,
      unlocked: true,
      unlockedAt: new Date('2024-01-22'),
      xpReward: 75,
      rarity: 'common',
    },
    {
      id: '32',
      name: 'Task Champion',
      description: 'Complete 200 tasks',
      icon: CheckCircle2,
      category: 'Tasks',
      tier: 'gold',
      requirement: 200,
      progress: 73,
      unlocked: false,
      xpReward: 600,
      rarity: 'epic',
    },
    {
      id: '33',
      name: 'Task Legend',
      description: 'Complete 500 tasks',
      icon: Crown,
      category: 'Tasks',
      tier: 'platinum',
      requirement: 500,
      progress: 73,
      unlocked: false,
      xpReward: 1200,
      rarity: 'legendary',
    },
    // Levels
    {
      id: '28',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: Star,
      category: 'Level',
      tier: 'bronze',
      requirement: 5,
      progress: 4, // Example progress
      unlocked: false,
      xpReward: 250,
      rarity: 'common',
    },
    {
      id: '9',
      name: 'Level Up',
      description: 'Reach level 10',
      icon: Star,
      category: 'Level',
      tier: 'silver',
      requirement: 10,
      progress: 12,
      unlocked: true,
      unlockedAt: new Date('2024-02-05'),
      xpReward: 500,
      rarity: 'rare',
    },
    {
      id: '29',
      name: 'High Achiever',
      description: 'Reach level 15',
      icon: Star,
      category: 'Level',
      tier: 'gold',
      requirement: 15,
      progress: 12,
      unlocked: false,
      xpReward: 1000,
      rarity: 'epic',
    },
    {
      id: '30',
      name: 'Level Pro',
      description: 'Reach level 20',
      icon: Star,
      category: 'Level',
      tier: 'platinum',
      requirement: 20,
      progress: 12,
      unlocked: false,
      xpReward: 1500,
      rarity: 'epic',
    },
    // Community
    {
      id: '10',
      name: 'Social Butterfly',
      description: 'Join 3 focus groups',
      icon: Users,
      category: 'Community',
      tier: 'bronze',
      requirement: 3,
      progress: 1,
      unlocked: false,
      xpReward: 200,
      rarity: 'common',
    },
    {
      id: '23',
      name: 'Community Contributor',
      description: 'Create 5 posts in the social feed',
      icon: MessageSquare,
      category: 'Community',
      tier: 'bronze',
      requirement: 5,
      progress: 2,
      unlocked: false,
      xpReward: 150,
      rarity: 'common',
    },
    {
      id: '24',
      name: 'Friend Finder',
      description: 'Add 5 friends to your network',
      icon: UserPlus,
      category: 'Community',
      tier: 'bronze',
      requirement: 5,
      progress: 5,
      unlocked: true,
      unlockedAt: new Date('2024-02-20'),
      xpReward: 150,
      rarity: 'common',
    },
    {
      id: '25',
      name: 'Team Player',
      description: 'Join 10 collaboration rooms',
      icon: Users,
      category: 'Community',
      tier: 'silver',
      requirement: 10,
      progress: 3,
      unlocked: false,
      xpReward: 300,
      rarity: 'rare',
    },
    {
      id: '26',
      name: 'The Architect',
      description: 'Create your first collaboration room',
      icon: PlusSquare,
      category: 'Community',
      tier: 'bronze',
      requirement: 1,
      progress: 1,
      unlocked: true,
      unlockedAt: new Date('2024-02-22'),
      xpReward: 100,
      rarity: 'common',
    },
    // Special
    {
      id: '27',
      name: 'AI Prodigy',
      description: 'Study a set of flashcards generated by the AI Coach',
      icon: Brain,
      category: 'Special',
      tier: 'silver',
      requirement: 1,
      progress: 0,
      unlocked: false,
      xpReward: 250,
      rarity: 'rare',
    },
    {
      id: '34',
      name: 'Deep Work',
      description: 'Complete a single focus session of 3 hours or more',
      icon: BrainCircuit,
      category: 'Special',
      tier: 'gold',
      requirement: 180, // 3 hours in minutes
      progress: 0,
      unlocked: false,
      xpReward: 750,
      rarity: 'epic',
    },
    {
      id: '35',
      name: 'Night Owl',
      description: 'Complete a focus session between midnight and 4 AM',
      icon: Moon,
      category: 'Special',
      tier: 'silver',
      requirement: 1,
      progress: 0,
      unlocked: false,
      xpReward: 300,
      rarity: 'rare',
    },
    {
      id: '36',
      name: 'Weekend Warrior',
      description: 'Log 5 hours of focus time during a single weekend',
      icon: Award,
      category: 'Special',
      tier: 'silver',
      requirement: 300, // 5 hours in minutes
      progress: 0,
      unlocked: false,
      xpReward: 400,
      rarity: 'rare',
    }
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
    {
      id: '4',
      name: 'Beta Tester',
      description: 'Provided valuable feedback during beta testing',
      icon: Bug,
      color: '#EC4899',
      earnedAt: new Date('2023-12-25'),
    },
    {
      id: '5',
      name: 'Innovator',
      description: 'Suggested a feature that got implemented',
      icon: Lightbulb,
      color: '#3B82F6',
      earnedAt: new Date('2024-02-28'),
    },
  ];

  const badgeAchievements: Achievement[] = badges.map(badge => ({
    id: `badge-${badge.id}`,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    category: 'Badges',
    tier: 'gold', // Or determine tier based on some logic
    requirement: 1,
    progress: 1,
    unlocked: true,
    unlockedAt: badge.earnedAt,
    xpReward: 500, // Example XP reward
    rarity: 'epic',
  }));

  const achievements = [...baseAchievements, ...badgeAchievements];

  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      // Search filter
      const searchMatch = searchTerm === '' ||
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = filterType === 'all' ||
        (filterType === 'unlocked' && achievement.unlocked) ||
        (filterType === 'locked' && !achievement.unlocked);

      // Category filter
      const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;

      return searchMatch && statusMatch && categoryMatch;
    });
  }, [achievements, searchTerm, filterType, categoryFilter]);

  const groupedAchievements = useMemo(() => {
    return filteredAchievements.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(achievement);
      return acc;
    }, {} as Record<string, Achievement[]>);
  }, [filteredAchievements]);

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
      case 'legendary': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min((achievement.progress / achievement.requirement) * 100, 100);
  };

  const formatProgress = (achievement: Achievement) => {
    if (achievement.category === 'Focus' && achievement.requirement > 100) {
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
          className={`p-6 cursor-pointer transition-all duration-300 ${achievement.unlocked ? 'ring-2 ring-success-500/30' : 'opacity-75'
            }`}
          onClick={() => setSelectedAchievement(achievement)}
        >
          <div className="flex items-start gap-4">
            <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center ${!achievement.unlocked ? 'grayscale' : ''
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
            {stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0}%
          </div>
          <div className="text-white/60 text-sm">Completion Rate</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'unlocked', label: 'Unlocked' },
              { value: 'locked', label: 'Locked' },
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

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mt-4">
          <Button
            key="all-categories"
            variant={categoryFilter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            All Categories
          </Button>
          {achievementCategories.map(cat => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements Grid */}
        <div className="lg:col-span-2 space-y-8">
          {filteredAchievements.length > 0 ? (
            (categoryFilter === 'all' ? achievementCategories : [categoryFilter])
              .map(category => {
                const achievementsForCategory = groupedAchievements[category];
                if (!achievementsForCategory || achievementsForCategory.length === 0) {
                  return null;
                }
                return (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-white mb-4 capitalize">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievementsForCategory.map((achievement, index) => (
                        <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                      ))}
                    </div>
                  </div>
                )
              })
          ) : (
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
                      <IconComponent className="w-5 h-5" />
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
              <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${getTierColor(selectedAchievement.tier)} flex items-center justify-center ${!selectedAchievement.unlocked ? 'grayscale' : ''
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
                  ✓ Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
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