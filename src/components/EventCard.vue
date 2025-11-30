<template>
  <div 
    class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50 relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-jp-mustard/30"
    :class="{'opacity-50 grayscale': isPast}"
  >
    <div class="absolute top-4 right-2 w-8 h-8 flex items-center justify-center text-gray-300 cursor-grab drag-handle z-20 hover:text-jp-mustard">
      <font-awesome-icon icon="fa-solid fa-grip-vertical" class="text-lg" />
    </div>
    <div class="absolute -bottom-4 -right-4 text-6xl opacity-[0.07] transform -rotate-12 pointer-events-none select-none" :class="getCategoryIconColor(item.category)">
      <font-awesome-icon :icon="getCategoryIcon(item.category)" />
    </div>
    <div class="absolute left-0 top-0 bottom-0 w-1" :class="getCategoryColor(item.category)"></div>
    
    <div class="flex justify-between items-start mb-2 relative z-10 pr-6">
      <div class="pr-2 min-w-0 cursor-pointer hover:opacity-70 transition-opacity" @click="emit('click-edit', item, index)">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wider truncate">{{ getCategoryLabel(item.category) }}</span>
        </div>
        <h3 class="font-bold text-jp-dark text-[15px] leading-snug truncate">{{ item.title }}</h3>
      </div>
    </div>

    <div class="flex gap-2 mb-3 relative z-10">
      <a :href="getGoogleMapLink(item.location || item.title)" target="_blank" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-jp-gray hover:bg-blue-50 hover:text-blue-500 transition-colors">
        <font-awesome-icon icon="fa-solid fa-location-dot" class="text-sm" />
      </a>
      
      <!-- 智慧導覽按鈕 (SMART GUIDE BUTTON) -->
      <button v-if="hasGuide" @click="emit('open-guide', item)" class="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-jp-red hover:bg-jp-red hover:text-white transition-colors animate-fade-in shadow-sm" title="查看深度導覽">
        <font-awesome-icon icon="fa-solid fa-book-open" class="text-sm" />
      </button>

      <a v-if="item.category === 'food' && item.link && store.settings.currency === 'JPY'" :href="item.link" target="_blank" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-jp-gray hover:bg-orange-50 hover:text-orange-500 transition-colors">
        <font-awesome-icon icon="fa-solid fa-utensils" class="text-sm" />
      </a>
      <a v-if="item.category === 'stay' && item.bookingLink" :href="item.bookingLink" target="_blank" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-jp-gray hover:bg-blue-50 hover:text-blue-600 transition-colors">
        <font-awesome-icon icon="fa-solid fa-calendar-check" class="text-sm" />
      </a>
      <a v-if="item.category === 'fun' && item.ticketLink" :href="item.ticketLink" target="_blank" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-jp-gray hover:bg-orange-50 hover:text-orange-600 transition-colors">
        <font-awesome-icon icon="fa-solid fa-ticket" class="text-sm" />
      </a>
      <button v-if="item.category === 'shop' && item.discounts && item.discounts.length > 0" @click="emit('open-discount', item)" class="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
        <font-awesome-icon icon="fa-solid fa-tags" class="text-sm" />
      </button>
      
      <!-- 記帳按鈕 (EXPENSE BUTTON) -->
      <button @click="emit('open-expense', item)" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-jp-gray hover:bg-green-50 hover:text-jp-accent-green transition-colors" title="記帳">
        <font-awesome-icon icon="fa-solid fa-calculator" class="text-sm" />
      </button>
      
      <button @click="() => { console.log('Edit clicked'); emit('click-edit', item, index); }" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-jp-gray hover:bg-jp-yellow hover:text-jp-mustard transition-colors">
        <font-awesome-icon icon="fa-solid fa-pen" class="text-sm" />
      </button>
    </div>

    <div class="text-xs text-gray-500 mb-2 leading-relaxed flex items-start gap-1 relative z-10">
      <font-awesome-icon icon="fa-solid fa-map-pin" class="text-[10px] mt-0.5 opacity-50 shrink-0" />
      <span class="truncate">{{ item.location }}</span>
    </div>

    <div v-if="item.category === 'stay' && item.stayInfo" class="mt-3 mb-2 bg-purple-50/50 rounded-lg p-3 border border-purple-100 relative z-10">
      <div class="text-[10px] font-bold text-purple-600 mb-2 flex justify-between items-center">
        <span class="flex items-center gap-1"><font-awesome-icon icon="fa-solid fa-calendar-days" /> {{ formatStayPeriod(item.stayInfo) }}</span>
        <span class="bg-white/50 px-1.5 py-0.5 rounded text-[9px] border border-purple-100 font-bold" v-if="getStayDuration(item.stayInfo)">{{ getStayDuration(item.stayInfo) }}</span>
      </div>
      <div class="flex gap-4 mb-2">
        <div class="flex flex-col"><span class="text-[9px] text-gray-400">CHECK-IN</span><span class="text-xs font-mono font-bold text-jp-dark">{{ formatTime(item.stayInfo.checkIn || '15:00', store.settings.timeFormat) }}</span></div>
        <div class="flex flex-col"><span class="text-[9px] text-gray-400">CHECK-OUT</span><span class="text-xs font-mono font-bold text-jp-dark">{{ formatTime(item.stayInfo.checkOut || '11:00', store.settings.timeFormat) }}</span></div>
      </div>
      <div v-if="item.stayInfo.notes" class="text-[10px] text-gray-600 border-t border-purple-100/50 pt-2 mt-1">
        <font-awesome-icon icon="fa-regular fa-clipboard" class="mr-1" /> {{ item.stayInfo.notes }}
      </div>
    </div>



    <div v-if="item.notes" class="text-xs bg-jp-cream p-2 rounded-lg text-gray-600 border border-dashed border-gray-200 mt-2 relative z-10">{{ item.notes }}</div>
    
    <div v-if="item.cost > 0" class="mt-2 flex justify-end relative z-10">
      <span class="text-xs font-medium text-jp-dark bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
        <span>{{ store.currencies[item.currency || store.settings.currency]?.symbol }}{{ item.cost.toLocaleString() }}</span>
        <span v-if="convertedCost" class="text-gray-400 text-[10px]">≈ {{ store.currencies[store.settings.currency]?.symbol }}{{ convertedCost }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import type { Event } from '../stores/trip.ts'
import { formatTime } from '../utils/time.ts'

const props = defineProps<{
  item: Event
  index: number
}>()

const emit = defineEmits(['click-edit', 'open-guide', 'open-expense', 'open-discount'])

const store = useTripStore()

// Mock isPast for now, or implement logic
const isPast = computed(() => false)

const getCategoryLabel = (cat: string) => {
  const found = store.categories.find(c => c.id === cat)
  return found ? found.name : '其他'
}

const getCategoryColor = (cat: string) => {
  const map: Record<string, string> = { flight: 'bg-blue-400', transport: 'bg-jp-accent-blue', stay: 'bg-purple-400', food: 'bg-orange-400', fun: 'bg-jp-mustard', shop: 'bg-pink-400' }
  return map[cat] || 'bg-gray-400'
}

const getCategoryIcon = (cat: string) => {
  const found = store.categories.find(c => c.id === cat)
  return found ? found.icon : 'fa-solid fa-circle'
}

const getCategoryIconColor = (cat: string) => {
  const map: Record<string, string> = { flight: 'text-blue-200', transport: 'text-blue-200', stay: 'text-purple-200', food: 'text-orange-200', fun: 'text-yellow-200', shop: 'text-pink-200' }
  return map[cat] || 'text-gray-200'
}

const getGoogleMapLink = (loc: string) => {
  if (props.item.mapUrl) return props.item.mapUrl
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`
}

const formatStayPeriod = (info: any) => {
  if (!info || !info.startDate) return '入住日期未設定'
  const start = new Date(info.startDate)
  const end = info.endDate ? new Date(info.endDate) : null
  if(end) return `${start.getMonth()+1}/${start.getDate()} - ${end.getMonth()+1}/${end.getDate()}`
  return `${start.getMonth()+1}/${start.getDate()}`
}

const getStayDuration = (info: any) => {
  if (!info || !info.startDate || !info.endDate) return ''
  const diff = Math.ceil(Math.abs(new Date(info.endDate).getTime() - new Date(info.startDate).getTime()) / (1000*60*60*24))
  return diff > 0 ? `${diff}晚` : ''
}

// 導覽邏輯 (Guide Logic)
const getGuideKey = (item: Event) => {
    if (!item) return null;
    if (item.linkedGuide && store.attractionGuides[item.linkedGuide]) {
        return item.linkedGuide;
    }
    const title = item.title;
    if (!title) return null;
    for (const key of Object.keys(store.attractionGuides)) {
        if (title.includes(key)) {
            return key;
        }
    }
    return null;
}

const hasGuide = computed(() => !!getGuideKey(props.item))

const convertedCost = computed(() => {
  if (!props.item.cost || props.item.currency === store.settings.currency) return null
  
  const inputRate = store.currencies[props.item.currency || store.settings.currency]?.rate || 1
  const targetRate = store.currencies[store.settings.currency]?.rate || 1
  
  const valInJpy = props.item.cost / inputRate
  const valInTarget = valInJpy * targetRate
  
  return Math.round(valInTarget).toLocaleString()
})

</script>
