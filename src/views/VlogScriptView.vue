<template>
  <div class="h-full overflow-y-auto px-4 py-6 pb-24">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
          <font-awesome-icon icon="fa-solid fa-clapperboard" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-jp-dark">Vlog 拍攝腳本</h1>
          <p class="text-xs text-gray-400">AI 幫你規劃拍攝清單</p>
        </div>
      </div>
    </div>

    <!-- Trip Info Card -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-bold text-jp-dark">{{ store.title }}</h2>
        <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {{ store.days.length }} 天
        </span>
      </div>
      
      <!-- Day Selector -->
      <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          v-for="(_, idx) in store.days"
          :key="idx"
          @click="selectedDayIndex = idx"
          class="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          :class="selectedDayIndex === idx 
            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Day {{ idx + 1 }}
        </button>
        <button
          @click="selectedDayIndex = -1"
          class="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          :class="selectedDayIndex === -1 
            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          全部
        </button>
      </div>
    </div>

    <!-- Selected Day Preview -->
    <div v-if="selectedEvents.length > 0" class="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
      <p class="text-xs text-gray-500 mb-2">
        <font-awesome-icon icon="fa-solid fa-location-dot" class="mr-1" />
        將為以下 {{ selectedEvents.length }} 個景點生成拍攝腳本：
      </p>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="(evt, idx) in selectedEvents.slice(0, 5)" 
          :key="idx"
          class="text-xs bg-white px-2 py-1 rounded-lg border border-gray-200 text-gray-600"
        >
          {{ evt.title }}
        </span>
        <span v-if="selectedEvents.length > 5" class="text-xs text-gray-400 px-2 py-1">
          +{{ selectedEvents.length - 5 }} 更多
        </span>
      </div>
    </div>

    <!-- Generate Button -->
    <button
      @click="generateScript"
      :disabled="isLoading || selectedEvents.length === 0 || !hasApiKey"
      class="w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg mb-6 flex items-center justify-center gap-2"
      :class="isLoading || selectedEvents.length === 0 || !hasApiKey
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:shadow-xl hover:scale-[1.02]'"
    >
      <font-awesome-icon v-if="isLoading" icon="fa-solid fa-spinner" class="animate-spin" />
      <font-awesome-icon v-else icon="fa-solid fa-wand-magic-sparkles" />
      {{ isLoading ? '生成中...' : '生成拍攝腳本' }}
    </button>

    <!-- No API Key Warning -->
    <div v-if="!hasApiKey" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <div class="flex items-center gap-2 text-amber-700 text-sm">
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
        <span>請先在設定中配置 AI API Key</span>
      </div>
      <button 
        @click="store.setSettingsOpen(true, 'ai')"
        class="mt-2 text-xs text-amber-600 underline"
      >
        前往設定
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
      <div class="flex items-center gap-2 text-red-700 text-sm">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Script Results -->
    <div v-if="scriptItems.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-jp-dark flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-film" class="text-rose-500" />
          拍攝清單
        </h3>
        <span class="text-xs text-gray-400">{{ scriptItems.length }} 個鏡頭</span>
      </div>

      <!-- Script Cards -->
      <div 
        v-for="(item, idx) in scriptItems" 
        :key="idx"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
      >
        <!-- Shot Number Badge -->
        <div class="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm rounded-bl-2xl">
          {{ idx + 1 }}
        </div>

        <!-- Scene Title -->
        <h4 class="font-bold text-jp-dark mb-2 pr-10">{{ item.scene }}</h4>
        
        <!-- Action -->
        <div class="mb-3">
          <p class="text-sm text-gray-600">{{ item.action }}</p>
        </div>

        <!-- Meta Tags -->
        <div class="flex flex-wrap gap-2 mb-3">
          <!-- Camera Movement -->
          <span class="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">
            <font-awesome-icon icon="fa-solid fa-video" />
            {{ item.camera }}
          </span>
          <!-- Duration -->
          <span class="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg border border-green-100">
            <font-awesome-icon icon="fa-solid fa-clock" />
            {{ item.sec }}
          </span>
        </div>

        <!-- Practice Button -->
        <button 
          v-if="getVlogMoveId(item.camera)"
          @click="goToPractice(item.camera)"
          class="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <font-awesome-icon icon="fa-solid fa-gamepad" />
          練習此運鏡
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && scriptItems.length === 0" class="text-center py-12">
      <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-clapperboard" class="text-3xl text-gray-300" />
      </div>
      <p class="text-gray-400 text-sm">選擇天數後點擊「生成拍攝腳本」</p>
      <p class="text-gray-300 text-xs mt-1">AI 會根據你的行程生成專業的 Vlog 拍攝建議</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/trip'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = useRouter()
