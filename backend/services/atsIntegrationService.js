const axios = require('axios');
const crypto = require('crypto');

/**
 * ATS Integration Service
 * Handles integrations with major Applicant Tracking Systems
 */
class ATSIntegrationService {
  constructor() {
    this.integrations = {
      workday: new WorkdayIntegration(),
      greenhouse: new GreenhouseIntegration(),
      lever: new LeverIntegration(),
      bamboohr: new BambooHRIntegration()
    };
  }

  /**
   * Get available ATS integrations
   */
  getAvailableIntegrations() {
    return Object.keys(this.integrations).map(key => ({
      id: key,
      name: this.integrations[key].name,
      description: this.integrations[key].description,
      configFields: this.integrations[key].getConfigFields()
    }));
  }

  /**
   * Configure ATS integration for a company
   */
  async configureIntegration(companyId, atsProvider, config) {
    const integration = this.integrations[atsProvider];
    if (!integration) {
      throw new Error(`Unsupported ATS provider: ${atsProvider}`);
    }

    // Validate configuration
    const isValid = await integration.validateConfig(config);
    if (!isValid) {
      throw new Error('Invalid ATS configuration');
    }

    // Store encrypted configuration
    const encryptedConfig = this.encryptConfig(config);
    
    // Update company settings in database
    const Company = require('../models/Company');
    await Company.findByIdAndUpdate(companyId, {
      'settings.integrations.ats': {
        provider: atsProvider,
        config: encryptedConfig,
        enabled: true,
        configuredAt: new Date()
      }
    });

    return { success: true, message: 'ATS integration configured successfully' };
  }

  /**
   * Import jobs from ATS
   */
  async importJobs(companyId) {
    const company = await this.getCompanyWithATS(companyId);
    const integration = this.integrations[company.settings.integrations.ats.provider];
    const config = this.decryptConfig(company.settings.integrations.ats.config);

    const jobs = await integration.fetchJobs(config);
    
    // Transform and save jobs to our database
    const transformedJobs = jobs.map(job => this.transformJobData(job, companyId));
    await this.saveJobsToDatabase(companyId, transformedJobs);

    return { imported: jobs.length, jobs: transformedJobs };
  }

  /**
   * Export candidate to ATS
   */
  async exportCandidate(companyId, candidateData, jobId) {
    const company = await this.getCompanyWithATS(companyId);
    const integration = this.integrations[company.settings.integrations.ats.provider];
    const config = this.decryptConfig(company.settings.integrations.ats.config);

    const result = await integration.createCandidate(config, candidateData, jobId);
    
    // Update our database with ATS candidate ID
    await this.updateCandidateWithATSId(candidateData.resumeId, result.candidateId);

    return result;
  }

  /**
   * Sync candidate status from ATS
   */
  async syncCandidateStatus(companyId, resumeId) {
    const company = await this.getCompanyWithATS(companyId);
    const integration = this.integrations[company.settings.integrations.ats.provider];
    const config = this.decryptConfig(company.settings.integrations.ats.config);

    // Get candidate ATS ID from our database
    const candidate = await this.getCandidateByResumeId(resumeId);
    if (!candidate.atsId) {
      throw new Error('Candidate not found in ATS');
    }

    const status = await integration.getCandidateStatus(config, candidate.atsId);
    
    // Update our database
    await this.updateCandidateStatus(resumeId, status);

    return status;
  }

