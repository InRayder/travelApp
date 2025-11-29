<template>
  <transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
      <div class="absolute inset-0 bg-black/30 pointer-events-auto transition-opacity" @click="emit('close')"></div>
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pointer-events-auto shadow-2xl modal-body flex flex-col relative z-50">
        
        <div class="flex justify-between items-center mb-4 shrink-0">
          <h3 class="font-bold text-lg">{{ isBackup ? '新增備案' : (isAdding ? '新增行程' : '編輯行程') }}</h3>
          <div class="flex gap-2">
            <button v-if="!isBackup && !isAdding" @click="emit('move-to-backup')" class="text-gray-400 hover:text-orange-500" title="移至備案">
              <font-awesome-icon icon="fa-solid fa-arrow-down-long" />
            </button>
            <button v-if="!isAdding" @click="emit('delete')" class="text-gray-400 hover:text-red-500" title="刪除">
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
            <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
        </div>

        <div class="space-y-5 overflow-y-auto flex-1 pb-6 px-1 hide-scrollbar">
          <!-- 類別 (Category) -->
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-2">類別</label>
            <div class="grid grid-cols-6 gap-2">
              <button v-for="cat in store.categories" :key="cat.id" @click="form.category = cat.id" class="flex flex-col items-center justify-center p-2 rounded-xl border transition-all" :class="form.category === cat.id ? 'bg-jp-dark text-white border-jp-dark' : 'bg-gray-50 text-gray-400 border-transparent'">
                <font-awesome-icon :icon="cat.icon" class="text-sm mb-1" />
                <span class="text-[9px]">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <!-- 標題 (Title) -->
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">標題</label>
            <input v-model="form.title" class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-jp-mustard transition-all" placeholder="行程名稱">
          </div>

          <!-- 關聯導覽 (Linked Guide) -->
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">關聯深度導覽 (Guide Link)</label>
            <select v-model="form.linkedGuide" class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-jp-mustard transition-all text-sm">
              <option :value="null">-- 自動偵測 (Auto) --</option>
              <option v-for="(_, k) in store.attractionGuides" :key="k" :value="k">{{ k }}</option>
            </select>
          </div>

          <!-- 時間 (Time) -->
          <div v-if="!isBackup" class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3">
            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">預計抵達時間 <span class="text-red-400">*</span></label>
              <input v-model="form.time" type="time" @change="onTimeChange" class="w-full bg-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-jp-mustard font-mono">
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="text-xs font-bold text-gray-500 block mb-1">預計離開時間</label>
                <input v-model="form.endTime" type="time" @change="onEndTimeChange" class="w-full bg-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-jp-mustard font-mono">
              </div>
              <div class="flex items-center pt-4 text-gray-400 text-xs">OR</div>
              <div class="flex-1">
                <label class="text-xs font-bold text-gray-500 block mb-1">停留時間 (分)</label>
                <input v-model.number="form.duration" type="number" @input="onDurationChange" class="w-full bg-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-jp-mustard font-mono" placeholder="min">
              </div>
            </div>
          </div>

          <!-- 類別專屬欄位 (Category Specific Fields) -->
          <div v-if="form.category === 'stay' && form.stayInfo" class="animate-fade-in border border-purple-200 bg-purple-50/50 p-3 rounded-xl">
            <label class="text-xs font-bold text-purple-600 block mb-2"><font-awesome-icon icon="fa-solid fa-hotel" /> 住宿詳情</label>
            <div class="space-y-3">
              <div><label class="text-[10px] text-gray-500 block mb-1">訂房連結</label><input v-model="form.bookingLink" class="w-full bg-white p-2 rounded-lg outline-none text-xs text-blue-600 placeholder-blue-300" placeholder="https://www.booking.com/..."></div>
              <div class="flex gap-2">
                <div class="flex-1"><label class="text-[10px] text-gray-500 block mb-1">入住日期</label><input v-model="form.stayInfo.startDate" type="date" class="w-full bg-white p-2 rounded-lg outline-none text-xs font-mono"></div>
                <div class="flex-1"><label class="text-[10px] text-gray-500 block mb-1">退房日期</label><input v-model="form.stayInfo.endDate" type="date" class="w-full bg-white p-2 rounded-lg outline-none text-xs font-mono"></div>
              </div>
              <div class="flex gap-2">
                <div class="flex-1"><label class="text-[10px] text-gray-500 block mb-1">Check-in</label><input v-model="form.stayInfo.checkIn" type="time" class="w-full bg-white p-2 rounded-lg outline-none text-xs font-mono"></div>
                <div class="flex-1"><label class="text-[10px] text-gray-500 block mb-1">Check-out</label><input v-model="form.stayInfo.checkOut" type="time" class="w-full bg-white p-2 rounded-lg outline-none text-xs font-mono"></div>
              </div>
              <div><label class="text-[10px] text-gray-500 block mb-1">備註</label><textarea v-model="form.stayInfo.notes" rows="2" class="w-full bg-white p-2 rounded-lg outline-none text-xs resize-none" placeholder="房號/密碼/注意事項"></textarea></div>
            </div>
          </div>

          <div v-if="form.category === 'food' && store.settings.currency === 'JPY'" class="animate-fade-in">
            <label class="text-xs font-bold text-orange-500 block mb-1"><font-awesome-icon icon="fa-solid fa-utensils" /> Tabelog / 餐廳連結</label>
            <input v-model="form.link" class="w-full bg-orange-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 transition-all text-sm text-orange-800 placeholder-orange-300" placeholder="https://tabelog.com/...">
          </div>

          <div v-if="form.category === 'fun'" class="animate-fade-in">
            <label class="text-xs font-bold text-orange-500 block mb-1"><font-awesome-icon icon="fa-solid fa-ticket" /> Klook/KKday 購票連結</label>
            <input v-model="form.ticketLink" class="w-full bg-orange-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 transition-all text-sm text-orange-800 placeholder-orange-300" placeholder="https://www.klook.com/...">
          </div>

          <div v-if="form.category === 'shop'" class="animate-fade-in border border-red-200 bg-red-50/30 p-3 rounded-xl">
            <label class="text-xs font-bold text-red-500 block mb-2"><font-awesome-icon icon="fa-solid fa-tags" /> 優惠券管理</label>
            <div class="space-y-2">
              <div v-for="(disc, idx) in form.discounts" :key="idx" class="flex gap-2 mb-2">
                <input v-model="disc.name" class="w-1/3 bg-white p-2 rounded-lg text-xs outline-none border border-red-100" placeholder="名稱">
                <input v-model="disc.url" class="flex-1 bg-white p-2 rounded-lg text-xs outline-none border border-red-100" placeholder="連結">
                <button @click="removeDiscount(idx)" class="w-8 h-8 rounded-lg bg-white border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50"><font-awesome-icon icon="fa-solid fa-trash" /></button>
              </div>
              <button @click="addDiscount" class="w-full py-2 rounded-lg border border-dashed border-red-300 text-red-500 text-xs font-bold hover:bg-red-50">+ 新增優惠券</button>
            </div>
          </div>

          <div v-if="form.category === 'flight' && form.flightInfo" class="animate-fade-in border border-blue-200 bg-blue-50/50 p-3 rounded-xl">
            <label class="text-xs font-bold text-blue-500 block mb-2"><font-awesome-icon icon="fa-solid fa-plane-up" /> 航班資訊</label>
            <div class="flex gap-2 mb-2">
              <input v-model="form.flightInfo.dep" class="w-1/3 bg-white p-2 rounded-lg text-xs font-mono text-center" placeholder="DEP">
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-gray-300 mt-2 text-xs" />
              <input v-model="form.flightInfo.arr" class="w-1/3 bg-white p-2 rounded-lg text-xs font-mono text-center" placeholder="ARR">
            </div>
            <div class="flex gap-2">
              <input v-model="form.flightInfo.flightNo" class="flex-1 bg-white p-2 rounded-lg text-xs font-mono" placeholder="航班號">
              <input v-model="form.flightInfo.depTime" type="time" class="w-1/4 bg-white p-2 rounded-lg text-xs font-mono">
              <input v-model="form.flightInfo.arrTime" type="time" class="w-1/4 bg-white p-2 rounded-lg text-xs font-mono">
            </div>
          </div>

          <!-- Transport -->
          <!-- 交通 (Transport) -->
          <div v-if="!isBackup && form.transport" class="border border-jp-accent-blue/30 bg-blue-50/50 p-4 rounded-xl space-y-3">
            <label class="text-xs font-bold text-jp-accent-blue block mb-2 flex items-center gap-1"><font-awesome-icon icon="fa-solid fa-route" /> 到達此處的交通方式</label>
            
            <!-- Type Selector -->
            <div>
              <select v-model="form.transport.type" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200 font-bold text-gray-700">
                <option value="walk">步行 (Walk)</option>
                <option value="public">公車/地鐵 (Bus/Subway)</option>
                <option value="express">新幹線/觀光列車 (Express)</option>
                <option value="taxi">計程車/Uber (Taxi)</option>
                <option value="drive">自駕 (Self-drive)</option>
                <option value="ferry">船 (Ferry)</option>
              </select>
            </div>

            <!-- Walk: Simple View -->
            <div v-if="form.transport.type === 'walk'" class="text-xs text-gray-500 text-center py-2 bg-white/50 rounded-lg">
              <font-awesome-icon icon="fa-solid fa-person-walking" /> 步行前往
            </div>

            <!-- Public: Line -->
            <div v-if="form.transport.type === 'public'" class="space-y-2">
              <div>
                <label class="text-[10px] font-bold text-gray-400 block mb-1">路線 (Line)</label>
                <input v-model="form.transport.line" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 機場線, 50號公車">
              </div>
            </div>

            <!-- Express: Train Name, Car, Platform -->
            <div v-if="form.transport.type === 'express'" class="space-y-2">
              <div>
                <label class="text-[10px] font-bold text-gray-400 block mb-1">班次名稱 (Train No.)</label>
                <input v-model="form.transport.trainNumber" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 回聲號 855">
              </div>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">車廂/座位 (Car/Seat)</label>
                  <input v-model="form.transport.car" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 自由席, 5號車 3A">
                </div>
                <div class="w-1/3">
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">月台 (Platform)</label>
                  <input v-model="form.transport.platform" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 2">
                </div>
              </div>
            </div>

            <!-- Taxi: Company -->
            <div v-if="form.transport.type === 'taxi'" class="space-y-2">
              <div>
                <label class="text-[10px] font-bold text-gray-400 block mb-1">車行/APP (Company/App)</label>
                <input v-model="form.transport.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. Uber, TaxiGo">
              </div>
            </div>

            <!-- Drive: Rental Company, Car Model -->
            <div v-if="form.transport.type === 'drive'" class="space-y-2">
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">租車公司 (Rental Agency)</label>
                  <input v-model="form.transport.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. Toyota Rent a Car">
                </div>
                <div class="flex-1">
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">車型 (Car Model)</label>
                  <input v-model="form.transport.car" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. Yaris">
                </div>
              </div>
            </div>

            <!-- Ferry: Company -->
            <div v-if="form.transport.type === 'ferry'" class="space-y-2">
              <div>
                <label class="text-[10px] font-bold text-gray-400 block mb-1">船公司 (Company)</label>
                <input v-model="form.transport.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 關門汽船">
              </div>
            </div>

            <!-- Schedules (Express & Ferry) -->
            <div v-if="['express', 'ferry'].includes(form.transport.type)" class="space-y-2 pt-2 border-t border-blue-200/50">
              <div class="flex justify-between items-center">
                <label class="text-[10px] font-bold text-gray-400 block">前後班次 (Schedules) <span class="text-[9px] font-normal">(Max 5)</span></label>
                <button v-if="!form.transport.schedules || form.transport.schedules.length < 5" @click="addSchedule" class="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors">
                  <font-awesome-icon icon="fa-solid fa-plus" /> 新增
                </button>
              </div>
              
              <div v-if="form.transport.schedules && form.transport.schedules.length > 0" class="space-y-2">
                <div v-for="(sch, idx) in form.transport.schedules" :key="idx" class="flex gap-2 items-center bg-white/50 p-2 rounded-lg">
                  <div class="w-16">
                    <input v-model="sch.dep" type="time" class="w-full bg-white p-1 rounded text-xs outline-none border border-gray-200 font-mono text-center" placeholder="Dep">
                  </div>
                  <div class="w-16">
                    <input v-model="sch.arr" type="time" class="w-full bg-white p-1 rounded text-xs outline-none border border-gray-200 font-mono text-center" placeholder="Arr">
                  </div>
                  <div class="flex-1">
                    <input v-model="sch.note" class="w-full bg-white p-1 rounded text-xs outline-none border border-gray-200" placeholder="備註 (e.g. 前一班)">
                  </div>
                  <button @click="removeSchedule(idx)" class="text-gray-400 hover:text-red-400 px-1">
                    <font-awesome-icon icon="fa-solid fa-xmark" />
                  </button>
                </div>
              </div>
              <div v-else class="text-[10px] text-gray-400 text-center py-2 border border-dashed border-gray-200 rounded-lg">
                無前後班次資訊
              </div>
            </div>

            <!-- Common: Direction -->
            <div v-if="form.transport.type !== 'walk'" class="space-y-2 pt-2 border-t border-blue-200/50">
              <div>
                <label class="text-[10px] font-bold text-gray-400 block mb-1">開往方向 (Direction)</label>
                <input v-model="form.transport.direction" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 往新宿">
              </div>
            </div>

            <!-- Common: Time & Cost -->
            <div v-if="form.transport.type !== 'walk'" class="flex gap-2">
              <div class="flex-1">
                 <label class="text-[10px] font-bold text-gray-400 block mb-1">出發 (Dep)</label>
                 <input v-model="form.transport.dep" type="time" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200 font-mono">
              </div>
              <div class="flex-1">
                 <label class="text-[10px] font-bold text-gray-400 block mb-1">抵達 (Arr)</label>
                 <input v-model="form.transport.arr" type="time" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200 font-mono">
              </div>
              <div class="flex-1">
                 <label class="text-[10px] font-bold text-gray-400 block mb-1">車資 (Cost)</label>
                 <div class="relative">
                   <span class="absolute left-2 top-2 text-xs text-gray-400">¥</span>
                   <input :value="transportCostDisplay" @input="onTransportCostInput" @focus="onTransportCostFocus" @blur="onTransportCostBlur" type="text" class="w-full bg-white p-2 pl-5 rounded-lg text-xs outline-none border border-gray-200 font-mono">
                 </div>
              </div>
            </div>
          </div>

          <!-- 地點與花費 (Location & Cost) -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="text-xs font-bold text-gray-500 block mb-2 flex justify-between">
              地點與連結 
              <a :href="getGoogleMapLink(form.title)" target="_blank" class="text-blue-500 hover:underline"><font-awesome-icon icon="fa-solid fa-map-location-dot" /> Check Map</a>
            </label>
            <input v-model="form.location" class="w-full bg-white p-2 rounded-lg outline-none text-sm mb-2" placeholder="地點描述 (e.g. 博多駅)">
            <input v-model="form.mapUrl" class="w-full bg-white p-2 rounded-lg outline-none text-xs text-blue-600" placeholder="Google Maps 連結 (e.g. https://maps.app.goo.gl/...)">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">預算</label>
            <div class="flex gap-2">
              <select v-model="form.currency" class="w-1/4 bg-gray-50 p-3 rounded-xl outline-none text-xs font-bold text-gray-600">
                <option v-for="(_, code) in store.currencies" :key="code" :value="code">{{ code }}</option>
              </select>
              <input :value="costDisplay" @input="onCostInput" @focus="onCostFocus" @blur="onCostBlur" type="text" class="flex-1 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-jp-mustard font-mono">
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">備註</label>
            <textarea v-model="form.notes" rows="2" class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-jp-mustard resize-none"></textarea>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button @click="emit('close')" class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">取消</button>
          <button @click="save" class="flex-[2] py-3 rounded-xl bg-jp-mustard text-white font-bold shadow-lg shadow-jp-mustard/30">儲存{{ isBackup ? '備案' : '變更' }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, toRaw } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import type { Event as TripEvent } from '../stores/trip.ts'

