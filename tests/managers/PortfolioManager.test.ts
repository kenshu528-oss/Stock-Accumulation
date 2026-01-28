/**
 * PortfolioManager 單元測試
 * 
 * 測試範圍：
 * - 計算投資組合統計
 * - 計算單一帳戶統計
 * - 計算總體統計
 */

import { PortfolioManager } from '../../src/managers/PortfolioManager';
import { StockManager } from '../../src/managers/StockManager';
import { AccountManager } from '../../src/managers/AccountManager';
import { DividendManager } from '../../src/managers/DividendManager';
import { StockApiService } from '../../src/services/StockApiService';
import { StorageService } from '../../src/services/StorageService';

// Mock 服務
jest.mock('../../src/services/StockApiService');
jest.mock('../../src/services/StorageService');

describe('PortfolioManager', () => {
  let portfolioManager: PortfolioManager;
  let stockManager: StockManager;
  let accountManager: AccountManager;
  let dividendManager: DividendManager;
  let mockApiService: jest.Mocked<StockApiService>;
  let mockStorageService: jest.Mocked<StorageService>;
  
  beforeEach(() => {
    // 建立 mock 實例
    mockApiService = new StockApiService() as jest.Mocked<StockApiService>;
    mockStorageService = new StorageService() as jest.Mocked<StorageService>;
    
    // 設定預設的 mock 行為
    mockStorageService.load.mockReturnValue(null);
    mockStorageService.save.mockImplementation(() => {});
    
    // 建立管理器實例
    stockManager = new StockManager(mockApiService, mockStorageService);
    accountManager = new AccountManager(mockStorageService);
    dividendManager = new DividendManager(mockStorageService);
    portfolioManager = new PortfolioManager(stockManager, accountManager, dividendManager);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getTotalStats - 計算總體統計', () => {
    it('應該返回空投資組合的統計資料', () => {
      // Act
      const stats = portfolioManager.getTotalStats();
      
      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalValue).toBe(0);
      expect(stats.totalCost).toBe(0);
      expect(stats.totalGain).toBe(0);
      expect(stats.totalGainPercent).toBe(0);
      expect(stats.totalDividend).toBe(0);
      expect(stats.totalReturn).toBe(0);
      expect(stats.totalReturnPercent).toBe(0);
    });
    
    it('應該正確計算有股票的投資組合統計', async () => {
      // Arrange - 新增一個帳戶
      const account = accountManager.createAccount('測試帳戶');
      
      // 新增一支股票
      await stockManager.addStock({
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: account.id,
        dataSource: 'TWSE'
      });
      
      // Act
      const stats = portfolioManager.getTotalStats();
      
      // Assert
      expect(stats.totalValue).toBe(55000); // 550 * 100
      expect(stats.totalCost).toBe(50000);  // 500 * 100
      expect(stats.totalGain).toBe(5000);   // (550 - 500) * 100
      expect(stats.totalGainPercent).toBe(10); // (5000 / 50000) * 100
      expect(stats.totalDividend).toBe(0);  // 沒有股息
      expect(stats.totalReturn).toBe(5000); // 5000 + 0
      expect(stats.totalReturnPercent).toBe(10); // (5000 / 50000) * 100
    });
    
    it('應該正確計算包含股息的投資組合統計', async () => {
      // Arrange - 新增一個帳戶
      const account = accountManager.createAccount('測試帳戶');
      
      // 新增一支股票
      const stock = await stockManager.addStock({
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: account.id,
        dataSource: 'TWSE'
      });
      
      // 新增股息記錄
      await dividendManager.addDividend({
        stockId: stock.id,
        exDividendDate: '2024-06-15',
        dividendPerShare: 10,
        totalDividend: 1000 // 10 * 100
      });
      
      // Act
      const stats = portfolioManager.getTotalStats();
      
      // Assert
      expect(stats.totalValue).toBe(55000); // 550 * 100
      expect(stats.totalCost).toBe(50000);  // 500 * 100
      expect(stats.totalGain).toBe(5000);   // (550 - 500) * 100
      expect(stats.totalGainPercent).toBe(10); // (5000 / 50000) * 100
      expect(stats.totalDividend).toBe(1000);  // 股息收入
      expect(stats.totalReturn).toBe(6000); // 5000 + 1000
      expect(stats.totalReturnPercent).toBe(12); // (6000 / 50000) * 100
    });
  });
  
  describe('getAccountStats - 計算單一帳戶統計', () => {
    it('應該正確計算指定帳戶的統計資料', async () => {
      // Arrange - 建立兩個帳戶
      const account1 = accountManager.createAccount('帳戶1');
      const account2 = accountManager.createAccount('帳戶2');
      
      // 在帳戶1新增股票
      await stockManager.addStock({
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: account1.id,
        dataSource: 'TWSE'
      });
      
      // 在帳戶2新增股票
      await stockManager.addStock({
        code: '2317',
        name: '鴻海',
        shares: 200,
        costPrice: 100,
        currentPrice: 110,
        purchaseDate: '2024-01-15',
        accountId: account2.id,
        dataSource: 'TWSE'
      });
      
      // Act
      const account1Stats = portfolioManager.getAccountStats(account1.id);
      const account2Stats = portfolioManager.getAccountStats(account2.id);
      
      // Assert - 帳戶1
      expect(account1Stats.totalValue).toBe(55000); // 550 * 100
      expect(account1Stats.totalCost).toBe(50000);  // 500 * 100
      expect(account1Stats.totalGain).toBe(5000);   // (550 - 500) * 100
      
      // Assert - 帳戶2
      expect(account2Stats.totalValue).toBe(22000); // 110 * 200
      expect(account2Stats.totalCost).toBe(20000);  // 100 * 200
      expect(account2Stats.totalGain).toBe(2000);   // (110 - 100) * 200
    });
    
    it('應該在帳戶不存在時拋出錯誤', () => {
      // Act & Assert
      expect(() => {
        portfolioManager.getAccountStats('non-existent-account');
      }).toThrow('帳戶不存在');
    });
  });
  
  describe('calculatePortfolioStats - 通用計算方法', () => {
    it('應該在沒有指定帳戶時計算總體統計', async () => {
      // Arrange
      const account = accountManager.createAccount('測試帳戶');
      await stockManager.addStock({
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: account.id,
        dataSource: 'TWSE'
      });
      
      // Act
      const stats = portfolioManager.calculatePortfolioStats();
      
      // Assert
      expect(stats.totalValue).toBe(55000);
      expect(stats.totalCost).toBe(50000);
    });
    
    it('應該在指定帳戶時計算該帳戶統計', async () => {
      // Arrange
      const account = accountManager.createAccount('測試帳戶');
      await stockManager.addStock({
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: account.id,
        dataSource: 'TWSE'
      });
      
      // Act
      const stats = portfolioManager.calculatePortfolioStats(account.id);
      
      // Assert
      expect(stats.totalValue).toBe(55000);
      expect(stats.totalCost).toBe(50000);
    });
  });
  
  describe('getPortfolioSummary - 取得投資組合摘要', () => {
    it('應該返回完整的投資組合摘要', async () => {
      // Arrange
      const account1 = accountManager.createAccount('帳戶1');
      const account2 = accountManager.createAccount('帳戶2');
      
      await stockManager.addStock({
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: account1.id,
        dataSource: 'TWSE'
      });
      
      await stockManager.addStock({
        code: '2317',
        name: '鴻海',
        shares: 200,
        costPrice: 100,
        currentPrice: 110,
        purchaseDate: '2024-01-15',
        accountId: account2.id,
        dataSource: 'TWSE'
      });
      
      // Act
      const summary = portfolioManager.getPortfolioSummary();
      
      // Assert
      expect(summary.totalStats).toBeDefined();
      expect(summary.totalStats.totalValue).toBe(77000); // 55000 + 22000
      expect(summary.accountStats).toHaveLength(2);
      expect(summary.stockCount).toBe(2);
      expect(summary.accountCount).toBe(2);
    });
  });
});
