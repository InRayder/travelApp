/**
 * 範例行程資料
 * 從 trip.ts 抽取，用於「載入範例行程」功能
 */
import type { TripState, Event } from '../stores/types'

export const EXAMPLE_TRIP: Partial<TripState> = {
    title: '日本九州自由行',
    startDate: '2025-09-10',
    travelers: ['我', '旅伴'],
    expenses: [],
    passes: [
        { id: 'pass_jr_kyushu', name: 'JR 九州鐵路周遊券 (北九州 3日)', imageUrl: 'https://www.jrkyushu.co.jp/english/railpass/img/railpass_img_01.jpg' }
    ],
    backups: [
        { title: '博多運河城', location: '博多', category: 'shop', lat: 33.5896, lng: 130.4109, cost: 0, time: '' },
        { title: '福岡塔', location: '福岡', category: 'fun', time: '19:00', notes: '夜景', cost: 0 },
        { title: 'TeamLab', location: '福岡', category: 'fun', time: '14:00', notes: '室內雨備', cost: 0 }
    ] as Event[],
    days: [
        {
            dateStr: '9/10 (Tue)',
            events: [
                { title: '抵達福岡機場 (FUK)', location: 'Fukuoka Airport', category: 'flight', time: '15:40', endTime: '16:30', notes: 'IT720, TPE -> FUK', cost: 0, lat: 33.5859, lng: 130.4506, transports: [{ type: 'flight', flightNo: 'IT720', depAirport: 'TPE', arrAirport: 'FUK', dep: '15:40', arr: '19:00', duration: 140 }] },
                { title: 'APA Hotel Hakata', location: '博多駅東', category: 'stay', time: '17:30', notes: 'Check-in, 休息', cost: 0, lat: 33.5902, lng: 130.4284, bookingLink: 'https://www.booking.com/hotel/jp/apa-hakata-ekimae.html', stayInfo: { startDate: '2025-09-10', endDate: '2025-09-13', checkIn: '15:00', checkOut: '11:00', notes: '房號: 301' }, transports: [{ type: 'public', company: '福岡市地鐵', line: '機場線', direction: '姪濱/唐津', dep: '16:45', cost: 260, platform: '2', note: '往姪濱方向, 東比惠下車', duration: 15 }] },
                { title: '一蘭拉麵 總本店', location: '中洲', category: 'food', time: '19:00', notes: '一蘭總社大樓, 需排隊', cost: 1200, link: 'https://tabelog.com/fukuoka/A4001/A400102/40000130/', lat: 33.5931, lng: 130.4045, linkedGuide: '一蘭' },
                { title: '中洲屋台散策', location: '中洲川端', category: 'fun', time: '20:30', notes: '體驗屋台文化', cost: 2000, lat: 33.5925, lng: 130.4050, linkedGuide: '屋台' }
            ],
        },
        {
            dateStr: '9/11 (Wed)',
            events: [
                { title: '移動: 博多 -> 小倉', location: '博多駅', category: 'transport', time: '09:00', transports: [{ type: 'express', company: 'JR九州', line: '特急 Sonic 9號', direction: '大分', dep: '09:02', cost: 2350, platform: '2', note: '自由席, 40分鐘車程', duration: 40, passId: 'pass_jr_kyushu', schedules: [{ dep: '08:20', arr: '09:05', note: 'Sonic 7號' }, { dep: '09:20', arr: '10:05', note: 'Sonic 11號' }] }], cost: 2350, lat: 33.5897, lng: 130.4207 },
                { title: '門司港懷舊區', location: '門司港', category: 'fun', time: '10:15', notes: '舊門司三井俱樂部、香蕉人像', cost: 0, lat: 33.9443, lng: 130.9575, linkedGuide: '門司港', transports: [{ type: 'public', company: 'JR九州', line: '鹿兒島本線', direction: '門司港', dep: '09:55', cost: 280, note: '往門司港行', duration: 15, passId: 'pass_jr_kyushu' }] },
                { title: '燒咖哩 MILKHALL MOJIKO', location: '門司港', category: 'food', time: '11:30', notes: '必吃燒咖哩、布丁', link: 'https://tabelog.com/fukuoka/A4004/A400501/40003565/', cost: 1500, lat: 33.9450, lng: 130.9600 },
                { title: '搭船前往唐戶', location: '門司港棧橋', category: 'transport', time: '12:45', transports: [{ type: 'ferry', company: '關門汽船', line: '關門聯絡船', direction: '唐戶', dep: '13:00', cost: 400, note: '5分鐘船程', duration: 5, schedules: [{ dep: '12:40', note: '前一班' }, { dep: '13:20', note: '後一班' }] }], cost: 400, lat: 33.9460, lng: 130.9590 },
                { title: '唐戶市場', location: '下關', category: 'food', time: '13:10', notes: '週末限定壽司市集 (平日較少)', cost: 2000, lat: 33.9575, lng: 130.9416, linkedGuide: '唐戶' },
                { title: '小倉城', location: '小倉', category: 'fun', time: '15:30', notes: '天守閣與庭園', cost: 350, lat: 33.8845, lng: 130.8745, transports: [{ type: 'public', company: 'JR西日本/九州', line: 'JR 山陽本線', direction: '小倉', dep: '14:45', cost: 280, note: '需轉車或搭公車至車站', duration: 15 }] },
                { title: '旦過市場', location: '小倉', category: 'food', time: '17:00', notes: '北九州的廚房、大學丼', cost: 1000, lat: 33.8820, lng: 130.8780 },
                { title: '回程: 小倉 -> 博多', location: '小倉駅', category: 'transport', time: '18:30', transports: [{ type: 'express', company: 'JR西日本', line: '新幹線 Sakura 565號', direction: '博多', dep: '18:39', cost: 2160, platform: '13', note: '17分鐘極速回博多 (自由席)', duration: 17, passId: 'pass_jr_kyushu' }], cost: 2160, lat: 33.8872, lng: 130.8817 },
            ]
        },
        {
            dateStr: '9/12 (Thu)',
            events: [
                { title: '太宰府天滿宮', location: '太宰府', category: 'fun', time: '10:00', notes: '摸御神牛、梅枝餅', cost: 150, lat: 33.5196, lng: 130.5338, linkedGuide: '太宰府', transports: [{ type: 'public', company: '西鐵', line: '天神大牟田線', direction: '太宰府', dep: '09:00', cost: 410, note: '旅人號觀光列車 (需確認時刻)', duration: 40 }] },
                { title: '星巴克 表參道店', location: '太宰府', category: 'food', time: '11:00', notes: '隈研吾設計', cost: 600, lat: 33.5185, lng: 130.5320 },
                { title: '竈門神社', location: '寶滿山', category: 'fun', time: '12:00', notes: '搭乘社區巴士 Mahoroba, 鬼滅聖地', cost: 100, lat: 33.5350, lng: 130.5480 },
                { title: 'LaLaport 福岡', location: '博多那珂', category: 'shop', time: '15:30', notes: '實物大 ν鋼彈立像 (整點聲光秀)', cost: 0, lat: 33.5654, lng: 130.4428, discounts: [{ name: '外國人 5% OFF', url: 'https://mitsui-shopping-park.com/lalaport/fukuoka/tw/coupon/' }, { name: '松本清 3-7% OFF', url: 'https://www.matsukiyo.co.jp/coupon' }], linkedGuide: 'LaLaport', transports: [{ type: 'public', company: '西鐵巴士', line: '西鐵巴士 / 電車', direction: '博多', cost: 500, note: '建議回天神轉車或搭直達巴', duration: 45, dep: '14:30' }] },
                { title: '天神地下街', location: '天神', category: 'shop', time: '17:30', notes: '歐風地下街，連接各大百貨', cost: 5000, lat: 33.5900, lng: 130.4000, discounts: [{ name: '大丸百貨 5% OFF', url: 'https://www.daimaru.co.jp/foreign/coupon/' }, { name: '免稅店優惠', url: 'https://www.tenchika.com/coupon/' }], linkedGuide: '天神' },
                { title: '晚餐:牛腸鍋', location: '博多', category: 'food', time: '20:00', notes: '大山 or 前田屋', cost: 3500, lat: 33.5902, lng: 130.4207 }
            ]
        },
        {
            dateStr: '9/13 (Fri)',
            events: [
                {
                    title: '前往海之中道', location: '博多駅', category: 'transport', time: '09:00', transports: [
                        { type: 'public', company: '福岡市地鐵', line: '機場線', direction: '貝塚', dep: '09:00', arr: '09:10', cost: 260, note: '博多 -> 中洲川端 -> 貝塚', duration: 10 },
                        { type: 'public', company: '西鐵', line: '貝塚線', direction: '西鐵新宮', dep: '09:20', arr: '09:35', cost: 270, note: '貝塚 -> 和白', duration: 15 },
                        { type: 'public', company: 'JR九州', line: '香椎線', direction: '西戶崎', dep: '09:45', arr: '10:00', cost: 230, note: '和白 -> 海之中道', duration: 15, passId: 'pass_jr_kyushu' }
                    ], cost: 760, lat: 33.5897, lng: 130.4207
                },
                { title: '海之中道海濱公園', location: '海之中道', category: 'fun', time: '10:15', notes: '租借腳踏車 (¥500), 花海', cost: 950, lat: 33.6600, lng: 130.3500, linkedGuide: '海之中道' },
                { title: '海洋世界海之中道', location: '海之中道', category: 'fun', time: '13:00', notes: '海豚表演', cost: 2500, lat: 33.6590, lng: 130.3550, ticketLink: 'https://www.klook.com/zh-TW/activity/2502-marine-world-uminonakamichi-fukuoka/' },
                { title: '回程: 海之中道 -> 博多', location: '海之中道', category: 'transport', time: '15:30', transports: [{ type: 'ferry', company: '安田產業汽船', line: '海中道航線', direction: '博多埠頭', dep: '15:40', arr: '16:00', cost: 1100, note: '高速船直達', duration: 20 }], cost: 1100, lat: 33.6590, lng: 130.3550 },
                { title: '最後採購 & 領行李', location: '博多駅', category: 'shop', time: '16:30', notes: '博多阪急、AMU PLAZA', cost: 8000, lat: 33.5897, lng: 130.4207 },
                { title: '搭機返台 (TPE)', location: 'Fukuoka Airport', category: 'flight', time: '19:00', endTime: '20:40', notes: 'IT721, FUK -> TPE', cost: 0, lat: 33.5859, lng: 130.4506, transports: [{ type: 'public', company: '福岡市地鐵', line: '機場線', direction: '福岡機場', dep: '18:15', cost: 260, note: '5分鐘直達', duration: 5 }, { type: 'flight', flightNo: 'IT721', depAirport: 'FUK', arrAirport: 'TPE', dep: '19:55', arr: '21:30', duration: 155 }] }
            ]
        }
    ]
}
