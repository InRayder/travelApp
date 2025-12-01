<template>
  <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all duration-300">
    <!-- Decorative background circle -->
    <div class="absolute -right-4 -top-4 w-16 h-16 bg-jp-red/5 rounded-full blur-xl group-hover:bg-jp-red/10 transition-colors"></div>

    <div class="flex justify-between items-start gap-3 relative z-10">
      <div class="flex-1">
        <h3 class="text-lg font-bold text-gray-800 mb-1">{{ phrase.chinese }}</h3>
        <p class="text-sm text-gray-600 font-jp leading-relaxed">{{ phrase.japanese }}</p>
      </div>
      
      <div class="flex gap-2 shrink-0">
        <button 
          v-if="isCustom"
          @click.stop="$emit('edit', phrase)" 
          class="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all active:scale-95"
          aria-label="Edit phrase"
        >
          <font-awesome-icon icon="fa-solid fa-pen" />
        </button>

        <button 
          @click.stop="conversationStore.toggleFavorite(phrase.id)" 
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          :class="phrase.isFavorite ? 'bg-yellow-50 text-jp-mustard' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'"
          aria-label="Toggle favorite"
        >
          <font-awesome-icon :icon="phrase.isFavorite ? 'fa-solid fa-star' : 'fa-regular fa-star'" />
        </button>

        <button 
          @click.stop="playAudio" 
          class="w-10 h-10 rounded-full bg-jp-red/10 text-jp-red flex items-center justify-center hover:bg-jp-red hover:text-white transition-all active:scale-95"
          :class="{ 'animate-pulse bg-jp-red text-white': isPlaying }"
          aria-label="Play audio"
        >
          <font-awesome-icon :icon="isPlaying ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-low'" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ConversationPhrase } from '../stores/conversations'
import { useTripStore } from '../stores/trip'
import { useConversationStore } from '../stores/conversations'

const store = useTripStore()
const conversationStore = useConversationStore()

const props = defineProps<{
  phrase: ConversationPhrase
  isCustom?: boolean
}>()

const emit = defineEmits(['edit'])

const isPlaying = ref(false)

const playAudio = () => {
  if (isPlaying.value) return

  const utterance = new SpeechSynthesisUtterance(props.phrase.japanese)
  utterance.lang = 'ja-JP'
  utterance.lang = 'ja-JP'
  utterance.rate = 0.9 // Slightly slower for better clarity
  
  // Apply selected voice if available
  if (store.settings.voiceURI) {
    const voices = window.speechSynthesis.getVoices()
    const selectedVoice = voices.find(v => v.voiceURI === store.settings.voiceURI)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
  }
  
  utterance.onstart = () => {
    isPlaying.value = true
  }
  
  utterance.onend = () => {
    isPlaying.value = false
  }
  
  utterance.onerror = () => {
    isPlaying.value = false
    console.error('Speech synthesis error')
  }

  window.speechSynthesis.speak(utterance)
}
</script>

<style scoped>
.font-jp {
  font-family: "Noto Sans JP", sans-serif;
}
</style>
