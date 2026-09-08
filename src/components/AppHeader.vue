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
      <h1 class="transition-all duration-300" :class="store.headerCollapsed ? 'text-lg' : 'text-2xl text-jp-dark'">
        <button
          type="button"
          class="font-bold flex items-center gap-2 w-full text-inherit"
          @click="isTripSwitcherOpen = true"
          aria-label="切換行程"
        >
          <span>{{ store.title || 'Trip to Japan' }}</span>
          <span class="text-xs font-normal text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full bg-opacity-50">
            {{ store.days.length }} Days
          </span>
          <font-awesome-icon icon="fa-solid fa-chevron-down" class="text-xs text-gray-300" />
        </button>
      </h1>
    </div>

  </header>

  <TripSwitcherModal :isOpen="isTripSwitcherOpen" @close="isTripSwitcherOpen = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import TripSwitcherModal from './TripSwitcherModal.vue'

const store = useTripStore()
const isTripSwitcherOpen = ref(false)
</script>
