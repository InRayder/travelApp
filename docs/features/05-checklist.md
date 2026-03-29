# 準備清單 (Checklist)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
行李與行前準備檢查核對工具。幫助使用者避免在外出旅遊前忘記攜帶重要證件（如護照、日幣）或遺漏重要待辦事項（如買網卡、填寫 VJW 等）。具備分類管理與進度視覺化的特點。

### 1.2 核心頁面與使用情境
1. **多分類頁籤**：
   - 預設提供「出發前待辦」、「隨身物品」、「行李箱衣物」等實用預設清單分類。
   - 使用者也可自行新增或刪除分類，因應不同性質的旅程靈活調整。
2. **待辦項目勾選與進度回饋**：
   - 每份清單上方皆含有一組大型文字與動態進度條。
   - 點擊勾選項目時，項目會淡化並畫上刪除線，上方進度條（如 3 / 10）隨即以動畫效果漲滿至對應的百分比。
3. **快速新增與編輯**：
   - 清單最下方具備 Sticky 的快速輸入列，支援「Enter」鍵極速連打新增項目。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **主要畫面**：`src/views/ChecklistView.vue`
- **核心元件**：
  - 共用的 `src/components/InputModal.vue`（新增分類的輸入對話框）。
  - 共用的 `src/components/ConfirmModal.vue`（防呆刪除確認框）。

### 2.2 核心技術實作
1. **Vue Transitions 與動畫**：
   - 採用 Vue 的 `<transition-group name="list">` 來包裝項目列表，實作當元素加入或移除時的 `enter-active` 與 `leave-active` 位移淡化效果（X 軸平移 + Opacity）。
   - 上方的完成度進度條，利用 `computed` 計算 `(completedCount / totalCount) * 100` 的數值綁定至 CSS `width` 上，並搭配 Tailwind 的 `transition-all duration-500 ease-out` 製造滑順的填滿效果。
2. **資料校驗與邊界狀況**：
   - 使用 `watch` 對 `store.checklists` 進行深層監聽 (Deep watcher)。當目前標籤（`activeTab`）被刪除時，自動防護 fallback 指向陣列中剩下的第一個分類 ID，避免畫面變成全白錯誤。

### 2.3 狀態管理 (Pinia)
- **Store**：`useTripStore`
- **資料結構**：
  - `checklists`：陣列，包含物件結構 `{ id, name, items: [] }`。
  - `items`：內部為物件結構 `{ id, text, checked }`。
  - 狀態變更一律透過 store 的 actions 封裝 (`addChecklistCategory`, `toggleChecklistItem` 等)。
