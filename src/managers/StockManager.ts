/**
 * StockManager - 股票管理器
 * 
 * 負責管理所有股票相關的業務邏輯：
 * - 股票的 CRUD 操作（新增、讀取、更新、刪除）
 * - 股價更新（單一股票和批次更新）
 * - 股票查詢和篩選
 * 
 * 依賴注入：
 * - StockApiService: 用於取得股價資料
 * - StorageService: 用於持久化儲存
 */

import { Stock } from '../types/Stock';
import { PortfolioData } from '../types/Portfolio';
import { StockApiService } from '../services/StockApiService';
import { StorageService } from '../services/StorageService';
import { ValidationError, StockError } from '../types/Errors';

/**
 * 股票管理器類別
 * 封裝所有股票相關的業務邏輯
 */
export class StockManager {
  /** 股票資料儲存 - 使用 Map 結構以股票 ID 為鍵值 */
  private stocks: Map<string, Stock> = new Map();
  
  /**
   * 建構函數 - 使用依賴注入模式
   * @param apiService - 股價 API 服務實例
   * @param storageService - 儲存服務實例
   */
  constructor(
    private apiService: StockApiService,
    private storageService: StorageService
  ) {
    // 初始化時從儲存載入現有資料
    this.loadFromStorage();
  }
  
  /**
   * 從儲存服務載入股票資料
   * 在初始化時自動呼叫
   * @private
   */
  private loadFromStorage(): void {
    try {
      const data = this.storageService.load();
      
      if (data && data.stocks) {
        // 將股票陣列轉換為 Map 結構
        for (const stock of data.stocks) {
          this.stocks.set(stock.id, stock);
        }
        
        console.log(`已載入 ${this.stocks.size} 筆股票資料`);
      } else {
        console.log('無現有股票資料，從空白狀態開始');
      }
    } catch (error) {
      console.error('載入股票資料失敗:', error);
      // 載入失敗時從空白狀態開始
      this.stocks.clear();
    }
  }
  
  /**
   * 儲存股票資料到儲存服務
   * 在每次修改後自動呼叫
   * @private
   */
  private saveToStorage(): void {
    try {
      // 載入完整的投資組合資料
      const data = this.storageService.load() || this.createEmptyPortfolioData();
      
      // 更新股票陣列
      data.stocks = Array.from(this.stocks.values());
      
      // 儲存回儲存服務
      this.storageService.save(data);
      
      console.log(`已儲存 ${this.stocks.size} 筆股票資料`);
    } catch (error) {
      console.error('儲存股票資料失敗:', error);
      throw new StockError('儲存股票資料失敗', 'STORAGE_ERROR');
    }
  }
  
