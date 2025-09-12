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