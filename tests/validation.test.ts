/**
 * 資料驗證功能測試
 */

import { 
  validateStockCode, 
  validateStockRecord, 
  validateAccountName,
  normalizeStockCode,
  normalizeAccountName
} from '../src/utils/validation.js';
import { testUtils } from './setup.js';

describe('資料驗證功能', () => {
  describe('股票代碼驗證', () => {
    test('應該接受有效的台股代碼', () => {
      const validCodes = ['2330', '0050', '00878', '2454', '1101'];
      
      validCodes.forEach(code => {
        const result = validateStockCode(code);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('應該拒絕無效的股票代碼', () => {
      const invalidCodes = ['', '123', '12345', 'AAPL', 'abc'];
      
      invalidCodes.forEach(code => {
        const result = validateStockCode(code);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('應該正確標準化股票代碼', () => {
      expect(normalizeStockCode('  2330  ')).toBe('2330');
      expect(normalizeStockCode('tsmc')).toBe('TSMC');
      expect(normalizeStockCode('')).toBe('');
    });
  });

  describe('股票記錄驗證', () => {
    test('應該接受完整的股票記錄', () => {
      const validStock = testUtils.generateStockRecord();
      const result = validateStockRecord(validStock);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('應該拒絕缺少必填欄位的股票記錄', () => {
      const incompleteStock = {
        code: '2330',
        // 缺少 name, shares, costPrice 等必填欄位
      };
      
      const result = validateStockRecord(incompleteStock);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('應該拒絕無效數值的股票記錄', () => {
      const invalidStock = testUtils.generateStockRecord({
        shares: -100, // 負數股數
        costPrice: 0   // 零成本價
      });
      
      const result = validateStockRecord(invalidStock);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('帳戶名稱驗證', () => {
    test('應該接受有效的帳戶名稱', () => {
      const validNames = ['帳戶1', '券商A', 'My Account', '測試帳戶'];
      
      validNames.forEach(name => {
        const result = validateAccountName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('應該拒絕無效的帳戶名稱', () => {
      const invalidNames = ['', '   ', 'a'.repeat(51), 'test<>name'];
      
      invalidNames.forEach(name => {
        const result = validateAccountName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('應該檢測重複的帳戶名稱', () => {
      const existingAccounts = ['帳戶1', '帳戶2'];
      const result = validateAccountName('帳戶1', existingAccounts);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('帳戶名稱已存在');
    });

    test('應該正確標準化帳戶名稱', () => {
      expect(normalizeAccountName('  帳戶1  ')).toBe('帳戶1');
      expect(normalizeAccountName('')).toBe('');
    });
  });
});