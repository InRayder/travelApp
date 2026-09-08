import { defineStore } from 'pinia'
import type { TripMeta } from './types'

export type { TripMeta } from './types'

/**
 * 多行程資料模型（本機階段，Firebase Auth 尚未接上）
 * ------------------------------------------------
 * 在接上 Firebase 之前，這個 store 先在「本機 localStorage」層級把單一全域行程
 * 升級為「可擁有多筆行程、可切換」的資料結構，讓後續要接上 Firestore 時
 * （trips/{tripId}）只需要把讀寫來源從 localStorage 換成雲端，資料形狀不需再大改。
 *
 * - LEGACY_TRIP_ID：既有使用者原本只有一筆行程，存在 `easy_trip_data_v7`（無後綴）。
 *   為了不打斷既有使用者的資料，第一次升級時會把這筆資料原地保留，並在索引中
 *   用固定 ID `local-default` 代表它，而不是搬移到新的 key。
 * - 新建立的行程一律使用 `easy_trip_data_v7:{tripId}` 作為 localStorage key。
 * - ownerId/collaborators 目前只有 'local' 這個佔位身份；等 Firebase Auth 上線後，
 *   會有專門的資料遷移流程把 'local' 換成真正登入的 uid（見 docs 中的 data-migration 項目）。
 */

export const LEGACY_TRIP_ID = 'local-default'

const TRIP_DATA_KEY_PREFIX = 'easy_trip_data_v7'
const INDEX_STORAGE_KEY = 'easy_trip_index_v1'

/** 取得某個行程資料應該存放的 localStorage key */
export function getTripStorageKey(tripId: string): string {
    return tripId === LEGACY_TRIP_ID ? TRIP_DATA_KEY_PREFIX : `${TRIP_DATA_KEY_PREFIX}:${tripId}`
}

interface TripListState {
    trips: TripMeta[]
    activeTripId: string
    isLoaded: boolean
}

export const useTripListStore = defineStore('tripList', {
    state: (): TripListState => ({
        trips: [],
        activeTripId: LEGACY_TRIP_ID,
        isLoaded: false
    }),
    getters: {
        activeTrip(state): TripMeta | undefined {
            return state.trips.find(t => t.id === state.activeTripId)
        }
    },
    actions: {
        /** 讀取本機的行程索引；若索引不存在（舊版使用者第一次升級），自動建立一筆代表既有資料的項目 */
        loadIndex() {
            const raw = localStorage.getItem(INDEX_STORAGE_KEY)
            if (raw) {
                try {
                    const parsed = JSON.parse(raw)
                    this.trips = parsed.trips || []
                    this.activeTripId = parsed.activeTripId || LEGACY_TRIP_ID
                } catch (e) {
                    console.error('Trip index load failed', e)
                    this.trips = []
                }
            }

            // 確保至少有一筆行程（涵蓋全新使用者與舊版升級兩種情境）
            if (!this.trips.some(t => t.id === LEGACY_TRIP_ID)) {
                const now = new Date().toISOString()
                this.trips.unshift({
                    id: LEGACY_TRIP_ID,
                    title: '我的行程',
                    ownerId: 'local',
                    collaborators: [],
                    createdAt: now,
                    updatedAt: now
                })
            }
            if (!this.activeTripId || !this.trips.some(t => t.id === this.activeTripId)) {
                this.activeTripId = this.trips[0]?.id || LEGACY_TRIP_ID
            }

            this.isLoaded = true
            this.saveIndex()
        },
        saveIndex() {
            localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify({
                trips: this.trips,
                activeTripId: this.activeTripId
            }))
        },
        /** 每次行程資料儲存時呼叫，讓索引上的標題/更新時間保持同步（供行程列表顯示用） */
        touchTrip(id: string, title: string) {
            const meta = this.trips.find(t => t.id === id)
            const now = new Date().toISOString()
            if (meta) {
                meta.title = title
                meta.updatedAt = now
            } else {
                // 理論上不會發生（createTrip 已先建立 meta），保底補上一筆避免資料遺失
                this.trips.push({
                    id,
                    title,
                    ownerId: 'local',
                    collaborators: [],
                    createdAt: now,
                    updatedAt: now
                })
            }
            this.saveIndex()
        },
        /** 建立一筆新的空白行程，回傳新行程的 id，呼叫端需自行接著呼叫 tripStore.loadData(id) 載入 */
        createTrip(title: string): string {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()
            this.trips.push({
                id,
                title: title || '未命名行程',
                ownerId: 'local',
                collaborators: [],
                createdAt: now,
                updatedAt: now
            })
            this.activeTripId = id
            this.saveIndex()
            return id
        },
        renameTrip(id: string, title: string) {
            const meta = this.trips.find(t => t.id === id)
            if (meta) {
                meta.title = title
                meta.updatedAt = new Date().toISOString()
                this.saveIndex()
            }
        },
        /** 刪除一筆行程（含其 localStorage 資料）。若刪除的是當前作用中的行程，會切到清單中的第一筆 */
        deleteTrip(id: string) {
            if (this.trips.length <= 1) return // 至少保留一筆行程，避免變成無行程可用的狀態

            this.trips = this.trips.filter(t => t.id !== id)
            localStorage.removeItem(getTripStorageKey(id))

            if (this.activeTripId === id) {
                this.activeTripId = this.trips[0]?.id || LEGACY_TRIP_ID
            }
            this.saveIndex()
        },
        setActiveTrip(id: string) {
            if (this.trips.some(t => t.id === id)) {
                this.activeTripId = id
                this.saveIndex()
            }
        }
    }
})
