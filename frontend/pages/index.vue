<template>
  <div class="home-page">
    <div class="container">
      <header class="page-header">
        <h1>🎯 Smart Resume Screening</h1>
        <p>Upload your resume and job description to get an AI-powered match analysis</p>
      </header>

      <div class="upload-section">
        <div class="card">
          <h2>Step 1: Upload Your Resume</h2>
          <FileUploader />
        </div>

        <div class="card">
          <h2>Step 2: Add Job Description</h2>
          <JobInput />
        </div>

        <div class="card" v-if="canStartScreening">
          <div class="screening-actions">
            <div class="screening-info">
              <h3>Ready to Screen!</h3>
              <p>Your resume and job description are ready for analysis.</p>
              <ul class="checklist">
                <li>✅ Resume uploaded: {{ resumeStore.currentResume?.filename }}</li>
                <li>✅ Job description added ({{ jobDescriptionLength }} characters)</li>
              </ul>
            </div>
            
            <button 
              class="btn btn-primary btn-large"
              @click="startScreening"
              :disabled="isScreening"
            >
              <span v-if="!isScreening">Start Screening Analysis</span>
              <span v-else>
                <div class="loading-spinner"></div>
                Processing...
              </span>
            </button>
          </div>
        </div>

        <div class="card" v-if="screeningResults">
          <h2>Screening Results</h2>
          <ResultCard 
            :results="screeningResults" 
            @start-over="handleStartOver"
          />
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useResumeStore } from '~/store/resume'
import FileUploader from '~/components/FileUploader.vue'
import JobInput from '~/components/JobInput.vue'
import ResultCard from '~/components/ResultCard.vue'

// Page metadata
useHead({
  title: 'Smart Resume Screening - AI-Powered Resume Analysis',
  meta: [
    { name: 'description', content: 'Upload your resume and get AI-powered screening results with match scores, keyword analysis, and recommendations.' }
  ]
})

const resumeStore = useResumeStore()

// Computed properties
const canStartScreening = computed(() => resumeStore.canStartScreening)
const isScreening = computed(() => resumeStore.isScreening)
const screeningResults = computed(() => resumeStore.screeningResults)
const error = computed(() => resumeStore.screeningError)

const jobDescriptionLength = computed(() => 
  resumeStore.jobDescription.length
)

// Methods
const startScreening = async () => {
  try {
    await resumeStore.screenResume()
    
    // Navigate to results page if screening is successful
    if (resumeStore.screeningResults) {
      await navigateTo('/result')
    }
  } catch (error) {
    console.error('Screening failed:', error)
  }
}

const handleStartOver = () => {
  resumeStore.clearAll()
}

// Watch for navigation after successful screening
watch(() => resumeStore.screeningResults, (newResults) => {
  if (newResults) {
    // Auto-navigate to results page
    navigateTo('/result')
  }
})

// Clear errors when component mounts
onMounted(() => {
  resumeStore.clearErrors()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 40px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-header h1 {
  font-size: 3rem;
  color: #1f2937;
  margin-bottom: 16px;
  font-weight: 700;
}

.page-header p {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.upload-section {
  max-width: 800px;
  margin: 0 auto;
}

.card h2 {
  margin-bottom: 20px;
  color: #374151;
  font-size: 1.5rem;
}

.screening-actions {
  text-align: center;
}

.screening-info {
  margin-bottom: 24px;
}

.screening-info h3 {
  color: #059669;
  margin-bottom: 8px;
}

.screening-info p {
  color: #6b7280;
  margin-bottom: 16px;
}

.checklist {
  list-style: none;
  padding: 0;
  text-align: left;
  display: inline-block;
}

.checklist li {
  padding: 4px 0;
  color: #374151;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 700;
  min-width: 200px;
}

.btn-large .loading-spinner {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .page-header p {
    font-size: 1.125rem;
  }
  
  .upload-section {
    margin: 0 20px;
  }
}
</style>