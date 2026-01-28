/**
 * MigrationService for v1.3.X architecture
 * Handles data migration from v1.2.X to v1.3.X
 * 
 * Key features:
 * - Detects old version data (v1.2.X)
 * - Transforms data structure to new format
 * - Validates migration results
 * - Preserves old data (no deletion)
 * - Provides rollback capability on failure
 */

import { PortfolioData } from '../types/Portfolio';
import { Stock } from '../types/Stock';
import { Account } from '../types/Account';
import { Dividend } from '../types/Dividend';
import { StorageError } from '../types/Errors';

/**
 * Result of migration operation
 */
export interface MigrationResult {
  /** Whether migration was successful */
  success: boolean;
  
  /** Number of stocks migrated (if successful) */
  migratedStocks?: number;
  
  /** Number of accounts migrated (if successful) */
  migratedAccounts?: number;
  
  /** Error message (if failed) */
  error?: string;
}

/**
 * Old v1.2.X data structure
 */
interface V12Data {
  stocks: V12Stock[];
  accounts: string[];
  lastTotalValue?: number;
  lastSync?: string;
}

/**
 * Old v1.2.X stock structure
 */
interface V12Stock {
  stockCode: string;
  stockName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: string;
  account: string;
  dividends?: V12Dividend[];
  [key: string]: any; // Allow other fields
}

/**
 * Old v1.2.X dividend structure
 */
interface V12Dividend {
  date: string;
  amount: number;
  shares?: number;
  [key: string]: any;
}

/**
 * Service class for migrating data from v1.2.X to v1.3.X
 */
export class MigrationService {
  /** Storage key for v1.2.X data */
  private readonly OLD_STORAGE_KEY = 'stockPortfolio_v1.2';
  
  /** Storage key for v1.3.X data */
  private readonly NEW_STORAGE_KEY = 'stockPortfolio_v1.3';
  
  /**
   * Check if old version data exists
   * @returns true if v1.2.X data exists in LocalStorage
   */
  hasOldData(): boolean {
    return localStorage.getItem(this.OLD_STORAGE_KEY) !== null;
  }
  
  /**
   * Check if new version data exists
   * @returns true if v1.3.X data exists in LocalStorage
   */
  hasNewData(): boolean {
    return localStorage.getItem(this.NEW_STORAGE_KEY) !== null;
  }
  
  /**
   * Determine if migration prompt should be shown
   * @returns true if old data exists but new data doesn't
   */
  shouldPromptMigration(): boolean {
    return this.hasOldData() && !this.hasNewData();
  }
  
  /**
   * Execute data migration from v1.2.X to v1.3.X
   * @returns Migration result with success status and details
   */
  migrate(): MigrationResult {
    try {
      // 1. 讀取舊版資料
      const oldData = this.loadOldData();
      if (!oldData) {
        throw new StorageError('無法讀取舊版資料');
      }
      
      // 2. 轉換資料格式
      const newData = this.transformData(oldData);
      
      // 3. 驗證轉換結果
      this.validateNewData(newData);
      
      // 4. 儲存到新版 (不使用 StorageService 以避免循環依賴)
      localStorage.setItem(this.NEW_STORAGE_KEY, JSON.stringify(newData));
      
      // 5. 保留舊版資料（不刪除）- 這是設計要求
      
      console.log('✅ 資料遷移成功', {
        stocks: newData.stocks.length,
        accounts: newData.accounts.length,
        from: this.OLD_STORAGE_KEY,
        to: this.NEW_STORAGE_KEY
      });
      
      return {
        success: true,
        migratedStocks: newData.stocks.length,
        migratedAccounts: newData.accounts.length
      };
    } catch (error: any) {
      console.error('❌ 資料遷移失敗:', error);
      
      // 回滾：如果新版資料已寫入但驗證失敗，則刪除
      try {
        localStorage.removeItem(this.NEW_STORAGE_KEY);
      } catch (rollbackError) {
        console.error('回滾失敗:', rollbackError);
      }
      
      return {
        success: false,
        error: error.message || '未知錯誤'
      };
    }
  }
  
  /**
   * Load old version data from LocalStorage
   * @returns Old data structure or null if not found
   * @private
   */
  private loadOldData(): V12Data | null {
    try {
      const json = localStorage.getItem(this.OLD_STORAGE_KEY);
      if (!json) {
        return null;
      }
      
      const data = JSON.parse(json) as V12Data;
      return data;
    } catch (error: any) {
      throw new StorageError(`解析舊版資料失敗: ${error.message}`);
    }
  }
  
