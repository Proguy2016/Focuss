import express from 'express';
import { Subject } from '../models/Subject.js';
import { Lecture } from '../models/Lecture.js';
import { LectureContent } from '../models/LectureContent.js';
import { LibraryFile } from '../models/LibraryFile.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all subjects with their lectures
router.get('/subjects-lectures', async (req, res) => {
    try {
        // Get all subjects
        const subjects = await Subject.find({}).lean();

        // For each subject, get its lectures
        const subjectsWithLectures = await Promise.all(
            subjects.map(async (subject) => {
                const lectures = await Lecture.find({ subjectId: subject._id }).lean();

                // For each lecture, check if it has content
                const lecturesWithContent = await Promise.all(
                    lectures.map(async (lecture) => {
                        const content = await LectureContent.findOne({ lectureId: lecture._id }).lean();
                        const file = await LibraryFile.findOne({ lectureId: lecture._id }).lean();

                        return {
                            ...lecture,
                            contentId: content?._id || null,
                            hasSummary: !!content?.summary,
                            hasFlashcards: !!(content?.flashcards && content.flashcards.length > 0),
                            hasExamQuestions: !!(content?.examQuestions && content.examQuestions.length > 0),
                            hasRevision: !!content?.revision,
                            fileId: file?._id || null
                        };
                    })
                );

                return {
                    ...subject,
                    lectures: lecturesWithContent
                };
            })
        );

        res.status(200).json({
            success: true,
            subjects: subjectsWithLectures
        });
    } catch (error) {
        console.error('Error in /subjects-lectures:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects and lectures',
            error: error.message
        });
    }
});

// Get a specific lecture's content
router.get('/lecture-content/:lectureId', async (req, res) => {
    try {
        const { lectureId } = req.params;

        if (!lectureId || !mongoose.Types.ObjectId.isValid(lectureId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid Lecture ID is required'
            });
        }

        // Get the lecture
        const lecture = await Lecture.findById(lectureId).lean();

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        // Get the lecture content
        const content = await LectureContent.findOne({ lectureId }).lean();

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Lecture content not found'
            });
        }

        // Get the subject
        const subject = await Subject.findById(lecture.subjectId).lean();

        res.status(200).json({
            success: true,
            lecture,
            subject,
            content
        });
    } catch (error) {
        console.error('Error in /lecture-content:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lecture content',
            error: error.message
        });
    }
});

// Create a new subject
router.post('/subject', async (req, res) => {
    try {
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Subject name is required'
            });
        }

        const subject = new Subject({
            name,
            color: color || 'bg-blue-500' // Default color
        });

        await subject.save();

        res.status(201).json({
            success: true,
            subject
        });
    } catch (error) {
        console.error('Error in POST /subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subject',
            error: error.message
        });
    }
});

// Create a new lecture
router.post('/lecture', async (req, res) => {
    try {
        const { title, subjectId } = req.body;

        if (!title || !subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Lecture title and subject ID are required'
            });
        }

        // Check if subject exists
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        const lecture = new Lecture({
            title,
            subjectId
        });

        await lecture.save();

        res.status(201).json({
            success: true,
            lecture
        });
    } catch (error) {
        console.error('Error in POST /lecture:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating lecture',
            error: error.message
        });
    }
});

// Update a subject
router.put('/subject/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid Subject ID is required'
            });
        }

        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        if (name) subject.name = name;
        if (color) subject.color = color;

        await subject.save();

        res.status(200).json({
            success: true,
            subject
        });
    } catch (error) {
        console.error('Error in PUT /subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subject',
            error: error.message
        });
    }
});

// Update a lecture
router.put('/lecture/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid Lecture ID is required'
            });
        }

        const lecture = await Lecture.findById(id);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        if (title) lecture.title = title;

        await lecture.save();

        res.status(200).json({
            success: true,
            lecture
        });
    } catch (error) {
        console.error('Error in PUT /lecture:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lecture',
            error: error.message
        });
    }
});

// Delete a subject
router.delete('/subject/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid Subject ID is required'
            });
        }

        // Delete the subject
        const subject = await Subject.findByIdAndDelete(id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Delete all lectures for this subject
        const lectures = await Lecture.find({ subjectId: id });
        const lectureIds = lectures.map(lecture => lecture._id);

        await Lecture.deleteMany({ subjectId: id });

        // Delete all lecture content for these lectures
        await LectureContent.deleteMany({ lectureId: { $in: lectureIds } });

        // Delete all files for these lectures
        await LibraryFile.deleteMany({ lectureId: { $in: lectureIds } });

        res.status(200).json({
            success: true,
            message: 'Subject and related data deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subject',
            error: error.message
        });
    }
});

// Delete a lecture
router.delete('/lecture/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid Lecture ID is required'
            });
        }

        // Delete the lecture
        const lecture = await Lecture.findByIdAndDelete(id);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        // Delete lecture content
        await LectureContent.deleteOne({ lectureId: id });

        // Delete files for this lecture
        await LibraryFile.deleteMany({ lectureId: id });

        res.status(200).json({
            success: true,
            message: 'Lecture and related data deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /lecture:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting lecture',
            error: error.message
        });
    }
});

export default router; 