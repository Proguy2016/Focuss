import api from './api';

// Define types for friends data
export interface FriendProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    level?: number;
}

export interface FriendRequest {
    friendId: string;
    date: string;
    sender?: FriendProfile;
}

class FriendsService {
    // Send friend request
    async sendFriendRequest(friendId: string): Promise<any> {
        const response = await api.put('/api/friends/request', { friendId });
        return response.data;
    }

    // Accept friend request
    async acceptFriendRequest(friendId: string): Promise<any> {
        const response = await api.put('/api/friends/accept', { friendId });
        return response.data;
    }

    // Decline friend request
    async declineFriendRequest(friendId: string): Promise<any> {
        const response = await api.put('/api/friends/decline', { friendId });
        return response.data;
    }

    // Remove friend
    async unfriend(friendId: string): Promise<any> {
        const response = await api.put('/api/friends/unfriend', { friendId });
        return response.data;
    }

    // Get friend list
    async getFriendList(): Promise<FriendProfile[]> {
        const response = await api.get('/api/friends/list');
        return response.data.friends || [];
    }

    // Get friend profile
    async getFriendInfo(friendId: string): Promise<FriendProfile> {
        const response = await api.get(`/api/friends/info/${friendId}`);
        return response.data.friend;
    }

    // Get pending friend requests
    async getFriendRequests(): Promise<FriendRequest[]> {
        const response = await api.get('/api/friends/requests');
        return response.data.friendRequests || [];
    }
}

export default new FriendsService(); 