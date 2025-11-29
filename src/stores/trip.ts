import { defineStore } from 'pinia'

const STORAGE_KEY = 'easy_trip_data_v7'

export interface Guide {
    color: string;      // 推薦顏色 (Tailwind class, e.g. "from-pink-500 to-red-600")
    icon: string;       // 圖示 (FontAwesome class, e.g. "fa-solid fa-torii-gate")
    desc: string;       // 景點簡介
    tags: string[];     // 標籤 (e.g. "學問之神", "梅枝餅")
    highlights: string[]; // 必看重點
    tips: string;       // 參觀小撇步
    link: string;       // 官方網站或相關連結
    image?: string;     // 背景圖片連結 (Optional)
}

export interface TransportSchedule {
    id: number;         // 班次 ID
    time: string;       // 時間 (HH:MM)
    note: string;       // 備註
    isDefault?: boolean; // 是否為預設班次
}

export interface Transport {
    type: 'walk' | 'public' | 'express' | 'ferry' | 'taxi' | 'drive'; // 交通類型
    // Common (通用)
    dep?: string;       // 出發時間 (HH:MM)
    arr?: string;       // 抵達時間 (HH:MM)
    cost?: number;      // 費用
    direction?: string; // 開往方向 (e.g. 往新宿)

    // Public (Bus/Subway - 公車/地鐵)
    line?: string;      // 路線 (e.g. 機場線, 50號公車)

    // Express (Shinkansen/Train - 新幹線/特急)
    trainNumber?: string; // 班次 (e.g. 回聲號 855)
    car?: string;         // 車廂/座位 (e.g. 自由席, 5號車 3A)
    platform?: string;    // 月台

    // Ferry / Taxi / Drive (船/計程車/自駕)
    company?: string;     // 船公司 / 計程車行 / 租車公司

    // Schedules (Express & Ferry - 前後班次)
    schedules?: { dep: string, arr?: string, note?: string }[]; // Max 5 sets of prev/next info

    note?: string; // 通用備註
}

export interface Event {
    id?: string;        // 事件 ID (UUID)
    title: string;      // 標題
    location: string;   // 地點
    category: string;   // 類別 (fun, food, shop, stay, transport, flight)
    time: string;       // 開始時間 (HH:MM)
    endTime?: string;   // 結束時間 (HH:MM)
    notes?: string;     // 備註
    cost: number;       // 預估費用
    currency?: string;  // 幣別 (預設 JPY)
    lat?: number;       // 緯度 (Deprecated, use mapUrl)
    lng?: number;       // 經度 (Deprecated, use mapUrl)
    mapUrl?: string;    // Google Maps 連結
    link?: string;      // 相關連結 (e.g. Tabelog)
    ticketLink?: string; // 購票連結 (e.g. Klook)
    bookingLink?: string; // 訂房連結 (e.g. Booking.com)
    transport?: Transport; // 交通資訊 (僅當 category 為 'transport' 時)
    flightInfo?: {      // 航班資訊 (僅當 category 為 'flight' 時)
        dep: string;    // 出發機場代碼
        arr: string;    // 抵達機場代碼
        flightNo: string; // 航班編號
        depTime: string; // 起飛時間
        arrTime: string; // 抵達時間
    };
    stayInfo?: {        // 住宿資訊 (僅當 category 為 'stay' 時)
        startDate: string; // 入住日期
        endDate: string;   // 退房日期
        checkIn: string;   // Check-in 時間
        checkOut: string;  // Check-out 時間
        notes: string;     // 住宿備註
    };
    discounts?: { name: string; url: string }[]; // 優惠券列表
    linkedGuide?: string; // 關聯的導覽 ID (Key of attractionGuides)
    duration?: number;    // 持續時間 (分鐘, 用於 UI 計算)
}

export interface Day {
    dateStr: string;    // 日期字串 (e.g. "9/10 (Tue)")
    weatherIcon: string; // 天氣圖示 (FontAwesome class)
    temp: number;       // 氣溫
    events: Event[];    // 當日行程列表
}


