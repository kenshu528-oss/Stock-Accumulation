# 存股紀錄系統設計文件

## 概述

存股紀錄系統是一個基於現代Web技術的單頁應用程式（SPA），採用純前端架構設計，無需後端伺服器即可運行。系統專注於提供簡潔、高效的股票投資組合管理體驗，支援多帳戶管理、即時股價更新、完整股息追蹤和跨裝置資料同步功能。

## 架構設計

### 整體架構

```
┌─────────────────────────────────────────────────────────────┐
│                    使用者介面層 (UI Layer)                    │
├─────────────────────────────────────────────────────────────┤
│                    業務邏輯層 (Business Logic)                │
├─────────────────────────────────────────────────────────────┤
│                    資料存取層 (Data Access)                   │
├─────────────────────────────────────────────────────────────┤
│                    外部服務層 (External Services)             │
└─────────────────────────────────────────────────────────────┘
```

### 技術棧

- **前端框架**: 純 JavaScript (ES6+)
- **樣式**: CSS3 + CSS Grid/Flexbox
- **本地儲存**: localStorage API
- **雲端同步**: 多方案支援（GitHub Gist、Google Drive、Dropbox、自建服務）
- **股價資料**: 台灣證交所 API + Yahoo Finance API + Investing.com API
- **模組化**: ES6 Modules
- **響應式設計**: CSS Media Queries

## 元件與介面設計

### 核心元件架構

```
StockPortfolioSystem
├── StockManager (股票管理)
├── AccountManager (帳戶管理)
├── PriceUpdater (股價更新)
├── DividendCalculator (股息計算)
├── PerformanceAnalyzer (績效分析)
├── UIController (介面控制)
├── DataStorage (資料儲存)
├── ImportExportManager (匯入匯出管理)
├── CloudSync (雲端同步)
│   ├── GitHubGistSync (GitHub Gist同步)
│   ├── GoogleDriveSync (Google Drive同步)
│   ├── DropboxSync (Dropbox同步)
│   └── CustomServerSync (自建伺服器同步)
```

### 主要介面定義

#### StockRecord Interface
```typescript
interface StockRecord {
  id: number;
  code: string;
  name: string;
  shares: number;
  costPrice: number;
  adjustedCostPrice: number;
  currentPrice: number;
  purchaseDate: string;
  account: string;
  dividends: DividendRecord[];
  totalDividends: number;
  lastUpdate: string;
  dataSource: 'TWSE' | 'Yahoo' | 'Investing';
}
```

#### DividendRecord Interface
```typescript
interface DividendRecord {
  date: string;
  type: 'cash' | 'stock' | 'both';
  perShare: number;
  shares: number;
  totalAmount: number;
  taxRate: number;
  note?: string;
}
```

#### Account Interface
```typescript
interface Account {
  name: string;
  stocks: StockRecord[];
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalDividends: number;
}
```

#### ImportExportConfig Interface
```typescript
interface ImportExportConfig {
  format: 'json' | 'csv' | 'excel';
  scope: 'all' | 'account';
  selectedAccounts?: string[];
  includeSettings: boolean;
  includeDividends: boolean;
  includeHistory: boolean;
}
```

#### ExportData Interface
```typescript
interface ExportData {
  metadata: {
    exportDate: string;
    version: string;
    scope: string;
    accounts: string[];
  };
  stocks: StockRecord[];
  accounts: string[];
  settings?: PortfolioSettings;
  dividends?: DividendRecord[];
}
```

## 資料模型

### 資料結構設計

#### 主要資料模型
```typescript
interface PortfolioData {
  stocks: StockRecord[];
  accounts: string[];
  currentAccount: string;
  settings: {
    darkMode: boolean;
    privacyMode: boolean;
    autoUpdate: boolean;
    updateInterval: number;
    dividendAdjustment: boolean;
  };
  lastUpdate: string;
  version: string;
}
```

