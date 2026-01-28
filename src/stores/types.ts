/**
 * TravelApp 核心類型定義
 * 從 trip.ts 抽取的介面定義，提高程式碼的模組化和可讀性
 */

// ============================================
// 導覽相關類型 (Guide Types)
// ============================================

export interface Guide {
    id: string;         // Unique identifier
    color: string;      // 推薦顏色 (Tailwind class)
    icon: string;       // 圖示 (FontAwesome class)
    desc: string;       // 景點簡介
    tags: string[];     // 標籤
    highlights: string[]; // 必看重點
    tips: string;       // 參觀小撇步
    original_url?: string; // 原始連結 (was link)
    thumbnail_url?: string; // 封面圖片連結 (was image)
    media_type?: 'instagram' | 'youtube' | 'web'; // 媒體類型
    location: {         // 地理位置
        name: string;
        coordinates?: [number, number];
        google_maps_id?: string;
    };
    user_notes?: string; // 個人化筆記
    status: 'want_to_go' | 'planned' | 'visited'; // 狀態
}

// ============================================
// 交通相關類型 (Transport Types)
// ============================================

export interface TransportPass {
    id: string;
    name: string;
    imageUrl: string;
}

export interface TransportSchedule {
    dep: string;
    arr?: string;
    note?: string;
}

export interface Transport {
    type: 'walk' | 'public' | 'express' | 'ferry' | 'taxi' | 'drive' | 'flight';
    dep?: string;
    arr?: string;
    cost?: number;
    direction?: string;
    note?: string;
    line?: string;
    trainNumber?: string;
    car?: string;
    platform?: string;
    flightNo?: string;
    depAirport?: string;
    arrAirport?: string;
    company?: string;
    schedules?: TransportSchedule[];
    passId?: string;
    duration?: number;
}

// ============================================
// 事件與行程類型 (Event & Day Types)
// ============================================

export interface Event {
    id?: string;
    title: string;
    location: string;
    lat?: number;
    lng?: number;
    mapUrl?: string;
    category: 'fun' | 'food' | 'shop' | 'stay' | 'transport' | 'flight';
    time: string;
    endTime?: string;
    duration?: number;
    cost: number;
    currency?: string;
    notes?: string;
    link?: string;
    linkedGuide?: string;
    transports?: Transport[];
    bookingLink?: string;
    stayInfo?: {
        startDate: string;
        endDate: string;
        checkIn: string;
        checkOut: string;
        notes?: string;
    };
    discounts?: { name: string; url: string }[];
    ticketLink?: string;
}

export interface Day {
    dateStr: string;
    weatherIcon?: string;
    temp?: number;
    events: Event[];
    backups?: Event[]; // Legacy support
}

// ============================================
// 財務相關類型 (Financial Types)
// ============================================

export interface Expense {
    id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    payer: string;
    split: string[];
    splitMethod?: 'equal' | 'exact' | 'percent' | 'shares' | 'adjustment' | 'average' | 'custom';
    involved?: string[];
    customShares?: Record<string, number>;
}

export interface Currency {
    name: string;
    symbol: string;
    rate: number;
}

// ============================================
// 設定相關類型 (Settings Types)
// ============================================

export interface Settings {
    currency: string;
    timeFormat: '12h' | '24h';
    voiceURI?: string;
    aiSettings?: {
        apiKey: string;
        model: string;
        customPrompt?: string;
    };
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}

// ============================================
// 清單相關類型 (Checklist Types)
// ============================================

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface ChecklistCategory {
    id: string;
    name: string;
    items: ChecklistItem[];
}

// ============================================
// Store 狀態類型 (Store State Type)
// ============================================

export interface TripState {
    title: string;
    startDate: string;
    settings: Settings;
    travelers: string[];
    days: Day[];
    backups: Event[];
    expenses: Expense[];
    passes: TransportPass[];
    currencies: Record<string, Currency>;
    attractionGuides: Record<string, Guide>;
    isOnboardingOpen: boolean;
    categories: Category[];
    headerCollapsed: boolean;
    installPromptEvent: any;
    checklists: ChecklistCategory[];
    isSettingsOpen: boolean;
    isAiAssistantOpen: boolean;
    settingsTab: string;
    transportConflictIds: string[];
    eventConflictIds: string[];
}
