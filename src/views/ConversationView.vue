<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white px-6 pt-6 pb-4 shadow-sm z-10">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">實用日語對話</h1>
      
      <!-- Category Tabs -->
      <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
        <button 
          v-for="category in store.categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border"
          :class="selectedCategory === category.id 
            ? 'bg-jp-red text-white border-jp-red shadow-md transform scale-105' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-jp-red/30 hover:bg-jp-red/5'"
        >
          <font-awesome-icon :icon="['fas', category.icon.replace('fa-', '')]" />
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-6 pb-24">
      <div class="grid gap-4">
        <div v-if="currentCategory" class="space-y-4">
          <div class="flex items-center justify-between mb-2 px-1">
            <div class="flex items-center gap-2 text-gray-500 text-sm">
              <font-awesome-icon :icon="['fas', currentCategory.icon.replace('fa-', '')]" />
              <span>{{ currentCategory.name }}情境</span>
              <span class="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{{ currentCategory.phrases.length }} 句</span>
            </div>
            
            <button 
              v-if="selectedCategory === 'custom'"
              @click="openAddModal"
              class="text-xs bg-jp-mustard text-white px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-yellow-600 transition-colors flex items-center gap-1"
            >
              <font-awesome-icon icon="fa-solid fa-plus" /> 新增對話
            </button>
          </div>
          
          <div v-if="currentCategory.phrases.length === 0" class="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <font-awesome-icon icon="fa-solid fa-pen-to-square" class="text-2xl mb-2 opacity-50" />
            <p class="text-sm">還沒有自訂對話</p>
            <button @click="openAddModal" class="mt-3 text-jp-mustard font-bold text-sm hover:underline">立即新增</button>
          </div>

          <ConversationCard 
            v-for="phrase in currentCategory.phrases" 
            :key="phrase.id" 
            :phrase="phrase" 
            :isCustom="selectedCategory === 'custom'"
            @edit="handleEditPhrase"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Phrase Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showAddModal = false">
      <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-scale-up">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-800">{{ editingPhraseId ? '編輯對話' : '新增自訂對話' }}</h3>
          <button @click="showAddModal = false" class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 transition-colors">
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
        </div>
        
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">中文 / 情境</label>
            <textarea 
              v-model="newPhrase.chinese" 
              rows="3"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-jp-mustard focus:ring-1 focus:ring-jp-mustard transition-all"
              placeholder="例如：我想買去東京的票"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2">
             <button 
               @click="handleAiAction('translate')" 
               :disabled="!newPhrase.chinese || isGenerating || isTranslating"
               class="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <font-awesome-icon :icon="isTranslating ? 'fa-solid fa-spinner' : 'fa-solid fa-language'" :class="{ 'animate-spin': isTranslating }" />
               {{ isTranslating ? '翻譯中...' : '翻譯' }}
             </button>

             <button 
               v-if="tripStore.settings.aiSettings?.apiKey"
               @click="handleAiAction('scenario')" 
               :disabled="!newPhrase.chinese || isGenerating || isTranslating"
               class="text-xs bg-jp-accent-blue/10 text-jp-accent-blue px-3 py-1.5 rounded-lg font-bold hover:bg-jp-accent-blue/20 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <font-awesome-icon :icon="isGenerating ? 'fa-solid fa-spinner' : 'fa-solid fa-wand-magic-sparkles'" :class="{ 'animate-spin': isGenerating }" />
               {{ isGenerating ? '生成中...' : 'AI 情境推薦' }}
             </button>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-xs font-bold text-gray-500">日文翻譯</label>
              <button 
                v-if="newPhrase.japanese"
                @click="speakJapanese"
                class="text-xs text-jp-dark hover:text-jp-red transition-colors flex items-center gap-1"
              >
                <font-awesome-icon icon="fa-solid fa-volume-high" /> 播放
              </button>
            </div>
            <textarea 
              v-model="newPhrase.japanese" 
              rows="3"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-jp-mustard focus:ring-1 focus:ring-jp-mustard transition-all font-jp"
              placeholder="AI 生成或手動輸入..."
            ></textarea>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 flex gap-3">
          <button @click="showAddModal = false" class="flex-1 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">取消</button>
          <button 
            @click="savePhrase" 
            :disabled="!newPhrase.chinese || !newPhrase.japanese"
            class="flex-1 py-2.5 rounded-xl font-bold text-white bg-jp-mustard hover:bg-yellow-600 transition-colors text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ editingPhraseId ? '更新' : '儲存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConversationStore } from '../stores/conversations'
import { useTripStore } from '../stores/trip.ts'
import ConversationCard from '../components/ConversationCard.vue'
import { GoogleGenerativeAI } from '@google/generative-ai'

const store = useConversationStore()
const tripStore = useTripStore()
const selectedCategory = ref(store.categories[0].id)

