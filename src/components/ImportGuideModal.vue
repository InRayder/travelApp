<template>
  <transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-0 flex items-end justify-center pointer-events-none" :style="{ zIndex }">
      <div class="absolute inset-0 bg-black/40 pointer-events-auto transition-opacity backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="bg-white w-full max-w-md h-[92vh] rounded-t-3xl pointer-events-auto shadow-2xl flex flex-col relative z-[100] overflow-hidden">
        
        <!-- Header / Hero Section -->
        <div class="h-48 relative shrink-0 overflow-hidden group bg-gray-100">
           <!-- Default Gradient or Analyzed Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br transition-all duration-500" :class="analyzedData?.color || 'from-gray-700 to-gray-900'"></div>
          
          <!-- Background Image (if any) -->
          <div v-if="analyzedData?.thumbnail_url" class="absolute inset-0 bg-cover bg-center transition-opacity duration-500 z-0" :style="{ backgroundImage: `url('${analyzedData.thumbnail_url}')` }">
            <div class="absolute inset-0 bg-black/30"></div>
          </div>

          <div class="absolute inset-0 flex items-center justify-center text-white/20">
            <font-awesome-icon :icon="analyzedData?.icon || 'fa-solid fa-wand-magic-sparkles'" class="text-9xl transform -rotate-12 translate-x-10 translate-y-4" />
          </div>

          <button @click="closeModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/30 transition-colors z-20">
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>

          <!-- Title Area -->
          <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <div v-if="analyzedData" class="flex gap-2 mb-2">
              <span v-for="tag in analyzedData.tags" :key="tag" class="text-[10px] bg-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">#{{ tag }}</span>
            </div>
            <h2 class="text-3xl font-black text-white tracking-wide shadow-black drop-shadow-md">
              {{ analyzedData?.title || 'AI 智能匯入' }}
            </h2>
             <div v-if="analyzedData?.location?.name" class="flex items-center text-white/80 text-xs mt-1">
                <font-awesome-icon icon="fa-solid fa-location-dot" class="mr-1" />
                {{ analyzedData.location.name }}
            </div>
          </div>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto bg-white relative flex flex-col">
          
          <!-- Input State (Before Analysis) -->
          <div v-if="!analyzedData" class="p-6 space-y-6">
            <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <h3 class="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                <font-awesome-icon icon="fa-solid fa-robot" />
                如何使用？
              </h3>
              <p class="text-xs text-blue-900/70 leading-relaxed">
                貼上 Instagram/Facebook 貼文連結、Google Maps 地點連結，或是直接複製貼文內容。AI 會自動分析景點資訊、必看重點與參觀撇步，並整理成精美的旅遊攻略卡片。
              </p>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">分享連結 (Link)</label>
              <input v-model="form.url" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-jp-mustard transition-colors" placeholder="https://instagram.com/..." />
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">內容描述 (Description / Caption)</label>
              <textarea v-model="form.text" rows="6" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-jp-mustard transition-colors resize-none" placeholder="貼上貼文內容或輸入影片重點..."></textarea>
              <p class="text-[10px] text-gray-400 mt-1 text-right">越詳細的描述能讓 AI 分析越準確</p>
            </div>

            <div v-if="error" class="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex flex-col gap-2">
              <div class="flex items-start gap-2">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
                <span>{{ error }}</span>
              </div>
              <button v-if="error.includes('API Key')" @click="store.setSettingsOpen(true)" class="self-end text-xs font-bold underline hover:text-red-800">
                前往設定
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-8">
              <div class="w-12 h-12 border-4 border-jp-mustard border-t-transparent rounded-full animate-spin mb-4"></div>
              <p class="text-sm font-bold text-gray-600 animate-pulse">AI 正在分析內容中...</p>
              <p class="text-xs text-gray-400 mt-2">正在擷取景點資訊、美食與特色</p>
            </div>
            
             <button v-else @click="analyze" :disabled="!form.url && !form.text" class="w-full py-4 rounded-xl text-sm font-bold text-white bg-jp-mustard shadow-lg shadow-yellow-200 hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" />
              開始分析
            </button>
          </div>

          <!-- Edit/Preview State (After Analysis) -->
          <div v-else class="flex-1 p-6 space-y-4">
             <!-- Edit Form (Similar to GuideModal) -->
            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">景點名稱 (Title)</label>
              <input v-model="analyzedData.title" class="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-200 text-sm font-bold text-jp-dark focus:bg-white focus:border-jp-mustard transition-colors" placeholder="景點名稱">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs font-bold text-gray-500 block mb-1">地點 (Location)</label>
                    <input v-model="analyzedData.location.name" class="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-200 text-sm focus:bg-white focus:border-jp-mustard transition-colors" placeholder="e.g. 東京">
                </div>
                 <div>
                    <label class="text-xs font-bold text-gray-500 block mb-1">狀態 (Status)</label>
                    <select v-model="analyzedData.status" class="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-200 text-sm focus:bg-white focus:border-jp-mustard transition-colors">
                        <option value="want_to_go">想去</option>
                        <option value="planned">已排程</option>
                        <option value="visited">已去過</option>
                    </select>
                </div>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">簡介 (Description)</label>
              <textarea v-model="analyzedData.desc" rows="3" class="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-200 text-sm resize-none focus:bg-white focus:border-jp-mustard transition-colors"></textarea>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">個人筆記 (User Notes)</label>
              <textarea v-model="analyzedData.user_notes" rows="2" class="w-full bg-yellow-50 p-3 rounded-xl outline-none border border-yellow-200 text-sm resize-none focus:bg-white focus:border-jp-mustard transition-colors" placeholder="為什麼想去？"></textarea>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">標籤 (Tags)</label>
              <input v-model="tagsInput" class="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-200 text-sm focus:bg-white focus:border-jp-mustard transition-colors" placeholder="標籤1, 標籤2">
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">必看重點 (Highlights)</label>
              <textarea v-model="highlightsInput" rows="3" class="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-200 text-sm resize-none focus:bg-white focus:border-jp-mustard transition-colors" placeholder="重點1&#10;重點2"></textarea>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">參觀小撇步 (Tips)</label>
              <textarea v-model="analyzedData.tips" rows="2" class="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-200 text-sm resize-none focus:bg-white focus:border-jp-mustard transition-colors"></textarea>
            </div>

             <div>
              <label class="text-xs font-bold text-gray-500 block mb-2">主題顏色 (Theme Color)</label>
              <div class="grid grid-cols-5 gap-2">
                <button 
                  v-for="color in PRESET_COLORS" 
                  :key="color" 
                  @click="analyzedData.color = color"
                  class="h-8 rounded-lg transition-all border-2 bg-gradient-to-br"
                  :class="[color, analyzedData.color === color ? 'border-jp-dark scale-110 shadow-md' : 'border-transparent hover:scale-105']"
                ></button>
              </div>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-500 block mb-2">圖示 (Icon)</label>
              <div class="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                <button 
                  v-for="icon in PRESET_ICONS" 
                  :key="icon" 
                  @click="analyzedData.icon = icon"
                  class="h-10 rounded-lg flex items-center justify-center transition-all border-2 bg-white"
                  :class="analyzedData.icon === icon ? 'border-jp-mustard text-jp-mustard shadow-md' : 'border-gray-100 text-gray-400 hover:border-gray-200'"
                >
                  <font-awesome-icon :icon="icon" class="text-lg" />
                </button>
              </div>
            </div>

            <div class="h-20"></div> <!-- Spacer for fixed bottom buttons -->
          </div>

        </div>

        <!-- Footer Buttons (Only for Analyzed State) -->
        <div v-if="analyzedData" class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 z-10">
          <button @click="reset" class="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">重新分析</button>
          <button @click="save" class="flex-[2] py-3 rounded-xl text-sm font-bold text-white bg-jp-dark shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            <font-awesome-icon icon="fa-solid fa-save" />
            儲存攻略
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch, toRef } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import { generateGuideFromContent } from '../services/aiService'
import type { Guide } from '../stores/trip.ts'
import { useDynamicZIndex } from '../composables/useZIndex'