const props = defineProps<{
  isOpen: boolean
  initialData: TripEvent | null
  isBackup: boolean
  isAdding: boolean
}>()

const emit = defineEmits(['close', 'save', 'delete', 'move-to-backup'])

const store = useTripStore()
// Initialize form with default values matching the Event interface
const form = ref<TripEvent>({
  id: '',
  category: 'fun',
  title: '',
  location: '',
  time: '',
  endTime: '',
  cost: 0,
  currency: 'JPY',
  notes: '',
  linkedGuide: undefined,
  transport: { type: 'walk', line: '', company: '', direction: '', dep: '', cost: 0 },
  flightInfo: { dep: '', arr: '', flightNo: '', depTime: '', arrTime: '' },
  discounts: [],
  stayInfo: { startDate: '', endDate: '', checkIn: '', checkOut: '', notes: '' },
  lat: undefined,
  lng: undefined,
  duration: undefined,
  link: '',
  ticketLink: '',
  bookingLink: ''
})

// 開啟時初始化表單 (Initialize form when opening)
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      try {
        const rawData = JSON.parse(JSON.stringify(toRaw(props.initialData)))
        // 合併預設值以確保所有欄位存在 (Merge with defaults to ensure all fields exist)
        form.value = {
          ...rawData,
          cost: rawData.cost || 0,
          currency: rawData.currency || store.settings.currency,
          lat: rawData.lat || undefined,
          transport: rawData.transport || { type: 'walk', line: '', company: '', direction: '', dep: '', cost: 0 },
          flightInfo: rawData.flightInfo || { dep: '', arr: '', flightNo: '', depTime: '', arrTime: '' },
          discounts: rawData.discounts || [],
          stayInfo: rawData.stayInfo || { startDate: '', endDate: '', checkIn: '', checkOut: '', notes: '' },
          linkedGuide: rawData.linkedGuide || undefined
        }
        
        // Migration logic removed
      } catch (e) {
        console.error('Clone error', e)
        // Fallback to initialData if clone fails, though JSON.parse/stringify is usually safe for POJOs
        if (props.initialData) {
             form.value = { ...toRaw(props.initialData) }
        }
      }
    } else {
      // 預設空表單 (Default empty form)
      form.value = {
        id: '',
        category: 'fun', title: '', location: '', time: '', endTime: '', cost: 0, notes: '', linkedGuide: undefined,
        transport: { type: 'walk', line: '', company: '', direction: '', dep: '', cost: 0 },
        flightInfo: { dep: '', arr: '', flightNo: '', depTime: '', arrTime: '' },
        discounts: [],
        stayInfo: { startDate: '', endDate: '', checkIn: '', checkOut: '', notes: '' },
        currency: store.settings.currency,
        lat: undefined,
        lng: undefined,
        duration: undefined,
        link: '',
        ticketLink: '',
        bookingLink: ''
      }
    }
  }
})

