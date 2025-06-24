const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

// Keywords that commonly appear in job descriptions and resumes
const SKILL_KEYWORDS = [
    'javascript', 'python', 'java', 'react', 'node.js', 'express', 'mongodb', 'sql',
    'html', 'css', 'typescript', 'vue', 'angular', 'docker', 'kubernetes', 'aws',
    'azure', 'git', 'agile', 'scrum', 'rest', 'api', 'microservices', 'devops',
    'machine learning', 'data science', 'artificial intelligence', 'deep learning'
];

async function screenResumeWithNLP(resumeText, jobDescription) {
    try {
        // 1. Extract entities from resume using BERT-NER
        const resumeEntities = await extractEntities(resumeText);
        const jobEntities = await extractEntities(jobDescription);

        // 2. Calculate semantic similarity between resume and job description
        const similarityScore = await calculateSimilarity(resumeText, jobDescription);

        // 3. Perform keyword matching
        const keywordAnalysis = performKeywordMatching(resumeText, jobDescription);

        // 4. Generate recommendations
        const recommendations = generateRecommendations(keywordAnalysis, similarityScore);

        return {
            matchScore: Math.round(similarityScore * 100),
            matchedKeywords: keywordAnalysis.matched,
            missingKeywords: keywordAnalysis.missing,
            recommendations: recommendations,
            entities: {
                resume: resumeEntities,
                job: jobEntities
            }
        };

    } catch (error) {
        console.error('NLP processing error:', error);
        throw new Error('Failed to process resume with NLP models');
    }
}

async function extractEntities(text) {
    try {
        const response = await hf.tokenClassification({
            model: 'dslim/bert-base-NER',
            inputs: text
        });

        const entities = {
            skills: [],
            companies: [],
            locations: [],
            educations: []
        };

        response.forEach(entity => {
            const word = entity.word.replace(/^##/, '');
            
            if (entity.entity_group === 'PER' || entity.entity === 'B-PER') {
                // Skip person names for privacy
            } else if (entity.entity_group === 'ORG' || entity.entity === 'B-ORG') {
                entities.companies.push(word);
            } else if (entity.entity_group === 'LOC' || entity.entity === 'B-LOC') {
                entities.locations.push(word);
            }
        });

        // Extract skills using keyword matching (more reliable for technical skills)
        const skillsFound = SKILL_KEYWORDS.filter(skill => 
            text.toLowerCase().includes(skill.toLowerCase())
        );
        entities.skills = skillsFound;

        return entities;

    } catch (error) {
        console.error('Entity extraction error:', error);
        // Fallback to keyword-based extraction
        return {
            skills: SKILL_KEYWORDS.filter(skill => 
                text.toLowerCase().includes(skill.toLowerCase())
            ),
            companies: [],
            locations: [],
            educations: []
        };
    }
}

async function calculateSimilarity(resumeText, jobDescription) {
    try {
        // Use sentence-transformers for semantic similarity
        const response = await hf.sentenceSimilarity({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: {
                source_sentence: resumeText,
                sentences: [jobDescription]
            }
        });

        return response[0] || 0;

    } catch (error) {
        console.error('Similarity calculation error:', error);
        // Fallback to simple keyword-based similarity
        return calculateKeywordSimilarity(resumeText, jobDescription);
    }
}

function calculateKeywordSimilarity(resumeText, jobDescription) {
    const resumeWords = resumeText.toLowerCase().split(/\s+/);
    const jobWords = jobDescription.toLowerCase().split(/\s+/);
    
    const resumeSet = new Set(resumeWords);
    const jobSet = new Set(jobWords);
    
    const intersection = new Set([...resumeSet].filter(x => jobSet.has(x)));
    const union = new Set([...resumeSet, ...jobSet]);
    
    return intersection.size / union.size;
}

function performKeywordMatching(resumeText, jobDescription) {
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();
    
    const jobSkills = SKILL_KEYWORDS.filter(skill => 
        jobLower.includes(skill.toLowerCase())
    );
    
    const resumeSkills = SKILL_KEYWORDS.filter(skill => 
        resumeLower.includes(skill.toLowerCase())
    );
    
    const matched = jobSkills.filter(skill => resumeSkills.includes(skill));
    const missing = jobSkills.filter(skill => !resumeSkills.includes(skill));
    
    return { matched, missing, jobSkills, resumeSkills };
}

function generateRecommendations(keywordAnalysis, similarityScore) {
    const recommendations = [];
    
    if (similarityScore < 0.3) {
        recommendations.push("Consider tailoring your resume more closely to the job description");
    }
    
    if (keywordAnalysis.missing.length > 0) {
        recommendations.push(`Consider highlighting these missing skills if you have them: ${keywordAnalysis.missing.slice(0, 3).join(', ')}`);
    }
    
    if (keywordAnalysis.matched.length > 0) {
        recommendations.push(`Great match on these skills: ${keywordAnalysis.matched.slice(0, 3).join(', ')}`);
    }
    
    const matchPercentage = (keywordAnalysis.matched.length / keywordAnalysis.jobSkills.length) * 100;
    
    if (matchPercentage > 70) {
        recommendations.push("Excellent skill match! Consider applying for this position.");
    } else if (matchPercentage > 40) {
        recommendations.push("Good skill match. Consider developing the missing skills.");
    } else {
        recommendations.push("Limited skill match. Consider developing more relevant skills or targeting different roles.");
    }
    
    return recommendations;
}

module.exports = { screenResumeWithNLP };