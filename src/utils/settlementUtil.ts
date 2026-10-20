import type { Expense } from '../stores/types'

export interface SettlementTransfer {
    from: string
    to: string
    amount: number
}

export interface SettlementResult {
    balances: Record<string, number>
    transfers: SettlementTransfer[]
}

/**
 * 依照支出紀錄與旅伴名單計算每人餘額，並算出最少轉帳次數的結算建議。
 * 由 AccountingView.vue 與 BookletView.vue 共用。
 */
export function calculateSettlement(expenses: Expense[], travelers: string[]): SettlementResult {
    const balances: Record<string, number> = {}
    travelers.forEach(p => balances[p] = 0)

    expenses.forEach(e => {
        // Payer paid (+)
        if (!(e.payer in balances)) balances[e.payer] = 0
        balances[e.payer] += e.amount

        // Split logic
        if (e.splitMethod === 'average') {
            const involved = e.involved || []
            if (involved.length > 0) {
                const perPerson = e.amount / involved.length
                involved.forEach(p => {
                    if (!(p in balances)) balances[p] = 0
                    balances[p] -= perPerson
                })
            }
        } else {
            for (const [person, amount] of Object.entries(e.customShares || {})) {
                if (!(person in balances)) balances[person] = 0
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

    const transfers: SettlementTransfer[] = []
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
}
