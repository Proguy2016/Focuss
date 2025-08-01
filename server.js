import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Better startup logging
console.log('Initializing server...');

// Connect to MongoDB (replace with your actual MongoDB URI)
mongoose.connect('mongodb://localhost:27017/focuss', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        console.log(`Created uploads directory at ${uploadsDir}`);
    } catch (error) {
        console.error(`Failed to create uploads directory: ${error.message}`);
        process.exit(1); // Exit if we can't create the directory
    }
} else {
    console.log(`Using existing uploads directory at ${uploadsDir}`);
    // Ensure proper permissions
    try {
        fs.chmodSync(uploadsDir, 0o755);
    } catch (error) {
        console.warn(`Failed to set permissions on uploads directory: ${error.message}`);
    }
}

// Create library directory for file storage
const libraryDir = path.join(__dirname, 'library');
if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true });
    console.log(`Created library directory at ${libraryDir}`);
}

// Configure multer for profile picture uploads
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

// Create multer instance without .single() yet
const profileMulter = multer({
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Wrap profileUpload middleware to handle errors
const handleProfileUpload = (req, res, next) => {
    // Apply the single file upload middleware
    profileMulter.single('pfp')(req, res, (err) => {
        if (err) {
            console.error('Profile upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error'
            });
        }
        next();
    });
};

// Configure multer for library file uploads
const libraryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, libraryDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique ID for the file
        const fileId = uuidv4();
        // Keep original extension
        const ext = path.extname(file.originalname);
        cb(null, `${fileId}${ext}`);
    }
});

const libraryUpload = multer({
    storage: libraryStorage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/library', express.static(path.join(__dirname, 'library')));

// Import routes
import aiRoutes from './src/server/routes/aiRoutes.js';
import libraryRoutes from './src/server/routes/libraryRoutes.js';

// Use routes
app.use('/api/ai', aiRoutes);
app.use('/api/library', libraryRoutes);

// Mock user data
let mockUser = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Frontend developer passionate about React.',
    profilePicture: null,
    settings: {
        timezone: 'UTC+2',
        language: 'en'
    }
};

// Mock library data
let libraryItems = [{
    id: 'folder-1',
    type: 'folder',
    name: 'Documents',
    parentId: null,
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
},
{
    id: 'folder-2',
    type: 'folder',
    name: 'Images',
    parentId: null,
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
}
];

// In-memory file tracking
const fileRegistry = new Map();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
    console.log('Register request:', req.body);
    const { firstName, lastName, email, password } = req.body;

    // Simple validation
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // In a real app, you would hash password and save to DB

    // Return mock response
    res.json({
        success: true,
        token: 'mock-jwt-token',
        user: {
            id: '123',
            firstName,
            lastName,
            email
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    console.log('Login request:', req.body);
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Always succeed for testing purposes
    res.json({
        success: true,
        token: 'mock-jwt-token',
        user: mockUser
    });
});

app.get('/api/auth/me', (req, res) => {
    console.log('Auth check request');
    // In a real app, you would verify JWT token

    // Return mock user data
    res.json({
        success: true,
        user: mockUser
    });
});

// Update routes
app.put('/api/update/name', (req, res) => {
    console.log('Update name request:', req.body);
    const { firstName, lastName } = req.body;

    // Update mock user
    mockUser = {
        ...mockUser,
        firstName,
        lastName
    };

    res.json({
        success: true,
        user: mockUser
    });
});

app.put('/api/update/bio', (req, res) => {
    console.log('Update bio request:', req.body);
    const { bio } = req.body;

    // Update mock user
    mockUser = {
        ...mockUser,
        bio
    };

    res.json({
        success: true,
        user: mockUser
    });
});

// Update profile picture endpoint
app.put('/api/update/pfp', handleProfileUpload, (req, res) => {
    console.log('Update profile picture request received');

    try {
        if (!req.file) {
            console.error('No file received in the request');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('File successfully uploaded:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Update profile picture URL
        const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
        console.log('Profile picture URL:', imageUrl);

        // Update mock user
        mockUser = {
            ...mockUser,
            profilePicture: imageUrl
        };

        res.json({
            success: true,
            user: mockUser
        });
    } catch (error) {
        console.error('Error processing profile picture:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing profile picture',
            error: error.message
        });
    }
});

app.put('/api/update/privacy', (req, res) => {
    console.log('Update privacy request:', req.body);

    // Update mock user privacy settings
    mockUser = {
        ...mockUser,
        privacySettings: req.body
    };

    res.json({
        success: true,
        user: mockUser
    });
});

// Stats API endpoint - returning 404 for testing error handling
app.get('/api/stats/get', (req, res) => {
    console.log('Stats request received');
    // Return 404 to test error handling in the front-end
    res.status(404).json({
        success: false,
        message: 'Stats not found for this user.'
    });
});

// Library API routes

// Get all items in the root directory or in a specific folder
app.get('/api/library', (req, res) => {
    try {
        // Filter items that are in the root (parentId is null)
        const items = libraryItems.filter(item => item.parentId === null);
        res.json({ success: true, items });
    } catch (error) {
        console.error('Error fetching library items:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch library items' });
    }
});

app.get('/api/library/folder/:folderId', (req, res) => {
    try {
        const { folderId } = req.params;
        // Filter items that have the specified parent folder ID
        const items = libraryItems.filter(item => item.parentId === folderId);

        if (items.length === 0) {
            return res.json({ success: true, items: [] });
        }

        res.json({ success: true, items });
    } catch (error) {
        console.error('Error fetching folder items:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch folder items' });
    }
});

// Look up folder by path
app.get('/api/library/path', (req, res) => {
    try {
        const { path } = req.query;

        if (!path) {
            return res.status(400).json({ success: false, message: 'Path parameter is required' });
        }

        // Find the folder with the specified path
        const folder = libraryItems.find(item =>
            item.type === 'folder' && item.path + item.name === path
        );

        if (!folder) {
            return res.status(404).json({ success: false, message: 'Folder not found' });
        }

        res.json({ success: true, ...folder });
    } catch (error) {
        console.error('Error finding folder by path:', error);
        res.status(500).json({ success: false, message: 'Failed to find folder by path' });
    }
});

// Create a new folder
app.post('/api/library/folder', (req, res) => {
    try {
        const { name, parentId, path } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Folder name is required' });
        }

        // Check if folder already exists at this path
        const folderExists = libraryItems.some(item =>
            item.type === 'folder' &&
            item.name === name &&
            item.parentId === parentId
        );

        if (folderExists) {
            return res.status(409).json({ success: false, message: 'Folder already exists with this name' });
        }

        // Create new folder
        const folderId = `folder-${uuidv4()}`;
        const timestamp = new Date();

        const newFolder = {
            id: folderId,
            type: 'folder',
            name,
            parentId: parentId === 'root' ? null : parentId,
            path: path || '/',
            createdAt: timestamp,
            modifiedAt: timestamp
        };

        libraryItems.push(newFolder);

        res.status(201).json({ success: true, id: folderId });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ success: false, message: 'Failed to create folder' });
    }
});

