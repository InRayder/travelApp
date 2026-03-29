# 深度導覽 (Guides)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
深度導覽 (Guides) 模組擔當了個人的「景點靈感收藏庫」。使用者在行前準備時，不論從部落格、Instagram 或 YouTube 看到有興趣的地方，皆能轉化收錄成精美的圖文小卡，並一鍵與主行程聯動。

### 1.2 核心頁面與使用情境
1. **攻略收藏牆**：
   - 瀑布式的景點卡片展示，包含精選照片、評分、標籤，及重點標記（如使用者的備註或 AI 提煉亮點）。
2. **狀態標籤流轉**：
   - 每個攻略支援自訂三個狀態：「想去」、「已排程」、「已去過」。
3. **一鍵跨系統加入行程**：
   - 使用者看到適合的點可以點擊「加入」，選擇天數與期望時間，該指南會轉化成 Event 物件插入到行程中。
4. **AI 智能匯入(AI Import)**：
   - 將任何 Web Link 丟入 AI 匯入框內，系統便自動解析網址內容，提煉出該地點的名稱、描述、交通策略以自動生成攻略卡。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **主要畫面**：`src/views/GuidesView.vue`
- **核心元件**：
  - `src/components/GuideModal.vue`：單篇攻略的完整閱讀與編輯視窗。
  - `src/components/ImportGuideModal.vue`：負責與 Google GenAI 溝通解析網址或純文字的對話框。
  - `src/components/AddToItineraryModal.vue`：選擇天數及時段將景點注入 Store 的介面。

### 2.2 核心技術實作
1. **視覺介面渲染**：
   - 利用 `line-clamp` 限制文字長度保持版面整齊。
   - 判斷來源 `media_type` 動態更換社群對應的 FontAwesome 圖標（例如 YouTube、Instagram Icon）。
2. **與裝置 Share Target 整合**：
   - `router/index.ts` 內有特別攔截針對 `/` 但帶有 `title/text/url` 參數的路由，自動導向 GuidesView。
   - 這實作了 Web Share Target API 能力，容許使用者在手機瀏覽器上使用「分享」功能直接將網頁送進 App，並喚起 `ImportGuideModal` 接收連結。
3. **AI 自動解析 (Google Generative AI)**：
   - 呼叫 Gemini 的 API。
   - 當使用者貼上網址或文字時，透過 Prompt (`System Instruction`) 請求 AI 嚴格回傳符合 Schema 的攻略 JSON 字串 (如含有 `highlights`, `tags`, `thumbnail_url` 等欄位)。解析後寫入本地陣列。

### 2.3 狀態管理 (Pinia)
- **Store**：`useTripStore`
- **資料結構**：
  - `attractionGuides`：儲存指南的 Object / Dictionary，鍵值通常為地名。
  - 操作方法：提供 `updateGuide`, `addEvent` 供元件跨模組修改資料。
