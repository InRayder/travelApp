<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white px-6 pt-6 pb-4 shadow-sm z-10">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">實用日語對話</h1>
      
      <!-- Category Tabs -->
      <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border"
          :class="selectedCategory === category.id 
            ? 'bg-jp-red text-white border-jp-red shadow-md transform scale-105' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-jp-red/30 hover:bg-jp-red/5'"
        >
          <font-awesome-icon :icon="['fas', category.icon.replace('fa-', '')]" />
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-6 pb-24">
      <div class="grid gap-4">
        <div v-if="currentCategory" class="space-y-4">
          <div class="flex items-center gap-2 text-gray-500 text-sm mb-2 px-1">
            <font-awesome-icon :icon="['fas', currentCategory.icon.replace('fa-', '')]" />
            <span>{{ currentCategory.name }}情境</span>
            <span class="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{{ currentCategory.phrases.length }} 句</span>
          </div>
          
          <ConversationCard 
            v-for="phrase in currentCategory.phrases" 
            :key="phrase.id" 
            :phrase="phrase" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { conversationCategories } from '../stores/conversations'
import ConversationCard from '../components/ConversationCard.vue'

const categories = conversationCategories
const selectedCategory = ref(categories[0].id)

const currentCategory = computed(() => 
  categories.find(c => c.id === selectedCategory.value)
)
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
