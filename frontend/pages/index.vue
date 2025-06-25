<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="container mx-auto px-4 py-12">
      <!-- Header -->
      <header class="text-center mb-16">
        <div class="mb-8">
          <h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🎯 Smart Resume Screening
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your resume and job description to get an AI-powered match analysis with detailed insights and recommendations
          </p>
        </div>
        
        <!-- Progress Indicator -->
        <div class="flex items-center justify-center space-x-4 mb-8">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                 :class="resumeStore.currentResume ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'">
              <svg v-if="resumeStore.currentResume" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="text-sm font-bold">1</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-600">Upload Resume</span>
          </div>
          
          <div class="w-8 h-0.5 bg-gray-300"></div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center"
                 :class="resumeStore.jobDescription ? 'bg-green-500 text-white' : (resumeStore.currentResume ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500')">
              <svg v-if="resumeStore.jobDescription" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="text-sm font-bold">2</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-600">Job Description</span>
          </div>
          
          <div class="w-8 h-0.5 bg-gray-300"></div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center"
                 :class="screeningResults ? 'bg-green-500 text-white' : (canStartScreening ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500')">
              <svg v-if="screeningResults" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="text-sm font-bold">3</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-600">Analysis</span>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Step 1: Upload Resume -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold">1</span>
              </div>
              <h2 class="text-xl font-bold text-white">Upload Your Resume</h2>
            </div>
          </div>
          <div class="p-6">
            <FileUploader />
          </div>
        </div>

        <!-- Step 2: Job Description -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold">2</span>
              </div>
              <h2 class="text-xl font-bold text-white">Add Job Description</h2>
            </div>
          </div>
          <div class="p-6">
            <JobInput />
          </div>
        </div>

        <!-- Step 3: Start Screening -->
        <div v-if="canStartScreening" class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
          <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold">3</span>
              </div>
              <h2 class="text-xl font-bold text-white">Ready to Screen!</h2>
            </div>
          </div>
          
          <div class="p-8 text-center">
            <div class="mb-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">All Set!</h3>
              <p class="text-gray-600 mb-6">Your resume and job description are ready for AI analysis.</p>
            </div>
            
            <!-- Checklist -->
            <div class="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
              <ul class="space-y-3">
                <li class="flex items-center text-sm">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">
                    Resume uploaded: <span class="font-medium">{{ resumeStore.currentResume?.filename || resumeStore.currentResume?.name }}</span>
                  </span>
                </li>
                <li class="flex items-center text-sm">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">
                    Job description added: <span class="font-medium">{{ jobDescriptionLength }} characters</span>
                  </span>
                </li>
              </ul>
            </div>
            
            <button 
              @click="startScreening"
              :disabled="isScreening"
              class="inline-flex items-center px-8 py-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <div v-if="isScreening" class="flex items-center">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Processing Analysis...
              </div>
              <div v-else class="flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start AI Screening Analysis
              </div>
            </button>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="screeningResults" class="animate-fade-in">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">📊 Screening Results</h2>
            <p class="text-gray-600">Here's your detailed resume analysis and match score</p>
          </div>
          <ResultCard 
            :results="screeningResults" 
            @start-over="handleStartOver"
          />
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="fixed bottom-4 right-4 max-w-md">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-red-800 font-medium">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useResumeStore } from '~/store/resume'
import FileUploader from '~/components/FileUploader.vue'
import JobInput from '~/components/JobInput.vue'
import ResultCard from '~/components/ResultCard.vue'

// Page metadata using Nuxt 3's built-in useHead
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
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

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