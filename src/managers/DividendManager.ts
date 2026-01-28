/**
 * DividendManager - 股息管理器
 * 
 * 負責管理所有股息相關的業務邏輯：
 * - 股息記錄的 CRUD 操作（新增、讀取、更新、刪除）
 * - 計算調整成本價（扣除股息後的實際成本）
 * - 計算總股息收入
 * 
 * 依賴注入：
 * - StorageService: 用於持久化儲存
 */

import { Dividend } from '../types/Dividend';
import { PortfolioData } from '../types/Portfolio';
import { StorageService } from '../services/StorageService';
import { ValidationError, StockError } from '../types/Errors';

/**
 * 股息管理器類別
 * 封裝所有股息相關的業務邏輯
 */
export class DividendManager {
  /** 股息資料儲存 - 使用 Map 結構以股息 ID 為鍵值 */
  private dividends: Map<string, Dividend> = new Map();
  
  /**
   * 建構函數 - 使用依賴注入模式
   * @param storageService - 儲存服務實例
   */
  constructor(private storageService: StorageService) {
    // 初始化時從儲存載入現有資料
    this.loadFromStorage();
  }
  
  /**
   * 從儲存服務載入股息資料
   * 在初始化時自動呼叫
   * @private
   */
  private loadFromStorage(): void {
    try {
      const data = this.storageService.load();
      
      if (data && data.dividends) {
        // 將股息陣列轉換為 Map 結構
        for (const dividend of data.dividends) {
          this.dividends.set(dividend.id, dividend);
        }
        
        console.log(`已載入 ${this.dividends.size} 筆股息資料`);
      } else {
        console.log('無現有股息資料，從空白狀態開始');
      }
    } catch (error) {
      console.error('載入股息資料失敗:', error);
      // 載入失敗時從空白狀態開始
      this.dividends.clear();
    }
  }
  
