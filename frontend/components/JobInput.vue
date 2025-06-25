<template>
  <div class="w-full max-w-4xl mx-auto">
    <div class="bg-white border border-gray-100 rounded-lg shadow-sm">
      <!-- Header -->
      <div class="border-b border-gray-100 px-6 py-4">
        <h2 class="text-lg font-medium text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Job Description
        </h2>
        <p class="text-sm text-gray-600 mt-1">
          Paste the job requirements to match against the resume
        </p>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2" for="job-description">
            Job Requirements & Description
          </label>
          <div class="relative">
            <textarea
              id="job-description"
              v-model="localJobDescription"
              class="w-full px-3 py-3 border rounded-md shadow-sm resize-none transition-colors"
              :class="{
                'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400': error,
                'border-green-300 focus:border-green-400 focus:ring-1 focus:ring-green-400': isSaved && !error,
                'border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400': !error && !isSaved
              }"
              placeholder="Paste the complete job description here including:
• Required skills and qualifications
• Job responsibilities  
• Experience requirements
• Education requirements
• Specific technologies or tools..."
              rows="12"
              @input="handleInput"
            ></textarea>
            
            <!-- Character limit indicator -->
            <div class="absolute bottom-2 right-2">
              <div class="bg-white px-2 py-1 text-xs rounded border" 
                   :class="{
                     'text-red-600 border-red-200': characterCount > 4500,
                     'text-yellow-600 border-yellow-200': characterCount > 4000 && characterCount <= 4500,
                     'text-gray-500 border-gray-200': characterCount <= 4000
                   }">
                {{ characterCount }}/5000
              </div>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div class="flex items-center space-x-4">
              <span>{{ wordCount }} words</span>
              <span>{{ characterCount }} characters</span>
            </div>
            
            <!-- Auto-save indicator -->
            <div v-if="isSaved" class="flex items-center text-green-600 fade-in">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xs">Saved</span>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-100 rounded-md">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button 
            @click="clearInput"
            :disabled="!localJobDescription.trim().length"
            class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
          
          <button 
            @click="saveJobDescription"
            :disabled="!localJobDescription.trim().length"
            class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Save Job Description
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="isSaved" class="mt-4 p-3 bg-green-50 border border-green-100 rounded-md fade-in">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-green-700">Job description saved successfully</p>
          </div>
        </div>

        <!-- Tips -->
        <div class="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-md">
          <div class="flex items-start">
            <svg class="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-1">Tips for better matching</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Include specific technical skills and tools</li>
                <li>• Add required experience levels and education</li>
                <li>• Mention key responsibilities and job duties</li>
                <li>• Include industry-specific requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useResumeStore } from '~/store/resume'

const resumeStore = useResumeStore()

const localJobDescription = ref('')
const isSaved = ref(false)
const error = ref('')

// Computed properties
const characterCount = computed(() => localJobDescription.value.length)
const wordCount = computed(() => {
  const words = localJobDescription.value.trim().split(/\s+/)
  return localJobDescription.value.trim() ? words.length : 0
})

// Initialize with store value
localJobDescription.value = resumeStore.jobDescription

// Watch for changes in store
watch(() => resumeStore.jobDescription, (newValue) => {
  if (newValue !== localJobDescription.value) {
    localJobDescription.value = newValue
  }
})

// Methods
const handleInput = () => {
  error.value = ''
  isSaved.value = false
  
  if (localJobDescription.value.length > 5000) {
    error.value = 'Job description is too long. Please keep it under 5000 characters.'
  }
}

const clearInput = () => {
  localJobDescription.value = ''
  error.value = ''
  isSaved.value = false
}

const saveJobDescription = () => {
  if (!localJobDescription.value.trim()) {
    error.value = 'Please enter a job description'
    return
  }

  if (localJobDescription.value.length > 5000) {
    error.value = 'Job description is too long. Please keep it under 5000 characters.'
    return
  }

  resumeStore.setJobDescription(localJobDescription.value.trim())
  isSaved.value = true
  error.value = ''

  // Hide success message after 3 seconds
  setTimeout(() => {
    isSaved.value = false
  }, 3000)
}

// Auto-save functionality (optional - saves after user stops typing for 2 seconds)
let autoSaveTimeout = null
watch(localJobDescription, () => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  
  autoSaveTimeout = setTimeout(() => {
    if (localJobDescription.value.trim() && 
        localJobDescription.value !== resumeStore.jobDescription) {
      saveJobDescription()
    }
  }, 2000)
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fade-in 0.3s ease-out;
}

.job-input {
  margin-bottom: 24px;
}

.input-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

.char-count {
  color: #6b7280;
}

.word-count {
  color: #6b7280;
}

.job-input-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.job-input-actions .btn {
  flex: 1;
}

@media (max-width: 640px) {
  .job-input-actions {
    flex-direction: column;
  }
  
  .job-input-actions .btn {
    width: 100%;
  }
}
</style>