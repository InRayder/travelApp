# Vlog 拍攝腳本 (Vlog Script)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
創新且實用的 AI 編導功能。許多人在旅遊時想拍 Vlog，但不確定該怎麼運鏡或抓畫面。此功能可以直接提取使用者的行程資訊，交由 AI 打造成一份專業的短影片分鏡腳本，讓使用者只需按表操課就能拍出電影感大片。

### 1.2 核心頁面與使用情境
1. **天數與路線篩選**：
   - 選單可切換「第一天」、「第二天」或是「全部行程」。系統將會預覽即將提供給 AI 分析的各個打卡景點。
2. **AI 生成導演分鏡庫**：
   - 點擊「生成拍攝腳本」後，AI 會回傳一個結構化的分鏡清單，告知使用者：
     - **拍攝場景**：如清水寺門口。
     - **畫面主體與動作**：如由下往上拍攝紅色大門，然後帶入人潮。
     - **運鏡方式建議**：Pan（平移）、Tilt（仰角/俯視）、Static（靜止）、Tracking（跟隨）等。
     - **鏡頭秒數**：如建議拍攝 '5s' 等。
3. **連結實機訓練操作**：
   - 若運鏡建議中包含某些特殊手法（如 Pan Right），腳本卡片底下會顯示「練習此運鏡」按鈕，幫助新手在真的拍之前，先進入 `AiCameraView` 中熟悉手機移動的速度與平穩感。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **主要畫面**：`src/views/VlogScriptView.vue`

### 2.2 核心技術實作
1. **大語言模型生成結構化 JSON (Google Generative AI)**：
   - 為解決 Token 上限問題，首先將行程 Store 內龐大的陣列做「降維簡化」(`simplifiedItinerary`)，僅抽出時間、標題、地點與分類這幾個必填的元資料。
   - **System Instruction 嚴格約束**：要求模型行為像一個「Professional Travel Vlog Director & Editor」，並規定以 JSON 陣列直接輸出，禁止加入 Markdown backticks 以便解析。
   - 解析時運用 Regex `/\[[\s\S]*\]/` 強制切出合法的 JSON 部位，以防模型有時夾帶問候語破壞 `JSON.parse`。
2. **攝影參數 Mapping System**：
   - 建立了一套 `cameraToMoveMap` 字典（例如 `'Pan Right' -> 'pan-right'`）。
   - 當渲染卡片時，呼叫此函式檢測 AI 產出的運鏡是否受支援。如受支援，則透過 Vue Router 的 Query 參數（如 `?mode=vlog&move=pan-right`）傳遞狀態並跳轉至 AI 相機頁。

### 2.3 核心狀態依賴
- **相依 Store**：`useTripStore` 來讀取 `store.days.events` 及 `store.settings.aiSettings.apiKey`。
- 本模組不將結果存入 Store，多作為暫存功能（Generated in component state `scriptItems`）。
