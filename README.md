# 存股紀錄系統 v1.3.X

> **TypeScript 模組化架構版本** - 現代化的股票投資組合管理系統

一個採用 TypeScript 模組化架構的網頁版存股紀錄系統，整合真實台股股價 API，幫助您追蹤多個帳戶的股票投資組合。

## 🚀 v1.3.X 新架構特色

### 🏗️ 技術架構升級
- **TypeScript** - 完整的型別安全和 IDE 支援
- **模組化設計** - 清晰的 Managers、Services、Utils 分層
- **依賴注入** - 易於測試和維護的架構
- **Vite 建置工具** - 快速的開發和建置體驗
- **Jest 測試框架** - 完整的單元測試和屬性測試

### 📦 核心模組
- **StockManager** - 股票管理（CRUD、股價更新）
- **AccountManager** - 帳戶管理（多帳戶支援）
- **DividendManager** - 股息管理（記錄、計算、統計）
- **PortfolioManager** - 投資組合統計（損益、報酬率）
- **StockApiService** - 股價 API 服務（證交所 + Yahoo Finance）
- **StorageService** - 資料儲存（版本隔離）
- **MigrationService** - 資料遷移（v1.2.X → v1.3.X）

### 🔄 版本隔離
- **完全獨立** - v1.3.X 與 v1.2.X 資料完全隔離
- **自動遷移** - 偵測舊版資料並提供遷移選項
- **保留舊版** - 遷移後保留舊版資料，可隨時回退
- **雙版本並存** - 可同時使用兩個版本

## 📋 功能特色

### 💹 股票管理
- ✅ 多帳戶管理（新增/刪除/重新命名）
- ✅ 股票新增/刪除/編輯
- ✅ **真實股價 API 整合**（證交所 + Yahoo Finance + 本地資料庫）
- ✅ 自動股票名稱查詢
- ✅ 多重資料源備援機制
- ✅ 損益計算和報酬率分析

### 💰 股息管理系統
- ✅ **完整股息記錄與統計**
- ✅ 自動調整成本價機制
- ✅ 真實報酬率計算（含股息）
- ✅ 股息殖利率分析
- ✅ **購買日期追蹤與自動股息計算**
- ✅ **多次買入支援**（智能合併或獨立記錄）

### 🎨 使用者體驗
- ✅ **雙隱私保護模式**（總市值 + 個股金額獨立控制）
- ✅ 深色模式支援
- ✅ 響應式設計（手機/平板友善）
- ✅ 即時編輯股數和成本價
- ✅ 批量編輯功能

### ☁️ 資料同步
- ✅ 本地資料儲存（LocalStorage）
- ✅ 雲端同步（GitHub Gist）
- ✅ 跨裝置資料同步
- ✅ 版本管理系統

## 🛠️ 開發環境需求

### 必要環境
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 支援瀏覽器
- Chrome >= 80
- Firefox >= 78
- Safari >= 14
- Edge >= 80

## 🚀 快速開始

### 開發模式
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 瀏覽器自動開啟 http://localhost:3000
```

### 生產建置
```bash
# 建置專案
npm run build

# 預覽建置結果
npm run preview

# 輸出目錄：dist/
```

### 其他指令
```bash
# 型別檢查
npm run type-check

# 程式碼檢查
npm run lint

# 格式化程式碼
npm run format

# 執行測試
npm test

# 測試覆蓋率
npm run test:coverage

# 顯示版本資訊
npm run version:show