// 時間計算邏輯 (Time Calculation Logic)
const addMinutes = (time: string, mins: number) => {
  if(!time) return ''
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m + mins)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const getDiffMinutes = (s: string, e: string) => {
  const [h1,m1] = s.split(':').map(Number)
  const [h2,m2] = e.split(':').map(Number)
  let d = (h2*60+m2) - (h1*60+m1)
  if(d < 0) d += 24*60
  return d
}

const onTimeChange = () => {
  if(form.value.time && form.value.duration) form.value.endTime = addMinutes(form.value.time, form.value.duration)
  else if(form.value.time && form.value.endTime) form.value.duration = getDiffMinutes(form.value.time, form.value.endTime)
}

const onEndTimeChange = () => {
  if(form.value.time && form.value.endTime) form.value.duration = getDiffMinutes(form.value.time, form.value.endTime)
}

const onDurationChange = () => {
  if(form.value.time && form.value.duration) form.value.endTime = addMinutes(form.value.time, form.value.duration)
}

const addDiscount = () => {
  if(!form.value.discounts) form.value.discounts = []
  form.value.discounts.push({ name: '', url: '' })
}

const removeDiscount = (idx: number) => {
  if (form.value.discounts) {
    form.value.discounts.splice(idx, 1)
  }
}

const save = () => {
  const dataToSave = { ...form.value }
  // delete dataToSave.duration // 不儲存計算出的持續時間 (Don't save calculated duration)
  
  emit('save', dataToSave)
}

