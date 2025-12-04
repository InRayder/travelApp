<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center px-4" :style="{ zIndex }">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" @click="handleCancel"></div>

    <!-- Modal Content -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in-up">
      <div class="p-6 text-center">
        <!-- Title -->
        <h3 class="text-lg font-bold text-gray-800 mb-4">{{ title }}</h3>
        
        <input 
          ref="inputRef"
          v-model="inputValue" 
          type="text" 
          :placeholder="placeholder"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-jp-mustard/50 focus:border-jp-mustard transition-all mb-6"
          @keyup.enter="handleConfirm"
        />

        <!-- Buttons -->
        <div class="flex gap-3">
          <button @click="handleCancel" class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all transform active:scale-95 bg-jp-dark hover:bg-gray-800 shadow-gray-200" :disabled="!inputValue.trim()" :class="{'opacity-50 cursor-not-allowed': !inputValue.trim()}">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, defineProps, defineEmits, toRef } from 'vue'
import { useDynamicZIndex } from '../composables/useZIndex'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '輸入'
  },
  placeholder: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '確定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close', 'confirm'])

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    inputValue.value = ''
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () => {
  if (inputValue.value.trim()) {
    emit('confirm', inputValue.value.trim())
    emit('close')
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
