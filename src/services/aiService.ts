import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Guide } from '../stores/trip';

/**
 * 根據景點描述生成旅遊景點攻略
 * @param apiKey Gemini API Key
 * @param modelName 模型名稱
 * @param text 景點描述
 * @param url 景點連結
 * @returns 旅遊景點攻略
 */
export async function generateGuideFromContent(
    apiKey: string,
    modelName: string,
    text: string,
    url: string
): Promise<Guide> {
    if (!apiKey) {
        throw new Error('請先在設定中輸入 Gemini API Key');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName || 'gemini-2.5-flash',
        tools: [{ googleSearchRetrieval: {} }]
    });

    const prompt = `
    你是一個專業的旅遊規劃師。請根據以下提供的內容（可能包含社群貼文文字與連結），分析並整理出一份詳細的旅遊景點攻略。
    
    來源連結: ${url}
    網址: ${url}
    內容: ${text}

    請回傳符合以下 TypeScript 介面的 JSON 物件 (不要包含 markdown code block):

    interface Guide {
        color: string;      // 適合該景點氛圍的 Tailwind CSS 漸層 class (e.g. "from-pink-500 to-red-600")
        icon: string;       // FontAwesome 6 icon class (e.g. "fa-solid fa-torii-gate")
        desc: string;       // 50字以內的精簡介紹
        tags: string[];     // 3-5個精簡標籤
        highlights: string[]; // 2-3個必看重點 (條列式)
        tips: string;       // 參觀小撇步
        original_url: string; // 官方網站或相關連結 (若無則使用輸入的網址)
        location: { name: string }; // 地點名稱 (e.g. "福岡・太宰府")
        user_notes: string; // 根據內容摘要出的個人化筆記 (e.g. "必吃梅枝餅")
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Remove markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);

        return {
            id: crypto.randomUUID(),
            color: data.color || 'from-gray-400 to-gray-600',
            icon: data.icon || 'fa-solid fa-location-dot',
            desc: data.desc || '',
            tags: data.tags || [],
            highlights: data.highlights || [],
            tips: data.tips || '',
            original_url: data.original_url || url,
            thumbnail_url: '', // AI currently doesn't extract image
            media_type: 'web', // Default to web
            location: data.location || { name: '' },
            user_notes: data.user_notes || '',
            status: 'want_to_go'
        };
    } catch (error: any) {
        console.error('AI Generation Error:', error);
        throw new Error(`AI 分析失敗: ${error.message || '未知錯誤'}`);
    }
}

/**
 * 建議景點加入行程的日期和時間
 * @param apiKey Gemini API Key
 * @param modelName 模型名稱
 * @param guide 景點攻略
 * @param days 行程
 * @returns 行程日期和時間
 */
export async function suggestItineraryPlacement(
    apiKey: string,
    modelName: string,
    guide: Guide & { title: string },
    days: any[]
): Promise<{ dayIndex: number; reason: string; suggestedTime?: string }> {
    if (!apiKey) throw new Error('請先設定 API Key');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName || 'gemini-1.5-flash',
    });

    const itinerarySummary = days.map((day, index) => {
        const events = day.events.map((e: any) => `${e.time} ${e.title} (${e.location})`).join(', ');
        return `Day ${index} (${day.dateStr}): ${events}`;
    }).join('\n');

    const prompt = `
    我有一個新的旅遊景點想要加入行程，請幫我判斷最適合放在哪一天。
    
    [新景點資訊]
    名稱: ${guide.title}
    地點: ${guide.location?.name || '未知'}
    描述: ${guide.desc}
    
    [目前行程]
    ${itinerarySummary}
    
    請分析地點順路程度與時間安排，回傳一個 JSON 物件 (不要 markdown):
    {
        "dayIndex": number, // 推薦的日期索引 (0-based)
        "reason": "string", // 推薦原因 (50字以內，例如：位於 Day 2 的博多車站附近，順路)
        "suggestedTime": "string" // 建議時間 (HH:MM format, e.g. "14:00")
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error('AI Suggestion Error:', error);
        return { dayIndex: 0, reason: 'AI 無法分析，請自行選擇', suggestedTime: '' };
    }
}