  /**
   * 儲存股息資料到儲存服務
   * 在每次修改後自動呼叫
   * @private
   */
  private saveToStorage(): void {
    try {
      // 載入完整的投資組合資料
      const data = this.storageService.load() || this.createEmptyPortfolioData();
      
      // 更新股息陣列
      data.dividends = Array.from(this.dividends.values());
      
      // 儲存回儲存服務
      this.storageService.save(data);
      
      console.log(`已儲存 ${this.dividends.size} 筆股息資料`);
    } catch (error) {
      console.error('儲存股息資料失敗:', error);
      throw new StockError('儲存股息資料失敗', 'STORAGE_ERROR');
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
   * 產生唯一的股息 ID
   * 使用時間戳記和隨機數組合
   * @private
   * @returns 唯一的股息 ID
   */
  private generateDividendId(): string {
    return `dividend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 新增股息記錄
   * 驗證輸入資料並建立股息記錄
   * 
   * @param dividendData - 股息資料（不含 id 和 createdAt）
   * @returns 新建立的股息記錄
   * @throws {ValidationError} 當輸入資料驗證失敗時
   * @throws {StockError} 當新增股息失敗時
   */
  async addDividend(
    dividendData: Omit<Dividend, 'id' | 'createdAt'>
  ): Promise<Dividend> {
    // 驗證股息資料
    const { validateAmount, validateDate } = await import('../utils/validators');
    
    // 驗證每股股息金額
    const dividendPerShareValidation = validateAmount(dividendData.dividendPerShare);
    if (!dividendPerShareValidation.valid) {
      throw new ValidationError(
        dividendPerShareValidation.error || '每股股息金額格式錯誤',
        'dividendPerShare'
      );
    }
    
    // 驗證總股息金額
    const totalDividendValidation = validateAmount(dividendData.totalDividend);
    if (!totalDividendValidation.valid) {
      throw new ValidationError(
        totalDividendValidation.error || '總股息金額格式錯誤',
        'totalDividend'
      );
    }
    
    // 驗證除息日期
    const dateValidation = validateDate(dividendData.exDividendDate, { allowFuture: true });
    if (!dateValidation.valid) {
      throw new ValidationError(
        dateValidation.error || '除息日期格式錯誤',
        'exDividendDate'
      );
    }
    
    // 驗證 stockId 不為空
    if (!dividendData.stockId || dividendData.stockId.trim() === '') {
      throw new ValidationError('股票 ID 不能為空', 'stockId');
    }
    
    // 建立新股息記錄
    const newDividend: Dividend = {
      id: this.generateDividendId(),
      stockId: dividendData.stockId,
      exDividendDate: new Date(dividendData.exDividendDate).toISOString(),
      dividendPerShare: dividendData.dividendPerShare,
      totalDividend: dividendData.totalDividend,
      createdAt: new Date().toISOString()
    };
    
    // 儲存到 Map
    this.dividends.set(newDividend.id, newDividend);
    
    // 持久化儲存
    this.saveToStorage();
    
    console.log(
      `✅ 新增股息記錄成功: 股票 ${newDividend.stockId}, ` +
      `每股 ${newDividend.dividendPerShare}, 總計 ${newDividend.totalDividend}`
    );
    
    return newDividend;
  }
  
  /**
   * 更新股息記錄
   * 可以更新股息的任何欄位（除了 id 和 createdAt）
   * 
   * @param dividendId - 股息 ID
   * @param updates - 要更新的欄位
   * @returns 更新後的股息記錄
   * @throws {StockError} 當股息不存在或更新失敗時
   * @throws {ValidationError} 當更新資料驗證失敗時
   */
  async updateDividend(
    dividendId: string,
    updates: Partial<Omit<Dividend, 'id' | 'createdAt'>>
  ): Promise<Dividend> {
    // 檢查股息是否存在
    const dividend = this.dividends.get(dividendId);
    if (!dividend) {
      throw new StockError(`股息記錄不存在: ${dividendId}`, 'DIVIDEND_NOT_FOUND');
    }
    
    // 驗證更新資料
    const { validateAmount, validateDate } = await import('../utils/validators');
    
    if (updates.dividendPerShare !== undefined) {
      const validation = validateAmount(updates.dividendPerShare);
      if (!validation.valid) {
        throw new ValidationError(
          validation.error || '每股股息金額格式錯誤',
          'dividendPerShare'
        );
      }
    }
    
    if (updates.totalDividend !== undefined) {
      const validation = validateAmount(updates.totalDividend);
      if (!validation.valid) {
        throw new ValidationError(
          validation.error || '總股息金額格式錯誤',
          'totalDividend'
        );
      }
    }
    
    if (updates.exDividendDate !== undefined) {
      const validation = validateDate(updates.exDividendDate, { allowFuture: true });
      if (!validation.valid) {
        throw new ValidationError(
          validation.error || '除息日期格式錯誤',
          'exDividendDate'
        );
      }
    }
    
    if (updates.stockId !== undefined && updates.stockId.trim() === '') {
      throw new ValidationError('股票 ID 不能為空', 'stockId');
    }
    
    // 更新股息記錄
    const updatedDividend: Dividend = {
      ...dividend,
      ...updates,
      // 確保 exDividendDate 是 ISO 格式
      exDividendDate: updates.exDividendDate
        ? new Date(updates.exDividendDate).toISOString()
        : dividend.exDividendDate
    };
    
    // 儲存到 Map
    this.dividends.set(dividendId, updatedDividend);
    
    // 持久化儲存
    this.saveToStorage();
    
    console.log(`✅ 更新股息記錄成功: ${dividendId}`);
    
    return updatedDividend;
  }
  
  /**
   * 刪除股息記錄
   * 從系統中完全移除股息記錄
   * 
   * @param dividendId - 股息 ID
   * @throws {StockError} 當股息不存在時
   */
  deleteDividend(dividendId: string): void {
    // 檢查股息是否存在
    const dividend = this.dividends.get(dividendId);
    if (!dividend) {
      throw new StockError(`股息記錄不存在: ${dividendId}`, 'DIVIDEND_NOT_FOUND');
    }
    
    // 從 Map 中刪除
    this.dividends.delete(dividendId);
    
    // 持久化儲存
    this.saveToStorage();
    
    console.log(`✅ 刪除股息記錄成功: ${dividendId}`);
  }
  
  /**
   * 取得指定股票的所有股息記錄
   * 根據股票 ID 篩選股息記錄，並按除息日期排序（由新到舊）
   * 
   * @param stockId - 股票 ID
   * @returns 該股票的所有股息記錄，按除息日期排序
   */
  getDividendsByStock(stockId: string): Dividend[] {
    const stockDividends = Array.from(this.dividends.values()).filter(
      dividend => dividend.stockId === stockId
    );
    
    // 按除息日期排序（由新到舊）
    return stockDividends.sort((a, b) => {
      return new Date(b.exDividendDate).getTime() - new Date(a.exDividendDate).getTime();
    });
  }

  
  /**
   * 計算調整成本價
   * 調整成本價 = 原始成本價 - (總股息收入 / 持股數)
   * 
   * 這個計算反映了股息收入對實際投資成本的影響。
   * 當股息收入累積到一定程度，可能會使調整成本價降低，
   * 甚至在極端情況下變為負數（表示已回本並有盈餘）。
   * 
   * @param stockId - 股票 ID
   * @param originalCostPrice - 原始成本價
   * @param currentShares - 目前持股數
   * @returns 調整後的成本價
   */
  calculateAdjustedCostPrice(
    stockId: string,
    originalCostPrice: number,
    currentShares: number
  ): number {
    // 取得該股票的所有股息記錄
    const dividends = this.getDividendsByStock(stockId);
    
    // 計算總股息收入
    const totalDividendIncome = dividends.reduce(
      (sum, dividend) => sum + dividend.totalDividend,
      0
    );
    
    // 如果沒有股息或持股數為 0，返回原始成本價
    if (totalDividendIncome === 0 || currentShares === 0) {
      return originalCostPrice;
    }
    
    // 計算調整成本價
    // 調整成本價 = 原始成本價 - (總股息收入 / 持股數)
    const adjustedCostPrice = originalCostPrice - (totalDividendIncome / currentShares);
    
    return adjustedCostPrice;
  }
  
  /**
   * 計算總股息收入
   * 可以計算單一股票或所有股票的總股息收入
   * 
   * @param stockId - 股票 ID（選填，如果不提供則計算所有股票）
   * @returns 總股息收入
   */
  calculateTotalDividend(stockId?: string): number {
    let dividendsToSum: Dividend[];
    
    if (stockId) {
      // 計算指定股票的總股息
      dividendsToSum = this.getDividendsByStock(stockId);
    } else {
      // 計算所有股票的總股息
      dividendsToSum = Array.from(this.dividends.values());
    }
    
    // 累加總股息收入
    const totalDividend = dividendsToSum.reduce(
      (sum, dividend) => sum + dividend.totalDividend,
      0
    );
    
    return totalDividend;
  }
  
  /**
   * 取得所有股息記錄
   * 返回系統中所有的股息記錄
   * 
   * @returns 所有股息記錄的陣列
   */
  getAllDividends(): Dividend[] {
    return Array.from(this.dividends.values());
  }
  
  /**
   * 取得單一股息記錄
   * 根據股息 ID 查詢股息記錄
   * 
   * @param dividendId - 股息 ID
   * @returns 股息記錄，如果不存在則返回 null
   */
  getDividend(dividendId: string): Dividend | null {
    return this.dividends.get(dividendId) || null;
  }
}
