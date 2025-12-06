<template>
  <header 
    class="px-5 flex justify-between items-end glass z-40 shrink-0 border-b border-gray-100/50 sticky top-0 transition-all duration-300"
    :class="store.headerCollapsed ? 'py-2 h-14' : 'pt-12 pb-4 h-auto'"
  >
    <div>
      <h2 
        class="text-[10px] tracking-[0.2em] text-jp-gray uppercase mb-1 font-medium transition-all duration-300 origin-left"
        :class="store.headerCollapsed ? 'opacity-0 h-0 mb-0 scale-0' : 'opacity-100 h-auto scale-100'"
      >
        Trip Itinerary
      </h2>
      <h1 
        class="font-bold flex items-center gap-2 transition-all duration-300"
        :class="store.headerCollapsed ? 'text-lg' : 'text-2xl text-jp-dark'"
      >
        <span>{{ store.title || 'Trip to Japan' }}</span>
        <span class="text-xs font-normal text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full bg-opacity-50">
          {{ store.days.length }} Days
        </span>
      </h1>
    </div>

    <!-- 佔位符，讓 Header 佈局保持正常 -->
    <div class="w-12 h-12"></div>
  </header>
  
  <!-- 設定按鈕改為完全獨立的 fixed 定位，確保可以點擊 -->
  <button 
    @click="store.setSettingsOpen(true)" 
    class="fixed top-3 right-4 w-12 h-12 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-jp-gray hover:text-jp-dark transition-all duration-300 z-50"
    :class="store.headerCollapsed ? 'top-2 w-10 h-10' : 'top-12'"
    aria-label="設定"
    style="touch-action: manipulation; -webkit-tap-highlight-color: rgba(0,0,0,0.1);"
  >
    <font-awesome-icon icon="fa-solid fa-gear" class="text-lg" />
  </button>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/trip.ts'

const store = useTripStore()
const emit = defineEmits(['open-settings'])
</script>
