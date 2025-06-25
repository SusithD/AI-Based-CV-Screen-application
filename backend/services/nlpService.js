const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

// Keywords that commonly appear in job descriptions and resumes
const SKILL_KEYWORDS = [
    'javascript', 'python', 'java', 'react', 'node.js', 'express', 'mongodb', 'sql',
    'html', 'css', 'typescript', 'vue', 'angular', 'docker', 'kubernetes', 'aws',
    'azure', 'git', 'agile', 'scrum', 'rest', 'api', 'microservices', 'devops',
    'machine learning', 'data science', 'artificial intelligence', 'deep learning'
];

// Enhanced NLP models and analysis capabilities
const ENHANCED_SKILL_KEYWORDS = {
  // Technical Skills by Category
  frontend: ['react', 'vue', 'angular', 'typescript', 'javascript', 'html', 'css', 'sass', 'tailwind'],
  backend: ['node.js', 'python', 'java', 'c#', 'go', 'rust', 'express', 'fastapi', 'spring'],
  database: ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'dynamodb'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'serverless'],
  devops: ['ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'monitoring', 'logging'],
  mobile: ['react native', 'flutter', 'swift', 'kotlin', 'xamarin'],
  ai_ml: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn'],
  // Soft Skills
  leadership: ['team lead', 'project management', 'mentoring', 'cross-functional'],
  communication: ['presentation', 'documentation', 'stakeholder management'],
  // Industry Certifications
  certifications: ['aws certified', 'azure certified', 'google cloud', 'cissp', 'pmp']
};

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

        // 5. Calculate ATS score
        const atsScore = await calculateATSScore(resumeText, jobDescription);

        // 6. Perform industry analysis
        const industryAnalysis = await performIndustryAnalysis(resumeText, jobDescription);

        return {
            matchScore: Math.round(similarityScore * 100),
            matchedKeywords: keywordAnalysis.matched,
            missingKeywords: keywordAnalysis.missing,
            recommendations: recommendations,
            entities: {
                resume: resumeEntities,
                job: jobEntities
            },
            atsScore: atsScore,
            industryAnalysis: industryAnalysis
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

// Advanced ATS scoring algorithm
async function calculateATSScore(resumeText, jobDescription) {
  const scores = {
    keywordMatch: 0,
    formatOptimization: 0,
    contentStructure: 0,
    experienceAlignment: 0,
    overall: 0
  };

  // Keyword density analysis
  scores.keywordMatch = analyzeKeywordDensity(resumeText, jobDescription);
  
  // ATS-friendly format check
  scores.formatOptimization = checkATSCompatibility(resumeText);
  
  // Content structure analysis
  scores.contentStructure = analyzeContentStructure(resumeText);
  
  // Experience level alignment
  scores.experienceAlignment = analyzeExperienceAlignment(resumeText, jobDescription);
  
  scores.overall = Math.round(
    (scores.keywordMatch * 0.4 + 
     scores.formatOptimization * 0.2 + 
     scores.contentStructure * 0.2 + 
     scores.experienceAlignment * 0.2)
  );
  
  return scores;
}

// Industry-specific analysis
async function performIndustryAnalysis(resumeText, jobDescription) {
  const industries = {
    tech: ['software', 'technology', 'startup', 'saas', 'fintech'],
    finance: ['banking', 'investment', 'financial', 'trading', 'insurance'],
    healthcare: ['medical', 'healthcare', 'pharmaceutical', 'biotech'],
    consulting: ['consulting', 'advisory', 'strategy', 'management'],
    retail: ['retail', 'e-commerce', 'consumer', 'brand']
  };
  
  // Detect industry from job description
  const detectedIndustry = detectIndustry(jobDescription, industries);
  
  // Provide industry-specific recommendations
  const recommendations = generateIndustryRecommendations(resumeText, detectedIndustry);
  
  return { detectedIndustry, recommendations };
}

// Helper function implementations
function analyzeKeywordDensity(resumeText, jobDescription) {
  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const jobWords = jobDescription.toLowerCase().split(/\s+/);
  
  // Calculate keyword density and return score out of 100
  const commonWords = resumeWords.filter(word => jobWords.includes(word));
  return Math.round((commonWords.length / jobWords.length) * 100);
}

function checkATSCompatibility(resumeText) {
  let score = 100;
  
  // Check for common ATS-unfriendly elements
  if (resumeText.includes('│') || resumeText.includes('┌')) score -= 20; // Table borders
  if (resumeText.length < 500) score -= 30; // Too short
  if (resumeText.length > 5000) score -= 10; // Too long
  
  return Math.max(0, score);
}

function analyzeContentStructure(resumeText) {
  let score = 0;
  
  // Check for key sections
  if (/experience|work history/i.test(resumeText)) score += 25;
  if (/education|degree|university/i.test(resumeText)) score += 25;
  if (/skills|technologies/i.test(resumeText)) score += 25;
  if (/contact|email|phone/i.test(resumeText)) score += 25;
  
  return score;
}

function analyzeExperienceAlignment(resumeText, jobDescription) {
  const experienceKeywords = ['years', 'experience', 'senior', 'lead', 'manager', 'director'];
  const resumeExp = experienceKeywords.filter(keyword => 
    resumeText.toLowerCase().includes(keyword)
  ).length;
  const jobExp = experienceKeywords.filter(keyword => 
    jobDescription.toLowerCase().includes(keyword)
  ).length;
  
  return Math.min(100, (resumeExp / Math.max(1, jobExp)) * 100);
}

function detectIndustry(jobDescription, industries) {
  const jobLower = jobDescription.toLowerCase();
  
  for (const [industry, keywords] of Object.entries(industries)) {
    const matches = keywords.filter(keyword => jobLower.includes(keyword)).length;
    if (matches > 0) {
      return industry;
    }
  }
  
  return 'general';
}

function generateIndustryRecommendations(resumeText, industry) {
  const recommendations = [];
  
  switch (industry) {
    case 'tech':
      recommendations.push('Highlight technical skills and programming languages');
      recommendations.push('Include GitHub profile or portfolio links');
      break;
    case 'finance':
      recommendations.push('Emphasize analytical and quantitative skills');
      recommendations.push('Include relevant certifications (CFA, FRM, etc.)');
      break;
    case 'healthcare':
      recommendations.push('Highlight clinical experience and certifications');
      recommendations.push('Emphasize patient care and safety protocols');
      break;
    default:
      recommendations.push('Tailor your resume to match industry-specific keywords');
  }
  
  return recommendations;
}

module.exports = { screenResumeWithNLP };