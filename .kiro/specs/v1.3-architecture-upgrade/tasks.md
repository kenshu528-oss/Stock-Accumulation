# v1.3.X 架構升級實作任務清單

## 任務概述

本任務清單將 v1.3.X 架構升級設計轉換為可執行的開發任務。每個任務都是獨立的、可測試的，並且按照依賴順序排列，確保每一步都能在前一步的基礎上進行。

---

- [x] 1. 建立專案基礎結構與配置




  - 建立 `src/` 目錄結構（managers/, services/, types/, utils/）
  - 配置 TypeScript (`tsconfig.json`)
  - 配置 Jest 測試框架 (`jest.config.js`)
  - 配置 Vite 建置工具 (`vite.config.ts`)
  - 配置 ESLint 和 Prettier
  - 更新 `package.json` 添加必要的依賴和腳本
  - _Requirements: 1.1, 2.3, 5.1, 6.1_

- [x] 2. 定義核心型別系統





  - 建立 `src/types/Stock.ts` - 定義 Stock 介面
  - 建立 `src/types/Account.ts` - 定義 Account 介面
  - 建立 `src/types/Dividend.ts` - 定義 Dividend 介面
  - 建立 `src/types/Portfolio.ts` - 定義 PortfolioStats 和 PortfolioData 介面
  - 建立 `src/types/Errors.ts` - 定義錯誤類型（StockError, ApiError, ValidationError, StorageError）
  - 建立 `src/types/Api.ts` - 定義 API 相關型別（StockPriceResult, StockInfo 等）
  - _Requirements: 2.2, 2.4_

- [x] 3. 實作工具函數層





- [x] 3.1 實作格式化工具






  - 建立 `src/utils/formatters.ts`
  - 實作金額格式化函數 `formatCurrency()`
  - 實作日期格式化函數 `formatDate()`
  - 實作百分比格式化函數 `formatPercent()`
  - 實作數字格式化函數 `formatNumber()`
  - _Requirements: 3.3_

- [ ]* 3.2 撰寫格式化工具的屬性測試
  - **Property 2: 工具函數無副作用**
  - **Validates: Requirements 3.3**
  - 測試格式化函數多次呼叫產生相同結果
  - 測試格式化函數不修改輸入參數

- [x] 3.3 實作驗證工具


  - 建立 `src/utils/validators.ts`
  - 實作股票代碼驗證 `validateStockCode()`
  - 實作金額驗證 `validateAmount()`
  - 實作日期驗證 `validateDate()`
  - 實作持股數驗證 `validateShares()`
  - _Requirements: 3.3_

- [x] 3.4 撰寫驗證工具的單元測試





  - 測試各種有效和無效的輸入
  - 測試邊界條件（空字串、負數、特殊字元）
  - _Requirements: 3.3_

- [x] 3.5 實作計算工具


  - 建立 `src/utils/calculators.ts`
  - 實作損益計算 `calculateGain()`
  - 實作報酬率計算 `calculateReturnRate()`
  - 實作殖利率計算 `calculateYield()`
  - 實作調整成本價計算 `calculateAdjustedCost()`
  - _Requirements: 3.3_

- [ ]* 3.6 撰寫計算工具的單元測試
  - 測試各種計算場景
  - 測試邊界條件（零、負數、極大值）
  - _Requirements: 3.3_

- [x] 4. 實作儲存服務層




- [x] 4.1 實作 StorageService

  - 建立 `src/services/StorageService.ts`
  - 實作 `save()` 方法 - 儲存資料到 LocalStorage
  - 實作 `load()` 方法 - 從 LocalStorage 載入資料
  - 實作 `clear()` 方法 - 清除資料
  - 實作 `hasData()` 方法 - 檢查是否有資料
  - 使用 `stockPortfolio_v1.3` 作為儲存鍵值
  - 處理 QuotaExceededError 錯誤
  - _Requirements: 1.3, 7.5_

