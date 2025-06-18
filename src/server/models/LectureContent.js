import mongoose from 'mongoose';

const lectureContentSchema = new mongoose.Schema({
    lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true
    },
    summary: {
        type: mongoose.Schema.Types.Mixed, // Can be string or array of strings
        default: null
    },
    flashcards: [{
        question: String,
        answer: String,
        nextReviewDate: {
            type: Date,
            default: Date.now
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        repetitionCount: {
            type: Number,
            default: 0
        }
    }],
    examQuestions: [{
        question: String,
        answer: String
    }],
    revision: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const LectureContent = mongoose.models.LectureContent || mongoose.model('LectureContent', lectureContentSchema); 