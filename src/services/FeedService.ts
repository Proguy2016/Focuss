import api from './api';

export interface PostUser {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
}

export interface PostAttachment {
    included: boolean;
    type: string;
    content: string;
}

export interface PostLikes {
    users: string[];
    count: number;
}

export interface Post {
    _id: string;
    userId: PostUser;
    content: string;
    attachment: PostAttachment;
    likes: PostLikes;
    parentId?: string;
    timePosted: string;
    __v: number;
}

interface GetPostsResponse {
    message: string;
    posts: Post[];
}

class FeedService {
    /**
     * Get posts with pagination
     */
    async getPosts(page: number = 0, limit: number = 10, parentId?: string): Promise<GetPostsResponse> {
        let url = `/api/feed/get?page=${page}&limit=${limit}`;

        if (parentId) {
            url += `&parentId=${parentId}`;
        }

        const response = await api.get<GetPostsResponse>(url);
        return response.data;
    }

    /**
     * Create a new post or comment
     */
    async createPost(content: string, attachment?: { type: string, content: string }, parentId?: string): Promise<Post> {
        const postData: any = { content };

        if (attachment) {
            postData.attachment = {
                included: true,
                ...attachment
            };
        }

        if (parentId) {
            postData.parentId = parentId;
        }

        const response = await api.post('/api/feed/post', postData);
        return response.data.post;
    }

    /**
     * Edit an existing post
     */
    async editPost(postId: string, content: string): Promise<Post> {
        const response = await api.put('/api/feed/edit', { postId, content });
        return response.data.post;
    }

    /**
     * Delete a post
     */
    async deletePost(postId: string): Promise<void> {
        await api.delete(`/api/feed/${postId}`);
    }

    /**
     * Like a post
     */
    async likePost(postId: string): Promise<void> {
        await api.post('/api/feed/like', { postId });
    }

    /**
     * Unlike a post
     */
    async unlikePost(postId: string): Promise<void> {
        await api.post('/api/feed/unlike', { postId });
    }

    /**
     * Get comments for a post
     */
    async getComments(postId: string, page: number = 0, limit: number = 10): Promise<GetPostsResponse> {
        const response = await api.get<GetPostsResponse>(`/api/feed/get?parentId=${postId}&page=${page}&limit=${limit}`);
        return response.data;
    }
}

export default new FeedService(); 