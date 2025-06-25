<template>
  <div class="w-full max-w-6xl mx-auto">
    <div v-if="results" class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <!-- Header with Score -->
      <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-center">
        <div class="mb-4">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white bg-opacity-20 backdrop-blur-sm">
            <div class="text-3xl font-bold text-white" :class="scoreClass">
              {{ results.matchScore }}%
            </div>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Resume Match Score</h2>
        <p class="text-emerald-100 text-lg">{{ getScoreDescription() }}</p>
      </div>

      <div class="p-6 space-y-8">
        <!-- Keywords Analysis -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Matched Keywords -->
          <div v-if="results.matchedKeywords?.length" class="bg-green-50 rounded-xl p-6 border border-green-200">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-green-800">Matched Skills</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="keyword in results.matchedKeywords" 
                :key="keyword"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
              >
                {{ keyword }}
              </span>
            </div>
          </div>

          <!-- Missing Keywords -->
          <div v-if="results.missingKeywords?.length" class="bg-red-50 rounded-xl p-6 border border-red-200">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-red-800">Missing Skills</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="keyword in results.missingKeywords" 
                :key="keyword"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200"
              >
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="results.recommendations?.length" class="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-blue-800">Recommendations</h3>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(recommendation, index) in results.recommendations" 
              :key="index"
              class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-100"
            >
              <div class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {{ index + 1 }}
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">{{ recommendation }}</p>
            </div>
          </div>
        </div>

        <!-- Entity Analysis -->
        <div v-if="results.entities" class="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div class="flex items-center mb-6">
            <div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Analysis Details</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="results.entities.resume?.skills?.length" class="bg-white rounded-lg p-4 border border-gray-200">
              <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Technical Skills Found
              </h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="skill in results.entities.resume.skills.slice(0, 10)" 
                  :key="skill"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <div v-if="results.entities.resume?.companies?.length" class="bg-white rounded-lg p-4 border border-gray-200">
              <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Companies Mentioned
              </h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="company in results.entities.resume.companies.slice(0, 5)" 
                  :key="company"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {{ company }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button 
            @click="$emit('startOver')"
            class="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Screen Another Resume
          </button>
          
          <button 
            @click="exportResults"
            class="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Results
          </button>
        </div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else class="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
      <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-3">No Results Available</h3>
      <p class="text-gray-600 max-w-md mx-auto">
        Upload a resume and add a job description to see detailed screening results and matching analysis.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  results: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['startOver'])

// Computed properties
const scoreClass = computed(() => {
  if (!props.results) return ''
  const score = props.results.matchScore
  if (score >= 70) return 'score-excellent'
  if (score >= 40) return 'score-good'
  return 'score-poor'
})

// Methods
const getScoreDescription = () => {
  if (!props.results) return ''
  const score = props.results.matchScore
  
  if (score >= 90) return 'Excellent match! Highly recommended candidate.'
  if (score >= 70) return 'Strong match with good alignment to requirements.'
  if (score >= 50) return 'Moderate match with some relevant experience.'
  if (score >= 30) return 'Limited match. Consider developing missing skills.'
  return 'Poor match. Significant skill gaps identified.'
}

const exportResults = () => {
  if (!props.results) return

  const exportData = {
    matchScore: props.results.matchScore,
    matchedKeywords: props.results.matchedKeywords,
    missingKeywords: props.results.missingKeywords,
    recommendations: props.results.recommendations,
    timestamp: new Date().toISOString(),
    analysis: 'Resume Screening Results'
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `resume-screening-results-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  // Also create a readable text version
  const textResults = `
RESUME SCREENING RESULTS
========================

Match Score: ${props.results.matchScore}%
Generated: ${new Date().toLocaleString()}

MATCHED SKILLS:
${props.results.matchedKeywords?.map(k => `• ${k}`).join('\n') || 'None'}

MISSING SKILLS:
${props.results.missingKeywords?.map(k => `• ${k}`).join('\n') || 'None'}

RECOMMENDATIONS:
${props.results.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'None'}
  `.trim()

  const textBlob = new Blob([textResults], { type: 'text/plain' })
  const textLink = document.createElement('a')
  textLink.href = URL.createObjectURL(textBlob)
  textLink.download = `resume-screening-results-${new Date().toISOString().split('T')[0]}.txt`
  textLink.click()
}
</script>

<style scoped>
.result-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.results-content {
  padding: 24px;
}

.score-section {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.score-section h3 {
  margin-bottom: 8px;
  color: #374151;
}

.score-description {
  color: #6b7280;
  font-style: italic;
}

.keywords-section {
  margin-bottom: 32px;
}

.matched-keywords,
.missing-keywords {
  margin-bottom: 24px;
}

.keywords-section h4 {
  margin-bottom: 12px;
  color: #374151;
  font-size: 18px;
}

.recommendations-section {
  margin-bottom: 32px;
}

.recommendations-section h4 {
  margin-bottom: 12px;
  color: #374151;
  font-size: 18px;
}

.recommendations ul {
  list-style: none;
  padding: 0;
}

.recommendations li {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
}

.recommendations li:last-child {
  border-bottom: none;
}

.entities-section {
  margin-bottom: 32px;
}

.entities-section h4 {
  margin-bottom: 16px;
  color: #374151;
  font-size: 18px;
}

.entities-grid {
  display: grid;
  gap: 20px;
}

.entity-group h5 {
  margin-bottom: 8px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
}

.result-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.result-actions .btn {
  flex: 1;
}

.no-results {
  padding: 60px 24px;
  text-align: center;
  color: #6b7280;
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-results h3 {
  margin-bottom: 8px;
  color: #374151;
}

@media (max-width: 640px) {
  .result-actions {
    flex-direction: column;
  }
  
  .entities-grid {
    grid-template-columns: 1fr;
  }
}
</style>