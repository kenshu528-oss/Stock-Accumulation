# v1.3.X 架構說明文檔

## 概述

v1.3.X 採用現代化的 TypeScript 模組化架構，遵循 SOLID 原則和依賴注入模式，提供可維護、可測試、可擴展的代碼結構。

## 🏗️ 架構設計原則

### 1. 分層架構
```
┌─────────────────────────────────────┐
│           UI Layer (HTML/CSS)       │
├─────────────────────────────────────┤
│         Application Layer           │
│            (main.ts)                │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│           (Managers)                │
├─────────────────────────────────────┤
│          Service Layer              │
│          (Services)                 │
├─────────────────────────────────────┤
│          Utility Layer              │
│           (Utils)                   │
├─────────────────────────────────────┤
│          Type Layer                 │
│           (Types)                   │
└─────────────────────────────────────┘
```

### 2. 依賴注入
- **向上依賴**：下層不依賴上層
- **介面隔離**：通過 TypeScript 介面定義契約
- **控制反轉**：依賴通過建構函數注入

### 3. 單一職責
- 每個類別只負責一個特定領域
- 每個模組有明確的邊界和職責
- 避免上帝類別和緊耦合

## 📦 模組結構

### Application Layer (應用程式層)

#### `src/main.ts`
- **職責**：應用程式入口點和初始化
- **功能**：
  - 初始化所有服務和管理器
  - 執行依賴注入
  - 處理資料遷移
  - 暴露 API 到全域

```typescript
class Application {
  private storageService: StorageService;
  private stockManager: StockManager;
  // ... 其他依賴
  
  async initialize(): Promise<void> {
    this.initializeServices();
    await this.checkAndMigrate();
    this.initializeManagers();
    this.exposeToGlobal();
  }
}
```

### Business Logic Layer (業務邏輯層)

#### `src/managers/`
管理器負責特定領域的業務邏輯，不直接處理 UI 或外部服務。

##### `StockManager.ts`
- **職責**：股票相關業務邏輯
- **依賴**：`StockApiService`, `StorageService`
- **功能**：
  - 股票 CRUD 操作
  - 股價更新邏輯
  - 資料驗證和轉換

##### `AccountManager.ts`
- **職責**：帳戶管理業務邏輯
- **依賴**：`StorageService`
- **功能**：
  - 帳戶 CRUD 操作
  - 帳戶驗證

##### `DividendManager.ts`
- **職責**：股息管理業務邏輯
- **依賴**：`StorageService`
- **功能**：
  - 股息記錄管理
  - 調整成本價計算
  - 股息統計

##### `PortfolioManager.ts`
- **職責**：投資組合統計和分析
- **依賴**：`StockManager`, `AccountManager`, `DividendManager`
- **功能**：
  - 投資組合統計計算
  - 跨帳戶數據彙總
  - 報酬率分析

### Service Layer (服務層)

#### `src/services/`
服務層處理外部系統整合和基礎設施關注點。

##### `StorageService.ts`
- **職責**：資料持久化
- **功能**：
  - LocalStorage 操作
  - 資料序列化/反序列化
  - 錯誤處理

##### `StockApiService.ts`
- **職責**：股價資料獲取
- **功能**：
  - 多 API 整合（證交所、Yahoo Finance）
  - 快取機制
  - 錯誤處理和重試

##### `MigrationService.ts`
- **職責**：資料遷移
- **功能**：
  - 版本檢測
  - 資料格式轉換
  - 遷移驗證

### Utility Layer (工具層)

#### `src/utils/`
純函數工具，無副作用，可重用。

##### `formatters.ts`
- **職責**：資料格式化
- **功能**：金額、日期、百分比格式化

##### `validators.ts`
- **職責**：資料驗證
- **功能**：股票代碼、金額、日期驗證

##### `calculators.ts`
- **職責**：數學計算
- **功能**：損益、報酬率、殖利率計算

##### `errorHandler.ts`
- **職責**：錯誤處理
- **功能**：統一錯誤處理和日誌記錄

##### `batchProcessor.ts`
- **職責**：批次處理
- **功能**：並發控制、防抖動

### Type Layer (型別層)

#### `src/types/`
TypeScript 型別定義，提供編譯時型別安全。

##### 核心型別
- `Stock.ts` - 股票資料結構
- `Account.ts` - 帳戶資料結構
- `Dividend.ts` - 股息資料結構
- `Portfolio.ts` - 投資組合資料結構
- `Errors.ts` - 錯誤型別定義
- `Api.ts` - API 相關型別

