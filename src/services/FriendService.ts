import api from './api';

export interface Friend {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    profilePicture?: string;
    level?: number;
    xp?: number;
    streak?: number;
    focusHours?: number;
    achievements?: string[];
    friendBio?: string;  // For compatibility with API response
    friendPfp?: string;  // For compatibility with API response
}

export interface SenderInfo {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
}

export interface FriendRequest {
    friendId: string;
    createdAt?: string;
    senderInfo?: SenderInfo;
}

const FriendService = {
    // Send a friend request
    sendFriendRequest: async (friendId: string): Promise<any> => {
        try {
            const response = await api.put(`/api/friends/request`, { friendId });
            return response.data;
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    },

    // Accept a friend request
    acceptFriendRequest: async (friendId: string): Promise<any> => {
        try {
            const response = await api.put(`/api/friends/accept`, { friendId });
            return response.data;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    },

    // Decline a friend request
    declineFriendRequest: async (friendId: string): Promise<any> => {
        try {
            const response = await api.put(`/api/friends/decline`, { friendId });
            return response.data;
        } catch (error) {
            console.error('Error declining friend request:', error);
            throw error;
        }
    },

    // Unfriend a user
    unfriend: async (friendId: string): Promise<any> => {
        try {
            const response = await api.put(`/api/friends/unfriend`, { friendId });
            return response.data;
        } catch (error) {
            console.error('Error unfriending user:', error);
            throw error;
        }
    },

    // Get friend list
    getFriends: async (): Promise<any> => {
        try {
            const response = await api.get('/api/friends/list');
            return response.data;
        } catch (error) {
            console.error('Error getting friends list:', error);
            return { friends: [] };
        }
    },

    // Get friend requests
    getFriendRequests: async (): Promise<any> => {
        try {
            const response = await api.get('/api/friends/requests');
            return response.data;
        } catch (error) {
            console.error('Error getting friend requests:', error);
            return { friendRequests: [] };
        }
    },

    // Get friend info
    getFriendInfo: async (friendId: string): Promise<Friend | null> => {
        try {
            const response = await api.get(`/api/friends/info/${friendId}`);

            // Map API response to Friend interface
            if (response.data) {
                const friendData: Friend = {
                    _id: friendId,
                    firstName: response.data.friendFirstName || '',
                    lastName: response.data.friendLastName || '',
                    email: response.data.email || '',
                    bio: response.data.friendBio || '',
                    profilePicture: response.data.friendPfp || '',
                    // Other fields will be undefined if not provided
                };
                return friendData;
            }

            return null;
        } catch (error) {
            console.error('Error getting friend info:', error);
            return null;
        }
    }
};

export default FriendService; 