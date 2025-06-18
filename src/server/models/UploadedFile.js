import mongoose from 'mongoose';

const uploadedFileSchema = new mongoose.Schema({
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
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    parentId: {
        type: String,
        default: 'root'
    },
    folderName: {
        type: String,
        default: ''
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

export const UploadedFile = mongoose.models.UploadedFile || mongoose.model('UploadedFile', uploadedFileSchema); 