## 🔄 資料流

### 1. 讀取流程
```
UI → Manager → Service → External API/Storage
```

### 2. 寫入流程
```
UI → Manager → Validation → Service → Storage
```

### 3. 計算流程
```
Manager → Utils (計算) → Manager → UI
```

## 🧪 測試架構

### 測試分層
```
┌─────────────────────────────────────┐
│        Integration Tests            │
│     (跨模組協作測試)                 │
├─────────────────────────────────────┤
│         Unit Tests                  │
│      (單一模組測試)                  │
├─────────────────────────────────────┤
│      Property Tests                 │
│      (屬性驗證測試)                  │
└─────────────────────────────────────┘
```

### 測試策略
- **單元測試**：測試個別類別和函數
- **屬性測試**：使用 fast-check 驗證通用屬性
- **整合測試**：測試模組間協作
- **Mock 策略**：模擬外部依賴

## 🔧 依賴注入模式

### 建構函數注入
```typescript
export class StockManager {
  constructor(
    private apiService: StockApiService,
    private storageService: StorageService
  ) {}
}
```

### 依賴圖
```
Application
├── StorageService (無依賴)
├── MigrationService (無依賴)
├── StockApiService (無依賴)
├── StockManager (依賴: StockApiService, StorageService)
├── AccountManager (依賴: StorageService)
├── DividendManager (依賴: StorageService)
└── PortfolioManager (依賴: StockManager, AccountManager, DividendManager)
```

## 📊 資料模型

### 核心實體關係
```
Account (1) ──── (N) Stock
Stock (1) ──── (N) Dividend
Portfolio ──── (N) Account
```

### 資料儲存格式
```typescript
interface PortfolioData {
  version: string;
  accounts: Account[];
  stocks: Stock[];
  dividends: Dividend[];
  settings: Settings;
  metadata: Metadata;
}
```

## 🔒 版本隔離機制

### 儲存鍵值隔離
- v1.2.X: `stockPortfolio_v1.2`
- v1.3.X: `stockPortfolio_v1.3`

### 遷移流程
1. 檢測舊版資料存在
2. 檢測新版資料不存在
3. 提示使用者遷移
4. 執行資料轉換
5. 驗證轉換結果
6. 儲存新版資料
7. 保留舊版資料

## ⚡ 效能考量

### 快取策略
- **股價快取**：1 分鐘 TTL
- **計算結果快取**：資料變更時失效
- **本地資料庫**：Map 結構快速查詢

### 批次處理
- **股價更新**：並發限制 5 個請求
- **資料儲存**：防抖動 500ms

### 延遲載入
- **股息資料**：按需載入
- **歷史資料**：分頁載入

## 🛡️ 錯誤處理策略

### 錯誤分類
- `StockError` - 股票相關錯誤
- `ApiError` - API 呼叫錯誤
- `ValidationError` - 資料驗證錯誤
- `StorageError` - 儲存相關錯誤

### 處理策略
- **API 錯誤**：自動重試 + 降級
- **儲存錯誤**：錯誤提示 + 備份建議
- **驗證錯誤**：即時反饋 + 修正建議

## 🔮 擴展性設計

### 新增管理器
1. 建立新的 Manager 類別
2. 定義相關型別
3. 在 Application 中注入
4. 撰寫對應測試

### 新增服務
1. 建立新的 Service 類別
2. 定義服務介面
3. 在需要的 Manager 中注入
4. 撰寫 Mock 和測試

### 新增 API
1. 在 StockApiService 中新增方法
2. 更新 API 型別定義
3. 實作錯誤處理
4. 更新搜尋順序

## 📈 監控和日誌

### 日誌分級
- **DEBUG**：詳細除錯資訊
- **INFO**：一般操作資訊
- **WARN**：警告訊息
- **ERROR**：錯誤訊息

### 效能監控
- 關鍵操作執行時間
- API 回應時間
- 記憶體使用情況
- 錯誤發生頻率

## 🔄 持續改進

### 代碼品質
- TypeScript 嚴格模式
- ESLint 規則檢查
- Prettier 格式化
- 測試覆蓋率 > 80%

### 架構演進
- 定期重構
- 效能優化
- 新技術評估
- 使用者反饋整合

---

這個架構設計確保了 v1.3.X 系統的可維護性、可測試性和可擴展性，為未來的功能擴展和技術升級奠定了堅實的基礎。