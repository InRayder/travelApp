# 旅遊小冊 (Travel Booklet)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
一鍵將目前作用中行程的所有資料（行程、攻略、預算、準備清單、交通票券）整理成一份排版清爽、可列印／可另存 PDF 的紙本小冊，方便使用者攜帶紙本備援，或分享給同行旅伴、非旅伴的親友。不需連網、不依賴任何第三方 PDF 套件，純粹透過瀏覽器原生列印功能輸出。

### 1.2 核心頁面與使用情境
1. **客製化面板**：
   - **小冊版型**：提供「簡約亮白」「雜誌手冊」「手帳旅誌」三種版型，點擊即可即時切換，下方預覽區所見即所得，可在列印前充分比較。
   - **主題色票**：每種版型皆可從 5 種色票（芥末黃、珊瑚紅、海洋藍、抹茶綠、靛藍紫）中選擇強調色，套用到日期徽章、圖示、長條圖、washi tape 等所有裝飾元素，不限定單一配色。
   - **產生模式**：「自動（依現有資料）」會依照目前各類資料是否存在，自動勾選有內容的章節；「自訂章節」可讓使用者手動勾選／取消六大章節（封面與旅伴資訊、每日行程、景點攻略、預算總覽、準備清單、交通票券），沒有資料的章節會顯示「無資料」並停用。
   - **景點攻略呈現位置**：可選擇「獨立章節（目前位置）」維持集中呈現，或「每日行程最後」將已透過 `linkedGuide` 掛在某天行程上的攻略改顯示在當天行程之後；尚未排入任何行程的攻略仍保留在獨立章節，避免資訊遺漏。
   - **隱私模式**：開啟「隱藏金額與個人筆記」後，行程花費、每日小計、事件備註與「預算總覽」整個章節都會被隱藏／停用，適合分享給非旅伴的人。
2. **即時預覽**：客製化面板下方即為小冊的完整預覽，所見即所得，勾選/取消章節、切換版型、色票或景點攻略呈現位置都會立即反映在預覽內容上。
3. **景點攻略圖片**：若攻略有設定封面圖片（`thumbnail_url`），卡片會顯示縮圖（雜誌版型為卡片頂部滿版圖片，其餘版型為卡片內嵌圖片）；圖片載入失敗時自動隱藏，不會顯示破圖。
4. **列印輸出**：點擊「產生／列印小冊」會呼叫瀏覽器原生列印功能；使用者只需在列印對話框中將「目的地」改為「另存為 PDF」，即可下載小冊檔案。含底色/插圖裝飾的版型（雜誌手冊、手帳旅誌）需勾選瀏覽器的「背景圖形 (Background graphics)」選項才能完整呈現，頁面上也會提示此設定。

### 1.3 三種小冊版型
| 版型 | 視覺語言 | 封面 | 每日行程標頭 | 景點攻略 |
|------|----------|------|--------------|----------|
| 簡約亮白 | 乾淨留白，適合大量文字內容 | 置中標題 + 淡色插圖浮水印 | 底線 + 文字 | 單欄清單 |
| 雜誌手冊 | 色塊與大標題，閱讀感強烈 | 深色橫幅 + 天數徽章 | 深色色塊橫幅 + 大數字 | 雙欄卡片（含頂部色條與滿版圖片） |
| 手帳旅誌 | 紙感底紋＋貼紙郵戳風格 | 和紙紋底 + washi tape + 護照章 | 郵戳圓徽（旋轉虛線圓） | 雙欄明信片卡片（含摺角與內嵌圖片） |

所有版型皆放大基礎字級（約 15px 起），並以 FontAwesome 圖示搭配純 CSS 繪製裝飾（washi tape、護照章、明信片摺角、拍立得相框、便利貼、分類金額長條圖），不依賴任何外部圖片素材，避免版權疑慮；強調色全部由使用者選擇的主題色票驅動。

### 1.4 入口
- 路由：`/booklet`
- 底部導覽「更多」選單新增「旅遊小冊」按鈕進入。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **主要畫面**：`src/views/BookletView.vue`
- **子元件**：`src/components/BookletGuideCard.vue`（景點攻略卡片，供獨立章節與「每日行程最後」兩處共用）
- **共用邏輯**：`src/utils/settlementUtil.ts`（結算建議演算法，與 `src/views/AccountingView.vue` 共用）
- **路由**：`src/router/index.ts` 新增 `/booklet`
- **入口**：`src/components/BottomNav.vue` 「更多」選單

### 2.2 核心技術實作
1. **章節客製化邏輯**：
   - `dataAvailable`：依 `store.days`／`store.attractionGuides`／`store.expenses`／`store.checklists`／`store.passes` 是否有內容，計算各章節是否可用。
   - `autoSelected`：自動模式下的勾選結果，等同 `dataAvailable`。
   - `customSelected`：自訂模式下使用者可調整的勾選狀態，第一次切換到自訂模式時會以 `autoSelected` 作為初始值。
   - `selected`：最終呈現於預覽區的章節集合，為目前模式的選擇與 `dataAvailable` 的交集（確保沒資料或被隱私模式停用的章節不會被誤選顯示）。
