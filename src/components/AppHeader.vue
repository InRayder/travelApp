<template>
  <header class="px-5 pt-12 pb-4 flex justify-between items-end glass z-20 shrink-0 border-b border-gray-100/50 sticky top-0">
    <div>
      <h2 class="text-[10px] tracking-[0.2em] text-jp-gray uppercase mb-1 font-medium">Trip Itinerary</h2>
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <span class="w-2 h-6 bg-jp-mustard rounded-full block"></span>
        {{ store.title }}
      </h1>
    </div>
    <div class="flex gap-2">
      <!-- 設定按鈕 (Settings Button) -->
      <button @click="emit('open-settings')" class="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-card flex items-center justify-center text-jp-gray hover:text-jp-dark transition-colors">
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
