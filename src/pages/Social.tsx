import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Crown, Trophy, Target, Zap,
  MessageCircle, Heart, Share2, MoreHorizontal, Settings,
  Calendar, Clock, TrendingUp, Award, Star, UserPlus, UserX, Mail,
  Check, X, UserCheck, User, UserMinus, Edit, Trash2, Image, Send
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import FriendsService, { FriendProfile, FriendRequest } from '../services/FriendsService';
import api from '../services/api';
import { SimpleChatManager } from '../components/social/SimpleChatManager';
import { FriendChat } from '../components/social/FriendChat';
import { Input } from '../components/common/Input';
import { useToast } from '../hooks/use-toast';
import { UserProfile } from '../services/AuthService';
import { SafeImage } from '../components/ui/SafeImage';
import debounce from 'lodash.debounce';

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

interface UnreadCounts {
  [friendId: string]: number;
}

interface Post {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  content: string;
  parentId: string | null;
  timePosted: string;
  attachment: {
    included: boolean;
    type: string;
    content: string;
  };
  likes: {
    users: string[];
    count: number;
  };
  __v: number;
}

interface ExtendedUserProfile extends UserProfile {
  _id: string;
}

const safeGet = (obj: any, path: string, fallback: any = undefined) => {
  try {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? fallback;
  } catch (e) {
    return fallback;
  }
};

