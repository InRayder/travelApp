<template>
  <nav 
    class="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/50 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-out"
    :class="isHidden ? 'translate-y-full' : 'translate-y-0'"
  >
    <RouterLink to="/" custom v-slot="{ navigate, isActive }">
      <button @click="navigate" class="flex flex-col items-center gap-1 transition-colors" :class="isActive ? 'text-jp-mustard' : 'text-gray-400 hover:text-gray-600'">
        <font-awesome-icon icon="fa-solid fa-suitcase-rolling" class="text-2xl" />
        <span class="text-[10px] font-bold">行程</span>
      </button>
    </RouterLink>

    <RouterLink to="/guides" custom v-slot="{ navigate, isActive }">
      <button @click="navigate" class="flex flex-col items-center gap-1 transition-colors" :class="isActive ? 'text-jp-red' : 'text-gray-400 hover:text-gray-600'">
        <font-awesome-icon icon="fa-solid fa-book-open" class="text-2xl" />
        <span class="text-[10px] font-bold">攻略</span>
      </button>
    </RouterLink>

    <RouterLink to="/accounting" custom v-slot="{ navigate, isActive }">
      <button @click="navigate" class="flex flex-col items-center gap-1 transition-colors" :class="isActive ? 'text-jp-accent-green' : 'text-gray-400 hover:text-gray-600'">
        <font-awesome-icon icon="fa-solid fa-calculator" class="text-2xl" />
        <span class="text-[10px] font-bold">記帳</span>
      </button>
    </RouterLink>

    <!-- 更多按鈕 -->
    <button 
      @click="toggleMoreMenu" 
      class="flex flex-col items-center gap-1 transition-colors"
      :class="isMoreActive ? 'text-jp-indigo' : 'text-gray-400 hover:text-gray-600'"
    >
      <font-awesome-icon icon="fa-solid fa-ellipsis" class="text-2xl" />
      <span class="text-[10px] font-bold">更多</span>
    </button>
  </nav>

  <!-- 更多選單遮罩 -->
  <Transition name="fade">
    <div 
      v-if="isMoreMenuOpen" 
      class="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm"
      @click="closeMoreMenu"
    ></div>
  </Transition>

  <!-- 更多選單面板 (Action Sheet 風格) -->
  <Transition name="slide-up">
    <div 
      v-if="isMoreMenuOpen" 
      class="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl pb-safe overflow-hidden"
    >
      <!-- 拉動條指示器 -->
      <div class="flex justify-center pt-3 pb-2">
        <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      <!-- 選單標題 -->
      <div class="px-6 pb-3 border-b border-gray-100">
        <h3 class="text-lg font-bold text-jp-dark">更多功能</h3>
      </div>

      <!-- 選單項目 -->
      <div class="px-4 py-3 grid grid-cols-4 gap-4">
        <!-- 清單 -->
        <RouterLink to="/checklist" custom v-slot="{ navigate, isActive }">
          <button 
            @click="navigateAndClose(navigate)" 
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
            :class="isActive ? 'bg-amber-50 text-jp-mustard' : 'text-gray-600 hover:bg-gray-50'"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="isActive ? 'bg-amber-100' : 'bg-gray-100'">
              <font-awesome-icon icon="fa-solid fa-list-check" class="text-xl" />
            </div>
            <span class="text-xs font-medium">清單</span>
          </button>
        </RouterLink>

        <!-- 對話 -->
        <RouterLink to="/conversation" custom v-slot="{ navigate, isActive }">
          <button 
            @click="navigateAndClose(navigate)" 
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
            :class="isActive ? 'bg-indigo-50 text-jp-indigo' : 'text-gray-600 hover:bg-gray-50'"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="isActive ? 'bg-indigo-100' : 'bg-gray-100'">
              <font-awesome-icon icon="fa-solid fa-comments" class="text-xl" />
            </div>
            <span class="text-xs font-medium">對話</span>
          </button>
        </RouterLink>

        <!-- Vlog 腳本 -->
        <RouterLink to="/vlog-script" custom v-slot="{ navigate, isActive }">
          <button 
            @click="navigateAndClose(navigate)" 
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
            :class="isActive ? 'bg-rose-50 text-rose-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="isActive ? 'bg-rose-100' : 'bg-gray-100'">
              <font-awesome-icon icon="fa-solid fa-clapperboard" class="text-xl" />
            </div>
            <span class="text-xs font-medium">Vlog</span>
          </button>
        </RouterLink>

        <!-- AI 相機 -->
        <RouterLink to="/ai-camera" custom v-slot="{ navigate, isActive }">
          <button 
            @click="navigateAndClose(navigate)" 
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
            :class="isActive ? 'bg-purple-50 text-purple-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="isActive ? 'bg-purple-100' : 'bg-gray-100'">
              <font-awesome-icon icon="fa-solid fa-camera-retro" class="text-xl" />
            </div>
            <span class="text-xs font-medium">AI 相機</span>
          </button>
        </RouterLink>

        <!-- 設定 -->
        <button 
          @click="openSettings" 
          class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all text-gray-600 hover:bg-gray-50"
        >
          <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-gear" class="text-xl" />
          </div>
          <span class="text-xs font-medium">設定</span>
        </button>
      </div>

      <!-- 取消按鈕 -->
      <div class="px-4 pb-4">
        <button 
          @click="closeMoreMenu"
          class="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTripStore } from '../stores/trip.ts'

const route = useRoute()
const store = useTripStore()

const isMoreMenuOpen = ref(false)

// 判斷是否隱藏導覽列（AI 相機頁面時隱藏）
const isHidden = computed(() => {
  return route.path === '/ai-camera'
})

// 判斷是否有「更多」選單內的頁面處於活動狀態
const isMoreActive = computed(() => {
  return ['/checklist', '/conversation', '/vlog-script', '/ai-camera'].includes(route.path)
})

const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value
}

const closeMoreMenu = () => {
  isMoreMenuOpen.value = false
}

const navigateAndClose = (navigate: () => void) => {
  navigate()
  closeMoreMenu()
}

const openSettings = () => {
  closeMoreMenu()
  store.setSettingsOpen(true)
}
</script>

<style scoped>
.pb-safe {
  /* 使用 safe-area-inset-bottom 處理有圓角或 home indicator 的手機 */
  /* 額外增加基本 padding 確保即使在一般手機上也有足夠空間 */
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

/* 遮罩漸變動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 選單滑入動畫 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
