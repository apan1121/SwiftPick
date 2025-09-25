# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案架構

這是一個使用 Vue 3 + Webpack 5 建置的中獎抽獎系統專案，具有以下特色：

### 技術棧
- **前端框架**: Vue 3 (Composition API & Options API 混合使用)
- **打包工具**: Webpack 5 (自定義配置，支援 DLL 打包優化)
- **狀態管理**: Vuex 4
- **樣式**: SCSS + Tailwind CSS + Bootstrap 4
- **程式語言**: JavaScript (ES6+) with TypeScript 支援

### 目錄結構
- `src/js/app/` - 應用程式主要入口點
- `src/js/components/` - Vue 元件 (每個元件都有自己的 store、api 目錄)
- `src/js/lib/` - 共用工具程式庫
- `src/js/vendor/` - 第三方程式庫
- `src/css/` - 樣式檔案 (包含 common、commonV2 基礎樣式)
- `webpack5/` - Webpack 配置檔案

### 元件架構模式
每個 Vue 元件都遵循以下結構：
```
components/ComponentName/
├── main.vue          # 主要元件檔案
├── api/index.js      # API 呼叫邏輯
└── store/            # Vuex 模組
    ├── index.js      # 主要 store 檔案
    ├── state.js      # 狀態定義
    ├── mutations.js  # 同步操作
    ├── actions.js    # 異步操作
    └── getters.js    # 計算屬性
```

## 開發指令

### 開發環境建置
```bash
bash deploy/build_dev.sh
```
此指令會完整執行開發環境建置流程：
1. 抓取 git 版號 (dev 模式)
2. 清理 dist 目錄
3. 建置 DLL (development)
4. 執行開發模式打包

### 生產環境建置
```bash
bash deploy/build_prod.sh
```
此指令會完整執行生產環境建置流程：
1. 抓取 git 版號 (prod 模式)
2. 清理 dist 目錄
3. 建置 DLL (production)
4. 執行生產模式打包
5. 清理暫存檔案
6. 移除 gitignore 限制

### 直接使用 npm 指令 (較少使用)
- `npm run build:analyze` - 分析打包結果
- `npm run build:dll:dev` - 只建置開發版 DLL
- `npm run build:dll:prod` - 只建置生產版 DLL

## Webpack 配置重點

- **DLL 優化**: 使用 webpack.config.dll.js 預先打包不常變動的第三方程式庫
- **多執行緒**: 使用 thread-loader 加速建置
- **代碼分割**: 自動分離 node_modules、components、lib 到不同 chunk
- **雙配置**: 同時處理 JS 和 CSS 打包 (JS_CONFIG & CSS_CONFIG)

## 路徑別名
```javascript
app: './src/js/app'
vendor: './src/js/vendor'
lib: './src/js/lib'
components: './src/js/components'
css: './src/css'
```

## 程式碼規範

- ESLint 配置支援 Vue 3、ES6+ 語法
- 使用 Airbnb 風格指南 (部分規則)
- 支援 JSX 語法
- jQuery 作為全域變數可用

## 樣式系統

- 主要使用 SCSS，每個元件可使用 scoped 樣式
- 全域樣式資源自動載入：`_base.scss`、`_color.scss`、`_utils.scss`
- 支援 Tailwind CSS utility classes
- Bootstrap 4 元件可用

## API 和狀態管理

- 每個元件的 API 邏輯獨立在 `api/index.js`
- Vuex store 採用模組化設計
- 使用 `jsVars` 全域變數管理配置
- 支援 jQuery 與 Vue 混合開發模式

## Codex 詳細分析

### 應用啟動與框架
- `src/js/app/index.js` 以 `defineAsyncComponent` 應用入口載入 `components/MainPage/main.vue`，初始化 Vuex、Vue Router、i18n。`mounted` 階段呼叫 `initCampaigns`、`setTitle`、`loadTheme`，並透過 `watch` 監視活動名稱自動更新 `<title>`、SEO/OG meta。
- `index.html` 在 `<head>` 先掛載 Bootstrap、FontAwesome、animate.css 等 CDN，動態插入 DLL 與拆分 chunk，確認 `dataset.ready` 後才載入 `dist/js/app/index.bundle.js`，同時曝光全域 `jsVars.CONFIG.LOCALE_SUPPORT` 供 i18n 使用。

