const mongoose = require('mongoose');

// Application schema for tracking job applications
const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    coverLetter: {
        content: String,
        fileName: String,
        filePath: String
    },
    // Application details
    applicationData: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: String,
        linkedinUrl: String,
        portfolioUrl: String,
        currentSalary: Number,
        expectedSalary: Number,
        availableFrom: Date,
        workAuthorization: {
            type: String,
            enum: ['citizen', 'permanent_resident', 'work_visa', 'student_visa', 'other']
        },
        willingToRelocate: {
            type: Boolean,
            default: false
        },
        remoteWork: {
            type: Boolean,
            default: false
        }
    },
    // Questionnaire responses
    questionnaire: [{
        question: String,
        answer: String,
        required: Boolean
    }],
    // Application status tracking
    status: {
        type: String,
        enum: [
            'submitted',
            'under_review',
            'screening',
            'phone_screen',
            'technical_interview',
            'final_interview',
            'background_check',
            'offer_extended',
            'offer_accepted',
            'offer_declined',
            'hired',
            'rejected',
            'withdrawn'
        ],
        default: 'submitted'
    },
    // Screening results
    screeningResult: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScreeningResult'
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    autoScreened: {
        type: Boolean,
        default: false
    },
    // Interview scheduling
    interviews: [{
        type: {
            type: String,
            enum: ['phone', 'video', 'in_person', 'technical', 'panel']
        },
        scheduledAt: Date,
        duration: Number, // in minutes
        interviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        location: String,
        meetingLink: String,
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
            default: 'scheduled'
        },
        feedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            notes: String,
            recommendation: {
                type: String,
                enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire']
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Notes and feedback from recruiters/hiring managers
    notes: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Rating and evaluation
    evaluation: {
        overallRating: {
            type: Number,
            min: 1,
            max: 5
        },
        skillsRating: {
            type: Number,
            min: 1,
            max: 5
        },
        experienceRating: {
            type: Number,
            min: 1,
            max: 5
        },
        cultureFitRating: {
            type: Number,
            min: 1,
            max: 5
        },
        communicationRating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String
    },
    // Communication history
    communications: [{
        type: {
            type: String,
            enum: ['email', 'phone', 'sms', 'in_person']
        },
        direction: {
            type: String,
            enum: ['inbound', 'outbound']
        },
        subject: String,
        content: String,
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sentAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Documents
    documents: [{
        name: String,
        type: {
            type: String,
            enum: ['resume', 'cover_letter', 'portfolio', 'certificate', 'reference', 'other']
        },
        fileName: String,
        filePath: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Timestamps
    appliedAt: {
        type: Date,
        default: Date.now
    },
    lastStatusUpdate: {
        type: Date,
        default: Date.now
    },
    // Source tracking
    source: {
        type: String,
        enum: ['direct', 'linkedin', 'indeed', 'glassdoor', 'referral', 'career_page', 'other'],
        default: 'direct'
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // ATS integration
    atsId: String,
    atsProvider: String,
    atsData: Object
});

// Indexes for performance
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ matchScore: -1 });
applicationSchema.index({ 'applicationData.email': 1 });

// Update lastStatusUpdate when status changes
applicationSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.lastStatusUpdate = new Date();
    }
    next();
});

// Virtual for full name
applicationSchema.virtual('applicantName').get(function() {
    return `${this.applicationData.firstName} ${this.applicationData.lastName}`;
});

// Method to check if application is in active status
applicationSchema.methods.isActive = function() {
    const activeStatuses = ['submitted', 'under_review', 'screening', 'phone_screen', 'technical_interview', 'final_interview', 'background_check'];
    return activeStatuses.includes(this.status);
};

// Method to get latest interview
applicationSchema.methods.getLatestInterview = function() {
    if (!this.interviews || this.interviews.length === 0) return null;
    return this.interviews.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))[0];
};

module.exports = mongoose.model('Application', applicationSchema);