# 新手導覽 (Onboarding Tour)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
新手導覽 (Onboarding Tour) 是使用者初次進入 App 時自動觸發的引導介面。其主要目的是降低使用者的學習曲線，快速展示本應用程式的核心價值，並提供操作範例與 PWA 安裝指引。

### 1.2 核心頁面與使用情境
1. **歡迎頁**：向使用者展示品牌形象，說明這是一款專為日本自由行設計的工具。
2. **核心功能介紹**：簡單列出四大主軸（行程規劃、交通管理、記帳分帳、日語對話）。
3. **AI 智慧助手說明**：介紹整合在系統內的 AI 助理，說明其在生成攻略、規劃行程與翻譯上的用途，並提醒需於「設定」配置 API Key 才能啟用。
4. **範例資料提示**：告知使用者目前看到的列表預設為「範例資料」，並可透過設定清空或引入自己的 Excel 資料。
5. **安裝應用程式教學**：推廣 PWA，提供安裝按鈕（對於支援 Web App Manifest 的瀏覽器）或 iOS 的分享加入主畫面教學。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應元件
- **路徑/位置**：`src/components/OnboardingModal.vue`
- **觸發方式**：通常於首頁掛載時（如 `App.vue` 或 `ItineraryView.vue`），判斷全域狀態檔中是否儲存過「已完成看清導覽」的 Flag (`isFirstVisit` 或相關狀態)。

### 2.2 核心技術實作
1. **畫面切換邏輯 (Slider)**：
   - 藉由 Vue 響應式變數 `currentSlide` 來控制顯示哪一個頁面的內容。
   - 使用 Vue 的 `<transition-group name="slide">` 搭配 CSS keyframes 來實現平滑的左右滑動切換特效。
2. **安裝 PWA 狀態偵測 (PWA Install Prompt)**：
   - 使用 `@vite-plugin-pwa`。
   - 在 Pinia Store 或 Composables 中監聽 `beforeinstallprompt` 事件，並將 Event 儲存起來。
   - 當走到第 5 頁時，判斷 `canInstall` 是否為 True：若存在該事件，則顯示原生安裝按鈕；若是 iOS 瀏覽器，則因為不支援 `beforeinstallprompt`，會自動回退 (Fallback) 顯示手動「加入主畫面」的教學。
3. **層級控制 (Z-Index)**：
   - 提供 `useDynamicZIndex` 的 Composable 確保此 Modal 彈出時，永遠位於最上層覆蓋住其他頁面元件 (例如 Map)。

### 2.3 狀態管理 (Pinia)
- **Store**：`useTripStore` (`src/stores/trip.ts`)
- **相關狀態**：
  - `installPromptEvent`：存取 PWA 的 `beforeinstallprompt` 提供呼叫。
  - 後續可能會將 `hasSeenOnboarding` 狀態寫入 local storage 以免重複出現。
