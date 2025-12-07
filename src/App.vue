<template>
  <div class="h-[100dvh] flex flex-col relative overflow-hidden text-jp-dark font-sans bg-pattern-seigaiha">
    <AppHeader @open-settings="store.setSettingsOpen(true)" />
    <div class="flex-1 overflow-hidden relative"> <!-- 內距由視圖處理 (Padding handled by views) -->
      <RouterView />
    </div>
    <BottomNav />
    <SettingsModal :isOpen="store.isSettingsOpen" @close="store.setSettingsOpen(false)" />
    <AiAssistantModal 
    v-if="store.settings.aiSettings?.apiKey"
    :isOpen="store.isAiAssistantOpen"
    @close="store.isAiAssistantOpen = false"
    @open-settings="store.setSettingsOpen(true)"
  />
    
    <!-- AI Assistant FAB -->
    <button
      v-if="store.settings.aiSettings?.apiKey"
      @click="store.isAiAssistantOpen = true"
      class="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
      aria-label="AI 助手"
    >
      <font-awesome-icon icon="wand-magic-sparkles" class="text-xl" />
    </button>

    <InstallPrompt v-if="!store.isOnboardingOpen" />
    <OnboardingModal :isOpen="store.isOnboardingOpen" @close="store.completeOnboarding()" />
  </div>
  <SpeedInsights />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { RouterView } from 'vue-router'
import { useTripStore } from './stores/trip.ts'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import SettingsModal from './components/SettingsModal.vue'
import AiAssistantModal from './components/AiAssistantModal.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import OnboardingModal from './components/OnboardingModal.vue'

import { SpeedInsights } from "@vercel/speed-insights/vue"

const store = useTripStore()

const handleInstallPrompt = (e: Event) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  // Stash the event so it can be triggered later.
  store.setInstallPrompt(e)
}

onMounted(() => {
  store.loadData()
  store.checkOnboarding()
  window.addEventListener('beforeinstallprompt', handleInstallPrompt)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
})
</script>
