import axios from 'axios';

// Simple auth token utility to avoid import issues
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Define interfaces for API requests and responses
interface GeminiResponse {
  success: boolean;
  data?: string;
  message?: string;
}

interface ChatHistory {
  role: 'user' | 'model';
  content: string;
}

// Base API URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Generate a response from Gemini AI for a single prompt
 * @param prompt The user's prompt/question
 * @returns The AI response text
 */
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.post<GeminiResponse>(
      `${API_URL}/api/gemini/generate`,
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get AI response');
    }

    return response.data.data || '';
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get AI response');
  }
};

/**
 * Generate a chat response from Gemini AI with history
 * @param history Previous conversation history
 * @param prompt The current user prompt/question
 * @returns The AI response text
 */
export const generateGeminiChatResponse = async (
  history: ChatHistory[],
  prompt: string
): Promise<string> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.post<GeminiResponse>(
      `${API_URL}/api/gemini/chat`,
      { 
        history, 
        prompt 
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get chat response');
    }

    return response.data.data || '';
  } catch (error: any) {
    console.error('Error generating AI chat response:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get chat response');
  }
}; 