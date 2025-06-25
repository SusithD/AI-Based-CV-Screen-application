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
const Company = require('./models/Company');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
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
    limits: { fileSize: 5 * 1024 * 1024 }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-screening', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Resume screening API is running' });
});

// Core API Routes
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        let extractedText = '';

        if (fileExtension === '.pdf') {
            extractedText = await extractTextFromPDF(filePath);
        } else if (fileExtension === '.docx') {
            extractedText = await extractTextFromDocx(filePath);
        } else {
            return res.status(400).json({ error: 'Unsupported file format' });
        }

        const resume = new Resume({
            filename: req.file.originalname,
            filepath: filePath,
            extractedText: extractedText,
            uploadedAt: new Date()
        });

        await resume.save();
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

app.post('/api/screen-resume', async (req, res) => {
    try {
        const { resumeId, jobDescription } = req.body;

        if (!resumeId || !jobDescription) {
            return res.status(400).json({ error: 'Resume ID and job description are required' });
        }

        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        const screeningResults = await screenResumeWithNLP(resume.extractedText, jobDescription);

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

// ATS Integration Routes (Mock implementations)
app.get('/api/ats/integrations', (req, res) => {
    const integrations = [
        {
            id: 'workday',
            name: 'Workday',
            description: 'Integration with Workday HCM',
            configFields: [
                { name: 'tenantUrl', label: 'Tenant URL', type: 'url', required: true },
                { name: 'clientId', label: 'Client ID', type: 'text', required: true },
                { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
            ]
        },
        {
            id: 'greenhouse',
            name: 'Greenhouse',
            description: 'Integration with Greenhouse ATS',
            configFields: [
                { name: 'apiKey', label: 'API Key', type: 'password', required: true }
            ]
        },
        {
            id: 'lever',
            name: 'Lever',
            description: 'Integration with Lever ATS',
            configFields: [
                { name: 'apiKey', label: 'API Key', type: 'password', required: true }
            ]
        },
        {
            id: 'bamboohr',
            name: 'BambooHR',
            description: 'Integration with BambooHR',
            configFields: [
                { name: 'subdomain', label: 'Subdomain', type: 'text', required: true },
                { name: 'apiKey', label: 'API Key', type: 'password', required: true }
            ]
        }
    ];
    res.json({ integrations });
});

app.post('/api/ats/configure', (req, res) => {
    const { companyId, atsProvider, config } = req.body;

    if (!companyId || !atsProvider || !config) {
        return res.status(400).json({ 
            error: 'Company ID, ATS provider, and configuration are required' 
        });
    }

    // Mock success response
    res.json({ 
        success: true, 
        message: `${atsProvider} integration configured successfully` 
    });
});

app.post('/api/ats/test-connection', (req, res) => {
    const { atsProvider, config } = req.body;
    
    // Mock connection test
    res.json({ 
        success: true,
        message: `Connection to ${atsProvider} successful`
    });
});

app.get('/api/ats/company-settings/:companyId', (req, res) => {
    // Mock ATS settings
    res.json({ 
        atsSettings: {
            provider: null,
            enabled: false,
            configuredAt: null,
            hasConfig: false
        }
    });
});

app.post('/api/ats/import-jobs', (req, res) => {
    const { companyId } = req.body;
    
    if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
    }

    // Mock job import
    res.json({
        success: true,
        message: 'Successfully imported 5 jobs',
        imported: 5
    });
});

app.delete('/api/ats/disconnect/:companyId', (req, res) => {
    res.json({ 
        success: true, 
        message: 'ATS integration disconnected successfully' 
    });
});

// Error handling
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