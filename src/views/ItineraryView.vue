<template>
  <div class="flex flex-col h-full">
    <DateSelector :days="days" :currentDayIndex="currentDayIndex" @select-day="selectDay" />

    <main class="flex-1 overflow-y-auto relative bg-jp-cream scroll-smooth" id="main-scroll">
      <div class="pt-6 pb-24 min-h-full">
        <!-- 拖曳容器 (Draggable Container) -->
        <div ref="eventsList" class="sortable-list">
          <div v-for="(item, idx) in currentDay.events" :key="item.id || `event-${idx}-${currentDayIndex}`" class="flex group relative event-item" :data-id="idx">
            <!-- 時間軸欄位 (Timeline Columns) -->
            <div class="w-16 flex-shrink-0 flex flex-col items-end text-right pr-3 pt-1 transition-opacity duration-200" :class="{ 'opacity-30': isDragging }">
              <span class="text-sm font-bold text-jp-dark font-mono">{{ item.time }}</span>
              <span v-if="item.endTime" class="text-[10px] text-gray-400 mt-0.5">{{ item.endTime }}</span>
            </div>
            <div class="w-8 flex-shrink-0 flex flex-col items-center relative timeline-axis timeline-insert-zone">
              <div class="absolute top-3 bottom-[-1.5rem] timeline-line z-0"></div>
              <div class="w-3 h-3 bg-white border-2 border-gray-300 rounded-full z-10 relative mt-2 transition-transform duration-200" :class="{ 'scale-125 border-jp-mustard': isDragging }"></div>
              <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 timeline-insert-btn opacity-0 transition-all duration-200 transform scale-50">
                <button @click.stop="openInsertModal(idx)" class="w-6 h-6 rounded-full bg-jp-mustard text-white flex items-center justify-center shadow-lg hover:scale-110" title="在此處插入行程">
                  <font-awesome-icon icon="fa-solid fa-plus" class="text-[10px]" />
                </button>
              </div>
            </div>
            <!-- 內容欄位 (Content Column) -->
            <div class="flex-1 pb-8 pr-4 min-w-0">
                
              <EventCard 
                :item="item" 
                :index="idx"
                @click-edit="openEditModal"
                @open-guide="openGuide"
                @open-expense="openExpense"
                @open-discount="openDiscount"
              />

              <TransportConnector 
                v-if="idx < currentDay.events.length - 1"
                :nextItem="currentDay.events[idx+1]"
                :nextIndex="idx+1"
                @open-transport="openTransport"
              />
            </div>
          </div>
        </div>


      </div>
    </main>

    <!-- 頁尾 (Footer) -->
    <!-- 頁尾 (Footer) -->
    <div class="bg-white border-t border-gray-100 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] shrink-0 transition-all duration-300 ease-in-out" 
         :class="isFooterExpanded ? 'pb-[calc(80px+env(safe-area-inset-bottom))]' : 'pb-[calc(20px+env(safe-area-inset-bottom))]'">
      <div class="p-4">

        <div class="flex justify-between items-center cursor-pointer" @click="isFooterExpanded = !isFooterExpanded">
          <!-- Collapsed State: Simple Expand Button -->
          <div v-if="!isFooterExpanded" class="w-full flex items-center justify-center gap-2 text-gray-400 py-2">
            <font-awesome-icon icon="fa-solid fa-chevron-up" class="text-xs animate-bounce" />
            <span class="text-xs font-bold tracking-widest">展開顯示備案與詳情</span>
          </div>

          <!-- Expanded State: Header with Title and Collapse Button -->
          <div v-else class="w-full flex justify-between items-center">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2">
              預估花費
            </div>
            <button class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
              <font-awesome-icon icon="fa-solid fa-chevron-down" class="text-[10px]" />
            </button>
          </div>
        </div>
        
        <div class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out" :class="{'grid-rows-[1fr]': isFooterExpanded}">
          <div class="overflow-hidden">
            <div class="pt-2 space-y-4">
              <!-- 預算詳情 (Budget Details) -->
              <!-- 預算詳情 (Budget Details) -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[10px] text-gray-400 font-bold mb-1">當日預估花費</p>
                  <div class="flex items-baseline gap-2">
                    <span class="text-xl font-bold text-jp-dark font-mono">{{ store.currentCurrency.symbol }}{{ Math.round(dailyTotal * store.currentCurrency.rate).toLocaleString() }}</span>
                    <span v-if="store.settings.currency !== 'TWD'" class="text-[10px] text-gray-400 font-bold">≈ NT$ {{ Math.round(dailyTotal * 0.22).toLocaleString() }}</span>
                  </div>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 font-bold mb-1">總共預估花費</p>
                  <div class="flex items-baseline gap-2">
                    <span class="text-xl font-bold text-jp-dark font-mono">{{ store.currentCurrency.symbol }}{{ Math.round(totalEstimatedCost * store.currentCurrency.rate).toLocaleString() }}</span>
                    <span v-if="store.settings.currency !== 'TWD'" class="text-[10px] text-gray-400 font-bold">≈ NT$ {{ Math.round(totalEstimatedCost * 0.22).toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- 備案區塊 (Backup Section in Footer) -->
              <div class="border-t border-dashed border-gray-200 pt-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-umbrella-beach" class="text-gray-400" /> 行程備案
                  </h3>
                  <button @click.stop="openAddModal(true)" class="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 font-bold">
                    <font-awesome-icon icon="fa-solid fa-plus" /> 新增
                  </button>
                </div>
                <div class="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  <div v-for="(backup, bIdx) in store.backups" :key="bIdx" class="bg-gray-50 border border-gray-100 rounded-lg p-2 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                    <div class="flex-1 min-w-0 pr-2">
                      <div class="flex items-center gap-1.5 mb-0.5">
                        <span class="text-[8px] px-1 rounded border" :class="getCategoryColor(backup.category).replace('bg-', 'text-').replace('border-l-4', '') + ' border-current'">{{ getCategoryLabel(backup.category) }}</span>
                        <span class="text-xs font-bold text-gray-700 truncate">{{ backup.title }}</span>
                      </div>
                      <div class="text-[9px] text-gray-400 truncate">{{ backup.location }}</div>
                    </div>
                    <div class="flex gap-1 shrink-0">
                      <button @click.stop="promoteBackup(bIdx)" class="w-6 h-6 rounded bg-white border border-gray-200 text-jp-mustard flex items-center justify-center hover:bg-jp-mustard hover:text-white transition-colors" title="加入行程">
                        <font-awesome-icon icon="fa-solid fa-arrow-up" class="text-[10px]" />
                      </button>
                      <button @click.stop="deleteBackup(bIdx)" class="w-6 h-6 rounded bg-white border border-gray-200 text-gray-300 flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors">
                        <font-awesome-icon icon="fa-solid fa-trash" class="text-[10px]" />
                      </button>
                    </div>
                  </div>
                  <div v-if="!store.backups || store.backups.length === 0" class="text-center py-4 text-[10px] text-gray-300 border border-dashed border-gray-100 rounded-lg">尚未設定備案</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模態視窗 (Modals) -->
    <EditEventModal 
      :isOpen="editModalOpen"
      :initialData="editingItem"
      :isBackup="isAddingBackup"
      :isAdding="isAdding"
      @close="editModalOpen = false"
      @save="saveEdit"
      @delete="deleteEvent"
      @move-to-backup="moveToBackup"
    />

    <InsertSelectionModal
      :isOpen="insertModalOpen"
      :backups="store.backups"
      @close="insertModalOpen = false"
      @new-event="handleInsertNew"
      @from-backup="handleInsertFromBackup"
    />

    <GuideModal
      :key="guideUpdateCount"
      :isOpen="guideModalOpen"
      :guide="activeGuide"
      @close="guideModalOpen = false"
      @save="handleGuideSave"
    />

    <ExpenseModal
      :isOpen="expenseModalOpen"
      :initialData="editingExpense"
      @close="expenseModalOpen = false"
      @save="saveExpense"
    />

    <TransportModal
      :isOpen="!!activeTransport"
      :transportData="activeTransport"
      @close="activeTransport = null"
      @edit="handleTransportEdit"
    />

    <DiscountModal
      :isOpen="!!activeDiscountItem"
      :discounts="activeDiscountItem?.discounts"
      @close="activeDiscountItem = null"
    />

    <ConfirmModal
      :isOpen="confirmModalOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :showCancel="showCancel"
      @close="confirmModalOpen = false"
      @confirm="handleConfirmAction"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useTripStore } from '../stores/trip.ts'

const isFooterExpanded = ref(false)
import { storeToRefs } from 'pinia'
import Sortable from 'sortablejs'
import DateSelector from '../components/DateSelector.vue'
import EventCard from '../components/EventCard.vue'
import TransportConnector from '../components/TransportConnector.vue'
import EditEventModal from '../components/EditEventModal.vue'
import InsertSelectionModal from '../components/InsertSelectionModal.vue'
import GuideModal from '../components/GuideModal.vue'
import ExpenseModal from '../components/ExpenseModal.vue'
import TransportModal from '../components/TransportModal.vue'
import DiscountModal from '../components/DiscountModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import type { Event, Expense } from '../stores/trip.ts'

const store = useTripStore()
const { days, attractionGuides } = storeToRefs(store)

const currentDayIndex = ref(0)
const eventsList = ref<HTMLElement | null>(null)
const isDragging = ref(false)
let sortableInstance: Sortable | null = null

const currentDay = computed(() => days.value[currentDayIndex.value] || { events: [] })
const totalEstimatedCost = computed(() => {
  const globalRate = store.currentCurrency.rate
  return store.days.reduce((total: number, day: any) => {
    return total + (day.events || []).reduce((sum: number, item: Event) => {
      const cost = item.cost || 0
      const itemRate = store.currencies[item.currency || 'JPY']?.rate || 1
      return sum + (cost / itemRate * globalRate)
    }, 0)
  }, 0)
})
const dailyTotal = computed(() => {
  const globalRate = store.currentCurrency.rate
  return (currentDay.value.events || []).reduce((sum: number, item: Event) => {
    const cost = item.cost || 0
    const itemRate = store.currencies[item.currency || 'JPY']?.rate || 1
    return sum + (cost / itemRate * globalRate)
  }, 0)
})
// 模態視窗狀態 (Modal States)
const editModalOpen = ref(false)
const insertModalOpen = ref(false)
const guideModalOpen = ref(false)
const expenseModalOpen = ref(false)
const editingItem = ref<Event | null>(null)
const editingExpense = ref<Expense | null>(null)
const editingIndex = ref(-1)
const isAddingBackup = ref(false)
const isAdding = ref(false)
const insertAtIndex = ref(-1)
const promotedBackupIdx = ref(-1)
const activeGuide = ref<any>(null)
const activeTransport = ref<any>(null)
const activeTransportIndex = ref(-1)
const activeTransportItem = ref<Event | null>(null)
const activeDiscountItem = ref<Event | null>(null)

// 確認視窗狀態
const confirmModalOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const showCancel = ref(true)
const confirmCallback = ref<(() => void) | null>(null)

const openAlert = (message: string) => {
  confirmTitle.value = '提示'
  confirmMessage.value = message
  confirmCallback.value = null
  showCancel.value = false
  confirmModalOpen.value = true
}

const openConfirmModal = (title: string, message: string, callback: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmCallback.value = callback
  showCancel.value = true
  confirmModalOpen.value = true
}

const handleConfirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
    confirmCallback.value = null
  }
}