2. **隱私模式**：
   - `hideSensitive` 為真時，`dataAvailable.budget` 強制為 `false`（自動取消勾選「預算總覽」），且金額／事件備註等欄位改為不輸出。
3. **版型切換（`theme: 'minimal' | 'magazine' | 'journal'`）**：
   - `.print-area` 綁定 `theme-${theme}` class，搭配全域樣式與一組依版型切換的 computed class（`sectionHeadWrapperClass`、`sectionIconWrapperClass`、`sectionTitleClass`、`guideGridClass`、`guideCardClass`、`checklistGridClass`、`passCardClass`）統一控制章節標題、卡片與網格排版，避免逐章節平鋪重複樣式。
   - 封面與每日行程標頭因三版型結構差異較大（置中文字 / 色塊橫幅 / 護照郵戳圓徽），以 `v-if`/`v-else-if` 直接切換對應區塊的 DOM 結構。
4. **主題色票（`accent: 'mustard' | 'red' | 'blue' | 'green' | 'indigo'`）**：
   - `ACCENT_COLORS` 定義 5 組色票的主色 (`hex`) 與淺色調 (`soft`)；`accentStyleVars` 計算出 `--booklet-accent`／`--booklet-accent-rgb`／`--booklet-accent-soft` 三個 CSS 變數，綁定於元件最外層 `<div>` 的 inline `style`，讓整個客製化面板與預覽區（含 `BookletGuideCard.vue` 子元件）皆可繼承套用。
   - 全域樣式（`src/style.css`）定義一組 `booklet-accent-*` 輔助 class（`booklet-accent-text`／`booklet-accent-bg`／`booklet-accent-border`／`booklet-accent-bg-soft`／`booklet-accent-border-60`／`booklet-accent-border-70`／`booklet-accent-watermark`），全部透過 `var(--booklet-accent...)` 讀值，取代舊版寫死的 `jp-mustard`／`jp-red` Tailwind class。
   - 裝飾元素（`.booklet-washi-tape`、`.booklet-postcard`、`.booklet-polaroid`、`.booklet-sticky-note`）移至全域樣式（而非元件 scoped style），並改用 CSS 變數驅動顏色，純粹以 CSS 繪製（漸層、邊框三角、陰影、旋轉），不載入任何外部圖片。
5. **景點攻略呈現位置與圖片**：
   - `guidePlacement: 'section' | 'per-day'`：
     - `assignedGuideKeys`：掃描 `store.days` 內每個 `Event.linkedGuide`，收集已掛在某天行程上的攻略 key 集合。
     - `guidesByDay`：對應每一天、已連結該天事件的攻略清單（同一天重複連結僅列一次）。
     - `unassignedGroupedGuides`：排除 `assignedGuideKeys` 後、依狀態分組的剩餘攻略，供「每日行程最後」模式下的獨立章節使用。
     - `guidesToShowInSection` / `guideSectionTitle`：依 `guidePlacement` 決定獨立章節要顯示全部攻略（`groupedGuides`）或僅未排入行程的攻略，並調整標題文字。
   - `BookletGuideCard.vue` 讀取 `guide.thumbnail_url` 顯示封面圖；雜誌版型圖片置於卡片頂部色條下方、滿版無邊距，其餘版型圖片置於卡片內距中、附圓角；圖片 `@error` 時將 `imgError` 設為 `true`，隱藏該圖片而非顯示破圖。
6. **列印輸出（無需額外套件）**：
   - 呼叫瀏覽器原生 `window.print()`。
   - `src/style.css` 內的 `@media print` 規則：`.no-print` 隱藏所有常駐 UI（Header、底部導覽、通知、AI 助手 FAB 等），`.print-area`／`.app-root`／`.view-port` 解除 overflow/高度限制，`.print-section` 讓每個章節獨立分頁 (`break-before: page`)，並對 `.print-area` 及其子孫元素強制套用 `print-color-adjust: exact`，確保版型底色、色票與插圖裝飾即使使用者未勾選瀏覽器「背景圖形」選項也能盡量正確輸出。
   - `src/App.vue` 將 `AppHeader`、`BottomNav`、`GlobalNotification`、AI 助手 FAB、`InstallPrompt` 以 `no-print` 包裹。

### 2.3 狀態管理 (Pinia)
- **Store**：`useTripStore`
- 本功能為唯讀彙整現有 `TripState` 資料（`days`、`attractionGuides`、`expenses`、`checklists`、`passes`、`travelers`、`settings`），不新增持久化欄位；版型、色票、章節選擇與景點攻略呈現位置僅存在元件內的本地狀態，不寫回 store。
