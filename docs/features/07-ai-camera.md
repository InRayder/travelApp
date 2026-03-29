# AI 智慧相機 (AI Camera)

## 1. 說明文檔 (Feature Specification)

### 1.1 功能概述
利用手機硬體規格與 Web AI 模型創造的三合一智慧相機系統。旨在解決旅遊中遇到的「沒人幫忙拍照」、「風景照拍歪」、「錄影手震不會運鏡」的三大核心痛點。

### 1.2 核心頁面與使用情境
相機分為三種模式：
1. **人像自拍模式 (Portrait)**：
   - **痛點**：將手機架具固定後，必須跑回去按快門，或是藍牙遙控器不好用。
   - **解法**：系統於裝置端即時辨識人體骨架，只要對著鏡頭「雙手舉高於頭部」，系統便會自動觸發 3 秒倒數計時並拍攝，不需觸碰裝置。
2. **風景風景模式 (Landscape)**：
   - **痛點**：風景照常因沒抓好水平線而略顯歪斜，破壞美感。
   - **解法**：畫面中心會疊加「智慧水平儀」，當使用者轉動手機達成完美平行地面時，指示線會加粗並變綠。此外，點擊畫面可放置視覺焦點，輔助「三分法則」構圖。
3. **運鏡練習模式 (Vlog/Training)**：
   - **痛點**：Vlog 運鏡轉太快導致畫面模糊。
   - **解法**：在畫面上顯示一個虛擬的「幽靈目標框」，使用者必須緩慢且穩定地將鏡頭（裝置）的框框追隨幽靈框的軌跡移動，模擬 Pan 或是 Tilt。若轉動速度太奔放，畫面上會顯示大大的紅標警告框「太快了！慢一點」。

---

## 2. 技術規格文檔 (Technical Specification)

### 2.1 對應檔案與元件
- **主要畫面**：`src/views/AiCameraView.vue`

### 2.2 核心技術實作
1. **硬體串流與相機控制 (WebRTC `getUserMedia`)**：
   - 負責呼叫前後鏡頭並串接至 HTML `<video>` 元素，加上透過改變 scale 來處理前置鏡頭的鏡像畫面 (Mirror Effect)。
   - 截圖時使用底層 HTML `<canvas>` 的 2D Context `drawImage` 來建立 PNG。
2. **MediaPipe Pose 姿勢辨識 (On-Device AI)**：
   - 匯入 `@mediapipe/tasks-vision` 的 `PoseLandmarker` 模型。模型載入於輕量化設定中 (`float16/lite`)，綁定委任模式給 `delegate: 'GPU'` 提升幀率。
   - 透過 `requestAnimationFrame` 持續推論每幀 `video`。取得 `nose` (0)、`leftWrist` (15)、`rightWrist` (16) 的座標。若在畫面 Y 軸上 `leftWrist.y < nose.y && rightWrist.y < nose.y`，即構成手舉高的條件，觸發拍照。
3. **裝置方向感應與水平計算 (IMU Sensors)**：
   - 利用 `DeviceOrientationEvent` 監聽。
   - **Alpha**（Z軸指南針偏移）、**Beta**（X軸前後俯仰）、**Gamma**（Y軸左右傾斜）。
   - 在風景模式中，利用 Gamma 來畫出旋轉的水平線，當其小於 1 度時判定為 `isLevelPerfect`；在 Vlog 模式中，則依據規定的旋轉總量 (如 45 度) 對照 Alpha 或 Beta 的變動來推進教學進度條（`#vlogProgress`）。
4. **效能優化與清理機制**：
   - 在 Vue 的 `switchMode` 與 `onUnmounted` 生命週期中，必須確實執行 `cancelAnimationFrame`、`track.stop()` 等硬體回收釋放動作，防止造成記憶體漏水 (Memory Leak) 抑或是背景攝影機常亮發熱的問題。