export interface Expense {
    id?: string;        // 支出 ID
    title: string;      // 項目名稱
    amount: number;     // 金額
    category: string;   // 類別 (food, transport, shop, etc.)
    payer: string;      // 付款人
    splitMethod: string; // 分帳方式 (equal, custom, exact)
    involved: string[]; // 參與分帳的人
    customShares: Record<string, number>; // 自訂分帳比例/金額
    date: string;       // 日期
    currency?: string;  // 幣別
}

export interface Currency {
    symbol: string;     // 貨幣符號 (e.g. "¥")
    rate: number;       // 匯率 (相對於基準貨幣 JPY)
    name: string;       // 貨幣名稱
}

export interface Settings {
    currency: string;   // 預設顯示幣別
}

export interface Category {
    id: string;         // 類別 ID
    name: string;       // 類別名稱
    icon: string;       // 類別圖示
}

export interface TripState {
    days: Day[];        // 每日行程資料
    backups: Event[];   // 備案列表
    expenses: Expense[]; // 支出紀錄
    travelers: string[]; // 旅伴列表
    attractionGuides: Record<string, Guide>; // 景點深度導覽資料
    settings: Settings; // 設定
    categories: Category[]; // 類別定義
    title: string;      // 行程標題
    startDate: string;  // 開始日期 (YYYY-MM-DD)
}

