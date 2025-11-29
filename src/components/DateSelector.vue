<template>
  <div class="px-4 pb-2 bg-jp-cream z-20 shrink-0 shadow-sm relative">
    <div class="flex overflow-x-auto gap-3 pb-2 pt-2 hide-scrollbar snap-x px-1">
      <div v-for="(day, index) in days" :key="index" 
           @click="emit('select-day', index)"
           class="flex-shrink-0 snap-center flex flex-col items-center justify-center w-[4.5rem] h-20 rounded-2xl transition-all duration-300 border cursor-pointer relative overflow-hidden"
           :class="currentDayIndex === index ? 'bg-jp-dark text-white shadow-lg border-jp-dark' : 'bg-white text-jp-gray border-transparent hover:border-gray-200'">
        <span class="text-[10px] opacity-60 uppercase tracking-wide">{{ day.dateStr }}</span>
        <span class="text-lg font-bold leading-tight">Day {{ index + 1 }}</span>
        <span class="text-[10px] mt-1 opacity-80 flex items-center gap-1">
          <font-awesome-icon :icon="day.weatherIcon" /> {{ day.temp }}°
        </span>
        <div v-if="currentDayIndex === index" class="absolute bottom-0 left-0 right-0 h-1 bg-jp-mustard"></div>
      </div>

      <!-- Add Day Button -->
      <div @click="store.addDay()" 
           class="flex-shrink-0 snap-center flex flex-col items-center justify-center w-[4.5rem] h-20 rounded-2xl transition-all duration-300 border border-dashed border-gray-300 bg-gray-50 text-gray-400 cursor-pointer hover:bg-white hover:border-jp-mustard hover:text-jp-mustard hover:shadow-sm">
        <font-awesome-icon icon="fa-solid fa-plus" class="text-xl" />
        <span class="text-[10px] font-bold mt-1">Add Day</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/trip.ts'
import { storeToRefs } from 'pinia'
import type { Day } from '../stores/trip.ts'

const store = useTripStore()
const { days } = storeToRefs(store)

defineProps<{
  days: Day[]
  currentDayIndex: number
}>()

const emit = defineEmits(['select-day'])
</script>
