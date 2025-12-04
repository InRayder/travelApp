<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm" @click="close" :style="{ zIndex }">
    <div class="relative w-full h-full flex flex-col items-center justify-center p-4" @click.stop>
      
      <!-- Close Button -->
      <button @click="close" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50">
        <font-awesome-icon icon="fa-solid fa-xmark" class="text-xl" />
      </button>

      <!-- Pass Image Container with Brightness Simulation -->
      <div class="relative max-w-full max-h-[80vh] bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-500 transform scale-100">
        <!-- Brightness Overlay (Simulates screen brightness) -->
        <div class="absolute inset-0 bg-white/10 pointer-events-none mix-blend-overlay"></div>
        
        <img :src="pass.imageUrl" :alt="pass.name" class="max-w-full max-h-[80vh] object-contain block">
        
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
          <h3 class="font-bold text-lg">{{ pass.name }}</h3>
          <p class="text-xs opacity-80 flex items-center gap-1">
            <font-awesome-icon icon="fa-solid fa-sun" /> 螢幕亮度已自動調亮
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransportPass } from '../stores/trip.ts'
import { toRef } from 'vue'
import { useDynamicZIndex } from '../composables/useZIndex'

const props = defineProps<{
  isOpen: boolean
  pass: TransportPass
}>()

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Optional: In a real mobile app, we would use the Screen Brightness API here.
// For web, we can only simulate or show a message.
</script>
