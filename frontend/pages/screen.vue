<template>
  <div class="screening-page">
    <div class="container">
      <div class="screening-container">
        <div class="screening-header">
          <h1>🔍 Analyzing Your Resume</h1>
          <p>Please wait while we process your resume using advanced AI models...</p>
        </div>

        <div class="screening-progress">
          <div class="progress-circle">
            <div class="progress-ring">
              <svg class="progress-svg" width="120" height="120">
                <circle
                  class="progress-background"
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#e5e7eb"
                  stroke-width="8"
                  fill="none"
                />
                <circle
                  class="progress-foreground"
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#3b82f6"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeDashoffset"
                  stroke-linecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="progress-text">
                {{ progress }}%
              </div>
            </div>
          </div>

          <div class="progress-steps">
            <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
              <div class="step-icon">📄</div>
              <div class="step-content">
                <h3>Text Extraction</h3>
                <p>Extracting text from your resume</p>
              </div>
            </div>

            <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
              <div class="step-icon">🧠</div>
              <div class="step-content">
                <h3>NLP Analysis</h3>
                <p>Analyzing skills and entities using BERT models</p>
              </div>
            </div>

            <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
              <div class="step-icon">🎯</div>
              <div class="step-content">
                <h3>Similarity Matching</h3>
                <p>Calculating semantic similarity with job description</p>
              </div>
            </div>

            <div class="step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
              <div class="step-icon">📊</div>
              <div class="step-content">
                <h3>Generating Results</h3>
                <p>Creating match score and recommendations</p>
              </div>
            </div>
          </div>
        </div>

        <div class="screening-info">
          <div class="info-cards">
            <div class="info-card">
              <h4>🔬 What We're Analyzing</h4>
              <ul>
                <li>Technical skills and keywords</li>
                <li>Work experience relevance</li>
                <li>Educational background</li>
                <li>Industry-specific terms</li>
              </ul>
            </div>

            <div class="info-card">
              <h4>🤖 AI Models Used</h4>
              <ul>
                <li>BERT-base NER for entity extraction</li>
                <li>MiniLM for semantic similarity</li>
                <li>Custom keyword matching</li>
                <li>Recommendation engine</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="screening-actions">
          <button class="btn btn-secondary" @click="cancelScreening">
            Cancel Analysis
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useResumeStore } from '~/store/resume'

// Page metadata
useHead({
  title: 'Analyzing Resume - Smart Resume Screening',
  meta: [
    { name: 'description', content: 'AI-powered resume analysis in progress. Please wait while we process your resume.' }
  ]
})

const resumeStore = useResumeStore()
const router = useRouter()

const progress = ref(0)
const currentStep = ref(1)
const progressInterval = ref(null)

// Progress circle calculations
const circumference = 2 * Math.PI * 54
const strokeDashoffset = computed(() => {
  return circumference - (progress.value / 100) * circumference
})

// Methods
const simulateProgress = () => {
  const duration = 8000 // 8 seconds total
  const interval = 100 // Update every 100ms
  const increment = 100 / (duration / interval)
  
  progressInterval.value = setInterval(() => {
    if (progress.value < 100) {
      progress.value += increment
      
      // Update current step based on progress
      if (progress.value >= 25 && currentStep.value < 2) {
        currentStep.value = 2
      } else if (progress.value >= 50 && currentStep.value < 3) {
        currentStep.value = 3
      } else if (progress.value >= 75 && currentStep.value < 4) {
        currentStep.value = 4
      }
    } else {
      clearInterval(progressInterval.value)
      // Navigate to results page
      navigateToResults()
    }
  }, interval)
}

const navigateToResults = () => {
  if (resumeStore.screeningResults) {
    navigateTo('/result')
  } else {
    // If no results available, go back to home
    navigateTo('/')
  }
}

const cancelScreening = () => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
  resumeStore.clearResults()
  navigateTo('/')
}

// Lifecycle
onMounted(() => {
  // Check if we should be on this page
  if (!resumeStore.isScreening && !resumeStore.screeningResults) {
    navigateTo('/')
    return
  }
  
  // Start progress simulation if screening is in progress
  if (resumeStore.isScreening) {
    simulateProgress()
  } else if (resumeStore.screeningResults) {
    // If results are already available, navigate immediately
    navigateTo('/result')
  }
})

onUnmounted(() => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
})

// Watch for screening completion
watch(() => resumeStore.screeningResults, (newResults) => {
  if (newResults) {
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
    }
    progress.value = 100
    currentStep.value = 4
    setTimeout(() => {
      navigateTo('/result')
    }, 1000)
  }
})

// Watch for screening errors
watch(() => resumeStore.screeningError, (error) => {
  if (error) {
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
    }
    // Navigate back to home page on error
    navigateTo('/')
  }
})
</script>

<style scoped>
.screening-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
}

.screening-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.screening-header {
  margin-bottom: 48px;
}

.screening-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  font-weight: 700;
}

.screening-header p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.screening-progress {
  margin-bottom: 48px;
}

.progress-circle {
  margin-bottom: 48px;
}

.progress-ring {
  position: relative;
  display: inline-block;
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
}

.progress-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.step {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.step.completed {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
}

.step-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.step-content h3 {
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.step-content p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.screening-info {
  margin-bottom: 48px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  text-align: left;
}

.info-card h4 {
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  padding: 6px 0;
  padding-left: 24px;
  position: relative;
}

.info-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.screening-actions {
  margin-top: 32px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .screening-header h1 {
    font-size: 2rem;
  }
  
  .progress-steps {
    grid-template-columns: 1fr;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
}
</style>