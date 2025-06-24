<template>
  <div class="file-uploader">
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
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
        style="display: none"
      />
      
      <div v-if="!selectedFile && !isUploading">
        <div class="upload-icon">📄</div>
        <h3>Upload Your Resume</h3>
        <p>Drag and drop your resume here, or click to browse</p>
        <p class="file-types">Supported formats: PDF, DOCX (Max 5MB)</p>
      </div>

      <div v-else-if="isUploading">
        <div class="upload-icon">
          <div class="loading-spinner"></div>
        </div>
        <h3>Uploading Resume...</h3>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p>{{ uploadProgress }}% complete</p>
      </div>

      <div v-else-if="selectedFile">
        <div class="upload-icon">✅</div>
        <h3>Resume Uploaded Successfully</h3>
        <p><strong>{{ selectedFile.name }}</strong></p>
        <p>{{ formatFileSize(selectedFile.size) }}</p>
        <button class="btn btn-secondary" @click="clearFile" style="margin-top: 12px;">
          Upload Different File
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
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