<template>
  <div class="relative" ref="container">
    <!-- Display Input -->
    <div 
      @click="toggleOpen"
      class="w-full bg-white p-2 rounded-lg border border-gray-200 cursor-pointer flex items-center justify-between hover:border-jp-mustard transition-colors group"
      :class="{'ring-2 ring-jp-mustard border-jp-mustard': isOpen}"
    >
      <div class="font-mono text-xs font-bold text-jp-dark flex-1 text-center">
        {{ displayTime || placeholder || '--:--' }}
      </div>
      <font-awesome-icon icon="fa-regular fa-clock" class="text-gray-400 text-xs group-hover:text-jp-mustard" />
    </div>

    <!-- Dropdown Picker -->
    <transition name="fade">
      <div v-if="isOpen" class="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden flex flex-col">
        
        <!-- Picker Columns -->
        <div class="flex h-48 relative">
          <!-- Selection Highlight Bar -->
          <div class="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 bg-jp-mustard/10 pointer-events-none border-y border-jp-mustard/30"></div>

          <!-- AM/PM Column (12h only) -->
          <div v-if="format === '12h'" class="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory py-[calc(6rem-1rem)]" @scroll="onScroll">
            <div 
              v-for="p in ['AM', 'PM']" 
              :key="p"
              class="h-8 flex items-center justify-center text-xs font-bold snap-center cursor-pointer transition-colors"
              :class="tempPeriod === p ? 'text-jp-mustard scale-110' : 'text-gray-400'"
              @click="setPeriod(p)"
            >
              {{ p === 'AM' ? '上午' : '下午' }}
            </div>
            <!-- Padding for scroll -->
            <div class="h-20"></div> 
          </div>

          <!-- Hour Column -->
          <div class="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory py-[calc(6rem-1rem)]" @scroll="onScroll">
            <div 
              v-for="h in hoursList" 
              :key="h"
              class="h-8 flex items-center justify-center text-xs font-bold snap-center cursor-pointer font-mono transition-colors"
              :class="tempHour === h ? 'text-jp-mustard scale-110' : 'text-gray-400'"
              @click="setHour(h)"
            >
              {{ String(h).padStart(2, '0') }}
            </div>
             <div class="h-20"></div>
          </div>

          <!-- Separator -->
          <div class="flex items-center justify-center pb-2 font-bold text-gray-300">:</div>

          <!-- Minute Column -->
          <div class="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory py-[calc(6rem-1rem)]" @scroll="onScroll">
            <div 
              v-for="m in minutesList" 
              :key="m"
              class="h-8 flex items-center justify-center text-xs font-bold snap-center cursor-pointer font-mono transition-colors"
              :class="tempMinute === m ? 'text-jp-mustard scale-110' : 'text-gray-400'"
              @click="setMinute(m)"
            >
              {{ String(m).padStart(2, '0') }}
            </div>
             <div class="h-20"></div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-2 border-t border-gray-100 flex justify-end bg-gray-50">
          <button @click="confirm" class="px-3 py-1 bg-jp-mustard text-white text-xs font-bold rounded-lg hover:bg-yellow-600 transition-colors">確定</button>
        </div>
      </div>
    </transition>

    <!-- Backdrop -->
    <div v-if="isOpen" class="fixed inset-0 z-[90]" @click="close"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string | undefined
  format?: '12h' | '24h'
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const container = ref<HTMLElement | null>(null)

// Temp values for the picker
const tempHour = ref(0)
const tempMinute = ref(0)
const tempPeriod = ref('AM') // AM | PM

const hoursList = computed(() => {
  if (props.format === '12h') {
    return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  }
  return Array.from({ length: 24 }, (_, i) => i)
})

const minutesList = Array.from({ length: 60 }, (_, i) => i)

const displayTime = computed(() => {
  if (!props.modelValue) return ''
  const [h, m] = props.modelValue.split(':').map(Number)
  
  if (props.format === '12h') {
    const period = h >= 12 ? '下午' : '上午'
    let hour12 = h % 12
    if (hour12 === 0) hour12 = 12
    return `${period} ${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  } else {
    return props.modelValue
  }
})

const parseModelValue = () => {
  if (!props.modelValue) {
    const now = new Date()
    tempHour.value = props.format === '12h' ? (now.getHours() % 12 || 12) : now.getHours()
    tempMinute.value = now.getMinutes()
    tempPeriod.value = now.getHours() >= 12 ? 'PM' : 'AM'
    return
  }

  const [h, m] = props.modelValue.split(':').map(Number)
  tempMinute.value = m
  
  if (props.format === '12h') {
    tempPeriod.value = h >= 12 ? 'PM' : 'AM'
    tempHour.value = h % 12 || 12
  } else {
    tempHour.value = h
  }
}

const toggleOpen = () => {
  if (isOpen.value) close()
  else open()
}

const open = () => {
  parseModelValue()
  isOpen.value = true
  nextTick(() => {
    scrollToPositions()
  })
}

const close = () => {
  isOpen.value = false
}

const confirm = () => {
  let h = tempHour.value
  const m = tempMinute.value
  
  if (props.format === '12h') {
    if (tempPeriod.value === 'PM' && h !== 12) h += 12
    if (tempPeriod.value === 'AM' && h === 12) h = 0
  }
  
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  emit('update:modelValue', timeStr)
  emit('change', timeStr)
  close()
}

const setHour = (h: number) => { tempHour.value = h; scrollToPositions() }
const setMinute = (m: number) => { tempMinute.value = m; scrollToPositions() }
const setPeriod = (p: string) => { tempPeriod.value = p; scrollToPositions() }

// Scrolling logic (simplified)
const onScroll = () => {
  // Implement snap detection if needed, but for now click-to-select is safer
  // Real iOS picker style scrolling requires complex math, 
  // we'll stick to click-to-select for reliability, 
  // but we can highlight the center item if we want.
}

const scrollToPositions = () => {
  // Logic to scroll the lists to center the selected values
  // This would require refs to the lists and calculating offsets
  // For MVP, we'll just rely on the user clicking or the initial render
}

watch(() => props.modelValue, () => {
  // if (isOpen.value) parseModelValue()
})

</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