const PRESET_COLORS = [
  'from-pink-500 to-red-600',
  'from-red-600 to-red-800',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-yellow-600 to-orange-600', // Mustard
  'from-green-400 to-emerald-600',
  'from-teal-400 to-cyan-600',
  'from-cyan-400 to-blue-500',
  'from-blue-500 to-indigo-600',
  'from-indigo-500 to-purple-600',
  'from-purple-500 to-pink-500',
  'from-gray-600 to-gray-800',
]

const PRESET_ICONS = [
  'fa-solid fa-torii-gate', 'fa-solid fa-archway', 'fa-solid fa-gopuram', 'fa-solid fa-landmark',
  'fa-solid fa-mountain-sun', 'fa-solid fa-water', 'fa-solid fa-tree', 'fa-solid fa-leaf',
  'fa-solid fa-umbrella-beach', 'fa-solid fa-ship', 'fa-solid fa-train-subway', 'fa-solid fa-plane',
  'fa-solid fa-utensils', 'fa-solid fa-bowl-food', 'fa-solid fa-mug-hot', 'fa-solid fa-beer-mug-empty',
  'fa-solid fa-bag-shopping', 'fa-solid fa-gift', 'fa-solid fa-store', 'fa-solid fa-cart-shopping',
  'fa-solid fa-camera', 'fa-solid fa-ticket', 'fa-solid fa-masks-theater', 'fa-solid fa-palette',
  'fa-solid fa-bed', 'fa-solid fa-hot-tub-person', 'fa-solid fa-person-walking', 'fa-solid fa-bicycle'
]

