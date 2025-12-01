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

export interface TransportPass {
    id: string;
    name: string;
    imageUrl: string;
}

export interface TransportSchedule {
    dep: string;        // 出發時間 (HH:MM)
    arr?: string;       // 抵達時間 (HH:MM)
    note?: string;      // 備註
}

export interface Transport {
    type: 'walk' | 'public' | 'express' | 'ferry' | 'taxi' | 'drive' | 'flight'; // 交通類型
    // Common (通用)
    dep?: string;       // 出發時間 (HH:MM)
    arr?: string;       // 抵達時間 (HH:MM)
    cost?: number;      // 費用
    duration?: number;  // 時間長度 (分鐘)
    direction?: string; // 開往方向 (e.g. 往新宿)

    // Public (Bus/Subway - 公車/地鐵)
    line?: string;      // 路線 (e.g. 機場線, 50號公車)

    // Express (Shinkansen/Train - 新幹線/特急)
    trainNumber?: string; // 班次 (e.g. 回聲號 855)
    car?: string;         // 車廂/座位 (e.g. 自由席, 5號車 3A)
    platform?: string;    // 月台

    // Flight (飛機)
    flightNo?: string;    // 航班編號 (e.g. IT240)
    depAirport?: string;  // 出發機場 (e.g. TPE)
    arrAirport?: string;  // 抵達機場 (e.g. FUK)

    // Ferry / Taxi / Drive / Public / Flight (船/計程車/自駕/大眾運輸/飛機)
    company?: string;     // 營運公司 / 船公司 / 計程車行 / 租車公司 / 航空公司

    // Schedules (Express & Ferry - 前後班次)
    schedules?: TransportSchedule[]; // Max 5 sets of prev/next info

    note?: string; // 通用備註
    passId?: string; // 使用的交通票券 ID
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
    lat?: number;       // 緯度 (use mapUrl)
    lng?: number;       // 經度 (use mapUrl)
    mapUrl?: string;    // Google Maps 連結
    link?: string;      // 相關連結 (e.g. Tabelog)
    ticketLink?: string; // 購票連結 (e.g. Klook)
    bookingLink?: string; // 訂房連結 (e.g. Booking.com)
    transports?: Transport[]; // 交通資訊 (前往目的地的交通資訊，支援多段轉乘)
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
    timeFormat?: '12h' | '24h'; // 時間格式 (12h/24h)
    voiceURI?: string; // 語音設定
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
    passes: TransportPass[]; // 交通票券列表
    title: string;      // 行程標題
    startDate: string;  // 開始日期 (YYYY-MM-DD)
    headerCollapsed: boolean; // 標題列是否收合
    currencies: Record<string, Currency>; // 匯率設定
    isOnboardingOpen: boolean; // 是否顯示導覽
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
    },
    '天神': {
        color: 'from-gray-700 to-gray-900',
        icon: 'fa-solid fa-bag-shopping',
        desc: '九州最大的繁華街，百貨公司林立。全長約600公尺的「天神地下街」以19世紀歐洲風格設計，連接各大百貨與地鐵站，是雨天購物的最佳去處。',
        tags: ['購物', '地下街', '百貨'],
        highlights: [
            '天神地下街：絕美歐風街道',
            '福岡PARCO：年輕潮流品牌',
            '大丸/三越：老牌百貨'
        ],
        tips: '地下街錯綜複雜，建議下載地圖。每逢1號有「天神日」促銷。',
        link: 'https://www.tenchika.com/'
    }
}

