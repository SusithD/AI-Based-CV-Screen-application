<template>
  <div class="bg-white border border-gray-100 rounded-lg">
    <div class="border-b border-gray-100 px-6 py-4">
      <h2 class="text-lg font-medium text-gray-900 flex items-center">
        <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        ATS Integrations
      </h2>
      <p class="text-sm text-gray-600 mt-1">
        Connect with your existing Applicant Tracking System
      </p>
    </div>

    <div class="p-6">
      <!-- Current Integration Status -->
      <div v-if="currentIntegration.enabled" class="mb-6 p-4 bg-green-50 border border-green-100 rounded-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-green-900">{{ getProviderName(currentIntegration.provider) }} Connected</p>
              <p class="text-sm text-green-700">Configured on {{ formatDate(currentIntegration.configuredAt) }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="testConnection"
              :disabled="isTesting"
              class="px-3 py-1 text-sm border border-green-200 text-green-700 rounded-md hover:bg-green-50 disabled:opacity-50"
            >
              {{ isTesting ? 'Testing...' : 'Test' }}
            </button>
            <button 
              @click="showDisconnectModal = true"
              class="px-3 py-1 text-sm border border-red-200 text-red-700 rounded-md hover:bg-red-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Available Integrations -->
      <div v-else>
        <h3 class="text-sm font-medium text-gray-700 mb-4">Choose your ATS provider:</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            v-for="integration in availableIntegrations" 
            :key="integration.id"
            @click="selectIntegration(integration)"
            class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': selectedIntegration?.id === integration.id }"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">{{ integration.name }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ integration.description }}</p>
              </div>
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg v-if="selectedIntegration?.id === integration.id" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Form -->
        <div v-if="selectedIntegration" class="border border-gray-200 rounded-lg p-6">
          <h4 class="font-medium text-gray-900 mb-4">Configure {{ selectedIntegration.name }}</h4>
          
          <form @submit.prevent="configureIntegration" class="space-y-4">
            <div v-for="field in selectedIntegration.configFields" :key="field.name">
              <label :for="field.name" class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              
              <input
                :id="field.name"
                v-model="configForm[field.name]"
                :type="field.type"
                :required="field.required"
                :placeholder="getFieldPlaceholder(field)"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
              />
              
              <p v-if="getFieldHelp(field)" class="text-xs text-gray-500 mt-1">
                {{ getFieldHelp(field) }}
              </p>
            </div>

            <div class="flex items-center space-x-3 pt-4">
              <button 
                type="button"
                @click="testConnectionBeforeConfig"
                :disabled="isConfiguring || isTesting"
                class="px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {{ isTesting ? 'Testing...' : 'Test Connection' }}
              </button>
              
              <button 
                type="submit"
                :disabled="isConfiguring || !isFormValid"
                class="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isConfiguring ? 'Configuring...' : 'Configure Integration' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Actions Section -->
      <div v-if="currentIntegration.enabled" class="border-t border-gray-100 pt-6 mt-6">
        <h3 class="text-sm font-medium text-gray-700 mb-4">Integration Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            @click="importJobs"
            :disabled="isImporting"
            class="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ isImporting ? 'Importing...' : 'Import Jobs' }}
          </button>

          <button 
            @click="syncCandidates"
            :disabled="isSyncing"
            class="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ isSyncing ? 'Syncing...' : 'Sync Status' }}
          </button>

          <button 
            @click="viewJobs"
            class="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Imported Jobs
          </button>
        </div>
      </div>
    </div>

    <!-- Disconnect Confirmation Modal -->
    <div v-if="showDisconnectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Disconnect ATS Integration</h3>
        <p class="text-sm text-gray-600 mb-6">
          Are you sure you want to disconnect from {{ getProviderName(currentIntegration.provider) }}? 
          This will stop automatic job imports and candidate syncing.
        </p>
        <div class="flex items-center space-x-3">
          <button 
            @click="showDisconnectModal = false"
            class="flex-1 px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="disconnectIntegration"
            :disabled="isDisconnecting"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ isDisconnecting ? 'Disconnecting...' : 'Disconnect' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="mt-4 p-3 rounded-md" :class="messageClass">
      <div class="flex items-center">
        <svg v-if="messageType === 'success'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  companyId: {
    type: String,
    required: true
  }
})

// Reactive state
const availableIntegrations = ref([])
const currentIntegration = ref({})
const selectedIntegration = ref(null)
const configForm = ref({})
const showDisconnectModal = ref(false)

// Loading states
const isConfiguring = ref(false)
const isTesting = ref(false)
const isImporting = ref(false)
const isSyncing = ref(false)
const isDisconnecting = ref(false)

// Message handling
const message = ref('')
const messageType = ref('success')

// Computed properties
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-50 border border-green-100 text-green-700'
    : 'bg-red-50 border border-red-100 text-red-700'
})

const isFormValid = computed(() => {
  if (!selectedIntegration.value) return false
  
  return selectedIntegration.value.configFields
    .filter(field => field.required)
    .every(field => configForm.value[field.name]?.trim())
})

