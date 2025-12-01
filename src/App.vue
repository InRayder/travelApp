<template>
  <div class="h-screen flex flex-col relative overflow-hidden text-jp-dark font-sans bg-pattern-seigaiha">
    <AppHeader @open-settings="settingsOpen = true" />
    <div class="flex-1 overflow-hidden relative"> <!-- 內距由視圖處理 (Padding handled by views) -->
      <RouterView />
    </div>
    <BottomNav />
    <SettingsModal :isOpen="settingsOpen" @close="settingsOpen = false" />
    <InstallPrompt />
    <OnboardingModal :isOpen="store.isOnboardingOpen" @close="store.completeOnboarding()" />
  </div>
  <SpeedInsights />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTripStore } from './stores/trip.ts'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import SettingsModal from './components/SettingsModal.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import OnboardingModal from './components/OnboardingModal.vue'

import { SpeedInsights } from "@vercel/speed-insights/vue"

const settingsOpen = ref(false)
const store = useTripStore()

onMounted(() => {
  store.checkOnboarding()
})
</script>
