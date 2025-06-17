const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const generateGeminiResponse = async (prompt: string, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            // Get the authentication token from localStorage
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/gemini/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include the Authorization header with the token
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error ${response.status}: ${errorBody}`);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }

            const data = await response.json();
            return data.data.text || data.data; // Handle both response formats
        } catch (error) {
            console.error('Error generating Gemini response:', error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
};

export const generateGeminiChatResponse = async (chatHistory: any[], newUserMessage: string, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            // Get the authentication token from localStorage
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/gemini/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include the Authorization header with the token
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({ history: chatHistory, prompt: newUserMessage }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error ${response.status}: ${errorBody}`);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }

            const data = await response.json();
            return data.data.text || data.data; // Handle both response formats
        } catch (error) {
            console.error('Error generating Gemini chat response:', error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
}; 