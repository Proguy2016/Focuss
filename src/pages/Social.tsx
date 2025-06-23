import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Crown, Trophy, Target, Zap,
  MessageCircle, Heart, Share2, MoreHorizontal, Settings,
  Calendar, Clock, TrendingUp, Award, Star, UserPlus, UserX, Mail,
  Check, X, UserCheck, User, UserMinus, Edit, Trash2, Send
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import FriendsService, { FriendProfile, FriendRequest } from '../services/FriendsService';
import FeedService, { Post as ApiPost } from '../services/FeedService';
import api from '../services/api';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'leaderboard' | 'friends'>('feed');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Friends state
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [showFriendDetails, setShowFriendDetails] = useState(false);
  const [friendDetailLoading, setFriendDetailLoading] = useState(false);

  // Feed state
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPost, setEditingPost] = useState<ApiPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, ApiPost[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [commentPages, setCommentPages] = useState<Record<string, number>>({});
  const [hasMoreComments, setHasMoreComments] = useState<Record<string, boolean>>({});

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPublic: true,
    maxMembers: 10,
  });

  // Feed API functions
  useEffect(() => {
    if (activeTab === 'feed') {
      fetchPosts();
    }
  }, [activeTab, currentPage]);

  const fetchPosts = async () => {
    try {
      setFeedLoading(true);
      const response = await FeedService.getPosts(currentPage, limit);

      if (response && response.posts) {
        if (currentPage === 0) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }

        // Check if we have more posts to load
        setHasMore(response.posts.length === limit);
      }
    } catch (err: any) {
      setFeedError(err.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setFeedLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) return;

    try {
      await FeedService.createPost(newPostContent);
      setNewPostContent('');
      // Refresh posts after creating a new one
      setCurrentPage(0);
      fetchPosts();
    } catch (err: any) {
      setFeedError(err.message || 'Failed to create post');
      console.error('Error creating post:', err);
    }
  };

  const updatePost = async () => {
    if (!editingPost || !editContent.trim()) return;

    try {
      await FeedService.editPost(editingPost._id, editContent);

      // Update local state
      setPosts(posts.map(post =>
        post._id === editingPost._id
          ? { ...post, content: editContent }
          : post
      ));

      setShowEditModal(false);
      setEditingPost(null);
      setEditContent('');
    } catch (err: any) {
      setFeedError(err.message || 'Failed to update post');
      console.error('Error updating post:', err);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await FeedService.deletePost(postId);
      // Remove post from local state
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err: any) {
      setFeedError(err.message || 'Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  const likePost = async (postId: string) => {
    try {
      await FeedService.likePost(postId);

      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isAlreadyLiked = post.likes.users.includes(user?._id || '');

          if (!isAlreadyLiked) {
            return {
              ...post,
              likes: {
                users: [...post.likes.users, user?._id || ''],
                count: post.likes.count + 1
              }
            };
          }
        }
        return post;
      }));
    } catch (err: any) {
      setFeedError(err.message || 'Failed to like post');
      console.error('Error liking post:', err);
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      await FeedService.unlikePost(postId);

      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.users.includes(user?._id || '');

          if (isLiked) {
            return {
              ...post,
              likes: {
                users: post.likes.users.filter(id => id !== user?._id),
                count: Math.max(0, post.likes.count - 1)
              }
            };
          }
        }
        return post;
      }));
    } catch (err: any) {
      setFeedError(err.message || 'Failed to unlike post');
      console.error('Error unliking post:', err);
    }
  };

  const handleEditClick = (post: ApiPost) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const loadMorePosts = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Comment functions
  const toggleComments = async (postId: string) => {
    const isExpanded = expandedComments[postId] || false;

    setExpandedComments({
      ...expandedComments,
      [postId]: !isExpanded
    });

    if (!isExpanded && !comments[postId]) {
      await fetchComments(postId);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments({ ...loadingComments, [postId]: true });

      const page = commentPages[postId] || 0;
      const response = await FeedService.getComments(postId, page, 5);

      if (response && response.posts) {
        if (page === 0) {
          setComments({
            ...comments,
            [postId]: response.posts
          });
        } else {
          setComments({
            ...comments,
            [postId]: [...(comments[postId] || []), ...response.posts]
          });
        }

        setHasMoreComments({
          ...hasMoreComments,
          [postId]: response.posts.length === 5
        });
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments({ ...loadingComments, [postId]: false });
    }
  };

  const loadMoreComments = async (postId: string) => {
    const nextPage = (commentPages[postId] || 0) + 1;
    setCommentPages({ ...commentPages, [postId]: nextPage });
    await fetchComments(postId);
  };

  const addComment = async (postId: string) => {
    const content = commentContents[postId];
    if (!content || !content.trim()) return;

    try {
      await FeedService.createPost(content, undefined, postId);

      // Clear input and refresh comments
      setCommentContents({ ...commentContents, [postId]: '' });

      // Reset comments page and fetch again
      setCommentPages({ ...commentPages, [postId]: 0 });
      await fetchComments(postId);
    } catch (err: any) {
      console.error('Error adding comment:', err);
    }
  };

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

  const formatTimestamp = (date: Date | string) => {
    const now = new Date();
    const postDate = typeof date === 'string' ? new Date(date) : date;
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return postDate.toLocaleDateString();
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

  const CommentItem: React.FC<{ comment: ApiPost; index: number }> = ({ comment, index }) => {
    const isOwnComment = comment.userId._id === user?._id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="pl-12 mb-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500/80 to-secondary-500/80 flex items-center justify-center text-sm">
            {comment.userId.profilePicture ? (
              <img
                src={comment.userId.profilePicture}
                alt={`${comment.userId.firstName} ${comment.userId.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{comment.userId.firstName.charAt(0)}{comment.userId.lastName.charAt(0)}</span>
            )}
          </div>

          <div className="flex-1 bg-dark/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white text-sm">
                {comment.userId.firstName} {comment.userId.lastName}
              </span>
              <span className="text-xs text-white/40">{formatTimestamp(comment.timePosted)}</span>
            </div>

            <p className="text-white/80 text-sm">{comment.content}</p>
          </div>

          {isOwnComment && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => deletePost(comment._id)}
              className="!p-1 h-auto"
            />
          )}
        </div>
      </motion.div>
    );
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
                  className={`flex items-center gap-2 text-sm transition-colors ${post.isLiked ? 'text-error-400' : 'text-white/60 hover:text-error-400'
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

  // Component for API posts
  const ApiPostCard: React.FC<{ post: ApiPost; index: number }> = ({ post, index }) => {
    const isOwnPost = post.userId._id === user?._id;
    const isLiked = post.likes.users.includes(user?._id || '');
    const isCommentsExpanded = expandedComments[post._id] || false;
    const postComments = comments[post._id] || [];
    const isLoadingComments = loadingComments[post._id] || false;
    const hasMoreCommentsToLoad = hasMoreComments[post._id] || false;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card variant="glass" className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
              {post.userId.profilePicture ? (
                <img
                  src={post.userId.profilePicture}
                  alt={`${post.userId.firstName} ${post.userId.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{post.userId.firstName.charAt(0)}{post.userId.lastName.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-white">
                  {post.userId.firstName} {post.userId.lastName}
                </span>
                <span className="text-xs text-white/40">{formatTimestamp(post.timePosted)}</span>
              </div>

              <p className="text-white/80 mb-4">{post.content}</p>

              {post.attachment && post.attachment.included && (
                <div className="mb-4">
                  {post.attachment.type === 'image' && (
                    <img
                      src={post.attachment.content}
                      alt="Post attachment"
                      className="max-w-full rounded-lg"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center gap-6">
                <button
                  onClick={() => isLiked ? unlikePost(post._id) : likePost(post._id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-error-400' : 'text-white/60 hover:text-error-400'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {post.likes.count}
                </button>

                <button
                  onClick={() => toggleComments(post._id)}
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

              {/* Comments section */}
              {isCommentsExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {/* Comment input */}
                  <div className="flex gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500/80 to-secondary-500/80 flex items-center justify-center text-sm">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user?.firstName} ${user?.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentContents[post._id] || ''}
                        onChange={(e) => setCommentContents({
                          ...commentContents,
                          [post._id]: e.target.value
                        })}
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addComment(post._id);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addComment(post._id)}
                        icon={Send}
                      />
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-3">
                    {isLoadingComments && postComments.length === 0 ? (
                      <div className="text-center py-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-sm text-white/60">Loading comments...</p>
                      </div>
                    ) : postComments.length === 0 ? (
                      <p className="text-center text-sm text-white/60 py-2">No comments yet. Be the first to comment!</p>
                    ) : (
                      <>
                        {postComments.map((comment, idx) => (
                          <CommentItem key={comment._id} comment={comment} index={idx} />
                        ))}

                        {hasMoreCommentsToLoad && (
                          <div className="text-center pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadMoreComments(post._id)}
                              disabled={isLoadingComments}
                              className="text-sm"
                            >
                              {isLoadingComments ? 'Loading...' : 'Load more comments'}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isOwnPost && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit}
                  onClick={() => handleEditClick(post)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => deletePost(post._id)}
                />
              </div>
            )}
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

  // Fetch friends data
  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [activeTab]);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const friendsList = await FriendsService.getFriendList();
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/friends/requests');
      const requests = response.data.friendRequests || [];

      // Fetch details for each friend request
      const populatedRequests = await Promise.all(
        requests.map(async (req: { friendId: string }) => {
          try {
            // Get friend info using the friendId
            const friendResponse = await api.get(`/api/friends/info/${req.friendId}`);
            const friendData = friendResponse.data;

            // Create a sender object with the friend data
            return {
              ...req,
              sender: {
                _id: req.friendId,
                firstName: friendData.friendFirstName,
                lastName: friendData.friendLastName,
                profilePicture: friendData.friendPfp,
                bio: friendData.friendBio
              }
            };
          } catch (error) {
            console.error(`Failed to fetch info for sender ${req.friendId}`, error);
            return req; // Return original request if sender info fails
          }
        })
      );

      setFriendRequests(populatedRequests);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      await FriendsService.sendFriendRequest(newFriendEmail);
      setNewFriendEmail('');
      setShowAddFriend(false);
      // Show success message
    } catch (error) {
      console.error('Failed to send friend request:', error);
      // Show error message
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await FriendsService.acceptFriendRequest(requestId);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await FriendsService.declineFriendRequest(requestId);
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
      const response = await api.get(`/api/friends/info/${friendId}`);
      const friendData = response.data;

      setSelectedFriend({
        _id: friendId,
        firstName: friendData.friendFirstName,
        lastName: friendData.friendLastName,
        profilePicture: friendData.friendPfp,
        bio: friendData.friendBio,
        email: '' // Backend doesn't return email for privacy reasons
      });

      setShowFriendDetails(true);
    } catch (error) {
      console.error('Failed to fetch friend details:', error);
    } finally {
      setFriendDetailLoading(false);
    }
  };

  // Friend Card component
  const FriendCard: React.FC<{ friend: FriendProfile; index: number }> = ({ friend, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => viewFriendDetails(friend._id)}
      className="cursor-pointer"
    >
      <Card variant="solid" className="p-4 bg-white/5 hover:bg-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
              {friend.profilePicture ? (
                <img
                  src={friend.profilePicture}
                  alt={`${friend.firstName} ${friend.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">{friend.firstName} {friend.lastName}</h3>
              {friend.level && <p className="text-xs text-white/60">Level {friend.level}</p>}
              {friend.bio && <p className="text-sm text-white/60 line-clamp-1">{friend.bio}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={MessageCircle} onClick={(e) => e.stopPropagation()} />
            <Button
              variant="ghost"
              size="sm"
              icon={UserMinus}
              onClick={(e) => {
                e.stopPropagation();
                unfriendUser(friend._id);
              }}
              className="text-error-400 hover:bg-error-500/20"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // Friend Request Card component
  const FriendRequestCard: React.FC<{ request: FriendRequest; index: number }> = ({ request, index }) => (
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
                <img
                  src={request.sender.profilePicture}
                  alt={`${request.sender.firstName} ${request.sender.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>

            <div className="flex-1">
              {request.sender ? (
                <h3 className="font-semibold text-white">{request.sender.firstName} {request.sender.lastName}</h3>
              ) : (
                <h3 className="font-semibold text-white italic">Loading...</h3>
              )}
              <p className="text-xs text-white/60">Sent you a friend request</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Check}
              onClick={() => acceptFriendRequest(request.friendId)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => declineFriendRequest(request.friendId)}
              className="text-error-400 hover:bg-error-500/20"
            />
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
          {activeTab === 'friends' ? (
            <Button
              variant="secondary"
              icon={UserPlus}
              onClick={() => setShowAddFriend(true)}
            >
              Add Friend
            </Button>
          ) : (
            <>
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
            </>
          )}
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
              {/* Create Post */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center text-xl">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                    )}
                  </div>
                  <Input
                    type="text"
                    placeholder="Share your progress..."
                    className="flex-1"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        createPost();
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={createPost}
                  >
                    Post
                  </Button>
                </div>
              </Card>

              {/* Posts */}
              <div className="space-y-4">
                {feedLoading && posts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-white/60">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <Card variant="glass" className="p-6 text-center">
                    <p className="text-white/60">No posts yet. Be the first to post!</p>
                  </Card>
                ) : (
                  <>
                    {posts.map((post, index) => (
                      <ApiPostCard key={post._id} post={post} index={index} />
                    ))}

                    {hasMore && (
                      <div className="text-center py-4">
                        <Button
                          variant="outline"
                          onClick={loadMorePosts}
                          disabled={feedLoading}
                        >
                          {feedLoading ? 'Loading...' : 'Load More'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
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
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field w-full pl-10"
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
                      <FriendRequestCard key={request.friendId} request={request} index={index} />
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
                value={newFriendEmail}
                onChange={(e) => setNewFriendEmail(e.target.value)}
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
              disabled={!newFriendEmail.trim()}
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

      {/* Friend Details Modal */}
      <Modal
        isOpen={showFriendDetails}
        onClose={() => setShowFriendDetails(false)}
        title="Friend Profile"
        size="md"
      >
        {friendDetailLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : selectedFriend ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-4xl mb-4">
                {selectedFriend.profilePicture ? (
                  <img
                    src={selectedFriend.profilePicture}
                    alt={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-white">{selectedFriend.firstName} {selectedFriend.lastName}</h2>
              {selectedFriend.level && (
                <p className="text-sm text-white/60">Level {selectedFriend.level}</p>
              )}
            </div>

            <div className="glass p-4 rounded-lg">
              <h3 className="text-white/80 text-sm mb-2">Bio</h3>
              <p className="text-white/60">
                {selectedFriend.bio || "No bio available."}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                icon={MessageCircle}
                fullWidth
              >
                Message
              </Button>
              <Button
                variant="danger"
                icon={UserMinus}
                onClick={() => {
                  unfriendUser(selectedFriend._id);
                  setShowFriendDetails(false);
                }}
                fullWidth
              >
                Unfriend
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60">Friend information not available.</p>
          </div>
        )}
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
          setEditContent('');
        }}
        title="Edit Post"
      >
        <Input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="mb-4 w-full"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false);
              setEditingPost(null);
              setEditContent('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={updatePost}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};