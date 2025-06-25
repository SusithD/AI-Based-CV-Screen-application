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

  // ATS Integration Methods

  // Get available ATS integrations
  async getATSIntegrations() {
    const response = await $fetch(`${this.baseURL}/api/ats/integrations`)
    return response
  }

  // Configure ATS integration
  async configureATS(companyId, atsProvider, config) {
    const response = await $fetch(`${this.baseURL}/api/ats/configure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyId,
        atsProvider,
        config
      })
    })
    return response
  }

  // Test ATS connection
  async testATSConnection(atsProvider, config) {
    const response = await $fetch(`${this.baseURL}/api/ats/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        atsProvider,
        config
      })
    })
    return response
  }

  // Import jobs from ATS
  async importATSJobs(companyId) {
    const response = await $fetch(`${this.baseURL}/api/ats/import-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ companyId })
    })
    return response
  }

  // Export candidate to ATS
  async exportCandidateToATS(companyId, candidateData, jobId) {
    const response = await $fetch(`${this.baseURL}/api/ats/export-candidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyId,
        candidateData,
        jobId
      })
    })
    return response
  }

  // Sync candidate status from ATS
  async syncCandidateStatus(companyId, resumeId) {
    const response = await $fetch(`${this.baseURL}/api/ats/sync-status/${resumeId}?companyId=${companyId}`)
    return response
  }

  // Get company ATS settings
  async getCompanyATSSettings(companyId) {
    const response = await $fetch(`${this.baseURL}/api/ats/company-settings/${companyId}`)
    return response
  }

  // Disconnect ATS integration
  async disconnectATS(companyId) {
    const response = await $fetch(`${this.baseURL}/api/ats/disconnect/${companyId}`, {
      method: 'DELETE'
    })
    return response
  }

  // Get ATS imported jobs
  async getATSJobs(companyId) {
    const response = await $fetch(`${this.baseURL}/api/ats/jobs/${companyId}`)
    return response
  }
}

// Factory function to create API service instance
export function useApiService() {
  const config = useRuntimeConfig()
  return new ApiService(config.public.apiBase)
}