# 顯示版本歷史
npm run version:changelog
```

## 📊 股價資料來源

系統會按優先順序嘗試以下 API：

1. **台灣證交所 (TWSE/TPEx)** - 官方資料，最高優先級
2. **Yahoo Finance** - 國際資料源，次優先級
3. **本地資料庫** - 股票名稱對照，最低優先級

每個股票會顯示資料來源和最後更新時間，確保資料透明度。

## 🎯 使用方法

### 基本操作
1. 執行 `npm run dev` 啟動開發伺服器
2. 或建置後開啟 `dist/index.html`
3. 點擊「新增股票」按鈕新增持股
4. 點擊「新增帳戶」按鈕新增更多帳戶
5. 系統會自動更新股價並計算損益

### 進階功能
- **股息管理**：點擊「股息管理」按鈕開啟完整股息系統
- **隱私保護**：獨立控制總市值和個股金額的顯示
- **雲端同步**：設定 GitHub Token 實現跨裝置同步
- **資料遷移**：系統會自動偵測 v1.2.X 資料並提示遷移

## 🏗️ 專案結構

```
src/
├── main.ts                 # 應用程式入口
├── managers/               # 業務邏輯層
│   ├── StockManager.ts
│   ├── AccountManager.ts
│   ├── DividendManager.ts
│   └── PortfolioManager.ts
├── services/               # 服務層
│   ├── StorageService.ts
│   ├── MigrationService.ts
│   └── StockApiService.ts
├── types/                  # 型別定義
│   ├── Stock.ts
│   ├── Account.ts
│   ├── Dividend.ts
│   ├── Portfolio.ts
│   ├── Errors.ts
│   └── Api.ts
├── utils/                  # 工具函數
│   ├── formatters.ts
│   ├── validators.ts
│   ├── calculators.ts
│   ├── errorHandler.ts
│   └── batchProcessor.ts
└── version.ts              # 版本管理

tests/                      # 測試檔案
├── managers/
├── services/
├── utils/
└── integration/

dist/                       # 建置輸出
├── index.html
├── js/
├── css/
└── assets/
```

## 🔄 從 v1.2.X 遷移

### 自動遷移
1. 首次開啟 v1.3.X 時，系統會自動偵測 v1.2.X 資料
2. 顯示遷移提示對話框
3. 選擇「確定」執行自動遷移
4. 遷移完成後，舊版資料會保留不刪除

### 手動遷移
如果自動遷移失敗，可以：
1. 匯出 v1.2.X 資料
2. 在 v1.3.X 中手動匯入
3. 或繼續使用 v1.2.X（位於 `archive/legacy-system/`）

## 🧪 測試

### 執行測試
```bash
# 執行所有測試
npm test

# 監視模式
npm run test:watch

# 覆蓋率報告
npm run test:coverage
```

### 測試類型
- **單元測試** - 測試個別函數和類別
- **屬性測試** - 使用 fast-check 進行屬性驗證
- **整合測試** - 測試模組間的協作

## 📦 部署

### Netlify 部署
```bash
# 建置專案
npm run build

