<template>
  <nav class="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/50 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
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


  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>
