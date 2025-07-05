const mongoose = require('mongoose');

// Enhanced User schema for both job seekers and company employees
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['job_seeker', 'company_admin', 'recruiter', 'hiring_manager', 'admin'],
        default: 'job_seeker'
    },
    profile: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        avatar: String,
        phone: String,
        location: {
            city: String,
            country: String,
            timezone: String
        },
        industry: String,
        experienceLevel: {
            type: String,
            enum: ['entry', 'mid', 'senior', 'executive']
        },
        currentJobTitle: String,
        currentCompany: String,
        targetRoles: [String],
        skills: [String],
        linkedinUrl: String,
        portfolioUrl: String,
        githubUrl: String,
        bio: String,
        // Salary expectations
        salaryExpectations: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'USD'
            },
            negotiable: {
                type: Boolean,
                default: true
            }
        },
        // Work preferences
        workPreferences: {
            remoteWork: {
                type: Boolean,
                default: false
            },
            willingToRelocate: {
                type: Boolean,
                default: false
            },
            availableFrom: Date,
            workAuthorization: {
                type: String,
                enum: ['citizen', 'permanent_resident', 'work_visa', 'student_visa', 'other']
            }
        }
    },
    // Company association for company users
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    // Subscription and credits for job seekers
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'pro', 'premium'],
            default: 'free'
        },
        screeningCredits: {
            type: Number,
            default: 3
        },
        applicationCredits: {
            type: Number,
            default: 10
        },
        expiresAt: Date,
        stripeCustomerId: String,
        stripeSubscriptionId: String
    },
    // Job seeker specific data
    jobSeekerData: {
        resumes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resume'
        }],
        applications: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application'
        }],
        savedJobs: [{
            job: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Job'
            },
            savedAt: {
                type: Date,
                default: Date.now
            },
            notes: String
        }],
        jobAlerts: [{
            name: String,
            keywords: [String],
            location: String,
            jobType: String,
            salaryMin: Number,
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly'],
                default: 'weekly'
            },
            isActive: {
                type: Boolean,
                default: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        screeningHistory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScreeningResult'
        }]
    },
    // Company user specific data
    companyUserData: {
        department: String,
        title: String,
        permissions: [{
            type: String,
            enum: [
                'screen_resumes', 
                'view_analytics', 
                'manage_jobs', 
                'manage_team',
                'manage_applications',
                'schedule_interviews',
                'send_offers',
                'view_all_applications',
                'export_data'
            ]
        }],
        managedJobs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        }],
        assignedApplications: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application'
        }]
    },
    // Notification preferences
    notifications: {
        email: {
            newApplications: {
                type: Boolean,
                default: true
            },
            statusUpdates: {
                type: Boolean,
                default: true
            },
            interviewReminders: {
                type: Boolean,
                default: true
            },
            jobAlerts: {
                type: Boolean,
                default: true
            },
            weeklyReports: {
                type: Boolean,
                default: false
            },
            marketing: {
                type: Boolean,
                default: false
            }
        },
        push: {
            enabled: {
                type: Boolean,
                default: false
            },
            deviceTokens: [String]
        },
        sms: {
            enabled: {
                type: Boolean,
                default: false
            },
            phoneNumber: String
        }
    },
    // Authentication and security
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,
    lastLoginAt: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    // Privacy settings
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'companies_only'],
            default: 'companies_only'
        },
        allowRecruiterContact: {
            type: Boolean,
            default: true
        },
        showSalaryExpectations: {
            type: Boolean,
            default: false
        }
    },
    // Activity tracking
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ company: 1, role: 1 });
userSchema.index({ 'profile.industry': 1 });
userSchema.index({ 'profile.experienceLevel': 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
userSchema.methods.isJobSeeker = function() {
    return this.role === 'job_seeker';
};

userSchema.methods.isCompanyUser = function() {
    return ['company_admin', 'recruiter', 'hiring_manager'].includes(this.role);
};

userSchema.methods.hasPermission = function(permission) {
    if (this.role === 'admin' || this.role === 'company_admin') return true;
    return this.companyUserData?.permissions?.includes(permission) || false;
};

userSchema.methods.canApplyToJob = function() {
    if (!this.isJobSeeker()) return false;
    if (this.subscription.plan === 'free') {
        return this.subscription.applicationCredits > 0;
    }
    return true;
};

userSchema.methods.canScreenResume = function() {
    if (this.isCompanyUser()) return true;
    if (this.subscription.plan === 'free') {
        return this.subscription.screeningCredits > 0;
    }
    return true;
};

// Increment failed login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

module.exports = mongoose.model('User', userSchema);