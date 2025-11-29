<template>
  <div class="mt-4 flex items-center relative z-10 transition-all duration-300 transport-connector">
    <div class="absolute -left-[1.3rem] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-gray-200"></div>
    <div @click="emit('open-transport', nextItem, nextIndex)" class="flex flex-col items-start gap-1 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm text-xs cursor-pointer hover:border-jp-mustard hover:shadow-md transition-all w-full max-w-[240px]">
      <div class="flex items-center gap-2 w-full">
        <font-awesome-icon :icon="getTransportIcon(transport.type)" class="text-jp-accent-blue text-sm" />
        <span class="font-bold text-jp-dark truncate flex-1">{{ transportTitle }}</span>
        <span v-if="transportBadge" class="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">{{ transportBadge }}</span>
      </div>
      <div class="flex items-center gap-2 text-[10px] text-gray-500 pl-6 w-full">
        <div v-if="transport.dep" class="flex flex-col">
          <div class="flex items-center gap-1 font-mono">
            <font-awesome-icon icon="fa-regular fa-clock" /> {{ transport.dep }}發
          </div>
          <div v-if="transport.direction" class="text-[9px] text-gray-400 pl-4">
            往 {{ transport.direction }}
          </div>
        </div>
        <div class="ml-auto">
          <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-[10px] text-gray-300" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '../stores/trip.ts'

const props = defineProps<{
  nextItem: Event
  nextIndex: number
}>()

const emit = defineEmits(['open-transport'])

const getDisplayTransport = (item: Event) => {
  return item.transport || { type: 'walk', line: '步行前往', company: '', dep: '', cost: 0 }
}

const getTransportIcon = (type: string) => {
  const map: Record<string, string> = { 
    public: 'fa-solid fa-train-subway', 
    express: 'fa-solid fa-train-tram', 
    ferry: 'fa-solid fa-ship', 
    walk: 'fa-solid fa-person-walking',
    taxi: 'fa-solid fa-taxi',
    drive: 'fa-solid fa-car',
    // Legacy mapping
    train: 'fa-solid fa-train', 
    subway: 'fa-solid fa-train-subway', 
    shinkansen: 'fa-solid fa-train-tram', 
    bus: 'fa-solid fa-bus', 
    boat: 'fa-solid fa-ship'
  }
  return map[type] || 'fa-solid fa-arrow-right'
}

const transport = computed(() => getDisplayTransport(props.nextItem))

const transportTitle = computed(() => {
  const t = transport.value
  if (t.type === 'walk') return '步行前往'
  if (t.type === 'public') return t.line || '公車/地鐵'
  if (t.type === 'express') return t.trainNumber || t.line || '特急/新幹線'
  if (t.type === 'taxi') return t.company || '計程車/Uber'
  if (t.type === 'drive') return t.company ? `${t.company} (自駕)` : '自駕'
  if (t.type === 'ferry') return t.line || '船'
  return t.line || '交通'
})

const transportBadge = computed(() => {
  const t = transport.value
  if (t.type === 'drive') return t.car
  if (t.type === 'taxi') return ''
  if (t.type === 'walk') return ''
  return t.company
})
</script>