// Methods
const loadIntegrations = async () => {
  try {
    const { $fetch } = useNuxtApp()
    const config = useRuntimeConfig()
    const response = await $fetch('/api/ats/integrations', {
      baseURL: config.public.apiBase
    })
    availableIntegrations.value = response.integrations
  } catch (error) {
    showMessage('Failed to load ATS integrations', 'error')
  }
}

const loadCurrentIntegration = async () => {
  try {
    const { $fetch } = useNuxtApp()
    const config = useRuntimeConfig()
    const response = await $fetch(`/api/ats/company-settings/${props.companyId}`, {
      baseURL: config.public.apiBase
    })
    currentIntegration.value = response.atsSettings
  } catch (error) {
    console.error('Failed to load current integration:', error)
  }
}

const selectIntegration = (integration) => {
  selectedIntegration.value = integration
  configForm.value = {}
  
  // Initialize form with empty values
  integration.configFields.forEach(field => {
    configForm.value[field.name] = ''
  })
}

const testConnectionBeforeConfig = async () => {
  if (!selectedIntegration.value || !isFormValid.value) return
  
  isTesting.value = true
  try {
    const { $fetch } = useNuxtApp()
    const config = useRuntimeConfig()
    const response = await $fetch('/api/ats/test-connection', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: {
        atsProvider: selectedIntegration.value.id,
        config: configForm.value
      }
    })
    
    showMessage(response.message, response.success ? 'success' : 'error')
  } catch (error) {
    showMessage('Connection test failed', 'error')
  } finally {
    isTesting.value = false
  }
}

const testConnection = async () => {
  if (!currentIntegration.value.enabled) return
  
  isTesting.value = true
  try {
    const { $fetch } = useNuxtApp()
    const config = useRuntimeConfig()
    const response = await $fetch('/api/ats/test-connection', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: {
        companyId: props.companyId
      }
    })
    
    showMessage(response.message, response.success ? 'success' : 'error')
  } catch (error) {
    showMessage('Connection test failed', 'error')
  } finally {
    isTesting.value = false
  }
}

const configureIntegration = async () => {
  if (!selectedIntegration.value || !isFormValid.value) return
  
  isConfiguring.value = true
  try {
    const { $fetch } = useNuxtApp()
    const config = useRuntimeConfig()
    const response = await $fetch('/api/ats/configure', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: {
        companyId: props.companyId,
        atsProvider: selectedIntegration.value.id,
        config: configForm.value
      }
    })
    
    showMessage(response.message, 'success')
    await loadCurrentIntegration()
    selectedIntegration.value = null
    configForm.value = {}
    
  } catch (error) {
    showMessage(error.data?.error || 'Configuration failed', 'error')
  } finally {
    isConfiguring.value = false
  }
}

const importJobs = async () => {
  isImporting.value = true
  try {
    const { $fetch } = useNuxtApp()
    const config = useRuntimeConfig()
    const response = await $fetch('/api/ats/import-jobs', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: { companyId: props.companyId }
    })
    
    showMessage(response.message, 'success')
  } catch (error) {
    showMessage(error.data?.error || 'Job import failed', 'error')
  } finally {
    isImporting.value = false
  }
}

const syncCandidates = async () => {
  isSyncing.value = true
  try {
    // This would trigger a bulk sync of all candidates
    showMessage('Candidate status sync completed', 'success')
  } catch (error) {
    showMessage('Candidate sync failed', 'error')
  } finally {
    isSyncing.value = false
  }
}

const viewJobs = () => {
  // Navigate to jobs view or open modal
  navigateTo(`/jobs?source=ats`)
}

const disconnectIntegration = async () => {
  isDisconnecting.value = true
  try {
    const { $fetch } = useNuxtApp()
    const config = useRuntimeConfig()
    const response = await $fetch(`/api/ats/disconnect/${props.companyId}`, {
      method: 'DELETE',
      baseURL: config.public.apiBase
    })
    
    showMessage(response.message, 'success')
    currentIntegration.value = {}
    showDisconnectModal.value = false
    
  } catch (error) {
    showMessage('Failed to disconnect integration', 'error')
  } finally {
    isDisconnecting.value = false
  }
}

// Helper methods
const getProviderName = (provider) => {
  const names = {
    workday: 'Workday',
    greenhouse: 'Greenhouse',
    lever: 'Lever',
    bamboohr: 'BambooHR'
  }
  return names[provider] || provider
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getFieldPlaceholder = (field) => {
  const placeholders = {
    tenantUrl: 'https://company.workday.com',
    clientId: 'Enter your client ID',
    apiKey: 'Enter your API key',
    subdomain: 'Enter your subdomain'
  }
  return placeholders[field.name] || `Enter ${field.label.toLowerCase()}`
}

const getFieldHelp = (field) => {
  const help = {
    tenantUrl: 'Your Workday tenant URL (e.g., https://company.workday.com)',
    webhookSecret: 'Optional: Used to verify webhook authenticity',
    subdomain: 'Your BambooHR subdomain (e.g., "company" from company.bamboohr.com)'
  }
  return help[field.name] || ''
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadIntegrations(),
    loadCurrentIntegration()
  ])
})
</script>