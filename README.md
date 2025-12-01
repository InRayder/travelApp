# Travel App (旅遊規劃應用)

這是一個基於 Vue 3 和 Vite 開發的旅遊規劃應用程式，旨在協助用戶輕鬆管理行程、記帳以及查看旅遊指南。

## 功能特色

- **行程規劃 (Itinerary)**：直觀的行程安排介面，支援拖放排序，輕鬆管理每日活動。
- **記帳功能 (Accounting)**：記錄旅遊開銷，透過圖表分析花費類別與趨勢。
- **旅遊指南 (Guides)**：建立與管理旅遊參考資料，隨時查閱重要資訊。
- **地圖檢視 (Map)**：整合 Leaflet 地圖，直觀查看景點位置與路線。
- **日語對話 (Conversation)**：內建實用旅遊日語，支援語音發音、試聽及自訂常用語句。
- **互動導覽 (Tour)**：新手友善的聚光燈導覽，快速上手各項功能。

## 技術棧 (Tech Stack)

- **核心框架**：[Vue 3](https://vuejs.org/) (Script Setup)
- **建置工具**：[Vite](https://vitejs.dev/)
- **程式語言**：[TypeScript](https://www.typescriptlang.org/)
- **樣式設計**：[Tailwind CSS](https://tailwindcss.com/) & Sass
- **狀態管理**：[Pinia](https://pinia.vuejs.org/)
- **路由管理**：[Vue Router](https://router.vuejs.org/)
- **地圖整合**：[Leaflet](https://leafletjs.com/)
- **圖表顯示**：[Chart.js](https://www.chartjs.org/) / [vue-chartjs](https://vue-chartjs.org/)
- **圖標庫**：[FontAwesome](https://fontawesome.com/)
- **拖放功能**：[SortableJS](https://github.com/SortableJS/Sortable)

## 安裝與執行 (Setup)

### 1. 安裝依賴
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```

### 3. 建置生產版本
```bash
npm run build
```

### 4. 預覽生產版本
```bash
npm run preview
```

## 專案結構

- `src/views`: 包含主要頁面 (Itinerary, Accounting, Guides, Map)
- `src/components`: 可重用的 Vue 元件
- `src/stores`: Pinia 狀態管理
- `src/utils`: 工具函式
- `src/assets`: 靜態資源

## IDE 支援

建議使用 [VS Code](https://code.visualstudio.com/) 搭配 [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 擴充套件以獲得最佳的 Vue 3 開發體驗。
