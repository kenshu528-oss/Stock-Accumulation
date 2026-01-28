/**
 * DividendManager 與 StockManager 整合測試
 * 測試股息管理與股票管理的協作
 */

import { DividendManager } from '../../src/managers/DividendManager';
import { StockManager } from '../../src/managers/StockManager';
import { StorageService } from '../../src/services/StorageService';
import { StockApiService } from '../../src/services/StockApiService';

describe('DividendManager 與 StockManager 整合', () => {
  let dividendManager: DividendManager;
  let stockManager: StockManager;
  let storageService: StorageService;
  let apiService: StockApiService;
  
  beforeEach(() => {
    // 清除 LocalStorage
    localStorage.clear();
    
    // 建立服務實例
    storageService = new StorageService();
    apiService = new StockApiService();
    
    // 建立管理器實例
    stockManager = new StockManager(apiService, storageService);
    dividendManager = new DividendManager(storageService);
  });
  
  afterEach(() => {
    // 清理
    localStorage.clear();
  });
  
  test('應該能為股票新增股息並計算調整成本價', async () => {
    // 1. 新增股票
    const stock = await stockManager.addStock({
      code: '2330',
      name: '台積電',
      shares: 1000,
      costPrice: 500,
      currentPrice: 550,
      purchaseDate: '2024-01-01',
      accountId: 'account_1',
      dataSource: 'Local'
    });
    
    // 2. 新增股息記錄
    await dividendManager.addDividend({
      stockId: stock.id,
      exDividendDate: '2024-06-15',
      dividendPerShare: 5.0,
      totalDividend: 5000
    });
    
    // 3. 計算調整成本價
    const adjustedCost = dividendManager.calculateAdjustedCostPrice(
      stock.id,
      stock.costPrice,
      stock.shares
    );
    
    // 原始成本 500 * 1000 = 500000
    // 股息 5000
    // 調整成本 = (500000 - 5000) / 1000 = 495
    expect(adjustedCost).toBe(495);
  });
  
  test('應該能計算多筆股息的調整成本價', async () => {
    // 1. 新增股票
    const stock = await stockManager.addStock({
      code: '0050',
      name: '元大台灣50',
      shares: 100,
      costPrice: 100,
      currentPrice: 110,
      purchaseDate: '2024-01-01',
      accountId: 'account_1',
      dataSource: 'Local'
    });
    
    // 2. 新增多筆股息
    await dividendManager.addDividend({
      stockId: stock.id,
      exDividendDate: '2024-03-15',
      dividendPerShare: 1.5,
      totalDividend: 150
    });
    
    await dividendManager.addDividend({
      stockId: stock.id,
      exDividendDate: '2024-06-15',
      dividendPerShare: 1.5,
      totalDividend: 150
    });
    
    await dividendManager.addDividend({
      stockId: stock.id,
      exDividendDate: '2024-09-15',
      dividendPerShare: 1.5,
      totalDividend: 150
    });
    
    // 3. 計算調整成本價
    const adjustedCost = dividendManager.calculateAdjustedCostPrice(
      stock.id,
      stock.costPrice,
      stock.shares
    );
    
    // 原始成本 100 * 100 = 10000
    // 總股息 150 * 3 = 450
    // 調整成本 = (10000 - 450) / 100 = 95.5
    expect(adjustedCost).toBe(95.5);
  });
  
  test('應該能計算總股息收入', async () => {
    // 1. 新增股票
    const stock = await stockManager.addStock({
      code: '2330',
      name: '台積電',
      shares: 1000,
      costPrice: 500,
      currentPrice: 550,
      purchaseDate: '2024-01-01',
      accountId: 'account_1',
      dataSource: 'Local'
    });
    
    // 2. 新增多筆股息
    await dividendManager.addDividend({
      stockId: stock.id,
      exDividendDate: '2024-03-15',
      dividendPerShare: 2.5,
      totalDividend: 2500
    });
    
    await dividendManager.addDividend({
      stockId: stock.id,
      exDividendDate: '2024-09-15',
      dividendPerShare: 2.5,
      totalDividend: 2500
    });
    
    // 3. 計算總股息
    const totalDividend = dividendManager.calculateTotalDividend(stock.id);
    
    expect(totalDividend).toBe(5000);
  });
  
  test('刪除股票時應該考慮清理相關股息', async () => {
    // 1. 新增股票
    const stock = await stockManager.addStock({
      code: '2330',
      name: '台積電',
      shares: 1000,
      costPrice: 500,
      currentPrice: 550,
      purchaseDate: '2024-01-01',
      accountId: 'account_1',
      dataSource: 'Local'
    });
    
    // 2. 新增股息
    await dividendManager.addDividend({
      stockId: stock.id,
      exDividendDate: '2024-06-15',
      dividendPerShare: 5.0,
      totalDividend: 5000
    });
    
    // 3. 刪除股票
    stockManager.deleteStock(stock.id);
    
    // 4. 驗證股票已刪除
    const retrievedStock = stockManager.getStock(stock.id);
    expect(retrievedStock).toBeNull();
    
    // 注意：目前 DividendManager 不會自動刪除相關股息
    // 這是一個設計決策 - 保留歷史股息記錄
    // 如果需要自動清理，應該在 StockManager.deleteStock 中實作
    const dividends = dividendManager.getDividendsByStock(stock.id);
    expect(dividends).toHaveLength(1); // 股息仍然存在
  });
  
  test('應該能處理多支股票的股息', async () => {
    // 1. 新增多支股票
    const stock1 = await stockManager.addStock({
      code: '2330',
      name: '台積電',
      shares: 1000,
      costPrice: 500,
      currentPrice: 550,
      purchaseDate: '2024-01-01',
      accountId: 'account_1',
      dataSource: 'Local'
    });
    
    const stock2 = await stockManager.addStock({
      code: '0050',
      name: '元大台灣50',
      shares: 100,
      costPrice: 100,
      currentPrice: 110,
      purchaseDate: '2024-01-01',
      accountId: 'account_1',
      dataSource: 'Local'
    });
    
    // 2. 為每支股票新增股息
    await dividendManager.addDividend({
      stockId: stock1.id,
      exDividendDate: '2024-06-15',
      dividendPerShare: 5.0,
      totalDividend: 5000
    });
    
    await dividendManager.addDividend({
      stockId: stock2.id,
      exDividendDate: '2024-06-15',
      dividendPerShare: 1.5,
      totalDividend: 150
    });
    
    // 3. 驗證每支股票的股息
    const stock1Dividends = dividendManager.getDividendsByStock(stock1.id);
    const stock2Dividends = dividendManager.getDividendsByStock(stock2.id);
    
    expect(stock1Dividends).toHaveLength(1);
    expect(stock2Dividends).toHaveLength(1);
    
    expect(stock1Dividends[0].totalDividend).toBe(5000);
    expect(stock2Dividends[0].totalDividend).toBe(150);
  });
});