const DEFAULT_DATA: Partial<TripState> = {
    title: '日本九州自由行',
    startDate: '2025-09-10',
    travelers: ['我', '旅伴'],
    expenses: [],
    passes: [],
    backups: [
        { title: '博多運河城', location: '博多', category: 'shop', lat: 33.5896, lng: 130.4109, cost: 0, time: '' },
        { title: '福岡塔', location: '福岡', category: 'fun', time: '19:00', notes: '夜景', cost: 0 },
        { title: 'TeamLab', location: '福岡', category: 'fun', time: '14:00', notes: '室內雨備', cost: 0 }
    ],
    days: [
        {
            dateStr: '9/10 (Tue)',
            events: [
                { title: '抵達福岡機場 (FUK)', location: 'Fukuoka Airport', category: 'flight', time: '15:40', endTime: '16:30', notes: 'IT720, TPE -> FUK', cost: 0, lat: 33.5859, lng: 130.4506, transports: [{ type: 'flight', flightNo: 'IT720', depAirport: 'TPE', arrAirport: 'FUK', dep: '15:40', arr: '19:00' }] },
                { title: '前往飯店', location: '博多', category: 'transport', time: '16:45', transports: [{ type: 'public', company: '福岡市地鐵', line: '機場線', direction: '姪濱/唐津', dep: '16:45', cost: 260, platform: '2', note: '往姪濱方向, 東比惠下車' }], cost: 260, lat: 33.5902, lng: 130.4284 },
                { title: 'APA Hotel Hakata', location: '博多駅東', category: 'stay', time: '17:30', notes: 'Check-in, 休息', cost: 0, lat: 33.5902, lng: 130.4284, bookingLink: 'https://www.booking.com/hotel/jp/apa-hakata-ekimae.html', stayInfo: { startDate: '2025-09-10', endDate: '2025-09-13', checkIn: '15:00', checkOut: '11:00', notes: '房號: 301' } },
                { title: '一蘭拉麵 總本店', location: '中洲', category: 'food', time: '19:00', notes: '一蘭總社大樓, 需排隊', cost: 1200, link: 'https://tabelog.com/fukuoka/A4001/A400102/40000130/', lat: 33.5931, lng: 130.4045, linkedGuide: '一蘭' },
                { title: '中洲屋台散策', location: '中洲川端', category: 'fun', time: '20:30', notes: '體驗屋台文化', cost: 2000, lat: 33.5925, lng: 130.4050, linkedGuide: '屋台' }
            ],
        },
        {
            dateStr: '9/11 (Wed)',
            events: [
                { title: '移動: 博多 -> 小倉', location: '博多駅', category: 'transport', time: '09:00', transports: [{ type: 'express', company: 'JR九州', line: '特急 Sonic 9號', direction: '大分', dep: '09:02', cost: 2350, platform: '2', note: '自由席, 40分鐘車程', schedules: [{ dep: '08:20', arr: '09:05', note: 'Sonic 7號' }, { dep: '09:20', arr: '10:05', note: 'Sonic 11號' }] }], cost: 2350, lat: 33.5897, lng: 130.4207 },
                { title: '轉乘: 小倉 -> 門司港', location: '小倉駅', category: 'transport', time: '09:50', transports: [{ type: 'public', company: 'JR九州', line: '鹿兒島本線', direction: '門司港', dep: '09:55', cost: 280, note: '往門司港行' }], cost: 280, lat: 33.8872, lng: 130.8817 },
                { title: '門司港懷舊區', location: '門司港', category: 'fun', time: '10:15', notes: '舊門司三井俱樂部、香蕉人像', cost: 0, lat: 33.9443, lng: 130.9575, linkedGuide: '門司港' },
                { title: '燒咖哩 MILKHALL MOJIKO', location: '門司港', category: 'food', time: '11:30', notes: '必吃燒咖哩、布丁', link: 'https://tabelog.com/fukuoka/A4004/A400501/40003565/', cost: 1500, lat: 33.9450, lng: 130.9600 },
                { title: '搭船前往唐戶', location: '門司港棧橋', category: 'transport', time: '12:45', transports: [{ type: 'ferry', company: '關門汽船', line: '關門聯絡船', direction: '唐戶', dep: '13:00', cost: 400, note: '5分鐘船程', schedules: [{ dep: '12:40', note: '前一班' }, { dep: '13:20', note: '後一班' }] }], cost: 400, lat: 33.9460, lng: 130.9590 },
                { title: '唐戶市場', location: '下關', category: 'food', time: '13:10', notes: '週末限定壽司市集 (平日較少)', cost: 2000, lat: 33.9575, lng: 130.9416, linkedGuide: '唐戶' },
                { title: '返回小倉', location: '下關 -> 小倉', category: 'transport', time: '14:30', transports: [{ type: 'public', company: 'JR西日本/九州', line: 'JR 山陽本線', direction: '小倉', dep: '14:45', cost: 280, note: '需轉車或搭公車至車站' }], cost: 280, lat: 33.9575, lng: 130.9416 },
                { title: '小倉城', location: '小倉', category: 'fun', time: '15:30', notes: '天守閣與庭園', cost: 350, lat: 33.8845, lng: 130.8745 },
                { title: '旦過市場', location: '小倉', category: 'food', time: '17:00', notes: '北九州的廚房、大學丼', cost: 1000, lat: 33.8820, lng: 130.8780 },
                { title: '回程: 小倉 -> 博多', location: '小倉駅', category: 'transport', time: '18:30', transports: [{ type: 'express', company: 'JR西日本', line: '新幹線 Sakura 565號', direction: '博多', dep: '18:39', cost: 2160, platform: '13', note: '17分鐘極速回博多 (自由席)' }], cost: 2160, lat: 33.8872, lng: 130.8817 },
            ]
        },
        {
            dateStr: '9/12 (Thu)',
            events: [
                { title: '前往太宰府', location: '西鐵天神駅', category: 'transport', time: '09:00', transports: [{ type: 'public', company: '西鐵', line: '天神大牟田線', direction: '太宰府', dep: '09:00', cost: 410, note: '旅人號觀光列車 (需確認時刻)' }], cost: 410, lat: 33.5900, lng: 130.4000 },
                { title: '太宰府天滿宮', location: '太宰府', category: 'fun', time: '10:00', notes: '摸御神牛、梅枝餅', cost: 150, lat: 33.5196, lng: 130.5338, linkedGuide: '太宰府' },
                { title: '星巴克 表參道店', location: '太宰府', category: 'food', time: '11:00', notes: '隈研吾設計', cost: 600, lat: 33.5185, lng: 130.5320 },
                { title: '竈門神社', location: '寶滿山', category: 'fun', time: '12:00', notes: '搭乘社區巴士 Mahoroba, 鬼滅聖地', cost: 100, lat: 33.5350, lng: 130.5480 },
                { title: '前往 LaLaport', location: '太宰府 -> 竹下', category: 'transport', time: '14:30', transports: [{ type: 'public', company: '西鐵巴士', line: '西鐵巴士 / 電車', direction: '博多', cost: 500, note: '建議回天神轉車或搭直達巴' }], cost: 500, lat: 33.5196, lng: 130.5338 },
                { title: 'LaLaport 福岡', location: '博多那珂', category: 'shop', time: '15:30', notes: '實物大 ν鋼彈立像 (整點聲光秀)', cost: 0, lat: 33.5654, lng: 130.4428, discounts: [{ name: '外國人 5% OFF', url: 'https://mitsui-shopping-park.com/lalaport/fukuoka/tw/coupon/' }, { name: '松本清 3-7% OFF', url: 'https://www.matsukiyo.co.jp/coupon' }], linkedGuide: 'LaLaport' },
                { title: '天神地下街', location: '天神', category: 'shop', time: '17:30', notes: '歐風地下街，連接各大百貨', cost: 5000, lat: 33.5900, lng: 130.4000, discounts: [{ name: '大丸百貨 5% OFF', url: 'https://www.daimaru.co.jp/foreign/coupon/' }, { name: '免稅店優惠', url: 'https://www.tenchika.com/coupon/' }], linkedGuide: '天神' },
                { title: '晚餐:牛腸鍋', location: '博多', category: 'food', time: '20:00', notes: '大山 or 前田屋', cost: 3500, lat: 33.5902, lng: 130.4207 }
            ]
        },
        {
            dateStr: '9/13 (Fri)',
            events: [
                {
                    title: '前往海之中道', location: '博多駅', category: 'transport', time: '09:00', transports: [
                        { type: 'public', company: '福岡市地鐵', line: '機場線', direction: '貝塚', dep: '09:00', arr: '09:10', cost: 260, note: '博多 -> 中洲川端 -> 貝塚' },
                        { type: 'public', company: '西鐵', line: '貝塚線', direction: '西鐵新宮', dep: '09:20', arr: '09:35', cost: 270, note: '貝塚 -> 和白' },
                        { type: 'public', company: 'JR九州', line: '香椎線', direction: '西戶崎', dep: '09:45', arr: '10:00', cost: 230, note: '和白 -> 海之中道' }
                    ], cost: 760, lat: 33.5897, lng: 130.4207
                },
                { title: '海之中道海濱公園', location: '海之中道', category: 'fun', time: '10:15', notes: '租借腳踏車 (¥500), 花海', cost: 950, lat: 33.6600, lng: 130.3500, linkedGuide: '海之中道' },
                { title: '海洋世界海之中道', location: '海之中道', category: 'fun', time: '13:00', notes: '海豚表演', cost: 2500, lat: 33.6590, lng: 130.3550, ticketLink: 'https://www.klook.com/zh-TW/activity/2502-marine-world-uminonakamichi-fukuoka/' },
                { title: '回程: 海之中道 -> 博多', location: '海之中道', category: 'transport', time: '15:30', transports: [{ type: 'ferry', company: '安田產業汽船', line: '海中道航線', direction: '博多埠頭', dep: '15:40', arr: '16:00', cost: 1100, note: '高速船直達' }], cost: 1100, lat: 33.6590, lng: 130.3550 },
                { title: '最後採購 & 領行李', location: '博多駅', category: 'shop', time: '16:30', notes: '博多阪急、AMU PLAZA', cost: 8000, lat: 33.5897, lng: 130.4207 },
                { title: '前往機場', location: '博多 -> 福岡機場', category: 'transport', time: '18:00', transports: [{ type: 'public', company: '福岡市地鐵', line: '機場線', direction: '福岡機場', dep: '18:15', cost: 260, note: '5分鐘直達' }], cost: 260, lat: 33.5897, lng: 130.4207 },
                { title: '搭機返台 (TPE)', location: 'Fukuoka Airport', category: 'flight', time: '19:00', endTime: '20:40', notes: 'IT721, FUK -> TPE', cost: 0, lat: 33.5859, lng: 130.4506, transports: [{ type: 'flight', flightNo: 'IT721', depAirport: 'FUK', arrAirport: 'TPE', dep: '19:55', arr: '21:30' }] }
            ]
        }
    ]
}