const props = defineProps<{
  isOpen: boolean
  initialData?: { title?: string, text?: string, url?: string }
}>()

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close', 'save'])

const store = useTripStore()
const isLoading = ref(false)
const error = ref('')
const analyzedData = ref<(Guide & { title?: string }) | null>(null)

// Helper refs for array inputs
const tagsInput = ref('')
const highlightsInput = ref('')

const form = reactive({
  url: '',
  text: ''
})

const reset = () => {
  form.url = ''
  form.text = ''
  error.value = ''
  analyzedData.value = null
  isLoading.value = false
  tagsInput.value = ''
  highlightsInput.value = ''
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    reset()
    if (props.initialData) {
      form.url = props.initialData.url || ''
      form.text = [props.initialData.title, props.initialData.text].filter(Boolean).join('\n\n')
    }
  }
}, { immediate: true })

// Watch analyzedData to sync helper inputs when data arrives
watch(analyzedData, (newData) => {
  if (newData) {
    tagsInput.value = newData.tags.join(', ')
    highlightsInput.value = newData.highlights.join('\n')
  }
})

const analyze = async () => {
  if (!form.url && !form.text) return
  
  const apiKey = store.settings.aiSettings?.apiKey
  if (!apiKey) {
    error.value = '請先設定 Google AI Studio API Key 才能使用此功能。'
    return
  }

  isLoading.value = true
  error.value = ''
  
  try {
    const model = store.settings.aiSettings?.model
    
    // Call AI Service
    const result = await generateGuideFromContent(apiKey, model || '', form.text, form.url)
    
    analyzedData.value = result as Guide & { title: string }
    
    // If title is missing from AI (fallback), try to extract from text or use default
    if (!analyzedData.value.title) {
        analyzedData.value.title = '新景點'
    }

  } catch (e: any) {
    error.value = e.message || '分析發生錯誤'
  } finally {
    isLoading.value = false
  }
}

const save = () => {
  if (analyzedData.value) {
    // Sync back helper inputs
    analyzedData.value.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t)
    analyzedData.value.highlights = highlightsInput.value.split('\n').map(h => h.trim()).filter(h => h)

    const { title, ...data } = analyzedData.value
    emit('save', title || '未命名攻略', data)
    closeModal()
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
