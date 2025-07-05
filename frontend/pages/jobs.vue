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
            <NuxtLink v-if="!isAuthenticated" to="/auth/login" class="text-gray-600 hover:text-gray-900">
              Sign In
            </NuxtLink>
            <NuxtLink v-if="!isAuthenticated" to="/auth/register" 
              class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
              Get Started
            </NuxtLink>
            
            <!-- User Menu -->
            <div v-if="isAuthenticated" class="relative">
              <button @click="showUserMenu = !showUserMenu" 
                class="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium">{{ userInitials }}</span>
                </div>
                <span class="hidden sm:block">{{ user?.profile?.firstName }}</span>
              </button>
              
              <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <NuxtLink to="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Dashboard
                </NuxtLink>
                <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </NuxtLink>
                <NuxtLink v-if="user?.role === 'job_seeker'" to="/applications" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  My Applications
                </NuxtLink>
                <NuxtLink v-if="user?.role === 'job_seeker'" to="/saved-jobs" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Saved Jobs
                </NuxtLink>
                <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-white mb-4">
            Find Your Dream Job with AI-Powered Matching
          </h1>
          <p class="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Connect with top companies, get AI-powered resume screening, and land your next opportunity.
          </p>
          
          <!-- Search Bar -->
          <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Job title, company, or keywords..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex-1">
                <input
                  v-model="locationQuery"
                  type="text"
                  placeholder="Location (city, state, or remote)"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                @click="searchJobs"
                class="bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              >
                Search Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Results -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <div class="lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Filters</h3>
            
            <!-- Job Type -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <div class="space-y-2">
                <label v-for="type in jobTypes" :key="type.value" class="flex items-center">
                  <input
                    v-model="selectedJobTypes"
                    :value="type.value"
                    type="checkbox"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-600">{{ type.label }}</span>
                </label>
              </div>
            </div>

            <!-- Remote Work -->
            <div class="mb-6">
              <label class="flex items-center">
                <input
                  v-model="remoteOnly"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-600">Remote jobs only</span>
              </label>
            </div>

            <!-- Salary Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <div class="space-y-2">
                <input
                  v-model="salaryMin"
                  type="number"
                  placeholder="Min salary"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  v-model="salaryMax"
                  type="number"
                  placeholder="Max salary"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <button
              @click="applyFilters"
              class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        <!-- Job Listings -->
        <div class="flex-1">
          <!-- Results Header -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {{ filteredJobs.length }} Jobs Found
              </h2>
              <p class="text-gray-600">Showing results for your search</p>
            </div>
            
            <select
              v-model="sortBy"
              @change="sortJobs"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="postedAt">Most Recent</option>
              <option value="title">Job Title</option>
              <option value="company">Company</option>
              <option value="salary">Salary</option>
            </select>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="space-y-4">
            <div v-for="n in 5" :key="n" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          <!-- Job Cards -->
          <div v-else class="space-y-4">
            <div
              v-for="job in paginatedJobs"
              :key="job._id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="viewJob(job)"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ job.title }}</h3>
                  <p class="text-indigo-600 font-medium">{{ job.company?.name }}</p>
                </div>
                <button
                  @click.stop="toggleSaveJob(job)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg class="w-5 h-5" :class="{ 'text-red-500': isJobSaved(job._id) }" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </button>
              </div>

              <div class="flex flex-wrap gap-2 mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ job.employment?.type }}
                </span>
                <span v-if="job.location?.remote" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Remote
                </span>
                <span v-if="job.location?.city" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ job.location.city }}, {{ job.location.country }}
                </span>
              </div>

              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ job.description }}
              </p>

              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span v-if="job.salary?.min && job.salary?.max">
                    ${{ formatSalary(job.salary.min) }} - ${{ formatSalary(job.salary.max) }}
                  </span>
                  <span>{{ formatDate(job.postedAt) }}</span>
                </div>
                
                <div class="flex space-x-2">
                  <button
                    v-if="isAuthenticated && user?.role === 'job_seeker'"
                    @click.stop="quickApply(job)"
                    class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Quick Apply
                  </button>
                  <button
                    @click.stop="viewJob(job)"
                    class="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && filteredJobs.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
            <p class="mt-2 text-gray-500">Try adjusting your search criteria or filters.</p>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Page metadata