const store = useTripStore()

const selectedDayIndex = ref(0)
const isLoading = ref(false)
const error = ref('')
const scriptItems = ref<Array<{
  scene: string
  action: string
  camera: string
  sec: string
}>>([])

const hasApiKey = computed(() => !!store.settings.aiSettings?.apiKey)

const selectedEvents = computed(() => {
  if (selectedDayIndex.value === -1) {
    // All days
    return store.days.flatMap(day => day.events)
  }
  return store.days[selectedDayIndex.value]?.events || []
})

const generateScript = async () => {
  if (!hasApiKey.value || selectedEvents.value.length === 0) return

  isLoading.value = true
  error.value = ''
  scriptItems.value = []

  try {
    const apiKey = store.settings.aiSettings?.apiKey
    const modelName = store.settings.aiSettings?.model || 'gemini-2.5-flash'

    if (!apiKey) throw new Error('API Key not found')

    // Simplify itinerary data to save tokens
    const simplifiedItinerary = selectedEvents.value.map(evt => ({
      time: evt.time,
      title: evt.title,
      location: evt.location || '',
      category: evt.category
    }))

    const systemPrompt = `Role: Professional Travel Vlog Director & Editor.
Task: Convert the given travel itinerary (JSON) into a 4-6 shot filming checklist.
Output Format: Pure JSON Array (No Markdown, no code blocks, just the raw JSON array).
Schema:
[
  {
    "scene": "Short scene title in Traditional Chinese",
    "action": "Specific instruction on what to film (subject, background) in Traditional Chinese",
    "camera": "Camera movement technique (e.g., Pan, Zoom, POV, Static, Tracking, Dolly, Timelapse)",
    "sec": "Estimated duration (e.g., '3s', '5s')"
  }
]
Constraints:
1. Focus on cinematic and storytelling angles.
2. Adapt to the time of day mentioned in the itinerary.
3. Suggest creative shots that highlight the destination's unique features.
4. Include a variety of shot types (wide, medium, close-up).
5. Output ONLY the JSON array, nothing else.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemPrompt
    })

    const result = await model.generateContent(
      `Here is the itinerary:\n${JSON.stringify(simplifiedItinerary, null, 2)}`
    )

    const responseText = result.response.text()
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('無法解析 AI 回應')
    }

    const parsed = JSON.parse(jsonMatch[0])
    scriptItems.value = parsed

  } catch (e: any) {
    console.error('Vlog Script Error:', e)
    error.value = e.message || '生成失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// 將運鏡名稱對應到練習模式 ID
const cameraToMoveMap: Record<string, string> = {
  'Pan': 'pan-right',
  'Pan Right': 'pan-right',
  'Pan Left': 'pan-left',
  'Tilt': 'tilt-up',
  'Tilt Up': 'tilt-up',
  'Tilt Down': 'tilt-down'
}

const getVlogMoveId = (camera: string): string | null => {
  for (const [key, value] of Object.entries(cameraToMoveMap)) {
    if (camera.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  return null
}

const goToPractice = (camera: string) => {
  const moveId = getVlogMoveId(camera)
  if (moveId) {
    router.push({
      path: '/ai-camera',
      query: { mode: 'vlog', move: moveId }
    })
  }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
