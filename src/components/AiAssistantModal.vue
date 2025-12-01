<template>
  <transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-0 z-[150] flex items-end justify-center pointer-events-none">
      <div class="absolute inset-0 bg-black/30 pointer-events-auto transition-opacity" @click="emit('close')"></div>
      <div class="bg-white w-full max-w-md rounded-t-3xl shadow-2xl pointer-events-auto flex flex-col h-[80vh] relative z-50">
        
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs shadow-lg">
              <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" />
            </div>
            <div>
              <h3 class="font-bold text-jp-dark">AI 行程助手</h3>
              <p class="text-[10px] text-gray-400" v-if="store.settings.aiSettings?.model">
                Powered by {{ store.settings.aiSettings.model }}
              </p>
            </div>
          </div>
          <button @click="emit('close')" class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
        </div>



        <!-- Chat Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref="chatContainer">
          <!-- Welcome Message -->
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-md">
              <font-awesome-icon icon="fa-solid fa-robot" />
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%] border border-gray-100">
              <p>你好！我是你的 AI 行程助手。我可以回答關於你行程的問題，或是提供旅遊建議。請問有什麼我可以幫你的嗎？</p>
            </div>
          </div>

          <!-- Messages -->
          <div v-for="(msg, idx) in messages" :key="idx" class="flex gap-3" :class="{'flex-row-reverse': msg.role === 'user'}">
            <!-- Avatar -->
            <div v-if="msg.role === 'model'" class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-md">
              <font-awesome-icon icon="fa-solid fa-robot" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs shrink-0 mt-1">
              <font-awesome-icon icon="fa-solid fa-user" />
            </div>

            <!-- Bubble -->
            <div 
              class="p-3 rounded-2xl shadow-sm text-sm max-w-[85%] break-words"
              :class="msg.role === 'user' ? 'bg-jp-dark text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'"
            >
              <div v-if="msg.role === 'model'" v-html="md.render(msg.text)" class="markdown-body"></div>
              <div v-else class="whitespace-pre-wrap">{{ msg.text }}</div>

              <!-- Action Confirmation Card -->
              <div v-if="msg.pendingAction && msg.actionStatus === 'pending'" class="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div class="flex items-center gap-2 mb-2 text-xs font-bold text-gray-600">
                  <font-awesome-icon icon="fa-solid fa-bolt" class="text-yellow-500" />
                  建議操作：{{ 
                    msg.pendingAction.action === 'add_event' ? '新增行程' : 
                    msg.pendingAction.action === 'add_guide' ? '新增攻略' : '新增會話' 
                  }}
                </div>
                
                <div class="text-xs text-gray-500 mb-3 bg-white p-2 rounded border border-gray-100">
                  <div v-if="msg.pendingAction.action === 'add_event'">
                    <span class="font-bold">{{ msg.pendingAction.event.title }}</span><br>
                    {{ msg.pendingAction.event.time }} @ {{ msg.pendingAction.event.location }}
                  </div>
                  <div v-else-if="msg.pendingAction.action === 'add_guide'">
                    <span class="font-bold">{{ msg.pendingAction.name }}</span><br>
                    {{ msg.pendingAction.guide.desc }}
                  </div>
                  <div v-else>
                    <span class="font-bold">{{ msg.pendingAction.phrase.chinese }}</span><br>
                    {{ msg.pendingAction.phrase.japanese }}
                  </div>
                </div>

                <div class="flex gap-2">
                  <button 
                    @click="confirmAction(idx)"
                    class="flex-1 bg-jp-dark text-white py-1.5 rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors"
                  >
                    確認新增
                  </button>
                  <button 
                    @click="cancelAction(idx)"
                    class="flex-1 bg-gray-200 text-gray-600 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>

              <!-- Action Result -->
              <div v-if="msg.actionStatus === 'confirmed'" class="mt-2 text-xs text-green-600 flex items-center gap-1">
                <font-awesome-icon icon="fa-solid fa-check-circle" />
                已完成操作
              </div>
              <div v-if="msg.actionStatus === 'cancelled'" class="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <font-awesome-icon icon="fa-solid fa-ban" />
                已取消操作
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-md">
              <font-awesome-icon icon="fa-solid fa-robot" />
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-500 border border-gray-100 flex items-center gap-2">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
          
          <!-- Error Message -->
           <div v-if="error" class="text-center py-2">
             <span class="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full border border-red-200">
               <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mr-1" />
               {{ error }}
             </span>
           </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-100 shrink-0">
          <div v-if="!hasApiKey" class="text-center py-2 space-y-2">
            <p class="text-xs text-gray-500">請先設定 Google AI Studio API Key 才能使用此功能。</p>
            <button @click="emit('open-settings')" class="bg-jp-mustard text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-600 transition-colors">
              前往設定
            </button>
          </div>
          <div v-else class="space-y-3">
            <!-- Suggested Questions -->
            <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right" v-if="messages.length === 0">
              <button 
                v-for="q in suggestedQuestions" 
                :key="q"
                @click="useSuggestion(q)"
                class="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors flex-shrink-0"
              >
                {{ q }}
              </button>
            </div>

            <div class="flex gap-2 relative">
            <textarea 
              v-model="inputText" 
              @keydown.enter.prevent="sendMessage"
              rows="1"
              class="w-full bg-gray-50 p-3 pr-12 rounded-xl outline-none text-sm resize-none max-h-32 focus:ring-2 focus:ring-purple-100 border border-gray-200 transition-all"
              placeholder="輸入訊息..."
              :disabled="isLoading"
            ></textarea>
            <button 
              @click="sendMessage" 
              :disabled="!inputText.trim() || isLoading"
              class="absolute right-2 bottom-2 w-8 h-8 bg-jp-dark text-white rounded-lg flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-xs" />
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useTripStore } from '../stores/trip'
import { useConversationStore } from '../stores/conversations'
import { GoogleGenerativeAI } from '@google/generative-ai'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  breaks: true,
  linkify: true
})

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'open-settings'])
const store = useTripStore()
const conversationStore = useConversationStore()

