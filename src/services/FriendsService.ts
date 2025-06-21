import api from './api';

export interface FriendProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    level: number;
    streak: number;
    status?: string;
    productivityScore?: number;
    lastActive?: Date;
}

export interface FriendRequest {
    id: string;
    sender: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    createdAt: Date;
}

class FriendsService {
    async getFriendList(): Promise<FriendProfile[]> {
        try {
            const response = await api.get('/api/friends/list');
            return response.data.friends;
        } catch (error) {
            console.error("Error fetching friends list:", error);
            return [];
        }
    }

    async getFriendRequests(): Promise<FriendRequest[]> {
        try {
            const response = await api.get('/api/friends/requests');
            return response.data.requests;
        } catch (error) {
            console.error("Error fetching friend requests:", error);
            return [];
        }
    }

    async getFriendDetails(friendId: string): Promise<FriendProfile | null> {
        try {
            const response = await api.get(`/api/friends/info/${friendId}`);
            return response.data.friend;
        } catch (error) {
            console.error("Error fetching friend details:", error);
            return null;
        }
    }

    async sendFriendRequest(email: string): Promise<boolean> {
        try {
            await api.post('/api/friends/request', { email });
            return true;
        } catch (error) {
            console.error("Error sending friend request:", error);
            throw error;
        }
    }

    async acceptFriendRequest(requestId: string): Promise<boolean> {
        try {
            await api.post('/api/friends/accept', { requestId });
            return true;
        } catch (error) {
            console.error("Error accepting friend request:", error);
            throw error;
        }
    }

    async declineFriendRequest(requestId: string): Promise<boolean> {
        try {
            await api.post('/api/friends/decline', { requestId });
            return true;
        } catch (error) {
            console.error("Error declining friend request:", error);
            throw error;
        }
    }

    async unfriend(friendId: string): Promise<boolean> {
        try {
            await api.post('/api/friends/unfriend', { friendId });
            return true;
        } catch (error) {
            console.error("Error unfriending user:", error);
            throw error;
        }
    }
}

export default new FriendsService(); 