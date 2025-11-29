<template>
  <div class="h-screen flex flex-col relative overflow-hidden text-jp-dark font-sans bg-pattern-seigaiha">
    <AppHeader @open-settings="settingsOpen = true" />
    <div class="flex-1 overflow-hidden relative"> <!-- 內距由視圖處理 (Padding handled by views) -->
      <RouterView />
    </div>
    <BottomNav />
    <SettingsModal :isOpen="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import SettingsModal from './components/SettingsModal.vue'

const settingsOpen = ref(false)
</script>
