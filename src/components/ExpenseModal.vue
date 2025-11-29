<template>
  <transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      <div class="absolute inset-0 bg-black/30 pointer-events-auto transition-opacity" @click="emit('close')"></div>
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pointer-events-auto shadow-2xl modal-body flex flex-col relative z-50">
        
        <div class="flex justify-between items-center mb-6 shrink-0">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-jp-accent-green text-white flex items-center justify-center"><font-awesome-icon icon="fa-solid fa-yen-sign" /></span>
            {{ initialData ? '編輯支出' : '新增支出' }}
          </h3>
          <div class="flex gap-2">
            <button v-if="initialData" @click="emit('delete')" class="text-gray-400 hover:text-red-500"><font-awesome-icon icon="fa-solid fa-trash" /></button>
            <button @click="emit('close')" class="text-gray-400 hover:text-gray-600"><font-awesome-icon icon="fa-solid fa-times" /></button>
          </div>
        </div>

        <div class="space-y-5 overflow-y-auto flex-1 pb-6 px-1 hide-scrollbar">
          <!-- Amount -->
          <div class="relative">
            <label class="text-xs font-bold text-gray-500 block mb-1">金額</label>
            <div class="flex gap-2">
              <select v-model="form.currency" class="w-1/3 bg-gray-50 p-4 rounded-2xl outline-none text-lg font-bold text-gray-600 text-center">
                <option v-for="(_, code) in store.currencies" :key="code" :value="code">{{ code }}</option>
              </select>
              <input v-model.number="form.amount" @focus="($event.target as HTMLInputElement).select()" type="number" class="w-2/3 bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-jp-accent-green text-3xl font-bold text-jp-dark font-mono text-center placeholder-gray-300" placeholder="0">
            </div>
          </div>

          <!-- Title & Category -->
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="text-xs font-bold text-gray-500 block mb-1">項目名稱</label>
              <input v-model="form.title" class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-jp-accent-green" placeholder="e.g. 拉麵">
            </div>
            <div class="w-1/3">
              <label class="text-xs font-bold text-gray-500 block mb-1">類別</label>
              <select v-model="form.category" class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-jp-accent-green text-sm">
                <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <!-- Payer -->
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-2">誰付錢？</label>
            <div class="flex gap-2">
              <button v-for="p in store.travelers" :key="p" @click="form.payer = p" class="flex-1 py-2 rounded-xl border transition-all font-bold text-sm" :class="form.payer === p ? 'bg-jp-accent-green text-white border-jp-accent-green' : 'bg-white text-gray-500 border-gray-200'">
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Split Method -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="text-xs font-bold text-gray-500 block mb-2">分帳方式</label>
            <div class="flex bg-white rounded-lg p-1 border border-gray-200 mb-3">
              <button @click="form.splitMethod = 'average'" class="flex-1 py-1.5 rounded-md text-xs font-bold transition-all" :class="form.splitMethod === 'average' ? 'bg-jp-accent-green text-white shadow-sm' : 'text-gray-400'">均分</button>
              <button @click="form.splitMethod = 'custom'" class="flex-1 py-1.5 rounded-md text-xs font-bold transition-all" :class="form.splitMethod === 'custom' ? 'bg-jp-accent-green text-white shadow-sm' : 'text-gray-400'">自訂</button>
            </div>

            <div v-if="form.splitMethod === 'average'">
              <div class="text-xs text-gray-400 mb-2">選擇分攤人：</div>
              <div class="flex flex-wrap gap-2">
                <button v-for="p in store.travelers" :key="p" @click="toggleInvolved(p)" class="px-3 py-1.5 rounded-full border text-xs font-bold transition-all" :class="form.involved.includes(p) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-300 border-gray-100'">
                  {{ p }}
                </button>
              </div>
            </div>

            <div v-else class="space-y-2">
              <div v-for="p in store.travelers" :key="p" class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-600 w-12">{{ p }}</span>
                <input v-model.number="form.customShares[p]" @input="onShareChange(p)" type="number" class="flex-1 bg-white p-2 rounded-lg border border-gray-200 text-xs font-mono" placeholder="金額">
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button @click="emit('close')" class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">取消</button>
          <button @click="save" class="flex-[2] py-3 rounded-xl bg-jp-accent-green text-white font-bold shadow-lg shadow-green-500/30">儲存支出</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import type { Expense } from '../stores/trip.ts'

