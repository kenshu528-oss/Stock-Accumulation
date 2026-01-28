# v1.3.X 架構升級需求文件

## 簡介

v1.3.X 是存股紀錄系統的重大架構升級版本，旨在建立模組化、可維護、可測試的現代化前端架構。本版本將採用 TypeScript、模組化設計、完整的測試覆蓋，並與 v1.2.X 版本完全隔離，確保兩個版本可以獨立運作和部署。

## 詞彙表

- **系統 (System)**: v1.3.X 版本的存股紀錄系統
- **舊版系統 (Legacy System)**: v1.2.X 版本，位於 `archive/legacy-system/` 目錄
- **新版系統 (New System)**: v1.3.X 版本，位於主目錄 `src/` 和 `index.html`
- **模組 (Module)**: 具有單一職責的獨立程式碼單元
- **TypeScript**: 具有型別系統的 JavaScript 超集
- **版本隔離 (Version Isolation)**: 確保新舊版本的資料、代碼、部署完全獨立
- **LocalStorage Key**: 瀏覽器本地儲存的鍵值，用於區分不同版本的資料
- **資料遷移 (Data Migration)**: 將舊版資料轉換為新版格式的過程
- **Manager**: 負責特定領域業務邏輯的管理類別
- **Service**: 提供特定功能服務的類別（如 API 呼叫、儲存）
- **Type Definition**: TypeScript 型別定義檔案
- **單元測試 (Unit Test)**: 測試單一函數或類別的測試
- **整合測試 (Integration Test)**: 測試多個模組協作的測試
- **屬性測試 (Property-Based Test)**: 驗證通用屬性的測試方法

## 需求

### 需求 1 - 專案結構與版本隔離

**使用者故事：** 作為開發者，我想要建立清晰的專案結構並確保新舊版本完全隔離，以便兩個版本可以獨立開發、測試和部署。

#### 驗收標準

1. WHEN 建立 v1.3.X 專案結構 THEN 系統 SHALL 在主目錄建立 `src/` 資料夾並包含 `managers/`、`services/`、`types/`、`utils/` 子目錄
2. WHEN 舊版系統存在於 `archive/legacy-system/` THEN 系統 SHALL 確保新版系統不引用或修改舊版檔案
3. WHEN 新版系統使用 LocalStorage THEN 系統 SHALL 使用 `stockPortfolio_v1.3` 作為儲存鍵值
4. WHEN 舊版系統使用 LocalStorage THEN 系統 SHALL 繼續使用 `stockPortfolio_v1.2` 作為儲存鍵值
5. WHEN 兩個版本同時存在 THEN 系統 SHALL 確保它們的資料、配置、部署完全獨立

### 需求 2 - TypeScript 遷移與型別系統

**使用者故事：** 作為開發者，我想要使用 TypeScript 來提升代碼品質和可維護性，以便在開發階段就能發現型別錯誤。

#### 驗收標準

1. WHEN 建立新的程式碼檔案 THEN 系統 SHALL 使用 `.ts` 副檔名並包含完整的型別定義
2. WHEN 定義資料結構 THEN 系統 SHALL 在 `src/types/` 目錄建立對應的 TypeScript 介面
3. WHEN 編譯 TypeScript 代碼 THEN 系統 SHALL 使用 `tsconfig.json` 配置並輸出到適當目錄
4. WHEN 型別檢查執行 THEN 系統 SHALL 確保所有函數參數、回傳值、變數都有明確型別
5. WHEN 使用第三方函式庫 THEN 系統 SHALL 安裝對應的 `@types` 套件或建立型別宣告檔

### 需求 3 - 模組化架構設計

**使用者故事：** 作為開發者，我想要將系統拆分為獨立的模組，以便提升代碼的可測試性、可維護性和可重用性。

#### 驗收標準

1. WHEN 設計系統架構 THEN 系統 SHALL 將業務邏輯封裝在 Manager 類別中（如 `StockManager`、`AccountManager`）
2. WHEN 需要外部服務 THEN 系統 SHALL 將 API 呼叫、儲存操作封裝在 Service 類別中（如 `StockApiService`、`StorageService`）
3. WHEN 建立工具函數 THEN 系統 SHALL 將通用功能放置在 `src/utils/` 目錄並確保無副作用
4. WHEN Manager 需要使用 Service THEN 系統 SHALL 透過依賴注入或建構函數傳遞 Service 實例
5. WHEN 模組之間需要通訊 THEN 系統 SHALL 使用明確的介面定義而非直接存取內部狀態

### 需求 4 - 資料遷移機制

**使用者故事：** 作為使用者，我想要能夠將 v1.2.X 的資料遷移到 v1.3.X，以便無縫升級到新版本而不遺失資料。

#### 驗收標準

1. WHEN 使用者首次開啟 v1.3.X THEN 系統 SHALL 檢測 `stockPortfolio_v1.2` 是否存在
2. WHEN 偵測到舊版資料且新版無資料 THEN 系統 SHALL 顯示資料遷移提示對話框
3. WHEN 使用者同意遷移 THEN 系統 SHALL 讀取舊版資料、轉換格式並儲存到 `stockPortfolio_v1.3`
4. WHEN 資料遷移完成 THEN 系統 SHALL 保留舊版資料不刪除並顯示遷移成功訊息
5. WHEN 資料遷移失敗 THEN 系統 SHALL 記錄錯誤、回滾變更並提供手動匯入選項

