# 記帳分帳 (Accounting)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
專為團隊出遊 (如：情侶、三五好友) 設計的共用財務中心。記帳與分帳功能協助處理旅途中複雜的代墊款項目，透過自動運算一筆筆紀錄，在旅程結束時提供最精簡的拆帳解法，避免人工對帳的繁瑣。

### 1.2 核心頁面與使用情境
1. **總花費視覺化儀表板**：
   - 頁面最上方以大字型總結當下所有共同與個人花費。
   - 提供「甜甜圈圖 (Doughnut Chart)」，一眼看出每一種消費分類 (如：機票、餐飲、購物、住宿) 佔整體花費的百分比。
2. **支出明細列表 (Expense Log)**：
   - 清單列出消費日期、付款人是誰、付款類別與金額。
   - 點擊後可編修該筆費用，指定是「平均分攤」抑或某人需承擔多少數量的「自訂分帳」。
3. **智慧結算建議清單 (Settlement)**：
   - 根據所有輸入的款項，系統動態結算出「債權人」與「債務人」。
   - 生成「A 應該轉給 B ¥5,000」的最少轉帳次數解法，完全免除手工計算餘額差額。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **主要畫面**：`src/views/AccountingView.vue`
- **核心元件**：
  - `src/components/ExpenseModal.vue`：負責新增/編輯支出紀錄的對話框，內含複雜的參與者多選以及分帳模式選擇 UI。
- **依賴套件**：
  - `chart.js` 與 `vue-chartjs` 用於圖表繪製。

### 2.2 核心技術實作
1. **圖表資料動態綁定 (vue-chartjs)**：
   - 將 `expenses` 陣列藉由 Vue 的 `computed` 屬性，篩選各分類金額 (Reduce)，組裝出適用於 Chart.js 的 `labels` 以及 `datasets`，使圖表能在新增支出時無縫刷新。
2. **最佳化分帳演算法 (Splitting Algorithm)**：
   - 實作於 `settlement` 這個大 `computed` 取值。
   - **Step 1：統整個人收支結餘 (Balances)**。
     每筆消費，Payer (付款者) 加回該金額；而對於所有被選取在 `involved`（參與者）中的人，若為平均分配 (`splitMethod === 'average'`) 則扣除 `amount / length`，或是扣除 `customShares` 所列的值。
   - **Step 2：分類債務人與債權人**。
     把餘額大於 0 (被欠錢的人，債權人) 及小於 0 (欠錢的人，債務人) 兩兩切開並進行排序。
   - **Step 3：貪婪演算法湊數 (Greedy Transfer Resolution)**。
     以雙指標對 debtor 與 creditor 同步消減金額配對，建立最低次數的 `transfers` 紀錄陣列 (From A to B : Amount)。

### 2.3 狀態管理 (Pinia)
- **Store**：`useTripStore`
- **相關狀態**：
  - `travelers`：一個字串陣列，管理這次行程參與的所有人員名稱。
  - `expenses`：陣列，定義每一筆包含：`id`, `title`, `amount`, `payer`, `involved`, `category`, `splitMethod` 等詳盡資訊。
