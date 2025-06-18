import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
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

export const Lecture = mongoose.models.Lecture || mongoose.model('Lecture', lectureSchema); 