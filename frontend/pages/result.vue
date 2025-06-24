<template>
  <div class="results-page">
    <div class="container">
      <div class="results-header">
        <button class="back-btn" @click="goHome">
          ← Back to Home
        </button>
        <h1>📊 Resume Screening Results</h1>
        <p>Here's how your resume matches the job requirements</p>
      </div>

      <div v-if="screeningResults" class="results-content">
        <ResultCard 
          :results="screeningResults" 
          @start-over="handleStartOver"
        />

        <!-- Additional Analysis Section -->
        <div class="card additional-analysis">
          <h2>📈 Detailed Analysis</h2>
          
          <div class="analysis-grid">
            <div class="analysis-item">
              <h4>Resume Summary</h4>
              <div class="summary-text">
                {{ extractedTextPreview }}
                <button v-if="showFullText" class="btn-link" @click="toggleFullText">
                  Show Less
                </button>
                <button v-else class="btn-link" @click="toggleFullText">
                  Show More
                </button>
              </div>
            </div>

            <div class="analysis-item">
              <h4>Job Requirements Analysis</h4>
              <div class="job-analysis">
                <p><strong>Total Skills Required:</strong> {{ totalRequiredSkills }}</p>
                <p><strong>Skills Matched:</strong> {{ matchedSkillsCount }} ({{ matchPercentage }}%)</p>
                <p><strong>Skills Missing:</strong> {{ missingSkillsCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps Section -->
        <div class="card next-steps">
          <h2>🎯 Next Steps</h2>
          <div class="steps-grid">
            <div class="step-card" v-if="matchScore >= 70">
              <div class="step-icon success">✅</div>
              <div class="step-content">
                <h4>Apply Now!</h4>
                <p>Your resume shows excellent alignment with this position. Consider applying immediately.</p>
              </div>
            </div>
            
            <div class="step-card" v-else-if="matchScore >= 40">
              <div class="step-icon warning">⚠️</div>
              <div class="step-content">
                <h4>Improve Your Resume</h4>
                <p>Consider highlighting the missing skills if you have them, or develop them before applying.</p>
              </div>
            </div>
            
            <div class="step-card" v-else>
              <div class="step-icon danger">❌</div>
              <div class="step-content">
                <h4>Skills Development</h4>
                <p>Significant skill gaps identified. Consider training or targeting different roles.</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-icon info">📝</div>
              <div class="step-content">
                <h4>Tailor Your Resume</h4>
                <p>Customize your resume to include more keywords from the job description.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-results">
        <div class="no-results-content">
          <div class="no-results-icon">🔍</div>
          <h2>No Results Found</h2>
          <p>It looks like you haven't completed a resume screening yet.</p>
          <button class="btn btn-primary" @click="goHome">
            Start Resume Screening
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '~/store/resume'
import ResultCard from '~/components/ResultCard.vue'

// Page metadata
useHead({
  title: 'Resume Screening Results - Smart Resume Screening',
  meta: [
    { name: 'description', content: 'View your AI-powered resume screening results with match scores, keyword analysis, and personalized recommendations.' }
  ]
})

const resumeStore = useResumeStore()
const router = useRouter()

const showFullText = ref(false)

// Computed properties
const screeningResults = computed(() => resumeStore.screeningResults)
const matchScore = computed(() => screeningResults.value?.matchScore || 0)
const extractedText = computed(() => resumeStore.extractedText)

const extractedTextPreview = computed(() => {
  if (!extractedText.value) return 'No resume text available'
  if (showFullText.value) return extractedText.value
  return extractedText.value.substring(0, 300) + (extractedText.value.length > 300 ? '...' : '')
})

const totalRequiredSkills = computed(() => {
  if (!screeningResults.value) return 0
  return (screeningResults.value.matchedKeywords?.length || 0) + 
         (screeningResults.value.missingKeywords?.length || 0)
})

const matchedSkillsCount = computed(() => 
  screeningResults.value?.matchedKeywords?.length || 0
)

const missingSkillsCount = computed(() => 
  screeningResults.value?.missingKeywords?.length || 0
)

const matchPercentage = computed(() => {
  if (totalRequiredSkills.value === 0) return 0
  return Math.round((matchedSkillsCount.value / totalRequiredSkills.value) * 100)
})

// Methods
const goHome = () => {
  navigateTo('/')
}

const handleStartOver = () => {
  resumeStore.clearAll()
  navigateTo('/')
}

const toggleFullText = () => {
  showFullText.value = !showFullText.value
}

// Navigation guard - redirect if no results
onMounted(() => {
  if (!screeningResults.value) {
    // Check if we can get results from URL params or redirect to home
    const route = useRoute()
    if (route.query.id) {
      // Try to fetch results by ID
      resumeStore.getResults(route.query.id)
    } else {
      navigateTo('/')
    }
  }
})
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  padding: 40px 0;
}

.results-header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #374151;
}

.results-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 16px;
  font-weight: 700;
}

.results-header p {
  font-size: 1.25rem;
  color: #6b7280;
}

.results-content {
  max-width: 900px;
  margin: 0 auto;
}

.additional-analysis {
  margin-top: 32px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-top: 24px;
}

.analysis-item h4 {
  margin-bottom: 16px;
  color: #374151;
  font-size: 1.1rem;
}

.summary-text {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-wrap;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 8px;
  font-size: 14px;
}

.btn-link:hover {
  color: #2563eb;
}

.job-analysis p {
  margin-bottom: 8px;
  color: #4b5563;
}

.next-steps {
  margin-top: 32px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.step-icon.success {
  background: #d1fae5;
  color: #065f46;
}

.step-icon.warning {
  background: #fef3c7;
  color: #92400e;
}

.step-icon.danger {
  background: #fee2e2;
  color: #991b1b;
}

.step-icon.info {
  background: #dbeafe;
  color: #1e40af;
}

.step-content h4 {
  margin-bottom: 8px;
  color: #374151;
  font-size: 1rem;
}

.step-content p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.no-results-content {
  text-align: center;
  max-width: 400px;
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.no-results-content h2 {
  margin-bottom: 16px;
  color: #374151;
}

.no-results-content p {
  margin-bottom: 24px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .results-header h1 {
    font-size: 2rem;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
  }
  
  .back-btn {
    position: static;
    margin-bottom: 16px;
  }
}
</style>