/**
 * 驗證工具函數
 * 提供股票代碼、金額、日期、持股數的驗證功能
 * 
 * @module validators
 */

/**
 * 驗證結果介面
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 驗證股票代碼
 * 台股代碼規則：
 * - 4 位數字（上市、上櫃）
 * - 5 位數字（興櫃）
 * - 6 位數字（部分 ETF）
 * 
 * @param code - 股票代碼
 * @returns 驗證結果
 * 
 * @example
 * validateStockCode('2330') // { valid: true }
 * validateStockCode('00878') // { valid: true }
 * validateStockCode('ABC') // { valid: false, error: '股票代碼格式錯誤' }
 */
export function validateStockCode(code: string): ValidationResult {
  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      error: '股票代碼不能為空'
    };
  }
  
  const trimmedCode = code.trim();
  
  if (trimmedCode.length === 0) {
    return {
      valid: false,
      error: '股票代碼不能為空'
    };
  }
  
  // 台股代碼：4-6 位數字或字母數字組合
  const codePattern = /^[A-Za-z0-9]{4,6}$/;
  
  if (!codePattern.test(trimmedCode)) {
    return {
      valid: false,
      error: '股票代碼格式錯誤（應為 4-6 位英數字）'
    };
  }
  
  return { valid: true };
}

/**
 * 驗證金額
 * 規則：
 * - 必須為數字
 * - 必須大於 0
 * - 不能為 NaN 或 Infinity
 * 
 * @param amount - 金額
 * @param allowZero - 是否允許為 0，預設為 false
 * @returns 驗證結果
 * 
 * @example
 * validateAmount(100) // { valid: true }
 * validateAmount(0) // { valid: false, error: '金額必須大於 0' }
 * validateAmount(0, true) // { valid: true }
 * validateAmount(-50) // { valid: false, error: '金額必須大於 0' }
 */
export function validateAmount(amount: number, allowZero: boolean = false): ValidationResult {
  if (typeof amount !== 'number') {
    return {
      valid: false,
      error: '金額必須為數字'
    };
  }
  
  if (isNaN(amount)) {
    return {
      valid: false,
      error: '金額格式錯誤'
    };
  }
  
  if (!isFinite(amount)) {
    return {
      valid: false,
      error: '金額超出範圍'
    };
  }
  
  if (allowZero) {
    if (amount < 0) {
      return {
        valid: false,
        error: '金額不能為負數'
      };
    }
  } else {
    if (amount <= 0) {
      return {
        valid: false,
        error: '金額必須大於 0'
      };
    }
  }
  
  return { valid: true };
}

/**
 * 驗證日期
 * 規則：
 * - 必須為有效的日期格式
 * - 可選：不能為未來日期
 * - 可選：必須在指定範圍內
 * 
 * @param date - 日期（Date 物件、ISO 字串或時間戳記）
 * @param options - 驗證選項
 * @returns 驗證結果
 * 
 * @example
 * validateDate('2024-01-15') // { valid: true }
 * validateDate('invalid') // { valid: false, error: '日期格式錯誤' }
 * validateDate('2025-12-31', { allowFuture: false }) // { valid: false, error: '日期不能為未來日期' }
 */
export function validateDate(
  date: Date | string | number,
  options: {
    allowFuture?: boolean;
    minDate?: Date;
    maxDate?: Date;
  } = {}
): ValidationResult {
  const { allowFuture = true, minDate, maxDate } = options;
  
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    if (!date.trim()) {
      return {
        valid: false,
        error: '日期不能為空'
      };
    }
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return {
      valid: false,
      error: '日期格式錯誤'
    };
  }
  
  if (isNaN(dateObj.getTime())) {
    return {
      valid: false,
      error: '日期格式錯誤'
    };
  }
  
  const now = new Date();
  
  if (!allowFuture && dateObj > now) {
    return {
      valid: false,
      error: '日期不能為未來日期'
    };
  }
  
  if (minDate && dateObj < minDate) {
    return {
      valid: false,
      error: '日期早於允許的最小日期'
    };
  }
  
  if (maxDate && dateObj > maxDate) {
    return {
      valid: false,
      error: '日期晚於允許的最大日期'
    };
  }
  
  return { valid: true };
}

/**
 * 驗證持股數
 * 規則：
 * - 必須為整數
 * - 必須大於 0
 * - 台股通常以 1000 股為一張，但零股交易可以是任意正整數
 * 
 * @param shares - 持股數
 * @param options - 驗證選項
 * @returns 驗證結果
 * 
 * @example
 * validateShares(1000) // { valid: true }
 * validateShares(100) // { valid: true }
 * validateShares(0) // { valid: false, error: '持股數必須大於 0' }
 * validateShares(1.5) // { valid: false, error: '持股數必須為整數' }
 */
export function validateShares(
  shares: number,
  options: {
    allowZero?: boolean;
    requireInteger?: boolean;
  } = {}
): ValidationResult {
  const { allowZero = false, requireInteger = true } = options;
  
  if (typeof shares !== 'number') {
    return {
      valid: false,
      error: '持股數必須為數字'
    };
  }
  
  if (isNaN(shares)) {
    return {
      valid: false,
      error: '持股數格式錯誤'
    };
  }
  
  if (!isFinite(shares)) {
    return {
      valid: false,
      error: '持股數超出範圍'
    };
  }
  
  if (requireInteger && !Number.isInteger(shares)) {
    return {
      valid: false,
      error: '持股數必須為整數'
    };
  }
  
  if (allowZero) {
    if (shares < 0) {
      return {
        valid: false,
        error: '持股數不能為負數'
      };
    }
  } else {
    if (shares <= 0) {
      return {
        valid: false,
        error: '持股數必須大於 0'
      };
    }
  }
  
  return { valid: true };
}
