<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-5xl mx-auto px-4 py-12">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-3xl font-semibold text-gray-900 mb-3">
          Smart Resume Screening
        </h1>
        <p class="text-base text-gray-600 max-w-2xl mx-auto">
          Upload your resume and job description to get AI-powered match analysis with detailed insights and recommendations
        </p>
        
        <!-- Progress Indicator -->
        <div class="flex items-center justify-center space-x-8 mt-8">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
                 :class="resumeStore.currentResume ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'">
              <svg v-if="resumeStore.currentResume" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else>1</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">Upload Resume</span>
          </div>
          
          <div class="w-8 h-px bg-gray-200"></div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                 :class="resumeStore.jobDescription ? 'bg-gray-900 text-white' : (resumeStore.currentResume ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400')">
              <svg v-if="resumeStore.jobDescription" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else>2</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">Job Description</span>
          </div>
          
          <div class="w-8 h-px bg-gray-200"></div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                 :class="screeningResults ? 'bg-gray-900 text-white' : (canStartScreening ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400')">
              <svg v-if="screeningResults" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else>3</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">Analysis</span>
          </div>
        </div>
      </header>

      <div class="space-y-8">
        <!-- Step 1: Upload Resume -->
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4">
            <div class="flex items-center">
              <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-medium text-gray-600">1</span>
              </div>
              <h2 class="text-lg font-medium text-gray-900">Upload Resume</h2>
            </div>
          </div>
          <div class="p-6">
            <FileUploader />
          </div>
        </div>

        <!-- Step 2: Job Description -->
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4">
            <div class="flex items-center">
              <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-medium text-gray-600">2</span>
              </div>
              <h2 class="text-lg font-medium text-gray-900">Job Description</h2>
            </div>
          </div>
          <div class="p-6">
            <JobInput />
          </div>
        </div>

        <!-- Step 3: Start Screening -->
        <div v-if="canStartScreening" class="bg-white border border-gray-100 rounded-lg shadow-sm fade-in">
          <div class="border-b border-gray-100 px-6 py-4">
            <div class="flex items-center">
              <div class="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-medium text-white">3</span>
              </div>
              <h2 class="text-lg font-medium text-gray-900">Ready to Analyze</h2>
            </div>
          </div>
          
          <div class="p-8 text-center">
            <div class="mb-6">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">All Set!</h3>
              <p class="text-sm text-gray-600 mb-6">Your resume and job description are ready for AI analysis.</p>
            </div>
            
            <!-- Checklist -->
            <div class="bg-gray-50 border border-gray-100 rounded-md p-4 mb-8 text-left max-w-md mx-auto">
              <ul class="space-y-2">
                <li class="flex items-center text-sm">
                  <svg class="w-4 h-4 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">
                    Resume: <span class="font-medium">{{ resumeStore.currentResume?.filename || resumeStore.currentResume?.name }}</span>
                  </span>
                </li>
                <li class="flex items-center text-sm">
                  <svg class="w-4 h-4 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">
                    Job description: <span class="font-medium">{{ jobDescriptionLength }} characters</span>
                  </span>
                </li>
              </ul>
            </div>
            
            <button 
              @click="startScreening"
              :disabled="isScreening"
              class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div v-if="isScreening" class="flex items-center">
                <div class="loading-spinner mr-2"></div>
                Processing Analysis...
              </div>
              <div v-else class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start AI Analysis
              </div>
            </button>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="screeningResults" class="fade-in">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-medium text-gray-900 mb-2">Screening Results</h2>
            <p class="text-sm text-gray-600">Detailed resume analysis and match score</p>
          </div>
          <ResultCard 
            :results="screeningResults" 
            @start-over="handleStartOver"
          />
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="fixed bottom-4 right-4 max-w-sm">
        <div class="bg-red-50 border border-red-100 rounded-md p-4 shadow-lg">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-red-700">{{ error }}</p>
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
.fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>