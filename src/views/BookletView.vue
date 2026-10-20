<template>
  <div class="h-full flex flex-col bg-gray-50" :style="accentStyleVars">
    <!-- Header -->
    <div class="no-print bg-white px-6 pt-6 pb-4 shadow-sm z-10 flex items-center gap-3">
      <button
        @click="goBack"
        class="w-9 h-9 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="返回"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-jp-dark mb-1">旅遊小冊</h1>
        <p class="text-xs text-gray-400">一鍵整理目前行程資料，產生可列印／另存 PDF 的紙本小冊</p>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto pb-24">
      <!-- Customize Panel -->
      <div class="no-print bg-white border-b border-gray-100 px-6 py-5 space-y-5" :style="accentStyleVars">
        <!-- Theme / Layout Picker -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">小冊版型（下方預覽區即時套用，可先預覽再列印）</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="t in themeOptions"
              :key="t.key"
              type="button"
              @click="theme = t.key"
              class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all"
              :class="theme === t.key ? 'booklet-accent-border booklet-accent-bg-soft' : 'border-gray-200 bg-gray-50 hover:border-gray-300'"
            >
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" :class="t.swatchBg">
                <font-awesome-icon :icon="t.icon" :style="{ color: ACCENT_COLORS[accent].hex }" />
              </div>
              <span class="text-xs font-bold text-jp-dark leading-tight">{{ t.label }}</span>
              <span class="text-[10px] text-gray-400 leading-tight hidden sm:block">{{ t.desc }}</span>
            </button>
          </div>
        </div>

        <!-- Accent Color Swatches -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">主題色票</label>
          <div class="flex gap-3">
            <button
              v-for="c in accentOptions"
              :key="c.key"
              type="button"
              @click="accent = c.key"
              class="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110"
              :style="{ backgroundColor: c.hex, borderColor: accent === c.key ? '#484848' : 'transparent' }"
              :aria-label="`切換為${c.label}`"
              :title="c.label"
            >
              <font-awesome-icon v-if="accent === c.key" icon="fa-solid fa-check" class="text-white text-xs" />
            </button>
          </div>
        </div>

        <!-- Mode Toggle -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">產生模式</label>
          <div class="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
              @click="setMode('auto')"
              class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors"
              :class="mode === 'auto' ? 'booklet-accent-bg text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              自動（依現有資料）
            </button>
            <button
              @click="setMode('custom')"
              class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors"
              :class="mode === 'custom' ? 'booklet-accent-bg text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              自訂章節
            </button>
          </div>
        </div>

        <!-- Section Checkboxes -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">包含章節</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="key in sectionKeys"
              :key="key"
              type="button"
              @click="toggleSection(key)"
              :disabled="mode === 'auto' || !dataAvailable[key]"
              class="flex items-center gap-2 p-3 rounded-xl border text-left transition-colors"
              :class="selected[key] ? 'booklet-accent-bg-soft booklet-accent-border text-jp-dark' : 'bg-gray-50 border-gray-200 text-gray-400'"
              :style="{ cursor: (mode === 'auto' || !dataAvailable[key]) ? 'not-allowed' : 'pointer', opacity: !dataAvailable[key] ? 0.5 : 1 }"
            >
              <span
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                :class="selected[key] ? 'booklet-accent-bg booklet-accent-border text-white' : 'border-gray-300 text-transparent'"
              >
                <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
              </span>
              <span class="flex-1 text-xs font-bold leading-tight">
                {{ sectionMeta[key].label }}
                <span v-if="!dataAvailable[key]" class="block font-normal text-[10px] text-gray-400">
                  {{ key === 'budget' && hideSensitive ? '隱私模式已停用' : '無資料' }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <!-- Guide Placement Toggle -->
        <div v-if="dataAvailable.guides">
          <label class="block text-xs font-bold text-gray-500 mb-2">景點攻略呈現位置</label>
          <div class="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
              @click="guidePlacement = 'section'"
              class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors"
              :class="guidePlacement === 'section' ? 'booklet-accent-bg text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              獨立章節（目前位置）
            </button>
            <button
              @click="guidePlacement = 'per-day'"
              class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors"
              :class="guidePlacement === 'per-day' ? 'booklet-accent-bg text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              每日行程最後
            </button>
          </div>
          <p class="text-[10px] text-gray-400 mt-1.5">
            「每日行程最後」會將已加入行程的景點攻略，顯示在對應那一天的行程之後；尚未排入行程的攻略仍會列在獨立章節中。
          </p>
        </div>

        <!-- Privacy Toggle -->
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div>
            <div class="text-xs font-bold text-gray-700">隱藏金額與個人筆記</div>
            <div class="text-[10px] text-gray-400 mt-0.5">適合分享給非旅伴的人，開啟後會停用「預算總覽」章節</div>
          </div>
          <button
            @click="hideSensitive = !hideSensitive"
            class="w-11 h-6 rounded-full flex items-center transition-colors flex-shrink-0 px-0.5"
            :class="hideSensitive ? 'booklet-accent-bg justify-end' : 'bg-gray-300 justify-start'"
            aria-label="切換隱私模式"
          >
            <span class="w-5 h-5 rounded-full bg-white shadow-sm"></span>
          </button>
        </div>

        <!-- Generate Button -->
        <button
          @click="handlePrint"
          :disabled="!anySelected"
          class="w-full py-3 rounded-xl bg-jp-dark text-white font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <font-awesome-icon icon="fa-solid fa-print" /> 產生／列印小冊
        </button>
        <p class="text-[10px] text-gray-400 text-center -mt-2">
          列印對話框開啟後，將「目的地」改選為「另存為 PDF」即可下載小冊檔案
        </p>
        <p v-if="theme !== 'minimal'" class="text-[10px] text-amber-600 text-center -mt-2">
          <font-awesome-icon icon="fa-solid fa-circle-info" class="mr-1" />此版型含底色／插圖裝飾，列印時請勾選「背景圖形 (Background graphics)」選項才能完整呈現
        </p>
      </div>

      <!-- Preview / Print Area -->
      <div class="print-area max-w-[820px] mx-auto my-6 shadow-sm rounded-xl overflow-hidden text-jp-dark text-[15px] leading-relaxed" :class="`theme-${theme}`">
        <div v-if="!tripHasAnyData" class="bg-white p-10 text-center text-gray-400 text-base">
          <font-awesome-icon icon="fa-solid fa-book-open" class="text-3xl mb-3 block" />
          目前沒有可用的行程資料，請先到行程、攻略、記帳或清單頁面新增內容後再產生小冊。
        </div>
        <div v-else-if="!anySelected" class="bg-white p-10 text-center text-gray-400 text-base">
          目前未選擇任何章節，請至少勾選一項內容。
        </div>
        <template v-else>
          <!-- Cover -->
          <section v-if="selected.cover" class="print-section relative">
            <!-- 簡約亮白：置中標題 + 大型淡色插圖點綴 -->
            <div v-if="theme === 'minimal'" class="relative overflow-hidden p-12 text-center border-b border-dashed border-gray-200">
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="absolute -top-6 -right-8 text-[10rem] booklet-accent-watermark rotate-12 pointer-events-none" />
              <div class="text-xs tracking-[0.35em] text-jp-gray uppercase mb-4">Travel Booklet</div>
              <h1 class="text-4xl font-black text-jp-dark mb-3">{{ store.title || '我的旅程' }}</h1>
              <div class="w-16 h-0.5 booklet-accent-bg mx-auto mb-4"></div>
              <p class="text-base text-gray-500 mb-5">{{ dateRangeLabel }}（共 {{ store.days.length }} 天）</p>
              <div class="flex flex-wrap justify-center gap-2 text-sm text-gray-600">
                <span v-for="(traveler, i) in store.travelers" :key="i" class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
                  <font-awesome-icon icon="fa-solid fa-user" class="mr-1.5 text-gray-400" />{{ traveler }}
                </span>
              </div>
            </div>

            <!-- 雜誌手冊：色塊橫幅 + 天數徽章 -->
            <div v-else-if="theme === 'magazine'">
              <div class="bg-jp-dark text-white px-10 pt-14 pb-20 relative overflow-hidden">
                <font-awesome-icon icon="fa-solid fa-compass" class="absolute top-6 right-8 text-6xl text-white/10" />
                <div class="text-xs tracking-[0.4em] booklet-accent-text uppercase mb-4 font-bold">Travel Booklet · Issue</div>
                <h1 class="text-5xl font-black leading-tight mb-4">{{ store.title || '我的旅程' }}</h1>
                <p class="text-base text-white/70">{{ dateRangeLabel }}</p>
              </div>
              <div class="flex items-end justify-between px-10 -mt-10 relative pb-8">
                <div class="booklet-accent-bg text-white rounded-2xl shadow-lg px-6 py-4 text-center">
                  <div class="text-3xl font-black leading-none">{{ store.days.length }}</div>
                  <div class="text-[11px] font-bold tracking-widest uppercase mt-1">Days</div>
                </div>
                <div class="flex flex-wrap justify-end gap-2 text-sm text-jp-dark pb-1">
                  <span v-for="(traveler, i) in store.travelers" :key="i" class="px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                    <font-awesome-icon icon="fa-solid fa-user" class="mr-1.5 booklet-accent-text" />{{ traveler }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 手帳旅誌：紙感底紋 + washi tape + 護照章風格 -->
            <div v-else class="relative bg-pattern-seigaiha p-10 text-center overflow-hidden">
              <div class="booklet-washi-tape booklet-washi-tape-left"></div>
              <div class="booklet-washi-tape booklet-washi-tape-right"></div>
              <div class="inline-block border-2 border-dashed booklet-accent-border-60 rounded-xl px-8 py-6 bg-white/80 -rotate-1 shadow-sm">
                <div class="text-xs tracking-[0.3em] booklet-accent-text uppercase mb-2 font-bold">
                  <font-awesome-icon icon="fa-solid fa-stamp" class="mr-1" />Travel Journal
                </div>
                <h1 class="text-4xl font-black text-jp-dark mb-2">{{ store.title || '我的旅程' }}</h1>
                <p class="text-base text-gray-500">{{ dateRangeLabel }}（共 {{ store.days.length }} 天）</p>
              </div>
              <div class="flex flex-wrap justify-center gap-2 text-sm text-gray-700 mt-6">
                <span v-for="(traveler, i) in store.travelers" :key="i" class="px-3 py-1.5 bg-white border-2 border-jp-dark/10 rounded-full shadow-sm">
                  <font-awesome-icon icon="fa-solid fa-suitcase-rolling" class="mr-1.5 booklet-accent-text" />{{ traveler }}
                </span>
              </div>
            </div>
          </section>

          <!-- Itinerary -->
          <section v-if="selected.itinerary" class="print-section p-8">
            <div :class="sectionHeadWrapperClass">
              <span :class="sectionIconWrapperClass"><font-awesome-icon icon="fa-solid fa-calendar-days" /></span>
              <h2 :class="sectionTitleClass">每日行程</h2>
            </div>
            <div v-for="(day, dIdx) in store.days" :key="dIdx" class="print-day mb-8 last:mb-0">
              <!-- 日期標頭：依版型呈現為橫幅徽章 / 護照郵戳 / 簡約底線 -->
              <div v-if="theme === 'magazine'" class="bg-jp-dark text-white rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                <span class="text-3xl font-black booklet-accent-text leading-none">{{ dIdx + 1 }}</span>
                <div class="flex-1">
                  <div class="text-[10px] uppercase tracking-widest text-white/60">Day</div>
                  <div class="font-bold text-base">{{ day.dateStr }}</div>
                </div>
                <span class="text-sm font-mono booklet-accent-text">{{ dayTotalLabel(day) }}</span>
              </div>
              <div v-else-if="theme === 'journal'" class="flex items-center gap-3 mb-4">
                <div class="w-14 h-14 rounded-full border-2 border-dashed booklet-accent-border-70 booklet-accent-text flex flex-col items-center justify-center flex-shrink-0 -rotate-6">
                  <span class="text-[9px] font-bold uppercase leading-none">Day</span>
                  <span class="text-xl font-black leading-none">{{ dIdx + 1 }}</span>
                </div>
                <h3 class="font-bold text-base text-jp-dark flex-1">{{ day.dateStr }}</h3>
                <span class="text-sm font-mono text-gray-400">{{ dayTotalLabel(day) }}</span>
              </div>
              <div v-else class="flex items-baseline justify-between border-b border-gray-200 pb-2 mb-4">
                <h3 class="font-bold text-lg text-jp-dark">Day {{ dIdx + 1 }} · {{ day.dateStr }}</h3>
                <span class="text-sm font-mono text-gray-400">{{ dayTotalLabel(day) }}</span>
              </div>

              <div v-if="!(day.events || []).length" class="text-sm text-gray-400 pl-2">尚未安排行程</div>
              <div v-for="(event, eIdx) in day.events" :key="eIdx" class="mb-3">
                <div v-if="transportSummary(event.transports)" class="text-xs text-gray-400 pl-2 mb-1.5">
                  <font-awesome-icon icon="fa-solid fa-route" class="mr-1" />{{ transportSummary(event.transports) }}
                </div>
                <div class="flex gap-3 text-sm">
                  <div class="w-14 flex-shrink-0 font-mono font-bold text-gray-500">{{ event.time }}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">{{ categoryLabel(event.category) }}</span>
                      <span class="font-bold text-jp-dark text-base">{{ event.title }}</span>
                      <span v-if="eventCostLabel(event)" class="ml-auto font-mono text-gray-500 text-sm">{{ eventCostLabel(event) }}</span>
                    </div>
                    <div v-if="event.location" class="text-gray-400 text-sm mt-0.5">
                      <font-awesome-icon icon="fa-solid fa-location-dot" class="mr-1" />{{ event.location }}
                    </div>
                    <div v-if="!hideSensitive && event.notes" class="text-gray-500 text-sm mt-1 bg-gray-50 rounded p-2">
                      {{ event.notes }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 景點攻略（每日行程最後）：僅於 guidePlacement === 'per-day' 時顯示該天已連結的攻略 -->
              <div v-if="selected.guides && guidePlacement === 'per-day' && guidesByDay[dIdx]?.length" class="mt-4 pt-3 border-t border-dashed border-gray-200">
                <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <font-awesome-icon icon="fa-solid fa-book-open" class="booklet-accent-text" />景點攻略
                </h4>
                <div :class="guideGridClass">
                  <BookletGuideCard
                    v-for="(entry, gi) in guidesByDay[dIdx]"
                    :key="gi"
                    :title="entry.key"
                    :guide="entry.guide"
                    :theme="theme"
                    :card-class="guideCardClass"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Guides -->
          <section v-if="selected.guides && guidesToShowInSection.length" class="print-section p-8">
            <div :class="sectionHeadWrapperClass">
              <span :class="sectionIconWrapperClass"><font-awesome-icon icon="fa-solid fa-book-open" /></span>
              <h2 :class="sectionTitleClass">{{ guideSectionTitle }}</h2>
            </div>
            <div v-for="group in guidesToShowInSection" :key="group.status" class="mb-6 last:mb-0">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{{ group.label }}</h3>
              <div :class="guideGridClass">
                <BookletGuideCard
                  v-for="(entry, i) in group.items"
                  :key="i"
                  :title="entry.key"
                  :guide="entry.guide"
                  :theme="theme"
                  :card-class="guideCardClass"
                />
              </div>
            </div>
          </section>

          <!-- Budget -->
          <section v-if="selected.budget" class="print-section p-8">
            <div :class="sectionHeadWrapperClass">
              <span :class="sectionIconWrapperClass"><font-awesome-icon icon="fa-solid fa-chart-pie" /></span>
              <h2 :class="sectionTitleClass">預算總覽</h2>
            </div>
            <div class="flex items-baseline justify-between mb-5">
              <span class="text-sm text-gray-500">總花費</span>
              <span class="text-2xl font-bold text-jp-accent-green font-mono">{{ store.currentCurrency.symbol }}{{ totalExpense.toLocaleString() }}</span>
            </div>
            <div class="space-y-3 mb-6">
              <div v-for="cat in budgetByCategory" :key="cat.id">
                <div class="flex items-baseline justify-between text-sm mb-1">
                  <span class="font-bold text-jp-dark">{{ cat.label }}</span>
                  <span class="font-mono text-gray-500">{{ store.currentCurrency.symbol }}{{ cat.amount.toLocaleString() }} <span class="text-gray-400">· {{ cat.percent }}%</span></span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full booklet-accent-bg rounded-full" :style="{ width: cat.percent + '%' }"></div>
                </div>
              </div>
            </div>
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">結算建議</h3>
            <div v-if="settlement.transfers.length" class="space-y-2">
              <div v-for="(t, i) in settlement.transfers" :key="i" class="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                <span><span class="font-bold">{{ t.from }}</span> → <span class="font-bold">{{ t.to }}</span></span>
                <span class="font-mono font-bold">{{ store.currentCurrency.symbol }}{{ t.amount.toLocaleString() }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400">目前沒有需要結算的款項</div>
          </section>

          <!-- Checklist -->
          <section v-if="selected.checklist" class="print-section p-8">
            <div :class="sectionHeadWrapperClass">
              <span :class="sectionIconWrapperClass"><font-awesome-icon icon="fa-solid fa-list-check" /></span>
              <h2 :class="sectionTitleClass">準備清單</h2>
            </div>
            <div :class="checklistGridClass">
              <div v-for="category in store.checklists" :key="category.id">
                <h3 v-if="category.items.length" class="text-sm font-bold text-gray-500 mb-2">{{ category.name }}</h3>
                <ul v-if="category.items.length" class="space-y-1.5">
                  <li v-for="item in category.items" :key="item.id" class="flex items-center gap-2 text-sm">
                    <font-awesome-icon :icon="item.checked ? 'fa-solid fa-square-check' : 'fa-regular fa-square'" :class="item.checked ? 'booklet-accent-text' : 'text-gray-300'" />
                    <span :class="item.checked ? 'text-gray-400 line-through' : 'text-jp-dark'">{{ item.text }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Passes -->
          <section v-if="selected.passes" class="print-section p-8">
            <div :class="sectionHeadWrapperClass">
              <span :class="sectionIconWrapperClass"><font-awesome-icon icon="fa-solid fa-ticket" /></span>
              <h2 :class="sectionTitleClass">交通票券</h2>
            </div>
            <div class="grid grid-cols-2 gap-5">
              <div v-for="pass in store.passes" :key="pass.id" :class="passCardClass">
                <img v-if="pass.imageUrl" :src="pass.imageUrl" :alt="pass.name" class="h-24 w-full object-contain mb-2" />
                <div class="text-sm font-bold text-jp-dark">{{ pass.name }}</div>
              </div>
            </div>
          </section>

          <footer class="print-section px-8 py-5 text-center text-xs text-gray-300 border-t border-gray-100">
            由 Easy Trip 產生 · {{ generatedAt }}
          </footer>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/trip.ts'
import { calculateSettlement } from '../utils/settlementUtil'
import BookletGuideCard from '../components/BookletGuideCard.vue'
import type { Day, Event, Guide, Transport } from '../stores/trip.ts'

const store = useTripStore()
const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

// --- Section definitions ---------------------------------------------------
type SectionKey = 'cover' | 'itinerary' | 'guides' | 'budget' | 'checklist' | 'passes'

const sectionMeta: Record<SectionKey, { label: string }> = {
  cover: { label: '封面與旅伴資訊' },
  itinerary: { label: '每日行程（含花費/備註）' },
  guides: { label: '景點攻略' },
  budget: { label: '預算總覽（分類金額/結算建議）' },
  checklist: { label: '準備清單' },
  passes: { label: '交通票券' },
}
const sectionKeys = Object.keys(sectionMeta) as SectionKey[]

const mode = ref<'auto' | 'custom'>('auto')
const hideSensitive = ref(false)

// --- Theme / Layout --------------------------------------------------------
type ThemeKey = 'minimal' | 'magazine' | 'journal'
const theme = ref<ThemeKey>('journal')
const themeOptions: { key: ThemeKey; label: string; desc: string; icon: string; swatchBg: string }[] = [
  { key: 'minimal', label: '簡約亮白', desc: '乾淨俐落，適合大量文字內容', icon: 'fa-solid fa-feather', swatchBg: 'bg-white border border-gray-200' },
  { key: 'magazine', label: '雜誌手冊', desc: '色塊與大標題，閱讀感強烈', icon: 'fa-solid fa-bolt', swatchBg: 'bg-jp-dark' },
  { key: 'journal', label: '手帳旅誌', desc: '紙感底紋＋貼紙郵戳風格', icon: 'fa-solid fa-stamp', swatchBg: 'booklet-accent-bg-soft' },
]

// --- 主題色票 ---------------------------------------------------------------
// 三種版型共用同一組可切換色票（而非固定的芥末黃），透過 CSS 變數套用到整個預覽區，
// 讓裝飾元素（washi tape、郵戳、強調文字、長條圖等）都能跟著使用者選擇的顏色變化。
type AccentKey = 'mustard' | 'red' | 'blue' | 'green' | 'indigo'
const ACCENT_COLORS: Record<AccentKey, { label: string; hex: string; soft: string }> = {
  mustard: { label: '芥末黃', hex: '#E6B422', soft: '#FDF3D9' },
  red: { label: '珊瑚紅', hex: '#D64045', soft: '#FBE4E4' },
  blue: { label: '海洋藍', hex: '#5B84B1', soft: '#E4EDF5' },
  green: { label: '抹茶綠', hex: '#8FA177', soft: '#EEF2E7' },
  indigo: { label: '靛藍紫', hex: '#6667AB', soft: '#EAEAF4' },
}
const accentOptions = (Object.keys(ACCENT_COLORS) as AccentKey[]).map(key => ({ key, ...ACCENT_COLORS[key] }))
const accent = ref<AccentKey>('mustard')

const hexToRgbList = (hex: string) => {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`
}
// 透過 CSS 變數把色票套用到整個客製化面板與預覽區（含子元件 BookletGuideCard.vue）
const accentStyleVars = computed(() => ({
  '--booklet-accent': ACCENT_COLORS[accent.value].hex,
  '--booklet-accent-rgb': hexToRgbList(ACCENT_COLORS[accent.value].hex),
  '--booklet-accent-soft': ACCENT_COLORS[accent.value].soft,
}))

// 依版型決定的通用樣式（章節標題、卡片、網格排版），讓三種版型呈現不同的視覺節奏，
// 而非單純逐章節從上到下平鋪文字。
const sectionHeadWrapperClass = computed(() => {
  switch (theme.value) {
    case 'magazine': return 'flex items-center gap-3 mb-6 pb-3 border-b-4 border-jp-dark'
    case 'journal': return 'flex items-center gap-3 mb-6'
    default: return 'flex items-center gap-3 mb-5'
  }
})
const sectionIconWrapperClass = computed(() => {
  switch (theme.value) {
    case 'magazine': return 'w-11 h-11 rounded-lg bg-jp-dark booklet-accent-text flex items-center justify-center text-lg flex-shrink-0'
    case 'journal': return 'w-11 h-11 rounded-full border-2 border-dashed booklet-accent-border-60 booklet-accent-text flex items-center justify-center text-lg flex-shrink-0 -rotate-6'
    default: return 'w-9 h-9 flex items-center justify-center booklet-accent-text text-xl flex-shrink-0'
  }
})
const sectionTitleClass = computed(() => theme.value === 'minimal' ? 'text-xl font-black text-jp-dark' : 'text-2xl font-black text-jp-dark')

const guideGridClass = computed(() => theme.value === 'minimal' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4')
const guideCardClass = computed(() => {
  switch (theme.value) {
    case 'magazine': return 'rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white'
    case 'journal': return 'booklet-postcard rounded-lg border-2 border-dashed border-gray-300 bg-white/90 p-4'
    default: return 'border border-gray-200 rounded-lg p-4'
  }
})
const checklistGridClass = computed(() => theme.value === 'minimal' ? 'grid grid-cols-1 gap-5' : 'grid grid-cols-1 sm:grid-cols-2 gap-5')
const passCardClass = computed(() => {
  switch (theme.value) {
    case 'magazine': return 'rounded-xl border border-gray-200 shadow-sm p-4 text-center bg-white'
    case 'journal': return 'booklet-polaroid text-center'
    default: return 'border border-gray-200 rounded-lg p-4 text-center'
  }
})

// --- Data availability -------------------------------------------------
const hasItinerary = computed(() => store.days.some(d => (d.events || []).length > 0))
const hasGuides = computed(() => Object.keys(store.attractionGuides).length > 0)
const hasChecklist = computed(() => store.checklists.some(c => c.items.length > 0))
const hasPasses = computed(() => store.passes.length > 0)
const hasBudget = computed(() => store.expenses.length > 0 && !hideSensitive.value)

const tripHasAnyData = computed(() =>
  hasItinerary.value || hasGuides.value || store.expenses.length > 0 || hasChecklist.value || hasPasses.value
)

const dataAvailable = computed<Record<SectionKey, boolean>>(() => ({
  cover: true,
  itinerary: hasItinerary.value,
  guides: hasGuides.value,
  budget: hasBudget.value,
  checklist: hasChecklist.value,
  passes: hasPasses.value,
}))

const autoSelected = computed<Record<SectionKey, boolean>>(() => ({ ...dataAvailable.value }))

// 自訂模式的使用者選擇，第一次切換到自訂模式時會以自動模式的結果作為初始值
const customSelected = reactive<Record<SectionKey, boolean>>({ ...autoSelected.value })
let customInitialized = false

const selected = computed<Record<SectionKey, boolean>>(() => {
  const source = mode.value === 'auto' ? autoSelected.value : customSelected
  const result = {} as Record<SectionKey, boolean>
  sectionKeys.forEach(key => {
    result[key] = source[key] && dataAvailable.value[key]
  })
  return result
})

const anySelected = computed(() => sectionKeys.some(key => selected.value[key]))

const setMode = (next: 'auto' | 'custom') => {
  if (next === 'custom' && !customInitialized) {
    sectionKeys.forEach(key => { customSelected[key] = autoSelected.value[key] })
    customInitialized = true
  }
  mode.value = next
}

const toggleSection = (key: SectionKey) => {
  if (mode.value !== 'custom' || !dataAvailable.value[key]) return
  customSelected[key] = !customSelected[key]
}

// --- Cover -----------------------------------------------------------
const dateRangeLabel = computed(() => {
  if (!store.days.length) return store.startDate
  const first = store.days[0]?.dateStr
  const last = store.days[store.days.length - 1]?.dateStr
  return first === last ? first : `${first} - ${last}`
})

// --- Itinerary ---------------------------------------------------------
const categoryLabel = (id: string) => store.categories.find(c => c.id === id)?.name || id

const TRANSPORT_LABELS: Record<Transport['type'], string> = {
  walk: '步行',
  public: '公車/地鐵',
  express: '特急/新幹線',
  ferry: '船',
  taxi: '計程車',
  drive: '自駕',
  flight: '航班',
}
const transportSummary = (transports?: Transport[]) => {
  if (!transports?.length) return ''
  return transports.map(t => TRANSPORT_LABELS[t.type] || t.type).join(' → ')
}

const eventCostLabel = (event: Event) => {
  if (hideSensitive.value) return ''
  if (!event.cost) return ''
  const symbol = store.currencies[event.currency || store.settings.currency]?.symbol || ''
  return `${symbol}${event.cost.toLocaleString()}`
}

const dayTotalLabel = (day: Day) => {
  if (hideSensitive.value) return ''
  const globalRate = store.currentCurrency.rate
  const total = (day.events || []).reduce((sum, item) => {
    const cost = item.cost || 0
    const itemRate = store.currencies[item.currency || 'JPY']?.rate || 1
    return sum + (cost / itemRate * globalRate)
  }, 0)
  if (!total) return ''
  return `${store.currentCurrency.symbol}${Math.round(total).toLocaleString()}`
}

// --- Guides --------------------------------------------------------------
const GUIDE_STATUS_ORDER: Guide['status'][] = ['planned', 'want_to_go', 'visited']
const GUIDE_STATUS_LABEL: Record<Guide['status'], string> = {
  want_to_go: '想去',
  planned: '已排程',
  visited: '已去過',
}
const buildGroupedGuides = (entries: [string, Guide][]) => {
  return GUIDE_STATUS_ORDER
    .map(status => ({
      status,
      label: GUIDE_STATUS_LABEL[status],
      items: entries.filter(([, guide]) => guide.status === status).map(([key, guide]) => ({ key, guide })),
    }))
    .filter(group => group.items.length > 0)
}
const groupedGuides = computed(() => buildGroupedGuides(Object.entries(store.attractionGuides)))

// --- 景點攻略呈現位置：獨立章節 or 每日行程最後 ------------------------------
// 'section'：維持目前位置，景點攻略集中在獨立章節。
// 'per-day'：已透過 Event.linkedGuide 掛在某一天行程的攻略，改顯示在該天行程最後；
//            尚未掛在任何行程的攻略，仍保留在獨立章節中（避免資訊遺漏）。
const guidePlacement = ref<'section' | 'per-day'>('section')

const assignedGuideKeys = computed(() => {
  const set = new Set<string>()
  store.days.forEach(day => {
    ;(day.events || []).forEach(e => {
      if (e.linkedGuide && store.attractionGuides[e.linkedGuide]) set.add(e.linkedGuide)
    })
  })
  return set
})

// 每一天「已排入行程」的景點攻略清單（依 Event.linkedGuide 比對，同一天重複出現僅列一次）
const guidesByDay = computed(() => {
  return store.days.map(day => {
    const seen = new Set<string>()
    const items: { key: string; guide: Guide }[] = []
    ;(day.events || []).forEach(e => {
      const key = e.linkedGuide
      if (key && store.attractionGuides[key] && !seen.has(key)) {
        seen.add(key)
        items.push({ key, guide: store.attractionGuides[key] })
      }
    })
    return items
  })
})

// 尚未掛在任何一天行程上的景點攻略（「每日行程最後」模式下，獨立章節只保留這些）
const unassignedGroupedGuides = computed(() => {
  const assigned = assignedGuideKeys.value
  return buildGroupedGuides(Object.entries(store.attractionGuides).filter(([key]) => !assigned.has(key)))
})

const guidesToShowInSection = computed(() => guidePlacement.value === 'per-day' ? unassignedGroupedGuides.value : groupedGuides.value)
const guideSectionTitle = computed(() => guidePlacement.value === 'per-day' ? '景點攻略（尚未排入行程）' : '景點攻略')

// --- Budget --------------------------------------------------------------
const totalExpense = computed(() => store.expenses.reduce((sum, e) => sum + (e.amount || 0), 0))
const budgetByCategory = computed(() => {
  const totals: Record<string, number> = {}
  store.expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount })
  const total = totalExpense.value || 1
  return Object.entries(totals)
    .map(([id, amount]) => ({ id, label: categoryLabel(id), amount, percent: Math.round((amount / total) * 100) }))
    .sort((a, b) => b.amount - a.amount)
})
const settlement = computed(() => calculateSettlement(store.expenses, store.travelers))

// --- Footer / Print ------------------------------------------------------
const generatedAt = computed(() => new Date().toLocaleDateString('zh-TW'))

const handlePrint = () => {
  if (!anySelected.value) return
  window.print()
}
</script>

