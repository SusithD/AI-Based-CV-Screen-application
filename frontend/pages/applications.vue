<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">CV</span>
              </div>
              <span class="font-semibold text-gray-900">TalentHub</span>
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink to="/jobs" class="text-gray-600 hover:text-gray-900">Browse Jobs</NuxtLink>
            <NuxtLink to="/dashboard" class="text-gray-600 hover:text-gray-900">Dashboard</NuxtLink>
            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium">JS</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">My Applications</h1>
            <p class="text-gray-600 mt-1">Track the status of your job applications</p>
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="statusFilter" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="screening">Screening</option>
              <option value="phone_screen">Phone Screen</option>
              <option value="technical_interview">Technical Interview</option>
              <option value="final_interview">Final Interview</option>
              <option value="offer_extended">Offer Extended</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
            <button @click="refreshApplications" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Applications List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ applicationStats.total }}</p>
              <p class="text-sm text-gray-600">Total Applications</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ applicationStats.pending }}</p>
              <p class="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ applicationStats.interviews }}</p>
              <p class="text-sm text-gray-600">Interviews Scheduled</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ Math.round(applicationStats.responseRate) }}%</p>
              <p class="text-sm text-gray-600">Response Rate</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 5" :key="n" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="flex space-x-4">
            <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Applications Grid -->
      <div v-else-if="filteredApplications.length > 0" class="space-y-4">
        <div
          v-for="application in paginatedApplications"
          :key="application.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex space-x-4">
              <!-- Company Logo -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-lg font-bold text-gray-600">
                    {{ application.job.company.name.charAt(0) }}
                  </span>
                </div>
              </div>

              <!-- Application Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">
                    {{ application.job.title }}
                  </h3>
                  <span :class="getStatusBadgeClass(application.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ formatStatus(application.status) }}
                  </span>
                </div>
                
                <p class="text-indigo-600 font-medium mb-2">{{ application.job.company.name }}</p>
                
                <div class="flex flex-wrap gap-2 mb-3">
                  <span v-if="application.job.location.city" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    📍 {{ application.job.location.city }}, {{ application.job.location.country }}
                  </span>
                  <span v-if="application.job.location.remote" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    🏠 Remote
                  </span>
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    💼 {{ application.job.employment.type }}
                  </span>
                  <span v-if="application.matchScore" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    🎯 {{ application.matchScore }}% Match
                  </span>
                </div>

                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span>Applied {{ formatDate(application.appliedAt) }}</span>
                  <span v-if="application.lastStatusUpdate">
                    Updated {{ formatDate(application.lastStatusUpdate) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex-shrink-0 flex items-center space-x-2">
              <button
                v-if="application.nextInterview"
                @click="viewInterview(application)"
                class="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Interview
              </button>
              <button
                @click="viewApplication(application)"
                class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                View Details
              </button>
              <div class="relative">
                <button
                  @click="toggleApplicationMenu(application.id)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                <div v-if="activeMenuId === application.id" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button @click="withdrawApplication(application)" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Withdraw Application
                  </button>
                  <button @click="downloadDocuments(application)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Download Documents
                  </button>
                  <button @click="addNote(application)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Interview Info -->
          <div v-if="application.nextInterview" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium text-green-800">
                Upcoming Interview: {{ formatDateTime(application.nextInterview.scheduledAt) }}
              </span>
            </div>
            <p class="text-sm text-green-700 mt-1">
              {{ application.nextInterview.type }} - {{ application.nextInterview.duration }} minutes
            </p>
          </div>

          <!-- Application Timeline -->
          <div v-if="showTimeline[application.id]" class="mt-6 border-t border-gray-200 pt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Application Timeline</h4>
            <div class="space-y-3">
              <div v-for="event in application.timeline" :key="event.id" class="flex space-x-3">
                <div class="flex-shrink-0">
                  <div :class="getTimelineIconClass(event.type)" class="w-6 h-6 rounded-full flex items-center justify-center">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                  <p class="text-sm text-gray-500">{{ event.description }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(event.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Toggle Timeline Button -->
          <button
            @click="toggleTimeline(application.id)"
            class="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {{ showTimeline[application.id] ? 'Hide Timeline' : 'Show Timeline' }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
        <p class="mt-2 text-gray-500">
          {{ statusFilter ? 'No applications match your filter.' : "You haven't applied to any jobs yet." }}
        </p>
        <div class="mt-6">
          <NuxtLink to="/jobs" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Browse Jobs
          </NuxtLink>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
              currentPage === page
                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Page metadata
useHead({
  title: 'My Applications - TalentHub',
  meta: [
    { name: 'description', content: 'Track and manage your job applications' }
  ]
})

// State
const loading = ref(false)
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const activeMenuId = ref(null)
const showTimeline = ref({})

// Mock applications data - replace with API calls
const applications = ref([
  {
    id: 1,
    job: {
      title: 'Senior Frontend Developer',
      company: { name: 'TechCorp', domain: 'techcorp.com' },
      location: { city: 'San Francisco', country: 'USA', remote: true },
      employment: { type: 'full-time' }
    },
    status: 'technical_interview',
    appliedAt: new Date('2024-01-10'),
    lastStatusUpdate: new Date('2024-01-18'),
    matchScore: 92,
    nextInterview: {
      type: 'Technical Interview',
      scheduledAt: new Date('2024-01-25T14:00:00'),
      duration: 60
    },
    timeline: [
      {
        id: 1,
        type: 'submitted',
        title: 'Application Submitted',
        description: 'Your application has been received',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 2,
        type: 'review',
        title: 'Under Review',
        description: 'Hiring manager is reviewing your application',
        createdAt: new Date('2024-01-12')
      },
      {
        id: 3,
        type: 'interview',
        title: 'Phone Screen Scheduled',
        description: 'Initial phone screen with HR',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 4,
        type: 'interview',
        title: 'Technical Interview Scheduled',
        description: 'Technical interview with engineering team',
        createdAt: new Date('2024-01-18')
      }
    ]
  },
  {
    id: 2,
    job: {
      title: 'Product Manager',
      company: { name: 'StartupX', domain: 'startupx.com' },
      location: { city: 'New York', country: 'USA', remote: false },
      employment: { type: 'full-time' }
    },
    status: 'under_review',
    appliedAt: new Date('2024-01-08'),
    lastStatusUpdate: new Date('2024-01-10'),
    matchScore: 78,
    timeline: [
      {
        id: 1,
        type: 'submitted',
        title: 'Application Submitted',
        description: 'Your application has been received',
        createdAt: new Date('2024-01-08')
      },
      {
        id: 2,
        type: 'review',
        title: 'Under Review',
        description: 'Hiring manager is reviewing your application',
        createdAt: new Date('2024-01-10')
      }
    ]
  },
  {
    id: 3,
    job: {
      title: 'Data Scientist',
      company: { name: 'DataCorp', domain: 'datacorp.com' },
      location: { city: 'Boston', country: 'USA', remote: true },
      employment: { type: 'full-time' }
    },
    status: 'rejected',
    appliedAt: new Date('2024-01-05'),
    lastStatusUpdate: new Date('2024-01-15'),
    matchScore: 65,
    timeline: [
      {
        id: 1,
        type: 'submitted',
        title: 'Application Submitted',
        description: 'Your application has been received',
        createdAt: new Date('2024-01-05')
      },
      {
        id: 2,
        type: 'rejected',
        title: 'Application Not Selected',
        description: 'Thank you for your interest. We have decided to move forward with other candidates.',
        createdAt: new Date('2024-01-15')
      }
    ]
  }
])

// Computed properties
const filteredApplications = computed(() => {
  if (!statusFilter.value) return applications.value
  return applications.value.filter(app => app.status === statusFilter.value)
})

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredApplications.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredApplications.value.length / itemsPerPage)
})

const applicationStats = computed(() => {
  const total = applications.value.length
  const pending = applications.value.filter(app => 
    ['submitted', 'under_review', 'screening'].includes(app.status)
  ).length
  const interviews = applications.value.filter(app => 
    app.nextInterview || ['phone_screen', 'technical_interview', 'final_interview'].includes(app.status)
  ).length
  const responded = applications.value.filter(app => 
    app.status !== 'submitted'
  ).length
  
  return {
    total,
    pending,
    interviews,
    responseRate: total > 0 ? (responded / total) * 100 : 0
  }
})

// Methods
const getStatusBadgeClass = (status) => {
  const classes = {
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    screening: 'bg-purple-100 text-purple-800',
    phone_screen: 'bg-indigo-100 text-indigo-800',
    technical_interview: 'bg-orange-100 text-orange-800',
    final_interview: 'bg-pink-100 text-pink-800',
    offer_extended: 'bg-green-100 text-green-800',
    hired: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatStatus = (status) => {
  const statusMap = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    screening: 'Screening',
    phone_screen: 'Phone Screen',
    technical_interview: 'Technical Interview',
    final_interview: 'Final Interview',
    offer_extended: 'Offer Extended',
    hired: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  }
  return statusMap[status] || status
}

const getTimelineIconClass = (type) => {
  const classes = {
    submitted: 'bg-blue-500',
    review: 'bg-yellow-500',
    interview: 'bg-purple-500',
    offer: 'bg-green-500',
    rejected: 'bg-red-500'
  }
  return classes[type] || 'bg-gray-500'
}

const formatDate = (date) => {
  const now = new Date()
  const diffTime = Math.abs(now - new Date(date))
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleApplicationMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const toggleTimeline = (id) => {
  showTimeline.value[id] = !showTimeline.value[id]
}

const viewApplication = (application) => {
  navigateTo(`/applications/${application.id}`)
}

const viewInterview = (application) => {
  // Navigate to interview details
  navigateTo(`/interviews/${application.nextInterview.id}`)
}

const withdrawApplication = (application) => {
  if (confirm('Are you sure you want to withdraw this application?')) {
    // API call to withdraw application
    application.status = 'withdrawn'
    activeMenuId.value = null
  }
}

const downloadDocuments = (application) => {
  // Download application documents
  console.log('Downloading documents for', application.job.title)
  activeMenuId.value = null
}

const addNote = (application) => {
  // Open modal to add note
  console.log('Adding note for', application.job.title)
  activeMenuId.value = null
}

const refreshApplications = () => {
  loading.value = true
  // Mock API refresh
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      activeMenuId.value = null
    }
  })
})

// Watch for status filter changes
watch(statusFilter, () => {
  currentPage.value = 1
})
</script>