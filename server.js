import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Better startup logging
console.log('Initializing server...');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadsDir}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.put('/api/update/pfp', upload.single('pfp'), (req, res) => {
    console.log('Update profile picture request');

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('Uploaded file:', req.file);

    // Update profile picture URL
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    // Update mock user
    mockUser = {
        ...mockUser,
        profilePicture: imageUrl
    };

    res.json({
        success: true,
        user: mockUser
    });
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
});