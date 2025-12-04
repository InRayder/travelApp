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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="(guide, key) in attractionGuides" :key="key" 
             @click="openGuide(key)"
             class="bg-white rounded-2xl overflow-hidden shadow-card group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col">
          
          <!-- 1. Visual Hook (50% height) -->
          <div class="relative h-48 overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110" :class="guide.color"></div>
             <div v-if="guide.thumbnail_url" class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" :style="{ backgroundImage: `url('${guide.thumbnail_url}')` }"></div>
             
             <!-- Source Icon -->
             <div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 shadow-sm z-10">
                <font-awesome-icon v-if="guide.media_type === 'instagram'" :icon="['fab', 'instagram']" class="text-pink-600" />
                <font-awesome-icon v-else-if="guide.media_type === 'youtube'" :icon="['fab', 'youtube']" class="text-red-600" />
                <font-awesome-icon v-else icon="fa-solid fa-globe" class="text-blue-500" />
             </div>

             <!-- Category Badge (Icon) -->
             <div class="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm z-10">
                <font-awesome-icon :icon="guide.icon" class="text-lg" />
             </div>
          </div>

          <!-- 2. Core Info -->
          <div class="p-4 pb-2">
            <div class="flex justify-between items-start mb-1">
                <h3 class="text-lg font-black text-gray-800 leading-tight line-clamp-1">{{ key }}</h3>
                <div v-if="guide.location?.google_maps_id" class="flex items-center text-yellow-500 text-xs font-bold gap-1">
                    <font-awesome-icon icon="fa-solid fa-star" />
                    <span>4.5</span>
                </div>
            </div>
            <div class="flex items-center text-gray-500 text-xs mb-3">
                <font-awesome-icon icon="fa-solid fa-location-dot" class="mr-1" />
                <span>{{ guide.location?.name || '未知地點' }}</span>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="tag in guide.tags.slice(0, 3)" :key="tag" class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{{ tag }}</span>
            </div>
          </div>

          <!-- 3. User Context -->
          <div class="px-4 pb-4 flex-1">
            <div v-if="guide.user_notes" class="bg-yellow-50 p-2.5 rounded-lg border border-yellow-100 mb-3">
                <p class="text-xs text-gray-700 line-clamp-2">
                    <font-awesome-icon icon="fa-solid fa-note-sticky" class="text-yellow-500 mr-1" />
                    {{ guide.user_notes }}
                </p>
            </div>
            <div v-else-if="guide.highlights.length > 0" class="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3">
                 <p class="text-xs text-gray-600 line-clamp-2">
                    <font-awesome-icon icon="fa-solid fa-highlighter" class="text-jp-mustard mr-1" />
                    {{ guide.highlights[0] }}
                </p>
            </div>
          </div>

          <!-- 4. Actions -->
          <div class="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <!-- Status Toggle -->
            <button @click.stop="toggleStatus(key, guide)" class="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold transition-colors"
                :class="{
                    'bg-pink-100 text-pink-600': guide.status === 'want_to_go',
                    'bg-blue-100 text-blue-600': guide.status === 'planned',
                    'bg-green-100 text-green-600': guide.status === 'visited'
                }">
                <font-awesome-icon :icon="getStatusIcon(guide.status)" />
                <span>{{ getStatusLabel(guide.status) }}</span>
            </button>

            <div class="flex gap-2">
                <!-- Add to Itinerary -->
                <button @click.stop="openAddToItinerary(key as string, guide)" class="w-8 h-8 rounded-full bg-jp-mustard text-white flex items-center justify-center hover:bg-yellow-600 transition-colors shadow-sm" title="加入行程">
                    <font-awesome-icon icon="fa-solid fa-calendar-plus" class="text-xs" />
                </button>

                <!-- Original Link -->
                <a v-if="guide.original_url" :href="guide.original_url" target="_blank" @click.stop class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-jp-dark hover:border-jp-dark transition-colors">
                    <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="text-xs" />
                </a>
                <!-- Navigate -->
                <a v-if="guide.location?.name" :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(guide.location.name)}`" target="_blank" @click.stop class="w-8 h-8 rounded-full bg-jp-dark text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-diamond-turn-right" class="text-xs" />
                </a>
            </div>
          </div>
        </div>
        
        <!-- Add New Guide Button -->
        <div @click="addNewGuide" class="min-h-[300px] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-jp-mustard hover:text-jp-mustard hover:bg-yellow-50 transition-colors cursor-pointer">
          <font-awesome-icon icon="fa-solid fa-plus" class="text-3xl mb-3" />
          <span class="text-sm font-bold">新增攻略</span>
        </div>

        <!-- Import Guide Button -->
        <div @click="openImportModal" class="min-h-[300px] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-jp-mustard hover:text-jp-mustard hover:bg-yellow-50 transition-colors cursor-pointer">
          <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" class="text-3xl mb-3" />
          <span class="text-sm font-bold">AI 智能匯入</span>
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

    <ImportGuideModal
      :isOpen="importModalOpen"
      :initialData="importInitialData"
      @close="importModalOpen = false"
      @save="handleImportSave"
    />

    <AddToItineraryModal
      :isOpen="addToItineraryModalOpen"
      :guide="guideToAdd"
      @close="addToItineraryModalOpen = false"
      @confirm="handleAddToItineraryConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import GuideModal from '../components/GuideModal.vue'
import ImportGuideModal from '../components/ImportGuideModal.vue'
import AddToItineraryModal from '../components/AddToItineraryModal.vue'
import type { Guide } from '../stores/trip.ts'

const store = useTripStore()
const { attractionGuides } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

const activeGuide = ref<{ title: string; data: Guide } | null>(null)
const guideModalOpen = ref(false)
const guideUpdateCount = ref(0)

const importModalOpen = ref(false)
const importInitialData = ref<{ title?: string, text?: string, url?: string }>({})

const addToItineraryModalOpen = ref(false)
const guideToAdd = ref<(Guide & { title: string }) | null>(null)

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
      id: crypto.randomUUID(),
      color: 'from-gray-400 to-gray-600',
      icon: 'fa-solid fa-location-dot',
      desc: '',
      tags: [],
      highlights: [],
      tips: '',
      original_url: '',
      thumbnail_url: '',
      media_type: 'web',
      location: { name: '' },
      user_notes: '',
      status: 'want_to_go'
    }
  }
  initialEditMode.value = true
  guideModalOpen.value = true
}

const handleGuideSave = (newTitle: string, data: any, oldTitle?: string) => {
  store.updateGuide(newTitle, data, oldTitle)
  guideUpdateCount.value++
  guideModalOpen.value = false
}

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.scrollTop > 50) {
    if (!store.headerCollapsed) store.setHeaderCollapsed(true)
  } else {
    if (store.headerCollapsed) store.setHeaderCollapsed(false)
  }
}

const openImportModal = () => {
  importInitialData.value = {}
  importModalOpen.value = true
}

const handleImportSave = (title: string, data: Guide) => {
  store.updateGuide(title, data)
  guideUpdateCount.value++
}

const openAddToItinerary = (key: string, guide: Guide) => {
  guideToAdd.value = { ...guide, title: key }
  addToItineraryModalOpen.value = true
}

const handleAddToItineraryConfirm = ({ dayIndex, time }: { dayIndex: number, time: string }) => {
  if (!guideToAdd.value) return

  const newEvent: any = {
    id: crypto.randomUUID(),
    title: guideToAdd.value.title,
    location: guideToAdd.value.location.name,
    category: 'fun', // Default to fun
    time: time || '09:00',
    cost: 0,
    notes: guideToAdd.value.desc || guideToAdd.value.user_notes,
    linkedGuide: guideToAdd.value.title,
    lat: guideToAdd.value.location.coordinates?.[0],
    lng: guideToAdd.value.location.coordinates?.[1]
  }

  store.addEvent(dayIndex, newEvent)
  
  // Update guide status to planned
  if (guideToAdd.value.status === 'want_to_go') {
    store.updateGuide(guideToAdd.value.title, { ...guideToAdd.value, status: 'planned' })
  }

  addToItineraryModalOpen.value = false
  guideToAdd.value = null
  
  // Optional: Show success feedback
  alert('已加入行程！')
}

const toggleStatus = (key: string, guide: Guide) => {
    const statusOrder: Guide['status'][] = ['want_to_go', 'planned', 'visited'];
    const currentIndex = statusOrder.indexOf(guide.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    store.updateGuide(key, { ...guide, status: nextStatus });
}

const getStatusIcon = (status: Guide['status']) => {
    switch (status) {
        case 'want_to_go': return 'fa-solid fa-bookmark';
        case 'planned': return 'fa-solid fa-calendar-check';
        case 'visited': return 'fa-solid fa-check-circle';
        default: return 'fa-solid fa-bookmark';
    }
}

const getStatusLabel = (status: Guide['status']) => {
    switch (status) {
        case 'want_to_go': return '想去';
        case 'planned': return '已排程';
        case 'visited': return '已去過';
        default: return '想去';
    }
}

// Check for share target params
if (route.query.title || route.query.text || route.query.url) {
  console.log('GuidesView received share params:', route.query)
  importInitialData.value = {
    title: route.query.title as string,
    text: route.query.text as string,
    url: route.query.url as string
  }
  console.log('GuidesView set importInitialData:', importInitialData.value)
  importModalOpen.value = true
  
  // Clear query params to prevent reopening on refresh
  router.replace({ query: {} })
}

onUnmounted(() => {
  store.setHeaderCollapsed(false)
})
</script>
