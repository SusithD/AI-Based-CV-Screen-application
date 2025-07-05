const mongoose = require('mongoose');

// Job posting schema for comprehensive job management
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    responsibilities: String,
    qualifications: {
        education: String,
        experience: String,
        skills: [String],
        certifications: [String]
    },
    location: {
        city: String,
        country: String,
        remote: {
            type: Boolean,
            default: false
        },
        hybrid: {
            type: Boolean,
            default: false
        }
    },
    employment: {
        type: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
            required: true
        },
        duration: String, // For contracts/internships
        startDate: Date
    },
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        period: {
            type: String,
            enum: ['hourly', 'monthly', 'yearly'],
            default: 'yearly'
        },
        negotiable: {
            type: Boolean,
            default: false
        }
    },
    benefits: [String],
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'closed', 'expired'],
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'internal'],
        default: 'public'
    },
    applicationDeadline: Date,
    maxApplications: {
        type: Number,
        default: null // null means unlimited
    },
    currentApplications: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // SEO and external posting
    slug: {
        type: String,
        unique: true
    },
    tags: [String],
    externalPostings: [{
        platform: String, // 'linkedin', 'indeed', 'glassdoor', etc.
        url: String,
        postedAt: Date
    }],
    // Analytics
    views: {
        type: Number,
        default: 0
    },
    applicationConversionRate: {
        type: Number,
        default: 0
    },
    // Screening configuration
    screeningSettings: {
        autoScreen: {
            type: Boolean,
            default: false
        },
        minimumScore: {
            type: Number,
            default: 60
        },
        requiredKeywords: [String],
        disqualifyingKeywords: [String]
    }
});

// Indexes for better performance
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ 'location.city': 1, 'location.country': 1 });
jobSchema.index({ 'employment.type': 1 });
jobSchema.index({ tags: 1 });
jobSchema.index({ slug: 1 });
jobSchema.index({ applicationDeadline: 1 });

// Virtual for application count
jobSchema.virtual('applicationCount', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'job',
    count: true
});

// Pre-save middleware to generate slug
jobSchema.pre('save', function(next) {
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title.toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-' + this._id.toString().slice(-6);
    }
    this.updatedAt = new Date();
    next();
});

// Check if application deadline has passed
jobSchema.methods.isExpired = function() {
    return this.applicationDeadline && new Date() > this.applicationDeadline;
};

// Check if job accepts more applications
jobSchema.methods.canAcceptApplications = function() {
    if (this.status !== 'active') return false;
    if (this.isExpired()) return false;
    if (this.maxApplications && this.currentApplications >= this.maxApplications) return false;
    return true;
};

module.exports = mongoose.model('Job', jobSchema);