/**
 * 初始化 SortableJS 拖曳排序功能
 * (Initialize SortableJS)
 */
const initSortable = () => {
  if (eventsList.value) {
    if (sortableInstance) sortableInstance.destroy()
    sortableInstance = new Sortable(eventsList.value, {
      animation: 150,
      handle: '.drag-handle',
      delay: 100,
      delayOnTouchOnly: true,
      onStart: () => { isDragging.value = true },
      onEnd: (evt: any) => {
        isDragging.value = false
        const item = currentDay.value.events.splice(evt.oldIndex, 1)[0]
        currentDay.value.events.splice(evt.newIndex, 0, item)
        store.saveData()
      }
    })
  }
}

const selectDay = (index: number) => {
  currentDayIndex.value = index
  nextTick(() => initSortable())
}

onMounted(() => {
  store.loadData()
  nextTick(() => initSortable())
})

watch(currentDayIndex, () => {
  nextTick(() => initSortable())
})

// --- 模態視窗邏輯 (Modal Logic) ---

/**
 * 開啟編輯視窗
 * @param {Object} item - 要編輯的行程物件
 * @param {Number} idx - 行程索引
 */
const openEditModal = (item: Event, idx: number) => {
  console.log('openEditModal called', item, idx)
  editingItem.value = item
  editingIndex.value = idx
  isAddingBackup.value = false
  isAdding.value = false
  editModalOpen.value = true
}

