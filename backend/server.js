const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { extractTextFromPDF } = require('./utils/pdfExtractor');
const { extractTextFromDocx } = require('./utils/docxExtractor');
const { screenResumeWithNLP } = require('./services/nlpService');
const Resume = require('./models/Resume');
const ScreeningResult = require('./models/ScreeningResult');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-screening', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes

// 1. POST /api/upload-resume - Upload and extract text from resume
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        
        let extractedText = '';

        // Extract text based on file type
        if (fileExtension === '.pdf') {
            extractedText = await extractTextFromPDF(filePath);
        } else if (fileExtension === '.docx') {
            extractedText = await extractTextFromDocx(filePath);
        } else {
            return res.status(400).json({ error: 'Unsupported file format' });
        }

        // Save resume metadata to database
        const resume = new Resume({
            filename: req.file.originalname,
            filepath: filePath,
            extractedText: extractedText,
            uploadedAt: new Date()
        });

        await resume.save();

        // Clean up uploaded file after processing
        fs.unlinkSync(filePath);

        res.json({
            resumeId: resume._id,
            text: extractedText,
            message: 'Resume uploaded and processed successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to process resume' });
    }
});

// 2. POST /api/screen-resume - Screen resume against job description
app.post('/api/screen-resume', async (req, res) => {
    try {
        const { resumeId, jobDescription } = req.body;

        if (!resumeId || !jobDescription) {
            return res.status(400).json({ error: 'Resume ID and job description are required' });
        }

        // Get resume from database
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Process with NLP models
        const screeningResults = await screenResumeWithNLP(resume.extractedText, jobDescription);

        // Save screening results
        const result = new ScreeningResult({
            resumeId: resumeId,
            jobDescription: jobDescription,
            matchScore: screeningResults.matchScore,
            matchedKeywords: screeningResults.matchedKeywords,
            missingKeywords: screeningResults.missingKeywords,
            recommendations: screeningResults.recommendations,
            entities: screeningResults.entities,
            createdAt: new Date()
        });

        await result.save();

        res.json({
            resultId: result._id,
            ...screeningResults
        });

    } catch (error) {
        console.error('Screening error:', error);
        res.status(500).json({ error: 'Failed to screen resume' });
    }
});

// 3. GET /api/results/:id - Get screening results by ID
app.get('/api/results/:id', async (req, res) => {
    try {
        const result = await ScreeningResult.findById(req.params.id).populate('resumeId');
        
        if (!result) {
            return res.status(404).json({ error: 'Results not found' });
        }

        res.json(result);

    } catch (error) {
        console.error('Results fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Resume screening API is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Resume screening server running on port ${PORT}`);
});