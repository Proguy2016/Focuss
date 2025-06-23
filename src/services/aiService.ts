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

            const response = await api.post('/api/ai/analyze-pdf', { fileId, lectureId, subjectId, title });
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
            const response = await api.get(`/api/ai/job-status/${jobId}`);
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
            const response = await api.get(`/api/library/lecture-content/${lectureId}`);
            return response.data.content;
        } catch (error) {
            console.error('Error fetching lecture content:', error);
            return null;
        }
    }

    // Generate enhanced study materials for premium features
    async generatePremiumContent(lectureId: string): Promise<any> {
        try {
            const response = await api.post('/api/ai/premium-content', { lectureId });
            return response.data;
        } catch (error) {
            console.error('Error generating premium content:', error);
            throw error;
        }
    }
}

export default new AIService(); 