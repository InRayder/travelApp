<template>
  <transition name="slide-up">
    <div v-if="isOpen && transportData" class="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      <div class="absolute inset-0 bg-black/30 pointer-events-auto transition-opacity" @click="emit('close')"></div>
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pointer-events-auto transform transition-transform shadow-2xl relative z-50 modal-body">
        <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <font-awesome-icon :icon="getTransportIcon(transportData.transport.type)" />
            </div>
            <div>
              <h3 class="font-bold text-xl text-jp-dark">{{ title }}</h3>
              <p class="text-xs text-gray-500">{{ subtitle }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="emit('edit')" class="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1">
              <font-awesome-icon icon="fa-solid fa-pen" /> 編輯
            </button>
            <a :href="getScheduleSearchLink(transportData.transport)" target="_blank" class="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1">
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 查詢
            </a>
          </div>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
          <div class="flex justify-center items-center mb-4">
            <div class="text-center">
              <div class="text-[10px] text-jp-mustard font-bold">Departure</div>
              <div class="font-mono text-2xl font-bold text-jp-dark">{{ transportData.transport.dep || transportData.time }}</div>
            </div>
          </div>
          <div class="space-y-2 text-sm border-t border-dashed border-gray-200 pt-3">
            <div class="flex justify-between">
              <span class="text-gray-500">方向</span>
              <span class="font-medium">{{ transportData.transport.direction || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">票價</span>
              <span class="font-medium">¥{{ (transportData.transport.cost || 0).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">備註</span>
              <span class="font-medium text-xs text-right max-w-[60%]">{{ transportData.transport.note || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Alternative Schedules -->
        <div v-if="transportData.transport.schedules && transportData.transport.schedules.length > 0" class="mb-4">
          <h4 class="text-xs font-bold text-gray-400 mb-2 pl-1">前後班次 (Schedules)</h4>
          <div class="space-y-2">
            <div v-for="(sch, idx) in transportData.transport.schedules" :key="idx" class="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 text-xs">
              <div class="flex items-center gap-2 font-mono font-bold text-gray-600">
                <span v-if="sch.dep">{{ sch.dep }} 發</span>
                <span v-if="sch.arr" class="text-gray-400">-> {{ sch.arr }} 抵</span>
              </div>
              <div class="text-gray-500 text-[10px]">{{ sch.note }}</div>
            </div>
          </div>
        </div>

        <button @click="emit('close')" class="w-full py-3 rounded-xl bg-jp-mustard text-white font-bold hover:bg-yellow-600 transition-colors">關閉</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transport } from '../stores/trip.ts'

const props = defineProps<{
  isOpen: boolean
  transportData: { transport: Transport, time: string } | null
}>()

const emit = defineEmits(['close', 'edit'])

const getTransportIcon = (type: string) => {
  const map: Record<string, string> = { 
    public: 'fa-train-subway', 
    express: 'fa-train-tram', 
    ferry: 'fa-ship', 
    walk: 'fa-person-walking',
    taxi: 'fa-taxi',
    drive: 'fa-car',
    // Legacy
    train: 'fa-train', 
    subway: 'fa-train-subway', 
    bus: 'fa-bus', 
    shinkansen: 'fa-train-tram', 
    boat: 'fa-ship' 
  }
  return `fa-solid ${map[type] || 'fa-car'}`
}

const title = computed(() => {
  if (!props.transportData) return ''
  const t = props.transportData.transport
  if (t.type === 'walk') return '步行前往'
  if (t.type === 'public') return t.line || '公車/地鐵'
  if (t.type === 'express') return t.trainNumber || t.line || '特急/新幹線'
  if (t.type === 'taxi') return t.company || '計程車/Uber'
  if (t.type === 'drive') return t.company ? `${t.company} (自駕)` : '自駕'
  if (t.type === 'ferry') return t.line || '船'
  return t.line || '交通'
})

const subtitle = computed(() => {
  if (!props.transportData) return ''
  const t = props.transportData.transport
  if (t.type === 'drive') return t.car || '自駕'
  if (t.type === 'taxi') return ''
  if (t.type === 'walk') return ''
  return t.company || '大眾運輸'
})

const getScheduleSearchLink = (t: Transport) => {
  let query = ''
  switch (t.type) {
    case 'public':
    case 'ferry':
      query = `${t.company || ''} ${t.line || ''} 時刻表`
      break
    case 'express':
      query = `${t.trainNumber || t.line || ''} 時刻表`
      break
    case 'taxi':
      query = `${t.company || '計程車'} 預約`
      break
    case 'drive':
      query = `${t.company || '租車'} 預約`
      break
    case 'walk':
      query = `步行路線`
      break
    default:
      query = `${t.company || ''} ${t.line || ''} 時刻表`
  }
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`
}
</script>
