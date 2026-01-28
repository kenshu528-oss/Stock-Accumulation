/**
 * 驗證工具函數單元測試
 * 測試 validators.ts 中的所有驗證函數
 * 
 * Requirements: 3.3
 */

import {
  validateStockCode,
  validateAmount,
  validateDate,
  validateShares,
  // ValidationResult
  // ValidationResult 暫時未使用
} from '../src/utils/validators';

describe('驗證工具函數', () => {
  describe('validateStockCode', () => {
    describe('有效的股票代碼', () => {
      test('應該接受 4 位數字代碼（上市股票）', () => {
        const result = validateStockCode('2330');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('應該接受 5 位數字代碼（興櫃股票）', () => {
        const result = validateStockCode('00878');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('應該接受 6 位數字代碼（ETF）', () => {
        const result = validateStockCode('006208');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('應該接受英數字混合代碼', () => {
        const validCodes = ['2330A', 'AAPL', 'TSLA', '0050B'];
        validCodes.forEach(code => {
          const result = validateStockCode(code);
          expect(result.valid).toBe(true);
        });
      });

      test('應該自動去除前後空白', () => {
        const result = validateStockCode('  2330  ');
        expect(result.valid).toBe(true);
      });
    });

    describe('無效的股票代碼', () => {
      test('應該拒絕空字串', () => {
        const result = validateStockCode('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('股票代碼不能為空');
      });

      test('應該拒絕純空白字串', () => {
        const result = validateStockCode('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('股票代碼不能為空');
      });

      test('應該拒絕 null 或 undefined', () => {
        const result1 = validateStockCode(null as any);
        const result2 = validateStockCode(undefined as any);
        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
      });

      test('應該拒絕非字串類型', () => {
        const result1 = validateStockCode(2330 as any);
        const result2 = validateStockCode({} as any);
        const result3 = validateStockCode([] as any);
        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
        expect(result3.valid).toBe(false);
      });

      test('應該拒絕太短的代碼（少於 4 位）', () => {
        const result = validateStockCode('123');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('格式錯誤');
      });

      test('應該拒絕太長的代碼（超過 6 位）', () => {
        const result = validateStockCode('1234567');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('格式錯誤');
      });

      test('應該拒絕包含特殊字元的代碼', () => {
        const invalidCodes = ['23@0', '23-30', '23.30', '23 30', '23_30'];
        invalidCodes.forEach(code => {
          const result = validateStockCode(code);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('格式錯誤');
        });
      });
    });
  });

  describe('validateAmount', () => {
    describe('有效的金額', () => {
      test('應該接受正整數', () => {
        const result = validateAmount(100);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('應該接受正小數', () => {
        const result = validateAmount(99.99);
        expect(result.valid).toBe(true);
      });

      test('應該接受很大的數字', () => {
        const result = validateAmount(1000000);
        expect(result.valid).toBe(true);
      });

      test('應該接受很小的正數', () => {
        const result = validateAmount(0.01);
        expect(result.valid).toBe(true);
      });

      test('當 allowZero 為 true 時應該接受 0', () => {
        const result = validateAmount(0, true);
        expect(result.valid).toBe(true);
      });
    });

    describe('無效的金額', () => {
      test('應該拒絕 0（預設情況）', () => {
        const result = validateAmount(0);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('金額必須大於 0');
      });

      test('應該拒絕負數', () => {
        const result = validateAmount(-100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('金額');
      });

      test('應該拒絕 NaN', () => {
        const result = validateAmount(NaN);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('金額格式錯誤');
      });

      test('應該拒絕 Infinity', () => {
        const result = validateAmount(Infinity);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('金額超出範圍');
      });

      test('應該拒絕 -Infinity', () => {
        const result = validateAmount(-Infinity);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('金額超出範圍');
      });

      test('應該拒絕非數字類型', () => {
        const result1 = validateAmount('100' as any);
        const result2 = validateAmount(null as any);
        const result3 = validateAmount(undefined as any);
        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
        expect(result3.valid).toBe(false);
      });

      test('當 allowZero 為 true 時應該拒絕負數', () => {
        const result = validateAmount(-50, true);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('金額不能為負數');
      });
    });
  });

  describe('validateDate', () => {
    describe('有效的日期', () => {
      test('應該接受 Date 物件', () => {
        const result = validateDate(new Date('2024-01-15'));
        expect(result.valid).toBe(true);
      });

      test('應該接受 ISO 日期字串', () => {
        const result = validateDate('2024-01-15');
        expect(result.valid).toBe(true);
      });

      test('應該接受時間戳記', () => {
        const result = validateDate(1705276800000);
        expect(result.valid).toBe(true);
      });

      test('應該接受各種日期格式', () => {
        const validDates = [
          '2024-01-15',
          '2024/01/15',
          'Jan 15, 2024',
          '15 Jan 2024'
        ];
        validDates.forEach(date => {
          const result = validateDate(date);
          expect(result.valid).toBe(true);
        });
      });

      test('應該接受未來日期（預設允許）', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const result = validateDate(futureDate);
        expect(result.valid).toBe(true);
      });

      test('應該接受在範圍內的日期', () => {
        const minDate = new Date('2024-01-01');
        const maxDate = new Date('2024-12-31');
        const result = validateDate('2024-06-15', { minDate, maxDate });
        expect(result.valid).toBe(true);
      });
    });

    describe('無效的日期', () => {
      test('應該拒絕空字串', () => {
        const result = validateDate('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('日期不能為空');
      });

      test('應該拒絕純空白字串', () => {
        const result = validateDate('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('日期不能為空');
      });

      test('應該拒絕無效的日期字串', () => {
        const invalidDates = ['invalid', 'not-a-date', '2024-13-01', '2024-01-32'];
        invalidDates.forEach(date => {
          const result = validateDate(date);
          expect(result.valid).toBe(false);
          expect(result.error).toBe('日期格式錯誤');
        });
      });

      test('應該拒絕非日期類型', () => {
        const result1 = validateDate({} as any);
        const result2 = validateDate([] as any);
        const result3 = validateDate(true as any);
        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
        expect(result3.valid).toBe(false);
      });

      test('當 allowFuture 為 false 時應該拒絕未來日期', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const result = validateDate(futureDate, { allowFuture: false });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('日期不能為未來日期');
      });

      test('應該拒絕早於最小日期的日期', () => {
        const minDate = new Date('2024-01-01');
        const result = validateDate('2023-12-31', { minDate });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('日期早於允許的最小日期');
      });

      test('應該拒絕晚於最大日期的日期', () => {
        const maxDate = new Date('2024-12-31');
        const result = validateDate('2025-01-01', { maxDate });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('日期晚於允許的最大日期');
      });
    });
  });

  describe('validateShares', () => {
    describe('有效的持股數', () => {
      test('應該接受正整數', () => {
        const result = validateShares(1000);
        expect(result.valid).toBe(true);
      });

      test('應該接受零股數量', () => {
        const result = validateShares(100);
        expect(result.valid).toBe(true);
      });

      test('應該接受很大的持股數', () => {
        const result = validateShares(1000000);
        expect(result.valid).toBe(true);
      });

      test('當 allowZero 為 true 時應該接受 0', () => {
        const result = validateShares(0, { allowZero: true });
        expect(result.valid).toBe(true);
      });

      test('當 requireInteger 為 false 時應該接受小數', () => {
        const result = validateShares(100.5, { requireInteger: false });
        expect(result.valid).toBe(true);
      });
    });

    describe('無效的持股數', () => {
      test('應該拒絕 0（預設情況）', () => {
        const result = validateShares(0);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('持股數必須大於 0');
      });

      test('應該拒絕負數', () => {
        const result = validateShares(-100);
        expect(result.valid).toBe(false);
      });

      test('應該拒絕小數（預設情況）', () => {
        const result = validateShares(100.5);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('持股數必須為整數');
      });

      test('應該拒絕 NaN', () => {
        const result = validateShares(NaN);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('持股數格式錯誤');
      });

      test('應該拒絕 Infinity', () => {
        const result = validateShares(Infinity);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('持股數超出範圍');
      });

      test('應該拒絕 -Infinity', () => {
        const result = validateShares(-Infinity);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('持股數超出範圍');
      });

      test('應該拒絕非數字類型', () => {
        const result1 = validateShares('1000' as any);
        const result2 = validateShares(null as any);
        const result3 = validateShares(undefined as any);
        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
        expect(result3.valid).toBe(false);
      });

      test('當 allowZero 為 true 時應該拒絕負數', () => {
        const result = validateShares(-50, { allowZero: true });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('持股數不能為負數');
      });
    });

    describe('邊界條件', () => {
      test('應該接受 1（最小正整數）', () => {
        const result = validateShares(1);
        expect(result.valid).toBe(true);
      });

      test('應該接受 Number.MAX_SAFE_INTEGER', () => {
        const result = validateShares(Number.MAX_SAFE_INTEGER);
        expect(result.valid).toBe(true);
      });

      test('應該處理接近 0 的小數', () => {
        const result = validateShares(0.0001, { requireInteger: false });
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('ValidationResult 介面', () => {
    test('成功的驗證應該只有 valid 屬性', () => {
      const result = validateAmount(100);
      expect(result).toHaveProperty('valid');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('失敗的驗證應該包含 error 訊息', () => {
      const result = validateAmount(-100);
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('error');
      expect(result.valid).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(result.error!.length).toBeGreaterThan(0);
    });
  });
});