- [ ]* 4.2 撰寫 StorageService 的單元測試
  - 測試儲存和載入功能
  - 測試錯誤處理（空間不足、解析失敗）
  - 使用 mock LocalStorage
  - _Requirements: 1.3_

- [ ]* 4.3 撰寫 StorageService 的屬性測試
  - **Property 1: 版本資料完全隔離**
  - **Validates: Requirements 1.5**
  - 測試 v1.3 只使用 `stockPortfolio_v1.3` 鍵值
  - 測試操作不影響 `stockPortfolio_v1.2` 鍵值

- [x] 5. 實作資料遷移服務




- [x] 5.1 實作 MigrationService


  - 建立 `src/services/MigrationService.ts`
  - 實作 `hasOldData()` - 檢測舊版資料
  - 實作 `hasNewData()` - 檢測新版資料
  - 實作 `shouldPromptMigration()` - 判斷是否需要提示遷移
  - 實作 `migrate()` - 執行資料遷移
  - 實作 `transformData()` - 轉換資料格式
  - 實作 `validateNewData()` - 驗證轉換結果
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [ ]* 5.2 撰寫 MigrationService 的單元測試
  - 測試檢測邏輯
  - 測試資料轉換邏輯
  - 測試錯誤處理和回滾
  - _Requirements: 4.1, 4.3, 4.5_

- [ ]* 5.3 撰寫資料遷移的屬性測試 - 保留所有股票
  - **Property 3: 資料遷移保留所有股票**
  - **Validates: Requirements 4.3**
  - 測試遷移後股票數量相同
  - 測試核心資訊保持一致

- [ ]* 5.4 撰寫資料遷移的屬性測試 - 保留舊版資料
  - **Property 4: 遷移保留舊版資料**
  - **Validates: Requirements 4.4**
  - 測試遷移後舊版鍵值仍存在
  - 測試舊版資料內容未被修改

- [ ]* 5.5 撰寫資料遷移的屬性測試 - 失敗回滾
  - **Property 5: 遷移失敗時回滾**
  - **Validates: Requirements 4.5**
  - 測試遷移失敗時新版資料不存在或保持原狀

- [x] 6. 實作股價 API 服務





- [x] 6.1 實作 StockApiService 基礎結構


  - 建立 `src/services/StockApiService.ts`
  - 實作快取機制（Map + TTL）
  - 實作 `isCacheValid()` - 檢查快取有效性
  - 實作 `updateCache()` - 更新快取
  - _Requirements: 7.3_

- [x] 6.2 實作證交所 API 呼叫


  - 實作 `fetchFromTWSE()` - 呼叫證交所 API
  - 支援上市、上櫃、興櫃、ETF
  - 處理 API 錯誤和逾時
  - _Requirements: 7.3_

- [x] 6.3 實作 Yahoo Finance API 呼叫


  - 實作 `fetchFromYahoo()` - 呼叫 Yahoo Finance API
  - 處理 API 錯誤和逾時
  - _Requirements: 7.3_

- [x] 6.4 實作本地資料庫查詢


  - 實作 `getFromLocalDB()` - 從本地資料庫查詢
  - 載入股票名稱對照表
  - _Requirements: 7.3_

- [x] 6.5 實作股價查詢主函數


  - 實作 `getStockPrice()` - 按順序嘗試所有 API
  - 實作 `searchStockByCode()` - 搜尋股票資訊
  - 確保遵循：證交所 → Yahoo → 本地資料庫 → 錯誤
  - _Requirements: 7.3_

- [ ]* 6.6 撰寫 StockApiService 的單元測試
  - 測試快取機制
  - 測試各個 API 呼叫
  - 使用 mock 模擬 API 回應
  - _Requirements: 7.3_

- [ ]* 6.7 撰寫 API 搜尋順序的屬性測試
  - **Property 6: API 搜尋順序強制執行**
  - **Validates: Requirements 7.3**
  - 測試證交所成功時不呼叫 Yahoo
  - 測試證交所失敗時才呼叫 Yahoo
  - 測試所有 API 失敗時才使用本地資料庫