// Upload file endpoint
app.post('/api/up/upload', libraryUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        console.log('Uploaded library file:', req.file);

        const fileId = path.basename(req.file.filename, path.extname(req.file.filename));
        const timestamp = new Date();
        const parentId = req.body.parentId === 'root' ? null : req.body.parentId;
        const filePath = req.body.path ? `/${req.body.path}/` : '/';

        // Store file information in registry
        const fileInfo = {
            id: fileId,
            type: 'file',
            name: req.file.originalname,
            size: req.file.size,
            path: filePath,
            parentId: parentId,
            contentType: req.file.mimetype,
            filename: req.file.filename,
            createdAt: timestamp,
            modifiedAt: timestamp
        };

        fileRegistry.set(fileId, fileInfo);
        libraryItems.push(fileInfo);

        res.json({
            success: true,
            id: fileId,
            name: req.file.originalname,
            size: req.file.size,
            contentType: req.file.mimetype
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ success: false, message: 'Failed to upload file' });
    }
});

// Get file endpoint
app.get('/api/up/file/:fileId', (req, res) => {
    try {
        const { fileId } = req.params;

        // Check if file exists in registry
        const fileInfo = fileRegistry.get(fileId) || libraryItems.find(item => item.id === fileId);

        if (!fileInfo) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Determine file path
        const filePath = path.join(libraryDir, fileInfo.filename);

        // Check if file exists on disk
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on disk' });
        }

        // Set proper content type
        res.setHeader('Content-Type', fileInfo.contentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`);

        // Send the file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({ success: false, message: 'Failed to serve file' });
    }
});

// Delete file endpoint
app.delete('/api/library/file/:fileId', (req, res) => {
    try {
        const { fileId } = req.params;

        // Check if file exists in registry
        const fileInfo = fileRegistry.get(fileId) || libraryItems.find(item => item.id === fileId && item.type === 'file');

        if (!fileInfo) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Remove from registry
        fileRegistry.delete(fileId);

        // Remove from library items
        libraryItems = libraryItems.filter(item => item.id !== fileId);

        // Remove from disk
        const filePath = path.join(libraryDir, fileInfo.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ success: false, message: 'Failed to delete file' });
    }
});

// Delete folder endpoint
app.delete('/api/library/folder/:folderId', (req, res) => {
    try {
        const { folderId } = req.params;

        // Check if folder exists
        const folderInfo = libraryItems.find(item => item.id === folderId && item.type === 'folder');

        if (!folderInfo) {
            return res.status(404).json({ success: false, message: 'Folder not found' });
        }

        // Check if folder is empty
        const folderHasItems = libraryItems.some(item => item.parentId === folderId);

        if (folderHasItems) {
            return res.status(409).json({ success: false, message: 'Cannot delete non-empty folder' });
        }

        // Remove folder from library items
        libraryItems = libraryItems.filter(item => item.id !== folderId);

        res.json({ success: true, message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ success: false, message: 'Failed to delete folder' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('API endpoints available:');
    console.log('  POST /api/auth/login');
    console.log('  POST /api/auth/register');
    console.log('  GET  /api/auth/me');
    console.log('  PUT  /api/update/name');
    console.log('  PUT  /api/update/bio');
    console.log('  PUT  /api/update/pfp');
    console.log('  PUT  /api/update/privacy');
    console.log('  GET  /api/stats/get');
    console.log('  GET  /api/library');
    console.log('  GET  /api/library/folder/:folderId');
    console.log('  GET  /api/library/path');
    console.log('  POST /api/library/folder');
    console.log('  POST /api/up/upload');
    console.log('  GET  /api/up/file/:fileId');
    console.log('  DELETE /api/library/file/:fileId');
    console.log('  DELETE /api/library/folder/:folderId');
});