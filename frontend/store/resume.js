import { defineStore } from 'pinia'
import { useApiService } from '~/services/api'

export const useResumeStore = defineStore('resume', {
  state: () => ({
    // Current resume data
    currentResume: null,
    resumeId: null,
    extractedText: '',
    
    // Job description
    jobDescription: '',
    
    // Screening results
    screeningResults: null,
    resultId: null,
    
    // UI state
    isUploading: false,
    isScreening: false,
    uploadProgress: 0,
    screeningProgress: 0,
    
    // Error handling
    error: null,
    uploadError: null,
    screeningError: null
  }),

  getters: {
    hasResume: (state) => !!state.resumeId,
    hasJobDescription: (state) => state.jobDescription.trim().length > 0,
    hasResults: (state) => !!state.screeningResults,
    canStartScreening: (state) => state.hasResume && state.hasJobDescription && !state.isScreening,
    
    matchScoreClass: (state) => {
      if (!state.screeningResults) return ''
      const score = state.screeningResults.matchScore
      if (score >= 70) return 'score-excellent'
      if (score >= 40) return 'score-good'
      return 'score-poor'
    }
  },

  actions: {
    // Upload resume file
    async uploadResume(file) {
      this.isUploading = true
      this.uploadError = null
      this.uploadProgress = 0

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += 10
          }
        }, 200)

        const apiService = useApiService()
        const result = await apiService.uploadResume(file)
        
        clearInterval(progressInterval)
        this.uploadProgress = 100

        this.resumeId = result.resumeId
        this.extractedText = result.text
        this.currentResume = {
          file,
          filename: file.name,
          size: file.size,
          type: file.type
        }

        // Reset previous results when new resume is uploaded
        this.clearResults()

      } catch (error) {
        this.uploadError = error.message || 'Failed to upload resume'
        console.error('Upload error:', error)
      } finally {
        this.isUploading = false
        setTimeout(() => {
          this.uploadProgress = 0
        }, 1000)
      }
    },

    // Screen resume against job description
    async screenResume() {
      if (!this.canStartScreening) return

      this.isScreening = true
      this.screeningError = null
      this.screeningProgress = 0

      try {
        // Simulate screening progress
        const progressInterval = setInterval(() => {
          if (this.screeningProgress < 90) {
            this.screeningProgress += 15
          }
        }, 500)

        const apiService = useApiService()
        const result = await apiService.screenResume(this.resumeId, this.jobDescription)
        
        clearInterval(progressInterval)
        this.screeningProgress = 100

        this.screeningResults = result
        this.resultId = result.resultId

      } catch (error) {
        this.screeningError = error.message || 'Failed to screen resume'
        console.error('Screening error:', error)
      } finally {
        this.isScreening = false
        setTimeout(() => {
          this.screeningProgress = 0
        }, 1000)
      }
    },

    // Get results by ID
    async getResults(resultId) {
      try {
        const apiService = useApiService()
        const result = await apiService.getResults(resultId)
        this.screeningResults = result
        this.resultId = resultId
        return result
      } catch (error) {
        this.error = error.message || 'Failed to fetch results'
        console.error('Get results error:', error)
      }
    },

    // Set job description
    setJobDescription(description) {
      this.jobDescription = description
      if (this.screeningResults) {
        // Clear results when job description changes
        this.clearResults()
      }
    },

    // Clear all data
    clearAll() {
      this.$reset()
    },

    // Clear only results
    clearResults() {
      this.screeningResults = null
      this.resultId = null
      this.screeningError = null
    },

    // Clear errors
    clearErrors() {
      this.error = null
      this.uploadError = null
      this.screeningError = null
    }
  }
})