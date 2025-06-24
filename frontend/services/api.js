// API service for resume screening operations
export class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  // Upload resume and extract text
  async uploadResume(file) {
    const formData = new FormData()
    formData.append('resume', file)

    const response = await $fetch(`${this.baseURL}/api/upload-resume`, {
      method: 'POST',
      body: formData
    })

    return response
  }

  // Screen resume against job description
  async screenResume(resumeId, jobDescription) {
    const response = await $fetch(`${this.baseURL}/api/screen-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeId,
        jobDescription
      })
    })

    return response
  }

  // Get screening results by ID
  async getResults(resultId) {
    const response = await $fetch(`${this.baseURL}/api/results/${resultId}`)
    return response
  }

  // Check API health
  async healthCheck() {
    const response = await $fetch(`${this.baseURL}/api/health`)
    return response
  }
}

// Factory function to create API service instance
export function useApiService() {
  const config = useRuntimeConfig()
  return new ApiService(config.public.apiBase)
}