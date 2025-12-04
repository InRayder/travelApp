<template>
  <div class="my-3 flex items-center relative z-10 transition-all duration-300 transport-connector">
    <div class="absolute -left-[1.3rem] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-gray-200"></div>
    <div v-if="hasTransports" @click="emit('open-transport', currentEvent, index)" 
      class="flex flex-col items-start gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm text-xs cursor-pointer hover:border-jp-mustard hover:shadow-md transition-all w-full max-w-[240px]"
      :class="{ 'ring-2 ring-red-500 ring-offset-2': hasConflict }"
    >
      
      <div v-for="(transport, idx) in transports" :key="idx" class="w-full">
        <!-- Segment Connector (if not first) -->
        <div v-if="idx > 0" class="flex justify-center py-1">
          <font-awesome-icon icon="fa-solid fa-arrow-down" class="text-[10px] text-gray-300" />
        </div>

        <div class="flex flex-col gap-1 w-full">
          <div class="flex items-center gap-2 w-full">
            <font-awesome-icon :icon="getTransportIcon(transport.type)" class="text-jp-accent-blue text-sm" />
            <span class="font-bold text-jp-dark truncate flex-1">{{ getTransportTitle(transport) }}</span>
            <span v-if="getTransportBadge(transport)" class="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">{{ getTransportBadge(transport) }}</span>
            
            <!-- Pass Button -->
            <button 
              v-if="transport.passId && getPass(transport.passId)" 
              @click.stop="openPassModal(transport.passId)"
              class="text-[9px] bg-jp-mustard text-white px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-yellow-600 transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-ticket" /> 票券
            </button>
          </div>
          
          <div class="flex items-center gap-2 text-[10px] text-gray-500 pl-6 w-full">
            <div v-if="transport.type === 'taxi'" class="flex flex-col">
              <div class="flex items-center gap-1 font-mono text-jp-dark">
                <span v-if="transport.duration" class="font-bold">約 {{ transport.duration }} 分</span>
                <span v-else>-- 分</span>
              </div>
              <div v-if="transport.cost" class="text-[9px] text-gray-400 pl-0">
                預估 ¥{{ transport.cost }}
              </div>
            </div>
            <div v-else-if="transport.dep" class="flex flex-col">
              <div class="flex items-center gap-1 font-mono">
                <font-awesome-icon icon="fa-regular fa-clock" /> {{ formatTime(transport.dep, store.settings.timeFormat) }}發
              </div>
              <div v-if="transport.direction" class="text-[9px] text-gray-400 pl-4">
                往 {{ transport.direction }}
              </div>
              <div v-if="transport.type === 'flight' && (transport.depAirport || transport.arrAirport)" class="text-[9px] text-gray-400 pl-4 font-mono">
                {{ transport.depAirport }} <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-[8px] mx-1" /> {{ transport.arrAirport }}
              </div>
            </div>
            <div class="ml-auto" v-if="idx === transports.length - 1">
              <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-[10px] text-gray-300" />
            </div>
          </div>
          
          <!-- Schedules Preview -->
          <div v-if="transport.schedules && transport.schedules.length > 0" class="w-full px-3 pb-2 space-y-1">
            <div class="h-[1px] bg-gray-100 w-full mb-1"></div>
            <div v-for="(sch, sIdx) in transport.schedules" :key="sIdx" class="flex justify-between items-center text-[9px] text-gray-400">
              <span class="font-mono">{{ formatTime(sch.dep, store.settings.timeFormat) }} <span v-if="sch.arr">-> {{ formatTime(sch.arr, store.settings.timeFormat) }}</span></span>
              <span>{{ sch.note }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Empty State: Add Transport Button -->
    <div v-else @click="emit('add-transport', currentEvent, index)" class="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-3 py-2 text-xs cursor-pointer hover:bg-white hover:border-jp-mustard hover:text-jp-mustard transition-all w-full max-w-[240px] group">
      <div class="w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center group-hover:bg-jp-mustard group-hover:text-white transition-colors">
        <font-awesome-icon icon="fa-solid fa-plus" class="text-[10px]" />
      </div>
      <span class="font-bold text-gray-400 group-hover:text-jp-mustard">設定交通方式</span>
    </div>

  </div>

  <PassDisplayModal 
    :isOpen="isPassModalOpen" 
    :pass="currentPass" 
    @close="isPassModalOpen = false" 
    v-if="currentPass"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Event, Transport, TransportPass } from '../stores/trip.ts'
import { useTripStore } from '../stores/trip.ts'
import { formatTime } from '../utils/time.ts'
import PassDisplayModal from './PassDisplayModal.vue'

const store = useTripStore()

const props = defineProps<{
  previousEvent?: Event
  currentEvent: Event
  index: number
  hasConflict?: boolean
}>()

const emit = defineEmits(['open-transport', 'add-transport'])



const getTransportIcon = (type: string) => {
  const map: Record<string, string> = { 
    public: 'fa-solid fa-train-subway', 
    express: 'fa-solid fa-train-tram', 
    ferry: 'fa-solid fa-ship', 
    walk: 'fa-solid fa-person-walking',
    taxi: 'fa-solid fa-taxi',
    drive: 'fa-solid fa-car',
    flight: 'fa-solid fa-plane',
    // Legacy mapping
    train: 'fa-solid fa-train', 
    subway: 'fa-solid fa-train-subway', 
    shinkansen: 'fa-solid fa-train-tram', 
    bus: 'fa-solid fa-bus', 
    boat: 'fa-solid fa-ship'
  }
  return map[type] || 'fa-solid fa-arrow-right'
}

const transports = computed(() => props.currentEvent.transports || [])
const hasTransports = computed(() => props.currentEvent.transports && props.currentEvent.transports.length > 0)

const getTransportTitle = (t: Transport) => {
  if (t.type === 'walk') return '步行前往'
  if (t.type === 'public') return t.line || '公車/地鐵'
  if (t.type === 'express') return t.trainNumber || t.line || '特急/新幹線'
  if (t.type === 'taxi') return '計程車/Uber'
  if (t.type === 'drive') return t.company ? `${t.company} (自駕)` : '自駕'
  if (t.type === 'ferry') return t.line || '船'
  if (t.type === 'flight') return t.flightNo || '航班'
  return t.line || '交通'
}

const getTransportBadge = (t: Transport) => {
  if (t.type === 'drive') return t.car
  if (t.type === 'taxi') return ''
  if (t.type === 'walk') return ''
  return t.company
}

// Pass Display Logic
const isPassModalOpen = ref(false)
const currentPass = ref<TransportPass | null>(null)

const getPass = (id: string) => {
  return store.passes.find(p => p.id === id)
}

const openPassModal = (passId: string) => {
  const pass = getPass(passId)
  if (pass) {
    currentPass.value = pass
    isPassModalOpen.value = true
  }
}
</script>
