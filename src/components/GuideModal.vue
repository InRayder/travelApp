<template>
  <transition name="slide-up">
    <div v-if="isOpen && guide" class="fixed inset-0 z-[110] flex items-end justify-center pointer-events-none">
      <div class="absolute inset-0 bg-black/40 pointer-events-auto transition-opacity backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white w-full max-w-md h-[92vh] rounded-t-3xl pointer-events-auto shadow-2xl flex flex-col relative z-[100] overflow-hidden">
        
        <!-- 主視覺區塊 (Hero Section) -->
        <div class="h-48 relative shrink-0 overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br transition-all duration-500" :class="displayData.color"></div>
          <!-- Background Image -->
          <div v-if="displayData.image" class="absolute inset-0 bg-cover bg-center transition-opacity duration-500 z-0" :style="{ backgroundImage: `url('${displayData.image}')` }">
            <div class="absolute inset-0 bg-black/30"></div>
          </div>

          <div class="absolute inset-0 flex items-center justify-center text-white/20">
            <font-awesome-icon :icon="displayData.icon" class="text-9xl transform -rotate-12 translate-x-10 translate-y-4" />
          </div>
          <button @click="closeModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/30 transition-colors z-20">
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
          <!-- 編輯/儲存按鈕 -->
          <button v-if="!isEditing" @click="startEdit" class="absolute top-4 right-14 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-colors z-20 border border-white/30">
            <font-awesome-icon icon="fa-solid fa-pen" class="text-xs" />
          </button>
          <button v-else @click="saveEdit" class="absolute top-4 right-14 w-8 h-8 rounded-full bg-jp-mustard text-white flex items-center justify-center shadow-lg hover:bg-yellow-600 transition-colors z-20">
            <font-awesome-icon icon="fa-solid fa-check" class="text-xs" />
          </button>
          
          <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <div class="flex gap-2 mb-2">
              <span v-for="tag in displayData.tags" :key="tag" class="text-[10px] bg-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">#{{ tag }}</span>
            </div>
            <h2 class="text-3xl font-black text-white tracking-wide shadow-black drop-shadow-md">{{ guide.title }}</h2>
          </div>
        </div>

        <!-- 內容 (Content) - View Mode -->
        <div v-if="!isEditing" class="flex-1 overflow-y-auto p-6 bg-white relative">
          <div class="prose prose-sm max-w-none text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">{{ displayData.desc }}</div>

          <!-- 必做事項 (Must Do) -->
          <div class="mb-8">
            <h3 class="font-bold text-jp-dark text-lg mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-jp-mustard rounded-full"></span> Must Do 必體驗
            </h3>
            <div class="space-y-3">
              <div v-for="(item, i) in displayData.highlights" :key="i" class="flex items-start gap-3 bg-jp-cream p-3 rounded-xl border border-dashed border-gray-200">
                <div class="w-6 h-6 rounded-full bg-jp-mustard text-white flex items-center justify-center shrink-0 text-xs font-bold">{{ i + 1 }}</div>
                <span class="text-sm font-medium text-gray-700 pt-0.5">{{ item }}</span>
              </div>
            </div>
          </div>

          <!-- 達人撇步 (Pro Tips) -->
          <div class="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 relative mb-8">
            <font-awesome-icon icon="fa-solid fa-lightbulb" class="text-yellow-400 text-xl absolute -top-3 -left-2 drop-shadow-sm filter" />
            <h3 class="font-bold text-blue-800 text-sm mb-2 ml-4">Traveler's Tips</h3>
            <p class="text-xs text-blue-900/70 leading-relaxed whitespace-pre-wrap">{{ displayData.tips }}</p>
          </div>

          <!-- 外部連結 (External Link) -->
          <a v-if="displayData.link" :href="displayData.link" target="_blank" class="block w-full py-4 bg-gray-900 text-white text-center rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-colors">
            <font-awesome-icon icon="fa-solid fa-globe" class="mr-2" /> 訪問官方網站 / 更多資訊
          </a>
          <div class="h-8"></div>
        </div>

        <!-- 編輯模式 (Edit Mode) -->
        <div v-else class="flex-1 overflow-y-auto p-6 bg-gray-50 relative space-y-4">
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">景點名稱 (Title)</label>
            <input v-model="editForm.title" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm font-bold text-jp-dark" placeholder="景點名稱">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">背景圖片連結 (Image URL)</label>
            <input v-model="editForm.image" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm" placeholder="https://...">
            <div class="mt-2 text-[10px] text-gray-400 flex gap-2">
              <span>推薦資源:</span>
              <a href="https://unsplash.com/" target="_blank" class="text-blue-500 hover:underline">Unsplash</a>
              <a href="https://www.pexels.com/" target="_blank" class="text-blue-500 hover:underline">Pexels</a>
              <a href="https://pixabay.com/" target="_blank" class="text-blue-500 hover:underline">Pixabay</a>
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">簡介 (Description)</label>
            <textarea v-model="editForm.desc" rows="4" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm resize-none"></textarea>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">標籤 (Tags, comma separated)</label>
            <input v-model="tagsInput" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm" placeholder="標籤1, 標籤2">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">必看重點 (Highlights, one per line)</label>
            <textarea v-model="highlightsInput" rows="4" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm resize-none" placeholder="重點1&#10;重點2&#10;重點3"></textarea>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">參觀小撇步 (Tips)</label>
            <textarea v-model="editForm.tips" rows="3" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm resize-none"></textarea>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">相關連結 (Link)</label>
            <input v-model="editForm.link" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm" placeholder="https://...">
          </div>
          
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">主題顏色 (Tailwind Class)</label>
            <input v-model="editForm.color" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm font-mono" placeholder="from-pink-500 to-red-600">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">圖示 (FontAwesome Class)</label>
            <input v-model="editForm.icon" class="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 text-sm font-mono" placeholder="fa-solid fa-torii-gate">
          </div>

          <div class="h-8"></div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Guide } from '../stores/trip.ts'

const props = defineProps<{
  isOpen: boolean
  guide: { title: string, data: Guide } | null
  initialEditMode?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const isEditing = ref(false)
const editForm = ref<Guide & { title: string }>({
  title: '',
  color: '',
  icon: '',
  desc: '',
  tags: [],
  highlights: [],
  tips: '',
  link: '',
  image: ''
})

const tagsInput = ref('')
const highlightsInput = ref('')

const displayData = computed(() => {
  if (isEditing.value) return editForm.value
  return props.guide?.data || {
    color: '',
    icon: '',
    tags: [],
    desc: '',
    highlights: [],
    tips: '',
    link: '',
    image: ''
  }
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialEditMode) {
      startEdit()
    } else {
      isEditing.value = false
    }
  }
})

const startEdit = () => {
  if (!props.guide) return
  editForm.value = {
    title: props.guide.title,
    ...JSON.parse(JSON.stringify(props.guide.data))
  }
  tagsInput.value = editForm.value.tags.join(', ')
  highlightsInput.value = editForm.value.highlights.join('\n')
  isEditing.value = true
}

const saveEdit = () => {
  if (!props.guide) return

  // Process inputs
  editForm.value.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t)
  editForm.value.highlights = highlightsInput.value.split('\n').map(h => h.trim()).filter(h => h)
  
  const { title, ...data } = editForm.value
  const dataToSave = JSON.parse(JSON.stringify(data))
  console.log('GuideModal emitting save:', title, dataToSave)
  emit('save', title, dataToSave, props.guide.title) // Emit new title, data, and old title
  isEditing.value = false
}

const closeModal = () => {
  isEditing.value = false
  emit('close')
}
</script>
