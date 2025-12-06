/**
 * 預設導覽資料
 * 從 trip.ts 抽取，用於初始化和範例展示
 */
import type { Guide } from '../stores/types'

export const DEFAULT_GUIDES: Record<string, Guide> = {
    '太宰府': {
        id: 'guide_dazaifu',
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
        original_url: 'https://www.dazaifutenmangu.or.jp/',
        media_type: 'web',
        location: { name: '福岡・太宰府' },
        user_notes: '必吃梅枝餅！',
        status: 'want_to_go'
    },
    '一蘭': {
        id: 'guide_ichiran',
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
        original_url: 'https://ichiran.com/shop/kyushu/souhon/',
        media_type: 'web',
        location: { name: '福岡・中洲' },
        user_notes: '半夜去吃不用排隊',
        status: 'want_to_go'
    },
    '門司港': {
        id: 'guide_mojiko',
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
        original_url: 'https://www.mojiko.info/',
        media_type: 'web',
        location: { name: '北九州・門司港' },
        user_notes: '要吃燒咖哩',
        status: 'planned'
    },
    '唐戶': {
        id: 'guide_karato',
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
        original_url: 'https://www.karatoichiba.com/',
        media_type: 'web',
        location: { name: '山口・下關' },
        user_notes: '週末才有壽司市集',
        status: 'planned'
    },
    '屋台': {
        id: 'guide_yatai',
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
        original_url: '',
        media_type: 'web',
        location: { name: '福岡・中洲/天神' },
        user_notes: '記得帶現金',
        status: 'want_to_go'
    },
    'LaLaport': {
        id: 'guide_lalaport',
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
        original_url: 'https://mitsui-shopping-park.com/lalaport/fukuoka/',
        media_type: 'web',
        location: { name: '福岡・博多' },
        user_notes: '看鋼彈',
        status: 'visited'
    },
    '海之中道': {
        id: 'guide_uminonakamichi',
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
        original_url: 'https://uminaka-park.jp/',
        media_type: 'web',
        location: { name: '福岡・海之中道' },
        user_notes: '租腳踏車',
        status: 'want_to_go'
    },
    '天神': {
        id: 'guide_tenjin',
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
        original_url: 'https://www.tenchika.com/',
        media_type: 'web',
        location: { name: '福岡・天神' },
        user_notes: '逛街',
        status: 'want_to_go'
    },
    'AI 智能匯入教學': {
        id: 'guide_ai_tutorial',
        color: 'from-violet-500 to-fuchsia-600',
        icon: 'fa-solid fa-wand-magic-sparkles',
        desc: '這是一個強大的 AI 助手功能，可以幫您將 Instagram 貼文、部落格文章或任何旅遊資訊，一鍵轉換成精美的旅遊卡片！',
        tags: ['AI助手', '自動匯入', '省時神器'],
        highlights: [
            '複製貼上：支援 IG 貼文內容或網誌文字',
            '自動分析：AI 會自動抓取地點、重點與建議',
            '一鍵生成：馬上建立專屬的旅遊卡片'
        ],
        tips: '1. 點擊上方的「AI 智能匯入」按鈕。\n2. 貼上您看到的旅遊資訊文字。\n3. 按下「開始分析」，AI 就會幫您整理好囉！',
        original_url: '',
        media_type: 'web',
        location: { name: 'Easy Trip AI' },
        user_notes: '試試看用 AI 幫我整理行程！',
        status: 'planned'
    }
}
