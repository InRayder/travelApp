<template>
  <div class="h-full flex flex-col bg-jp-cream">
    <div class="px-6 pt-8 pb-4">
      <h1 class="text-2xl font-black text-jp-dark mb-1">深度導覽</h1>
      <p class="text-xs text-gray-500">Travel Guides & Tips</p>
    </div>

    <div 
      class="flex-1 overflow-y-auto px-6 pb-24"
      @scroll="handleScroll"
    >
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(guide, key) in attractionGuides" :key="key" 
             @click="openGuide(key)"
             class="aspect-[4/5] rounded-2xl relative overflow-hidden shadow-card group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
          
          <div class="absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110" :class="guide.color"></div>
          <!-- Background Image -->
          <div v-if="guide.image" class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-50 mix-blend-overlay" :style="{ backgroundImage: `url('${guide.image}')` }"></div>
          
          <div class="absolute inset-0 flex flex-col justify-between p-4">
            <div class="flex justify-end">
              <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                <font-awesome-icon icon="fa-solid fa-arrow-right" class="transform -rotate-45 text-xs group-hover:rotate-0 transition-transform" />
              </div>
            </div>
            
            <div>
              <font-awesome-icon :icon="guide.icon" class="text-4xl text-white/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-12 group-hover:scale-125 transition-transform duration-500" />
              <h3 class="text-xl font-black text-white relative z-10 shadow-black drop-shadow-md leading-tight">{{ key }}</h3>
              <div class="flex flex-wrap gap-1 mt-2 relative z-10">
                <span v-for="tag in guide.tags.slice(0, 2)" :key="tag" class="text-[9px] bg-black/20 text-white px-1.5 py-0.5 rounded backdrop-blur-md">#{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Add New Guide Button -->
        <div @click="addNewGuide" class="aspect-[4/5] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-jp-mustard hover:text-jp-mustard hover:bg-yellow-50 transition-colors cursor-pointer">
          <font-awesome-icon icon="fa-solid fa-plus" class="text-2xl mb-2" />
          <span class="text-xs font-bold">新增攻略</span>
        </div>
      </div>
    </div>

    <GuideModal
      :key="guideUpdateCount"
      :isOpen="guideModalOpen"
      :guide="activeGuide"
      :initialEditMode="initialEditMode"
      @close="guideModalOpen = false"
      @save="handleGuideSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import { storeToRefs } from 'pinia'
import GuideModal from '../components/GuideModal.vue'
import type { Guide } from '../stores/trip.ts'

const store = useTripStore()
const { attractionGuides } = storeToRefs(store)

const activeGuide = ref<{ title: string; data: Guide } | null>(null)
const guideModalOpen = ref(false)
const guideUpdateCount = ref(0)

const initialEditMode = ref(false)

const openGuide = (key: string | number) => {
  activeGuide.value = {
    title: String(key),
    data: attractionGuides.value[key as string]
  }
  initialEditMode.value = false
  guideModalOpen.value = true
}

const addNewGuide = () => {
  activeGuide.value = {
    title: '新景點攻略',
    data: {
      color: 'from-gray-400 to-gray-600',
      icon: 'fa-solid fa-location-dot',
      desc: '',
      tags: [],
      highlights: [],
      tips: '',
      link: '',
      image: ''
    }
  }
  initialEditMode.value = true
  guideModalOpen.value = true
}

const handleGuideSave = (newTitle: string, data: any, oldTitle?: string) => {
  if (newTitle && data) {
    // 1. If renaming, delete old key
    if (oldTitle && oldTitle !== newTitle && store.attractionGuides[oldTitle]) {
      delete store.attractionGuides[oldTitle]
    }

    // 2. Update Store with new title
    store.attractionGuides[newTitle] = JSON.parse(JSON.stringify(data))
    store.saveData()

    // 3. Update Active Guide directly
    if (activeGuide.value) {
      activeGuide.value = {
        title: newTitle,
        data: data
      }
      guideUpdateCount.value++
    }
  }
}

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.scrollTop > 50) {
    if (!store.headerCollapsed) store.setHeaderCollapsed(true)
  } else {
    if (store.headerCollapsed) store.setHeaderCollapsed(false)
  }
}

onUnmounted(() => {
  store.setHeaderCollapsed(false)
})
</script>
