# 實用日語對話 (Conversation)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
解決使用者在日本旅行時遇到的語言溝通障礙。不僅提供系統內建的旅遊常見情境短句（如過海關、餐廳點餐、交通問路等），更導入了 AI 助理，允許使用者用中文輸入自己的需求，系統自動生成最合適、禮貌的日文對話。

### 1.2 核心頁面與使用情境
1. **情境對話本標籤**：
   - 透過橫向捲動的標籤列切換不同情境（如：交通、住宿、購物、海關、自訂）。
2. **AI 客製化對話與翻譯**：
   - 在「自訂」分類頁點擊新增，使用者只需要輸入「我想買去東京的票」，即可選擇兩種模式：
     - **純翻譯模式**：快速將中文語句一字不漏翻譯為日文。
     - **AI 情境推薦模式**：由語言模型潤飾，判斷這句話在旅遊情境中怎樣說最符合日本人的禮貌習慣，並產出一句流暢自然的請求或問候。
3. **即時日語發音 (TTS)**：
   - 全部的語句均帶有「播放」按鈕，使用者可以直接按下來讓手機發出標準日本語音給當地店員聽，化解無法開口的尷尬。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **主要畫面**：`src/views/ConversationView.vue`
- **核心元件**：
  - `src/components/ConversationCard.vue`：負責顯示單筆對話內容與中文對照。
  - 新增/編輯對話 Modal：整合輸入框與 AI 翻譯／生成按鈕的畫面。

### 2.2 核心技術實作
1. **AI 雙向溝通實作 (Google Generative AI)**：
   - 當使用者點擊「翻譯」按鈕，系統會使用 `gemini-2.5-flash-lite` 模型，透過嚴格的 System Instruction 要求僅回傳翻譯後的短句。
   - 若點擊「AI 情境推薦」，則會將使用者的中文放入情境 Prompt：`"Generate a natural, polite Japanese phrase that a traveler would say in this situation: [Input]"`。
   - 並對 API 請求加上防呆與錯誤攔截（例如未配置 API Key 則 fallback 開啟 Google Translate 預填連結）。
2. **Web Speech API 朗讀引擎**：
   - 使用瀏覽器原生的 `window.speechSynthesis`。
   - 建立 `SpeechSynthesisUtterance` 物件，並將 `lang` 強制設定為 `'ja-JP'`。
   - 為解決各平台音色不一致，會在語音庫 (`speechSynthesis.getVoices()`) 中主動搜尋是否存在帶有 `'ja'` 或 `'JP'` 關鍵字的本地高品質語音包，並覆蓋預設音色，同時透過 `rate = 0.9` 刻意放慢語速，方便學習者或日本人聽懂。

### 2.3 狀態管理 (Pinia)
- **Store**：`useConversationStore` (`src/stores/conversations.ts`)
- **資料結構**：
  - `categories`：維護各個分類與其中的 `phrases` 陣列。其中包含一個特殊的 `custom` 分類。
  - `addCustomPhrase` / `updateCustomPhrase`：對 `custom` 分類下的語句進行 CRUD 操作。