// Create a stable input component that doesn't cause re-renders
const StableInput = React.memo(({ value, onChange, placeholder, className }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [internalValue, setInternalValue] = useState(value);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Create a stable debounced callback
  const debouncedOnChange = useCallback(
    debounce((newValue: string) => {
      onChange(newValue);
    }, 300),
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <input
      type="text"
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 ${className || ''}`}
    />
  );
});

export const Social: React.FC = () => {
  const { state } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'friends'>('feed');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Debug function to check auth status
  const debugAuth = () => {
    console.log('Auth status:', {
      isAuthenticated,
      user,
      token: localStorage.getItem('token'),
      headers: api.defaults.headers
    });

    // Test API connection
    api.get('/api/auth/me')
      .then(res => console.log('Auth check response:', res.data))
      .catch(err => console.error('Auth check error:', err));
  };

  // Toast notifications
  const { toast } = useToast();

  // Friends state
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendId, setNewFriendId] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [showFriendDetails, setShowFriendDetails] = useState(false);
  const [friendDetailLoading, setFriendDetailLoading] = useState(false);

  // Feed state
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [feedIsLoading, setFeedIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPublic: true,
    maxMembers: 10,
  });

  const [activeChatFriend, setActiveChatFriend] = useState<FriendProfile | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});

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

  const PostCard: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
    // Add safer null checking for user and post data
    const userId = user ? (user as unknown as ExtendedUserProfile)._id : null;
    const isLiked = userId && post.likes?.users ? post.likes.users.includes(userId) : false;
    const isOwnPost = userId && post.userId?._id ? post.userId._id === userId : false;
    const isComment = post.parentId !== null;

    // Calculate the formatted time
    const formatTimePosted = (timeString: string) => {
      const postedDate = new Date(timeString);
      const now = new Date();
      const diffInHours = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
      return postedDate.toLocaleDateString();
    };

    // If post data is invalid, don't render anything
    if (!post) {
      return null;
    }

    // Handle posts that don't have populated userId (just the ObjectId)
    const userName = post.userId && typeof post.userId === 'object' ?
      `${post.userId.firstName || 'Unknown'} ${post.userId.lastName || ''}` :
      'Unknown User';

    const profilePic = post.userId && typeof post.userId === 'object' ?
      post.userId.profilePicture : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`${isComment ? 'ml-8' : ''}`}
      >
        <Card variant="glass" className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
              {profilePic ? (
                <SafeImage src={profilePic} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    {userName}
                  </span>
                  <span className="text-xs text-white/40">{formatTimePosted(post.timePosted)}</span>
                </div>

                {isOwnPost && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-1 text-white/60 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePost(post._id)}
                      className="p-1 text-white/60 hover:text-error-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-white/80 mb-4">{post.content}</p>

              {post.attachment?.included && post.attachment.type === 'image' && post.attachment.content && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <SafeImage src={`http://localhost:5001/api/feed/attachment/${post.attachment.content}`} alt="Post attachment" className="w-full h-auto max-h-96 object-contain" />
                </div>
              )}

              <div className="flex items-center gap-6">
                <button
                  onClick={() => isLiked ? unlikePost(post._id) : likePost(post._id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-error-400' : 'text-white/60 hover:text-error-400'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {post.likes?.count || 0}
                </button>

                <button
                  onClick={() => {
                    if (!isComment) {
                      setShowCommentInput(prevId => prevId === post._id ? null : post._id);
                      // Load comments when comment button is clicked
                      if (showCommentInput !== post._id) {
                        fetchComments(post._id);
                      }
                    }
                  }}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Comment
                </button>

                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {showCommentInput === post._id && (
                <div className="mt-4 flex gap-2">
                  <Input
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1"
                  />
                  <Button onClick={() => createComment(post._id)} className="flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
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
              <span className={`px-2 py-1 rounded text-xs ${group.isPublic ? 'bg-success-500/20 text-success-400' : 'bg-warning-500/20 text-warning-400'
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
                <div className={`w-2 h-2 rounded-full ${group.currentSession.type === 'focus' ? 'bg-primary-400' : 'bg-success-400'
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

  const handleOpenChat = (friend: FriendProfile) => {
    setActiveChatFriend(null);
    setTimeout(() => setActiveChatFriend(friend), 0);
    if (unreadCounts[friend._id]) {
      setUnreadCounts(prev => ({ ...prev, [friend._id]: 0 }));
    }
  };

  const handleCloseChat = (friendId: string) => {
    if (activeChatFriend && activeChatFriend._id === friendId) {
      setActiveChatFriend(null);
    }
  };

  const fetchFriends = async () => {
    try {
      const friendsList = await FriendsService.getFriendList();
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends list:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const requests = await FriendsService.getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  const fetchUnreadCounts = async () => {
    // Disabled to prevent typing issues
    return;
  };

  const fetchAllData = async () => {
    // No API calls to prevent typing issues
    setIsLoading(false);
  };

  useEffect(() => {
    // Only load data once on component mount, with no polling
    console.log('Social component mounted, fetching posts...');
    fetchPosts();

    // Debug auth status on mount
    debugAuth();
  }, []);

  const sendFriendRequest = async () => {
    try {
      await FriendsService.sendFriendRequest(newFriendId);
      setNewFriendId('');
      setShowAddFriend(false);
      // Show success message
    } catch (error) {
      console.error('Failed to send friend request:', error);
      // Show error message
    }
  };

  const acceptFriendRequest = async (friendId: string) => {
    try {
      console.log('Accepting friend request with friendId:', friendId);
      await FriendsService.acceptFriendRequest(friendId);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const declineFriendRequest = async (friendId: string) => {
    try {
      console.log('Declining friend request with friendId:', friendId);
      await FriendsService.declineFriendRequest(friendId);
      fetchFriendRequests();
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
  };

  const unfriendUser = async (friendId: string) => {
    try {
      await FriendsService.unfriend(friendId);
      fetchFriends();
    } catch (error) {
      console.error('Failed to unfriend user:', error);
    }
  };

  const viewFriendDetails = async (friendId: string) => {
    try {
      setFriendDetailLoading(true);
      const friendData = await FriendsService.getFriendDetails(friendId);

      if (friendData) {
        setSelectedFriend(friendData);
        setShowFriendDetails(true);
      } else {
        console.error('Friend data not found or failed to fetch.');
      }
    } catch (error) {
      console.error('Failed to fetch friend details:', error);
    } finally {
      setFriendDetailLoading(false);
    }
  };

  // Friend Card component
  const FriendCard: React.FC<{ friend: FriendProfile, index: number }> = ({ friend, index }) => {
    const unreadCount = unreadCounts[friend._id] || 0;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
        <div className="
          rounded-2xl p-6 transition-all duration-300 relative overflow-hidden
          bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg
          p-4
        ">
          <div style={{ transform: "translateZ(20px)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
                  {friend.profilePicture ?
                    <SafeImage src={friend.profilePicture} alt={friend.firstName} className="w-full h-full object-cover rounded-full" /> :
                    <User className="w-6 h-6 text-white" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold text-white">{friend.firstName} {friend.lastName}</h3>
                  <p className="text-xs text-white/60">{safeGet(friend, 'email')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenChat(friend)}
                  className="
                    inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                    bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 px-6 py-3 text-base text-primary-400 hover:bg-primary-500/20 relative
                  "
                >
                  <MessageCircle size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => unfriendUser(friend._id)}
                  className="
                    inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                    bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 px-6 py-3 text-base text-error-400 hover:bg-error-500/20
                  "
                >
                  <UserMinus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Friend Request Card component
  const FriendRequestCard: React.FC<{ request: FriendRequest; index: number }> = ({ request, index }) => {
    // Log the request object to understand its structure
    console.log('Rendering friend request card with data:', request);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card variant="solid" className="p-4 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
                {request.sender?.profilePicture ? (
                  <SafeImage src={request.sender.profilePicture} alt={`${request.sender.firstName} ${request.sender.lastName}`} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-white">{request.sender.firstName} {request.sender.lastName}</h3>
                {request.sender.level && <p className="text-xs text-white/60">Level {request.sender.level} | XP {request.sender.xp}</p>}
                {request.sender.bio && <p className="text-sm text-white/60 line-clamp-1">{request.sender.bio}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" icon={Check} onClick={() => acceptFriendRequest(request.sender._id)} />
              <Button variant="ghost" size="sm" icon={X} onClick={() => declineFriendRequest(request.sender._id)} className="text-error-400 hover:bg-error-500/20" />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const FriendDetailsModal: React.FC<{
    friend: FriendProfile | null;
    isOpen: boolean;
    onClose: () => void;
  }> = ({ friend, isOpen, onClose }) => {
    if (!friend) return null;

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`${friend.firstName} ${friend.lastName}'s Profile`}>
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-3xl">
            {friend.profilePicture ? (
              <SafeImage src={friend.profilePicture} alt={friend.firstName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>

          <h2 className="text-xl font-bold text-white">{friend.firstName} {friend.lastName}</h2>
          <p className="text-white/60">{friend.email}</p>

          <div className="w-full mt-4">
            <Button variant="primary" fullWidth>Send Message</Button>
          </div>
        </div>
      </Modal>
    );
  };

  // Feed functions
  const fetchPosts = async (parentId: string | null = null) => {
    try {
      console.log('Fetching posts with parentId:', parentId);
      setFeedIsLoading(true);
      const response = await api.get(`/api/feed/get`, {
        params: {
          parentId: parentId || null,
          page: 0,
          limit: 50
        }
      });

      console.log('API response:', response.data);

      if (response.data && response.data.posts) {
        console.log('Setting posts:', response.data.posts);

        // Check if userId is populated correctly
        response.data.posts.forEach((post: Post, index: number) => {
          console.log(`Post ${index} userId:`, post.userId);
        });

        setPosts(response.data.posts);
      } else {
        console.log('No posts found in response');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setFeedIsLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const formData = new FormData();
      formData.append('content', newPostContent);

      if (selectedParentId) {
        formData.append('parentId', selectedParentId);
      }

      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('attachExists', 'true');
        formData.append('attachType', 'image');
      } else {
        formData.append('attachExists', 'false');
      }

      const response = await api.post('/api/feed/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clear the form
      setNewPostContent('');
      setSelectedFile(null);

      // Refresh posts
      fetchPosts();

      toast({
        title: "Success",
        description: "Your post has been published!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    }
  };

  const createComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    try {
      const formData = new FormData();
      formData.append('content', commentContent);
      formData.append('parentId', postId);

      // Use full path with /api prefix to ensure correct endpoint
      const response = await api.post('/api/feed/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCommentContent('');
      setShowCommentInput(null);

      if (response.data && response.data.post) {
        // Add the new comment to the posts array
        setPosts([...posts, response.data.post]);
      } else {
        // Fallback to fetching comments if response doesn't include the new comment
        fetchComments(postId);
      }

      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await api.get(`/api/feed/get`, {
        params: {
          parentId: postId,
          page: 0,
          limit: 50
        }
      });
      // Update the state with these comments
      // This is a simplified approach - in a production app you might
      // want to maintain a nested structure for posts and their comments
      const newPosts = [...posts];
      const updatedPosts = newPosts.concat(response.data.posts);
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const likePost = async (postId: string) => {
    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to like posts",
          variant: "destructive",
        });
        return;
      }

      // Fixed: Use PUT instead of POST as required by the API route
      await api.put('/feed/like', { postId });

      // Get the user ID safely
      const userId = (user as unknown as ExtendedUserProfile)._id;

      // Update local state to reflect the like
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: {
              users: [...post.likes.users, userId],
              count: post.likes.count + 1
            }
          };
        }
        return post;
      }));

    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive',
      });
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to unlike posts",
          variant: "destructive",
        });
        return;
      }

      // Fixed: Use PUT instead of POST as required by the API route
      await api.put('/feed/unlike', { postId });

      // Get the user ID safely
      const userId = (user as unknown as ExtendedUserProfile)._id;

      // Update local state to reflect the unlike
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: {
              users: post.likes.users.filter(id => id !== userId),
              count: post.likes.count - 1
            }
          };
        }
        return post;
      }));

    } catch (error) {
      console.error('Error unliking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlike post',
        variant: 'destructive',
      });
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post._id);
    setEditingPostContent(post.content);
    setShowEditModal(true);
  };

  const saveEditedPost = async () => {
    if (!editingPostId || !editingPostContent.trim()) return;

    try {
      await api.post('/api/feed/edit', {
        postId: editingPostId,
        content: editingPostContent
      });

      // Update local state
      setPosts(posts.map(post => {
        if (post._id === editingPostId) {
          return {
            ...post,
            content: editingPostContent
          };
        }
        return post;
      }));

      setShowEditModal(false);
      setEditingPostId(null);
      setEditingPostContent('');

      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });
    } catch (error) {
      console.error('Error editing post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await api.delete(`/api/feed/${postId}`);

      // Remove the post from local state
      setPosts(posts.filter(post => post._id !== postId));

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Add the CreatePost component
  const CreatePostCard: React.FC = () => (
    <Card variant="glass" className="p-6 mb-6">
      <form onSubmit={createPost}>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
            {user?.profilePicture ? (
              <SafeImage src={user.profilePicture} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <StableInput
              value={newPostContent}
              onChange={setNewPostContent}
              placeholder="What's on your mind?"
              className="w-full mb-3"
            />

            {selectedFile && (
              <div className="mb-3 p-2 bg-white/10 rounded flex justify-between items-center">
                <span className="text-sm text-white/70 truncate max-w-[80%]">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleFileSelect}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Image className="w-4 h-4" />
                <span>Add Photo</span>
              </button>

              <Button type="submit" disabled={!newPostContent.trim()}>
                Post
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </form>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 text-white">
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

        <div className="flex gap-2">
          <a href="/chat-test">
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Test
            </Button>
          </a>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={debugAuth}
          >
            Debug Auth
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fetchPosts()}
          >
            Refresh Posts
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={async () => {
              try {
                const response = await api.post('/api/feed/post', {
                  content: 'This is a test post created from the UI',
                  attachExists: 'false'
                });
                console.log('Test post created:', response.data);
                fetchPosts();
              } catch (error) {
                console.error('Error creating test post:', error);
              }
            }}
          >
            Create Test Post
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
          variant={activeTab === 'friends' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('friends')}
        >
          Friends
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
              <CreatePostCard />

              {feedIsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
              ) : posts.length > 0 ? (
                <div>
                  {posts
                    .filter(post => post.parentId === null)
                    .map((post, index) => (
                      <React.Fragment key={post._id}>
                        <PostCard post={post} index={index} />
                        {/* Display comments for this post */}
                        {posts
                          .filter(comment => comment.parentId === post._id)
                          .map((comment, commentIndex) => (
                            <PostCard key={comment._id} post={comment} index={commentIndex} />
                          ))}
                      </React.Fragment>
                    ))}
                </div>
              ) : (
                <Card variant="glass" className="p-8 text-center">
                  <p className="text-white/60">No posts yet. Be the first to post!</p>
                </Card>
              )}
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${user.rank <= 3 ? 'bg-warning-500 text-white' : 'bg-white/10 text-white/60'
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

        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Friend List */}
            <div className="lg:col-span-2 space-y-4">
              <Card variant="glass" className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Your Friends</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <StableInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search friends..."
                    className="w-full pl-10"
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-white/60">Loading...</p>
                  </div>
                ) : friends.length > 0 ? (
                  <div className="space-y-3">
                    {friends
                      .filter(friend =>
                        `${friend.firstName} ${friend.lastName}`
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((friend, index) => (
                        <FriendCard key={friend._id} friend={friend} index={index} />
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-2" />
                    <p className="text-white/60">No friends yet</p>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={UserPlus}
                      onClick={() => setShowAddFriend(true)}
                      className="mt-4"
                    >
                      Add Friend
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Friend Requests */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Friend Requests</h3>
                  {friendRequests.length > 0 && (
                    <div className="bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {friendRequests.length}
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-white/60">Loading...</p>
                  </div>
                ) : friendRequests.length > 0 ? (
                  <div className="space-y-3">
                    {friendRequests.map((request, index) => (
                      <FriendRequestCard key={request.sender._id} request={request} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Mail className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/60">No pending requests</p>
                  </div>
                )}
              </Card>

              {/* Friend Stats */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Friend Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Friends</span>
                    <span className="text-white font-semibold">{friends.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Recent Activity</span>
                    <span className="text-white font-semibold">5 sessions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Study Buddies</span>
                    <span className="text-white font-semibold">2 active</span>
                  </div>
                </div>
              </Card>
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
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${user.name === 'You' ? 'bg-primary-500/20 border border-primary-500/30' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.rank <= 3 ? 'bg-warning-500 text-white' : 'bg-white/10 text-white/60'
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

      {/* Add Friend Modal */}
      <Modal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        title="Add Friend"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Friend ID</label>
            <div className="relative">
              <input
                type="text"
                value={newFriendId}
                onChange={(e) => setNewFriendId(e.target.value)}
                placeholder="Enter friend's ID"
                className="input-field w-full"
                autoFocus
              />
            </div>
            {user && (
              <div className="mt-4 p-3 glass rounded-lg">
                <p className="text-white/60 text-sm mb-2">Your User ID:</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">{user.id}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(user.id)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={sendFriendRequest}
              fullWidth
              disabled={!newFriendId.trim()}
            >
              Send Request
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAddFriend(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

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

      {/* Friend Detail Modal */}
      <FriendDetailsModal
        friend={selectedFriend}
        isOpen={showFriendDetails}
        onClose={() => setShowFriendDetails(false)}
      />

      {/* Chat Manager */}
      <SimpleChatManager
        activeFriend={activeChatFriend}
        onClose={handleCloseChat}
      />

      {/* Edit Post Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Post"
      >
        <div className="p-4">
          <Input
            value={editingPostContent}
            onChange={(e) => setEditingPostContent(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedPost}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};