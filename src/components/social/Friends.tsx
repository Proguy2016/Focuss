import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, UserX, Search, MoreHorizontal, User, Check, X, Clock, AlertCircle, Mail, Award, Zap, Calendar, Target, Trophy } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import FriendService, { Friend, FriendRequest } from '../../services/FriendService';
import { useAuth } from '../../contexts/AuthContext';

export const Friends: React.FC = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [friendId, setFriendId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const [profileLoading, setProfileLoading] = useState(false);

    const fetchFriendsData = async () => {
        try {
            setLoading(true);
            // Fetch friends list
            try {
                const response = await FriendService.getFriends();
                const friendsData = response?.friends || [];
                setFriends(Array.isArray(friendsData) ? friendsData : []);
            } catch (error) {
                console.error('Error fetching friends:', error);
                setFriends([]);
            }

            // Fetch friend requests
            try {
                const response = await FriendService.getFriendRequests();
                const requestsData = response?.friendRequests || [];
                setFriendRequests(Array.isArray(requestsData) ? requestsData : []);
            } catch (error) {
                console.error('Error fetching friend requests:', error);
                setFriendRequests([]);
            }
        } catch (error) {
            console.error('Error fetching friends data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendsData();
    }, []);

    const handleSendRequest = async () => {
        try {
            setError(null);
            setSuccess(null);
            setIsSubmitting(true);

            if (!friendId.trim()) {
                setError('Please enter a valid user ID');
                setIsSubmitting(false);
                return;
            }

            const response = await FriendService.sendFriendRequest(friendId);
            setSuccess(`Friend request sent successfully to ${response.friendFirstName} ${response.friendLastName}!`);
            setFriendId('');
            setTimeout(() => {
                setShowAddFriendModal(false);
                setSuccess(null);
            }, 2000);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to send friend request. Please try again.';
            setError(errorMessage);
            console.error('Error sending friend request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcceptRequest = async (friendId: string) => {
        try {
            await FriendService.acceptFriendRequest(friendId);
            // Refresh the friends list after accepting
            fetchFriendsData();
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleDeclineRequest = async (friendId: string) => {
        try {
            await FriendService.declineFriendRequest(friendId);
            // Update the UI
            setFriendRequests(friendRequests.filter(req => req.friendId !== friendId));
        } catch (error) {
            console.error('Error declining friend request:', error);
        }
    };

    const handleUnfriend = async (friendId: string) => {
        try {
            await FriendService.unfriend(friendId);
            // Update the UI
            setFriends(friends.filter(friend => friend._id !== friendId));
            // Close profile modal if open
            if (selectedFriend && selectedFriend._id === friendId) {
                setShowProfileModal(false);
                setSelectedFriend(null);
            }
        } catch (error) {
            console.error('Error unfriending user:', error);
        }
    };

    const handleViewProfile = async (friend: Friend) => {
        // First set the basic info we already have
        setSelectedFriend(friend);
        setShowProfileModal(true);
        setProfileLoading(true);

        // Then fetch more detailed friend info
        try {
            console.log("Fetching detailed info for friend:", friend._id);
            const friendInfo = await FriendService.getFriendInfo(friend._id);
            console.log("Detailed friend info received:", friendInfo);

            if (friendInfo) {
                // Create a new object with all properties to avoid state update issues
                const updatedFriend = {
                    ...friend,
                    ...friendInfo,
                    // Ensure these fields are present with fallback values
                    level: friendInfo.level || 1,
                    xp: friendInfo.xp || 0,
                    streak: friendInfo.streak || 0,
                    focusHours: friendInfo.focusHours || 0,
                    bio: friendInfo.bio || ''
                };

                console.log("Updated friend profile:", updatedFriend);
                setSelectedFriend(updatedFriend);
            }
        } catch (error) {
            console.error('Error fetching friend details:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    // Ensure friends is always an array before filtering
    const filteredFriends = Array.isArray(friends) ? friends.filter(friend =>
        `${friend.firstName} ${friend.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Count pending friend requests
    const pendingRequestsCount = Array.isArray(friendRequests) ? friendRequests.length : 0;

    return (
        <motion.div
            key="friends"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* Header with search and add friend button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search friends..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <Button
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => setShowAddFriendModal(true)}
                >
                    Add Friend
                </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 glass p-1 rounded-xl w-fit">
                <Button
                    variant={activeTab === 'friends' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('friends')}
                >
                    Friends
                </Button>
                <Button
                    variant={activeTab === 'requests' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('requests')}
                    className="relative"
                >
                    Friend Requests
                    {pendingRequestsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {pendingRequestsCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Content */}
            {activeTab === 'friends' && (
                <Card variant="glass" className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Friends</h3>
                    {loading ? (
                        <div className="text-center py-8 text-white/60">Loading friends...</div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center py-8 text-white/60">
                            {searchTerm ? "No friends match your search" : "You don't have any friends yet. Add some!"}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFriends.map(friend => (
                                <div key={friend._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-lg">
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
                                        <div>
                                            <div className="text-white font-medium">{friend.firstName} {friend.lastName}</div>
                                            <div className="text-white/60 text-sm flex items-center gap-2">
                                                {friend.level && (
                                                    <span className="bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded text-xs">
                                                        Level {friend.level}
                                                    </span>
                                                )}
                                                {friend.streak && (
                                                    <span className="bg-warning-500/20 text-warning-400 px-2 py-0.5 rounded text-xs">
                                                        {friend.streak} day streak
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            icon={UserCheck}
                                            onClick={() => handleViewProfile(friend)}
                                        >
                                            Profile
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            icon={UserX}
                                            onClick={() => handleUnfriend(friend._id)}
                                        >
                                            Unfriend
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'requests' && (
                <Card variant="glass" className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Friend Requests</h3>
                    {loading ? (
                        <div className="text-center py-8 text-white/60">Loading friend requests...</div>
                    ) : friendRequests.length === 0 ? (
                        <div className="text-center py-8 text-white/60 flex flex-col items-center">
                            <AlertCircle className="w-12 h-12 text-white/30 mb-2" />
                            <p>You don't have any friend requests at the moment.</p>
                            <p className="text-sm mt-2">When someone sends you a friend request, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {friendRequests.map(request => (
                                <div key={request.friendId} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-lg">
                                            {request.senderInfo?.profilePicture ? (
                                                <img
                                                    src={request.senderInfo.profilePicture}
                                                    alt={`${request.senderInfo.firstName} ${request.senderInfo.lastName}`}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">
                                                {request.senderInfo ?
                                                    `${request.senderInfo.firstName} ${request.senderInfo.lastName}` :
                                                    'Friend Request'
                                                }
                                            </div>
                                            <div className="text-white/60 text-sm">
                                                {request.senderInfo?.email || `User ID: ${request.friendId}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            icon={Check}
                                            onClick={() => handleAcceptRequest(request.friendId)}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            icon={X}
                                            onClick={() => handleDeclineRequest(request.friendId)}
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Add Friend Modal */}
            <Modal
                isOpen={showAddFriendModal}
                onClose={() => {
                    setShowAddFriendModal(false);
                    setFriendId('');
                    setError(null);
                    setSuccess(null);
                }}
                title="Add Friend"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-white/60">
                        Enter your friend's user ID to send them a friend request.
                        <br />
                        <span className="text-xs">(Users can find their ID in their profile dropdown)</span>
                    </p>

                    <div>
                        <label className="block text-white/60 text-sm mb-2">User ID</label>
                        <input
                            type="text"
                            value={friendId}
                            onChange={(e) => setFriendId(e.target.value)}
                            placeholder="Enter user ID..."
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-error-400 text-sm">{error}</div>
                    )}

                    {success && (
                        <div className="text-success-400 text-sm">{success}</div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="primary"
                            onClick={handleSendRequest}
                            fullWidth
                            disabled={!friendId.trim() || isSubmitting}
                            loading={isSubmitting}
                        >
                            Send Request
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddFriendModal(false);
                                setFriendId('');
                                setError(null);
                                setSuccess(null);
                            }}
                            fullWidth
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Friend Profile Modal */}
            <Modal
                isOpen={showProfileModal && selectedFriend !== null}
                onClose={() => {
                    setShowProfileModal(false);
                    setSelectedFriend(null);
                }}
                title="Friend Profile"
                size="md"
            >
                {selectedFriend && !profileLoading && (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-3xl">
                                {selectedFriend.profilePicture ? (
                                    <img
                                        src={selectedFriend.profilePicture}
                                        alt={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedFriend.firstName} {selectedFriend.lastName}</h3>
                                <div className="flex items-center gap-2 text-white/60">
                                    <Mail className="w-4 h-4" />
                                    <span>{selectedFriend.email}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded text-xs">
                                        Level {selectedFriend.level || 1}
                                    </span>
                                    {(selectedFriend.streak && selectedFriend.streak > 0) && (
                                        <span className="bg-warning-500/20 text-warning-400 px-2 py-0.5 rounded text-xs">
                                            {selectedFriend.streak} day streak
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {selectedFriend.bio && (
                            <div className="glass p-4 rounded-lg">
                                <h4 className="text-white/80 text-sm mb-2">Bio</h4>
                                <p className="text-white/60">{selectedFriend.bio}</p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="glass p-4 rounded-lg">
                            <h4 className="text-white/80 text-sm mb-3">Stats</h4>
                            <pre className="text-xs text-white/40 mb-2">Debug: {JSON.stringify({
                                level: selectedFriend.level,
                                xp: selectedFriend.xp,
                                streak: selectedFriend.streak,
                                focusHours: selectedFriend.focusHours
                            })}</pre>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                        <Trophy className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/60">XP</div>
                                        <div className="text-white font-medium">{selectedFriend.xp !== undefined ? selectedFriend.xp : 0}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-success-500/20 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-success-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/60">Streak</div>
                                        <div className="text-white font-medium">{selectedFriend.streak !== undefined ? selectedFriend.streak : 0} days</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-warning-500/20 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-warning-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/60">Level</div>
                                        <div className="text-white font-medium">{selectedFriend.level !== undefined ? selectedFriend.level : 1}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-accent-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/60">Focus Hours</div>
                                        <div className="text-white font-medium">{selectedFriend.focusHours !== undefined ? selectedFriend.focusHours : 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="danger"
                                size="sm"
                                icon={UserX}
                                onClick={() => {
                                    handleUnfriend(selectedFriend._id);
                                    setShowProfileModal(false);
                                }}
                            >
                                Unfriend
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowProfileModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
                {profileLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
}; 