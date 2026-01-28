/**
 * PortfolioManager - 投資組合管理器
 * 
 * 負責協調各個管理器並計算投資組合統計資料：
 * - 計算投資組合整體統計（總市值、總損益、總報酬率等）
 * - 計算單一帳戶統計
 * - 計算總體統計（所有帳戶彙總）
 * 
 * 依賴注入：
 * - StockManager: 用於取得股票資料
 * - AccountManager: 用於取得帳戶資料
 * - DividendManager: 用於取得股息資料
 */

import { PortfolioStats } from '../types/Portfolio';
import { StockManager } from './StockManager';
import { AccountManager } from './AccountManager';
import { DividendManager } from './DividendManager';
import { calculateGain } from '../utils/calculators';
// calculateTotalReturn 暫時未使用，保留供未來功能擴展
// import { calculateTotalReturn } from '../utils/calculators';

/**
 * 投資組合管理器類別
 * 協調各個管理器並提供統計計算功能
 */
export class PortfolioManager {
  /**
   * 建構函數 - 使用依賴注入模式
   * @param stockManager - 股票管理器實例
   * @param accountManager - 帳戶管理器實例
   * @param dividendManager - 股息管理器實例
   */
  constructor(
    private stockManager: StockManager,
    private accountManager: AccountManager,
    private dividendManager: DividendManager
  ) {}
  
  /**
   * 計算投資組合統計
   * 根據提供的股票列表計算統計資料
   * 
   * @param stocks - 股票列表（可以是所有股票或特定帳戶的股票）
   * @returns 投資組合統計資料
   * @private
   */
  private calculateStats(stocks: Array<{
    id: string;
    code: string;
    name: string;
    shares: number;
    costPrice: number;
    currentPrice: number;
  }>): PortfolioStats {
    // 初始化統計資料
    let totalValue = 0;      // 總市值
    let totalCost = 0;       // 總成本
    let totalGain = 0;       // 總損益
    let totalDividend = 0;   // 總股息收入
    
    // 遍歷所有股票計算統計
    for (const stock of stocks) {
      // 計算該股票的市值和成本
      const stockValue = stock.currentPrice * stock.shares;
      const stockCost = stock.costPrice * stock.shares;
      
      // 計算該股票的損益
      const stockGain = calculateGain(
        stock.currentPrice,
        stock.costPrice,
        stock.shares
      );
      
      // 計算該股票的股息收入
      const stockDividend = this.dividendManager.calculateTotalDividend(stock.id);
      
      // 累加到總計
      totalValue += stockValue;
      totalCost += stockCost;
      totalGain += stockGain;
      totalDividend += stockDividend;
    }
    
    // 計算百分比
    // 避免除以零的情況
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    
    // 計算總報酬（損益 + 股息）
    const totalReturn = totalGain + totalDividend;
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
    
    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      totalDividend,
      totalReturn,
      totalReturnPercent
    };
  }
  
  /**
   * 計算單一帳戶的統計資料
   * 只計算指定帳戶的股票
   * 
   * @param accountId - 帳戶 ID
   * @returns 該帳戶的投資組合統計資料
   * @throws {Error} 當帳戶不存在時
   */
  getAccountStats(accountId: string): PortfolioStats {
    // 驗證帳戶是否存在
    const account = this.accountManager.getAccount(accountId);
    if (!account) {
      throw new Error(`帳戶不存在: ${accountId}`);
    }
    
    // 取得該帳戶的所有股票
    const accountStocks = this.stockManager.getStocksByAccount(accountId);
    
    // 計算統計資料
    const stats = this.calculateStats(accountStocks);
    
    console.log(`計算帳戶統計: ${account.name} - 總市值 ${stats.totalValue}, 總報酬率 ${stats.totalReturnPercent.toFixed(2)}%`);
    
    return stats;
  }
  
  /**
   * 計算總體統計資料
   * 計算所有帳戶的股票彙總統計
   * 
   * @returns 總體投資組合統計資料
   */
  getTotalStats(): PortfolioStats {
    // 取得所有股票
    const allStocks = this.stockManager.getAllStocks();
    
    // 計算統計資料
    const stats = this.calculateStats(allStocks);
    
    console.log(`計算總體統計: 總市值 ${stats.totalValue}, 總報酬率 ${stats.totalReturnPercent.toFixed(2)}%`);
    
    return stats;
  }
  
  /**
   * 計算投資組合統計（通用方法）
   * 可以指定帳戶 ID 或計算所有帳戶
   * 
   * @param accountId - 帳戶 ID（選填，如果不提供則計算所有帳戶）
   * @returns 投資組合統計資料
   */
  calculatePortfolioStats(accountId?: string): PortfolioStats {
    if (accountId) {
      // 計算指定帳戶的統計
      return this.getAccountStats(accountId);
    } else {
      // 計算總體統計
      return this.getTotalStats();
    }
  }
  
  /**
   * 取得所有帳戶的統計資料
   * 返回每個帳戶的統計資料陣列
   * 
   * @returns 所有帳戶的統計資料陣列
   */
  getAllAccountStats(): Array<{
    accountId: string;
    accountName: string;
    stats: PortfolioStats;
  }> {
    const accounts = this.accountManager.getAllAccounts();
    
    return accounts.map(account => ({
      accountId: account.id,
      accountName: account.name,
      stats: this.getAccountStats(account.id)
    }));
  }
  
  /**
   * 取得投資組合摘要
   * 包含總體統計和各帳戶統計
   * 
   * @returns 完整的投資組合摘要
   */
  getPortfolioSummary(): {
    totalStats: PortfolioStats;
    accountStats: Array<{
      accountId: string;
      accountName: string;
      stats: PortfolioStats;
    }>;
    stockCount: number;
    accountCount: number;
  } {
    const totalStats = this.getTotalStats();
    const accountStats = this.getAllAccountStats();
    const stockCount = this.stockManager.getAllStocks().length;
    const accountCount = this.accountManager.getAccountCount();
    
    return {
      totalStats,
      accountStats,
      stockCount,
      accountCount
    };
  }
}