- [x] 7. 實作股票管理器




- [x] 7.1 實作 StockManager 基礎結構


  - 建立 `src/managers/StockManager.ts`
  - 初始化 stocks Map
  - 注入 StockApiService 和 StorageService
  - _Requirements: 7.1_

- [x] 7.2 實作股票 CRUD 操作


  - 實作 `addStock()` - 新增股票
  - 實作 `updateStock()` - 更新股票資訊
  - 實作 `deleteStock()` - 刪除股票
  - 實作 `getStock()` - 取得單一股票
  - 實作 `getAllStocks()` - 取得所有股票
  - 實作 `getStocksByAccount()` - 取得指定帳戶的股票
  - _Requirements: 7.1_

- [x] 7.3 實作股價更新功能


  - 實作 `updateStockPrice()` - 更新單一股票股價
  - 實作 `updateAllPrices()` - 批次更新所有股價
  - 使用 Promise.allSettled 處理部分失敗
  - _Requirements: 7.1_

- [x] 7.4 撰寫 StockManager 的單元測試





  - 測試 CRUD 操作
  - 測試股價更新
  - 測試錯誤處理
  - _Requirements: 7.1_

- [x] 8. 實作帳戶管理器




- [x] 8.1 實作 AccountManager


  - 建立 `src/managers/AccountManager.ts`
  - 實作 `createAccount()` - 建立帳戶
  - 實作 `updateAccount()` - 更新帳戶名稱
  - 實作 `deleteAccount()` - 刪除帳戶
  - 實作 `getAccount()` - 取得單一帳戶
  - 實作 `getAllAccounts()` - 取得所有帳戶
  - 注入 StorageService
  - _Requirements: 7.2_

- [ ]* 8.2 撰寫 AccountManager 的單元測試
  - 測試帳戶 CRUD 操作
  - 測試刪除帳戶時的警告邏輯
  - _Requirements: 7.2_


- [x] 9. 實作股息管理器


- [x] 9.1 實作 DividendManager




- [x] 9.1 實作 DividendManager



  - 建立 `src/managers/DividendManager.ts`
  - 實作 `addDividend()` - 新增股息記錄
  - 實作 `updateDividend()` - 更新股息記錄
  - 實作 `deleteDividend()` - 刪除股息記錄
  - 實作 `getDividendsByStock()` - 取得指定股票的股息
  - 實作 `calculateAdjustedCostPrice()` - 計算調整成本價
  - 實作 `calculateTotalDividend()` - 計算總股息收入
  - 注入 StorageService
  - _Requirements: 7.4_

- [ ]* 9.2 撰寫 DividendManager 的單元測試
  - 測試股息 CRUD 操作
  - 測試調整成本價計算
  - 測試總股息計算
  - _Requirements: 7.4_

- [x] 10. 實作投資組合管理器




- [x] 10.1 實作 PortfolioManager


  - 建立 `src/managers/PortfolioManager.ts`
  - 注入 StockManager, AccountManager, DividendManager
  - 實作 `calculatePortfolioStats()` - 計算投資組合統計
  - 實作 `getAccountStats()` - 計算單一帳戶統計
  - 實作 `getTotalStats()` - 計算總體統計
  - _Requirements: 3.1_

- [ ]* 10.2 撰寫 PortfolioManager 的單元測試
  - 測試統計計算
  - 測試多帳戶彙總
  - _Requirements: 3.1_

- [x] 11. 實作錯誤處理與日誌系統




- [x] 11.1 實作錯誤處理工具


  - 建立 `src/utils/errorHandler.ts`
  - 實作 `handleError()` - 統一錯誤處理
  - 實作 `logError()` - 記錄錯誤日誌
  - 實作 `createErrorLog()` - 建立錯誤日誌物件
  - _Requirements: 8.1, 8.2_

- [ ]* 11.2 撰寫錯誤日誌的屬性測試
  - **Property 7: 錯誤日誌完整性**
  - **Validates: Requirements 8.2**
  - 測試日誌物件包含所有必要欄位
  - 測試時間戳記、錯誤類型、訊息、堆疊追蹤