const DEFAULT_GUIDES: Record<string, Guide> = {
    '太宰府': {
        color: 'from-pink-500 to-red-600',
        icon: 'fa-solid fa-torii-gate',
        desc: '祭祀學問之神菅原道真的總本宮，也是福岡最具代表性的神社。參道兩旁梅枝餅店家林立，是必吃的散步美食。這裡也以「飛梅傳說」與隈研吾設計的星巴克聞名。',
        tags: ['學問之神', '梅枝餅', '星巴克'],
        highlights: [
            '摸御神牛：據說摸頭會變聰明',
            '吃現烤梅枝餅：外酥內軟的紅豆餡餅',
            '星巴克表參道店：由隈研吾設計的木造建築'
        ],
        tips: '建議早上10點前抵達以避開團客。梅枝餅推薦「Kasanoya (かさの家)」與「寺田屋」。',
        link: 'https://www.dazaifutenmangu.or.jp/'
    },
    '一蘭': {
        color: 'from-red-600 to-red-800',
        icon: 'fa-solid fa-bowl-food',
        desc: '發源於福岡的天然豚骨拉麵，中洲總本店是整棟的「一蘭大樓」。二樓是知名的「味集中座位」，一樓則是呈現昭和復古風格的「屋台」店舖。',
        tags: ['豚骨拉麵', '總本店', '24小時'],
        highlights: [
            '個人味集中座位：專心品嚐拉麵',
            '總本店限定：釜燒豚骨拉麵',
            '洗手間的驚喜：掛滿衛生紙的牆面'
        ],
        tips: '總本店通常排隊很長，若想避開人潮可選擇深夜或清晨前往（24小時營業）。',
        link: 'https://ichiran.com/shop/kyushu/souhon/'
    },
    '門司港': {
        color: 'from-yellow-600 to-orange-600',
        icon: 'fa-solid fa-ship',
        desc: '保留了明治至大正時期的西洋建築，充滿懷舊浪漫氛圍。這裡是日本「燒咖哩」的發源地，還可以搭船前往對岸的山口縣下關唐戶市場。',
        tags: ['大正浪漫', '燒咖哩', '香蕉叫賣'],
        highlights: [
            '門司港車站：日本重要文化財',
            '舊門司三井俱樂部：愛因斯坦曾住過',
            '必吃燒咖哩：濃郁起司烤咖哩'
        ],
        tips: '建議購買「四葉草套票」可同時遊覽門司港與唐戶市場。與著名的「香蕉人像」合照是觀光客必做清單！',
        link: 'https://www.mojiko.info/'
    },
    '唐戶': {
        color: 'from-blue-500 to-blue-700',
        icon: 'fa-solid fa-fish',
        desc: '位於下關的唐戶市場是河豚的集散地。每逢週末與假日，市場內會舉辦「活力馬關街」，各家漁鋪會販售新鮮的握壽司，便宜又大碗。',
        tags: ['海鮮', '壽司市集', '河豚'],
        highlights: [
            '週末壽司市集：新鮮壽司一個 ¥100 起',
            '河豚刺身：下關名產',
            '關門海峽景色：坐在海邊吃壽司'
        ],
        tips: '市集僅在週五、六、日及國定假日舉辦。建議中午前抵達以免熱門品項售完。',
        link: 'https://www.karatoichiba.com/'
    },
    '屋台': {
        color: 'from-purple-600 to-indigo-800',
        icon: 'fa-solid fa-beer-mug-empty',
        desc: '福岡獨有的屋台（路邊攤）文化，集中在中洲、天神與長濱地區。在小小的攤位裡與老闆和其他客人聊天，是體驗福岡人情味的最佳方式。',
        tags: ['夜生活', '關東煮', '博多拉麵'],
        highlights: [
            '中洲屋台街：沿著那珂川的絕美夜景',
            '必點菜單：明太子玉子燒、關東煮、炒拉麵',
            '體驗在地人情味'
        ],
        tips: '1. 先確認價格再點餐。 2. 只有一人的話盡量坐緊一點。 3. 不要長坐，吃完即走是禮貌。 4. 部分店家不收信用卡，請準備現金。',
        link: ''
    },
    'LaLaport': {
        color: 'from-blue-400 to-indigo-500',
        icon: 'fa-solid fa-robot',
        desc: '2022年新開幕的大型購物中心，最大看點是入口處高達24.8公尺的實物大「ν鋼彈」立像，這是九州首次設置鋼彈立像。',
        tags: ['鋼彈', '購物', '親子'],
        highlights: [
            '實物大ν鋼彈立像：整點有聲光秀',
            'Gundam Park：鋼彈主題娛樂區',
            '九州美食街：集結福岡名店'
        ],
        tips: '鋼彈聲光秀通常在白天每小時整點進行，晚上則有特別影像演出。',
        link: 'https://mitsui-shopping-park.com/lalaport/fukuoka/'
    },
    '海之中道': {
        color: 'from-green-500 to-teal-600',
        icon: 'fa-solid fa-tree',
        desc: '位於博多灣北側的巨大國營公園，四季都有不同的花海（粉蝶花、波斯菊等）。園內設有動物之森，可以近距離接觸水豚與袋鼠。',
        tags: ['花海', '動物', '腳踏車'],
        highlights: [
            '租借腳踏車：最適合遊覽廣大園區的方式',
            '動物之森：水豚露天風呂（冬季）',
            '花之丘：整片絕美花海'
        ],
        tips: '園區非常大，強烈建議租借腳踏車。旁邊就是「海洋世界海之中道」水族館，可安排一日遊。',
        link: 'https://uminaka-park.jp/'
    }
}

