<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center px-4" :style="{ zIndex }">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>

    <!-- Modal Content -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in-up max-h-[80vh] flex flex-col">
      <div class="p-5 pb-3 flex items-center justify-between border-b border-gray-100 shrink-0">
        <h3 class="text-lg font-bold text-gray-800">我的行程</h3>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center">
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>
      </div>

      <!-- Trip List -->
      <div class="overflow-y-auto flex-1 p-3 space-y-2">
        <div
          v-for="trip in tripListStore.trips"
          :key="trip.id"
          class="rounded-xl border p-3 flex items-center gap-3 transition-colors"
          :class="trip.id === tripListStore.activeTripId ? 'border-jp-mustard bg-jp-mustard/10' : 'border-gray-100 hover:bg-gray-50'"
        >
          <button class="flex-1 text-left min-w-0" @click="handleSwitch(trip.id)">
            <div class="font-bold text-sm text-gray-800 truncate flex items-center gap-2">
              <font-awesome-icon v-if="trip.id === tripListStore.activeTripId" icon="fa-solid fa-check" class="text-jp-mustard text-xs" />
              <span class="truncate">{{ trip.title }}</span>
            </div>
            <div class="text-[11px] text-gray-400 mt-0.5">
              最後更新：{{ formatDate(trip.updatedAt) }}
            </div>
          </button>
          <button
            v-if="tripListStore.trips.length > 1"
            @click="handleDelete(trip.id)"
            class="text-gray-300 hover:text-red-500 w-8 h-8 flex items-center justify-center shrink-0"
            aria-label="刪除行程"
          >
            <font-awesome-icon icon="fa-solid fa-trash-can" class="text-sm" />
          </button>
        </div>
      </div>

      <!-- New Trip -->
      <div class="p-3 border-t border-gray-100 shrink-0">
        <button
          @click="isInputOpen = true"
          class="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-bold hover:border-jp-mustard hover:text-jp-mustard transition-colors flex items-center justify-center gap-2"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
          新增行程
        </button>
      </div>
    </div>

    <InputModal
      :isOpen="isInputOpen"
      title="新增行程"
      placeholder="輸入行程名稱"
      confirm-text="建立"
      @close="isInputOpen = false"
      @confirm="handleCreate"
    />

    <ConfirmModal
      :isOpen="isConfirmOpen"
      title="刪除行程"
      message="確定要刪除這筆行程嗎？此動作將刪除該行程的所有資料且無法復原。"
      type="danger"
      confirm-text="刪除"
      @close="isConfirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, toRef } from 'vue'
import { useDynamicZIndex } from '../composables/useZIndex'
import { useTripStore } from '../stores/trip.ts'
import { useTripListStore } from '../stores/tripList.ts'
import InputModal from './InputModal.vue'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const store = useTripStore()
const tripListStore = useTripListStore()

const isInputOpen = ref(false)
const isConfirmOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

const formatDate = (iso: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handleSwitch = (id: string) => {
  if (id === tripListStore.activeTripId) {
    emit('close')
    return
  }
  tripListStore.setActiveTrip(id)
  store.loadData(id)
  emit('close')
}

const handleCreate = (title: string) => {
  const id = tripListStore.createTrip(title)
  store.initBlankTrip(id, title)
}

const handleDelete = (id: string) => {
  pendingDeleteId.value = id
  isConfirmOpen.value = true
}

const confirmDelete = () => {
  if (!pendingDeleteId.value) return
  const wasActive = pendingDeleteId.value === tripListStore.activeTripId
  tripListStore.deleteTrip(pendingDeleteId.value)
  if (wasActive) {
    store.loadData(tripListStore.activeTripId)
  }
  pendingDeleteId.value = null
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
