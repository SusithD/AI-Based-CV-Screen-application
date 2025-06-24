<template>
  <div class="result-card">
    <div v-if="results" class="results-content">
      <!-- Match Score Display -->
      <div class="score-section">
        <div class="score-display" :class="scoreClass">
          {{ results.matchScore }}%
        </div>
        <h3>Match Score</h3>
        <p class="score-description">{{ getScoreDescription() }}</p>
      </div>

      <!-- Keywords Analysis -->
      <div class="keywords-section">
        <div class="matched-keywords" v-if="results.matchedKeywords?.length">
          <h4>✅ Matched Skills</h4>
          <div class="keyword-list">
            <span 
              v-for="keyword in results.matchedKeywords" 
              :key="keyword"
              class="keyword-tag keyword-matched"
            >
              {{ keyword }}
            </span>
          </div>
        </div>

        <div class="missing-keywords" v-if="results.missingKeywords?.length">
          <h4>❌ Missing Skills</h4>
          <div class="keyword-list">
            <span 
              v-for="keyword in results.missingKeywords" 
              :key="keyword"
              class="keyword-tag keyword-missing"
            >
              {{ keyword }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="recommendations-section" v-if="results.recommendations?.length">
        <h4>💡 Recommendations</h4>
        <div class="recommendations">
          <ul>
            <li v-for="recommendation in results.recommendations" :key="recommendation">
              {{ recommendation }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Entity Analysis (if available) -->
      <div class="entities-section" v-if="results.entities">
        <h4>📊 Analysis Details</h4>
        <div class="entities-grid">
          <div class="entity-group" v-if="results.entities.resume?.skills?.length">
            <h5>Technical Skills Found</h5>
            <div class="keyword-list">
              <span 
                v-for="skill in results.entities.resume.skills.slice(0, 10)" 
                :key="skill"
                class="keyword-tag"
                style="background-color: #e0f2fe; color: #0277bd;"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <div class="entity-group" v-if="results.entities.resume?.companies?.length">
            <h5>Companies Mentioned</h5>
            <div class="keyword-list">
              <span 
                v-for="company in results.entities.resume.companies.slice(0, 5)" 
                :key="company"
                class="keyword-tag"
                style="background-color: #f3e5f5; color: #7b1fa2;"
              >
                {{ company }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="result-actions">
        <button class="btn btn-secondary" @click="$emit('startOver')">
          Screen Another Resume
        </button>
        <button class="btn btn-primary" @click="exportResults">
          Export Results
        </button>
      </div>
    </div>

    <div v-else class="no-results">
      <div class="no-results-icon">📋</div>
      <h3>No Results Available</h3>
      <p>Upload a resume and add a job description to see screening results.</p>
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