const DEFAULT_DATA: Partial<TripState> = {
    title: '日本九州自由行',
    startDate: '2025-09-10',
    travelers: ['我', '旅伴'],
    expenses: [],
    backups: [
        { title: '博多運河城', location: '博多', category: 'shop', lat: 33.5896, lng: 130.4109, cost: 0, time: '' },
        { title: '福岡塔', location: '福岡', category: 'fun', time: '19:00', notes: '夜景', cost: 0 },
        { title: 'TeamLab', location: '福岡', category: 'fun', time: '14:00', notes: '室內雨備', cost: 0 }
    ],
    days: [
        {
            dateStr: '9/10 (Tue)',
            weatherIcon: 'fa-solid fa-sun text-orange-400',
            temp: 28,
            events: [
                { title: '抵達福岡機場 (FUK)', location: 'Fukuoka Airport', category: 'flight', time: '15:40', endTime: '16:30', notes: 'IT720, TPE -> FUK', cost: 0, lat: 33.5859, lng: 130.4506, flightInfo: { dep: 'TPE', arr: 'FUK', flightNo: 'IT720', depTime: '15:40', arrTime: '19:00' } },
                { title: '前往飯店', location: '博多', category: 'transport', time: '16:45', transport: { type: 'public', company: '福岡市地鐵', line: '機場線', direction: '姪濱/唐津', dep: '16:45', cost: 260, platform: '2', note: '往姪濱方向, 東比惠下車' }, cost: 260, lat: 33.5902, lng: 130.4284 },
                { title: 'APA Hotel Hakata', location: '博多駅東', category: 'stay', time: '17:30', notes: 'Check-in, 休息', cost: 0, lat: 33.5902, lng: 130.4284, bookingLink: 'https://www.booking.com/hotel/jp/apa-hakata-ekimae.html', stayInfo: { startDate: '2025-09-10', endDate: '2025-09-11', checkIn: '15:00', checkOut: '11:00', notes: '房號: 未定' } },
                { title: '一蘭拉麵 總本店', location: '中洲', category: 'food', time: '19:00', notes: '一蘭總社大樓, 需排隊', cost: 1200, link: 'https://tabelog.com/fukuoka/A4001/A400102/40000130/', lat: 33.5931, lng: 130.4045 },
                { title: '中洲屋台散策', location: '中洲川端', category: 'fun', time: '20:30', notes: '體驗屋台文化', cost: 2000, lat: 33.5925, lng: 130.4050 }
            ],
        },
        {
            dateStr: '9/11 (Wed)',
            weatherIcon: 'fa-solid fa-cloud text-gray-400',
            temp: 27,
            events: [
                { title: '移動: 博多 -> 小倉', location: '博多駅', category: 'transport', time: '09:00', transport: { type: 'express', company: 'JR九州', line: '特急 Sonic 9號', direction: '大分', dep: '09:02', cost: 2350, platform: '2', note: '自由席, 40分鐘車程' }, cost: 2350, lat: 33.5897, lng: 130.4207 },
                { title: '轉乘: 小倉 -> 門司港', location: '小倉駅', category: 'transport', time: '09:50', transport: { type: 'public', company: 'JR九州', line: '鹿兒島本線', direction: '門司港', dep: '09:55', cost: 280, note: '往門司港行' }, cost: 280, lat: 33.8872, lng: 130.8817 },
                { title: '門司港懷舊區', location: '門司港', category: 'fun', time: '10:15', notes: '舊門司三井俱樂部、香蕉人像', cost: 0, lat: 33.9443, lng: 130.9575 },
                { title: '燒咖哩 MILKHALL MOJIKO', location: '門司港', category: 'food', time: '11:30', notes: '必吃燒咖哩、布丁', link: 'https://tabelog.com/fukuoka/A4004/A400501/40003565/', cost: 1500, lat: 33.9450, lng: 130.9600 },
                { title: '搭船前往唐戶', location: '門司港棧橋', category: 'transport', time: '12:45', transport: { type: 'ferry', company: '關門汽船', line: '關門聯絡船', direction: '唐戶', dep: '13:00', cost: 400, note: '5分鐘船程' }, cost: 400, lat: 33.9460, lng: 130.9590 },
                { title: '唐戶市場', location: '下關', category: 'food', time: '13:10', notes: '週末限定壽司市集 (平日較少)', cost: 2000, lat: 33.9575, lng: 130.9416 },
                { title: '返回小倉', location: '下關 -> 小倉', category: 'transport', time: '14:30', transport: { type: 'public', company: 'JR西日本/九州', line: 'JR 山陽本線', direction: '小倉', dep: '14:45', cost: 280, note: '需轉車或搭公車至車站' }, cost: 280, lat: 33.9575, lng: 130.9416 },
                { title: '小倉城', location: '小倉', category: 'fun', time: '15:30', notes: '天守閣與庭園', cost: 350, lat: 33.8845, lng: 130.8745 },
                { title: '旦過市場', location: '小倉', category: 'food', time: '17:00', notes: '北九州的廚房、大學丼', cost: 1000, lat: 33.8820, lng: 130.8780 },
                { title: '回程: 小倉 -> 博多', location: '小倉駅', category: 'transport', time: '18:30', transport: { type: 'express', company: 'JR西日本', line: '新幹線 Sakura 565號', direction: '博多', dep: '18:39', cost: 2160, platform: '13', note: '17分鐘極速回博多 (自由席)' }, cost: 2160, lat: 33.8872, lng: 130.8817 },
            ]
        },
        {
            dateStr: '9/12 (Thu)',
            weatherIcon: 'fa-solid fa-cloud-rain text-blue-400',
            temp: 26,
            events: [
                { title: '前往太宰府', location: '西鐵天神駅', category: 'transport', time: '09:00', transport: { type: 'public', company: '西鐵', line: '天神大牟田線', direction: '太宰府', dep: '09:00', cost: 410, note: '旅人號觀光列車 (需確認時刻)' }, cost: 410, lat: 33.5900, lng: 130.4000 },
                { title: '太宰府天滿宮', location: '太宰府', category: 'fun', time: '10:00', notes: '摸御神牛、梅枝餅', cost: 150, lat: 33.5196, lng: 130.5338 },
                { title: '星巴克 表參道店', location: '太宰府', category: 'food', time: '11:00', notes: '隈研吾設計', cost: 600, lat: 33.5185, lng: 130.5320 },
                { title: '竈門神社', location: '寶滿山', category: 'fun', time: '12:00', notes: '搭乘社區巴士 Mahoroba, 鬼滅聖地', cost: 100, lat: 33.5350, lng: 130.5480 },
                { title: '前往 LaLaport', location: '太宰府 -> 竹下', category: 'transport', time: '14:30', transport: { type: 'public', company: '西鐵巴士', line: '西鐵巴士 / 電車', direction: '博多', cost: 500, note: '建議回天神轉車或搭直達巴' }, cost: 500, lat: 33.5196, lng: 130.5338 },
                { title: 'LaLaport 福岡', location: '博多那珂', category: 'shop', time: '15:30', notes: '實物大 ν鋼彈立像 (整點聲光秀)', cost: 0, lat: 33.5654, lng: 130.4428, discounts: [{ name: '外國人 5% OFF', url: 'https://mitsui-shopping-park.com/lalaport/fukuoka/tw/coupon/' }, { name: '松本清 3-7% OFF', url: 'https://www.matsukiyo.co.jp/coupon' }] },
                { title: '大濠公園', location: '大濠公園', category: 'fun', time: '18:00', notes: '黃昏散步、湖景', cost: 0, lat: 33.5857, lng: 130.3763 },
                { title: '晚餐:牛腸鍋', location: '博多', category: 'food', time: '20:00', notes: '大山 or 前田屋', cost: 3500, lat: 33.5902, lng: 130.4207 }
            ]
        },
        {
            dateStr: '9/13 (Fri)',
            weatherIcon: 'fa-solid fa-sun text-orange-400',
            temp: 29,
            events: [
                { title: '前往海之中道', location: '博多駅', category: 'transport', time: '09:30', transport: { type: 'public', company: 'JR九州', line: '香椎線', direction: '西戶崎', dep: '09:35', cost: 480, note: '香椎轉車 -> 海之中道' }, cost: 480, lat: 33.5897, lng: 130.4207 },
                { title: '海之中道海濱公園', location: '海之中道', category: 'fun', time: '10:30', notes: '租借腳踏車 (¥500), 花海', cost: 950, lat: 33.6600, lng: 130.3500 },
                { title: '海洋世界海之中道', location: '海之中道', category: 'fun', time: '13:00', notes: '海豚表演', cost: 2500, lat: 33.6590, lng: 130.3550, ticketLink: 'https://www.klook.com/zh-TW/activity/12345-marine-world-fukuoka/' },
                { title: '回程 & 採購', location: '博多', category: 'shop', time: '16:00', notes: '博多車站手信', cost: 5000, lat: 33.5897, lng: 130.4207 }
            ]
        }
    ]
}

