<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center px-4" :style="{ zIndex }">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" @click="handleCancel"></div>

    <!-- Modal Content -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in-up">
      <div class="p-6 text-center">
        <!-- Icon -->
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
             :class="type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'">
          <font-awesome-icon :icon="type === 'danger' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-info'" class="text-xl" />
        </div>

        <!-- Title & Message -->
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-500 mb-6 leading-relaxed">{{ message }}</p>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button v-if="showCancel" @click="handleCancel" class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
                  :class="type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-jp-dark hover:bg-gray-800 shadow-gray-200'">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, toRef } from 'vue'
import { useDynamicZIndex } from '../composables/useZIndex'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '確認'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '確定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  type: {
    type: String as () => 'danger' | 'info',
    default: 'danger'
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close', 'confirm'])

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  emit('close')
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
