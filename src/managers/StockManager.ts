/**
 * 股票管理器
 * 
 * 負責股票的新增、編輯、刪除和查詢功能
 */

import { StockRecord, DividendRecord, PurchaseRecord } from '../types/interfaces.js';
import { validateStockRecord, normalizeStockCode } from '../utils/validation.js';

export interface StockQueryResult {
  code: string;
  name: string;
  found: boolean;
}

export interface AddStockOptions {
  code: string;
  name: string;
  shares: number;
  costPrice: number;
  purchaseDate: string;
  account: string;
}

export interface MergeStockOptions {
  strategy: 'merge' | 'separate';
  newRecord?: StockRecord;
}

export class StockManager {
  private stockDatabase: Map<string, string> = new Map();

  constructor() {
    this.initializeStockDatabase();
  }

  /**
   * 初始化股票代碼資料庫
   */
  private initializeStockDatabase(): void {
    // 台股熱門股票資料庫
    const stockData = [
      ['2330', '台積電'],
      ['2317', '鴻海'],
      ['2454', '聯發科'],
      ['2412', '中華電'],
      ['2882', '國泰金'],
      ['2308', '台達電'],
      ['2303', '聯電'],
      ['1303', '南亞'],
      ['1301', '台塑'],
      ['2002', '中鋼'],
      ['0050', '元大台灣50'],
      ['0056', '元大高股息'],
      ['00878', '國泰永續高股息'],
      ['00881', '國泰台灣5G+'],
      ['00692', '富邦公司治理'],
      ['006208', '富邦台50'],
      ['00757', '統一FANG+'],
      ['00830', '國泰費城半導體'],
      ['00631L', '元大台灣50正2'],
      ['00632R', '元大台灣50反1']
    ];

    stockData.forEach(([code, name]) => {
      this.stockDatabase.set(code, name);
    });
  }

  /**
   * 查詢股票代碼對應的名稱
   */
  queryStockName(code: string): StockQueryResult {
    const normalizedCode = normalizeStockCode(code);
    
    if (!normalizedCode) {
      return { code, name: '', found: false };
    }

    const name = this.stockDatabase.get(normalizedCode);
    
    return {
      code: normalizedCode,
      name: name || '',
      found: !!name
    };
  }

  /**
   * 新增股票到資料庫
   */
  addStockToDatabase(code: string, name: string): void {
    const normalizedCode = normalizeStockCode(code);
    if (normalizedCode && name.trim()) {
      this.stockDatabase.set(normalizedCode, name.trim());
    }
  }

  /**
   * 建立新的股票記錄
   */
  createStockRecord(options: AddStockOptions): StockRecord {
    const now = new Date().toISOString();
    const normalizedCode = normalizeStockCode(options.code);
    
    // 如果資料庫中沒有這個股票，自動添加
    if (!this.stockDatabase.has(normalizedCode)) {
      this.addStockToDatabase(normalizedCode, options.name);
    }

    const purchaseRecord: PurchaseRecord = {
      date: options.purchaseDate,
      shares: options.shares,
      costPrice: options.costPrice,
      totalCost: options.shares * options.costPrice
    };

    const stockRecord: StockRecord = {
      id: Date.now() + Math.random(), // 簡單的 ID 生成
      code: normalizedCode,
      name: options.name.trim(),
      shares: options.shares,
      costPrice: options.costPrice,
      adjustedCostPrice: options.costPrice, // 初始時等於成本價
      currentPrice: options.costPrice, // 初始時使用成本價
      purchaseDate: options.purchaseDate,
      account: options.account,
      dividends: [],
      totalDividends: 0,
      lastUpdate: now,
      dataSource: 'TWSE',
      purchaseHistory: [purchaseRecord]
    };

    return stockRecord;
  }

  /**
   * 驗證股票記錄
   */
  validateStock(stock: Partial<StockRecord>): { isValid: boolean; errors: string[] } {
    const validation = validateStockRecord(stock);
    return {
      isValid: validation.isValid,
      errors: validation.errors
    };
  }

  /**
   * 檢查重複股票
   */
  checkDuplicateStock(
    stocks: StockRecord[], 
    code: string, 
    account: string
  ): StockRecord | null {
    const normalizedCode = normalizeStockCode(code);
    return stocks.find(stock => 
      stock.code === normalizedCode && stock.account === account
    ) || null;
  }

