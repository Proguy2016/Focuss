import api from './api';

export interface ProcessingStatus {
    status: string;
    progress: number;
    message?: string;
    error?: string;
}

export interface AIGeneratedContent {
    summary: string | string[];
    flashcards: Array<{ question: string; answer: string }>;
    examQuestions: Array<{ question: string; answer: string }>;
    revision: string;
}

class AIService {
    private processingJobs: Map<string, ProcessingStatus> = new Map();

    // Check status of a processing job
    getProcessingStatus(jobId: string): ProcessingStatus | null {
        return this.processingJobs.get(jobId) || null;
    }

    // Update status of a processing job
    updateProcessingStatus(jobId: string, status: Partial<ProcessingStatus>): void {
        const currentStatus = this.processingJobs.get(jobId) || { status: 'pending', progress: 0 };
        this.processingJobs.set(jobId, { ...currentStatus, ...status });
    }

    // Analyze PDF file and generate content
    async analyzePDF(fileId: string, lectureId: string, subjectId: string, title: string): Promise<{ jobId: string }> {
        try {
            console.log('Analyzing PDF with parameters:', { fileId, lectureId, subjectId, title });

            if (!fileId || !lectureId || !subjectId || !title) {
                console.error('Missing required parameters for PDF analysis:', { fileId, lectureId, subjectId, title });
                throw new Error('Missing required parameters for PDF analysis');
            }

            const response = await api.post('/ai/analyze-pdf', { fileId, lectureId, subjectId, title });
            console.log('Analyze PDF response:', response.data);

            const jobId = response.data.jobId;
            if (!jobId) {
                console.error('No job ID returned from analyze-pdf endpoint');
                throw new Error('Failed to start analysis job');
            }

            // Initialize job status
            this.processingJobs.set(jobId, {
                status: 'processing',
                progress: 0,
                message: 'Starting PDF analysis...'
            });

            // Start polling for status updates
            this.pollJobStatus(jobId);

            return { jobId };
        } catch (error) {
            console.error('Error analyzing PDF:', error);
            throw error;
        }
    }

    // Poll for job status updates
    private async pollJobStatus(jobId: string): Promise<void> {
        try {
            const response = await api.get(`/ai/job-status/${jobId}`);
            const status = response.data;

            this.updateProcessingStatus(jobId, status);

            if (status.status !== 'completed' && status.status !== 'failed') {
                // Continue polling
                setTimeout(() => this.pollJobStatus(jobId), 2000);
            }
        } catch (error) {
            console.error('Error polling job status:', error);
            this.updateProcessingStatus(jobId, {
                status: 'failed',
                error: 'Failed to get status update'
            });
        }
    }

    // Get AI-generated content for a lecture
    async getLectureContent(lectureId: string): Promise<AIGeneratedContent | null> {
        try {
            const response = await api.get(`/library/lecture-content/${lectureId}`);
            return response.data.content;
        } catch (error) {
            console.error('Error fetching lecture content:', error);
            return null;
        }
    }

    // Generate enhanced study materials for premium features
    async generatePremiumContent(lectureId: string): Promise<any> {
        try {
            const response = await api.post('/ai/premium-content', { lectureId });
            return response.data;
        } catch (error) {
            console.error('Error generating premium content:', error);
            throw error;
        }
    }
}

// Add new methods for advanced features
const askDocumentQuestion = async (fileId: string, question: string) => {
    try {
        const response = await api.post('/ai/document-qa', {
            fileId,
            question
        });
        return response.data;
    } catch (error) {
        console.error('Error asking document question:', error);
        throw error;
    }
};

const generateFlashcardsFromContent = async (content: string, count: number = 10) => {
    try {
        const response = await api.post('/ai/generate-flashcards', {
            content,
            count
        });
        return response.data;
    } catch (error) {
        console.error('Error generating flashcards:', error);
        throw error;
    }
};

const generateLearningPath = async (lectureId: string, userPerformance: any) => {
    try {
        const response = await api.post('/ai/learning-path', {
            lectureId,
            userPerformance
        });
        return response.data;
    } catch (error) {
        console.error('Error generating learning path:', error);
        throw error;
    }
};

const analyzeNotes = async (notes: string) => {
    try {
        const response = await api.post('/ai/analyze-notes', {
            notes
        });
        return response.data;
    } catch (error) {
        console.error('Error analyzing notes:', error);
        throw error;
    }
};

// Update the saveNote method to provide better error handling
const saveNote = async (note: {
    title: string;
    content: string;
    tags: string[];
    lectureId: string;
}) => {
    try {
        if (!note.lectureId) {
            throw new Error('Missing lecture ID for note');
        }

        const response = await api.post('/notes', note);
        return response.data;
    } catch (error: any) {
        console.error('Error saving note:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(`Failed to save note: ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('Network error: No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`Error: ${error.message}`);
        }
    }
};

// Update the updateNote method to provide better error handling
const updateNote = async (
    noteId: string,
    updates: {
        title?: string;
        content?: string;
        tags?: string[];
    }
) => {
    try {
        if (!noteId) {
            throw new Error('Missing note ID for update');
        }

        const response = await api.put(`/notes/${noteId}`, updates);
        return response.data;
    } catch (error: any) {
        console.error('Error updating note:', error);
        if (error.response) {
            throw new Error(`Failed to update note: ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Network error: No response received from server');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};

// Update the getNotesByLecture method to provide better error handling
const getNotesByLecture = async (lectureId: string) => {
    try {
        if (!lectureId) {
            throw new Error('Missing lecture ID');
        }

        const response = await api.get(`/notes/lecture/${lectureId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching notes for lecture:', error);
        if (error.response) {
            throw new Error(`Failed to fetch notes: ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Network error: No response received from server');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};

// Update the deleteNote method to provide better error handling
const deleteNote = async (noteId: string) => {
    try {
        if (!noteId) {
            throw new Error('Missing note ID for deletion');
        }

        const response = await api.delete(`/notes/${noteId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting note:', error);
        if (error.response) {
            throw new Error(`Failed to delete note: ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Network error: No response received from server');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};

// Add a new method for chatting with the AI about a specific lecture
const chatWithLecture = async (lectureId: string, message: string, lectureContent?: any) => {
    try {
        if (!lectureId) {
            throw new Error('Missing lecture ID');
        }

        console.log('Sending AI chat request with:', { lectureId, message });

        // Use the correct endpoint path without /api prefix (the interceptor will add it)
        const response = await api.post('/ai/chat', {
            lectureId,
            message,
            lectureContent // Optionally pass lecture content for context
        });

        console.log('AI chat response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error in AI chat:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            throw new Error(`AI chat error: ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('Network error: No response received from server');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};

// Export all the functions
const aiService = new AIService();
export default {
    ...aiService,
    askDocumentQuestion,
    generateFlashcardsFromContent,
    generateLearningPath,
    analyzeNotes,
    saveNote,
    updateNote,
    getNotesByLecture,
    deleteNote,
    chatWithLecture // Add the new method to exports
}; 