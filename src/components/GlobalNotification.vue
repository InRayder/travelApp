<template>
  <div class="fixed top-20 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
    <TransitionGroup 
      enter-active-class="transition ease-out duration-300 transform"
      enter-from-class="-translate-y-2 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200 transform"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="-translate-y-2 opacity-0 scale-95"
    >
      <div 
        v-for="notification in store.notifications" 
        :key="notification.id"
        class="w-full max-w-sm rounded-xl shadow-lg border pointer-events-auto p-4 flex items-start justify-between gap-3 relative overflow-hidden backdrop-blur-sm"
        :class="getTypeStyles(notification.type)"
      >
        <!-- Icon -->
        <div class="shrink-0 pt-0.5">
          <font-awesome-icon :icon="getTypeIcon(notification.type)" />
        </div>

        <!-- Content -->
        <div class="flex-1 text-sm font-medium leading-relaxed">
          {{ notification.message }}
        </div>

        <!-- Close Button -->
        <button 
          @click="store.remove(notification.id)" 
          class="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity p-1"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>

        <!-- Progress/Accent Bar (Optional visual) -->
        <div class="absolute left-0 top-0 bottom-0 w-1" :class="getAccentColor(notification.type)"></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../stores/notification'
import type { NotificationType } from '../stores/notification'

const store = useNotificationStore()

const getTypeStyles = (type: NotificationType) => {
  switch (type) {
    case 'error':
      return 'bg-red-50/95 border-red-100 text-red-700'
    case 'warning':
      return 'bg-amber-50/95 border-amber-100 text-amber-700'
    case 'success':
      return 'bg-green-50/95 border-green-100 text-green-700'
    default: // info
      return 'bg-white/95 border-blue-100 text-blue-700'
  }
}

const getAccentColor = (type: NotificationType) => {
  switch (type) {
    case 'error': return 'bg-red-500'
    case 'warning': return 'bg-amber-500'
    case 'success': return 'bg-green-500'
    default: return 'bg-blue-500'
  }
}

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'error': return 'fa-solid fa-circle-exclamation'
    case 'warning': return 'fa-solid fa-triangle-exclamation'
    case 'success': return 'fa-solid fa-circle-check'
    default: return 'fa-solid fa-circle-info'
  }
}
</script>
