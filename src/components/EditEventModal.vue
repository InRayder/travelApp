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
              <TimeInput v-model="form.time" :format="store.settings.timeFormat" @change="onTimeChange" />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="text-xs font-bold text-gray-500 block mb-1">預計離開時間</label>
                <TimeInput v-model="form.endTime" :format="store.settings.timeFormat" @change="onEndTimeChange" />
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
                <div class="flex-1"><label class="text-[10px] text-gray-500 block mb-1">Check-in</label><TimeInput v-model="form.stayInfo.checkIn" :format="store.settings.timeFormat" /></div>
                <div class="flex-1"><label class="text-[10px] text-gray-500 block mb-1">Check-out</label><TimeInput v-model="form.stayInfo.checkOut" :format="store.settings.timeFormat" /></div>
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



          <!-- Transport -->
          <!-- 交通 (Transport) -->
          <div v-if="!isBackup" class="space-y-4" ref="transportSection">
            <div v-for="(t, index) in form.transports" :key="index" class="border border-jp-accent-blue/30 bg-blue-50/50 p-4 rounded-xl space-y-3 relative">
              <div class="flex justify-between items-center mb-2">
                <label class="text-xs font-bold text-jp-accent-blue flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-route" /> 
                  交通方式 {{ form.transports && form.transports.length > 1 ? `#${index + 1}` : '' }}
                </label>
                <button @click="removeTransportSegment(index)" class="text-gray-400 hover:text-red-500 text-xs px-2">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
              
              <!-- Type Selector -->
              <div>
                <select v-model="t.type" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200 font-bold text-gray-700">
                  <option value="walk">步行 (Walk)</option>
                  <option value="public">公車/地鐵 (Bus/Subway)</option>
                  <option value="express">新幹線/觀光列車 (Express)</option>
                  <option value="flight">飛機 (Flight)</option>
                  <option value="taxi">計程車/Uber (Taxi)</option>
                  <option value="drive">自駕 (Self-drive)</option>
                  <option value="ferry">船 (Ferry)</option>
                </select>
              </div>

              <!-- Walk: Simple View -->
              <div v-if="t.type === 'walk'" class="text-xs text-gray-500 text-center py-2 bg-white/50 rounded-lg">
                <font-awesome-icon icon="fa-solid fa-person-walking" /> 步行前往
              </div>

              <!-- Public: Company & Line -->
              <!-- Public: Company & Line -->
              <div v-if="t.type === 'public'" class="flex gap-2">
                <div class="flex-1">
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">營運公司 (Company)</label>
                  <input v-model="t.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 福岡市地鐵">
                </div>
                <div class="flex-1">
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">路線 (Line)</label>
                  <input v-model="t.line" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 機場線">
                </div>
              </div>

              <!-- Flight: Flight No, Airports -->
              <div v-if="t.type === 'flight'" class="space-y-2">
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">航班編號 (Flight No)</label>
                    <input v-model="t.flightNo" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. IT240">
                  </div>
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">航空公司 (Airline)</label>
                    <input v-model="t.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 台灣虎航">
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">出發機場 (Dep Airport)</label>
                    <input v-model="t.depAirport" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200 font-mono text-center" placeholder="TPE">
                  </div>
                  <div class="flex items-center pt-4 text-gray-300">
                    <font-awesome-icon icon="fa-solid fa-plane" />
                  </div>
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">抵達機場 (Arr Airport)</label>
                    <input v-model="t.arrAirport" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200 font-mono text-center" placeholder="FUK">
                  </div>
                </div>
              </div>

              <!-- Express: Company, Train Name, Car, Platform -->
              <div v-if="t.type === 'express'" class="space-y-2">
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">營運公司 (Company)</label>
                    <input v-model="t.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. JR九州">
                  </div>
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">班次名稱 (Train No.)</label>
                    <input v-model="t.trainNumber" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 回聲號 855">
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">車廂/座位 (Car/Seat)</label>
                    <input v-model="t.car" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 自由席, 5號車 3A">
                  </div>
                  <div class="w-1/3">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">月台 (Platform)</label>
                    <input v-model="t.platform" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 2">
                  </div>
                </div>
              </div>

              <!-- Taxi: No specific fields needed -->

              <!-- Drive: Rental Company, Car Model -->
              <div v-if="t.type === 'drive'" class="space-y-2">
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">租車公司 (Rental Agency)</label>
                    <input v-model="t.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. Toyota Rent a Car">
                  </div>
                  <div class="flex-1">
                    <label class="text-[10px] font-bold text-gray-400 block mb-1">車型 (Car Model)</label>
                    <input v-model="t.car" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. Yaris">
                  </div>
                </div>
              </div>

              <!-- Ferry: Company -->
              <div v-if="t.type === 'ferry'" class="space-y-2">
                <div>
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">船公司 (Company)</label>
                  <input v-model="t.company" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 關門汽船">
                </div>
              </div>

              <!-- Common: Direction -->
              <div v-if="t.type !== 'walk' && t.type !== 'taxi' && t.type !== 'flight'" class="space-y-2 pt-2 border-t border-blue-200/50">
                <div>
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">開往方向 (Direction)</label>
                  <input v-model="t.direction" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 往新宿">
                </div>
              </div>

              <!-- Common: Time -->
              <div class="space-y-2">
                <div class="grid grid-cols-3 gap-2">
                  <div v-if="t.type !== 'taxi'">
                    <label class="block text-[10px] font-bold text-gray-500 mb-1">出發 (Dep)</label>
                    <TimeInput 
                      v-model="t.dep" 
                      :format="store.settings.timeFormat" 
                      class="w-full" 
                      @change="updateArr(t)"
                    />
                  </div>
                  <div :class="{'col-span-3': t.type === 'taxi'}">
                    <label class="block text-[10px] font-bold text-gray-500 mb-1">時長 (Min)</label>
                    <input 
                      type="number" 
                      v-model.number="t.duration" 
                      class="w-full p-2 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-center focus:border-jp-accent-blue outline-none"
                      placeholder="--"
                      @input="updateArr(t)"
                    >
                  </div>
                  <div v-if="t.type !== 'taxi'">
                    <label class="block text-[10px] font-bold text-gray-500 mb-1">抵達 (Arr)</label>
                    <TimeInput 
                      v-model="t.arr" 
                      :format="store.settings.timeFormat" 
                      class="w-full" 
                      @change="updateDuration(t)"
                    />
                  </div>
                </div>
              </div>

              <!-- Common: Cost & Pass -->
              <div v-if="t.type !== 'walk'">
                 <div class="flex gap-2">
                   <div class="flex-1">
                     <label class="text-[10px] font-bold text-gray-400 block mb-1">車資 (Cost)</label>
                     <div class="relative">
                       <input v-model.number="t.cost" type="number" class="w-full bg-white p-2 pl-5 rounded-lg text-xs outline-none border border-gray-200 font-mono" placeholder="¥">
                     </div>
                   </div>
                   <div class="flex-1" v-if="store.passes.length > 0">
                     <label class="text-[10px] font-bold text-gray-400 block mb-1">使用票券 (Pass)</label>
                     <select v-model="t.passId" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200 text-jp-dark">
                       <option :value="undefined">-- 無 (None) --</option>
                       <option v-for="pass in store.passes" :key="pass.id" :value="pass.id">{{ pass.name }}</option>
                     </select>
                   </div>
                 </div>
              </div>

              <!-- Schedules (Express & Ferry & Public) -->
              <div v-if="['express', 'ferry', 'public'].includes(t.type)" class="space-y-2 pt-2 border-t border-blue-200/50">
                <div class="flex justify-between items-center">
                  <label class="text-[10px] font-bold text-gray-400 block">前後班次 (Schedules) <span class="text-[9px] font-normal">(Max 5)</span></label>
                  <button v-if="!t.schedules || t.schedules.length < 5" @click="addSchedule(t)" class="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-plus" /> 新增
                  </button>
                </div>
                
                <div v-if="t.schedules && t.schedules.length > 0" class="space-y-2">
                  <div v-for="(sch, idx) in t.schedules" :key="idx" class="flex gap-2 items-center bg-white/50 p-2 rounded-lg">
                    <div class="w-20">
                      <TimeInput v-model="sch.dep" :format="store.settings.timeFormat" placeholder="Dep" />
                    </div>
                    <div class="w-20">
                      <TimeInput v-model="sch.arr" :format="store.settings.timeFormat" placeholder="Arr" />
                    </div>
                    <div class="flex-1">
                      <input v-model="sch.note" class="w-full bg-white p-1 rounded text-xs outline-none border border-gray-200" placeholder="備註">
                    </div>
                    <button @click="removeSchedule(t, idx)" class="text-gray-400 hover:text-red-400 px-1">
                      <font-awesome-icon icon="fa-solid fa-xmark" />
                    </button>
                  </div>
                </div>
                <div v-else class="text-[10px] text-gray-400 text-center py-2 border border-dashed border-gray-200 rounded-lg">
                  無前後班次資訊
                </div>
              </div>

              <!-- Common: Note -->
              <div class="space-y-2 pt-2 border-t border-blue-200/50">
                <div>
                  <label class="text-[10px] font-bold text-gray-400 block mb-1">交通備註 (Note)</label>
                  <input v-model="t.note" class="w-full bg-white p-2 rounded-lg text-xs outline-none border border-gray-200" placeholder="e.g. 需轉車, 步行捷徑">
                </div>
              </div>
            </div>

            <!-- Add Segment Button -->
            <button @click="addTransportSegment" class="w-full py-2 rounded-xl border border-dashed border-blue-300 text-blue-500 text-xs font-bold hover:bg-blue-50 transition-colors">
              <font-awesome-icon icon="fa-solid fa-plus" /> {{ form.transports && form.transports.length > 0 ? '新增轉乘段 (Add Segment)' : '新增前往目的地交通方式' }}
            </button>
          </div>

          <!-- 地點與花費 (Location & Cost) -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="text-xs font-bold text-gray-500 block mb-2 flex justify-between">
              地點與連結 
              <a :href="getGoogleMapLink(form.title)" target="_blank" class="text-blue-500 hover:underline"><font-awesome-icon icon="fa-solid fa-map-location-dot" /> Check Map</a>
            </label>
            <input v-model="form.location" class="w-full bg-white p-2 rounded-lg outline-none text-sm mb-2" placeholder="地點描述 (e.g. 博多駅)">
            <div class="flex gap-2 mb-2">
              <input v-model="form.mapUrl" class="flex-1 bg-white p-2 rounded-lg outline-none text-xs text-blue-600" placeholder="Google Maps 連結 (e.g. https://maps.app.goo.gl/...)">
              <button @click="parseGoogleMapsUrl" class="bg-blue-100 text-blue-600 px-3 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors" title="從連結解析經緯度">
                <font-awesome-icon icon="fa-solid fa-magic" />
              </button>
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="text-[10px] font-bold text-gray-400 block mb-1">緯度 (Lat)</label>
                <input v-model.number="form.lat" type="number" step="0.000001" class="w-full bg-white p-2 rounded-lg outline-none text-xs font-mono" placeholder="33.5902">
              </div>
              <div class="flex-1">
                <label class="text-[10px] font-bold text-gray-400 block mb-1">經度 (Lng)</label>
                <input v-model.number="form.lng" type="number" step="0.000001" class="w-full bg-white p-2 rounded-lg outline-none text-xs font-mono" placeholder="130.4207">
              </div>
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">預算</label>
            <div class="flex gap-2">
              <select v-model="form.currency" class="w-1/4 bg-gray-50 p-3 rounded-xl outline-none text-xs font-bold text-gray-600">
                <option v-for="(_, code) in store.currencies" :key="code" :value="code">{{ code }}</option>
              </select>
              <div class="flex-1 relative">
                <input :value="costDisplay" @input="onCostInput" @focus="onCostFocus" @blur="onCostBlur" type="text" class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-jp-mustard font-mono">
                <div v-if="convertedCost" class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold bg-gray-50 pl-2 pointer-events-none">
                   ≈ {{ convertedCost }}
                </div>
              </div>
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
import { ref, watch, toRaw, nextTick, computed } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import type { Event as TripEvent, Transport } from '../stores/trip.ts'
import TimeInput from './TimeInput.vue'
import { diffMinutes, addMinutes } from '../utils/time.ts'

