<template>
  <div :class="cardClass">
    <div v-if="theme === 'magazine'" class="h-2 booklet-accent-bg"></div>
    <img
      v-if="guide.thumbnail_url && !imgError"
      :src="guide.thumbnail_url"
      :alt="title"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="imgError = true"
      class="w-full object-cover"
      :class="theme === 'magazine' ? 'h-36' : 'h-32 rounded-md mb-3'"
    />
    <div :class="theme === 'magazine' ? 'p-4' : ''">
      <div class="flex items-center justify-between mb-1.5 gap-2">
        <h4 class="font-bold text-base text-jp-dark">{{ title }}</h4>
        <span v-if="guide.location?.name" class="text-xs text-gray-400 flex-shrink-0">{{ guide.location.name }}</span>
      </div>
      <p v-if="guide.desc" class="text-sm text-gray-600 mb-2">{{ guide.desc }}</p>
      <div v-if="guide.tags?.length" class="flex flex-wrap gap-1 mb-2">
        <span
          v-for="(tag, ti) in guide.tags"
          :key="ti"
          class="text-xs px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-gray-500"
        >
          #{{ tag }}
        </span>
      </div>
      <ul v-if="guide.highlights?.length" class="text-sm text-gray-600 list-disc list-inside mb-2 space-y-0.5">
        <li v-for="(h, hi) in guide.highlights" :key="hi">{{ h }}</li>
      </ul>
      <p
        v-if="guide.tips"
        class="text-sm text-gray-500 booklet-accent-bg-soft rounded p-2.5"
        :class="{ 'booklet-sticky-note': theme === 'journal' }"
      >
        <font-awesome-icon icon="fa-solid fa-lightbulb" class="mr-1 booklet-accent-text" />{{ guide.tips }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Guide } from '../stores/trip.ts'

defineProps<{
  title: string
  guide: Guide
  theme: 'minimal' | 'magazine' | 'journal'
  cardClass: string
}>()

// 若圖片連結失效（例如外部已刪除或離線無法載入），改為隱藏圖片而非顯示破圖
const imgError = ref(false)
</script>
