<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Enterprise Header -->
      <header class="mb-8 border-b border-gray-100 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Talent Dashboard</h1>
            <p class="text-sm text-gray-600 mt-1">AI-powered recruitment analytics</p>
          </div>
          <div class="flex items-center space-x-4">
            <select class="border border-gray-200 rounded-md px-3 py-2 text-sm">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
            <button class="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
              Export Report
            </button>
          </div>
        </div>
      </header>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white border border-gray-100 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Screenings</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.totalScreenings }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="mt-2 flex items-center text-sm">
            <span class="text-green-600">+12%</span>
            <span class="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div class="bg-white border border-gray-100 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Avg. Match Score</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.avgMatchScore }}%</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="mt-2 flex items-center text-sm">
            <span class="text-green-600">+5%</span>
            <span class="text-gray-500 ml-1">quality improvement</span>
          </div>
        </div>

        <div class="bg-white border border-gray-100 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Time Saved</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.timeSaved }}h</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-2 flex items-center text-sm">
            <span class="text-green-600">85%</span>
            <span class="text-gray-500 ml-1">efficiency gain</span>
          </div>
        </div>

        <div class="bg-white border border-gray-100 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Hired Candidates</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.hiredCandidates }}</p>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div class="mt-2 flex items-center text-sm">
            <span class="text-green-600">92%</span>
            <span class="text-gray-500 ml-1">success rate</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Screenings -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-gray-100 rounded-lg">
            <div class="border-b border-gray-100 px-6 py-4">
              <h2 class="text-lg font-medium text-gray-900">Recent Screenings</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div v-for="screening in recentScreenings" :key="screening.id" 
                     class="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-600">{{ screening.initials }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ screening.position }}</p>
                      <p class="text-sm text-gray-500">{{ screening.department }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="text-right">
                      <div class="flex items-center">
                        <span class="text-lg font-semibold" :class="getScoreColor(screening.score)">
                          {{ screening.score }}%
                        </span>
                      </div>
                      <p class="text-xs text-gray-500">{{ screening.date }}</p>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skills Analytics -->
        <div>
          <div class="bg-white border border-gray-100 rounded-lg">
            <div class="border-b border-gray-100 px-6 py-4">
              <h2 class="text-lg font-medium text-gray-900">In-Demand Skills</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div v-for="skill in topSkills" :key="skill.name" class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">{{ skill.name }}</span>
                  <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full" :style="{ width: skill.percentage + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-8 text-right">{{ skill.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Performance -->
          <div class="bg-white border border-gray-100 rounded-lg mt-6">
            <div class="border-b border-gray-100 px-6 py-4">
              <h2 class="text-lg font-medium text-gray-900">Team Performance</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div v-for="member in teamPerformance" :key="member.id" class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium text-gray-600">{{ member.initials }}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-700">{{ member.name }}</span>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ member.screenings }}</p>
                    <p class="text-xs text-gray-500">screenings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock data - replace with API calls
const metrics = ref({
  totalScreenings: 1247,
  avgMatchScore: 78,
  timeSaved: 342,
  hiredCandidates: 28
})

const recentScreenings = ref([
  { id: 1, initials: 'JS', position: 'Senior Frontend Developer', department: 'Engineering', score: 92, date: '2 hours ago' },
  { id: 2, initials: 'MK', position: 'Product Manager', department: 'Product', score: 78, date: '5 hours ago' },
  { id: 3, initials: 'AL', position: 'Data Scientist', department: 'Analytics', score: 85, date: '1 day ago' }
])

const topSkills = ref([
  { name: 'React', percentage: 85 },
  { name: 'Python', percentage: 78 },
  { name: 'AWS', percentage: 72 },
  { name: 'Node.js', percentage: 68 },
  { name: 'TypeScript', percentage: 64 }
])

const teamPerformance = ref([
  { id: 1, name: 'Sarah Chen', initials: 'SC', screenings: 45 },
  { id: 2, name: 'Mike Johnson', initials: 'MJ', screenings: 38 },
  { id: 3, name: 'Lisa Wong', initials: 'LW', screenings: 32 }
])

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}
</script>