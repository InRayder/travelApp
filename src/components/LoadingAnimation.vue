<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[99999] bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white">
      <div class="relative w-32 h-32 mb-8">
        <!-- Globe -->
        <div class="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>
        <div class="absolute inset-2 rounded-full border-2 border-white/10"></div>
        
        <!-- Plane -->
        <div class="absolute inset-0 animate-spin-slow">
          <font-awesome-icon icon="fa-solid fa-plane" class="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl text-jp-mustard drop-shadow-lg transform rotate-45" />
        </div>

        <!-- Clouds -->
        <font-awesome-icon icon="fa-solid fa-cloud" class="absolute top-8 left-4 text-white/40 text-xl animate-float-delay-1" />
        <font-awesome-icon icon="fa-solid fa-cloud" class="absolute bottom-8 right-4 text-white/30 text-lg animate-float-delay-2" />
      </div>

      <h3 class="text-2xl font-black tracking-widest mb-2 animate-bounce">PLANNING</h3>
      <p class="text-white/60 text-sm font-mono typing-effect">{{ message || 'AI 正在為您規劃深度導覽...' }}</p>
      
      <!-- Progress Bar -->
      <div class="w-64 h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-jp-mustard to-jp-accent-blue w-full animate-progress origin-left"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message?: string
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-float-delay-1 {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delay-2 {
  animation: float 3s ease-in-out infinite 1.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-progress {
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(0.7); }
  100% { transform: scaleX(1); transform-origin: right; }
}

.typing-effect {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 3.5s steps(40, end);
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}
</style>
