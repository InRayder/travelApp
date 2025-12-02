<template>
  <div class="h-full flex flex-col bg-jp-cream">
    <div class="px-6 pt-8 pb-4 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-jp-dark mb-1">記帳分帳</h1>
        <p class="text-xs text-gray-500">Expense Tracker</p>
      </div>
      <div class="text-right">
        <div class="text-[10px] text-gray-400 uppercase">Total Expense</div>
        <div class="text-2xl font-bold text-jp-accent-green">¥{{ totalExpense.toLocaleString() }}</div>
      </div>
    </div>

    <div 
      class="flex-1 overflow-y-auto px-6 pb-24"
      @scroll="handleScroll"
    >
      <!-- Chart -->
      <div class="bg-white rounded-2xl p-4 shadow-sm mb-6 h-48">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>

      <!-- Settlement -->
      <div class="bg-jp-dark text-white rounded-2xl p-5 mb-6 shadow-lg shadow-gray-300">
        <h3 class="font-bold text-sm mb-4 flex items-center gap-2"><font-awesome-icon icon="fa-solid fa-hand-holding-dollar" /> 結算建議</h3>
        <div v-if="settlement.transfers.length > 0" class="space-y-3">
          <div v-for="(t, i) in settlement.transfers" :key="i" class="flex items-center justify-between text-sm bg-white/10 p-2 rounded-lg">
            <div class="flex items-center gap-2">
              <span class="font-bold text-red-300">{{ t.from }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-xs text-gray-400" />
              <span class="font-bold text-green-300">{{ t.to }}</span>
            </div>
            <span class="font-mono font-bold">¥{{ t.amount.toLocaleString() }}</span>
          </div>
        </div>
        <div v-else class="text-center text-xs text-gray-400 py-2">目前沒有需要結算的款項</div>
      </div>

      <!-- List -->
      <h3 class="font-bold text-gray-500 text-sm mb-3">支出明細</h3>
      <div class="space-y-3">
        <div v-for="(exp, idx) in expenses" :key="idx" @click="openEditExpense(exp, idx)" class="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <font-awesome-icon :icon="getCategoryIcon(exp.category)" />
            </div>
            <div>
              <div class="font-bold text-jp-dark text-sm">{{ exp.title }}</div>
              <div class="text-[10px] text-gray-400">{{ exp.date }} · {{ exp.payer }} 付款</div>
            </div>
          </div>
          <div class="font-bold text-jp-dark">¥{{ exp.amount.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button @click="openAddExpense" class="fixed bottom-40 right-6 w-14 h-14 rounded-full bg-jp-accent-green text-white shadow-lg shadow-green-500/30 flex items-center justify-center text-xl hover:scale-110 transition-transform z-40">
      <font-awesome-icon icon="fa-solid fa-plus" />
    </button>

    <ExpenseModal
      :isOpen="expenseModalOpen"
      :initialData="editingExpense"
      @close="expenseModalOpen = false"
      @save="saveExpense"
      @delete="deleteExpense"
    />
    
    <ConfirmModal
      :isOpen="confirmModalOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      @close="confirmModalOpen = false"
      @confirm="handleConfirmAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import { storeToRefs } from 'pinia'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import ExpenseModal from '../components/ExpenseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import type { Expense } from '../stores/trip.ts'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useTripStore()
const { expenses, travelers } = storeToRefs(store)

const expenseModalOpen = ref(false)
const editingExpense = ref<Expense | null>(null)
const editingIndex = ref(-1)

// 確認視窗狀態
const confirmModalOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmCallback = ref<(() => void) | null>(null)

const openConfirmModal = (title: string, message: string, callback: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmCallback.value = callback
  confirmModalOpen.value = true
}

const handleConfirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
    confirmCallback.value = null
  }
}
// --- Computed Stats ---
const totalExpense = computed(() => expenses.value.reduce((acc, cur) => acc + (cur.amount || 0), 0))

const chartData = computed(() => {
  const categories: Record<string, number> = {}
  expenses.value.forEach(e => {
    if (!categories[e.category]) categories[e.category] = 0
    categories[e.category] += e.amount
  })
  
  const labels = Object.keys(categories).map(id => {
    const found = store.categories.find(c => c.id === id)
    return found ? found.name : id
  })
  
  return {
    labels: labels,
    datasets: [{
      backgroundColor: ['#F87171', '#FB923C', '#FACC15', '#4ADE80', '#60A5FA', '#A78BFA'],
      data: Object.values(categories)
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const, labels: { boxWidth: 10, font: { size: 10 } } }
  }
}

// --- Settlement Logic ---
const settlement = computed(() => {
  const balances: Record<string, number> = {}
  travelers.value.forEach(p => balances[p] = 0)

  expenses.value.forEach(e => {
    // Payer paid (+)
    balances[e.payer] += e.amount
    
    // Split logic
    if (e.splitMethod === 'average') {
      const perPerson = e.amount / e.involved.length
      e.involved.forEach(p => balances[p] -= perPerson)
    } else {
      for (const [person, amount] of Object.entries(e.customShares)) {
        balances[person] -= amount
      }
    }
  })

  // Calculate transfers
  const debtors: { person: string, amount: number }[] = []
  const creditors: { person: string, amount: number }[] = []
  for (const [person, amount] of Object.entries(balances)) {
    if (amount < -1) debtors.push({ person, amount })
    else if (amount > 1) creditors.push({ person, amount })
  }

  debtors.sort((a, b) => a.amount - b.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const transfers: { from: string, to: string, amount: number }[] = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount)
    
    transfers.push({ from: debtor.person, to: creditor.person, amount: Math.round(amount) })
    
    debtor.amount += amount
    creditor.amount -= amount
    
    if (Math.abs(debtor.amount) < 1) i++
    if (creditor.amount < 1) j++
  }
  
  return { balances, transfers }
})

// --- Actions ---
const openAddExpense = () => {
  editingExpense.value = null
  editingIndex.value = -1
  expenseModalOpen.value = true
}

const openEditExpense = (exp: Expense, idx: number) => {
  editingExpense.value = exp
  editingIndex.value = idx
  expenseModalOpen.value = true
}

const saveExpense = (data: Expense) => {
  if (editingIndex.value !== -1) {
    expenses.value[editingIndex.value] = data
  } else {
    expenses.value.push(data)
  }
  store.saveData()
  expenseModalOpen.value = false
}

const deleteExpense = () => {
  openConfirmModal('刪除支出', '確定要刪除此筆支出嗎？', () => {
    expenses.value.splice(editingIndex.value, 1)
    store.saveData()
    expenseModalOpen.value = false
  })
}

const getCategoryIcon = (cat: string) => {
  const found = store.categories.find(c => c.id === cat)
  return found ? found.icon : 'fa-solid fa-circle'
}

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.scrollTop > 50) {
    if (!store.headerCollapsed) store.setHeaderCollapsed(true)
  } else {
    if (store.headerCollapsed) store.setHeaderCollapsed(false)
  }
}

onUnmounted(() => {
  store.setHeaderCollapsed(false)
})
</script>
