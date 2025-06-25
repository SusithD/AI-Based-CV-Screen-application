<template>
  <div class="w-full max-w-2xl mx-auto">
    <div 
      class="relative border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer group"
      :class="{
        'border-blue-400 bg-blue-50 scale-105 shadow-lg': isDragOver,
        'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 hover:shadow-md': !isDragOver && !selectedFile && !isUploading,
        'border-green-400 bg-green-50': selectedFile && !isUploading,
        'border-blue-400 bg-blue-50': isUploading
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
          <div class="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-3">
          Upload Your Resume
        </h3>
        
        <p class="text-gray-600 mb-2 text-lg">
          Drag and drop your resume here, or 
          <span class="text-blue-600 font-semibold hover:text-blue-700 transition-colors">click to browse</span>
        </p>
        
        <div class="flex items-center justify-center space-x-4 mt-6">
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v1.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V5a2 2 0 00-2-2H4zM4 8a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H4z" clip-rule="evenodd" />
            </svg>
            <span>PDF</span>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v1.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V5a2 2 0 00-2-2H4zM4 8a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H4z" clip-rule="evenodd" />
            </svg>
            <span>DOCX</span>
          </div>
          <div class="text-sm text-gray-500">• Max 5MB</div>
        </div>
      </div>

      <!-- Uploading State -->
      <div v-else-if="isUploading" class="p-12 text-center">
        <div class="mb-6">
          <div class="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          Processing Your Resume
        </h3>
        
        <div class="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
        
        <p class="text-gray-600 font-medium">
          {{ uploadProgress }}% complete
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="selectedFile" class="p-12 text-center">
        <div class="mb-6">
          <div class="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl animate-pulse">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-3">
          Resume Uploaded Successfully!
        </h3>
        
        <div class="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div class="flex items-center justify-center space-x-3">
            <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v1.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V5a2 2 0 00-2-2H4zM4 8a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H4z" clip-rule="evenodd" />
            </svg>
            <div class="text-left">
              <p class="font-semibold text-gray-800 truncate max-w-xs">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
        </div>
        
        <button 
          @click="clearFile" 
          class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Different File
        </button>
      </div>

      <!-- Drag overlay -->
      <div 
        v-if="isDragOver"
        class="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
      >
        <div class="text-center">
          <div class="text-6xl mb-4 animate-bounce">📄</div>
          <p class="text-xl font-semibold text-blue-700">Drop your resume here!</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-red-800 font-medium">{{ error }}</p>
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
</style>