const messages = ref<{ 
  role: 'user' | 'model', 
  text: string,
  pendingAction?: any,
  actionStatus?: 'pending' | 'confirmed' | 'cancelled'
}[]>([])
const inputText = ref('')
const isLoading = ref(false)
const error = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const suggestedQuestions = [
  '幫我檢查行程順不順',
  '這趟旅程總預算多少？',
  '第三天有什麼推薦美食？',
  '要注意什麼天氣或交通？',
  '有什麼必買的伴手禮？'
]

const useSuggestion = (text: string) => {
  inputText.value = text
  sendMessage()
}

const hasApiKey = computed(() => !!store.settings.aiSettings?.apiKey)

// Auto-scroll to bottom
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(() => messages.value.length, scrollToBottom)
watch(() => props.isOpen, (newVal) => {
  if (newVal) scrollToBottom()
})

const getSystemInstruction = () => {
  const tripData = {
    title: store.title,
    startDate: store.startDate,
    days: store.days,
    backups: store.backups,
    expenses: store.expenses,
    travelers: store.travelers
  }
  
  return `
    You are a helpful travel assistant for a trip to Japan.
    Here is the user's current itinerary JSON data:
    ${JSON.stringify(tripData)}
    
    Use Traditional Chinese (Taiwan) for your responses.

    You can perform the following actions if the user asks:
    1. Add an event to the itinerary.
    2. Create a travel guide card.
    3. Add a Japanese conversation phrase.

    If the user's request implies one of these actions, output a JSON object with the specific schema embedded in your response.
    
    Schema for adding an event:
    {
      "action": "add_event",
      "dayIndex": number, // 0-based index
      "event": {
        "title": "Title",
        "location": "Location",
        "time": "HH:MM",
        "category": "fun" | "food" | "shop" | "stay" | "transport",
        "cost": number,
        "notes": "Description"
      }
    }

    Schema for adding a guide:
    {
      "action": "add_guide",
      "name": "Guide Name",
      "guide": {
        "desc": "Description",
        "tags": ["tag1"],
        "highlights": ["h1"],
        "tips": "Tips",
        "link": "URL",
        "color": "from-blue-500 to-blue-600",
        "icon": "fa-solid fa-map-pin"
      }
    }

    Schema for adding a conversation:
    {
      "action": "add_conversation",
      "categoryId": "dining" | "transport" | "shopping" | "hotel" | "general",
      "phrase": {
        "chinese": "Chinese",
        "japanese": "Japanese",
        "romaji": "Romaji"
      }
    }

    IMPORTANT: 
    - Output the JSON object on a separate line.
    - You can provide a brief explanation before or after the JSON.
  `
}

