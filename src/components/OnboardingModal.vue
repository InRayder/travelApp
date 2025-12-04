<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center p-4" :style="{ zIndex }">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col min-h-[500px]">
        
        <!-- Content Area -->
        <div class="flex-1 relative overflow-hidden">
          <transition-group name="slide" tag="div" class="absolute inset-0">
            
            <!-- Slide 1: Welcome -->
            <div v-if="currentSlide === 0" key="0" class="absolute inset-0 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div class="w-32 h-32 bg-jp-red/10 rounded-full flex items-center justify-center text-6xl text-jp-red mb-4 animate-bounce-slow">
                <font-awesome-icon icon="fa-solid fa-plane-departure" />
              </div>
              <h2 class="text-2xl font-bold text-jp-dark">歡迎使用 Easy Trip</h2>
              <p class="text-gray-600 leading-relaxed">
                這是一款專為日本自由行設計的行程規劃工具。<br>
                輕鬆管理您的行程、交通、預算與旅伴。
              </p>
            </div>

            <!-- Slide 2: Features -->
            <div v-if="currentSlide === 1" key="1" class="absolute inset-0 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div class="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div class="bg-orange-50 p-4 rounded-xl flex flex-col items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-calendar-days" class="text-2xl text-orange-500" />
                  <span class="text-xs font-bold text-gray-600">行程規劃</span>
                </div>
                <div class="bg-blue-50 p-4 rounded-xl flex flex-col items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-train" class="text-2xl text-blue-500" />
                  <span class="text-xs font-bold text-gray-600">交通管理</span>
                </div>
                <div class="bg-green-50 p-4 rounded-xl flex flex-col items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-yen-sign" class="text-2xl text-green-500" />
                  <span class="text-xs font-bold text-gray-600">記帳分帳</span>
                </div>
                <div class="bg-purple-50 p-4 rounded-xl flex flex-col items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-language" class="text-2xl text-purple-500" />
                  <span class="text-xs font-bold text-gray-600">日語對話</span>
                </div>
              </div>
              <h3 class="text-xl font-bold text-jp-dark">全方位的功能</h3>
              <p class="text-sm text-gray-500">
                從每日行程安排、交通票券管理，到旅途中的記帳與日語溝通，我們都幫您準備好了。
              </p>
            </div>

            <!-- Slide 3: AI Assistant -->
            <div v-if="currentSlide === 2" key="2" class="absolute inset-0 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div class="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-4xl text-purple-600 mb-2 animate-pulse">
                <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" />
              </div>
              <h3 class="text-xl font-bold text-jp-dark">AI 智慧助手</h3>
              <p class="text-gray-600 text-sm leading-relaxed px-4">
                您的全能旅遊夥伴！<br>
                除了<span class="font-bold text-purple-600">翻譯與對話</span>，還能協助<br>
                <span class="font-bold text-purple-600">生成攻略</span>、<span class="font-bold text-purple-600">推薦交通</span>與<span class="font-bold text-purple-600">討論行程</span>。
              </p>
              <div class="bg-purple-50 p-4 rounded-xl text-xs text-left w-full space-y-2 border border-purple-100">
                <p><font-awesome-icon icon="fa-solid fa-map-location-dot" class="text-green-500 mr-2" />攻略生成、交通推薦、行程討論</p>
                <p><font-awesome-icon icon="fa-solid fa-language" class="text-blue-500 mr-2" />極速翻譯、情境模擬、語音朗讀</p>
                <p class="pt-2 border-t border-purple-200 text-purple-600 font-bold">
                  <font-awesome-icon icon="fa-solid fa-key" class="mr-2" />需於設定中輸入 API Key 才能使用 AI 功能
                </p>
              </div>
            </div>

            <!-- Slide 3: Sample Data -->
            <div v-if="currentSlide === 3" key="3" class="absolute inset-0 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div class="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-4xl text-yellow-600 mb-2">
                <font-awesome-icon icon="fa-solid fa-file-pen" />
              </div>
              <h3 class="text-xl font-bold text-jp-dark">關於範例資料</h3>
              <p class="text-gray-600 text-sm leading-relaxed px-4">
                您目前看到的行程是<span class="font-bold text-jp-red">範例資料</span>，僅供參考操作方式。
              </p>
              <div class="bg-gray-50 p-4 rounded-xl text-xs text-left w-full space-y-2 border border-gray-100">
                <p><font-awesome-icon icon="fa-solid fa-check" class="text-green-500 mr-2" />您可以隨時在「設定」中清空資料。</p>
                <p><font-awesome-icon icon="fa-solid fa-check" class="text-green-500 mr-2" />也可以使用「AI 匯入助手」將您的 Excel 行程快速轉換匯入。</p>
              </div>
            </div>

            <!-- Slide 4: Install App -->
            <div v-if="currentSlide === 4" key="4" class="absolute inset-0 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div class="w-24 h-24 bg-jp-dark rounded-full flex items-center justify-center text-4xl text-white mb-2 shadow-lg">
                <font-awesome-icon icon="fa-solid fa-download" />
              </div>
              <h3 class="text-xl font-bold text-jp-dark">安裝應用程式</h3>
              <p class="text-gray-600 text-sm leading-relaxed px-4">
                將 Easy Trip 加入主畫面，<br>
                享受更流暢的離線體驗！
              </p>
              
              <div v-if="canInstall" class="w-full">
                <button 
                  @click="installApp"
                  class="w-full py-3 bg-jp-dark text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <font-awesome-icon icon="fa-solid fa-download" />
                  立即安裝
                </button>
              </div>

              <div v-else-if="isIOS && !isStandalone" class="bg-gray-50 p-4 rounded-xl text-xs text-left w-full space-y-3 border border-gray-100">
                <p class="font-bold text-center text-gray-700 mb-2">iOS 安裝教學</p>
                <div class="flex items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-arrow-up-from-bracket" class="text-blue-500 text-lg" />
                  <span>1. 點擊瀏覽器下方的「分享」</span>
                </div>
                <div class="flex items-center gap-3">
                  <font-awesome-icon icon="fa-regular fa-square-plus" class="text-gray-600 text-lg" />
                  <span>2. 選擇「加入主畫面」</span>
                </div>
              </div>

              <div v-else class="bg-green-50 p-4 rounded-xl text-center w-full border border-green-100">
                <p class="text-green-600 font-bold">
                  <font-awesome-icon icon="fa-solid fa-check-circle" class="mr-2" />
                  已安裝或不支援
                </p>
              </div>
            </div>

          </transition-group>
        </div>

        <!-- Footer / Controls -->
        <div class="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <!-- Dots -->
          <div class="flex gap-2">
            <div 
              v-for="i in 5" 
              :key="i"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="currentSlide === i - 1 ? 'bg-jp-dark w-6' : 'bg-gray-300'"
            ></div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button 
              v-if="currentSlide > 0"
              @click="prevSlide"
              class="px-4 py-2 text-gray-500 font-bold text-sm hover:text-gray-700"
            >
              上一步
            </button>
            
            <button 
              v-if="currentSlide < 4"
              @click="nextSlide"
              class="px-6 py-2 bg-jp-dark text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              下一步
            </button>
            
            <button 
              v-else
              @click="finish"
              class="px-6 py-2 bg-jp-red text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-200 animate-pulse"
            >
              開始旅程
            </button>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { useTripStore } from '../stores/trip'
import { useDynamicZIndex } from '../composables/useZIndex'

const props = defineProps<{
  isOpen: boolean
}>()

const { zIndex } = useDynamicZIndex(toRef(props, 'isOpen'))

const emit = defineEmits(['close'])
const store = useTripStore()

const currentSlide = ref(0)
const totalSlides = 4 // 0, 1, 2, 3, 4 (Total 5 slides)

const canInstall = computed(() => !!store.installPromptEvent)
const isIOS = computed(() => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()))
const isStandalone = computed(() => ('standalone' in window.navigator) && (window.navigator as any).standalone)

const nextSlide = () => {
  if (currentSlide.value < totalSlides) {
    currentSlide.value++
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const installApp = async () => {
  if (!store.installPromptEvent) return
  store.installPromptEvent.prompt()
  const { outcome } = await store.installPromptEvent.userChoice
  console.log(`User response to the install prompt: ${outcome}`)
  store.clearInstallPrompt()
}

const finish = () => {
  emit('close')
  // Reset slide for next time
  setTimeout(() => {
    currentSlide.value = 0
  }, 300)
}

</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