  // Helper methods
  encryptConfig(config) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ATS_ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return { encrypted, iv: iv.toString('hex') };
  }

  decryptConfig(encryptedConfig) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ATS_ENCRYPTION_KEY;
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encryptedConfig.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  async getCompanyWithATS(companyId) {
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    
    if (!company?.settings?.integrations?.ats?.enabled) {
      throw new Error('ATS integration not configured');
    }
    
    return company;
  }

  transformJobData(atsJob, companyId) {
    return {
      title: atsJob.title,
      department: atsJob.department,
      description: atsJob.description,
      requirements: atsJob.requirements || atsJob.description,
      location: atsJob.location,
      type: atsJob.type || 'full-time',
      status: 'active',
      atsJobId: atsJob.id,
      externalUrl: atsJob.url,
      createdAt: new Date()
    };
  }

  async saveJobsToDatabase(companyId, jobs) {
    const Company = require('../models/Company');
    
    for (const job of jobs) {
      await Company.findByIdAndUpdate(companyId, {
        $addToSet: { jobPostings: job }
      });
    }
  }

  async updateCandidateWithATSId(resumeId, atsId) {
    const Resume = require('../models/Resume');
    await Resume.findByIdAndUpdate(resumeId, { atsId });
  }

  async getCandidateByResumeId(resumeId) {
    const Resume = require('../models/Resume');
    return await Resume.findById(resumeId);
  }

  async updateCandidateStatus(resumeId, status) {
    const Resume = require('../models/Resume');
    await Resume.findByIdAndUpdate(resumeId, { 
      atsStatus: status.status,
      atsLastUpdated: new Date()
    });
  }
}

/**
 * Workday Integration
 */
class WorkdayIntegration {
  constructor() {
    this.name = 'Workday';
    this.description = 'Integration with Workday HCM';
    this.baseUrl = 'https://api.workday.com';
  }

  getConfigFields() {
    return [
      { name: 'tenantUrl', label: 'Tenant URL', type: 'url', required: true },
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
    ];
  }