// 班次管理 (Schedule Management)
const addSchedule = () => {
  if (!form.value.transport) return
  if (!form.value.transport.schedules) form.value.transport.schedules = []
  if (form.value.transport.schedules.length >= 5) return
  
  form.value.transport.schedules.push({ dep: '', arr: '', note: '' })
}

const removeSchedule = (idx: number) => {
  if (form.value.transport?.schedules) {
    form.value.transport.schedules.splice(idx, 1)
  }
}

const getGoogleMapLink = (loc: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`

// 監聽交通類型以執行智慧邏輯 (Watch transport type for smart logic)
// 監聽交通類型以執行智慧邏輯 (Watch transport type for smart logic)
watch(() => form.value.transport?.type, (newType) => {
  if (!form.value.transport) return
  if (newType === 'walk') {
    form.value.transport.cost = 0
    form.value.transport.dep = ''
    form.value.transport.arr = ''
    form.value.transport.line = ''
    form.value.transport.direction = ''
    form.value.transport.company = ''
    form.value.transport.car = ''
    form.value.transport.trainNumber = ''
    form.value.transport.platform = ''
  } else if (newType === 'public') {
    form.value.transport.trainNumber = ''
    form.value.transport.car = ''
    form.value.transport.platform = ''
    form.value.transport.company = ''
  } else if (newType === 'express') {
    form.value.transport.line = ''
  } else if (newType === 'taxi') {
    form.value.transport.line = ''
    form.value.transport.trainNumber = ''
    form.value.transport.platform = ''
    form.value.transport.car = ''
  } else if (newType === 'drive') {
    form.value.transport.line = ''
    form.value.transport.trainNumber = ''
    form.value.transport.platform = ''
  } else if (newType === 'ferry') {
    form.value.transport.line = ''
    form.value.transport.trainNumber = ''
    form.value.transport.car = ''
    form.value.transport.platform = ''
  }
})

// 貨幣格式化邏輯 (Currency Formatting Logic)
const formatCurrency = (val: number | undefined, currency = 'JPY') => {
  if (val == null || val === undefined) return ''
  const sym = store.currencies[currency]?.symbol || '¥'
  return `${sym} ${Number(val).toLocaleString()}`
}

const parseCurrency = (str: string) => {
  if (!str) return 0
  const num = parseFloat(str.replace(/[^\d.]/g, ''))
  return isNaN(num) ? 0 : num
}

const costDisplay = ref('')
const transportCostDisplay = ref('')
const isEditingCost = ref(false)
const isEditingTransportCost = ref(false)

// 同步表單 -> 顯示 (Sync form -> display)
watch(() => form.value.cost, (newVal) => {
  if (!isEditingCost.value) costDisplay.value = formatCurrency(newVal, form.value.currency)
})
watch(() => form.value.currency, () => {
  if (!isEditingCost.value) costDisplay.value = formatCurrency(form.value.cost, form.value.currency)
})
watch(() => form.value.transport?.cost, (newVal) => {
  if (!isEditingTransportCost.value) transportCostDisplay.value = formatCurrency(newVal, 'JPY')
})

// 處理函式 (Handlers)
const onCostFocus = () => {
  isEditingCost.value = true
  costDisplay.value = form.value.cost?.toString() || ''
  // Auto-select text on focus
  setTimeout(() => {
    const el = document.activeElement as HTMLInputElement
    if (el && el.tagName === 'INPUT') el.select()
  }, 0)
}
const onCostBlur = () => {
  isEditingCost.value = false
  costDisplay.value = formatCurrency(form.value.cost, form.value.currency)
}
const onCostInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const val = target.value
  costDisplay.value = val
  form.value.cost = parseCurrency(val)
}

const onTransportCostFocus = () => {
  isEditingTransportCost.value = true
  transportCostDisplay.value = form.value.transport?.cost?.toString() || ''
  setTimeout(() => {
    const el = document.activeElement as HTMLInputElement
    if (el && el.tagName === 'INPUT') el.select()
  }, 0)
}
const onTransportCostBlur = () => {
  isEditingTransportCost.value = false
  transportCostDisplay.value = formatCurrency(form.value.transport?.cost, 'JPY')
}
const onTransportCostInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const val = target.value
  transportCostDisplay.value = val
  if(form.value.transport) form.value.transport.cost = parseCurrency(val)
}
</script>
