<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
      <div class="bg-white w-full max-w-xs rounded-2xl shadow-2xl p-6 relative z-10 max-h-[80vh] overflow-y-auto hide-scrollbar">
        <h3 class="text-xl font-bold text-jp-dark mb-6 text-center">設定</h3>
        
        <div class="space-y-4">
          <!-- 設定區塊 (Settings Section) -->
          <div class="space-y-3">
            <label class="block text-xs font-bold text-gray-500">旅遊標題</label>
            <input 
              type="text" 
              v-model="localTitle" 
              @change="saveTripInfo"
              class="w-full p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-jp-mustard"
              placeholder="輸入旅遊標題"
            >

            <label class="block text-xs font-bold text-gray-500">開始日期</label>
            <input 
              type="date" 
              v-model="localStartDate" 
              @change="saveTripInfo"
              class="w-full p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-jp-mustard"
            >

            <label class="block text-xs font-bold text-gray-500">旅伴設定</label>
            <div class="space-y-2">
              <div v-for="(_, index) in localTravelers" :key="index" class="flex gap-2">
                <input 
                  type="text" 
                  v-model="localTravelers[index]"
                  @change="saveTripInfo"
                  class="flex-1 p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-jp-mustard"
                  placeholder="輸入旅伴姓名"
                >
                <button @click="removeTraveler(index)" class="text-gray-400 hover:text-red-500 px-2" v-if="localTravelers.length > 1">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
              <button @click="addTraveler" class="text-xs text-jp-dark font-bold hover:underline flex items-center gap-1">
                <font-awesome-icon icon="fa-solid fa-plus" /> 新增旅伴
              </button>
            </div>

            <label class="block text-xs font-bold text-gray-500">預設幣別 / 旅遊國家</label>
            <select :value="store.settings.currency" @change="updateCurrency" class="w-full p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-jp-mustard">
              <option v-for="(info, code) in store.currencies" :key="code" :value="code">
                {{ info.name }} ({{ info.symbol }})
              </option>
            </select>

            <div class="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
              <div class="flex items-center justify-between" v-if="store.currencies['TWD']">
                <div class="text-xs font-bold text-gray-600">匯率設定 (1 JPY = ? TWD)</div>
                <div class="flex items-center gap-2">
                  <input 
                    type="number" 
                    :value="store.currencies['TWD'].rate" 
                    @input="(e) => updateRate('TWD', e)"
                    step="0.0001"
                    class="w-20 p-1.5 rounded bg-white border border-gray-200 text-xs text-right font-mono outline-none focus:border-jp-mustard"
                  >
                </div>
              </div>
            </div>

            <label class="block text-xs font-bold text-gray-500">時間格式</label>
            <div class="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button 
                @click="store.updateSettings({ timeFormat: '24h' })"
                class="flex-1 py-1.5 text-xs font-bold rounded transition-all"
                :class="store.settings.timeFormat === '24h' ? 'bg-white shadow text-jp-dark' : 'text-gray-400 hover:text-gray-600'"
              >
                24小時制 (14:00)
              </button>
              <button 
                @click="store.updateSettings({ timeFormat: '12h' })"
                class="flex-1 py-1.5 text-xs font-bold rounded transition-all"
                :class="store.settings.timeFormat === '12h' ? 'bg-white shadow text-jp-dark' : 'text-gray-400 hover:text-gray-600'"
              >
                12小時制 (2:00 PM)
              </button>
            </div>


          </div>

          <hr class="border-gray-100">

          <!-- 交通票券管理 (Transport Pass Management) -->
          <div class="space-y-3">
            <label class="block text-xs font-bold text-gray-500">交通票券管理</label>
            
            <!-- Pass List -->
            <div class="space-y-2">
              <div v-for="pass in store.passes" :key="pass.id" class="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <div class="w-10 h-10 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                  <img :src="pass.imageUrl" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-jp-dark truncate">{{ pass.name }}</div>
                </div>
                <button @click="removePass(pass.id)" class="text-gray-400 hover:text-red-500 px-2">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
            </div>

            <!-- Add Pass Form -->
            <div class="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 space-y-2">
              <input 
                type="text" 
                v-model="newPassName"
                class="w-full p-2 rounded bg-white border border-gray-200 text-xs outline-none focus:border-jp-mustard"
                placeholder="票券名稱 (e.g. JR Pass)"
              >
              <div class="flex gap-2">
                <button @click="triggerPassImageUpload" class="flex-1 py-2 bg-white border border-gray-200 text-gray-500 rounded text-xs hover:bg-gray-50 truncate px-2">
                  <font-awesome-icon icon="fa-solid fa-image" /> {{ newPassImage ? '已選擇圖片' : '上傳圖片' }}
                </button>
                <button 
                  @click="addPass" 
                  class="flex-1 py-2 bg-jp-mustard text-white rounded text-xs font-bold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!newPassName || !newPassImage"
                >
                  新增票券
                </button>
              </div>
            </div>
          </div>



          <hr class="border-gray-100">

          <!-- 資料管理 (Data Management) -->
          <div class="space-y-2">
            <!-- Export Section -->
            <div class="space-y-2">
              <button @click="showExportOptions = !showExportOptions" class="w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center gap-2 text-sm">
                <font-awesome-icon icon="fa-solid fa-file-export" /> 匯出備份 (JSON)
                <font-awesome-icon :icon="showExportOptions ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="text-xs text-gray-400 ml-1" />
              </button>
              
              <transition name="fade">
                <div v-if="showExportOptions" class="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <button @click="handleExportFile" class="py-2 bg-white border border-gray-200 text-jp-dark rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <font-awesome-icon icon="fa-solid fa-download" /> 下載檔案
                    </button>
                    <button @click="handleExportCopy" class="py-2 bg-jp-dark text-white rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                      <font-awesome-icon icon="fa-solid fa-copy" /> {{ exportCopyStatus }}
                    </button>
                  </div>
                </div>
              </transition>
            </div>
            <!-- Import Section -->
            <div class="space-y-2">
              <button @click="showImportOptions = !showImportOptions" class="w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center gap-2 text-sm">
                <font-awesome-icon icon="fa-solid fa-file-import" /> 匯入備份 (JSON)
                <font-awesome-icon :icon="showImportOptions ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="text-xs text-gray-400 ml-1" />
              </button>
              
              <transition name="fade">
                <div v-if="showImportOptions" class="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-3">
                  <div class="flex gap-2 border-b border-gray-200 pb-2">
                    <button 
                      @click="importMode = 'file'" 
                      class="flex-1 py-1 text-xs font-bold rounded transition-colors"
                      :class="importMode === 'file' ? 'bg-white shadow text-jp-dark' : 'text-gray-400 hover:text-gray-600'"
                    >
                      檔案匯入
                    </button>
                    <button 
                      @click="importMode = 'text'" 
                      class="flex-1 py-1 text-xs font-bold rounded transition-colors"
                      :class="importMode === 'text' ? 'bg-white shadow text-jp-dark' : 'text-gray-400 hover:text-gray-600'"
                    >
                      文字貼上
                    </button>
                  </div>

                  <!-- File Import Mode -->
                  <div v-if="importMode === 'file'" class="text-center py-2">
                    <button @click="triggerFileImport" class="px-4 py-2 bg-jp-dark text-white rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto">
                      <font-awesome-icon icon="fa-solid fa-folder-open" /> 選擇 JSON 檔案
                    </button>
                    <p class="text-[10px] text-gray-400 mt-2">支援 .json 格式備份檔</p>
                  </div>

                  <!-- Text Import Mode -->
                  <div v-else class="space-y-2">
                    <textarea 
                      v-model="importText"
                      class="w-full h-24 p-2 rounded border border-gray-300 bg-white text-[10px] font-mono leading-tight resize-none focus:outline-none focus:border-jp-mustard"
                      placeholder="在此貼上 JSON 內容..."
                    ></textarea>
                    <button 
                      @click="handleTextImport" 
                      class="w-full py-2 bg-jp-mustard text-white rounded-lg text-xs font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!importText"
                    >
                      確認匯入
                    </button>
                  </div>
                </div>
              </transition>
            </div>

            <button @click="handleLoadExample" class="w-full py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold hover:bg-blue-100 flex items-center justify-center gap-2 text-sm">
              <font-awesome-icon icon="fa-solid fa-book-open" /> 載入範例行程
            </button>
            <button @click="showAiHelper = !showAiHelper" class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 text-purple-700 font-bold hover:from-purple-100 hover:to-blue-100 flex items-center justify-center gap-2 text-sm">
              <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" /> AI 行程轉換助手
            </button>
          </div>

          <!-- AI Helper Content -->
          <div v-if="showAiHelper" class="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs space-y-3">
            <p class="font-bold text-gray-700">使用說明：</p>
            <ol class="list-decimal list-inside text-gray-600 space-y-1 ml-1">
              <li>複製下方的 Prompt 指令</li>
              <li>開啟 ChatGPT / Gemini 等 AI 工具</li>
              <li>貼上指令，並附上您的 Excel 行程文字</li>
              <li>將 AI 產生的 JSON 貼回上方的「匯入備份」</li>
            </ol>
            <div class="relative">
              <textarea 
                readonly 
                class="w-full h-32 p-2 rounded border border-gray-300 bg-white text-[10px] font-mono leading-tight resize-none focus:outline-none"
                :value="aiPrompt"
              ></textarea>
              <button @click="copyPrompt" class="absolute top-2 right-2 bg-jp-dark text-white px-2 py-1 rounded text-[10px] hover:bg-gray-700 transition-colors">
                {{ copyStatus }}
              </button>
            </div>
          </div>

          <hr class="border-gray-100 mb-3">

          <button @click="handleReset" class="w-full py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 flex items-center justify-center gap-2 text-sm">
            <font-awesome-icon icon="fa-solid fa-trash-can" /> 清空所有資料
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-[10px] text-gray-400">{{ appName }} v{{ appVersion }}</p>
          <button @click="emit('close')" class="mt-4 text-gray-400 hover:text-gray-600">
            <font-awesome-icon icon="fa-solid fa-times" class="text-xl" />
          </button>
        </div>
      </div>
    </div>
  </transition>

  <ConfirmModal
    :isOpen="confirmModalOpen"
    :title="confirmTitle"
    :message="confirmMessage"
    :showCancel="showCancel"
    @close="confirmModalOpen = false"
    @confirm="handleConfirmAction"
  />