# 上傳 dist/ 目錄到 Netlify
# 或使用 Netlify CLI
netlify deploy --prod --dir=dist
```

### 其他平台
- **GitHub Pages** - 上傳 dist/ 目錄
- **Vercel** - 連接 GitHub 倉庫自動部署
- **靜態主機** - 任何支援靜態檔案的主機

## 📄 版權資訊

**存股紀錄系統 v1.3.X (Stock Portfolio System)**  
版權所有 © 2025 徐國洲

### 🏷️ 授權條款
本專案採用 [CC BY-NC 4.0 License](LICENSE) 授權：
- ✅ 允許個人使用、修改、分發
- ✅ 允許非營利組織使用
- ❌ **禁止商業使用**
- ⚠️ 必須保留版權聲明和授權條款

### 📧 聯絡方式
- Email: kenshu528@gmail.com
- GitHub: https://github.com/kenshu528-oss

### ⚖️ 免責聲明
本軟體僅供個人投資記錄使用，不構成投資建議。股價資料來源於第三方 API，準確性請自行驗證。使用者需自行承擔投資風險。

## 📈 版本歷史

### v1.2.2.0041 (2025-01-28) - 重複更新修正 🔧

- 🔧 **修正重複更新問題：去除重複股票代碼**
- 🌐 新增即時股價API的CORS代理支援
- 📝 優化控制台訊息：減少錯誤警告
- ✅ 改善股價更新邏輯和錯誤處理
- 🚀 提升系統穩定性和用戶體驗

### v1.2.2.0040 (2025-01-28) - 手動更新模式 🎯

- 🎯 **取消自動更新功能，改為完全手動觸發**
- 🔧 修正Promise錯誤處理，避免控制台錯誤
- 🌐 新增櫃買中心API的CORS代理支援
- ✅ 優化錯誤處理，不中斷其他股票更新
- 🚀 減少不必要的API請求，提升系統穩定性

### v1.2.2.0039 (2025-01-28) - 語法錯誤修正 ✅

- 🔧 **修正JavaScript語法錯誤：移除多餘的括號**
- 🚀 解決StockPortfolio類別無法載入的問題
- ✅ 修正按鈕失效的根本原因
- 🎯 確保portfolio實例正確建立
- 💯 系統功能完全恢復正常

### v1.2.2.0038 (2025-01-28) - 系統診斷優化 🔍

- 🔍 **新增JavaScript載入狀態檢測**
- 🚀 加入版本號快取清除機制
- ✅ 新增系統初始化狀態檢查
- 🛠️ 改善除錯和錯誤診斷功能
- 💾 確保瀏覽器快取問題解決

### v1.2.2.0037 (2025-01-28) - JavaScript語法修正 🔧

- 🔧 **修正JavaScript語法錯誤**
- 🧹 清理addStock函數中的重複代碼
- ✅ 修正按鈕失效問題
- 🚀 確保所有功能正常運作
- 📝 優化代碼結構和可讀性

### v1.2.2.0036 (2025-01-28) - 即時股價API升級 🚀
- 🔄 **新增證交所即時股價API支援**
- 📊 新增股票時自動獲取即時股價
- 🏗️ 實作fetchRealtimePrice函數
- 🎯 智能判斷交易所(上市/上櫃)
- 🛡️ 即時API失敗時自動降級為收盤價API
- ✨ 新增股票驗證流程優化
- ⚡ 控制API呼叫頻率：一次一檔最安全
- 💬 改善用戶體驗：顯示股價確認對話框

### v1.2.2.0035 (2025-01-02) - 版本隔離實作
- 🔒 實作版本隔離：修改LocalStorage Key為stockPortfolio_v1.2
- 🔄 新增自動資料遷移功能
- 💾 檢測舊版資料並自動遷移到新版key
- 🛡️ 備份舊版資料為stockPortfolio_backup
- 🎯 確保新舊版本資料完全隔離
- 🚀 為v1.3.X版本做準備

### v1.2.2.0008 (2024-12-24) - 最後的 v1.2.X 版本
- 🔧 Bug 修復和穩定性改進
- 📱 響應式設計優化
- 🎨 UI/UX 改進
- 📁 已遷移至 `archive/legacy-system/`

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 開發流程
1. Fork 本專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 發起 Pull Request

### 開發規範
- 使用 TypeScript 進行開發
- 遵循 ESLint 和 Prettier 規範
- 撰寫單元測試
- 更新相關文檔

## 🔗 相關連結

- [部署指南](DEPLOYMENT.md)
- [雲端同步設定](CLOUD_SYNC_USER_GUIDE.md)
- [疑難排解](TROUBLESHOOTING_GUIDE.md)
- [版權保護指南](COPYRIGHT.md)
- [商業使用聲明](COMMERCIAL_USE_NOTICE.md)

---

## 💡 技術特色

- **前端技術**：TypeScript + Vite + Jest
- **架構模式**：模組化 + 依賴注入
- **資料儲存**：LocalStorage (本地) + GitHub Gist (雲端)
- **API 整合**：多重股價資料源
- **響應式設計**：支援手機、平板、桌面
- **版本管理**：自動資料遷移機制
- **隱私保護**：本地優先，可選雲端同步

**開發者**：徐國洲 | **版本**：v1.2.2.0041 | **更新日期**：2025-01-28