#### 雲端同步設定模型
```typescript
interface CloudSyncConfig {
  provider: 'github' | 'googledrive' | 'dropbox' | 'custom';
  enabled: boolean;
  credentials: {
    github?: {
      token: string;
      gistId?: string;
    };
    googledrive?: {
      apiKey: string;
      clientId: string;
      fileId?: string;
    };
    dropbox?: {
      accessToken: string;
      filePath?: string;
    };
    custom?: {
      endpoint: string;
      apiKey: string;
      headers?: Record<string, string>;
    };
  };
  syncInterval: number;
  lastSync: string;
  conflictResolution: 'local' | 'remote' | 'manual';
}
#### 股息資料庫模型
```typescript
interface DividendDatabase {
  [stockCode: string]: {
    year: number;
    quarter?: string;
    cashDividend: number;
    stockDividend: number;
    exDate: string;
  }[];
}
```

## 雲端同步方案比較

### 方案一：GitHub Gist（目前實作）
**優點：**
- 免費且穩定
- 版本控制功能
- 開發者友善
- 無檔案大小限制（合理範圍內）

**缺點：**
- 需要GitHub帳號
- 需要產生Personal Access Token
- 對一般使用者較複雜

**適用場景：** 技術使用者、開發者

### 方案二：Google Drive API
**優點：**
- 大多數使用者都有Google帳號
- 15GB免費儲存空間
- 官方API支援
- 檔案管理介面友善

**缺點：**
- 需要OAuth認證流程
- API配額限制
- 需要Google Cloud Console設定

**適用場景：** 一般使用者、Google生態系使用者

### 方案三：Dropbox API
**優點：**
- 簡單的API介面
- 良好的檔案同步機制
- 跨平台支援

**缺點：**
- 免費空間較小（2GB）
- 需要Dropbox帳號
- API使用需要應用程式註冊

**適用場景：** Dropbox使用者

### 方案四：自建伺服器
**優點：**
- 完全控制資料
- 可自訂功能
- 無第三方依賴

**缺點：**
- 需要技術能力維護
- 伺服器成本
- 安全性需自行處理

**適用場景：** 企業用戶、技術團隊

### 方案五：瀏覽器檔案系統（File System Access API）
**優點：**
- 無需網路連線
- 使用者完全控制檔案位置
- 無第三方服務依賴

**缺點：**
- 瀏覽器支援有限
- 無自動同步
- 需手動管理備份

**適用場景：** 隱私敏感使用者、離線使用

### 推薦實作順序
1. **GitHub Gist**（已實作）- 技術使用者
2. **瀏覽器檔案系統** - 簡單備份方案
3. **Google Drive** - 一般使用者主要方案
4. **Dropbox** - 補充方案
5. **自建伺服器** - 企業方案

## 匯入匯出功能設計

### 支援格式

#### JSON格式
- **優點**: 完整保留資料結構、支援複雜資料類型、易於程式處理
- **用途**: 完整備份、系統間資料轉移
- **結構**: 包含完整的metadata、stocks、accounts、settings等資訊

#### CSV格式
- **優點**: 通用性高、可用Excel開啟、檔案小
- **用途**: 資料分析、報表製作、簡單備份
- **限制**: 僅包含股票基本資料，不含設定和複雜結構

#### Excel格式
- **優點**: 格式化顯示、支援多工作表、易於閱讀
- **用途**: 報表輸出、資料展示、分析工具
- **結構**: 多工作表設計（股票清單、帳戶統計、股息記錄等）

### 匯出功能設計

#### 匯出範圍選擇
```typescript
interface ExportOptions {
  scope: 'all' | 'selected_accounts';
  accounts: string[];
  includeData: {
    stocks: boolean;
    dividends: boolean;
    settings: boolean;
    history: boolean;
  };
  format: 'json' | 'csv' | 'excel';
  dateRange?: {
    start: string;
    end: string;
  };
}
```

#### 匯出流程
1. **選擇範圍**: 全部帳戶或指定帳戶
2. **選擇格式**: JSON/CSV/Excel
3. **選擇內容**: 股票資料、股息記錄、系統設定等
4. **資料處理**: 根據選擇過濾和格式化資料
5. **檔案生成**: 產生對應格式的檔案
6. **下載觸發**: 自動觸發瀏覽器下載

### 匯入功能設計

#### 匯入驗證流程
```typescript
interface ImportValidation {
  fileFormat: 'json' | 'csv' | 'excel';
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview: {
    totalRecords: number;
    accounts: string[];
    stocks: StockRecord[];
    conflicts: ConflictRecord[];
  };
}
```

#### 衝突處理策略
```typescript
interface ConflictResolution {
  strategy: 'overwrite' | 'merge' | 'skip' | 'rename';
  applyToAll: boolean;
  conflicts: {
    type: 'duplicate_stock' | 'duplicate_account' | 'invalid_data';
    existing: any;
    incoming: any;
    resolution: 'overwrite' | 'merge' | 'skip' | 'rename';
  }[];
}
```

#### 匯入流程
1. **檔案選擇**: 支援拖拽或點擊選擇
2. **格式檢測**: 自動識別檔案格式
3. **資料驗證**: 檢查資料完整性和格式正確性
4. **衝突檢測**: 識別與現有資料的衝突
5. **預覽顯示**: 顯示匯入預覽和衝突清單
6. **衝突解決**: 使用者選擇處理策略
7. **資料匯入**: 執行實際的資料匯入
8. **結果回報**: 顯示匯入成功/失敗的統計

### 匯入匯出資料流

```
匯出: 使用者選擇 → 資料過濾 → 格式轉換 → 檔案生成 → 下載
匯入: 檔案選擇 → 格式檢測 → 資料驗證 → 衝突處理 → 資料合併 → 儲存更新
```

### 資料流設計

```
使用者操作 → UI事件 → 業務邏輯處理 → 資料更新 → 本地儲存 → 雲端同步
                                    ↓
                              UI狀態更新 ← 資料變更通知