/**
 * 開啟新增視窗
 * @param {Boolean} backup - 是否為新增備案
 */
const openAddModal = (backup = false) => {
  editingItem.value = null
  editingIndex.value = -1
  isAddingBackup.value = backup
  isAdding.value = true
  editModalOpen.value = true
}

/**
 * 開啟插入選擇視窗
 * @param {Number} idx - 插入位置索引
 */
const openInsertModal = (idx: number) => {
  insertAtIndex.value = idx + 1
  insertModalOpen.value = true
}

const handleInsertNew = () => {
  insertModalOpen.value = false
  openAddModal(false)
}

const handleInsertFromBackup = (idx: number) => {
  insertModalOpen.value = false
  promotedBackupIdx.value = idx
  const backup = store.backups[idx]
  editingItem.value = backup
  editingIndex.value = -1
  isAddingBackup.value = false
  isAdding.value = true 
  editModalOpen.value = true
}

/**
 * 儲存編輯後的行程
 * @param {Object} data - 編輯後的資料
 */
const saveEdit = (data: Event) => {
  const newItem = { ...data } // Ensure we're working with a copy
  if (isAdding.value) {
    if (isAddingBackup.value) {
      store.backups.push(newItem)
    } else {
      if (insertAtIndex.value !== -1) {
        currentDay.value.events.splice(insertAtIndex.value, 0, newItem)
        insertAtIndex.value = -1
      } else {
        currentDay.value.events.push(newItem)
      }
    }
  } else {
    // Editing existing
    if (isAddingBackup.value) {
      // Editing a backup
      if (editingIndex.value !== -1) {
        store.backups[editingIndex.value] = newItem
      }
    } else {
      // Editing an event
      if (editingIndex.value !== -1) {
        currentDay.value.events[editingIndex.value] = newItem
      }
    }
  }

  // If promoting a backup, remove it from backups after it's added to events
  if (promotedBackupIdx.value !== -1 && !isAddingBackup.value && !isAdding.value) {
    store.backups.splice(promotedBackupIdx.value, 1)
    promotedBackupIdx.value = -1
  }

  currentDay.value.events.sort((a, b) => a.time.localeCompare(b.time))
  store.saveData()
  editModalOpen.value = false
}

