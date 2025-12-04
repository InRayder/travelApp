<template>
  <transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-0 flex items-end justify-center pointer-events-none" :style="{ zIndex }">
      <div class="absolute inset-0 bg-black/30 pointer-events-auto transition-opacity" @click="emit('close')"></div>
      <div class="bg-white rounded-2xl w-[90%] max-w-sm p-6 shadow-2xl transform transition-all relative overflow-hidden pointer-events-auto">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-pink-500"></div>
        
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-tags" class="text-red-500" />
          可用優惠券
        </h3>

        <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div v-if="discounts && discounts.length > 0" class="space-y-1">
            <a v-for="(disc, idx) in discounts" :key="idx" :href="disc.url" target="_blank" 
               class="block bg-red-50 border border-red-100 p-3 rounded-xl hover:bg-red-100 transition-all group relative overflow-hidden">
              <div class="absolute -right-4 -top-4 w-12 h-12 bg-red-200 rounded-full opacity-20 group-hover:scale-150 transition-transform"></div>
              <div class="flex justify-between items-center relative z-10">
                <span class="text-sm font-bold text-red-600">{{ disc.name }}</span>
                <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="text-xs text-red-400" />
              </div>
            </a>
          </div>
          <div v-else class="text-center text-gray-400 py-4 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
            尚無優惠券資訊
          </div>
        </div>

        <button @click="emit('close')" class="mt-6 w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">關閉</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">

import { toRef } from 'vue'
import { useDynamicZIndex } from '../composables/useZIndex'

const props = defineProps<{
  isOpen: boolean
  discounts: { name: string; url: string }[] | undefined
}>()

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close'])
</script>