export const useTripStore = defineStore('trip', {
    state: (): TripState => ({
        title: '我的日本之旅',
        startDate: new Date().toISOString().slice(0, 10),
        settings: {
            currency: 'JPY',
            timeFormat: '24h',
            voiceURI: ''
        },
        travelers: ['我'],
        days: [],
        backups: [],
        expenses: [],
        passes: [],
        currencies: {
            'JPY': { name: '日圓 (日本)', symbol: '¥', rate: 1 },
            'TWD': { name: '新台幣 (台灣)', symbol: 'NT$', rate: 0.21 }, // 預設匯率
        },
        attractionGuides: {},
        isOnboardingOpen: false,
        categories: [
            { id: 'fun', name: '景點', icon: 'fa-solid fa-torii-gate' },
            { id: 'food', name: '美食', icon: 'fa-solid fa-utensils' },
            { id: 'shop', name: '購物', icon: 'fa-solid fa-bag-shopping' },
            { id: 'stay', name: '住宿', icon: 'fa-solid fa-bed' },
            { id: 'transport', name: '交通', icon: 'fa-solid fa-train' },
            { id: 'flight', name: '航班', icon: 'fa-solid fa-plane' },
        ],
        headerCollapsed: false
    }),
    getters: {
        currentCurrency(): Currency {
            return this.currencies[this.settings.currency] || this.currencies['JPY']
        }
    },
    actions: {
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
                passes: this.passes,
                attractionGuides: this.attractionGuides,
                settings: this.settings,
                title: this.title,
                startDate: this.startDate,
                currencies: this.currencies
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
            this.settings = { currency: 'JPY', timeFormat: '24h', voiceURI: '' }
            this.title = DEFAULT_DATA.title || 'Easy Trip'
            this.startDate = DEFAULT_DATA.startDate || '2025-09-10'
            this.currencies = {
                'TWD': { symbol: 'NT$', rate: 0.22, name: '新台幣 (台灣)' },
                'JPY': { symbol: '¥', rate: 1, name: '日圓 (日本)' }
            }

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
            this.days = []
            this.backups = []
            this.expenses = []
            this.travelers = ['我']
            this.passes = []
            this.attractionGuides = {}
            this.settings = { currency: 'JPY', timeFormat: '24h', voiceURI: '' } // Updated default settings
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
            this.saveData()
        },
        setHeaderCollapsed(collapsed: boolean) {
            this.headerCollapsed = collapsed
        },
        updateCurrencyRate(code: string, rate: number) {
            if (this.currencies[code]) {
                this.currencies[code].rate = rate
                this.saveData()
            }
        }
    }
})
