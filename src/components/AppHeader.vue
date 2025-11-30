<template>
  <header 
    class="px-5 flex justify-between items-end glass z-20 shrink-0 border-b border-gray-100/50 sticky top-0 transition-all duration-300 ease-in-out"
    :class="store.headerCollapsed ? 'py-2 h-14' : 'pt-12 pb-4 h-auto'"
  >
    <div class="flex flex-col justify-end h-full">
      <h2 
        class="text-[10px] tracking-[0.2em] text-jp-gray uppercase mb-1 font-medium transition-all duration-300 origin-left"
        :class="store.headerCollapsed ? 'opacity-0 h-0 mb-0 scale-0' : 'opacity-100 h-auto scale-100'"
      >
        Trip Itinerary
      </h2>
      <h1 
        class="font-bold flex items-center gap-2 transition-all duration-300"
        :class="store.headerCollapsed ? 'text-lg' : 'text-2xl'"
      >
        <span 
          class="bg-jp-mustard rounded-full block transition-all duration-300"
          :class="store.headerCollapsed ? 'w-1.5 h-4' : 'w-2 h-6'"
        ></span>
        {{ store.title }}
      </h1>
    </div>
    <div class="flex gap-2 items-center h-full pb-1">
      <!-- 設定按鈕 (Settings Button) -->
      <button 
        @click="emit('open-settings')" 
        class="rounded-full bg-white border border-gray-100 shadow-card flex items-center justify-center text-jp-gray hover:text-jp-dark transition-all duration-300"
        :class="store.headerCollapsed ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'"
      >
        <font-awesome-icon icon="fa-solid fa-gear" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/trip.ts'

const store = useTripStore()
const emit = defineEmits(['open-settings'])
</script>
