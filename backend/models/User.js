// User schema for individual accounts
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
    profile: {
        firstName: String,
        lastName: String,
        location: String,
        industry: String,
        experienceLevel: {
            type: String,
            enum: ['entry', 'mid', 'senior', 'executive']
        },
        targetRoles: [String],
        linkedinUrl: String
    },
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
        expiresAt: Date
    },
    resumes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    }],
    screeningHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScreeningResult'
    }],
    savedJobs: [{
        title: String,
        company: String,
        url: String,
        description: String,
        savedAt: {
            type: Date,
            default: Date.now
        }
    }],
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        weeklyReports: {
            type: Boolean,
            default: false
        },
        industryInsights: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: Date
});

module.exports = mongoose.model('User', userSchema);