  async validateConfig(config) {
    try {
      const token = await this.getAccessToken(config);
      const response = await axios.get(`${config.tenantUrl}/ccx/api/v1/workers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1 }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Workday config validation failed:', error);
      return false;
    }
  }

  async getAccessToken(config) {
    const response = await axios.post(`${config.tenantUrl}/ccx/oauth2/token`, {
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret
    });
    return response.data.access_token;
  }

  async fetchJobs(config) {
    const token = await this.getAccessToken(config);
    const response = await axios.get(`${config.tenantUrl}/ccx/api/v1/jobPostings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.data.map(job => ({
      id: job.id,
      title: job.jobProfile?.name,
      department: job.jobProfile?.jobFamily?.name,
      description: job.jobDescription,
      location: job.location?.name,
      type: job.jobProfile?.jobType,
      url: job.externalJobPostingUrl
    }));
  }

  async createCandidate(config, candidateData, jobId) {
    const token = await this.getAccessToken(config);
    
    const candidate = {
      personalData: {
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email
      },
      jobApplicationData: {
        jobPostingId: jobId,
        resumeData: candidateData.resumeText
      }
    };

    const response = await axios.post(`${config.tenantUrl}/ccx/api/v1/candidates`, candidate, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return { candidateId: response.data.id };
  }

  async getCandidateStatus(config, candidateId) {
    const token = await this.getAccessToken(config);
    const response = await axios.get(`${config.tenantUrl}/ccx/api/v1/candidates/${candidateId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      status: response.data.applicationStatus,
      stage: response.data.currentStage,
      lastUpdated: response.data.lastModified
    };
  }
}

/**
 * Greenhouse Integration
 */
class GreenhouseIntegration {
  constructor() {
    this.name = 'Greenhouse';
    this.description = 'Integration with Greenhouse ATS';
    this.baseUrl = 'https://harvest.greenhouse.io/v1';
  }

  getConfigFields() {
    return [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false }
    ];
  }

  async validateConfig(config) {
    try {
      const response = await axios.get(`${this.baseUrl}/users`, {
        auth: { username: config.apiKey, password: '' }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async fetchJobs(config) {
    const response = await axios.get(`${this.baseUrl}/jobs`, {
      auth: { username: config.apiKey, password: '' }
    });

    return response.data.map(job => ({
      id: job.id,
      title: job.name,
      department: job.departments[0]?.name,
      description: job.notes,
      location: job.offices[0]?.name,
      type: 'full-time',
      url: job.job_board_url
    }));
  }

  async createCandidate(config, candidateData, jobId) {
    const candidate = {
      first_name: candidateData.firstName,
      last_name: candidateData.lastName,
      email_addresses: [{ value: candidateData.email, type: 'personal' }],
      applications: [{
        job_id: jobId,
        source_id: 1 // API source
      }]
    };

    const response = await axios.post(`${this.baseUrl}/candidates`, candidate, {
      auth: { username: config.apiKey, password: '' }
    });

    // Upload resume
    if (candidateData.resumeFile) {
      await this.uploadResume(config, response.data.id, candidateData.resumeFile);
    }

    return { candidateId: response.data.id };
  }

  async uploadResume(config, candidateId, resumeFile) {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('filename', resumeFile.name);
    formData.append('type', 'resume');

    await axios.post(`${this.baseUrl}/candidates/${candidateId}/attachments`, formData, {
      auth: { username: config.apiKey, password: '' },
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async getCandidateStatus(config, candidateId) {
    const response = await axios.get(`${this.baseUrl}/candidates/${candidateId}`, {
      auth: { username: config.apiKey, password: '' }
    });

    const application = response.data.applications[0];
    return {
      status: application.status,
      stage: application.current_stage?.name,
      lastUpdated: application.last_activity_at
    };
  }
}

/**
 * Lever Integration
 */
class LeverIntegration {
  constructor() {
    this.name = 'Lever';
    this.description = 'Integration with Lever ATS';
    this.baseUrl = 'https://api.lever.co/v1';
  }

  getConfigFields() {
    return [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true }
    ];
  }

  async validateConfig(config) {
    try {
      const response = await axios.get(`${this.baseUrl}/users`, {
        auth: { username: config.apiKey, password: '' }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async fetchJobs(config) {
    const response = await axios.get(`${this.baseUrl}/postings`, {
      auth: { username: config.apiKey, password: '' }
    });

    return response.data.data.map(job => ({
      id: job.id,
      title: job.text,
      department: job.categories?.department,
      description: job.content?.description,
      location: job.categories?.location,
      type: job.categories?.commitment,
      url: job.hostedUrl
    }));
  }

  async createCandidate(config, candidateData, jobId) {
    const candidate = {
      name: `${candidateData.firstName} ${candidateData.lastName}`,
      email: candidateData.email,
      postings: [jobId]
    };

    const response = await axios.post(`${this.baseUrl}/candidates`, candidate, {
      auth: { username: config.apiKey, password: '' }
    });

    return { candidateId: response.data.data.id };
  }

  async getCandidateStatus(config, candidateId) {
    const response = await axios.get(`${this.baseUrl}/candidates/${candidateId}`, {
      auth: { username: config.apiKey, password: '' }
    });

    return {
      status: response.data.data.stage,
      stage: response.data.data.stage,
      lastUpdated: response.data.data.updatedAt
    };
  }
}

/**
 * BambooHR Integration
 */
class BambooHRIntegration {
  constructor() {
    this.name = 'BambooHR';
    this.description = 'Integration with BambooHR';
  }

  getConfigFields() {
    return [
      { name: 'subdomain', label: 'Subdomain', type: 'text', required: true },
      { name: 'apiKey', label: 'API Key', type: 'password', required: true }
    ];
  }

  async validateConfig(config) {
    try {
      const response = await axios.get(`https://api.bamboohr.com/api/gateway.php/${config.subdomain}/v1/employees/directory`, {
        auth: { username: config.apiKey, password: 'x' }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async fetchJobs(config) {
    // BambooHR doesn't have a public jobs API, return empty array
    return [];
  }

  async createCandidate(config, candidateData, jobId) {
    const employee = {
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      workEmail: candidateData.email,
      status: 'Active'
    };

    const response = await axios.post(
      `https://api.bamboohr.com/api/gateway.php/${config.subdomain}/v1/employees`,
      employee,
      {
        auth: { username: config.apiKey, password: 'x' },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return { candidateId: response.headers.location.split('/').pop() };
  }

  async getCandidateStatus(config, candidateId) {
    const response = await axios.get(
      `https://api.bamboohr.com/api/gateway.php/${config.subdomain}/v1/employees/${candidateId}`,
      {
        auth: { username: config.apiKey, password: 'x' },
        params: { fields: 'status,hireDate' }
      }
    );

    return {
      status: response.data.status,
      stage: response.data.status,
      lastUpdated: response.data.hireDate
    };
  }
}

module.exports = ATSIntegrationService;