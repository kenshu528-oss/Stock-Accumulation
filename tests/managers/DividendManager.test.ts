/**
 * DividendManager 單元測試
 * 測試股息管理器的核心功能
 */

import { DividendManager } from '../../src/managers/DividendManager';
import { StorageService } from '../../src/services/StorageService';
// import { Dividend } from '../../src/types/Dividend';
// Dividend 型別暫時未在測試中使用

describe('DividendManager', () => {
  let dividendManager: DividendManager;
  let storageService: StorageService;
  
  beforeEach(() => {
    // 清除 LocalStorage
    localStorage.clear();
    
    // 建立服務實例
    storageService = new StorageService();
    dividendManager = new DividendManager(storageService);
  });
  
  afterEach(() => {
    // 清理
    localStorage.clear();
  });
  
  describe('addDividend', () => {
    test('應該成功新增股息記錄', async () => {
      const dividendData = {
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      };
      
      const dividend = await dividendManager.addDividend(dividendData);
      
      expect(dividend).toBeDefined();
      expect(dividend.id).toBeDefined();
      expect(dividend.stockId).toBe('stock_123');
      expect(dividend.dividendPerShare).toBe(5.0);
      expect(dividend.totalDividend).toBe(5000);
      expect(dividend.createdAt).toBeDefined();
    });
    
    test('應該拒絕無效的除息日期', async () => {
      const dividendData = {
        stockId: 'stock_123',
        exDividendDate: 'invalid-date',
        dividendPerShare: 5.0,
        totalDividend: 5000
      };
      
      await expect(dividendManager.addDividend(dividendData)).rejects.toThrow();
    });
    
    test('應該拒絕負數的每股股息', async () => {
      const dividendData = {
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: -5.0,
        totalDividend: 5000
      };
      
      await expect(dividendManager.addDividend(dividendData)).rejects.toThrow();
    });
    
    test('應該拒絕空的股票 ID', async () => {
      const dividendData = {
        stockId: '',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      };
      
      await expect(dividendManager.addDividend(dividendData)).rejects.toThrow();
    });
  });
  
  describe('updateDividend', () => {
    test('應該成功更新股息記錄', async () => {
      // 先新增一筆股息
      const dividendData = {
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      };
      
      const dividend = await dividendManager.addDividend(dividendData);
      
      // 更新股息
      const updated = await dividendManager.updateDividend(dividend.id, {
        dividendPerShare: 6.0,
        totalDividend: 6000
      });
      
      expect(updated.dividendPerShare).toBe(6.0);
      expect(updated.totalDividend).toBe(6000);
      expect(updated.stockId).toBe('stock_123'); // 未更新的欄位應保持不變
    });
    
    test('應該拒絕更新不存在的股息', async () => {
      await expect(
        dividendManager.updateDividend('non-existent-id', { dividendPerShare: 6.0 })
      ).rejects.toThrow();
    });
  });
  
  describe('deleteDividend', () => {
    test('應該成功刪除股息記錄', async () => {
      // 先新增一筆股息
      const dividendData = {
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      };
      
      const dividend = await dividendManager.addDividend(dividendData);
      
      // 刪除股息
      dividendManager.deleteDividend(dividend.id);
      
      // 驗證已刪除
      const retrieved = dividendManager.getDividend(dividend.id);
      expect(retrieved).toBeNull();
    });
    
    test('應該拒絕刪除不存在的股息', () => {
      expect(() => {
        dividendManager.deleteDividend('non-existent-id');
      }).toThrow();
    });
  });
  
  describe('getDividendsByStock', () => {
    test('應該返回指定股票的所有股息', async () => {
      // 新增多筆股息
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      });
      
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-06-15',
        dividendPerShare: 5.5,
        totalDividend: 5500
      });
      
      await dividendManager.addDividend({
        stockId: 'stock_456',
        exDividendDate: '2024-03-15',
        dividendPerShare: 3.0,
        totalDividend: 3000
      });
      
      const dividends = dividendManager.getDividendsByStock('stock_123');
      
      expect(dividends).toHaveLength(2);
      expect(dividends[0].stockId).toBe('stock_123');
      expect(dividends[1].stockId).toBe('stock_123');
    });
    
    test('應該按除息日期排序（最新的在前）', async () => {
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      });
      
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-06-15',
        dividendPerShare: 5.5,
        totalDividend: 5500
      });
      
      const dividends = dividendManager.getDividendsByStock('stock_123');
      
      expect(new Date(dividends[0].exDividendDate).getTime())
        .toBeGreaterThan(new Date(dividends[1].exDividendDate).getTime());
    });
    
    test('應該返回空陣列當股票沒有股息時', () => {
      const dividends = dividendManager.getDividendsByStock('non-existent-stock');
      expect(dividends).toEqual([]);
    });
  });
  
  describe('calculateAdjustedCostPrice', () => {
    test('應該正確計算調整成本價', async () => {
      // 新增股息記錄
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      });
      
      // 原始成本價 100 元，持股 1000 股，收到股息 5000 元
      // 調整成本價 = (100000 - 5000) / 1000 = 95 元
      const adjustedCost = dividendManager.calculateAdjustedCostPrice(
        'stock_123',
        100,
        1000
      );
      
      expect(adjustedCost).toBe(95);
    });
    
    test('應該處理多筆股息', async () => {
      // 新增多筆股息
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      });
      
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-06-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      });
      
      // 原始成本價 100 元，持股 1000 股，收到股息 10000 元
      // 調整成本價 = (100000 - 10000) / 1000 = 90 元
      const adjustedCost = dividendManager.calculateAdjustedCostPrice(
        'stock_123',
        100,
        1000
      );
      
      expect(adjustedCost).toBe(90);
    });
    
    test('應該返回原始成本價當沒有股息時', () => {
      const adjustedCost = dividendManager.calculateAdjustedCostPrice(
        'stock_123',
        100,
        1000
      );
      
      expect(adjustedCost).toBe(100);
    });
  });
  
  describe('calculateTotalDividend', () => {
    test('應該正確計算總股息收入', async () => {
      // 新增多筆股息
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      });
      
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-06-15',
        dividendPerShare: 5.5,
        totalDividend: 5500
      });
      
      const totalDividend = dividendManager.calculateTotalDividend('stock_123');
      
      expect(totalDividend).toBe(10500);
    });
    
    test('應該返回 0 當沒有股息時', () => {
      const totalDividend = dividendManager.calculateTotalDividend('stock_123');
      expect(totalDividend).toBe(0);
    });
  });
  
  describe('資料持久化', () => {
    test('應該在新增股息後持久化資料', async () => {
      await dividendManager.addDividend({
        stockId: 'stock_123',
        exDividendDate: '2024-01-15',
        dividendPerShare: 5.0,
        totalDividend: 5000
      });
      
      // 建立新的 DividendManager 實例來驗證資料已持久化
      const newDividendManager = new DividendManager(storageService);
      const dividends = newDividendManager.getDividendsByStock('stock_123');
      
      expect(dividends).toHaveLength(1);
      expect(dividends[0].dividendPerShare).toBe(5.0);
    });
  });
});
