import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Crown, Trophy, Target, Zap, 
  MessageCircle, Heart, Share2, MoreHorizontal, Settings,
  Calendar, Clock, TrendingUp, Award, Star, UserPlus
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

interface FocusGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  isPublic: boolean;
  currentSession?: {
    type: 'focus' | 'break';
    timeLeft: number;
    participants: number;
  };
  leaderboard: Array<{
    id: string;
    name: string;
    avatar: string;
    score: number;
    streak: number;
  }>;
}

interface SocialPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: number;
  };
  type: 'achievement' | 'milestone' | 'session' | 'habit';
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export const Social: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'leaderboard'>('feed');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPublic: true,
    maxMembers: 10,
  });

  // Mock data
  const focusGroups: FocusGroup[] = [
    {
      id: '1',
      name: 'Morning Productivity Squad',
      description: 'Early birds who love to get things done before 10 AM',
      members: 8,
      maxMembers: 12,
      isPublic: true,
      currentSession: {
        type: 'focus',
        timeLeft: 1200, // 20 minutes
        participants: 5,
      },
      leaderboard: [
        { id: '1', name: 'Alex Chen', avatar: '🧑‍💻', score: 2450, streak: 12 },
        { id: '2', name: 'Sarah Kim', avatar: '👩‍🎨', score: 2380, streak: 8 },
        { id: '3', name: 'Mike Johnson', avatar: '👨‍🔬', score: 2210, streak: 15 },
      ],
    },
    {
      id: '2',
      name: 'Study Buddies',
      description: 'Students supporting each other through exam season',
      members: 15,
      maxMembers: 20,
      isPublic: true,
      leaderboard: [
        { id: '4', name: 'Emma Davis', avatar: '👩‍🎓', score: 1890, streak: 6 },
        { id: '5', name: 'James Wilson', avatar: '👨‍🎓', score: 1750, streak: 9 },
      ],
    },
    {
      id: '3',
      name: 'Remote Workers Unite',
      description: 'Fighting isolation one focus session at a time',
      members: 23,
      maxMembers: 30,
      isPublic: false,
      leaderboard: [
        { id: '6', name: 'Lisa Park', avatar: '👩‍💼', score: 3200, streak: 21 },
        { id: '7', name: 'David Brown', avatar: '👨‍💼', score: 2980, streak: 18 },
      ],
    },
  ];

  const socialPosts: SocialPost[] = [
    {
      id: '1',
      user: { name: 'Alex Chen', avatar: '🧑‍💻', level: 12 },
      type: 'achievement',
      content: 'Just unlocked the "Focus Master" achievement! 🎯 100 focus sessions completed!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 24,
      comments: 8,
      isLiked: false,
    },
    {
      id: '2',
      user: { name: 'Sarah Kim', avatar: '👩‍🎨', level: 8 },
      type: 'milestone',
      content: 'Hit my 30-day meditation streak today! 🧘‍♀️ The consistency is really paying off.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 31,
      comments: 12,
      isLiked: true,
    },
    {
      id: '3',
      user: { name: 'Mike Johnson', avatar: '👨‍🔬', level: 15 },
      type: 'session',
      content: 'Just finished a 2-hour deep work session on my research project. Flow state achieved! 🌊',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: 18,
      comments: 5,
      isLiked: false,
    },
  ];

  const globalLeaderboard = [
    { rank: 1, name: 'Lisa Park', avatar: '👩‍💼', score: 3200, streak: 21, level: 18 },
    { rank: 2, name: 'David Brown', avatar: '👨‍💼', score: 2980, streak: 18, level: 16 },
    { rank: 3, name: 'Alex Chen', avatar: '🧑‍💻', score: 2450, streak: 12, level: 12 },
    { rank: 4, name: 'Sarah Kim', avatar: '👩‍🎨', score: 2380, streak: 8, level: 8 },
    { rank: 5, name: 'Mike Johnson', avatar: '👨‍🔬', score: 2210, streak: 15, level: 15 },
    { rank: 6, name: 'You', avatar: '🎯', score: 2100, streak: 7, level: 12 },
  ];

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'milestone': return Star;
      case 'session': return Target;
      case 'habit': return Zap;
      default: return Target;
    }
  };

  const PostCard: React.FC<{ post: SocialPost; index: number }> = ({ post, index }) => {
    const PostIcon = getPostIcon(post.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card variant="glass" className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
              {post.user.avatar}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-white">{post.user.name}</span>
                <span className="text-xs text-white/60">Level {post.user.level}</span>
                <PostIcon className="w-4 h-4 text-primary-400" />
                <span className="text-xs text-white/40">{formatTimestamp(post.timestamp)}</span>
              </div>
              
              <p className="text-white/80 mb-4">{post.content}</p>
              
              <div className="flex items-center gap-6">
                <button
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    post.isLiked ? 'text-error-400' : 'text-white/60 hover:text-error-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes}
                </button>
                
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </button>
                
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" icon={MoreHorizontal} />
          </div>
        </Card>
      </motion.div>
    );
  };

  const GroupCard: React.FC<{ group: FocusGroup; index: number }> = ({ group, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card variant="glass" className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white mb-1">{group.name}</h3>
            <p className="text-white/60 text-sm mb-2">{group.description}</p>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>{group.members}/{group.maxMembers} members</span>
              <span className={`px-2 py-1 rounded text-xs ${
                group.isPublic ? 'bg-success-500/20 text-success-400' : 'bg-warning-500/20 text-warning-400'
              }`}>
                {group.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
          
          <Button variant="primary" size="sm" icon={UserPlus}>
            Join
          </Button>
        </div>
        
        {group.currentSession && (
          <div className="glass p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  group.currentSession.type === 'focus' ? 'bg-primary-400' : 'bg-success-400'
                } animate-pulse`} />
                <span className="text-white text-sm">
                  {group.currentSession.type === 'focus' ? 'Focus Session' : 'Break Time'}
                </span>
              </div>
              <span className="text-white/60 text-sm">
                {formatTimeLeft(group.currentSession.timeLeft)}
              </span>
            </div>
            <div className="text-white/60 text-xs mt-1">
              {group.currentSession.participants} participants active
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-white/80 text-sm mb-2">Top Members</h4>
          <div className="space-y-2">
            {group.leaderboard.slice(0, 3).map((member, idx) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{member.avatar}</span>
                  <span className="text-white/80 text-sm">{member.name}</span>
                  {idx === 0 && <Crown className="w-3 h-3 text-warning-400" />}
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs">{member.score} pts</div>
                  <div className="text-white/40 text-xs">{member.streak} day streak</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Social</h1>
          <p className="text-white/60">
            Connect with others and stay motivated together
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => setShowCreateGroup(true)}
          >
            Create Group
          </Button>
          <Button
            variant="primary"
            icon={Search}
            onClick={() => setShowJoinGroup(true)}
          >
            Find Groups
          </Button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 glass p-1 rounded-xl w-fit">
        <Button
          variant={activeTab === 'feed' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('feed')}
        >
          Feed
        </Button>
        <Button
          variant={activeTab === 'groups' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </Button>
        <Button
          variant={activeTab === 'leaderboard' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </Button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Create Post */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center text-xl">
                    🎯
                  </div>
                  <input
                    type="text"
                    placeholder="Share your progress..."
                    className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                  />
                  <Button variant="primary" size="sm">
                    Post
                  </Button>
                </div>
              </Card>

              {/* Posts */}
              <div className="space-y-4">
                {socialPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Your Stats */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Rank</span>
                    <span className="text-white font-semibold">#6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Score</span>
                    <span className="text-white font-semibold">2,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Streak</span>
                    <span className="text-white font-semibold">7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Level</span>
                    <span className="text-white font-semibold">12</span>
                  </div>
                </div>
              </Card>

              {/* Active Groups */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Groups</h3>
                <div className="space-y-3">
                  {focusGroups.slice(0, 2).map(group => (
                    <div key={group.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-white/80 text-sm">{group.name}</div>
                        <div className="text-white/60 text-xs">{group.members} members</div>
                      </div>
                      {group.currentSession && (
                        <div className="text-right">
                          <div className="text-primary-400 text-xs">Active</div>
                          <div className="text-white/60 text-xs">
                            {formatTimeLeft(group.currentSession.timeLeft)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Leaderboard */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {globalLeaderboard.slice(0, 5).map(user => (
                    <div key={user.rank} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.rank <= 3 ? 'bg-warning-500 text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        {user.rank}
                      </div>
                      <span className="text-lg">{user.avatar}</span>
                      <div className="flex-1">
                        <div className="text-white/80 text-sm">{user.name}</div>
                        <div className="text-white/60 text-xs">{user.score} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <Card variant="glass" className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select className="glass px-3 py-2 rounded-lg text-white focus:outline-none">
                  <option>All Groups</option>
                  <option>Public</option>
                  <option>Private</option>
                  <option>Active Sessions</option>
                </select>
              </div>
            </Card>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {focusGroups.map((group, index) => (
                <GroupCard key={group.id} group={group} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Leaderboard Filters */}
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Global</Button>
              <Button variant="ghost" size="sm">Friends</Button>
              <Button variant="ghost" size="sm">Groups</Button>
              <Button variant="ghost" size="sm">Weekly</Button>
            </div>

            {/* Top 3 Podium */}
            <Card variant="glass" className="p-8">
              <div className="flex items-end justify-center gap-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 flex items-center justify-center text-2xl mb-3">
                    {globalLeaderboard[1].avatar}
                  </div>
                  <div className="text-white font-semibold">{globalLeaderboard[1].name}</div>
                  <div className="text-white/60 text-sm">{globalLeaderboard[1].score} pts</div>
                  <div className="w-20 h-16 bg-slate-500/20 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-400">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <Crown className="w-8 h-8 text-warning-400 mx-auto mb-2" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-warning-400 to-warning-500 flex items-center justify-center text-3xl mb-3">
                    {globalLeaderboard[0].avatar}
                  </div>
                  <div className="text-white font-semibold">{globalLeaderboard[0].name}</div>
                  <div className="text-white/60 text-sm">{globalLeaderboard[0].score} pts</div>
                  <div className="w-24 h-20 bg-warning-500/20 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-3xl font-bold text-warning-400">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center text-2xl mb-3">
                    {globalLeaderboard[2].avatar}
                  </div>
                  <div className="text-white font-semibold">{globalLeaderboard[2].name}</div>
                  <div className="text-white/60 text-sm">{globalLeaderboard[2].score} pts</div>
                  <div className="w-20 h-12 bg-amber-600/20 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-600">3</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Full Leaderboard */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Full Rankings</h3>
              <div className="space-y-3">
                {globalLeaderboard.map(user => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      user.name === 'You' ? 'bg-primary-500/20 border border-primary-500/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.rank <= 3 ? 'bg-warning-500 text-white' : 'bg-white/10 text-white/60'
                    }`}>
                      {user.rank}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{user.name}</span>
                        <span className="text-xs text-white/60">Level {user.level}</span>
                      </div>
                      <div className="text-white/60 text-sm">{user.streak} day streak</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-semibold">{user.score}</div>
                      <div className="text-white/60 text-sm">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        title="Create Focus Group"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Group Name *</label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name..."
              className="input-field w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Description</label>
            <textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your group..."
              className="input-field w-full h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Max Members</label>
              <input
                type="number"
                value={newGroup.maxMembers}
                onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                className="input-field w-full"
                min="2"
                max="100"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Visibility</label>
              <select
                value={newGroup.isPublic ? 'public' : 'private'}
                onChange={(e) => setNewGroup(prev => ({ ...prev, isPublic: e.target.value === 'public' }))}
                className="input-field w-full"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={() => {
                console.log('Creating group:', newGroup);
                setShowCreateGroup(false);
              }}
              fullWidth
              disabled={!newGroup.name.trim()}
            >
              Create Group
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateGroup(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};