### Vuex 與資料持久化
- `src/js/lib/store/index.js` 遍歷 actions/state/mutations/getters 目錄組裝 store，`luckyDraw` 模組拆成 prizes、participants、drawing、campaign 四類；`createStores(['common','luckyDraw'])` 會合併所需模組。
- `src/js/services/storage.js` 以 IndexedDB `LuckyDrawDB` 儲存資料，提供 `saveCampaign`、`loadCampaign`、`setCampaignsMeta` 等多活動 API；若沒有活動資料會檢查舊版 `saveAll` 資料並轉成新的活動。
- 幾乎所有 mutation 皆由 action 包覆並呼叫 `saveToStorage`，確保修改後立即寫回當前活動或全域備份。

### 路由與流程防呆
- `src/js/router/index.js` 使用 hash history 定義 `/prizes` → `/participants` → `/drawing` → `/results`，`beforeEach` 檢查 `totalPrizeQuantity`、`totalParticipants`，不足時阻擋進入抽獎頁。
- `components/LuckyDraw/Nav.vue` 根據路由名稱計算進度索引，顯示流程步驟並暴露活動重新命名、切換、主題設定按鈕。

### 活動管理
- `components/LuckyDraw/CampaignOverlay.vue` 以全螢幕遮罩列出 `campaignsMeta`，提供建立、重新命名、刪除、進入活動等操作；`loadCampaignById` 會從 IndexedDB 讀取資料並更新 Vuex 狀態。
- `actions/luckyDraw/campaign.js` 的 `initCampaigns` 強制第一次載入顯示遮罩，並協助從舊版單一活動資料產生預設活動。

### 獎項與參與者設定
- `components/LuckyDraw/PrizeSetup.vue` 使用 `services/csv.parseText`、`parsePrizesRows` 驗證 Textarea 與 CSV 匯入，顯示逐行錯誤訊息，成功後觸發 `setPrizes` 並立即儲存；支援 CSV 匯出。
- `components/LuckyDraw/ParticipantList.vue` 以同樣流程處理參與者名單，附加 `generateParticipants(n)` 快速產生測試資料，亦可匯出與清空名單。

### 抽獎流程
- `components/LuckyDraw/DrawingBoard.vue` 結合 Composition API 與 `ResizeObserver` 計算虛擬清單行列，採 `vue-virtual-scroller` 顯示大量參與者；提供獎項選擇、搜尋、自動連抽、亮燈次數調控、音效開關。
- `tick()` 將未得獎 ID 交給 `services/random.pickOne`（crypto RNG），透過 `services/sound` 在開始、指定節奏、揭曉時播放音效；確認候選人後呼叫 `markWinners` 與 `addWinnersToPrize`，拒絕則加入 `excludedIds` 重抽。

### 結果檢視與匯出
- `components/LuckyDraw/Results.vue` 依獎項分組列出中獎者，支援搜尋、單獎項／全部匯出 CSV、取消中獎、清空全部資料；同時顯示參與人數、總中獎數、得獎率。
- 清空所有資料時會啟動 `clearStorage()` 並重新整理頁面以回到初始狀態。

### 主題與音效
- `components/common/ThemeModal.vue` 即時修改 CSS 變數 `--brand-start`、`--brand-end`、`--primary` 並記錄在 `localStorage`，關閉未儲存時會回復原值。
- `src/js/services/sound.js` 快取多個 `Audio` 物件，提供開始、tick、隨機 winner 音效，避免重複載入。

### 建置與部署
- `deploy/build_dev.sh`、`deploy/build_prod.sh` 自動化清理 `dist/`、建置 DLL、執行開發或生產版打包，再按環境進行後續清理。
- `webpack5/` 目錄維護 Webpack JS/CSS 雙配置與 DLL 設定，搭配 `postcss.config.js`、Tailwind、Autoprefixer 處理樣式資產。
