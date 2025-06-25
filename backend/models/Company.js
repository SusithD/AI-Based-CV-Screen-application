// Company schema for enterprise accounts
const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true,
        unique: true
    },
    industry: String,
    size: {
        type: String,
        enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    billing: {
        plan: {
            type: String,
            enum: ['starter', 'professional', 'enterprise'],
            default: 'starter'
        },
        maxUsers: {
            type: Number,
            default: 5
        },
        monthlyScreenings: {
            type: Number,
            default: 100
        },
        usedScreenings: {
            type: Number,
            default: 0
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: 'monthly'
        }
    },
    teams: [{
        name: String,
        department: String,
        members: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['admin', 'recruiter', 'hiring_manager', 'viewer'],
                default: 'recruiter'
            },
            permissions: [{
                type: String,
                enum: ['screen_resumes', 'view_analytics', 'manage_jobs', 'manage_team']
            }]
        }]
    }],
    jobPostings: [{
        title: String,
        department: String,
        description: String,
        requirements: String,
        location: String,
        type: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship']
        },
        status: {
            type: String,
            enum: ['active', 'paused', 'closed'],
            default: 'active'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        applicants: [{
            resumeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Resume'
            },
            screeningResultId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ScreeningResult'
            },
            status: {
                type: String,
                enum: ['new', 'screening', 'shortlisted', 'interviewed', 'rejected', 'hired'],
                default: 'new'
            },
            appliedAt: {
                type: Date,
                default: Date.now
            },
            notes: String
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        autoScreening: {
            type: Boolean,
            default: false
        },
        minimumScore: {
            type: Number,
            default: 60
        },
        customBranding: {
            logo: String,
            primaryColor: String,
            secondaryColor: String
        },
        integrations: {
            slack: {
                enabled: Boolean,
                webhookUrl: String
            },
            email: {
                enabled: Boolean,
                smtpConfig: Object
            },
            ats: {
                provider: String,
                apiKey: String,
                enabled: Boolean
            }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Company', companySchema);