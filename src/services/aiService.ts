import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Guide } from '../stores/trip';

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
    內容文字: ${text}

    請回傳一個 JSON 物件，符合以下格式 (不要包含 Markdown 標記，只要純 JSON):
    {
      "title": "景點名稱 (例如: 太宰府天滿宮)",
      "desc": "景點簡介 (約 50-100 字，繁體中文)",
      "tags": ["標籤1", "標籤2", "標籤3"], // 請提供 3-5 個精簡的標籤
      "highlights": ["必看重點1", "必看重點2", "必看重點3"],
      "tips": "參觀小撇步 (例如: 建議早上前往、必吃某某美食)",
      "color": "Tailwind CSS Gradient Class (例如: from-pink-500 to-red-600, 請根據景點氛圍選擇)",
      "icon": "FontAwesome Class (例如: fa-solid fa-torii-gate, 請根據景點類型選擇)"
    }

    注意:
    1. 如果內容不足以判斷某些欄位，請根據景點名稱自行補充相關知識。
    2. color 請使用 Tailwind 的 bg-gradient-to-br 的顏色部分 (e.g. "from-blue-500 to-cyan-400")。
    3. icon 請使用 FontAwesome 6 的 class。
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);

        return {
            color: data.color || 'from-gray-500 to-gray-700',
            icon: data.icon || 'fa-solid fa-location-dot',
            desc: data.desc || '暫無簡介',
            tags: data.tags || [],
            highlights: data.highlights || [],
            tips: data.tips || '',
            link: url, // Use the shared URL as the link
            image: '' // AI cannot generate image URL easily without search, leave empty for now
        };
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw new Error('AI 分析失敗，請檢查 API Key 或稍後再試。');
    }
}
