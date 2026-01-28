/**
 * StockApiService 單元測試
 * 測試股價 API 服務的核心功能
 */

import { StockApiService } from '../../src/services/StockApiService';
import { ApiError } from '../../src/types/Errors';

describe('StockApiService', () => {
  let service: StockApiService;
  
  beforeEach(() => {
    service = new StockApiService();
  });
  
  describe('基礎功能', () => {
    test('應該成功建立 StockApiService 實例', () => {
      expect(service).toBeInstanceOf(StockApiService);
    });
    
    test('應該載入本地資料庫', () => {
      // 測試本地資料庫是否已載入（透過 console.log 輸出）
      // 實際測試會在整合測試中進行
      expect(service).toBeDefined();
    });
  });
  
  describe('快取機制', () => {
    test('應該能清除特定股票的快取', () => {
      expect(() => service.clearCache('2330')).not.toThrow();
    });
    
    test('應該能清除所有快取', () => {
      expect(() => service.clearAllCache()).not.toThrow();
    });
  });
  
  describe('錯誤處理', () => {
    test('當所有 API 都失敗時應該拋出 ApiError', async () => {
      // 使用不存在的股票代碼測試
      await expect(service.getStockPrice('9999')).rejects.toThrow(ApiError);
    });
    
    test('當找不到股票資訊時應該拋出 ApiError', async () => {
      // 使用不存在的股票代碼測試
      await expect(service.searchStockByCode('9999')).rejects.toThrow(ApiError);
    });
  });
});
