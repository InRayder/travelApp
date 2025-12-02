<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white px-6 pt-6 pb-4 shadow-sm z-10">
      <h1 class="text-2xl font-bold text-jp-dark mb-1">準備清單</h1>
      <p class="text-xs text-gray-400">做好萬全準備，享受無憂旅程</p>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 bg-white px-6 overflow-x-auto no-scrollbar items-center">
      <button 
        v-for="category in store.checklists" 
        :key="category.id"
        @click="activeTab = category.id"
        class="pb-3 pt-2 px-4 text-sm font-bold relative transition-colors whitespace-nowrap flex items-center gap-2 group"
        :class="activeTab === category.id ? 'text-jp-dark' : 'text-gray-400 hover:text-gray-600'"
      >
        {{ category.name }}
        <div 
          v-if="activeTab === category.id" 
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-jp-mustard rounded-t-full"
        ></div>
        
        <!-- Delete Category Button (Only visible for active custom categories or if we allow deleting defaults) -->
        <span 
          v-if="activeTab === category.id"
          @click.stop="deleteCategory(category.id)"
          class="ml-1 w-4 h-4 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-100 transition-all"
        >
          <font-awesome-icon icon="fa-solid fa-times" class="text-[10px]" />
        </span>
      </button>

      <!-- Add Category Button -->
      <button 
        @click="addCategory"
        class="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-jp-mustard hover:text-white transition-all flex-shrink-0 mb-1"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="text-xs" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 pb-24">
      <div v-if="activeCategory" class="space-y-4">
        <!-- Progress -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div class="flex justify-between items-end mb-2">
            <span class="text-xs font-bold text-gray-500">完成度</span>
            <span class="text-lg font-bold text-jp-mustard">{{ completedCount }} / {{ totalCount }}</span>
          </div>
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-jp-mustard transition-all duration-500 ease-out"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Items -->
        <transition-group name="list" tag="div" class="space-y-3">
          <div 
            v-for="item in activeCategory.items" 
            :key="item.id"
            class="group flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
            :class="{ 'opacity-60': item.checked }"
          >
            <button 
              @click="store.toggleChecklistItem(activeCategory.id, item.id)"
              class="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors flex-shrink-0"
              :class="item.checked ? 'bg-jp-mustard border-jp-mustard text-white' : 'border-gray-300 text-transparent hover:border-jp-mustard'"
            >
              <font-awesome-icon icon="fa-solid fa-check" class="text-xs" />
            </button>
            
            <span 
              class="flex-1 text-sm font-medium transition-all"
              :class="item.checked ? 'text-gray-400 line-through' : 'text-jp-dark'"
            >
              {{ item.text }}
            </span>

            <button 
              @click="deleteItem(item.id)"
              class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
          </div>
        </transition-group>

        <!-- Add Item -->
        <div class="mt-4 flex items-center bg-white p-2 pr-4 rounded-xl shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-jp-mustard/20 transition-all">
          <div class="w-10 h-10 flex items-center justify-center text-gray-400">
            <font-awesome-icon icon="fa-solid fa-plus" />
          </div>
          <input 
            v-model="newItemText"
            @keyup.enter="addItem"
            type="text" 
            placeholder="新增項目..." 
            class="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400"
          >
          <button 
            @click="addItem"
            class="text-xs font-bold text-jp-mustard px-3 py-1.5 rounded-lg hover:bg-jp-mustard/10 transition-colors"
            :disabled="!newItemText.trim()"
            :class="{ 'opacity-50 cursor-not-allowed': !newItemText.trim() }"
          >
            新增
          </button>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <InputModal
      :isOpen="showAddCategoryModal"
      title="新增清單分類"
      placeholder="請輸入清單名稱..."
      @close="showAddCategoryModal = false"
      @confirm="handleAddCategoryConfirm"
    />

    <ConfirmModal
      :isOpen="showDeleteCategoryModal"
      title="刪除清單"
      message="確定要刪除此清單及其所有項目嗎？此動作無法復原。"
      confirmText="刪除"
      type="danger"
      @close="showDeleteCategoryModal = false"
      @confirm="handleDeleteCategoryConfirm"
    />

    <ConfirmModal
      :isOpen="showDeleteItemModal"
      title="刪除項目"
      message="確定要刪除此項目嗎？"
      confirmText="刪除"
      type="danger"
      @close="showDeleteItemModal = false"
      @confirm="handleDeleteItemConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import ConfirmModal from '../components/ConfirmModal.vue'
import InputModal from '../components/InputModal.vue'

const store = useTripStore()
const activeTab = ref('pre-trip')
const newItemText = ref('')

// Modal states
const showAddCategoryModal = ref(false)
const showDeleteCategoryModal = ref(false)
const showDeleteItemModal = ref(false)
const itemToDeleteId = ref<string | null>(null)
const categoryToDeleteId = ref<string | null>(null)

// Ensure activeTab is valid
watch(() => store.checklists, (newVal) => {
  if (newVal.length > 0 && !newVal.find(c => c.id === activeTab.value)) {
    activeTab.value = newVal[0].id
  }
}, { deep: true })

const activeCategory = computed(() => {
  return store.checklists?.find(c => c.id === activeTab.value)
})

const totalCount = computed(() => activeCategory.value?.items.length || 0)
const completedCount = computed(() => activeCategory.value?.items.filter(i => i.checked).length || 0)
const progress = computed(() => {
  if (totalCount.value === 0) return 0
  return (completedCount.value / totalCount.value) * 100
})

const addItem = () => {
  if (!newItemText.value.trim() || !activeCategory.value) return
  store.addChecklistItem(activeCategory.value.id, newItemText.value.trim())
  newItemText.value = ''
}

const deleteItem = (itemId: string) => {
  itemToDeleteId.value = itemId
  showDeleteItemModal.value = true
}

const handleDeleteItemConfirm = () => {
  if (activeCategory.value && itemToDeleteId.value) {
    store.deleteChecklistItem(activeCategory.value.id, itemToDeleteId.value)
    itemToDeleteId.value = null
  }
}

const addCategory = () => {
  showAddCategoryModal.value = true
}

const handleAddCategoryConfirm = (name: string) => {
  if (name && name.trim()) {
    store.addChecklistCategory(name.trim())
    // Switch to the new category (it will be the last one)
    setTimeout(() => {
      const newCategory = store.checklists[store.checklists.length - 1]
      if (newCategory) activeTab.value = newCategory.id
    }, 100)
  }
}

const deleteCategory = (id: string) => {
  categoryToDeleteId.value = id
  showDeleteCategoryModal.value = true
}

const handleDeleteCategoryConfirm = () => {
  if (categoryToDeleteId.value) {
    store.deleteChecklistCategory(categoryToDeleteId.value)
    categoryToDeleteId.value = null
  }
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