useHead({
  title: 'Browse Jobs - TalentHub',
  meta: [
    { name: 'description', content: 'Browse and search thousands of job opportunities with AI-powered matching' }
  ]
})

// State
const searchQuery = ref('')
const locationQuery = ref('')
const selectedJobTypes = ref([])
const remoteOnly = ref(false)
const salaryMin = ref('')
const salaryMax = ref('')
const sortBy = ref('postedAt')
const currentPage = ref(1)
const itemsPerPage = 20
const loading = ref(false)
const showUserMenu = ref(false)

// Mock user state - replace with actual auth store
const isAuthenticated = ref(false)
const user = ref(null)

// Mock jobs data - replace with API calls
const jobs = ref([
  {
    _id: '1',
    title: 'Senior Frontend Developer',
    company: { name: 'TechCorp', domain: 'techcorp.com' },
    department: 'Engineering',
    description: 'We are looking for a skilled Frontend Developer to join our team...',
    employment: { type: 'full-time' },
    location: { city: 'San Francisco', country: 'USA', remote: true },
    salary: { min: 120000, max: 160000, currency: 'USD' },
    postedAt: new Date('2024-01-15'),
    tags: ['React', 'TypeScript', 'Node.js']
  },
  {
    _id: '2',
    title: 'Product Manager',
    company: { name: 'StartupX', domain: 'startupx.com' },
    department: 'Product',
    description: 'Lead product strategy and development for our innovative platform...',
    employment: { type: 'full-time' },
    location: { city: 'New York', country: 'USA', remote: false },
    salary: { min: 130000, max: 170000, currency: 'USD' },
    postedAt: new Date('2024-01-12'),
    tags: ['Product Strategy', 'Agile', 'Analytics']
  }
])

const savedJobIds = ref(['1']) // Mock saved jobs

const jobTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' }
]

// Computed properties
const filteredJobs = computed(() => {
  let filtered = jobs.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.name.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query)
    )
  }

  // Location filter
  if (locationQuery.value) {
    const location = locationQuery.value.toLowerCase()
    filtered = filtered.filter(job =>
      job.location?.city?.toLowerCase().includes(location) ||
      job.location?.country?.toLowerCase().includes(location) ||
      (location === 'remote' && job.location?.remote)
    )
  }

  // Job type filter
  if (selectedJobTypes.value.length > 0) {
    filtered = filtered.filter(job =>
      selectedJobTypes.value.includes(job.employment?.type)
    )
  }

  // Remote filter
  if (remoteOnly.value) {
    filtered = filtered.filter(job => job.location?.remote)
  }

  // Salary filter
  if (salaryMin.value) {
    filtered = filtered.filter(job => 
      job.salary?.min >= parseInt(salaryMin.value)
    )
  }
  if (salaryMax.value) {
    filtered = filtered.filter(job => 
      job.salary?.max <= parseInt(salaryMax.value)
    )
  }

  return filtered
})

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredJobs.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredJobs.value.length / itemsPerPage)
})

const userInitials = computed(() => {
  if (!user.value?.profile) return 'U'
  const { firstName, lastName } = user.value.profile
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
})

// Methods
const searchJobs = () => {
  currentPage.value = 1
  // In a real app, this would trigger an API call
}

const applyFilters = () => {
  currentPage.value = 1
  // Filters are applied reactively
}

const sortJobs = () => {
  // Implement sorting logic
}

const viewJob = (job) => {
  navigateTo(`/jobs/${job._id}`)
}

const quickApply = (job) => {
  navigateTo(`/jobs/${job._id}/apply`)
}

const toggleSaveJob = (job) => {
  if (isJobSaved(job._id)) {
    savedJobIds.value = savedJobIds.value.filter(id => id !== job._id)
  } else {
    savedJobIds.value.push(job._id)
  }
}

const isJobSaved = (jobId) => {
  return savedJobIds.value.includes(jobId)
}

const formatSalary = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount)
}

const formatDate = (date) => {
  const now = new Date()
  const diffTime = Math.abs(now - new Date(date))
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const logout = () => {
  // Implement logout logic
  isAuthenticated.value = false
  user.value = null
  showUserMenu.value = false
}

// Lifecycle
onMounted(() => {
  // Load jobs from API
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})

// Reset page when filters change
watch([searchQuery, locationQuery, selectedJobTypes, remoteOnly, salaryMin, salaryMax], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>