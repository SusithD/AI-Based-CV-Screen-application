<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-5xl mx-auto px-4 py-12">
      <!-- Header -->
      <header class="mb-8">
        <button 
          @click="goHome"
          class="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
        
        <div class="text-center">
          <h1 class="text-3xl font-semibold text-gray-900 mb-3">
            Screening Results
          </h1>
          <p class="text-base text-gray-600">
            Detailed analysis of how your resume matches the job requirements
          </p>
        </div>
      </header>

      <div v-if="screeningResults" class="space-y-8">
        <!-- Main Results Card -->
        <ResultCard 
          :results="screeningResults" 
          @start-over="handleStartOver"
        />

        <!-- Additional Analysis Section -->
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4">
            <h2 class="text-lg font-medium text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Detailed Analysis
            </h2>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Resume Summary -->
              <div class="lg:col-span-2">
                <h3 class="text-sm font-medium text-gray-700 mb-3">Resume Summary</h3>
                <div class="bg-gray-50 border border-gray-100 rounded-md p-4">
                  <div class="text-sm text-gray-700 leading-relaxed">
                    {{ extractedTextPreview }}
                  </div>
                  <button 
                    v-if="extractedText && extractedText.length > 300"
                    @click="toggleFullText"
                    class="mt-3 text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    {{ showFullText ? 'Show Less' : 'Show More' }}
                  </button>
                </div>
              </div>

              <!-- Job Analysis Stats -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-3">Match Statistics</h3>
                <div class="space-y-3">
                  <div class="bg-gray-50 border border-gray-100 rounded-md p-3">
                    <div class="text-xs text-gray-500 mb-1">Total Skills Required</div>
                    <div class="text-lg font-medium text-gray-900">{{ totalRequiredSkills }}</div>
                  </div>
                  <div class="bg-green-50 border border-green-100 rounded-md p-3">
                    <div class="text-xs text-green-600 mb-1">Skills Matched</div>
                    <div class="text-lg font-medium text-green-900">{{ matchedSkillsCount }} ({{ matchPercentage }}%)</div>
                  </div>
                  <div class="bg-red-50 border border-red-100 rounded-md p-3">
                    <div class="text-xs text-red-600 mb-1">Skills Missing</div>
                    <div class="text-lg font-medium text-red-900">{{ missingSkillsCount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps Section -->
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4">
            <h2 class="text-lg font-medium text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Recommendations
            </h2>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Primary Recommendation -->
              <div class="p-4 rounded-md border" :class="primaryRecommendationClass">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3" :class="primaryIconClass">
                    <span class="text-sm">{{ primaryIcon }}</span>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium mb-2" :class="primaryTextClass">{{ primaryTitle }}</h4>
                    <p class="text-sm" :class="primaryDescClass">{{ primaryDescription }}</p>
                  </div>
                </div>
              </div>

              <!-- Secondary Recommendation -->
              <div class="p-4 bg-blue-50 border border-blue-100 rounded-md">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-blue-900 mb-2">Tailor Your Resume</h4>
                    <p class="text-sm text-blue-700">Customize your resume to include more keywords from the job description for better ATS compatibility.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results State -->
      <div v-else class="bg-white border border-gray-100 rounded-lg shadow-sm p-12 text-center">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 class="text-lg font-medium text-gray-900 mb-2">No Results Found</h2>
        <p class="text-sm text-gray-600 mb-6">
          It looks like you haven't completed a resume screening yet.
        </p>
        <button 
          @click="goHome"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Start Resume Screening
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
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

// New computed properties for recommendations
const primaryRecommendationClass = computed(() => {
  if (matchScore.value >= 70) return 'bg-green-50 border-green-100'
  if (matchScore.value >= 40) return 'bg-yellow-50 border-yellow-100'
  return 'bg-red-50 border-red-100'
})

const primaryIconClass = computed(() => {
  if (matchScore.value >= 70) return 'bg-green-100'
  if (matchScore.value >= 40) return 'bg-yellow-100'
  return 'bg-red-100'
})

const primaryTextClass = computed(() => {
  if (matchScore.value >= 70) return 'text-green-900'
  if (matchScore.value >= 40) return 'text-yellow-900'
  return 'text-red-900'
})

const primaryDescClass = computed(() => {
  if (matchScore.value >= 70) return 'text-green-700'
  if (matchScore.value >= 40) return 'text-yellow-700'
  return 'text-red-700'
})

const primaryIcon = computed(() => {
  if (matchScore.value >= 70) return '✅'
  if (matchScore.value >= 40) return '⚠️'
  return '❌'
})

const primaryTitle = computed(() => {
  if (matchScore.value >= 70) return 'Apply Now!'
  if (matchScore.value >= 40) return 'Improve Your Resume'
  return 'Skills Development Needed'
})

const primaryDescription = computed(() => {
  if (matchScore.value >= 70) return 'Your resume shows excellent alignment with this position. Consider applying immediately.'
  if (matchScore.value >= 40) return 'Consider highlighting the missing skills if you have them, or develop them before applying.'
  return 'Significant skill gaps identified. Consider training or targeting different roles.'
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