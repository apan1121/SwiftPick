# LuckyDraw4 — Vue 3 + Webpack 5 抽獎系統

這是以 Vue 3 + Webpack 5 實作的中獎抽獎系統，支援大量名單、虛擬清單、抽獎動畫、結果管理與本機持久化。

## 快速開始

- 需求：Node.js 20+（可用 `nvm use` 依 `.nvmrc` 設定）
- 安裝：
  - `npm ci`（或 `npm install`）
- 開發模式：
  - `bash deploy/build_dev.sh`
  - 等同於：`npm run clean:before && npm run build:dll:dev && npm run build:dev`
- 正式打包：
  - `bash deploy/build_prod.sh`
  - 等同於：`npm run clean:before && npm run build:dll:prod && npm run build:prod && npm run clean:after`

打包產物輸出至 `dist/`，入口頁為專案根目錄的 `index.html`（使用 hash 路由）。

## 主要功能

- 獎項設定：Textarea/CSV 匯入、清空、匯出、錯誤提示。
- 參與者名單：Textarea/CSV 匯入、清空、匯出、錯誤提示、測試資料生成。
- 抽獎流程：虛擬清單、搜尋、高亮動畫、加速/暫停/重新開始、候選中獎者確認、音效反饋。
- 結果管理：依獎項檢視、搜尋、取消中獎、清空、單獎項/全部 CSV 匯出。
- 持久化：IndexedDB 本機儲存（載入/儲存）。

## 畫面路由

- `/prizes`：獎項設定（`PrizeSetup.vue`）
- `/participants`：參與者名單（`ParticipantList.vue`）
- `/drawing`：開始抽獎（`DrawingBoard.vue`）
- `/results`：抽獎結果（`Results.vue`）

未設定獎項或名單時會被導回前置頁面，避免誤操作。

## 技術重點

- 前端：Vue 3（Options API + Composition API 混用）、Vue Router 4、Vuex 4
- 打包：Webpack 5，自訂 DLL 設定、JS/CSS 分離、代碼分割、thread-loader
- 樣式：SCSS + Bootstrap 4
- 虛擬清單：使用 `vue-virtual-scroller`（替代原規劃 `@tanstack/vue-virtual`）
- 隨機：`crypto.getRandomValues` 實作公平 RNG
- 音效：HTML5 Audio（資源於 `dist/mp3`）
- 持久化：IndexedDB（見 `src/js/services/storage.js`）

## 抽獎亂數流程（`src/js/services/random.js`）

1. **整理可抽名單**：
   - 取得原始參與者陣列，建立 `exclude` 集合（已中獎或手動剔除）。
   - 透過 `arr.filter((x) => !exclude.has(x))` 產生 `pool`，若為空則直接返回 `null` 或空結果。
2. **產生安全亂數索引**：
   - `getRandomInt(max)` 建立 `Uint32Array(1)`，使用 `crypto.getRandomValues` 取 0～2³²-1 的均勻亂數。
   - 透過 `Math.floor((array[0] / (0xffffffff + 1)) * max)` 將其縮放為 0～`max - 1` 範圍。
3. **單人抽籤 `pickOne`**：
   - 直接以第 2 步產生的索引從 `pool` 取出候選人，若 `pool` 為空返回 `null`。
4. **多人唯一抽籤 `pickRandomDistinct`**：
   - 初始化空陣列 `chosen` 與集合 `used`。
   - 迴圈至多執行 `Math.min(k, pool.length)` 次；每次呼叫 `getRandomInt(pool.length)` 取索引。
   - 若索引已存在於 `used`，持續重新抽直到取得未用過的索引（`while (used.has(idx))`）。
   - 將新索引加入 `used` 並把對應參與者推入 `chosen`，確保本輪不重覆且不需排除名單。
   - 迴圈結束後返回 `chosen`。
5. **公平性重點**：
   - 全程使用加密等級亂數來源，避免 `Math.random` 的可預測性。
   - `exclude` 與 `used` 雙層防護，阻止已排除或本輪已抽中的 ID 再次出現。

## 目前進度（與規劃對照）

- [x] 路由與頁面骨架：`/prizes` `/participants` `/drawing` `/results`
- [x] 導覽元件（步驟狀態、跳轉）
- [x] Vuex 模組（prizes/participants/drawing）
- [x] CSV 解析與驗證服務 + 測試資料生成
- [x] 虛擬清單 + 搜尋（以 `vue-virtual-scroller` 實作）
- [x] 抽獎動畫（亮燈/加速/停止）+ RNG + 去重
- [x] 音效掛載（開始、停止、中獎）
- [ ] 結果頁展開/收合（目前已分類+搜尋與匯出，尚無折疊交互）
- [x] 匯出 CSV（單獎項/全部）
- [ ] IndexedDB 分批寫入/載入（目前為一次性儲存/載入）
- [ ] 效能/記憶體最佳化與錯誤處理細化

## 使用說明（基本流程）

0) 進入頁面會彈出「全頁遮罩」活動選擇視窗，需先選擇既有活動或新增活動（每個活動會記憶獨立的獎項與名單）。即使先前選過活動，初次載入也會要求再次選擇或新增，以防誤用。

1) 進入「獎項設定」頁，透過 Textarea 或 CSV 輸入「獎項,數量」格式資料，解析後儲存。

2) 前往「參與者名單」，透過 Textarea 或 CSV 輸入「姓名,暱稱」格式資料（暱稱可空），或一鍵產生測試資料。

3) 進入「開始抽獎」，選擇獎項後開始抽獎，可加速、暫停、重新開始；停止後「確認」寫入結果或「取消」重抽。

4) 在「抽獎結果」檢視中獎名單，支援依獎項匯出或全部匯出、取消中獎、清空所有資料。

系統會自動將資料儲存在 IndexedDB，重新整理後仍會保留（如需清空，於結果頁可一鍵清除）。

## 已知事項與下一步

- 大量名單（5 萬）壓測與最佳化：評估記憶體占用、動畫流暢度、虛擬滾動效能微調。
- 匯入進度條與分批提交：PapaParse chunk 解析、UI 顯示進度、避免主執行緒阻塞。
- 結果頁展開/收合：加入折疊交互與快速操作。
- IndexedDB 分批寫入/載入：避免一次性大物件寫入造成延遲或失敗，增加錯誤回退機制。
- 錯誤處理與驗證：邊界情況（重複策略、極端獎項/名額）與使用者提示。

## 疑難排解

- 音效未播放：部分瀏覽器需使用者互動後才能播放音訊，請先點擊頁面內按鈕。
- 本機資料未載入：瀏覽器隱私模式或封鎖 IndexedDB 可能導致存取失敗，可於主控台觀察警告訊息。
