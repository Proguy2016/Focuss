import api from './api';

export interface FriendProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    level?: number;
    xp?: number;
    achievements: any[];
    posts: any[];
    streak?: number;
    status?: string;
    productivityScore?: number;
    lastActive?: Date;
}

export interface FriendRequest {
    id: string;
    friendId: string;
    sender: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        profilePicture?: string;
    };
    createdAt: Date;
}

class FriendsService {
    async getFriendList(): Promise<FriendProfile[]> {
        try {
            const response = await api.get('/api/friends/list');
            return response.data.friends.map((friend: any) => ({
                _id: friend._id,
                firstName: friend.firstName,
                lastName: friend.lastName,
                email: friend.email,
                profilePicture: friend.profilePicture,
                bio: friend.bio,
                level: friend.level,
                xp: friend.xp,
                achievements: friend.achievements,
                posts: friend.posts,
                streak: friend.streak,
                status: friend.status,
                productivityScore: friend.productivityScore,
                lastActive: friend.lastActive ? new Date(friend.lastActive) : undefined,
            }));
        } catch (error) {
            console.error("Error fetching friends list:", error);
            return [];
        }
    }

    async getFriendRequests(): Promise<FriendRequest[]> {
        try {
            const response = await api.get('/api/friends/requests');

            // Check if response has the expected structure
            if (!response.data || !response.data.requests || !Array.isArray(response.data.requests)) {
                console.warn("Invalid friend requests response format:", response.data);
                return [];
            }

            return response.data.requests.map((req: any) => ({
                id: req.id,
                friendId: req.friendId,
                sender: {
                    _id: req.sender._id,
                    firstName: req.sender.firstName,
                    lastName: req.sender.lastName,
                    email: req.sender.email,
                    profilePicture: req.sender.profilePicture,
                },
                createdAt: new Date(req.createdAt),
            }));
        } catch (error) {
            console.error("Error fetching friend requests:", error);
            return [];
        }
    }

    async getFriendDetails(friendId: string): Promise<FriendProfile | null> {
        try {
            const response = await api.get(`/api/friends/info/${friendId}`);
            const friendData = response.data.friend;
            return {
                _id: friendData._id,
                firstName: friendData.friendFirstName,
                lastName: friendData.friendLastName,
                email: friendData.email,
                profilePicture: friendData.friendPfp,
                bio: friendData.friendBio,
                level: friendData.friendLevel,
                xp: friendData.friendXP,
                achievements: friendData.friendAchievements || [],
                posts: friendData.friendPosts || [],
                streak: friendData.streak,
                status: friendData.status,
                productivityScore: friendData.productivityScore,
                lastActive: friendData.lastActive ? new Date(friendData.lastActive) : undefined,
            };
        } catch (error) {
            console.error("Error fetching friend details:", error);
            return null;
        }
    }

    async sendFriendRequest(friendId: string): Promise<boolean> {
        try {
            await api.put('/api/friends/request', { friendId });
            return true;
        } catch (error) {
            console.error("Error sending friend request:", error);
            throw error;
        }
    }

    async acceptFriendRequest(friendId: string): Promise<boolean> {
        try {
            console.log('Sending accept request with data:', { friendId });
            await api.put('/api/friends/accept', { friendId });
            return true;
        } catch (error) {
            console.error("Error accepting friend request:", error);
            throw error;
        }
    }

    async declineFriendRequest(friendId: string): Promise<boolean> {
        try {
            console.log('Sending decline request with data:', { friendId });
            await api.put('/api/friends/decline', { friendId });
            return true;
        } catch (error) {
            console.error("Error declining friend request:", error);
            throw error;
        }
    }

    async unfriend(friendId: string): Promise<boolean> {
        try {
            await api.put('/api/friends/unfriend', { friendId });
            return true;
        } catch (error) {
            console.error("Error unfriending user:", error);
            throw error;
        }
    }
}

export default new FriendsService(); 