export const useTripStore = defineStore('trip', {
    state: (): TripState => ({
        days: [],
        backups: [],
        expenses: [],
        travelers: [],
        attractionGuides: {},
        settings: {
            currency: 'JPY' // Default global currency
        },
        categories: [
            { id: 'fun', name: '景點', icon: 'fa-solid fa-torii-gate' },
            { id: 'food', name: '美食', icon: 'fa-solid fa-utensils' },
            { id: 'shop', name: '購物', icon: 'fa-solid fa-bag-shopping' },
            { id: 'stay', name: '住宿', icon: 'fa-solid fa-bed' },
            { id: 'transport', name: '交通', icon: 'fa-solid fa-train' },
            { id: 'flight', name: '航班', icon: 'fa-solid fa-plane' },
        ],
        title: '日本九州自由行',
        startDate: '2025-09-10'
    }),
    getters: {
        currencies: (): Record<string, Currency> => ({
            'TWD': { symbol: 'NT$', rate: 0.22, name: '新台幣 (台灣)' }, // 1 JPY = 0.22 TWD
            'JPY': { symbol: '¥', rate: 1, name: '日圓 (日本)' },
            'KRW': { symbol: '₩', rate: 9.0, name: '韓元 (韓國)' }, // 1 JPY = 9 KRW
            'USD': { symbol: '$', rate: 0.0067, name: '美金 (美國)' }, // 1 JPY = 0.0067 USD
            'CNY': { symbol: '¥', rate: 0.048, name: '人民幣 (中國)' } // 1 JPY = 0.048 CNY
        }),
        currentCurrency(): Currency {
            return this.currencies[this.settings.currency] || this.currencies['JPY']
        }
    },
    actions: {
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
                    this.attractionGuides = parsed.attractionGuides || JSON.parse(JSON.stringify(DEFAULT_GUIDES))
                    this.settings = parsed.settings || { currency: 'JPY' }
                    this.title = parsed.title || DEFAULT_DATA.title
                    this.startDate = parsed.startDate || DEFAULT_DATA.startDate

                    // Migration: Ensure all events and expenses have a currency
                    this.days.forEach(day => {
                        day.events.forEach(event => {
                            if (!event.currency) event.currency = this.settings.currency
                        })
                    })
                    this.expenses.forEach(exp => {
                        if (!exp.currency) exp.currency = this.settings.currency
                    })

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
                attractionGuides: this.attractionGuides,
                settings: this.settings,
                title: this.title,
                startDate: this.startDate
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        },
        loadExampleData() {
            this.days = JSON.parse(JSON.stringify(DEFAULT_DATA.days))
            this.backups = JSON.parse(JSON.stringify(DEFAULT_DATA.backups || []))
            this.expenses = JSON.parse(JSON.stringify(DEFAULT_DATA.expenses))
            this.travelers = JSON.parse(JSON.stringify(DEFAULT_DATA.travelers))
            this.attractionGuides = JSON.parse(JSON.stringify(DEFAULT_GUIDES))
            this.settings = { currency: 'JPY' }
            this.title = DEFAULT_DATA.title || 'Easy Trip'
            this.startDate = DEFAULT_DATA.startDate || '2025-09-10'

            // Initialize default data with default currency
            this.days.forEach(day => {
                day.events.forEach(event => {
                    event.currency = 'JPY'
                })
            })

            this.saveData()
        },
        clearData() {
            this.days = []
            this.backups = []
            this.expenses = []
            this.travelers = ['我']
            this.attractionGuides = {}
            this.settings = { currency: 'JPY' }
            this.title = '我的行程'
            this.startDate = new Date().toISOString().split('T')[0]
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
                weatherIcon: 'fa-solid fa-sun text-gray-400', // Default weather
                temp: 25, // Default temp
                events: []
            }

            this.days.push(newDay)
            this.saveData()
        },
        updateTravelers(travelers: string[]) {
            this.travelers = travelers
            this.saveData()
        }
    }
})