  /**
   * 建立空的投資組合資料結構
   * 用於初始化或重置
   * @private
   * @returns 空的投資組合資料
   */
  private createEmptyPortfolioData(): PortfolioData {
    return {
      version: '1.3.0',
      accounts: [],
      stocks: [],
      dividends: [],
      settings: {
        privacyMode: false,
        darkMode: false,
        autoUpdate: false,
        updateInterval: 300000, // 5 分鐘
        cloudSync: {
          enabled: false
        }
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }
  
  /**
   * 產生唯一的股票 ID
   * 使用時間戳記和隨機數組合
   * @private
   * @returns 唯一的股票 ID
   */
  private generateStockId(): string {
    return `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 新增股票
   * 驗證輸入資料、查詢股票資訊（如果需要）、建立股票記錄
   * 
   * @param stockData - 股票資料（不含 id 和 lastUpdated）
   * @returns 新建立的股票記錄
   * @throws {ValidationError} 當輸入資料驗證失敗時
   * @throws {StockError} 當新增股票失敗時
   */
  async addStock(stockData: Omit<Stock, 'id' | 'lastUpdated'>): Promise<Stock> {
    // 驗證股票代碼
    const { validateStockCode, validateAmount, validateShares, validateDate } = await import('../utils/validators');
    
    const codeValidation = validateStockCode(stockData.code);
    if (!codeValidation.valid) {
      throw new ValidationError(codeValidation.error || '股票代碼格式錯誤', 'code');
    }
    
    // 驗證持股數
    const sharesValidation = validateShares(stockData.shares);
    if (!sharesValidation.valid) {
      throw new ValidationError(sharesValidation.error || '持股數格式錯誤', 'shares');
    }
    
    // 驗證成本價
    const costPriceValidation = validateAmount(stockData.costPrice);
    if (!costPriceValidation.valid) {
      throw new ValidationError(costPriceValidation.error || '成本價格式錯誤', 'costPrice');
    }
    
    // 驗證現價
    const currentPriceValidation = validateAmount(stockData.currentPrice, true);
    if (!currentPriceValidation.valid) {
      throw new ValidationError(currentPriceValidation.error || '現價格式錯誤', 'currentPrice');
    }
    
    // 驗證購買日期
    const dateValidation = validateDate(stockData.purchaseDate, { allowFuture: false });
    if (!dateValidation.valid) {
      throw new ValidationError(dateValidation.error || '購買日期格式錯誤', 'purchaseDate');
    }
    
    // 如果沒有提供股票名稱，嘗試從 API 查詢
    let stockName = stockData.name;
    let dataSource = stockData.dataSource;
    
    if (!stockName || stockName.trim() === '' || stockName === stockData.code) {
      try {
        console.log(`查詢股票名稱: ${stockData.code}`);
        const stockInfo = await this.apiService.searchStockByCode(stockData.code);
        stockName = stockInfo.name;
        dataSource = stockInfo.source;
        console.log(`✅ 找到股票名稱: ${stockName}`);
      } catch (error) {
        console.warn(`無法查詢股票名稱，使用股票代碼: ${error instanceof Error ? error.message : String(error)}`);
        stockName = stockData.code;
      }
    }
    
    // 建立新股票記錄
    const newStock: Stock = {
      id: this.generateStockId(),
      code: stockData.code.trim().toUpperCase(),
      name: stockName,
      shares: stockData.shares,
      costPrice: stockData.costPrice,
      currentPrice: stockData.currentPrice,
      purchaseDate: new Date(stockData.purchaseDate).toISOString(),
      accountId: stockData.accountId,
      lastUpdated: new Date().toISOString(),
      dataSource: dataSource
    };
    
    // 儲存到 Map
    this.stocks.set(newStock.id, newStock);
    
    // 持久化儲存
    this.saveToStorage();
    
    console.log(`✅ 新增股票成功: ${newStock.code} - ${newStock.name}`);
    
    return newStock;
  }
  
  /**
   * 更新股票資訊
   * 可以更新股票的任何欄位（除了 id）
   * 
   * @param stockId - 股票 ID
   * @param updates - 要更新的欄位
   * @returns 更新後的股票記錄
   * @throws {StockError} 當股票不存在或更新失敗時
   * @throws {ValidationError} 當更新資料驗證失敗時
   */
  async updateStock(stockId: string, updates: Partial<Omit<Stock, 'id'>>): Promise<Stock> {
    // 檢查股票是否存在
    const stock = this.stocks.get(stockId);
    if (!stock) {
      throw new StockError(`股票不存在: ${stockId}`, 'STOCK_NOT_FOUND');
    }
    
    // 驗證更新資料
    const { validateStockCode, validateAmount, validateShares, validateDate } = await import('../utils/validators');
    
    if (updates.code !== undefined) {
      const codeValidation = validateStockCode(updates.code);
      if (!codeValidation.valid) {
        throw new ValidationError(codeValidation.error || '股票代碼格式錯誤', 'code');
      }
    }
    
    if (updates.shares !== undefined) {
      const sharesValidation = validateShares(updates.shares);
      if (!sharesValidation.valid) {
        throw new ValidationError(sharesValidation.error || '持股數格式錯誤', 'shares');
      }
    }
    
    if (updates.costPrice !== undefined) {
      const costPriceValidation = validateAmount(updates.costPrice);
      if (!costPriceValidation.valid) {
        throw new ValidationError(costPriceValidation.error || '成本價格式錯誤', 'costPrice');
      }
    }
    
    if (updates.currentPrice !== undefined) {
      const currentPriceValidation = validateAmount(updates.currentPrice, true);
      if (!currentPriceValidation.valid) {
        throw new ValidationError(currentPriceValidation.error || '現價格式錯誤', 'currentPrice');
      }
    }
    
    if (updates.purchaseDate !== undefined) {
      const dateValidation = validateDate(updates.purchaseDate, { allowFuture: false });
      if (!dateValidation.valid) {
        throw new ValidationError(dateValidation.error || '購買日期格式錯誤', 'purchaseDate');
      }
    }
    
    // 更新股票記錄
    const updatedStock: Stock = {
      ...stock,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    // 儲存到 Map
    this.stocks.set(stockId, updatedStock);
    
    // 持久化儲存
    this.saveToStorage();
    
    console.log(`✅ 更新股票成功: ${updatedStock.code} - ${updatedStock.name}`);
    
    return updatedStock;
  }
  
  /**
   * 刪除股票
   * 從系統中完全移除股票記錄
   * 
   * @param stockId - 股票 ID
   * @throws {StockError} 當股票不存在時
   */
  deleteStock(stockId: string): void {
    // 檢查股票是否存在
    const stock = this.stocks.get(stockId);
    if (!stock) {
      throw new StockError(`股票不存在: ${stockId}`, 'STOCK_NOT_FOUND');
    }
    
    // 從 Map 中刪除
    this.stocks.delete(stockId);
    
    // 持久化儲存
    this.saveToStorage();
    
    console.log(`✅ 刪除股票成功: ${stock.code} - ${stock.name}`);
  }
  
  /**
   * 取得單一股票
   * 根據股票 ID 查詢股票記錄
   * 
   * @param stockId - 股票 ID
   * @returns 股票記錄，如果不存在則返回 null
   */
  getStock(stockId: string): Stock | null {
    return this.stocks.get(stockId) || null;
  }
  
  /**
   * 取得所有股票
   * 返回系統中所有的股票記錄
   * 
   * @returns 所有股票記錄的陣列
   */
  getAllStocks(): Stock[] {
    return Array.from(this.stocks.values());
  }
  
  /**
   * 取得指定帳戶的股票
   * 根據帳戶 ID 篩選股票記錄
   * 
   * @param accountId - 帳戶 ID
   * @returns 該帳戶的所有股票記錄
   */
  getStocksByAccount(accountId: string): Stock[] {
    return Array.from(this.stocks.values()).filter(
      stock => stock.accountId === accountId
    );
  }
  
  /**
   * 更新單一股票股價
   * 從 API 取得最新股價並更新股票記錄
   * 
   * @param stockId - 股票 ID
   * @returns 更新後的股票記錄
   * @throws {StockError} 當股票不存在或更新失敗時
   */
  async updateStockPrice(stockId: string): Promise<Stock> {
    // 檢查股票是否存在
    const stock = this.stocks.get(stockId);
    if (!stock) {
      throw new StockError(`股票不存在: ${stockId}`, 'STOCK_NOT_FOUND');
    }
    
    try {
      console.log(`更新股價: ${stock.code} - ${stock.name}`);
      
      // 從 API 取得最新股價
      const priceResult = await this.apiService.getStockPrice(stock.code);
      
      // 更新股票記錄
      const updatedStock: Stock = {
        ...stock,
        currentPrice: priceResult.price,
        dataSource: priceResult.source,
        lastUpdated: new Date().toISOString()
      };
      
      // 儲存到 Map
      this.stocks.set(stockId, updatedStock);
      
      // 持久化儲存
      this.saveToStorage();
      
      console.log(`✅ 股價更新成功: ${stock.code} = ${priceResult.price} (來源: ${priceResult.source})`);
      
      return updatedStock;
    } catch (error) {
      console.error(`❌ 股價更新失敗: ${stock.code}`, error);
      throw new StockError(
        `更新股價失敗: ${error instanceof Error ? error.message : String(error)}`,
        'PRICE_UPDATE_FAILED'
      );
    }
  }
  
  /**
   * 批次更新所有股價
   * 使用 Promise.allSettled 處理部分失敗的情況
   * 即使部分股票更新失敗，其他股票仍會繼續更新
   * 
   * @returns 更新結果摘要
   */
  async updateAllPrices(): Promise<{
    total: number;
    success: number;
    failed: number;
    results: Array<{
      stockId: string;
      code: string;
      name: string;
      success: boolean;
      price?: number;
      error?: string;
    }>;
  }> {
    const allStocks = Array.from(this.stocks.values());
    const total = allStocks.length;
    
    console.log(`開始批次更新 ${total} 支股票的股價...`);
    
    // 使用 Promise.allSettled 處理所有更新請求
    // 這樣即使部分失敗，其他股票仍會繼續更新
    const results = await Promise.allSettled(
      allStocks.map(stock => this.updateStockPrice(stock.id))
    );
    
    // 統計結果
    let success = 0;
    let failed = 0;
    const detailedResults: Array<{
      stockId: string;
      code: string;
      name: string;
      success: boolean;
      price?: number;
      error?: string;
    }> = [];
    
    results.forEach((result, index) => {
      const stock = allStocks[index];
      
      if (result.status === 'fulfilled') {
        success++;
        detailedResults.push({
          stockId: stock.id,
          code: stock.code,
          name: stock.name,
          success: true,
          price: result.value.currentPrice
        });
      } else {
        failed++;
        detailedResults.push({
          stockId: stock.id,
          code: stock.code,
          name: stock.name,
          success: false,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason)
        });
      }
    });
    
    console.log(`批次更新完成: 總計 ${total} 支，成功 ${success} 支，失敗 ${failed} 支`);
    
    return {
      total,
      success,
      failed,
      results: detailedResults
    };
  }
}