</template>

<script setup lang="ts">

import { ref } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import ConfirmModal from './ConfirmModal.vue'
import pkg from '../../package.json'

const appName = pkg.name
const appVersion = pkg.version

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const store = useTripStore()

// 確認視窗狀態
const confirmModalOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const showCancel = ref(true)
const confirmCallback = ref<(() => void) | null>(null)

const openAlert = (message: string) => {
  confirmTitle.value = '提示'
  confirmMessage.value = message
  confirmCallback.value = null
  showCancel.value = false
  confirmModalOpen.value = true
}

const openConfirmModal = (title: string, message: string, callback: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmCallback.value = callback
  showCancel.value = true
  confirmModalOpen.value = true
}

const handleConfirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
    confirmCallback.value = null
  }
}

const handleReset = () => {
  openConfirmModal('清空資料', '確定要清空所有資料嗎？此動作將刪除所有行程與設定且無法復原。', () => {
    store.clearData()
    openAlert('資料已清空')
    emit('close')
  })
}

const handleLoadExample = () => {
  openConfirmModal('載入範例', '確定要載入範例行程嗎？目前的資料將被覆蓋。', () => {
    store.loadExampleData()
    openAlert('範例行程已載入')
    emit('close')
  })
}

const showExportOptions = ref(false)
const exportCopyStatus = ref('複製內容')

