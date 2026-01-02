/**
 * 存股紀錄系統 - 核心介面定義
 * 
 * 定義系統中所有主要的資料結構和介面
 */

// 股票記錄介面
export interface StockRecord {
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
  purchaseHistory: PurchaseRecord[];
}

// 股息記錄介面
export interface DividendRecord {
  id: number;
  date: string;
  type: 'cash' | 'stock' | 'both';
  perShare: number;
  shares: number;
  totalAmount: number;
  taxRate: number;
  note?: string;
  stockId: number;
}

// 購買記錄介面
export interface PurchaseRecord {
  date: string;
  shares: number;
  costPrice: number;
  totalCost: number;
}

// 帳戶介面
export interface Account {
  name: string;
  stocks: StockRecord[];
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalDividends: number;
  createdDate: string;
  lastUpdate: string;
}

// 主要投資組合資料結構
export interface PortfolioData {
  stocks: StockRecord[];
  accounts: string[];
  currentAccount: string;
  settings: PortfolioSettings;
  lastUpdate: string;
  version: string;
}

// 系統設定介面
export interface PortfolioSettings {
  darkMode: boolean;
  privacyMode: boolean;
  autoUpdate: boolean;
  updateInterval: number;
  dividendAdjustment: boolean;
  defaultTaxRate: number;
  currency: string;
  language: string;
}

// 匯入匯出設定介面
export interface ImportExportConfig {
  format: 'json' | 'csv' | 'excel';
  scope: 'all' | 'account';
  selectedAccounts?: string[];
  includeSettings: boolean;
  includeDividends: boolean;
  includeHistory: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// 匯出資料介面
export interface ExportData {
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

// 匯入驗證結果介面
export interface ImportValidation {
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

// 衝突記錄介面
export interface ConflictRecord {
  type: 'duplicate_stock' | 'duplicate_account' | 'invalid_data';
  existing: any;
  incoming: any;
  resolution?: 'overwrite' | 'merge' | 'skip' | 'rename';
}

// 衝突解決策略介面
export interface ConflictResolution {
  strategy: 'overwrite' | 'merge' | 'skip' | 'rename';
  applyToAll: boolean;
  conflicts: ConflictRecord[];
}

// 雲端同步設定介面
export interface CloudSyncConfig {
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

// 股息資料庫介面
export interface DividendDatabase {
  [stockCode: string]: {
    year: number;
    quarter?: string;
    cashDividend: number;
    stockDividend: number;
    exDate: string;
  }[];
}

// API回應介面
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: 'TWSE' | 'Yahoo' | 'Investing';
  timestamp: string;
}

// 股價更新結果介面
export interface PriceUpdateResult {
  stockId: number;
  success: boolean;
  oldPrice: number;
  newPrice: number;
  source: 'TWSE' | 'Yahoo' | 'Investing';
  timestamp: string;
  error?: string;
}

// 系統狀態介面
export interface SystemStatus {
  isOnline: boolean;
  lastApiCall: string;
  storageUsage: number;
  syncStatus: 'synced' | 'pending' | 'error' | 'disabled';
  errors: string[];
}