  /**
   * Transform v1.2.X data structure to v1.3.X format
   * @param oldData - Old version data
   * @returns New version data structure
   * @private
   */
  private transformData(oldData: V12Data): PortfolioData {
    const migrationTime = new Date().toISOString();
    
    // 建立帳戶 ID 對照表
    const accountMap = new Map<string, string>();
    const accounts: Account[] = [];
    
    // 轉換帳戶
    if (oldData.accounts && oldData.accounts.length > 0) {
      oldData.accounts.forEach((accountName) => {
        const accountId = this.generateUUID();
        accountMap.set(accountName, accountId);
        
        accounts.push({
          id: accountId,
          name: accountName,
          createdAt: migrationTime
        });
      });
    } else {
      // 如果沒有帳戶，建立預設帳戶
      const defaultAccountId = this.generateUUID();
      accountMap.set('預設帳戶', defaultAccountId);
      accounts.push({
        id: defaultAccountId,
        name: '預設帳戶',
        createdAt: migrationTime
      });
    }
    
    // 轉換股票
    const stocks: Stock[] = [];
    const dividends: Dividend[] = [];
    
    if (oldData.stocks && oldData.stocks.length > 0) {
      oldData.stocks.forEach((oldStock) => {
        // 取得對應的帳戶 ID
        const accountId = accountMap.get(oldStock.account) || accounts[0].id;
        
        // 建立新股票記錄
        const stockId = this.generateUUID();
        const newStock: Stock = {
          id: stockId,
          code: oldStock.stockCode,
          name: oldStock.stockName,
          shares: oldStock.quantity,
          costPrice: oldStock.buyPrice,
          currentPrice: oldStock.currentPrice || oldStock.buyPrice,
          purchaseDate: this.convertDateToISO(oldStock.buyDate),
          accountId: accountId,
          lastUpdated: migrationTime,
          dataSource: 'Local'
        };
        
        stocks.push(newStock);
        
        // 轉換股息記錄（如果有）
        if (oldStock.dividends && Array.isArray(oldStock.dividends)) {
          oldStock.dividends.forEach((oldDividend) => {
            const dividend: Dividend = {
              id: this.generateUUID(),
              stockId: stockId,
              exDividendDate: this.convertDateToISO(oldDividend.date),
              dividendPerShare: oldDividend.amount,
              totalDividend: oldDividend.amount * (oldDividend.shares || oldStock.quantity),
              createdAt: migrationTime
            };
            
            dividends.push(dividend);
          });
        }
      });
    }
    
    // 建立新版資料結構
    const newData: PortfolioData = {
      version: '1.3.0',
      accounts: accounts,
      stocks: stocks,
      dividends: dividends,
      settings: {
        privacyMode: false,
        darkMode: false,
        autoUpdate: true,
        updateInterval: 300000, // 5 分鐘
        cloudSync: {
          enabled: false
        }
      },
      metadata: {
        createdAt: migrationTime,
        lastModified: migrationTime,
        migratedFrom: 'v1.2.X'
      }
    };
    
    return newData;
  }
  
  /**
   * Validate migrated data structure
   * @param data - New version data to validate
   * @throws {StorageError} If validation fails
   * @private
   */
  private validateNewData(data: PortfolioData): void {
    // 驗證必要欄位
    if (!data.version) {
      throw new StorageError('遷移資料缺少版本號');
    }
    
    if (!Array.isArray(data.accounts)) {
      throw new StorageError('遷移資料的帳戶格式不正確');
    }
    
    if (!Array.isArray(data.stocks)) {
      throw new StorageError('遷移資料的股票格式不正確');
    }
    
    if (!Array.isArray(data.dividends)) {
      throw new StorageError('遷移資料的股息格式不正確');
    }
    
    // 驗證每支股票
    data.stocks.forEach((stock, index) => {
      if (!stock.id || !stock.code || !stock.name) {
        throw new StorageError(`股票 ${index + 1} 缺少必要欄位`);
      }
      
      if (typeof stock.shares !== 'number' || stock.shares <= 0) {
        throw new StorageError(`股票 ${stock.code} 的持股數無效`);
      }
      
      if (typeof stock.costPrice !== 'number' || stock.costPrice <= 0) {
        throw new StorageError(`股票 ${stock.code} 的成本價無效`);
      }
      
      // 驗證帳戶 ID 存在
      const accountExists = data.accounts.some(acc => acc.id === stock.accountId);
      if (!accountExists) {
        throw new StorageError(`股票 ${stock.code} 的帳戶 ID 不存在`);
      }
    });
    
    // 驗證每個帳戶
    data.accounts.forEach((account, index) => {
      if (!account.id || !account.name) {
        throw new StorageError(`帳戶 ${index + 1} 缺少必要欄位`);
      }
    });
    
    // 驗證每筆股息
    data.dividends.forEach((dividend, index) => {
      if (!dividend.id || !dividend.stockId) {
        throw new StorageError(`股息記錄 ${index + 1} 缺少必要欄位`);
      }
      
      // 驗證股票 ID 存在
      const stockExists = data.stocks.some(stock => stock.id === dividend.stockId);
      if (!stockExists) {
        throw new StorageError(`股息記錄 ${index + 1} 的股票 ID 不存在`);
      }
    });
    
    console.log('✅ 資料驗證通過');
  }
  
  /**
   * Generate a UUID v4
   * @returns UUID string
   * @private
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Convert date string to ISO 8601 format
   * @param dateStr - Date string in various formats
   * @returns ISO 8601 formatted date string
   * @private
   */
  private convertDateToISO(dateStr: string): string {
    if (!dateStr) {
      return new Date().toISOString();
    }
    
    try {
      // 嘗試解析日期
      const date = new Date(dateStr);
      
      // 檢查是否為有效日期
      if (isNaN(date.getTime())) {
        console.warn(`無效的日期格式: ${dateStr}，使用當前時間`);
        return new Date().toISOString();
      }
      
      return date.toISOString();
    } catch (error) {
      console.warn(`日期轉換失敗: ${dateStr}，使用當前時間`);
      return new Date().toISOString();
    }
  }
}