/**
 * 刪除行程
 */
const deleteEvent = () => {
  openConfirmModal('刪除行程', '確定要刪除此行程嗎？', () => {
    editModalOpen.value = false
    // Use object reference to find index, more robust than editingIndex
    if (editingItem.value) {
      const events = currentDay.value.events
      const idx = events.indexOf(editingItem.value)
      if (idx !== -1) {
        events.splice(idx, 1)
        store.saveData()
      } else if (editingIndex.value !== -1) {
        // Fallback to index if object not found (e.g. if cloned)
        events.splice(editingIndex.value, 1)
        store.saveData()
      }
    }
  })
}

/**
 * 將行程移至備案
 */
const moveToBackup = () => {
  if (editingIndex.value !== -1 && !isAddingBackup.value) {
    const item = currentDay.value.events.splice(editingIndex.value, 1)[0]
    store.backups.push(item)
    store.saveData()
    editModalOpen.value = false
  }
}

const promoteBackup = (idx: number) => {
  promotedBackupIdx.value = idx
  insertModalOpen.value = true // Open modal to ask where to insert? Or just append?
  // For simplicity, let's just append or open insert modal logic
  // Actually, let's just append to end for now or use insert logic if we want to be fancy
  // But wait, the UI has a button on the backup item.
  // Let's just append to current day for simplicity as per original logic?
  // Original logic: just pushed to events.
  const item = store.backups.splice(idx, 1)[0]
  currentDay.value.events.push(item)
  store.saveData()
}