const handleAiAction = (response: string) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*"action":\s*"(add_event|add_guide|add_conversation)"[\s\S]*\}/)
    if (!jsonMatch) return { text: response }

    const data = JSON.parse(jsonMatch[0])
    const text = response.replace(jsonMatch[0], '').trim()
    
    return {
      text: text || '我已準備好為您執行此操作，請確認：',
      pendingAction: data,
      actionStatus: 'pending'
    }
  } catch (e) {
    console.error('Failed to parse AI action:', e)
    return { text: response }
  }
}

const confirmAction = (msgIndex: number) => {
  const msg = messages.value[msgIndex]
  if (!msg.pendingAction) return

  const data = msg.pendingAction
  
  if (data.action === 'add_event') {
    store.days[data.dayIndex].events.push({
        id: crypto.randomUUID(),
        ...data.event,
        transports: []
    })
  } else if (data.action === 'add_guide') {
    store.attractionGuides[data.name] = data.guide
  } else if (data.action === 'add_conversation') {
    conversationStore.addPhrase(data.categoryId, data.phrase)
  }

  msg.actionStatus = 'confirmed'
}

const cancelAction = (msgIndex: number) => {
  messages.value[msgIndex].actionStatus = 'cancelled'
}

const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value || !hasApiKey.value) return

  const userMsg = inputText.value.trim()
  messages.value.push({ role: 'user', text: userMsg })
  inputText.value = ''
  isLoading.value = true
  error.value = ''

  try {
    const apiKey = store.settings.aiSettings?.apiKey
    const modelName = store.settings.aiSettings?.model || 'gemini-1.5-flash'
    
    if (!apiKey) throw new Error('API Key not found')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: getSystemInstruction()
    })

    const chat = model.startChat({
      history: messages.value.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    })

    const result = await chat.sendMessage(userMsg)
    const rawResponse = result.response.text()
    
    // Handle potential actions
    const processed = handleAiAction(rawResponse)

    messages.value.push({ 
      role: 'model', 
      text: processed.text,
      pendingAction: (processed as any).pendingAction,
      actionStatus: (processed as any).actionStatus
    })

  } catch (e: any) {
    console.error('AI Error:', e)
    error.value = e.message || '發生錯誤，請檢查 API Key 或網路連線'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Markdown Styles */
:deep(.markdown-body) {
  font-size: 0.875rem;
  line-height: 1.6;
}

:deep(.markdown-body p) {
  margin-bottom: 0.5rem;
}

:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-body ul), :deep(.markdown-body ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  list-style-type: disc;
}

:deep(.markdown-body ol) {
  list-style-type: decimal;
}

:deep(.markdown-body li) {
  margin-bottom: 0.25rem;
}

:deep(.markdown-body strong) {
  font-weight: 700;
  color: #1a202c;
}

:deep(.markdown-body a) {
  color: #3b82f6;
  text-decoration: underline;
}

:deep(.markdown-body h1), :deep(.markdown-body h2), :deep(.markdown-body h3) {
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}
</style>