```

## 正確性屬性

*屬性是一個特徵或行為，應該在系統的所有有效執行中保持為真——本質上是關於系統應該做什麼的正式陳述。屬性作為人類可讀規格和機器可驗證正確性保證之間的橋樑。*

基於需求分析，以下是系統的核心正確性屬性：

### 屬性 1: 股票記錄完整性
*對於任何*有效的股票資料輸入，新增股票後系統應該包含具有所有必要欄位的完整股票記錄
**驗證需求: 1.1**

### 屬性 2: 股票代碼查詢一致性
*對於任何*4位數以上的有效股票代碼，自動查詢功能應該回傳一致的股票名稱或明確的未找到狀態
**驗證需求: 1.2**

### 屬性 3: 股票刪除完整性
*對於任何*存在的股票記錄，刪除操作後該記錄應該從系統中完全移除且不影響其他記錄
**驗證需求: 1.3**

### 屬性 4: 重複股票處理一致性
*對於任何*已存在於同一帳戶的股票代碼，新增時系統應該正確識別重複並提供處理選項
**驗證需求: 1.5**

### 屬性 5: 帳戶管理完整性
*對於任何*新帳戶名稱，新增後該帳戶應該出現在帳戶清單中並可正常使用
**驗證需求: 2.2**

### 屬性 6: 帳戶刪除安全性
*對於任何*包含股票記錄的帳戶，刪除操作應該正確檢測並警告資料遺失風險
**驗證需求: 2.3**

### 屬性 7: 帳戶重新命名一致性
*對於任何*帳戶重新命名操作，所有相關股票記錄的帳戶歸屬應該同步更新
**驗證需求: 2.4**

### 屬性 8: 帳戶切換過濾正確性
*對於任何*帳戶切換操作，顯示的股票清單應該僅包含該帳戶的股票記錄
**驗證需求: 2.5**

### 屬性 9: API優先順序一致性
*對於任何*股價更新請求，系統應該優先嘗試台灣證交所API
**驗證需求: 3.1**

### 屬性 10: API備援機制可靠性
*對於任何*主要API失敗的情況，系統應該按順序嘗試備用API來源
**驗證需求: 3.2**

### 屬性 11: 股價更新完整性
*對於任何*成功的API回應，股票記錄應該正確更新現價、資料來源和時間戳記
**驗證需求: 3.3**

### 屬性 12: 批量股價更新一致性
*對於任何*全域更新操作，所有股票應該嘗試進行價格更新
**驗證需求: 3.4**

### 屬性 13: API切換邏輯正確性
*對於任何*非交易時間或API維護情況，系統應該正確切換到備用API
**驗證需求: 3.5**

### 屬性 14: 歷史股息計算準確性
*對於任何*股票和購買日期，系統應該僅計算購買日期之後的股息記錄
**驗證需求: 4.1, 4.2**

### 屬性 15: 股息調整成本價正確性
*對於任何*啟用股息調整的股票，調整成本價應該等於原始成本價減去每股累計股息
**驗證需求: 4.4**

### 屬性 16: 股息統計計算準確性
*對於任何*股息記錄集合，總股息收入和年度股息統計應該正確計算
**驗證需求: 4.5**

### 屬性 17: 績效計算準確性
*對於任何*股票記錄，市值和損益計算應該使用正確的成本價基準（調整後或原始）
**驗證需求: 5.1, 5.2**

### 屬性 18: 總報酬計算完整性
*對於任何*股票，總報酬應該正確合併資本利得和股息收入
**驗證需求: 5.3**

### 屬性 19: 帳戶統計即時性
*對於任何*帳戶切換或資料變更，相關統計資料應該立即重新計算
**驗證需求: 5.4, 5.5**

### 屬性 20: 隱私模式切換一致性
*對於任何*隱私模式切換操作，金額顯示應該在原始值和星號遮罩間正確切換
**驗證需求: 6.2, 6.3**

### 屬性 21: 響應式佈局斷點正確性
*對於任何*螢幕寬度變化，當寬度小於768px時系統應該切換到行動版佈局
**驗證需求: 7.5**

### 屬性 22: 資料自動儲存一致性
*對於任何*資料變更操作，系統應該自動將更新後的資料儲存到本地儲存
**驗證需求: 8.1**

### 屬性 23: 雲端同步啟用正確性
*對於任何*有效的雲端同步設定（GitHub Token、Google Drive認證等），系統應該成功啟用對應的雲端同步功能
**驗證需求: 8.2**

### 屬性 24: 雲端同步自動化
*對於任何*啟用雲端同步後的資料變更，系統應該自動上傳到雲端
**驗證需求: 8.3**

### 屬性 25: 資料衝突處理完整性
*對於任何*本地與雲端資料衝突情況，系統應該提供明確的解決選項
**驗證需求: 8.5**

### 屬性 26: API錯誤處理穩定性
*對於任何*API請求失敗，系統應該嘗試備援方案並保持系統穩定運行
**驗證需求: 9.1**

### 屬性 27: 輸入驗證完整性
*對於任何*無效的使用者輸入，系統應該阻止提交並顯示具體錯誤訊息
**驗證需求: 9.2**

### 屬性 28: 錯誤恢復能力
*對於任何*系統錯誤，系統應該記錄錯誤並嘗試恢復正常運作
**驗證需求: 9.3**

### 屬性 29: 儲存空間監控準確性
*對於任何*本地儲存空間不足情況，系統應該正確檢測並警告使用者
**驗證需求: 9.4**

### 屬性 30: 網路狀態處理正確性
*對於任何*網路連線狀態變化，系統應該正確檢測並相應調整行為
**驗證需求: 9.5**

### 屬性 31: 批次API請求最佳化
*對於任何*股價更新操作，系統應該使用批次請求以減少API呼叫次數
**驗證需求: 10.2**

### 屬性 32: 大量資料處理效能
*對於任何*大量股票資料，系統應該使用適當的最佳化技術維持介面流暢度
**驗證需求: 10.4**

### 屬性 33: 閒置資源管理
*對於任何*長時間無操作狀態，系統應該暫停非必要的資源消耗操作
**驗證需求: 10.5**

### 屬性 34: 鍵盤導航支援
*對於任何*鍵盤操作事件，系統應該正確處理ESC和Tab鍵的導航功能
**驗證需求: 11.5**

### 屬性 35: 匯出範圍選擇正確性
*對於任何*匯出範圍選擇（全部或指定帳戶），系統應該僅匯出選定範圍內的資料
**驗證需求: 13.1, 13.2**

### 屬性 36: 匯出格式一致性
*對於任何*選擇的匯出格式（JSON、CSV、Excel），系統應該產生符合該格式規範的有效檔案
**驗證需求: 13.3**

### 屬性 37: 匯入資料驗證完整性
*對於任何*匯入的資料檔案，系統應該正確驗證格式並提供詳細的預覽資訊
**驗證需求: 13.4**

### 屬性 38: 匯入衝突處理一致性
*對於任何*匯入資料衝突情況，系統應該提供明確的處理選項並正確執行使用者選擇
**驗證需求: 13.5**

## 錯誤處理策略

### API錯誤處理
- **連線超時**: 15秒超時，自動重試3次
- **API限制**: 實作指數退避重試機制
- **資料格式錯誤**: 記錄錯誤並使用預設值
- **備援切換**: 主要API失敗時自動切換備用來源

### 資料驗證錯誤
- **輸入格式驗證**: 即時驗證並顯示具體錯誤訊息
- **資料完整性檢查**: 儲存前驗證必要欄位
- **類型安全**: 使用TypeScript類型檢查防止類型錯誤

### 儲存錯誤處理
- **本地儲存滿載**: 警告使用者並建議清理或雲端同步
- **雲端同步失敗**: 保留本地資料並標記同步狀態
- **資料損壞**: 嘗試修復或回復到上一個有效狀態

## 測試策略

### 雙重測試方法

系統將採用單元測試和屬性測試的雙重方法來確保全面的測試覆蓋：

#### 單元測試
單元測試專注於驗證特定範例、邊界條件和錯誤情況：
- 特定股票代碼的查詢功能測試
- 已知股息資料的計算驗證
- 邊界值測試（如零股數、負價格）
- 錯誤條件測試（如API失敗、網路中斷）

#### 屬性測試
屬性測試驗證應該在所有輸入中保持的通用屬性：
- 使用 **fast-check** 作為JavaScript屬性測試庫
- 每個屬性測試配置為運行最少100次迭代
- 每個屬性測試都標記對應的設計文件屬性編號

**屬性測試標記格式**: `**Feature: stock-portfolio-system, Property {number}: {property_text}**`

#### 測試覆蓋範圍
- **功能邏輯**: 股票管理、帳戶操作、股息計算、績效分析、匯入匯出
- **資料完整性**: 儲存、同步、備份、恢復、格式轉換
- **錯誤處理**: API失敗、網路問題、輸入驗證、檔案格式錯誤
- **效能要求**: 大量資料處理、響應時間、資源使用、檔案處理效能

### 測試環境設定
- **測試框架**: Jest + fast-check
- **模擬服務**: Mock API回應和localStorage
- **測試資料**: 生成隨機但有效的股票和帳戶資料
- **CI/CD**: 自動化測試在每次程式碼變更時執行