<template>
  <!-- Android / Desktop Install Prompt -->
  <div v-if="showInstallPrompt && !isIOS" class="fixed bottom-20 left-4 right-4 z-50 animate-fade-in-up">
    <div class="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-jp-red rounded-xl flex items-center justify-center text-white shadow-sm">
          <font-awesome-icon icon="fa-solid fa-download" />
        </div>
        <div>
          <h3 class="font-bold text-gray-800 text-sm">安裝 Easy Trip</h3>
          <p class="text-xs text-gray-500">將應用程式加入主畫面，離線也能使用！</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="dismissPrompt" 
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>
        <button 
          @click="installPWA" 
          class="px-4 py-2 bg-jp-dark text-white text-xs font-bold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
        >
          安裝
        </button>
      </div>
    </div>
  </div>

  <!-- iOS Install Instructions -->
  <div v-if="showInstallPrompt && isIOS" class="fixed bottom-0 left-0 right-0 z-50 animate-fade-in-up">
    <div class="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-2xl p-6" style="padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));">
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-jp-red rounded-xl flex items-center justify-center text-white shadow-sm text-xl">
            <font-awesome-icon icon="fa-brands fa-apple" />
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-lg">安裝至 iPhone / iPad</h3>
            <p class="text-sm text-gray-500">請依照下方步驟將 App 加入主畫面</p>
          </div>
        </div>
        <button 
          @click="dismissPrompt" 
          class="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" size="lg" />
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <div class="w-8 h-8 flex items-center justify-center text-blue-500 text-xl">
            <font-awesome-icon icon="fa-solid fa-arrow-up-from-bracket" />
          </div>
          <div class="text-sm text-gray-600">
            1. 點擊瀏覽器下方的 <span class="font-bold text-gray-800">分享</span> 按鈕
          </div>
        </div>
        <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <div class="w-8 h-8 flex items-center justify-center text-gray-600 text-xl border-2 border-gray-300 rounded-lg">
            <font-awesome-icon icon="fa-regular fa-square-plus" />
          </div>
          <div class="text-sm text-gray-600">
            2. 往下滑動並選擇 <span class="font-bold text-gray-800">加入主畫面</span>
          </div>
        </div>
      </div>
      
      <!-- Arrow pointing to bottom center (Safari share button location) -->
      <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400 animate-bounce">
        <font-awesome-icon icon="fa-solid fa-arrow-down" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTripStore } from '../stores/trip'

const store = useTripStore()
const showInstallPrompt = computed(() => !!store.installPromptEvent)
const isIOS = ref(false)

const installPWA = async () => {
  if (!store.installPromptEvent) return
  
  // Show the install prompt
  store.installPromptEvent.prompt()
  
  // Wait for the user to respond to the prompt
  const { outcome } = await store.installPromptEvent.userChoice
  console.log(`User response to the install prompt: ${outcome}`)
  
  // We've used the prompt, and can't use it again, throw it away
  store.clearInstallPrompt()
}

const dismissPrompt = () => {
  store.clearInstallPrompt()
}

const checkIfIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

onMounted(() => {
  // Check if iOS
  isIOS.value = checkIfIOS()
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
