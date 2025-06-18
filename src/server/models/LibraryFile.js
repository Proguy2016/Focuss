import mongoose from 'mongoose';

const libraryFileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'pdf'
    },
    size: {
        type: Number,
        required: true
    },
    lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
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

export const LibraryFile = mongoose.models.LibraryFile || mongoose.model('LibraryFile', libraryFileSchema); 