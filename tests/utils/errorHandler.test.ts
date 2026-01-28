/**
 * 錯誤處理工具測試
 * 測試 errorHandler.ts 中的所有功能
 */

import {
  createErrorLog,
  logError,
  handleError,
  ErrorLog,
} from '../../src/utils/errorHandler';
import {
  StockError,
  ApiError,
  ValidationError,
  StorageError,
} from '../../src/types/Errors';

describe('errorHandler', () => {
  // 模擬 console 方法以避免測試輸出污染
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  describe('createErrorLog', () => {
    test('應該為標準 Error 建立完整的錯誤日誌', () => {
      const error = new Error('測試錯誤');
      const errorLog = createErrorLog(error);

      expect(errorLog).toHaveProperty('timestamp');
      expect(errorLog).toHaveProperty('type', 'Error');
      expect(errorLog).toHaveProperty('message', '測試錯誤');
      expect(errorLog).toHaveProperty('stack');
      expect(errorLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601 格式
    });

    test('應該為 StockError 建立包含錯誤代碼的日誌', () => {
      const error = new StockError('股票錯誤', 'STOCK_001');
      const errorLog = createErrorLog(error);

      expect(errorLog.type).toBe('StockError');
      expect(errorLog.message).toBe('股票錯誤');
      expect(errorLog.code).toBe('STOCK_001');
    });

    test('應該為 ApiError 建立包含狀態碼的日誌', () => {
      const error = new ApiError('API 請求失敗', 404);
      const errorLog = createErrorLog(error);

      expect(errorLog.type).toBe('ApiError');
      expect(errorLog.message).toBe('API 請求失敗');
      expect(errorLog.code).toBe('API_ERROR');
      expect(errorLog.statusCode).toBe(404);
    });

    test('應該為 ValidationError 建立包含欄位名稱的日誌', () => {
      const error = new ValidationError('股票代碼格式不正確', 'stockCode');
      const errorLog = createErrorLog(error);

      expect(errorLog.type).toBe('ValidationError');
      expect(errorLog.message).toBe('股票代碼格式不正確');
      expect(errorLog.code).toBe('VALIDATION_ERROR');
      expect(errorLog.field).toBe('stockCode');
    });

    test('應該為 StorageError 建立日誌', () => {
      const error = new StorageError('儲存空間不足');
      const errorLog = createErrorLog(error);

      expect(errorLog.type).toBe('StorageError');
      expect(errorLog.message).toBe('儲存空間不足');
      expect(errorLog.code).toBe('STORAGE_ERROR');
    });

    test('應該處理字串錯誤', () => {
      const errorLog = createErrorLog('簡單的錯誤訊息');

      expect(errorLog.type).toBe('Error');
      expect(errorLog.message).toBe('簡單的錯誤訊息');
    });

    test('應該處理未知類型的錯誤', () => {
      const errorLog = createErrorLog({ custom: 'error' });

      expect(errorLog.type).toBe('Error');
      expect(errorLog.message).toContain('custom');
    });

    test('應該包含上下文資訊', () => {
      const error = new Error('測試錯誤');
      const context = { userId: '123', action: 'addStock' };
      const errorLog = createErrorLog(error, context);

      expect(errorLog.context).toEqual(context);
    });
  });

  describe('logError', () => {
    test('應該記錄錯誤日誌', () => {
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'Error',
        message: '測試錯誤',
        stack: 'Error: 測試錯誤\n    at ...',
      };

      logError(errorLog);

      // 驗證 console.error 被呼叫
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('應該記錄包含錯誤代碼的日誌', () => {
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'StockError',
        message: '股票錯誤',
        code: 'STOCK_001',
      };

      logError(errorLog);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('handleError', () => {
    test('應該處理錯誤並回傳錯誤日誌', () => {
      const error = new Error('測試錯誤');
      const errorLog = handleError(error, { action: 'test' }, false);

      expect(errorLog).toHaveProperty('timestamp');
      expect(errorLog).toHaveProperty('type', 'Error');
      expect(errorLog).toHaveProperty('message', '測試錯誤');
      expect(errorLog.context).toEqual({ action: 'test' });
    });

    test('應該處理 ValidationError 並產生使用者友善訊息', () => {
      const error = new ValidationError('股票代碼格式不正確', 'stockCode');
      const errorLog = handleError(error, undefined, true);

      expect(errorLog.type).toBe('ValidationError');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '使用者訊息:',
        expect.stringContaining('輸入驗證失敗')
      );
    });

    test('應該處理 ApiError 並產生使用者友善訊息', () => {
      const error = new ApiError('找不到資源', 404);
      const errorLog = handleError(error, undefined, true);

      expect(errorLog.type).toBe('ApiError');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '使用者訊息:',
        expect.stringContaining('找不到股票資訊')
      );
    });

    test('應該處理 StorageError', () => {
      const error = new StorageError('儲存空間不足');
      const errorLog = handleError(error, undefined, false);

      expect(errorLog.type).toBe('StorageError');
      expect(errorLog.message).toBe('儲存空間不足');
    });
  });

  describe('錯誤日誌完整性', () => {
    test('所有錯誤日誌都應該包含必要欄位', () => {
      const errors = [
        new Error('標準錯誤'),
        new StockError('股票錯誤', 'STOCK_001'),
        new ApiError('API 錯誤', 500),
        new ValidationError('驗證錯誤', 'field'),
        new StorageError('儲存錯誤'),
      ];

      errors.forEach((error) => {
        const errorLog = createErrorLog(error);

        // 驗證必要欄位存在
        expect(errorLog).toHaveProperty('timestamp');
        expect(errorLog).toHaveProperty('type');
        expect(errorLog).toHaveProperty('message');

        // 驗證時間戳記格式
        expect(errorLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);

        // 驗證錯誤類型不為空
        expect(errorLog.type).toBeTruthy();

        // 驗證錯誤訊息不為空
        expect(errorLog.message).toBeTruthy();
      });
    });
  });
});
