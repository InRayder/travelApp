<template>
  <div class="px-4 pb-2 bg-jp-cream z-10 shrink-0 shadow-sm relative">
    <div 
      ref="scrollContainer"
      class="flex overflow-x-auto gap-3 pb-2 pt-2 hide-scrollbar snap-x px-1 cursor-grab select-none"
      @mousedown="onMouseDown"
      @mouseleave="onMouseLeave"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
    >
      <div v-for="(day, index) in days" :key="index" 
           @click="handleDayClick(index)"
           class="flex-shrink-0 snap-center flex flex-col items-center justify-center w-[4.5rem] h-20 rounded-2xl transition-all duration-300 border relative group"
           :class="currentDayIndex === index ? 'bg-jp-dark text-white shadow-lg border-jp-dark' : 'bg-white text-jp-gray border-transparent hover:border-gray-200'">
        <span class="text-[10px] opacity-60 uppercase tracking-wide">{{ day.dateStr }}</span>
        <span class="text-lg font-bold leading-tight">Day {{ index + 1 }}</span>

        <div v-if="currentDayIndex === index" class="absolute bottom-0 left-0 right-0 h-1 bg-jp-mustard"></div>
        
        <!-- 刪除按鈕 - 只在選中時顯示，且有超過一天時才顯示 -->
        <button 
          v-if="currentDayIndex === index && days.length > 1"
          @click.stop="confirmDeleteDay(index)"
          class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
          title="刪除此天"
        >
          <font-awesome-icon icon="fa-solid fa-times" class="text-[10px]" />
        </button>
      </div>

      <!-- Add Day Button -->
      <div @click="store.addDay()" 
           class="flex-shrink-0 snap-center flex flex-col items-center justify-center w-[4.5rem] h-20 rounded-2xl transition-all duration-300 border border-dashed border-gray-300 bg-gray-50 text-gray-400 cursor-pointer hover:bg-white hover:border-jp-mustard hover:text-jp-mustard hover:shadow-sm">
        <font-awesome-icon icon="fa-solid fa-plus" class="text-xl" />
        <span class="text-[10px] font-bold mt-1">Add Day</span>
      </div>
    </div>
  </div>
  
  <!-- 確認刪除對話框 -->
  <ConfirmModal
    :isOpen="showDeleteConfirm"
    title="刪除天數"
    :message="deleteConfirmMessage"
    @close="showDeleteConfirm = false"
    @confirm="executeDeleteDay"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import { storeToRefs } from 'pinia'
import type { Day } from '../stores/trip.ts'
import ConfirmModal from './ConfirmModal.vue'

const store = useTripStore()
const { days } = storeToRefs(store)

defineProps<{
  days: Day[]
  currentDayIndex: number
}>()

const emit = defineEmits(['select-day'])

const scrollContainer = ref<HTMLElement | null>(null)
const isDown = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const isDragging = ref(false)

// 刪除確認相關狀態
const showDeleteConfirm = ref(false)
const dayToDelete = ref(-1)

const deleteConfirmMessage = computed(() => {
  if (dayToDelete.value < 0) return ''
  const day = days.value[dayToDelete.value]
  const eventCount = day?.events?.length || 0
  if (eventCount > 0) {
    return `確定要刪除 Day ${dayToDelete.value + 1} 嗎？該天的 ${eventCount} 個行程將會移至備案。`
  }
  return `確定要刪除 Day ${dayToDelete.value + 1} 嗎？`
})

const confirmDeleteDay = (index: number) => {
  dayToDelete.value = index
  showDeleteConfirm.value = true
}

const executeDeleteDay = () => {
  if (dayToDelete.value >= 0) {
    // 如果刪除的是當前選中的天，先切換到第一天
    store.removeDay(dayToDelete.value)
    emit('select-day', 0)
  }
  showDeleteConfirm.value = false
  dayToDelete.value = -1
}

const onMouseDown = (e: MouseEvent) => {
  if (!scrollContainer.value) return
  isDown.value = true
  isDragging.value = false
  scrollContainer.value.classList.add('cursor-grabbing')
  scrollContainer.value.classList.remove('cursor-grab')
  startX.value = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft.value = scrollContainer.value.scrollLeft
}

const onMouseLeave = () => {
  isDown.value = false
  if (scrollContainer.value) {
    scrollContainer.value.classList.remove('cursor-grabbing')
    scrollContainer.value.classList.add('cursor-grab')
  }
}

const onMouseUp = () => {
  isDown.value = false
  if (scrollContainer.value) {
    scrollContainer.value.classList.remove('cursor-grabbing')
    scrollContainer.value.classList.add('cursor-grab')
  }
  // Reset dragging flag after a short delay to allow click events to fire if it wasn't a drag
  setTimeout(() => {
    isDragging.value = false
  }, 0)
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDown.value || !scrollContainer.value) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX.value) * 2 // Scroll-fast
  scrollContainer.value.scrollLeft = scrollLeft.value - walk
  
  // If moved significantly, mark as dragging to prevent click
  if (Math.abs(walk) > 5) {
    isDragging.value = true
  }
}

const handleDayClick = (index: number) => {
  if (!isDragging.value) {
    emit('select-day', index)
  }
}
</script>

