const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    extractedText: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    // ATS Integration fields
    atsId: {
        type: String,
        index: true
    },
    atsProvider: {
        type: String,
        enum: ['workday', 'greenhouse', 'lever', 'bamboohr']
    },
    atsStatus: {
        type: String,
        default: 'new'
    },
    atsLastUpdated: {
        type: Date
    },
    // Enhanced candidate fields
    candidateInfo: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        linkedinUrl: String
    },
    // Job application tracking
    appliedJobs: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        atsJobId: String,
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['applied', 'reviewing', 'screening', 'interviewing', 'offered', 'hired', 'rejected'],
            default: 'applied'
        },
        notes: String
    }]
});

// Index for ATS lookups
resumeSchema.index({ atsId: 1, atsProvider: 1 });

module.exports = mongoose.model('Resume', resumeSchema);