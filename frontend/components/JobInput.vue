<template>
  <div class="job-input">
    <div class="form-group">
      <label class="form-label" for="job-description">
        Job Description *
      </label>
      <textarea
        id="job-description"
        v-model="localJobDescription"
        class="form-textarea"
        placeholder="Paste the job description here..."
        rows="8"
        @input="handleInput"
      ></textarea>
      <div class="input-info">
        <span class="char-count">{{ characterCount }} characters</span>
        <span class="word-count">{{ wordCount }} words</span>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="job-input-actions">
      <button 
        class="btn btn-secondary" 
        @click="clearInput"
        :disabled="!localJobDescription.trim().length"
      >
        Clear
      </button>
      <button 
        class="btn btn-primary" 
        @click="saveJobDescription"
        :disabled="!localJobDescription.trim().length"
      >
        Save Job Description
      </button>
    </div>

    <div v-if="isSaved" class="success-message">
      Job description saved successfully!
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