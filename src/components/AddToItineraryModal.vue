<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center p-4" :style="{ zIndex }">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
      
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 class="text-sm font-bold text-jp-dark">加入行程</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
        </div>

        <div class="overflow-y-auto p-4 space-y-6">
          <!-- Guide Info -->
          <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
             <div class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <font-awesome-icon :icon="guide?.icon || 'fa-solid fa-location-dot'" />
             </div>
             <div class="min-w-0">
                <div class="text-sm font-bold text-jp-dark truncate">{{ guide?.title }}</div>
                <div class="text-xs text-gray-500 truncate">{{ guide?.location?.name || '未指定地點' }}</div>
             </div>
          </div>

          <!-- AI Suggestion -->
          <div v-if="store.settings.aiSettings?.apiKey" class="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100 relative overflow-hidden">
            <div class="flex items-start gap-3 relative z-10">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                    <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" :class="{ 'animate-pulse': isAiLoading }" />
                </div>
                <div class="flex-1">
                    <div class="text-xs font-bold text-indigo-800 mb-1">AI 智慧建議</div>
                    <div v-if="isAiLoading" class="text-xs text-indigo-600/70">正在分析行程與順路程度...</div>
                    <div v-else-if="aiReason" class="text-xs text-indigo-700 leading-relaxed">
                        {{ aiReason }}
                        <button v-if="suggestedDayIndex !== selectedDayIndex" @click="applySuggestion" class="block mt-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-200 transition-colors">
                            套用建議 (Day {{ suggestedDayIndex + 1 }})
                        </button>
                    </div>
                </div>
            </div>
          </div>

          <!-- Form -->
          <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">選擇日期</label>
                <select v-model="selectedDayIndex" class="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-jp-mustard">
                <option v-for="(day, index) in store.days" :key="index" :value="index">
                    {{ day.dateStr }}
                </option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">預計時間</label>
                <input type="time" v-model="selectedTime" class="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-jp-mustard">
            </div>
          </div>

          <!-- Itinerary Overview -->
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-2">行程概覽</label>
            <div class="space-y-2">
                <div 
                    v-for="(day, index) in store.days" 
                    :key="index"
                    @click="selectedDayIndex = index"
                    class="p-3 rounded-xl border transition-all cursor-pointer hover:bg-gray-50"
                    :class="selectedDayIndex === index ? 'border-jp-mustard bg-yellow-50/50 ring-1 ring-jp-mustard/20' : 'border-gray-100 bg-white'"
                >
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-gray-700">Day {{ index + 1 }} - {{ day.dateStr }}</span>
                        <span v-if="selectedDayIndex === index" class="text-[10px] text-jp-mustard font-bold bg-white px-2 py-0.5 rounded-full shadow-sm">已選擇</span>
                    </div>
                    
                    <div v-if="day.events.length > 0" class="flex flex-wrap gap-1.5">
                        <span v-for="event in day.events.slice(0, 4)" :key="event.id" class="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            {{ event.time }} {{ event.title }}
                        </span>
                        <span v-if="day.events.length > 4" class="text-[10px] text-gray-400 px-1">...</span>
                    </div>
                    <div v-else class="text-[10px] text-gray-400 italic">尚無行程</div>
                </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 flex gap-2 shrink-0 bg-white">
          <button @click="$emit('close')" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50">
            取消
          </button>
          <button @click="confirm" class="flex-1 py-2.5 rounded-xl bg-jp-mustard text-white text-xs font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-200">
            加入行程
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import { suggestItineraryPlacement } from '../services/aiService'
import type { Guide } from '../stores/trip.ts'
import { useDynamicZIndex } from '../composables/useZIndex'

const props = defineProps<{
  isOpen: boolean
  guide?: (Guide & { title: string }) | null
}>()

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close', 'add'])
const store = useTripStore()

const selectedDayIndex = ref(0)
const selectedTime = ref('')
const isAiLoading = ref(false)
const aiReason = ref('')
const suggestedDayIndex = ref(-1)

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.guide) {
    // Reset
    selectedDayIndex.value = 0
    selectedTime.value = ''
    aiReason.value = ''
    suggestedDayIndex.value = -1
    
    // AI Analysis
    if (store.settings.aiSettings?.apiKey) {
        isAiLoading.value = true
        try {
            const result = await suggestItineraryPlacement(
                store.settings.aiSettings.apiKey,
                store.settings.aiSettings.model || '',
                props.guide,
                store.days
            )
            
            aiReason.value = result.reason
            suggestedDayIndex.value = result.dayIndex
            
            // Auto-select if valid
            if (result.dayIndex >= 0 && result.dayIndex < store.days.length) {
                selectedDayIndex.value = result.dayIndex
                if (result.suggestedTime) {
                    selectedTime.value = result.suggestedTime
                }
            }
        } catch (e) {
            console.error(e)
            aiReason.value = '無法取得 AI 建議'
        } finally {
            isAiLoading.value = false
        }
    }
  }
})

const applySuggestion = () => {
    if (suggestedDayIndex.value >= 0) {
        selectedDayIndex.value = suggestedDayIndex.value
    }
}

const confirm = () => {
  emit('add', {
    dayIndex: selectedDayIndex.value,
    time: selectedTime.value
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
