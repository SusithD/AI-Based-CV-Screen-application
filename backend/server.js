const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { extractTextFromPDF } = require('./utils/pdfExtractor');
const { extractTextFromDocx } = require('./utils/docxExtractor');
const { screenResumeWithNLP } = require('./services/nlpService');
const Resume = require('./models/Resume');
const ScreeningResult = require('./models/ScreeningResult');
const Company = require('./models/Company');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Permission middleware
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.userId);
            if (!user || !user.hasPermission(permission)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            next();
        } catch (error) {
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(fileExtension)) {
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

// ======================
// AUTHENTICATION ROUTES
// ======================

// Register user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role = 'job_seeker', companyId } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            role,
            profile: { firstName, lastName }
        });
        
        // Associate with company if company user
        if (role !== 'job_seeker' && companyId) {
            user.company = companyId;
        }
        
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({ error: 'Account is temporarily locked due to too many failed login attempts' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            await user.incLoginAttempts();
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }
        
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                company: user.company
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('company').select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update allowed fields
        const allowedUpdates = ['profile', 'notifications', 'privacy'];
        allowedUpdates.forEach(field => {
            if (req.body[field]) {
                user[field] = { ...user[field], ...req.body[field] };
            }
        });
        
        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ======================
// JOB MANAGEMENT ROUTES
// ======================

// Get all public jobs with filtering and pagination
app.get('/api/jobs', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            location,
            type,
            remote,
            salaryMin,
            salaryMax,
            company,
            department
        } = req.query;
        
        const query = { status: 'active', visibility: 'public' };
        
        // Add filters
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { requirements: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (location) {
            query.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.country': { $regex: location, $options: 'i' } }
            ];
        }
        
        if (type) query['employment.type'] = type;
        if (remote === 'true') query['location.remote'] = true;
        if (department) query.department = { $regex: department, $options: 'i' };
        if (company) query.company = company;
        
        // Salary filtering
        if (salaryMin || salaryMax) {
            query['salary.min'] = {};
            if (salaryMin) query['salary.min'].$gte = parseInt(salaryMin);
            if (salaryMax) query['salary.max'] = { $lte: parseInt(salaryMax) };
        }
        
        const jobs = await Job.find(query)
            .populate('company', 'name domain industry')
            .populate('createdBy', 'profile.firstName profile.lastName')
            .sort({ postedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Job.countDocuments(query);
        
        res.json({
            jobs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalJobs: total
        });
    } catch (error) {
        console.error('Jobs fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Get single job by ID or slug
app.get('/api/jobs/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Try to find by ID first, then by slug
        let job = await Job.findById(identifier).populate('company', 'name domain industry size');
        if (!job) {
            job = await Job.findOne({ slug: identifier }).populate('company', 'name domain industry size');
        }
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Increment view count
        job.views += 1;
        await job.save();
        
        res.json(job);
    } catch (error) {
        console.error('Job fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// Create new job (company users only)
app.post('/api/jobs', authenticateToken, requirePermission('manage_jobs'), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user.company) {
            return res.status(400).json({ error: 'User must be associated with a company' });
        }
        
        const job = new Job({
            ...req.body,
            company: user.company,
            createdBy: user._id
        });
        
        await job.save();
        await job.populate('company', 'name domain industry');
        
        res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
        console.error('Job creation error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// Update job
app.put('/api/jobs/:id', authenticateToken, requirePermission('manage_jobs'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Check if user can edit this job
        const user = await User.findById(req.user.userId);
        if (job.company.toString() !== user.company.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this job' });
        }
        
        Object.assign(job, req.body);
        await job.save();
        
        res.json({ message: 'Job updated successfully', job });
    } catch (error) {
        console.error('Job update error:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// Delete job
app.delete('/api/jobs/:id', authenticateToken, requirePermission('manage_jobs'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Check if user can delete this job
        const user = await User.findById(req.user.userId);
        if (job.company.toString() !== user.company.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this job' });
        }
        
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Job deletion error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// ======================
// APPLICATION ROUTES
// ======================

// Apply for a job
app.post('/api/jobs/:jobId/apply', authenticateToken, upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
]), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user.isJobSeeker()) {
            return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
        }
        
        if (!user.canApplyToJob()) {
            return res.status(403).json({ error: 'Insufficient application credits' });
        }
        
        const job = await Job.findById(req.params.jobId);
        if (!job || !job.canAcceptApplications()) {
            return res.status(400).json({ error: 'Job is not accepting applications' });
        }
        
        // Check for duplicate application
        const existingApplication = await Application.findOne({
            job: job._id,
            applicant: user._id
        });
        
        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }
        
        // Process resume
        let resumeId;
        if (req.files.resume) {
            const resumeFile = req.files.resume[0];
            const fileExtension = path.extname(resumeFile.originalname).toLowerCase();
            let extractedText = '';
            
            if (fileExtension === '.pdf') {
                extractedText = await extractTextFromPDF(resumeFile.path);
            } else if (fileExtension === '.docx') {
                extractedText = await extractTextFromDocx(resumeFile.path);
            }
            
            const resume = new Resume({
                filename: resumeFile.originalname,
                filepath: resumeFile.path,
                extractedText: extractedText,
                candidateInfo: JSON.parse(req.body.applicationData || '{}')
            });
            
            await resume.save();
            resumeId = resume._id;
            
            // Add to user's resumes
            user.jobSeekerData.resumes.push(resumeId);
        } else if (req.body.existingResumeId) {
            resumeId = req.body.existingResumeId;
        } else {
            return res.status(400).json({ error: 'Resume is required' });
        }
        
        // Create application
        const application = new Application({
            job: job._id,
            applicant: user._id,
            resume: resumeId,
            applicationData: JSON.parse(req.body.applicationData || '{}'),
            questionnaire: JSON.parse(req.body.questionnaire || '[]'),
            source: req.body.source || 'direct'
        });
        
        // Process cover letter if provided
        if (req.files.coverLetter) {
            const coverLetterFile = req.files.coverLetter[0];
            application.coverLetter = {
                fileName: coverLetterFile.originalname,
                filePath: coverLetterFile.path
            };
        } else if (req.body.coverLetterText) {
            application.coverLetter = {
                content: req.body.coverLetterText
            };
        }
        
        await application.save();
        
        // Auto-screen if enabled
        if (job.screeningSettings.autoScreen) {
            const resume = await Resume.findById(resumeId);
            const screeningResults = await screenResumeWithNLP(resume.extractedText, job.description + ' ' + job.requirements);
            
            const screeningResult = new ScreeningResult({
                resumeId: resumeId,
                jobDescription: job.description + ' ' + job.requirements,
                matchScore: screeningResults.matchScore,
                matchedKeywords: screeningResults.matchedKeywords,
                missingKeywords: screeningResults.missingKeywords,
                recommendations: screeningResults.recommendations,
                entities: screeningResults.entities
            });
            
            await screeningResult.save();
            
            application.screeningResult = screeningResult._id;
            application.matchScore = screeningResults.matchScore;
            application.autoScreened = true;
            
            // Update status based on score
            if (screeningResults.matchScore >= job.screeningSettings.minimumScore) {
                application.status = 'screening';
            }
        }
        
        await application.save();
        
        // Update job application count
        job.currentApplications += 1;
        await job.save();
        
        // Add to user's applications
        user.jobSeekerData.applications.push(application._id);
        
        // Deduct application credit for free users
        if (user.subscription.plan === 'free') {
            user.subscription.applicationCredits -= 1;
        }
        
        await user.save();
        
        res.status(201).json({
            message: 'Application submitted successfully',
            application: await application.populate('job', 'title company')
        });
    } catch (error) {
        console.error('Application error:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Get user's applications
app.get('/api/applications', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = { applicant: req.user.userId };
        
        if (status) query.status = status;
        
        const applications = await Application.find(query)
            .populate('job', 'title company department location employment status')
            .populate({
                path: 'job',
                populate: { path: 'company', select: 'name domain' }
            })
            .sort({ appliedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Application.countDocuments(query);
        
        res.json({
            applications,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalApplications: total
        });
    } catch (error) {
        console.error('Applications fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get applications for a job (company users only)
app.get('/api/jobs/:jobId/applications', authenticateToken, requirePermission('view_all_applications'), async (req, res) => {
    try {
        const { page = 1, limit = 20, status, sortBy = 'appliedAt', sortOrder = 'desc' } = req.query;
        const query = { job: req.params.jobId };
        
        if (status) query.status = status;
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const applications = await Application.find(query)
            .populate('applicant', 'profile email')
            .populate('resume', 'filename extractedText candidateInfo')
            .populate('screeningResult')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Application.countDocuments(query);
        
        res.json({
            applications,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalApplications: total
        });
    } catch (error) {
        console.error('Job applications fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch job applications' });
    }
});

// Update application status
app.put('/api/applications/:id/status', authenticateToken, requirePermission('manage_applications'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        application.status = status;
        
        if (notes) {
            application.notes.push({
                author: req.user.userId,
                content: notes,
                isPrivate: true
            });
        }
        
        await application.save();
        
        res.json({ message: 'Application status updated successfully', application });
    } catch (error) {
        console.error('Application status update error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// ======================
// EXISTING ROUTES (Resume Screening)
// ======================

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

// ATS Integration Routes (existing)
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