/**
 * StockManager 單元測試
 * 
 * 測試範圍：
 * - CRUD 操作（新增、讀取、更新、刪除）
 * - 股價更新（單一和批次）
 * - 錯誤處理
 */

import { StockManager } from '../../src/managers/StockManager';
import { StockApiService } from '../../src/services/StockApiService';
import { StorageService } from '../../src/services/StorageService';
// import { Stock } from '../../src/types/Stock';
// Stock 型別暫時未在測試中使用
import { ValidationError, StockError } from '../../src/types/Errors';

// Mock 服務
jest.mock('../../src/services/StockApiService');
jest.mock('../../src/services/StorageService');

describe('StockManager', () => {
  let stockManager: StockManager;
  let mockApiService: jest.Mocked<StockApiService>;
  let mockStorageService: jest.Mocked<StorageService>;
  
  beforeEach(() => {
    // 建立 mock 實例
    mockApiService = new StockApiService() as jest.Mocked<StockApiService>;
    mockStorageService = new StorageService() as jest.Mocked<StorageService>;
    
    // 設定預設的 mock 行為
    mockStorageService.load.mockReturnValue(null);
    mockStorageService.save.mockImplementation(() => {});
    
    // 建立 StockManager 實例
    stockManager = new StockManager(mockApiService, mockStorageService);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('CRUD 操作', () => {
    describe('addStock - 新增股票', () => {
      it('應該成功新增有效的股票', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        // Act
        const result = await stockManager.addStock(stockData);
        
        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.code).toBe('2330');
        expect(result.name).toBe('台積電');
        expect(result.shares).toBe(100);
        expect(result.costPrice).toBe(500);
        expect(result.currentPrice).toBe(550);
        expect(result.accountId).toBe('account-1');
        expect(result.lastUpdated).toBeDefined();
        expect(mockStorageService.save).toHaveBeenCalled();
      });
      
      it('應該在沒有股票名稱時自動查詢', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        mockApiService.searchStockByCode.mockResolvedValue({
          code: '2330',
          name: '台積電',
          source: 'TWSE'
        });
        
        // Act
        const result = await stockManager.addStock(stockData);
        
        // Assert
        expect(result.name).toBe('台積電');
        expect(mockApiService.searchStockByCode).toHaveBeenCalledWith('2330');
      });
      
      it('應該拒絕無效的股票代碼', async () => {
        // Arrange
        const stockData = {
          code: 'INVALID',
          name: '測試',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        // Act & Assert
        await expect(stockManager.addStock(stockData)).rejects.toThrow(ValidationError);
      });
      
      it('應該拒絕負數的持股數', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: -100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        // Act & Assert
        await expect(stockManager.addStock(stockData)).rejects.toThrow(ValidationError);
      });
      
      it('應該拒絕負數的成本價', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: -500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        // Act & Assert
        await expect(stockManager.addStock(stockData)).rejects.toThrow(ValidationError);
      });
      
      it('應該拒絕未來的購買日期', async () => {
        // Arrange
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);
        
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: futureDate.toISOString().split('T')[0],
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        // Act & Assert
        await expect(stockManager.addStock(stockData)).rejects.toThrow(ValidationError);
      });
    });
    
    describe('getStock - 取得單一股票', () => {
      it('應該返回存在的股票', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const addedStock = await stockManager.addStock(stockData);
        
        // Act
        const result = stockManager.getStock(addedStock.id);
        
        // Assert
        expect(result).toBeDefined();
        expect(result?.id).toBe(addedStock.id);
        expect(result?.code).toBe('2330');
      });
      
      it('應該對不存在的股票返回 null', () => {
        // Act
        const result = stockManager.getStock('non-existent-id');
        
        // Assert
        expect(result).toBeNull();
      });
    });
    
    describe('getAllStocks - 取得所有股票', () => {
      it('應該返回空陣列當沒有股票時', () => {
        // Act
        const result = stockManager.getAllStocks();
        
        // Assert
        expect(result).toEqual([]);
      });
      
      it('應該返回所有已新增的股票', async () => {
        // Arrange
        const stock1 = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const stock2 = {
          code: '2317',
          name: '鴻海',
          shares: 200,
          costPrice: 100,
          currentPrice: 110,
          purchaseDate: '2024-01-20',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        await stockManager.addStock(stock1);
        await stockManager.addStock(stock2);
        
        // Act
        const result = stockManager.getAllStocks();
        
        // Assert
        expect(result).toHaveLength(2);
        expect(result.find(s => s.code === '2330')).toBeDefined();
        expect(result.find(s => s.code === '2317')).toBeDefined();
      });
    });
    
    describe('getStocksByAccount - 取得指定帳戶的股票', () => {
      it('應該只返回指定帳戶的股票', async () => {
        // Arrange
        const stock1 = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const stock2 = {
          code: '2317',
          name: '鴻海',
          shares: 200,
          costPrice: 100,
          currentPrice: 110,
          purchaseDate: '2024-01-20',
          accountId: 'account-2',
          dataSource: 'TWSE' as const
        };
        
        await stockManager.addStock(stock1);
        await stockManager.addStock(stock2);
        
        // Act
        const result = stockManager.getStocksByAccount('account-1');
        
        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe('2330');
        expect(result[0].accountId).toBe('account-1');
      });
      
      it('應該返回空陣列當帳戶沒有股票時', () => {
        // Act
        const result = stockManager.getStocksByAccount('non-existent-account');
        
        // Assert
        expect(result).toEqual([]);
      });
    });

    describe('updateStock - 更新股票', () => {
      it('應該成功更新股票資訊', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const addedStock = await stockManager.addStock(stockData);
        
        // Act
        const result = await stockManager.updateStock(addedStock.id, {
          shares: 150,
          costPrice: 480
        });
        
        // Assert
        expect(result.shares).toBe(150);
        expect(result.costPrice).toBe(480);
        expect(result.lastUpdated).not.toBe(addedStock.lastUpdated);
        expect(mockStorageService.save).toHaveBeenCalledTimes(2); // 一次新增，一次更新
      });
      
      it('應該拒絕更新不存在的股票', async () => {
        // Act & Assert
        await expect(
          stockManager.updateStock('non-existent-id', { shares: 100 })
        ).rejects.toThrow(StockError);
      });
      
      it('應該驗證更新的資料', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const addedStock = await stockManager.addStock(stockData);
        
        // Act & Assert
        await expect(
          stockManager.updateStock(addedStock.id, { shares: -100 })
        ).rejects.toThrow(ValidationError);
      });
    });
    
    describe('deleteStock - 刪除股票', () => {
      it('應該成功刪除存在的股票', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const addedStock = await stockManager.addStock(stockData);
        
        // Act
        stockManager.deleteStock(addedStock.id);
        
        // Assert
        const result = stockManager.getStock(addedStock.id);
        expect(result).toBeNull();
        expect(mockStorageService.save).toHaveBeenCalledTimes(2); // 一次新增，一次刪除
      });
      
      it('應該拒絕刪除不存在的股票', () => {
        // Act & Assert
        expect(() => {
          stockManager.deleteStock('non-existent-id');
        }).toThrow(StockError);
      });
    });
  });
  
  describe('股價更新', () => {
    describe('updateStockPrice - 更新單一股票股價', () => {
      it('應該成功更新股票股價', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const addedStock = await stockManager.addStock(stockData);
        
        mockApiService.getStockPrice.mockResolvedValue({
          price: 580,
          source: 'TWSE'
        });
        
        // Act
        const result = await stockManager.updateStockPrice(addedStock.id);
        
        // Assert
        expect(result.currentPrice).toBe(580);
        expect(result.dataSource).toBe('TWSE');
        expect(result.lastUpdated).not.toBe(addedStock.lastUpdated);
        expect(mockApiService.getStockPrice).toHaveBeenCalledWith('2330');
      });
      
      it('應該拒絕更新不存在的股票', async () => {
        // Act & Assert
        await expect(
          stockManager.updateStockPrice('non-existent-id')
        ).rejects.toThrow(StockError);
      });
      
      it('應該處理 API 錯誤', async () => {
        // Arrange
        const stockData = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const addedStock = await stockManager.addStock(stockData);
        
        mockApiService.getStockPrice.mockRejectedValue(
          new Error('API 連線失敗')
        );
        
        // Act & Assert
        await expect(
          stockManager.updateStockPrice(addedStock.id)
        ).rejects.toThrow(StockError);
      });
    });
    
    describe('updateAllPrices - 批次更新所有股價', () => {
      it('應該成功更新所有股票股價', async () => {
        // Arrange
        const stock1 = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const stock2 = {
          code: '2317',
          name: '鴻海',
          shares: 200,
          costPrice: 100,
          currentPrice: 110,
          purchaseDate: '2024-01-20',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        await stockManager.addStock(stock1);
        await stockManager.addStock(stock2);
        
        mockApiService.getStockPrice
          .mockResolvedValueOnce({ price: 580, source: 'TWSE' })
          .mockResolvedValueOnce({ price: 115, source: 'TWSE' });
        
        // Act
        const result = await stockManager.updateAllPrices();
        
        // Assert
        expect(result.total).toBe(2);
        expect(result.success).toBe(2);
        expect(result.failed).toBe(0);
        expect(result.results).toHaveLength(2);
        expect(result.results[0].success).toBe(true);
        expect(result.results[1].success).toBe(true);
      });
      
      it('應該處理部分失敗的情況', async () => {
        // Arrange
        const stock1 = {
          code: '2330',
          name: '台積電',
          shares: 100,
          costPrice: 500,
          currentPrice: 550,
          purchaseDate: '2024-01-15',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        const stock2 = {
          code: '2317',
          name: '鴻海',
          shares: 200,
          costPrice: 100,
          currentPrice: 110,
          purchaseDate: '2024-01-20',
          accountId: 'account-1',
          dataSource: 'TWSE' as const
        };
        
        await stockManager.addStock(stock1);
        await stockManager.addStock(stock2);
        
        mockApiService.getStockPrice
          .mockResolvedValueOnce({ price: 580, source: 'TWSE' })
          .mockRejectedValueOnce(new Error('API 連線失敗'));
        
        // Act
        const result = await stockManager.updateAllPrices();
        
        // Assert
        expect(result.total).toBe(2);
        expect(result.success).toBe(1);
        expect(result.failed).toBe(1);
        expect(result.results[0].success).toBe(true);
        expect(result.results[1].success).toBe(false);
        expect(result.results[1].error).toBeDefined();
      });
      
      it('應該返回空結果當沒有股票時', async () => {
        // Act
        const result = await stockManager.updateAllPrices();
        
        // Assert
        expect(result.total).toBe(0);
        expect(result.success).toBe(0);
        expect(result.failed).toBe(0);
        expect(result.results).toEqual([]);
      });
    });
  });
  
  describe('錯誤處理', () => {
    it('應該處理儲存失敗的情況', async () => {
      // Arrange
      mockStorageService.save.mockImplementation(() => {
        throw new Error('儲存空間不足');
      });
      
      const stockData = {
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: 'account-1',
        dataSource: 'TWSE' as const
      };
      
      // Act & Assert
      await expect(stockManager.addStock(stockData)).rejects.toThrow(StockError);
    });
    
    it('應該處理載入資料失敗的情況', () => {
      // Arrange
      mockStorageService.load.mockImplementation(() => {
        throw new Error('資料解析失敗');
      });
      
      // Act - 建立新的 StockManager 會觸發載入
      const newManager = new StockManager(mockApiService, mockStorageService);
      
      // Assert - 應該從空白狀態開始
      const stocks = newManager.getAllStocks();
      expect(stocks).toEqual([]);
    });
    
    it('應該處理載入損壞的資料', () => {
      // Arrange
      mockStorageService.load.mockReturnValue({
        version: '1.3.0',
        accounts: [],
        stocks: null as any, // 損壞的資料
        dividends: [],
        settings: {
          privacyMode: false,
          darkMode: false,
          autoUpdate: false,
          updateInterval: 300000,
          cloudSync: { enabled: false }
        },
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      });
      
      // Act - 建立新的 StockManager 會觸發載入
      const newManager = new StockManager(mockApiService, mockStorageService);
      
      // Assert - 應該從空白狀態開始
      const stocks = newManager.getAllStocks();
      expect(stocks).toEqual([]);
    });
  });
  
  describe('資料持久化', () => {
    it('應該在初始化時載入現有資料', () => {
      // Arrange
      const existingData = {
        version: '1.3.0',
        accounts: [],
        stocks: [
          {
            id: 'stock-1',
            code: '2330',
            name: '台積電',
            shares: 100,
            costPrice: 500,
            currentPrice: 550,
            purchaseDate: '2024-01-15T00:00:00.000Z',
            accountId: 'account-1',
            lastUpdated: '2024-01-20T10:00:00.000Z',
            dataSource: 'TWSE' as const
          }
        ],
        dividends: [],
        settings: {
          privacyMode: false,
          darkMode: false,
          autoUpdate: false,
          updateInterval: 300000,
          cloudSync: { enabled: false }
        },
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };
      
      mockStorageService.load.mockReturnValue(existingData);
      
      // Act
      const newManager = new StockManager(mockApiService, mockStorageService);
      
      // Assert
      const stocks = newManager.getAllStocks();
      expect(stocks).toHaveLength(1);
      expect(stocks[0].code).toBe('2330');
    });
    
    it('應該在每次修改後儲存資料', async () => {
      // Arrange
      const stockData = {
        code: '2330',
        name: '台積電',
        shares: 100,
        costPrice: 500,
        currentPrice: 550,
        purchaseDate: '2024-01-15',
        accountId: 'account-1',
        dataSource: 'TWSE' as const
      };
      
      // Act
      await stockManager.addStock(stockData);
      
      // Assert
      expect(mockStorageService.save).toHaveBeenCalled();
      const savedData = mockStorageService.save.mock.calls[0][0];
      expect(savedData.stocks).toHaveLength(1);
      expect(savedData.stocks[0].code).toBe('2330');
    });
  });
});