const props = defineProps<{
  isOpen: boolean
  initialData: TripEvent | null
  isBackup: boolean
  isAdding: boolean
  scrollToTransport?: boolean
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
  transports: [], // Changed to array
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
        
        // Migration for legacy data if not already migrated in store
        let transports = rawData.transports || []
        if (rawData.transport && transports.length === 0) {
            transports = [rawData.transport]
        }
        // Ensure at least one empty transport if category is transport or flight
        if ((rawData.category === 'transport' || rawData.category === 'flight') && transports.length === 0) {
            transports = [{ type: rawData.category === 'flight' ? 'flight' : 'public', line: '', company: '', direction: '', dep: '', cost: 0 }]
        }

        // 合併預設值以確保所有欄位存在 (Merge with defaults to ensure all fields exist)
        form.value = {
          ...rawData,
          cost: rawData.cost || 0,
          currency: rawData.currency || store.settings.currency,
          lat: rawData.lat || undefined,
          transports: transports,
          discounts: rawData.discounts || [],
          stayInfo: rawData.stayInfo || { startDate: '', endDate: '', checkIn: '', checkOut: '', notes: '' },
          linkedGuide: rawData.linkedGuide || undefined
        }
      } catch (e) {
        console.error('Clone error', e)
        if (props.initialData) {
             form.value = { ...toRaw(props.initialData) }
        }
      }
    } else {
      // 預設空表單 (Default empty form)
      form.value = {
        id: '',
        category: 'fun', title: '', location: '', time: '', endTime: '', cost: 0, notes: '', linkedGuide: undefined,
        transports: [{ type: 'public', line: '', company: '', direction: '', dep: '', cost: 0 }],
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
    
    if (props.scrollToTransport) {
      nextTick(() => {
        if (transportSection.value) {
          transportSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }
  }
})

// 時間計算邏輯 (Time Calculation Logic)
const onTimeChange = () => {
  if(form.value.time && form.value.duration) form.value.endTime = addMinutes(form.value.time, form.value.duration)
  else if(form.value.time && form.value.endTime) form.value.duration = diffMinutes(form.value.time, form.value.endTime)
}

const onEndTimeChange = () => {
  if(form.value.time && form.value.endTime) form.value.duration = diffMinutes(form.value.time, form.value.endTime)
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
  // Recalculate total cost from transports if category is transport
  if (dataToSave.category === 'transport' && dataToSave.transports) {
      dataToSave.cost = dataToSave.transports.reduce((sum, t) => sum + (t.cost || 0), 0)
  }
  emit('save', dataToSave)
}

// Transport Management
const addTransportSegment = () => {
    if (!form.value.transports) form.value.transports = []
    form.value.transports.push({ type: 'public', line: '', company: '', direction: '', dep: '', cost: 0 })
}

const removeTransportSegment = (idx: number) => {
    if (form.value.transports) {
        form.value.transports.splice(idx, 1)
    }
}

// Auto-calculation logic for transport segments
const updateArr = (t: Transport) => {
  if (t.dep && t.duration !== undefined && t.duration !== null) {
    t.arr = addMinutes(t.dep, t.duration)
  }
}

const updateDuration = (t: Transport) => {
  if (t.dep && t.arr) {
    const diff = diffMinutes(t.dep, t.arr)
    if (diff >= 0) {
      t.duration = diff
    } else {
      // Handle overnight or invalid input if needed, for now just ignore negative
      // or assume next day? Simple logic: if arr < dep, maybe +24h?
      // For simplicity, let's just calc raw diff. If negative, user might correct it.
      t.duration = diff + (24 * 60) // Assume next day
    }
  }
}

// 班次管理 (Schedule Management) - Helper for specific segment
const addSchedule = (transport: Transport) => {
  if (!transport.schedules) transport.schedules = []
  if (transport.schedules.length >= 5) return
  transport.schedules.push({ dep: '', arr: '', note: '' })
}

const removeSchedule = (transport: Transport, idx: number) => {
  if (transport.schedules) {
    transport.schedules.splice(idx, 1)
  }
}

const getGoogleMapLink = (loc: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`

const parseGoogleMapsUrl = () => {
  const url = form.value.mapUrl
  if (!url) return

  // Pattern 1: @lat,lng
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (atMatch) {
    form.value.lat = parseFloat(atMatch[1])
    form.value.lng = parseFloat(atMatch[2])
    return
  }

  // Pattern 2: search/lat,lng
  const searchMatch = url.match(/search\/(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (searchMatch) {
    form.value.lat = parseFloat(searchMatch[1])
    form.value.lng = parseFloat(searchMatch[2])
    return
  }
  
  // Pattern 3: query=lat,lng
  const queryMatch = url.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (queryMatch) {
    form.value.lat = parseFloat(queryMatch[1])
    form.value.lng = parseFloat(queryMatch[2])
    return
  }
  
  // Pattern 4: 3d/4d params (e.g. !3d35.681236!4d139.767125)
  const pbMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (pbMatch) {
    form.value.lat = parseFloat(pbMatch[1])
    form.value.lng = parseFloat(pbMatch[2])
    return
  }

  alert('無法從連結中解析出經緯度，請確認連結格式 (需包含 @lat,lng 或 !3d...!4d...)')
}

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
const isEditingCost = ref(false)

const convertedCost = computed(() => {
  if (!form.value.cost || form.value.currency === store.settings.currency) return null
  
  const inputRate = store.currencies[form.value.currency || store.settings.currency]?.rate || 1
  const targetRate = store.currencies[store.settings.currency]?.rate || 1
  
  // Convert input to JPY then to target
  // Rate is relative to JPY (1 JPY = rate * Currency) -> No, wait.
  // trip.ts: 'TWD': { rate: 0.22 } // 1 JPY = 0.22 TWD.
  // So 1 TWD = 1/0.22 JPY.
  // Amount in JPY = Amount / Rate.
  
  const valInJpy = form.value.cost / inputRate
  const valInTarget = valInJpy * targetRate
  
  return formatCurrency(Math.round(valInTarget), store.settings.currency)
})

// 同步表單 -> 顯示 (Sync form -> display)
watch(() => form.value.cost, (newVal) => {
  if (!isEditingCost.value) costDisplay.value = formatCurrency(newVal, form.value.currency)
})
watch(() => form.value.currency, () => {
  if (!isEditingCost.value) costDisplay.value = formatCurrency(form.value.cost, form.value.currency)
})

// Update total cost when transport costs change
watch(() => form.value.transports, (newTransports) => {
    if (form.value.category === 'transport' && newTransports) {
        const total = newTransports.reduce((sum, t) => sum + (t.cost || 0), 0)
        form.value.cost = total
    }
}, { deep: true })

// 處理函式 (Handlers)
const onCostFocus = () => {
  isEditingCost.value = true
  costDisplay.value = form.value.cost?.toString() || ''
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

const transportSection = ref<HTMLElement | null>(null)
</script>
