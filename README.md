# 🧳 Easy Trip (旅遊規劃應用)

這是一個基於 **Vue 3** 和 **Vite** 開發的一站式旅遊規劃應用程式，專為協助使用者輕鬆管理行程、智慧記帳、整理旅遊指南以及透過 AI 輔助優化旅行體驗所設計。

## ✨ 核心功能 (Features)

- **📅 行程規劃 (Itinerary)**
  - 支援直觀的拖放排序（SortableJS），輕鬆管理每日活動與交通串接。
  - 內建彈性時間調整與事件卡片管理。
- **💰 記帳與花費分析 (Accounting)**
  - 記錄旅遊開銷，支援多幣別與折扣設定。
  - 透過圓餅圖（Chart.js）即時分析各類別開銷差異。
- **📚 旅遊指南 (Guides)**
  - 建立、匯入與管理旅遊參考資料，支援 Markdown 語法呈現。
- **🗺️ 地圖檢視 (Map)**
  - 整合 Leaflet 地圖，快速定位景點位置與路線導覽（支援位置服務）。
- **🗣️ 旅遊會話 (Conversation)**
  - 內建實用旅遊外語/日語對話，支援語音發音與常用語句管理。
- **🤖 AI 智能輔助 (AI Integration)**
  - **AI 助理 (AI Assistant)**：整合 Google Generative AI，隨時提供旅行建議。
  - **AI 相機 (AI Camera)**：結合 MediaPipe 進行即時影像辨識。
  - **Vlog 腳本生成 (Vlog Script)**：自動生成旅行 Vlog 錄影腳本。
- **✅ 待辦清單 (Checklist)**
  - 建立並管理旅遊前的行李清單及重要任務。
- **📱 漸進式網頁應用 (PWA)**
  - 支援完整 PWA 特性，可安裝至手機桌面，提供接近原生應用的全螢幕與離線體驗。

## 🛠️ 技術棧 (Tech Stack)

- **核心框架**：[Vue 3](https://vuejs.org/) (Composition API / Script Setup)
- **建置工具**：[Vite 7](https://vitejs.dev/)
- **程式語言**：[TypeScript](https://www.typescriptlang.org/)
- **狀態管理**：[Pinia](https://pinia.vuejs.org/) + `pinia-plugin-persistedstate` (本地狀態持久化)
- **路由管理**：[Vue Router 4](https://router.vuejs.org/)
- **UI & 樣式**：[Tailwind CSS 4](https://tailwindcss.com/) & Sass
- **地圖整合**：[Leaflet](https://leafletjs.com/)
- **圖表分析**：[Chart.js](https://www.chartjs.org/) / [vue-chartjs](https://vue-chartjs.org/)
- **AI 與機器視覺**：`@google/generative-ai`、`@mediapipe/tasks-vision`
- **圖標庫**：[FontAwesome 7](https://fontawesome.com/)
- **拖曳互動**：[SortableJS](https://github.com/SortableJS/Sortable)
- **Markdown 解析**：[markdown-it](https://github.com/markdown-it/markdown-it)

## 🚀 安裝與執行 (Setup)

### 1. 安裝套件依賴 (Install Dependencies)
```bash
npm install
```

### 2. 環境變數設定 (Environment Variables)
請複製或建立 `.env` 檔案，並填寫必要的 API Keys（如 Google Gemini API 金鑰等）。

### 3. 啟動開發伺服器 (Start Development Server)
```bash
npm run dev
```
> 提示：開發伺服器預設會監聽所有網路介面 (`host: true`)，允許同區網下的手機或外部設備連線測試。

### 4. 建置生產版本 (Build for Production)
```bash
npm run build
```

### 5. 預覽生產版本 (Preview Production Build)
```bash
npm run preview
```

## 📂 專案結構 (Project Structure)

```text
src/
├── assets/       # 靜態資源 (含圖片、全域樣式)
├── components/   # 共用 Vue 元件 (如 Modals, Cards 等)
├── composables/  # Vue Composition API 邏輯封裝 (例如 zIndex 控制)
├── data/         # 預設資料與範例 (如預設指南、範例行程)
├── router/       # Vue Router 路由設定
├── services/     # 外部服務整合 API (如 AI Service)
├── stores/       # Pinia 狀態管理 (行程、記帳、對話等)
├── utils/        # 工具函式 (時間處理、格式化等)
└── views/        # 主要頁面元件 (包含 AI Camera, Checklist, Vlog 等視圖)
```

## 💻 編輯器推薦 (IDE Support)

建議使用 [VS Code](https://code.visualstudio.com/) 並搭配 [Vue - Official (前 Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 擴充套件，以獲得最佳的 Vue 3 與 TypeScript 開發體驗。
