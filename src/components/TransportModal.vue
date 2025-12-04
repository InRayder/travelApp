<template>
  <transition name="slide-up">
    <div v-if="isOpen && transportData" class="fixed inset-0 flex items-end justify-center pointer-events-none" :style="{ zIndex }">
      <div class="absolute inset-0 bg-black/30 pointer-events-auto transition-opacity" @click="emit('close')"></div>
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pointer-events-auto transform transition-transform shadow-2xl relative z-50 modal-body flex flex-col max-h-[90vh]">
        <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 shrink-0"></div>
        
        <div class="flex items-center justify-between mb-4 shrink-0">
          <h3 class="font-bold text-xl text-jp-dark">交通詳情</h3>
          <button @click="emit('edit')" class="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1">
            <font-awesome-icon icon="fa-solid fa-pen" /> 編輯
          </button>
        </div>

        <div class="overflow-y-auto flex-1 space-y-6 pr-1">
          <div v-for="(t, index) in transportData?.transports || []" :key="index" class="relative">
            <!-- Connector Line -->
            <div v-if="index < (transportData?.transports?.length || 0) - 1" class="absolute left-5 top-12 bottom-[-1.5rem] w-0.5 bg-gray-200 z-0"></div>

            <div class="flex items-start gap-3 relative z-10">
              <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 border-2 border-white shadow-sm">
                <font-awesome-icon :icon="getTransportIcon(t.type)" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1">
                  <div>
                    <h4 class="font-bold text-lg text-jp-dark leading-tight">{{ getTitle(t) }}</h4>
                    <p class="text-xs text-gray-500">{{ getSubtitle(t) }}</p>
                  </div>
                  <a :href="getScheduleSearchLink(t)" target="_blank" class="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1 shrink-0">
                    <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
                  </a>
                </div>

                <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-2">
                  <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-2">
                      <div class="font-mono text-lg font-bold text-jp-dark">{{ formatTime(t.dep || (index === 0 ? transportData?.time || '' : ''), store.settings.timeFormat) }}</div>
                      <div class="text-gray-400 text-xs"><font-awesome-icon icon="fa-solid fa-arrow-right" /></div>
                      <div class="font-mono text-lg font-bold text-jp-dark">{{ t.arr ? formatTime(t.arr, store.settings.timeFormat) : '--:--' }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button 
                        v-if="t.passId" 
                        @click.stop="openPassModal(t.passId)"  
                        class="text-[10px] bg-jp-mustard text-white px-2 py-1 rounded-full hover:bg-yellow-600 transition-colors flex items-center gap-1"
                        title="查看票券"
                      >
                        <font-awesome-icon icon="fa-solid fa-ticket" /> 票券
                      </button>
                      <div class="font-bold text-jp-dark">¥{{ (t.cost || 0).toLocaleString() }}</div>
                    </div>
                  </div>
                  
                  <div class="space-y-1 text-xs border-t border-dashed border-gray-200 pt-2">
                    <div v-if="t.direction" class="flex justify-between">
                      <span class="text-gray-500">方向</span>
                      <span class="font-medium">{{ t.direction }}</span>
                    </div>
                    <div v-if="t.type === 'flight' && (t.depAirport || t.arrAirport)" class="flex justify-between">
                      <span class="text-gray-500">航線</span>
                      <span class="font-medium font-mono">{{ t.depAirport }} <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-[10px] mx-1" /> {{ t.arrAirport }}</span>
                    </div>
                    <div v-if="t.platform" class="flex justify-between">
                      <span class="text-gray-500">月台</span>
                      <span class="font-medium">{{ t.platform }}</span>
                    </div>
                    <div v-if="t.car" class="flex justify-between">
                      <span class="text-gray-500">車廂/座位</span>
                      <span class="font-medium">{{ t.car }}</span>
                    </div>
                    <div v-if="t.note" class="flex justify-between">
                      <span class="text-gray-500">備註</span>
                      <span class="font-medium text-right max-w-[70%]">{{ t.note }}</span>
                    </div>
                  </div>
                </div>

                <!-- Schedules -->
                <div v-if="t.schedules && t.schedules.length > 0" class="mb-2">
                  <h5 class="text-[10px] font-bold text-gray-400 mb-1 pl-1">前後班次</h5>
                  <div class="space-y-1">
                    <div v-for="(sch, sIdx) in t.schedules" :key="sIdx" class="flex items-center justify-between bg-white border border-gray-100 p-1.5 rounded-lg text-[10px]">
                      <div class="flex items-center gap-2 font-mono font-bold text-gray-600">
                        <span>{{ formatTime(sch.dep, store.settings.timeFormat) }}</span>
                        <span v-if="sch.arr" class="text-gray-400">-> {{ formatTime(sch.arr, store.settings.timeFormat) }}</span>
                      </div>
                      <div class="text-gray-500">{{ sch.note }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-2 border-t border-gray-100 shrink-0">
          <button @click="emit('close')" class="w-full py-3 rounded-xl bg-jp-mustard text-white font-bold hover:bg-yellow-600 transition-colors shadow-lg shadow-jp-mustard/30">關閉</button>
        </div>
      </div>
    </div>
  </transition>

  <PassDisplayModal 
    :isOpen="isPassModalOpen" 
    :pass="currentPass!" 
    @close="isPassModalOpen = false" 
    v-if="currentPass"
  />
</template>

<script setup lang="ts">
import type { Transport, TransportPass } from '../stores/trip.ts'
import { useTripStore } from '../stores/trip.ts'
import { formatTime } from '../utils/time.ts'
import PassDisplayModal from './PassDisplayModal.vue'
import { ref, toRef } from 'vue'
import { useDynamicZIndex } from '../composables/useZIndex'

const store = useTripStore()

const props = defineProps<{
  isOpen: boolean
  transportData: { transports: Transport[], time: string } | null
}>()

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close', 'edit'])

const getTransportIcon = (type: string) => {
  const map: Record<string, string> = { 
    public: 'fa-train-subway', 
    express: 'fa-train-tram', 
    ferry: 'fa-ship', 
    walk: 'fa-person-walking',
    taxi: 'fa-taxi',
    drive: 'fa-car',
    flight: 'fa-plane',
    // Legacy
    train: 'fa-train', 
    subway: 'fa-train-subway', 
    bus: 'fa-bus', 
    shinkansen: 'fa-train-tram', 
    boat: 'fa-ship' 
  }
  return `fa-solid ${map[type] || 'fa-car'}`
}

const getTitle = (t: Transport) => {
  if (t.type === 'walk') return '步行前往'
  if (t.type === 'public') return t.line || '公車/地鐵'
  if (t.type === 'express') return t.trainNumber || t.line || '特急/新幹線'
  if (t.type === 'taxi') return t.company || '計程車/Uber'
  if (t.type === 'drive') return t.company ? `${t.company} (自駕)` : '自駕'
  if (t.type === 'ferry') return t.line || '船'
  if (t.type === 'flight') return t.flightNo || '航班'
  return t.line || '交通'
}

const getSubtitle = (t: Transport) => {
  if (t.type === 'drive') return t.car || '自駕'
  if (t.type === 'taxi') return ''
  if (t.type === 'walk') return ''
  if (t.type === 'flight') return t.company || '航空公司'
  return t.company || '大眾運輸'
}

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
    case 'flight':
      query = `${t.company || ''} ${t.flightNo || ''} 航班動態`
      break
    default:
      query = `${t.company || ''} ${t.line || ''} 時刻表`
  }
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`
}

// Pass Display Logic
const isPassModalOpen = ref(false)
const currentPass = ref<TransportPass | null>(null)

const openPassModal = (passId: string) => {
  const pass = store.passes.find(p => p.id === passId)
  if (pass) {
    currentPass.value = pass
    isPassModalOpen.value = true
  }
}
</script>
