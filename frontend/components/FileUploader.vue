<template>
  <div class="w-full max-w-2xl mx-auto">
    <div 
      class="relative border-2 border-dashed rounded-md transition-all duration-200 cursor-pointer"
      :class="{
        'border-gray-400 bg-gray-50': isDragOver,
        'border-gray-200 hover:border-gray-300 hover:bg-gray-50': !isDragOver && !selectedFile && !isUploading,
        'border-green-500 bg-green-50': selectedFile && !isUploading,
        'border-gray-300 bg-gray-50': isUploading
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.docx"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <!-- Upload State -->
      <div v-if="!selectedFile && !isUploading" class="p-12 text-center">
        <div class="mb-6">
          <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Upload Resume
        </h3>
        
        <p class="text-sm text-gray-600 mb-6">
          Drag and drop your resume here, or 
          <span class="font-medium text-gray-900">click to browse</span>
        </p>
        
        <div class="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <span class="flex items-center">
            <span class="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
            PDF
          </span>
          <span class="flex items-center">
            <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            DOCX
          </span>
          <span>Max 5MB</span>
        </div>
      </div>

      <!-- Uploading State -->
      <div v-else-if="isUploading" class="p-12 text-center">
        <div class="mb-6">
          <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <div class="loading-spinner"></div>
          </div>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Processing Resume
        </h3>
        
        <div class="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div 
            class="h-full bg-gray-900 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
        
        <p class="text-sm text-gray-600">
          {{ uploadProgress }}% complete
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="selectedFile" class="p-12 text-center">
        <div class="mb-6">
          <div class="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Resume Uploaded
        </h3>
        
        <div class="bg-white border border-gray-100 rounded-md p-4 mb-6">
          <div class="flex items-center justify-center space-x-3">
            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v1.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V5a2 2 0 00-2-2H4zM4 8a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H4z" clip-rule="evenodd" />
            </svg>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900 truncate max-w-xs">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
        </div>
        
        <button 
          @click="clearFile" 
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Different File
        </button>
      </div>

      <!-- Drag overlay -->
      <div 
        v-if="isDragOver"
        class="absolute inset-0 bg-gray-900 bg-opacity-5 rounded-md flex items-center justify-center"
      >
        <div class="text-center">
          <div class="text-4xl mb-2">📄</div>
          <p class="text-sm font-medium text-gray-700">Drop your resume here</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
      <div class="flex items-center">
        <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '~/store/resume'

const resumeStore = useResumeStore()

const fileInput = ref(null)
const isDragOver = ref(false)

// Computed properties
const selectedFile = computed(() => resumeStore.currentResume)
const isUploading = computed(() => resumeStore.isUploading)
const uploadProgress = computed(() => resumeStore.uploadProgress)
const error = computed(() => resumeStore.uploadError)

// Methods
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDragEnter = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const processFile = async (file) => {
  // Validate file type
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    resumeStore.uploadError = 'Please upload a PDF or DOCX file'
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    resumeStore.uploadError = 'File size must be less than 5MB'
    return
  }

  // Upload file
  await resumeStore.uploadResume(file)
}

const clearFile = () => {
  resumeStore.clearAll()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-uploader {
  margin-bottom: 24px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-area h3 {
  margin-bottom: 8px;
  color: #374151;
}

.upload-area p {
  color: #6b7280;
  margin-bottom: 4px;
}

.file-types {
  font-size: 14px;
  font-style: italic;
}

/* Spinner animation */
.loading-spinner {
  border: 4px solid rgba(156, 163, 175, 0.3);
  border-top: 4px solid rgba(75, 85, 99);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>