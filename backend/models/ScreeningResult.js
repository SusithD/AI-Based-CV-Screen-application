const mongoose = require('mongoose');

const screeningResultSchema = new mongoose.Schema({
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    matchedKeywords: [{
        type: String
    }],
    missingKeywords: [{
        type: String
    }],
    recommendations: [{
        type: String
    }],
    entities: {
        skills: [String],
        companies: [String],
        locations: [String],
        educations: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ScreeningResult', screeningResultSchema);