const deleteBackup = (idx: number) => {
  openConfirmModal('刪除備案', '確定要刪除此備案嗎？', () => {
    store.backups.splice(idx, 1)
    store.saveData()
  })
}

// 導覽邏輯 (Guide Logic)
const getGuideKey = (item: Event) => {
    if (!item) return null;
    if (item.linkedGuide && attractionGuides.value[item.linkedGuide]) {
        return item.linkedGuide;
    }
    const title = item.title;
    if (!title) return null;
    for (const key of Object.keys(attractionGuides.value)) {
        if (title.includes(key)) {
            return key;
        }
    }
    return null;
}

const openGuide = (item: Event | string) => {
  let key
  if (typeof item === 'string') {
    key = item
  } else {
    key = getGuideKey(item)
  }

  if (key && attractionGuides.value[key]) {
    activeGuide.value = {
      title: key,
      data: attractionGuides.value[key]
    }
    guideModalOpen.value = true
  }
}

const openExpense = (item: Event) => {
  // 預填支出視窗資料 (Pre-fill expense modal)
  const expenseData = {
    title: item.title,
    amount: item.cost || null,
    category: item.category,
    payer: store.travelers[0],
    splitMethod: 'average',
    involved: [...store.travelers],
    customShares: {} as Record<string, number>,
    date: currentDay.value.dateStr.split(' ')[0],
    currency: item.currency || store.settings.currency
  }
  store.travelers.forEach(t => expenseData.customShares[t] = 0)
  
  // 我們需要將此傳遞給 ExpenseModal，但 ExpenseModal 通常在 AccountingView 中。
  // 不過，我們可以將 ExpenseModal 添加到 ItineraryView 或使用全域 store 狀態來控制模態視窗。
  // 為了簡單起見，我們將 ExpenseModal 也添加到 ItineraryView 中。
  editingExpense.value = expenseData as Expense
  editingIndex.value = -1 // New expense
  expenseModalOpen.value = true
}

const openTransport = (item: Event, idx: number) => {
  const t = item.transport
  if (!t) return
  activeTransport.value = {
    transport: t,
    time: item.time
  }
  activeTransportIndex.value = idx
  activeTransportItem.value = item
}

const handleTransportEdit = () => {
  // 關閉交通模態視窗 (Close transport modal)
  activeTransport.value = null
  // 為該項目開啟編輯視窗 (Open edit modal for the item)
  if (activeTransportItem.value && activeTransportIndex.value !== -1) {
    openEditModal(activeTransportItem.value, activeTransportIndex.value)
  }
}

const openDiscount = (item: Event) => {
  if (item.discounts && item.discounts.length > 0) {
    activeDiscountItem.value = item
  }
}

const guideUpdateCount = ref(0)

const handleGuideSave = (title: string, data: any) => {
  if (title && data) {
    console.log('Saving guide:', title, data)
    // 1. Update Store
    store.attractionGuides[title] = JSON.parse(JSON.stringify(data))
    store.saveData()

    // 2. Update Active Guide directly with new data
    if (activeGuide.value && activeGuide.value.title === title) {
      activeGuide.value = {
        title: title,
        data: data 
      }
      // 3. Force re-render
      guideUpdateCount.value++
    }
  }
}

const saveExpense = (data: Expense) => {
  store.expenses.push(data)
  store.saveData()
  expenseModalOpen.value = false
  openAlert('支出已新增')
}

// 輔助函式 (Helpers)
const getCategoryLabel = (cat: string) => {
  const found = store.categories.find(c => c.id === cat)
  return found ? found.name : '其他'
}
const getCategoryColor = (cat: string) => {
  const map: Record<string, string> = { flight: 'bg-blue-400', transport: 'bg-jp-accent-blue', stay: 'bg-purple-400', food: 'bg-orange-400', fun: 'bg-jp-mustard', shop: 'bg-pink-400' }
  return map[cat] || 'bg-gray-400'
}
</script>
