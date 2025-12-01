export interface ConversationPhrase {
    id: string
    chinese: string
    japanese: string
    romaji?: string
}

export interface ConversationCategory {
    id: string
    name: string
    icon: string
    phrases: ConversationPhrase[]
}

export const conversationCategories: ConversationCategory[] = [
    {
        id: 'dining',
        name: '用餐',
        icon: 'fa-utensils',
        phrases: [
            { id: 'd1', chinese: '請問有中文菜單嗎？', japanese: '中国語のメニューはありますか？' },
            { id: 'd2', chinese: '我要這個。', japanese: 'これをください。' },
            { id: 'd3', chinese: '請問廁所在哪裡？', japanese: 'トイレはどこですか？' },
            { id: 'd4', chinese: '結帳，謝謝。', japanese: 'お会計をお願いします。' },
            { id: 'd5', chinese: '我不吃辣。', japanese: '辛いものは食べられません。' },
            { id: 'd6', chinese: '請問這道菜裡面有什麼？', japanese: 'この料理には何が入っていますか？' },
            { id: 'd7', chinese: '可以給我一杯水嗎？', japanese: 'お水をいただけますか？' },
            { id: 'd8', chinese: '非常好吃，謝謝款待。', japanese: 'とても美味しかったです。ご馳走様でした。' },
        ]
    },
    {
        id: 'convenience_store',
        name: '便利商店',
        icon: 'fa-store',
        phrases: [
            { id: 'c1', chinese: '我要加熱。', japanese: '温めてください。' },
            { id: 'c2', chinese: '我要筷子/湯匙/叉子。', japanese: 'お箸/スプーン/フォークをください。' },
            { id: 'c3', chinese: '我不需要袋子。', japanese: '袋は要りません。' },
            { id: 'c4', chinese: '可以用西瓜卡(Suica)嗎？', japanese: 'Suicaは使えますか？' },
            { id: 'c5', chinese: '我要買這個。', japanese: 'これを買います。' },
        ]
    },
    {
        id: 'transport',
        name: '交通',
        icon: 'fa-train',
        phrases: [
            { id: 't1', chinese: '請問這個車站在哪裡？', japanese: 'この駅はどこですか？' },
            { id: 't2', chinese: '我要去這裡。', japanese: 'ここに行きたいです。' },
            { id: 't3', chinese: '這班車會到新宿嗎？', japanese: 'この電車は新宿に行きますか？' },
            { id: 't4', chinese: '請載我到這個地址。', japanese: 'この住所までお願いします。' },
            { id: 't5', chinese: '請問要在哪裡轉車？', japanese: 'どこで乗り換えればいいですか？' },
        ]
    },
    {
        id: 'shopping',
        name: '購物',
        icon: 'fa-bag-shopping',
        phrases: [
            { id: 's1', chinese: '這個多少錢？', japanese: 'これはいくらですか？' },
            { id: 's2', chinese: '可以試穿嗎？', japanese: '試着してもいいですか？' },
            { id: 's3', chinese: '有免稅嗎？', japanese: '免税はできますか？' },
            { id: 's4', chinese: '有新的嗎？', japanese: '新しいものはありますか？' },
            { id: 's5', chinese: '可以用信用卡嗎？', japanese: 'クレジットカードは使えますか？' },
        ]
    },
    {
        id: 'hotel',
        name: '住宿',
        icon: 'fa-hotel',
        phrases: [
            { id: 'h1', chinese: '我要辦理入住。', japanese: 'チェックインをお願いします。' },
            { id: 'h2', chinese: '我要寄放行李。', japanese: '荷物を預かってもらえますか？' },
            { id: 'h3', chinese: '請問早餐幾點開始？', japanese: '朝食は何時からですか？' },
            { id: 'h4', chinese: '房間的Wi-Fi密碼是什麼？', japanese: '部屋のWi-Fiパスワードは何ですか？' },
            { id: 'h5', chinese: '我要退房。', japanese: 'チェックアウトをお願いします。' },
        ]
    },
    {
        id: 'general',
        name: '通用',
        icon: 'fa-comments',
        phrases: [
            { id: 'g1', chinese: '不好意思。', japanese: 'すみません。' },
            { id: 'g2', chinese: '謝謝。', japanese: 'ありがとうございます。' },
            { id: 'g3', chinese: '對不起。', japanese: 'ごめんなさい。' },
            { id: 'g4', chinese: '我不懂日文。', japanese: '日本語がわかりません。' },
            { id: 'g5', chinese: '請再說一次。', japanese: 'もう一度お願いします。' },
            { id: 'g6', chinese: '請說慢一點。', japanese: 'もっとゆっくり話してください。' },
        ]
    }
]