const currentCategory = computed(() => 
  store.categories.find(c => c.id === selectedCategory.value)
)

// Add/Edit Phrase Logic
const showAddModal = ref(false)
const newPhrase = ref({ chinese: '', japanese: '' })
const editingPhraseId = ref<string | null>(null)
const isGenerating = ref(false)
const isTranslating = ref(false)

const openAddModal = () => {
  newPhrase.value = { chinese: '', japanese: '' }
  editingPhraseId.value = null
  showAddModal.value = true
}

const handleEditPhrase = (phrase: any) => {
  console.log('Editing phrase:', phrase)
  newPhrase.value = { chinese: phrase.chinese, japanese: phrase.japanese }
  editingPhraseId.value = phrase.id
  showAddModal.value = true
}

const handleAiAction = async (mode: 'translate' | 'scenario') => {
  if (isTranslating.value || isGenerating.value) return
  if (!newPhrase.value.chinese) return
  
  // Set loading state immediately to prevent double clicks
  if (mode === 'translate') isTranslating.value = true
  else isGenerating.value = true

  if (!tripStore.settings.aiSettings?.apiKey) {
    // Reset loading state before alert so UI doesn't get stuck if they close it
    isTranslating.value = false
    isGenerating.value = false

    if (mode === 'translate') {
      const text = encodeURIComponent(newPhrase.value.chinese)
      window.open(`https://translate.google.com/?sl=zh-TW&tl=ja&text=${text}&op=translate`, '_blank')
    } else {
      alert('請先在設定中輸入 Google AI Studio API Key')
    }
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(tripStore.settings.aiSettings.apiKey)
    
    // Use fastest model for translation, otherwise use user setting
    const modelName = mode === 'translate' 
      ? 'gemini-2.5-flash-lite' 
      : (tripStore.settings.aiSettings.model || 'gemini-2.5-flash')
      
    const model = genAI.getGenerativeModel({ model: modelName })

    let prompt = ''
    if (mode === 'translate') {
      prompt = `
        Translate the following Chinese text into Japanese.
        Input: "${newPhrase.value.chinese}"
        
        Output ONLY the Japanese translation. No explanations.
      `
    } else {
      prompt = `
        Generate a natural, polite Japanese phrase that a traveler would say in this situation:
        Input: "${newPhrase.value.chinese}"
        
        If the input is already a specific sentence, polish it into natural polite Japanese.
        Output ONLY the Japanese phrase. No explanations.
      `
    }

    const result = await model.generateContent(prompt)
    const response = result.response.text().trim()
    newPhrase.value.japanese = response
  } catch (e) {
    console.error('AI Generation Error:', e)
    alert('生成失敗，請稍後再試: ' + (e as Error).message)
  } finally {
    isTranslating.value = false
    isGenerating.value = false
  }
}

const speakJapanese = () => {
  if (!newPhrase.value.japanese) return
  
  const utterance = new SpeechSynthesisUtterance(newPhrase.value.japanese)
  utterance.lang = 'ja-JP'
  utterance.rate = 0.9
  
  const voices = window.speechSynthesis.getVoices()
  let selectedVoice = null

  // 1. Try to use the user's preferred voice from settings
  if (tripStore.settings.voiceURI) {
    selectedVoice = voices.find(v => v.voiceURI === tripStore.settings.voiceURI)
  }

  // 2. Fallback to any Japanese voice if preferred one is not found
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'))
  }

  if (selectedVoice) utterance.voice = selectedVoice
  
  window.speechSynthesis.speak(utterance)
}

const savePhrase = () => {
  console.log('savePhrase called', { 
    chinese: newPhrase.value.chinese, 
    japanese: newPhrase.value.japanese, 
    editingPhraseId: editingPhraseId.value 
  })

  if (newPhrase.value.chinese && newPhrase.value.japanese) {
    try {
      if (editingPhraseId.value) {
        console.log('Updating phrase...')
        if (store.updateCustomPhrase) {
          store.updateCustomPhrase(editingPhraseId.value, {
            chinese: newPhrase.value.chinese,
            japanese: newPhrase.value.japanese
          })
        } else {
          console.error('store.updateCustomPhrase is undefined')
          alert('更新失敗：Store 方法未定義，請重新整理頁面')
        }
      } else {
        console.log('Adding new phrase...')
        store.addCustomPhrase({
          chinese: newPhrase.value.chinese,
          japanese: newPhrase.value.japanese
        })
      }
      showAddModal.value = false
    } catch (e) {
      console.error('Error saving phrase:', e)
      alert('儲存失敗：' + (e as Error).message)
    }
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
.font-jp {
  font-family: "Noto Sans JP", sans-serif;
}
.animate-scale-up {
  animation: scaleUp 0.2s ease-out;
}
@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
