<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center p-4" :style="{ zIndex }">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
      <div class="bg-white w-full max-w-xs rounded-2xl shadow-2xl p-4 relative z-10 transform scale-100 transition-all">
        <h3 class="text-center font-bold text-gray-700 mb-4">在此處插入行程</h3>
        <div class="space-y-3">
          <button @click="emit('new-event')" class="w-full py-3 rounded-xl bg-jp-mustard text-white font-bold flex items-center justify-center gap-2">
            <font-awesome-icon icon="fa-solid fa-plus" /> 建立新行程
          </button>
          <div class="text-center text-xs text-gray-400 font-medium">或是從備案選擇</div>
          <div class="max-h-48 overflow-y-auto space-y-2">
            <button v-for="(bk, idx) in backups" :key="idx" @click="emit('from-backup', idx)" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-yellow-50 text-left flex items-center justify-between group">
              <span class="text-sm font-bold text-gray-700 truncate">{{ bk.title }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-gray-300 group-hover:text-jp-mustard" />
            </button>
            <div v-if="!backups || backups.length === 0" class="text-center text-xs text-gray-300 py-2">無可用備案</div>
          </div>
        </div>
        <button @click="emit('close')" class="w-full mt-4 py-2 text-gray-400 text-xs font-bold">取消</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Event } from '../stores/trip.ts'
import { toRef } from 'vue'
import { useDynamicZIndex } from '../composables/useZIndex'

const props = defineProps<{
  isOpen: boolean
  backups: Event[]
}>()

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close', 'new-event', 'from-backup'])
</script>