### 需求 5 - 測試基礎設施

**使用者故事：** 作為開發者，我想要建立完整的測試基礎設施，以便確保代碼品質並在重構時有信心。

#### 驗收標準

1. WHEN 建立測試環境 THEN 系統 SHALL 配置 Jest 作為測試框架並支援 TypeScript
2. WHEN 撰寫單元測試 THEN 系統 SHALL 為每個 Manager 和 Service 建立對應的 `.test.ts` 檔案
3. WHEN 執行測試 THEN 系統 SHALL 使用 `npm test` 命令執行所有測試並顯示覆蓋率報告
4. WHEN 測試需要模擬資料 THEN 系統 SHALL 在 `tests/fixtures/` 目錄建立測試資料檔案
5. WHEN 測試需要模擬 API THEN 系統 SHALL 使用 Jest mock 功能模擬外部服務

### 需求 6 - 建置與部署配置

**使用者故事：** 作為開發者，我想要建立自動化的建置和部署流程，以便快速發布新版本到生產環境。

#### 驗收標準

1. WHEN 執行建置命令 THEN 系統 SHALL 編譯 TypeScript、打包資源並輸出到 `dist/` 目錄
2. WHEN 建置完成 THEN 系統 SHALL 產生 source map 以便除錯並最小化輸出檔案大小
3. WHEN 部署到 Netlify THEN 系統 SHALL 使用獨立的站點配置（不同於 v1.2.X）
4. WHEN 配置 Netlify THEN 系統 SHALL 在 `netlify.toml` 指定 v1.3.X 的建置命令和輸出目錄
5. WHEN 版本號更新 THEN 系統 SHALL 使用 v1.3.X.XXXX 格式（X 為次版本號，XXXX 為建置號）

### 需求 7 - 核心功能模組化重構

**使用者故事：** 作為開發者，我想要將 v1.2.X 的核心功能以模組化方式重新實作，以便提升代碼品質並保持功能一致性。

#### 驗收標準

1. WHEN 實作股票管理功能 THEN 系統 SHALL 建立 `StockManager` 類別並包含新增、刪除、更新股票的方法
2. WHEN 實作帳戶管理功能 THEN 系統 SHALL 建立 `AccountManager` 類別並管理多帳戶邏輯
3. WHEN 實作股價更新功能 THEN 系統 SHALL 建立 `StockApiService` 並遵循證交所 API → Yahoo Finance → 本地資料庫的搜尋順序
4. WHEN 實作股息管理功能 THEN 系統 SHALL 建立 `DividendManager` 類別並處理股息計算和成本價調整
5. WHEN 實作資料儲存功能 THEN 系統 SHALL 建立 `StorageService` 類別並封裝 LocalStorage 和雲端同步邏輯

### 需求 8 - 錯誤處理與日誌系統

**使用者故事：** 作為開發者，我想要建立統一的錯誤處理和日誌系統，以便快速定位和修復問題。

#### 驗收標準

1. WHEN 系統發生錯誤 THEN 系統 SHALL 使用統一的錯誤處理機制並記錄詳細資訊
2. WHEN 記錄日誌 THEN 系統 SHALL 包含時間戳記、錯誤類型、堆疊追蹤和相關上下文
3. WHEN API 呼叫失敗 THEN 系統 SHALL 記錄請求參數、回應狀態並嘗試備用方案
4. WHEN 開發模式執行 THEN 系統 SHALL 在控制台顯示詳細的除錯資訊
5. WHEN 生產模式執行 THEN 系統 SHALL 僅記錄關鍵錯誤並避免洩漏敏感資訊

### 需求 9 - 效能監控與最佳化

**使用者故事：** 作為開發者，我想要監控系統效能並進行最佳化，以便提供流暢的使用者體驗。

#### 驗收標準

1. WHEN 系統初始化 THEN 系統 SHALL 在 3 秒內完成載入並顯示使用者介面
2. WHEN 執行股價更新 THEN 系統 SHALL 使用批次請求並限制並發數量以避免 API 限流
3. WHEN 處理大量資料 THEN 系統 SHALL 使用虛擬滾動或分頁技術維持 60 FPS 的畫面更新率
4. WHEN 監控效能指標 THEN 系統 SHALL 記錄關鍵操作的執行時間並在開發模式顯示
5. WHEN 偵測到效能瓶頸 THEN 系統 SHALL 在控制台輸出警告並建議最佳化方案

### 需求 10 - 文檔與開發者體驗

**使用者故事：** 作為開發者，我想要有完整的文檔和良好的開發者體驗，以便快速上手和貢獻代碼。

#### 驗收標準

1. WHEN 建立新模組 THEN 系統 SHALL 包含 JSDoc 註解說明類別、方法、參數和回傳值
2. WHEN 撰寫複雜邏輯 THEN 系統 SHALL 添加內聯註解解釋設計決策和注意事項
3. WHEN 建立 README THEN 系統 SHALL 包含專案結構說明、開發指南、建置步驟和部署流程
4. WHEN 設定開發環境 THEN 系統 SHALL 提供 `npm install` 和 `npm run dev` 命令快速啟動
5. WHEN 提交代碼 THEN 系統 SHALL 使用 ESLint 和 Prettier 確保代碼風格一致性
