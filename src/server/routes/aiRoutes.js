import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pdfProcessor from '../ai/pdfProcessor.js';
import { LibraryFile } from '../models/LibraryFile.js';
import { UploadedFile } from '../models/UploadedFile.js';
import { LectureContent } from '../models/LectureContent.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route to analyze a PDF file
router.post('/analyze-pdf', async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(400).json({ success: false, message: 'File ID is required' });
        }

        // First, try to find the file in LibraryFile model
        let file = await LibraryFile.findById(fileId);

        // If not found, try to find in UploadedFile model
        if (!file) {
            file = await UploadedFile.findById(fileId);
        }

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found in database' });
        }

        // Get the file path
        const filePath = path.join(process.cwd(), file.path);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on disk' });
        }

        // Process the PDF
        const jobId = await pdfProcessor.processPDF(filePath);

        res.status(200).json({
            success: true,
            jobId,
            message: 'PDF analysis started'
        });
    } catch (error) {
        console.error('Error in /analyze-pdf:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing PDF',
            error: error.message
        });
    }
});

// Route to get job status
router.get('/job-status/:jobId', (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({ success: false, message: 'Job ID is required' });
        }

        const status = pdfProcessor.getJobStatus(jobId);

        if (!status) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json(status);
    } catch (error) {
        console.error('Error in /job-status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting job status',
            error: error.message
        });
    }
});

// Route to save generated content to a lecture
router.post('/save-content', async (req, res) => {
    try {
        const { jobId, lectureId } = req.body;

        if (!jobId || !lectureId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID and Lecture ID are required'
            });
        }

        // Get the generated content
        const content = pdfProcessor.getGeneratedContent(jobId);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Generated content not found or job not completed'
            });
        }

        // Save content to database
        let lectureContent = await LectureContent.findOne({ lectureId });

        if (lectureContent) {
            // Update existing content
            lectureContent.summary = content.summary;
            lectureContent.flashcards = content.flashcards;
            lectureContent.examQuestions = content.examQuestions;
            lectureContent.revision = content.revision;
            await lectureContent.save();
        } else {
            // Create new content
            lectureContent = new LectureContent({
                lectureId,
                summary: content.summary,
                flashcards: content.flashcards,
                examQuestions: content.examQuestions,
                revision: content.revision
            });
            await lectureContent.save();
        }

        res.status(200).json({
            success: true,
            message: 'Content saved successfully',
            contentId: lectureContent._id
        });
    } catch (error) {
        console.error('Error in /save-content:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving content',
            error: error.message
        });
    }
});

// Route to generate premium content
router.post('/premium-content', async (req, res) => {
    try {
        const { lectureId } = req.body;

        if (!lectureId) {
            return res.status(400).json({
                success: false,
                message: 'Lecture ID is required'
            });
        }

        // Get the lecture content
        const lectureContent = await LectureContent.findOne({ lectureId });

        if (!lectureContent) {
            return res.status(404).json({
                success: false,
                message: 'Lecture content not found'
            });
        }

        // In a real implementation, this would generate enhanced content using AI
        // For now, we'll return the existing content with some additional fields

        const premiumContent = {
            ...lectureContent.toObject(),
            enhancedSummary: Array.isArray(lectureContent.summary)
                ? lectureContent.summary.map(p => `Enhanced: ${p}`)
                : `Enhanced: ${lectureContent.summary}`,
            visualExplanations: [
                { title: 'Concept Map', imageUrl: '/images/concept-map-placeholder.png' },
                { title: 'Process Flow', imageUrl: '/images/process-flow-placeholder.png' }
            ],
            practiceProblems: lectureContent.examQuestions.map((q, i) => ({
                ...q,
                difficulty: ['easy', 'medium', 'hard'][i % 3],
                hint: `Think about the key concepts related to this question.`
            })),
            studyPlan: {
                title: `Study Plan for Lecture`,
                duration: 45, // minutes
                steps: [
                    { type: 'read', title: 'Review Summary', duration: 10 },
                    { type: 'practice', title: 'Key Concepts Practice', duration: 15 },
                    { type: 'quiz', title: 'Knowledge Check', duration: 15 },
                    { type: 'read', title: 'Revision Overview', duration: 5 }
                ]
            }
        };

        res.status(200).json({
            success: true,
            premiumContent
        });
    } catch (error) {
        console.error('Error in /premium-content:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating premium content',
            error: error.message
        });
    }
});

export default router; 