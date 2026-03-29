# 行程規劃 (Itinerary)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
作為系統的主入口與核心模組，行程規劃不僅讓使用者以時間軸的方式整理每日的日本景點順序，更是整合了地圖動線、交通建議、費用預估與行程備案的綜合控制中心。

### 1.2 核心頁面與使用情境
1. **雙模動態檢視 (清單 vs. 地圖)**：
   - 使用者可以直覺地切換至地圖模式，查看當天的點至點距離與地理軌跡分佈。
2. **行程拖曳調度 (Drag & Drop)**：
   - 允許點擊拖動修改景點順序。變動順序時，系統會自動往後推算剩餘景點的時間，保持整體時間軸的合理性。
3. **單筆行程管理與串聯**：
   - 每筆行程之間自動建立「交通(Transport)區塊」。使用者可點開輸入或點擊 AI 推薦的轉乘車次，完美模擬日本如「乘換案內」的排程邏輯。
4. **行程備案 (Backup Plan)**：
   - 可在底部面板新增備案（如：雨天備案），需要替換時，一鍵將其「升級」加入正式行程表中。
5. **即時費用統計**：
   - 底層隨時加總每日與整趟旅程的花費，並且因應日本自由行的需求，支援 JPY ↔ TWD 匯率換算。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **路徑**：`src/views/ItineraryView.vue`
- **附屬元件**：
  - `src/components/DateSelector.vue` (上方日期分頁標籤)
  - `src/components/EventCard.vue` (單筆行程的卡片UI)
  - `src/components/TransportConnector.vue` (行程間的交通邏輯連接線)
  - `src/components/EditEventModal.vue` (行程詳情編輯器)

### 2.2 核心技術實作
1. **拖曳排序的互動 (SortableJS)**：
   - 以 `sortablejs` 實作行程區塊的拖移排序。
   - **時間連鎖反應算子 (Ripple Effect)**：在 `handleDragEnd` 中實作演算法，當 Index A 移動至 Index B 時，自目標區段起，將前一筆結束時間(EndTime)作為下一筆的起始時間，並考量預設的停留時長 (如 60 mins) 更新所有受到牽連的 Object 時間。
2. **地圖模組 (Leaflet)**：
   - 整合 `leaflet` 庫。切換為 Map Mode 時，透過讀取當日 Events 裡的 `lat`/`lng` 自動繪製 Marker，並用 `L.polyline` 把地點連線，最後呼叫 `fitBounds` 將視角自適應定位到該路線。
3. **衝突與防呆檢查**：
   - 每當行程時間異動，呼叫 store 的 `validateConflicts` 掃描所有起訖時間，若發現重疊（Overlapping），則動態亮起紅框 (透過傳入 Conflict IDs 至元件 class) 並觸發 Notification。

### 2.3 狀態管理 (Pinia)
- **Store**：`useTripStore`
- **資料結構**：
  - `days`: 陣列，存放每一天的 `events` (包含地點、起訖時間、經緯度、分類及花費)。
  - `backups`: 行程備案池的資料庫。
  - `currentCurrency`: 當前選擇幣別的匯率物件，用於 Bottom Footer 計算預估費用。
