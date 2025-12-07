import { defineStore } from 'pinia'
import { validateDaySchedule } from '../utils/TimeAdjustmentUtil'
import type {
    Guide,
    TransportPass,
    Event,
    Day,
    Expense,
    Currency,
    Settings,
    TripState
} from './types'

// Re-export types for external use
export type {
    Guide,
    TransportPass,
    TransportSchedule,
    Transport,
    Event,
    Day,
    Expense,
    Currency,
    Settings,
    Category,
    ChecklistItem,
    ChecklistCategory,
    TripState
} from './types'

const STORAGE_KEY = 'easy_trip_data_v7'


// Import data from dedicated files
import { DEFAULT_GUIDES } from '../data/defaultGuides'
import { EXAMPLE_TRIP } from '../data/exampleTrip'

// Alias for backward compatibility
const DEFAULT_DATA = EXAMPLE_TRIP


export const useTripStore = defineStore('trip', {
    state: (): TripState => ({
        title: '東京五天四夜之旅',
        startDate: new Date().toISOString().slice(0, 10),
        settings: {
            currency: 'JPY',
            timeFormat: '24h',
            voiceURI: '',
            aiSettings: {
                apiKey: '',
                model: 'gemini-2.5-flash',
                customPrompt: ''
            }
        },
        travelers: ['我'],
        days: [],
        checklists: [],
        backups: [],
        expenses: [],
        passes: [],
        attractionGuides: {},
        currencies: DEFAULT_DATA.currencies || {},
        isOnboardingOpen: false,
        isSettingsOpen: false,
        isAiAssistantOpen: false,
        settingsTab: 'trip',
        transportConflictIds: [] as string[],
        eventConflictIds: [] as string[],
        categories: [
            { id: 'fun', name: '景點', icon: 'fa-solid fa-torii-gate' },
            { id: 'food', name: '美食', icon: 'fa-solid fa-utensils' },
            { id: 'shop', name: '購物', icon: 'fa-solid fa-bag-shopping' },
            { id: 'stay', name: '住宿', icon: 'fa-solid fa-bed' },
            { id: 'transport', name: '交通', icon: 'fa-solid fa-train' },
            { id: 'flight', name: '航班', icon: 'fa-solid fa-plane' },
        ],
        headerCollapsed: false,
        installPromptEvent: null as any // Store the beforeinstallprompt event
    }),
    getters: {
        currentCurrency(): Currency {
            return this.currencies[this.settings.currency] || this.currencies['JPY']
        }
    },
    actions: {
        addChecklistItem(categoryId: string, text: string) {
            const category = this.checklists.find(c => c.id === categoryId)
            if (category) {
                category.items.push({
                    id: crypto.randomUUID(),
                    text,
                    checked: false
                })
                this.saveData()
            }
        },
        toggleChecklistItem(categoryId: string, itemId: string) {
            const category = this.checklists.find(c => c.id === categoryId)
            if (category) {
                const item = category.items.find(i => i.id === itemId)
                if (item) {
                    item.checked = !item.checked
                    this.saveData()
                }
            }
        },
        deleteChecklistItem(categoryId: string, itemId: string) {
            const category = this.checklists.find(c => c.id === categoryId)
            if (category) {
                category.items = category.items.filter(i => i.id !== itemId)
                this.saveData()
            }
        },
        addChecklistCategory(name: string) {
            this.checklists.push({
                id: crypto.randomUUID(),
                name,
                items: []
            })
            this.saveData()
        },
        deleteChecklistCategory(id: string) {
            this.checklists = this.checklists.filter(c => c.id !== id)
            this.saveData()
        },
        // Onboarding Actions
        checkOnboarding() {
            const seen = localStorage.getItem('has_seen_onboarding_v1')
            if (!seen) {
                this.isOnboardingOpen = true
            }
        },

        completeOnboarding() {
            this.isOnboardingOpen = false
            localStorage.setItem('has_seen_onboarding_v1', 'true')
        },

        openOnboarding() {
            this.isOnboardingOpen = true
        },

        loadData() {
            let saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) {
                // Migration: Check for old key
                saved = localStorage.getItem('kyushu_trip_data_v7')
            }

            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    this.days = parsed.days || DEFAULT_DATA.days
                    this.expenses = parsed.expenses || DEFAULT_DATA.expenses
                    this.travelers = parsed.travelers || DEFAULT_DATA.travelers
                    this.passes = parsed.passes || []
                    this.attractionGuides = parsed.attractionGuides || JSON.parse(JSON.stringify(DEFAULT_GUIDES))
                    this.settings = parsed.settings || { currency: 'JPY', timeFormat: '24h' }
                    // Ensure timeFormat exists if loading old settings
                    if (!this.settings.timeFormat) this.settings.timeFormat = '24h'
                    if (this.settings.voiceURI === undefined) this.settings.voiceURI = ''
                    if (!this.settings.aiSettings) this.settings.aiSettings = { apiKey: '', model: 'gemini-2.5-flash' }

                    this.title = parsed.title || DEFAULT_DATA.title
                    this.startDate = parsed.startDate || DEFAULT_DATA.startDate

                    // Load currencies if exist, otherwise keep defaults
                    if (parsed.currencies) {
                        this.currencies = parsed.currencies
                    }

                    // Migration: Ensure all events and expenses have a currency and ID
                    this.days.forEach(day => {
                        day.events.forEach(event => {
                            if (!event.currency) event.currency = this.settings.currency
                            if (!event.id) event.id = crypto.randomUUID()

                            // Migration: Convert single transport to transports array
                            if ((event as any).transport && !event.transports) {
                                event.transports = [(event as any).transport]
                                delete (event as any).transport
                            }

                            // Migration: Convert flightInfo to transport
                            if (event.category === 'flight' && (event as any).flightInfo) {
                                const fInfo = (event as any).flightInfo
                                if (!event.transports) event.transports = []
                                event.transports.push({
                                    type: 'flight',
                                    flightNo: fInfo.flightNo,
                                    depAirport: fInfo.dep,
                                    arrAirport: fInfo.arr,
                                    dep: fInfo.depTime,
                                    arr: fInfo.arrTime,
                                    cost: 0 // Flight cost usually in event cost or 0
                                })
                                delete (event as any).flightInfo
                            }
                        })
                    })
                    this.expenses.forEach(exp => {
                        if (!exp.currency) exp.currency = this.settings.currency
                        if (!exp.id) exp.id = crypto.randomUUID()
                    })
                    this.backups.forEach(backup => {
                        if (!backup.id) backup.id = crypto.randomUUID()

                        // Migration for backups as well
                        if (backup.category === 'flight' && (backup as any).flightInfo) {
                            const fInfo = (backup as any).flightInfo
                            if (!backup.transports) backup.transports = []
                            backup.transports.push({
                                type: 'flight',
                                flightNo: fInfo.flightNo,
                                depAirport: fInfo.dep,
                                arrAirport: fInfo.arr,
                                dep: fInfo.depTime,
                                arr: fInfo.arrTime,
                                cost: 0
                            })
                            delete (backup as any).flightInfo
                        }
                    })

                    // Migration: Guide data structure
                    if (this.attractionGuides) {
                        Object.keys(this.attractionGuides).forEach(key => {
                            const guide = this.attractionGuides[key] as any;

                            // Migrate link -> original_url
                            if (guide.link && !guide.original_url) {
                                guide.original_url = guide.link;
                                delete guide.link;
                            }

                            // Migrate image -> thumbnail_url
                            if (guide.image && !guide.thumbnail_url) {
                                guide.thumbnail_url = guide.image;
                                delete guide.image;
                            }

                            // Add missing fields
                            if (!guide.id) guide.id = crypto.randomUUID();
                            if (!guide.media_type) guide.media_type = 'web';
                            if (!guide.location) guide.location = { name: '' };
                            if (!guide.user_notes) guide.user_notes = '';
                            if (!guide.status) guide.status = 'want_to_go';
                        });
                    }

                    // Migration: Move day-specific backups to global backups if global backups are empty
                    if (!parsed.backups && this.days.some((d: any) => d.backups && d.backups.length > 0)) {
                        this.days.forEach((day: any) => {
                            if (day.backups) {
                                this.backups.push(...day.backups)
                                delete day.backups
                            }
                        })
                    } else {
                        // If parsed.backups exists but is empty, we might want to load defaults if it seems like a fresh start or migration issue.
                        // For now, if it's empty, we load defaults to ensure the user sees the example backups.
                        const storedBackups = parsed.backups || []
                        this.backups = storedBackups.length > 0 ? storedBackups : (DEFAULT_DATA.backups || [])
                    }

                    // Initialize checklists if missing
                    if (!parsed.checklists) {
                        this.checklists = [
                            {
                                id: 'pre-trip',
                                name: '行前準備',
                                items: [
                                    { id: '1', text: '檢查護照有效期', checked: false },
                                    { id: '2', text: '預訂機票與住宿', checked: false },
                                    { id: '3', text: '購買旅遊保險', checked: false },
                                    { id: '4', text: '申請簽證 (如需要)', checked: false },
                                    { id: '5', text: '兌換外幣 / 開通跨國提款', checked: false },
                                    { id: '6', text: '購買 SIM 卡 / 漫遊', checked: false },
                                ]
                            },
                            {
                                id: 'checkout',
                                name: '退房前準備',
                                items: [
                                    { id: '1', text: '檢查所有抽屜與衣櫃', checked: false },
                                    { id: '2', text: '確認充電器與轉接頭', checked: false },
                                    { id: '3', text: '歸還房卡 / 鑰匙', checked: false },
                                    { id: '4', text: '確認冰箱內物品', checked: false },
                                    { id: '5', text: '檢查浴室用品', checked: false },
                                ]
                            }
                        ]
                    } else {
                        this.checklists = parsed.checklists
                    }

                    // Ensure all events are sorted by time
                    this.days.forEach(day => {
                        if (day.events) {
                            day.events.sort((a: Event, b: Event) => a.time.localeCompare(b.time));
                        }
                    });

                } catch (e) {
                    console.error("Data load failed", e)
                    this.loadExampleData()
                }
            } else {
                this.loadExampleData()
            }
        },
        saveData() {
            const data = {
                days: this.days,
                backups: this.backups,
                expenses: this.expenses,
                travelers: this.travelers,
                passes: this.passes,
                attractionGuides: this.attractionGuides,
                settings: this.settings,
                title: this.title,
                startDate: this.startDate,
                currencies: this.currencies,
                checklists: this.checklists
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        },
        loadExampleData() {
            this.days = JSON.parse(JSON.stringify(DEFAULT_DATA.days))
            this.backups = JSON.parse(JSON.stringify(DEFAULT_DATA.backups || []))
            this.expenses = JSON.parse(JSON.stringify(DEFAULT_DATA.expenses))
            this.travelers = JSON.parse(JSON.stringify(DEFAULT_DATA.travelers))
            this.passes = []
            this.attractionGuides = JSON.parse(JSON.stringify(DEFAULT_GUIDES))
            this.settings = { currency: 'JPY', timeFormat: '24h', voiceURI: '', aiSettings: { apiKey: '', model: 'gemini-2.5-flash' } }
            this.title = DEFAULT_DATA.title || 'Easy Trip'
            this.startDate = DEFAULT_DATA.startDate || '2025-09-10'
            this.currencies = {
                'TWD': { symbol: 'NT$', rate: 0.22, name: '新台幣 (台灣)' },
                'JPY': { symbol: '¥', rate: 1, name: '日圓 (日本)' }
            }
            this.checklists = [
                {
                    id: 'pre-trip',
                    name: '行前準備',
                    items: [
                        { id: '1', text: '檢查護照有效期', checked: false },
                        { id: '2', text: '預訂機票與住宿', checked: false },
                        { id: '3', text: '購買旅遊保險', checked: false },
                        { id: '4', text: '申請簽證 (如需要)', checked: false },
                        { id: '5', text: '兌換外幣 / 開通跨國提款', checked: false },
                        { id: '6', text: '購買 SIM 卡 / 漫遊', checked: false },
                    ]
                },
                {
                    id: 'checkout',
                    name: '退房前準備',
                    items: [
                        { id: '1', text: '檢查所有抽屜與衣櫃', checked: false },
                        { id: '2', text: '確認充電器與轉接頭', checked: false },
                        { id: '3', text: '歸還房卡 / 鑰匙', checked: false },
                        { id: '4', text: '確認冰箱內物品', checked: false },
                        { id: '5', text: '檢查浴室用品', checked: false },
                    ]
                }
            ]

            // Initialize default data with default currency and IDs
            this.days.forEach(day => {
                day.events.forEach(event => {
                    event.currency = 'JPY'
                    if (!event.id) event.id = crypto.randomUUID()
                })
            })
            this.backups.forEach(backup => {
                if (!backup.id) backup.id = crypto.randomUUID()
            })

            this.saveData()
        },
        clearData() {
            // Preserve API Key
            const currentApiKey = this.settings.aiSettings?.apiKey || ''

            this.days = []
            this.backups = []
            this.expenses = []
            this.travelers = ['我']
            this.passes = []
            this.attractionGuides = {}
            this.settings = {
                currency: 'JPY',
                timeFormat: '24h',
                voiceURI: '',
                aiSettings: {
                    apiKey: currentApiKey, // Restore API Key
                    model: 'gemini-2.5-flash'
                }
            }
            this.title = '我的行程'
            this.startDate = new Date().toISOString().split('T')[0]
            this.currencies = {
                'TWD': { symbol: 'NT$', rate: 0.22, name: '新台幣 (台灣)' },
                'JPY': { symbol: '¥', rate: 1, name: '日圓 (日本)' }
            }
            this.saveData()
        },
        updateSettings(newSettings: Partial<Settings>) {
            this.settings = { ...this.settings, ...newSettings }
            this.saveData()
        },
        updateTripInfo(title: string, startDate: string) {
            this.title = title
            this.startDate = startDate

            // Recalculate dates for all days
            const start = new Date(startDate)
            this.days.forEach((day, index) => {
                const date = new Date(start)
                date.setDate(start.getDate() + index)
                const month = date.getMonth() + 1
                const d = date.getDate()
                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
                day.dateStr = `${month}/${d} (${dayOfWeek})`
            })
            this.saveData()
        },
        addDay() {
            const start = new Date(this.startDate)
            const newIndex = this.days.length
            const date = new Date(start)
            date.setDate(start.getDate() + newIndex)
            const month = date.getMonth() + 1
            const d = date.getDate()
            const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]

            const newDay: Day = {
                dateStr: `${month}/${d} (${dayOfWeek})`,
                events: []
            }

            this.days.push(newDay)
            this.saveData()
        },
        /**
         * 刪除指定天數，該天的行程會移至備案
         * @param dayIndex 要刪除的天數索引
         */
        removeDay(dayIndex: number) {
            if (dayIndex < 0 || dayIndex >= this.days.length) return
            if (this.days.length <= 1) return // 至少保留一天

            const dayToRemove = this.days[dayIndex]

            // 將該天的行程移至備案
            if (dayToRemove.events && dayToRemove.events.length > 0) {
                this.backups.push(...dayToRemove.events)
            }

            // 刪除該天
            this.days.splice(dayIndex, 1)

            // 重新計算日期字串
            this.recalculateDayStrings()

            this.saveData()
        },
        /**
         * 重新計算所有天數的日期字串
         */
        recalculateDayStrings() {
            const start = new Date(this.startDate)
            this.days.forEach((day, index) => {
                const date = new Date(start)
                date.setDate(start.getDate() + index)
                const month = date.getMonth() + 1
                const d = date.getDate()
                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
                day.dateStr = `${month}/${d} (${dayOfWeek})`
            })
        },
        updateTravelers(newTravelers: string[]) {
            this.travelers = newTravelers
            this.saveData()
        },
        addPass(pass: Omit<TransportPass, 'id'>) {
            const newPass: TransportPass = {
                id: crypto.randomUUID(),
                ...pass
            }
            this.passes.push(newPass)
            this.saveData()
        },
        removePass(id: string) {
            this.passes = this.passes.filter(p => p.id !== id)
            this.saveData()
        },
        addEvent(dayIndex: number, event: Event) {
            this.days[dayIndex].events.push(event)
            this.days[dayIndex].events.sort((a: Event, b: Event) => a.time.localeCompare(b.time))
            this.validateConflicts(dayIndex)
            this.saveData()
        },
        adjustEventTime(dayIndex: number, eventId: string, newTime: string) {
            const day = this.days[dayIndex]
            if (day) {
                const event = day.events.find(e => e.id === eventId)
                if (event) {
                    event.time = newTime
                    day.events.sort((a: Event, b: Event) => a.time.localeCompare(b.time))
                    this.validateConflicts(dayIndex)
                    this.saveData()
                }
            }
        },
        validateConflicts(dayIndex: number) {
            const events = this.days[dayIndex].events
            const { transportConflicts, eventConflicts } = validateDaySchedule(events)
            this.transportConflictIds = transportConflicts
            this.eventConflictIds = eventConflicts
        },
        updateEvent(dayIndex: number, eventId: string, updatedEvent: Partial<Event>) {
            const day = this.days[dayIndex]
            if (day) {
                const eventIndex = day.events.findIndex(e => e.id === eventId)
                if (eventIndex !== -1) {
                    day.events[eventIndex] = { ...day.events[eventIndex], ...updatedEvent }
                    day.events.sort((a: Event, b: Event) => a.time.localeCompare(b.time))
                    this.validateConflicts(dayIndex)
                    this.saveData()
                }
            }
        },
        setHeaderCollapsed(collapsed: boolean) {
            this.headerCollapsed = collapsed
        },
        updateCurrencyRate(code: string, rate: number) {
            if (this.currencies[code]) {
                this.currencies[code].rate = rate
                this.saveData()
            }
        },
        updateGuide(newTitle: string, data: Guide, oldTitle?: string) {
            if (newTitle && data) {
                // 1. If renaming, delete old key
                if (oldTitle && oldTitle !== newTitle && this.attractionGuides[oldTitle]) {
                    delete this.attractionGuides[oldTitle]
                }

                // 2. Update Store with new title
                this.attractionGuides[newTitle] = JSON.parse(JSON.stringify(data))
                this.saveData()
            }
        },
        setSettingsOpen(isOpen: boolean, tab: string = 'trip') {
            this.isSettingsOpen = isOpen
            if (isOpen) {
                this.settingsTab = tab
            }
        },
        setInstallPrompt(event: any) {
            this.installPromptEvent = event
        },
        clearInstallPrompt() {
            this.installPromptEvent = null
        },

        // ============================================
        // Backup CRUD Actions (封裝備案操作)
        // ============================================
        addBackup(backup: Event) {
            const newBackup = { ...backup }
            if (!newBackup.id) newBackup.id = crypto.randomUUID()
            this.backups.push(newBackup)
            this.saveData()
        },
        removeBackup(index: number) {
            if (index >= 0 && index < this.backups.length) {
                this.backups.splice(index, 1)
                this.saveData()
            }
        },
        updateBackup(index: number, data: Event) {
            if (index >= 0 && index < this.backups.length) {
                this.backups[index] = { ...data }
                this.saveData()
            }
        },
        promoteBackupToEvent(backupIndex: number, dayIndex: number, eventData: Event) {
            if (backupIndex >= 0 && backupIndex < this.backups.length) {
                // Ensure day exists
                while (this.days.length <= dayIndex) {
                    this.addDay()
                }
                // Add event to day
                const newEvent = { ...eventData }
                if (!newEvent.id) newEvent.id = crypto.randomUUID()
                this.days[dayIndex].events.push(newEvent)
                this.days[dayIndex].events.sort((a: Event, b: Event) => a.time.localeCompare(b.time))
                // Remove from backups
                this.backups.splice(backupIndex, 1)
                this.validateConflicts(dayIndex)
                this.saveData()
            }
        },

        // ============================================
        // Event CRUD Actions (封裝事件操作)
        // ============================================
        insertEvent(dayIndex: number, eventData: Event, insertIndex?: number) {
            // Ensure day exists
            while (this.days.length <= dayIndex) {
                this.addDay()
            }
            const newEvent = { ...eventData }
            if (!newEvent.id) newEvent.id = crypto.randomUUID()

            if (insertIndex !== undefined && insertIndex >= 0) {
                this.days[dayIndex].events.splice(insertIndex, 0, newEvent)
            } else {
                this.days[dayIndex].events.push(newEvent)
            }
            this.days[dayIndex].events.sort((a: Event, b: Event) => a.time.localeCompare(b.time))
            this.validateConflicts(dayIndex)
            this.saveData()
        },
        removeEvent(dayIndex: number, eventId: string) {
            const day = this.days[dayIndex]
            if (day) {
                const index = day.events.findIndex(e => e.id === eventId)
                if (index !== -1) {
                    day.events.splice(index, 1)
                    this.validateConflicts(dayIndex)
                    this.saveData()
                }
            }
        },
        moveEventToBackup(dayIndex: number, eventId: string) {
            const day = this.days[dayIndex]
            if (day) {
                const index = day.events.findIndex(e => e.id === eventId)
                if (index !== -1) {
                    const [event] = day.events.splice(index, 1)
                    this.backups.push(event)
                    this.validateConflicts(dayIndex)
                    this.saveData()
                }
            }
        },

        // ============================================
        // Expense CRUD Actions (封裝支出操作)
        // ============================================
        addExpenseRecord(expense: Expense) {
            const newExpense = { ...expense }
            if (!newExpense.id) newExpense.id = crypto.randomUUID()
            this.expenses.push(newExpense)
            this.saveData()
        },
        updateExpenseAt(index: number, data: Expense) {
            if (index >= 0 && index < this.expenses.length) {
                this.expenses[index] = { ...data }
                this.saveData()
            }
        },
        removeExpense(index: number) {
            if (index >= 0 && index < this.expenses.length) {
                this.expenses.splice(index, 1)
                this.saveData()
            }
        },

        // ============================================
        // Guide CRUD Actions (封裝導覽操作)
        // ============================================
        deleteGuide(title: string) {
            if (this.attractionGuides[title]) {
                delete this.attractionGuides[title]
                this.saveData()
            }
        },

        // ============================================
        // Data Import Action (封裝資料匯入)
        // ============================================
        importData(jsonString: string): { success: boolean; error?: string } {
            try {
                let parsed = JSON.parse(jsonString)

                // Handle potential double-stringified legacy format
                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed)
                }

                // Sanitize data: Ensure transport events have transports array
                if (parsed.days) {
                    parsed.days.forEach((day: any) => {
                        if (day.events) {
                            day.events.forEach((event: any) => {
                                if ((event.category === 'transport' || event.category === 'flight') && !event.transports) {
                                    event.transports = [{
                                        type: event.category === 'flight' ? 'flight' : 'walk',
                                        company: '',
                                        line: '',
                                        direction: '',
                                        dep: event.time,
                                        arr: event.endTime || event.time,
                                        cost: 0,
                                        note: ''
                                    }]
                                }
                                // Ensure event has ID
                                if (!event.id) {
                                    event.id = crypto.randomUUID()
                                }
                            })
                        }
                    })
                }

                // Use $patch to update store state
                this.$patch({
                    title: parsed.title || this.title,
                    startDate: parsed.startDate || this.startDate,
                    settings: { ...this.settings, ...parsed.settings },
                    travelers: parsed.travelers || this.travelers,
                    days: parsed.days || this.days,
                    backups: parsed.backups || this.backups,
                    expenses: parsed.expenses || this.expenses,
                    passes: parsed.passes || this.passes,
                    attractionGuides: parsed.attractionGuides || this.attractionGuides,
                    checklists: parsed.checklists || this.checklists
                })

                this.saveData()
                return { success: true }
            } catch (err) {
                console.error('Import data error:', err)
                return { success: false, error: '匯入失敗：格式錯誤' }
            }
        }
    }

})