  /**
   * 合併股票記錄
   */
  mergeStockRecords(existingStock: StockRecord, newOptions: AddStockOptions): StockRecord {
    const totalShares = existingStock.shares + newOptions.shares;
    const totalCost = (existingStock.shares * existingStock.costPrice) + 
                     (newOptions.shares * newOptions.costPrice);
    const averageCostPrice = totalCost / totalShares;

    // 新增購買記錄
    const newPurchaseRecord: PurchaseRecord = {
      date: newOptions.purchaseDate,
      shares: newOptions.shares,
      costPrice: newOptions.costPrice,
      totalCost: newOptions.shares * newOptions.costPrice
    };

    const mergedStock: StockRecord = {
      ...existingStock,
      shares: totalShares,
      costPrice: averageCostPrice,
      adjustedCostPrice: averageCostPrice, // 重新計算調整成本價
      lastUpdate: new Date().toISOString(),
      purchaseHistory: [...existingStock.purchaseHistory, newPurchaseRecord]
    };

    return mergedStock;
  }

  /**
   * 編輯股票記錄
   */
  editStockRecord(
    stock: StockRecord, 
    updates: Partial<Pick<StockRecord, 'shares' | 'costPrice' | 'name'>>
  ): StockRecord {
    const updatedStock: StockRecord = {
      ...stock,
      ...updates,
      lastUpdate: new Date().toISOString()
    };

    // 如果成本價改變，重新計算調整成本價
    if (updates.costPrice !== undefined) {
      updatedStock.adjustedCostPrice = this.recalculateAdjustedCostPrice(
        updatedStock.costPrice,
        updatedStock.totalDividends,
        updatedStock.shares
      );
    }

    return updatedStock;
  }

  /**
   * 重新計算調整成本價
   */
  private recalculateAdjustedCostPrice(
    originalCostPrice: number, 
    totalDividends: number, 
    shares: number
  ): number {
    const dividendPerShare = shares > 0 ? totalDividends / shares : 0;
    return Math.max(0.01, originalCostPrice - dividendPerShare);
  }

  /**
   * 刪除股票記錄（返回過濾後的陣列）
   */
  deleteStockRecord(stocks: StockRecord[], stockId: number): StockRecord[] {
    return stocks.filter(stock => stock.id !== stockId);
  }

  /**
   * 根據帳戶過濾股票
   */
  filterStocksByAccount(stocks: StockRecord[], account: string): StockRecord[] {
    if (account === 'all' || account === '全部') {
      return stocks;
    }
    return stocks.filter(stock => stock.account === account);
  }

  /**
   * 搜尋股票
   */
  searchStocks(
    stocks: StockRecord[], 
    query: string
  ): StockRecord[] {
    if (!query.trim()) {
      return stocks;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return stocks.filter(stock => 
      stock.code.toLowerCase().includes(searchTerm) ||
      stock.name.toLowerCase().includes(searchTerm) ||
      stock.account.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * 排序股票
   */
  sortStocks(
    stocks: StockRecord[], 
    sortBy: 'code' | 'name' | 'value' | 'profit' | 'date',
    order: 'asc' | 'desc' = 'asc'
  ): StockRecord[] {
    const sorted = [...stocks].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          const aValue = a.shares * a.currentPrice;
          const bValue = b.shares * b.currentPrice;
          comparison = aValue - bValue;
          break;
        case 'profit':
          const aProfit = (a.shares * a.currentPrice) - (a.shares * a.adjustedCostPrice);
          const bProfit = (b.shares * b.currentPrice) - (b.shares * b.adjustedCostPrice);
          comparison = aProfit - bProfit;
          break;
        case 'date':
          comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * 計算股票統計資訊
   */
  calculateStockStats(stock: StockRecord): {
    marketValue: number;
    totalCost: number;
    profit: number;
    profitRate: number;
    totalReturn: number;
    totalReturnRate: number;
  } {
    const marketValue = stock.shares * stock.currentPrice;
    const totalCost = stock.shares * stock.adjustedCostPrice;
    const profit = marketValue - totalCost;
    const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    
    const totalReturn = profit + stock.totalDividends;
    const totalReturnRate = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    return {
      marketValue,
      totalCost,
      profit,
      profitRate,
      totalReturn,
      totalReturnRate
    };
  }

  /**
   * 獲取股票資料庫大小
   */
  getDatabaseSize(): number {
    return this.stockDatabase.size;
  }

  /**
   * 獲取所有股票代碼
   */
  getAllStockCodes(): string[] {
    return Array.from(this.stockDatabase.keys());
  }
}