const getFormattedData = () => {
  const rawData = localStorage.getItem('easy_trip_data_v7')
  if (!rawData) return null
  
  try {
    const parsed = JSON.parse(rawData)
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    console.error('Data parse failed', e)
    return null
  }
}

const handleExportFile = () => {
  const formatted = getFormattedData()
  if (!formatted) {
    openAlert('無資料可匯出')
    return
  }
  
  try {
    const blob = new Blob([formatted], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `easy_trip_backup_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed', e)
    openAlert('匯出失敗')
  }
}

const handleExportCopy = () => {
  const formatted = getFormattedData()
  if (!formatted) {
    openAlert('無資料可匯出')
    return
  }

  navigator.clipboard.writeText(formatted).then(() => {
    exportCopyStatus.value = '已複製！'
    setTimeout(() => {
      exportCopyStatus.value = '複製內容'
    }, 2000)
  }).catch(() => {
    openAlert('複製失敗')
  })
}


const showImportOptions = ref(false)
const importMode = ref<'file' | 'text'>('file')
const importText = ref('')

const processImportData = (jsonString: string) => {
  try {
    // Try to parse to ensure it's valid JSON
    const parsed = JSON.parse(jsonString)
    
    // Handle potential double-stringified legacy format (just in case)
    const finalData = typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
    
    if (finalData) {
       // Sanitize data: Ensure transport events have a transport object
       const parsedData = JSON.parse(finalData)
       if (parsedData.days) {
         parsedData.days.forEach((day: any) => {
           if (day.events) {
             day.events.forEach((event: any) => {
               if (event.category === 'transport' && !event.transport) {
                 event.transport = {
                   type: 'walk',
                   company: '',
                   line: '',
                   direction: '',
                   dep: event.time,
                   arr: event.endTime || event.time,
                   cost: 0,
                   note: '預設步行'
                 }
               }
             })
           }
         })
         // Re-stringify to save
         localStorage.setItem('easy_trip_data_v7', JSON.stringify(parsedData))
       } else {
         localStorage.setItem('easy_trip_data_v7', finalData)
       }
       
       store.loadData()
       openAlert('資料匯入成功')
       emit('close')
       // Reset state
       showImportOptions.value = false
       importText.value = ''
    }
  } catch (err) {
    openAlert('匯入失敗：格式錯誤')
    console.error(err)
  }
}

const triggerFileImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (res) => {
      const result = res.target?.result as string
      processImportData(result)
    }
    reader.readAsText(file)
  }
  input.click()
}

const handleTextImport = () => {
  if (!importText.value) return
  processImportData(importText.value)
}

const updateCurrency = (e: Event) => {
  const target = e.target as HTMLSelectElement
  store.updateSettings({ currency: target.value })
}

const updateRate = (code: string, e: Event) => {
  const target = e.target as HTMLInputElement
  const val = parseFloat(target.value)
  if (!isNaN(val) && val > 0) {
    store.updateCurrencyRate(code, val)
  }
}

// Trip Info Logic
const localTitle = ref('')
const localStartDate = ref('')

// Sync local state with store when modal opens
import { watch } from 'vue'
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localTitle.value = store.title
    localStartDate.value = store.startDate
    localTravelers.value = [...store.travelers]
  }
})

const saveTripInfo = () => {
  store.updateTripInfo(localTitle.value, localStartDate.value)
  store.updateTravelers(localTravelers.value.filter(t => t.trim() !== ''))
}

const localTravelers = ref<string[]>([])

const addTraveler = () => {
  localTravelers.value.push(`旅伴 ${localTravelers.value.length + 1}`)
  saveTripInfo()
}

const removeTraveler = (index: number) => {
  localTravelers.value.splice(index, 1)
  saveTripInfo()
}

// Transport Pass Logic
const newPassName = ref('')
const newPassImage = ref('')

const triggerPassImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (res) => {
      newPassImage.value = res.target?.result as string
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

const addPass = () => {
  if (!newPassName.value || !newPassImage.value) return
  
  store.addPass({ name: newPassName.value, imageUrl: newPassImage.value })
  
  // Reset form
  newPassName.value = ''
  newPassImage.value = ''
  openAlert('票券已新增')
}

const removePass = (id: string) => {
  openConfirmModal('刪除票券', '確定要刪除此票券嗎？', () => {
    store.removePass(id)
  })
}

// AI Helper Logic
const showAiHelper = ref(false)
const copyStatus = ref('複製')

const aiPrompt = `請扮演一位專業的旅遊行程規劃助手。
我會提供給你一份 Excel 或文字格式的行程表資料。請依照以下步驟協助我建立行程檔案，不要直接輸出 JSON：

### 步驟一：確認互動模式
請先詢問我希望使用哪種方式進行確認：
1. **逐日確認模式**：一天一天詳細確認行程細節、交通與時間，適合需要精細調整的行程。
2. **概略確認模式**：一次性檢查所有缺漏並確認，適合行程已大致確定的情況。

### 步驟二：資料檢查與補全
根據我選擇的模式：
- 若為**逐日確認**：請依序針對每一天的行程進行檢查，每次只處理一天，確認完後再進行下一天。
- 若為**概略確認**：請分析整份行程，一次性列出所有缺漏。

檢查重點包含：
1. 缺少的確切時間 (Time)。
2. 缺少的交通方式 (Transport) 與細節。
3. 缺少的預估費用 (Cost)。
4. 任何語意不清的地點或活動。
5. 若活動類別為 'flight'，必須詢問航班資訊 (起降機場代碼、班號、起降時間)，並將其填入 transports 中。

### 步驟二：景點導覽建議
針對行程中的景點 (category: 'fun')，請主動建議「深度導覽資訊」(Guide)，並以 **Markdown 表格** 呈現以下欄位供我確認：
- 景點名稱
- 推薦顏色 (Color, Tailwind class)
- 圖示 (Icon, FontAwesome)
- 簡介 (Desc)
- 必看重點 (Highlights)
- 參觀小撇步 (Tips)

### 步驟三：雨天備案建議
請根據行程中的主要景點位置，主動建議 2-3 個附近的室內景點作為雨天備案（例如：百貨公司、瞭望台、咖啡廳、水族館等）。
這些備案請直接加入 JSON 的 'backups' 陣列中。

### 步驟四：生成 JSON
當我確認上述資訊或給予修訂後，請依據我最終的決定，並遵守以下規則生成 JSON：
1. 自動判斷類別 (fun, food, shop, stay, transport, flight)。
2. 若交通方式未明，請預設為步行 (type: 'walk')。
3. 交通類型請使用：'walk' (步行), 'public' (公車/地鐵), 'express' (新幹線/特急), 'ferry' (船), 'taxi' (計程車/Uber), 'drive' (自駕), 'flight' (飛機)。
4. 若我確認加入導覽，請將資料填入 \`attractionGuides\` 物件中。
5. 若活動類別為 'food'，請自動搜尋並填入 Tabelog 連結至 \`link\` 欄位。
6. 針對 \`attractionGuides\`，請嘗試從 Unsplash、Pexels 或 Pixabay 等免費圖庫搜尋並填入高品質的背景圖片連結至 \`image\` 欄位。
7. 針對 \`color\` 欄位，**必須**使用 Tailwind CSS 的標準漸層 class，例如 'from-pink-500 to-red-600'。
   - **可用顏色名稱**：slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose。
   - **可用色階**：50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950。
   - **請勿使用**非標準顏色 (如 gold, brown, silver 等)。
8. 針對每個行程事件 (Event)，請盡可能提供準確的經緯度座標 (\`lat\`, \`lng\`)，以便在地圖上顯示。
9. 輸出符合以下 Schema 的 JSON 格式。

### JSON Schema 規範 (TypeScript 定義)：

\`\`\`typescript
interface TripData {
  title: string; // 旅遊標題
  startDate: string; // 開始日期 (YYYY-MM-DD)
  settings: { currency: string; timeFormat?: '12h' | '24h' }; // 預設 "JPY", "24h"
  travelers: string[]; // 預設 ["我"]
  days: Day[]; // 每日行程
  backups: Event[]; // 備案 (可為空陣列)
  expenses: Expense[]; // 支出 (可為空陣列)
  attractionGuides: Record<string, Guide>; // 景點深度導覽 (Key 為景點名稱)
}

interface Guide {
  color: string; // 必須是 Tailwind CSS 漸層 class (e.g. "from-pink-500 to-red-600")。可用顏色：slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose。
  icon: string; // 圖示 (FontAwesome), e.g., "fa-solid fa-torii-gate"
  desc: string; // 景點介紹 (約 50-100 字)
  tags: string[]; // 標籤 (3-5 個)
  highlights: string[]; // 必看重點 (3 個)
  tips: string; // 參觀小撇步
  link: string; // 官方網站或相關連結
  image?: string; // 背景圖片連結 (請搜尋免費圖庫)
}

interface Day {
  dateStr: string; // 顯示日期格式，例如 "9/10 (Tue)"
  weatherIcon: string; // 預設 "fa-solid fa-sun text-orange-400"
  temp: number; // 預設 25
  events: Event[]; // 當日活動列表
}

interface TransportSchedule {
  dep: string;        // 出發時間 (HH:MM)
  arr?: string;       // 抵達時間 (HH:MM)
  note?: string;      // 備註
}

interface Transport {
  type: 'walk' | 'public' | 'express' | 'ferry' | 'taxi' | 'drive' | 'flight';
  // Common
  dep?: string; // 出發時間
  arr?: string; // 抵達時間
  cost?: number;
  direction?: string; // 開往方向 (e.g. 往新宿)
  note?: string; // 交通備註
  
  // Public (Bus/Subway)
  line?: string;      // 路線 (e.g. 機場線, 50號公車)
  
  // Express (Shinkansen/Train)
  trainNumber?: string; // 班次 (e.g. 回聲號 855)
  car?: string;         // 車廂/座位 (e.g. 自由席, 5號車 3A) 或 租車車型
  platform?: string;    // 月台
  
  // Flight (飛機)
  flightNo?: string;    // 航班編號 (e.g. IT240)
  depAirport?: string;  // 出發機場 (e.g. TPE)
  arrAirport?: string;  // 抵達機場 (e.g. FUK)
  
  // Ferry / Taxi / Drive / Public / Flight
  company?: string;     // 營運公司 / 船公司 / 車行 / 租車公司 / 航空公司

  // Schedules (Express & Ferry)
  schedules?: TransportSchedule[]; // 前後班次 (Max 5)
}

interface Event {
  title: string; // 活動名稱
  location: string; // 地點
  lat?: number; // 緯度 (e.g. 33.5902)
  lng?: number; // 經度 (e.g. 130.4207)
  mapUrl?: string; // Google Maps 連結
  category: 'fun' | 'food' | 'shop' | 'stay' | 'transport' | 'flight';
  time: string; // 開始時間 (HH:MM)
  endTime?: string; // 結束時間 (HH:MM)
  cost: number; // 預估費用 (日幣)
  currency?: string; // 預設 "JPY"
  notes?: string; // 備註
  link?: string; // 相關連結
  linkedGuide?: string; // 關聯的導覽 ID (Key of attractionGuides)
  transports?: Transport[]; // 交通資訊 (含航班資訊)
}
\`\`\`

請等待我提供行程資料後再開始轉換。`



const copyPrompt = () => {
  navigator.clipboard.writeText(aiPrompt).then(() => {
    copyStatus.value = '已複製！'
    setTimeout(() => {
      copyStatus.value = '複製'
    }, 2000)
  })
}

</script>