const props = defineProps<{
  isOpen: boolean
  initialData: Expense | null
}>()

const emit = defineEmits(['close', 'save', 'delete'])

const store = useTripStore()
const form = ref<Expense>({
  id: '',
  title: '',
  amount: 0,
  currency: 'JPY',
  category: 'food',
  payer: '',
  splitMethod: 'average',
  involved: [],
  customShares: {},
  date: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      form.value = JSON.parse(JSON.stringify(props.initialData))
    } else {
      form.value = {
        id: Date.now().toString(),
        title: '', 
        amount: 0, 
        currency: store.settings.currency, 
        category: 'food', 
        payer: store.travelers[0],
        splitMethod: 'average', 
        involved: [...store.travelers], 
        customShares: {},
        date: store.days[0].dateStr.split(' ')[0]
      }
      // 初始化自訂分攤 (Init custom shares)
      store.travelers.forEach(t => form.value.customShares[t] = 0)
    }
  }
})



const fixedTravelers = ref<Set<string>>(new Set())

const initCustomShares = () => {
  const total = form.value.amount
  const count = store.travelers.length
  if (count === 0) return
  
  const avg = Math.floor(total / count)
  const remainder = total % count
  
  store.travelers.forEach((t, i) => {
    form.value.customShares[t] = avg + (i < remainder ? 1 : 0)
  })
  fixedTravelers.value.clear()
}

const recalculateShares = () => {
    const total = form.value.amount
    let fixedSum = 0
    const fixed = Array.from(fixedTravelers.value)
    
    fixed.forEach(p => {
        fixedSum += (form.value.customShares[p] || 0)
    })
    
    const remainingAmount = total - fixedSum
    const others = store.travelers.filter(t => !fixedTravelers.value.has(t))
    
    if (others.length > 0) {
        const avg = Math.floor(remainingAmount / others.length)
        const remainder = remainingAmount % others.length
        
        others.forEach((t, i) => {
            form.value.customShares[t] = avg + (i < remainder ? 1 : 0)
        })
    }
}

const onShareChange = (person: string) => {
    fixedTravelers.value.add(person)
    
    // If everyone is locked (unlocked count <= 0), reset others to pivot
    // "應該是第三人設定時...清除所有人的鎖定註記"
    // This implies we allow N-1 locks (1 person takes variance).
    // Only when we try to lock the Nth person (0 left), we reset.
    if (store.travelers.length - fixedTravelers.value.size <= 0) {
        fixedTravelers.value.clear()
        fixedTravelers.value.add(person)
    }
    
    recalculateShares()
}

watch(() => form.value.splitMethod, (val) => {
  if (val === 'custom') {
    // Only init if it's a fresh switch or if shares are empty/zero?
    // User said: "When choosing custom... first split equally"
    // So we should probably always init when switching to custom, 
    // unless we are loading existing data? 
    // But this watch triggers on load too if we set it.
    // Let's check if we are just opening the modal.
    // Actually, if we are editing an existing custom expense, we might not want to reset.
    // But for now, let's assume switching means "I want to start custom splitting".
    // If it was already custom (from load), this watch might not trigger if value doesn't change.
    initCustomShares()
  }
})

watch(() => form.value.amount, () => {
    if (form.value.splitMethod === 'custom') {
        // If amount changes, reset distribution to equal split to avoid confusion
        initCustomShares()
    }
})

const toggleInvolved = (person: string) => {
  if (!form.value.involved) form.value.involved = []
  const idx = form.value.involved.indexOf(person)
  if (idx > -1) form.value.involved.splice(idx, 1)
  else form.value.involved.push(person)
}

const save = () => {
  if (!form.value.title || form.value.amount === undefined) return
  emit('save', { ...form.value })
}
</script>