- [x] 12. 實作效能最佳化功能



- [x] 12.1 實作批次處理與並發控制


  - 建立 `src/utils/batchProcessor.ts`
  - 實作 `processBatch()` - 批次處理函數
  - 實作並發限制邏輯（最多 5 個同時請求）
  - 實作 `debounce()` - 防抖動函數
  - _Requirements: 9.2_

- [ ]* 12.2 撰寫並發控制的屬性測試
  - **Property 8: 並發請求限制**
  - **Validates: Requirements 9.2**
  - 測試同時請求數不超過限制
  - 測試批次處理正確性

- [x] 13. 建立應用程式入口




- [x] 13.1 實作 main.ts


  - 建立 `src/main.ts`
  - 初始化所有 Service 和 Manager
  - 實作依賴注入邏輯
  - 實作應用程式啟動流程
  - 檢查是否需要資料遷移
  - _Requirements: 3.4, 4.2_

- [x] 13.2 更新 index.html


  - 更新主頁面引用新的 TypeScript 入口
  - 添加必要的 DOM 元素
  - 設定版本號為 v1.3.0.0001
  - _Requirements: 6.5_

- [ ] 14. 實作雲端同步服務（選用）
- [ ]* 14.1 實作 CloudSyncService
  - 建立 `src/services/CloudSyncService.ts`
  - 實作 GitHub Gist API 整合
  - 實作 `upload()` - 上傳資料到 Gist
  - 實作 `download()` - 從 Gist 下載資料
  - 實作 `sync()` - 同步資料
  - _Requirements: 7.5_

- [ ]* 14.2 撰寫 CloudSyncService 的單元測試
  - 測試上傳和下載功能
  - 測試衝突處理
  - 使用 mock GitHub API
  - _Requirements: 7.5_

- [x] 15. 建置配置與部署準備







- [ ] 15.1 配置 Vite 建置
  - 建立 `vite.config.ts`


  - 配置輸出目錄為 `dist/`
  - 配置 source map 產生
  - 配置程式碼最小化




  - _Requirements: 6.1, 6.2_

- [ ] 15.2 配置 Netlify 部署
  - 建立 `netlify.toml` 配置檔（v1.3.X 專用）
  - 設定建置命令為 `npm run build`


  - 設定發布目錄為 `dist`
  - 配置重定向規則
  - _Requirements: 6.3, 6.4_








- [ ] 15.3 更新版本管理檔案
  - 建立 `src/version.ts` - 版本資訊和歷史
  - 更新 `package.json` 版本號
  - 更新 `README.md` 版本資訊
  - _Requirements: 6.5_

- [ ] 16. 文檔撰寫
- [ ]* 16.1 撰寫開發文檔
  - 更新 `README.md` - 專案說明、開發指南
  - 建立 `ARCHITECTURE.md` - 架構說明
  - 建立 `MIGRATION_GUIDE.md` - 遷移指南
  - _Requirements: 10.3_

- [ ]* 16.2 撰寫 API 文檔
  - 為所有公開類別和方法添加 JSDoc 註解
  - 說明參數、回傳值、錯誤處理
  - _Requirements: 10.1_

- [ ] 17. 最終檢查點
  - 執行所有測試確保通過
  - 檢查測試覆蓋率達到 80% 以上
  - 執行 TypeScript 型別檢查
  - 執行 ESLint 檢查
  - 執行建置確保無錯誤
  - 手動測試核心功能
  - 確認與 v1.2.X 完全隔離
  - 詢問使用者是否有問題或需要調整

---

## 任務執行說明

- **標記 `*` 的任務為選用任務**，可以跳過以加快 MVP 開發
- **屬性測試任務**標註了對應的設計文件屬性編號
- **每個任務都引用了相關的需求編號**，可回溯到需求文件
- **建議按順序執行**，因為後面的任務依賴前面的任務
- **測試任務緊跟在實作任務後**，確保及早發現問題
