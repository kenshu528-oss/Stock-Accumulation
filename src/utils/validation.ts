/**
 * 存股紀錄系統 - 資料驗證工具
 * 
 * 提供各種資料驗證函數，確保資料完整性和正確性
 */

import { StockRecord, DividendRecord, PortfolioData } from '../types/interfaces.js';
// Account 型別暫時未使用，保留供未來功能擴展

// 驗證結果介面
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 驗證股票代碼格式
 */
export function validateStockCode(code: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!code || typeof code !== 'string') {
    result.isValid = false;
    result.errors.push('股票代碼不能為空');
    return result;
  }

  const trimmedCode = code.trim().toUpperCase();
  
  // 台股代碼格式驗證
  const taiwanStockPattern = /^[0-9]{4}[A-Z]?$|^00[0-9]{3}[A-Z]?$/;
  
  if (!taiwanStockPattern.test(trimmedCode)) {
    result.isValid = false;
    result.errors.push('股票代碼格式不正確（應為4位數字或ETF格式）');
  }

  if (trimmedCode.length < 4 || trimmedCode.length > 6) {
    result.isValid = false;
    result.errors.push('股票代碼長度應為4-6個字元');
  }

  return result;
}

/**
 * 驗證股票記錄
 */
export function validateStockRecord(stock: Partial<StockRecord>): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // 必填欄位檢查
  if (!stock.code) {
    result.errors.push('股票代碼為必填欄位');
  } else {
    const codeValidation = validateStockCode(stock.code);
    if (!codeValidation.isValid) {
      result.errors.push(...codeValidation.errors);
    }
  }

  if (!stock.name || stock.name.trim().length === 0) {
    result.errors.push('股票名稱為必填欄位');
  }

  if (!stock.shares || stock.shares <= 0) {
    result.errors.push('持股數量必須大於0');
  }

  if (!stock.costPrice || stock.costPrice <= 0) {
    result.errors.push('成本價必須大於0');
  }

  if (!stock.purchaseDate) {
    result.errors.push('購買日期為必填欄位');
  } else {
    const purchaseDate = new Date(stock.purchaseDate);
    const today = new Date();
    if (purchaseDate > today) {
      result.errors.push('購買日期不能是未來日期');
    }
  }

  if (!stock.account || stock.account.trim().length === 0) {
    result.errors.push('帳戶名稱為必填欄位');
  }

  // 數值範圍檢查
  if (stock.shares && stock.shares > 1000000) {
    result.warnings.push('持股數量異常大，請確認是否正確');
  }

  if (stock.costPrice && stock.costPrice > 10000) {
    result.warnings.push('成本價異常高，請確認是否正確');
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * 驗證股息記錄
 */
export function validateDividendRecord(dividend: Partial<DividendRecord>): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!dividend.date) {
    result.errors.push('除息日期為必填欄位');
  } else {
    const dividendDate = new Date(dividend.date);
    const today = new Date();
    if (dividendDate > today) {
      result.errors.push('除息日期不能是未來日期');
    }
  }

  if (!dividend.type || !['cash', 'stock', 'both'].includes(dividend.type)) {
    result.errors.push('股息類型必須為現金、股票或混合');
  }

  if (!dividend.perShare || dividend.perShare <= 0) {
    result.errors.push('每股股息必須大於0');
  }

  if (!dividend.shares || dividend.shares <= 0) {
    result.errors.push('持股數量必須大於0');
  }

  if (dividend.taxRate !== undefined && (dividend.taxRate < 0 || dividend.taxRate > 100)) {
    result.errors.push('扣稅率必須在0-100%之間');
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * 驗證帳戶名稱
 */
export function validateAccountName(name: string, existingAccounts: string[] = []): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!name || typeof name !== 'string') {
    result.isValid = false;
    result.errors.push('帳戶名稱不能為空');
    return result;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    result.isValid = false;
    result.errors.push('帳戶名稱不能為空白');
  }

  if (trimmedName.length > 50) {
    result.isValid = false;
    result.errors.push('帳戶名稱不能超過50個字元');
  }

  // 檢查特殊字元
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(trimmedName)) {
    result.isValid = false;
    result.errors.push('帳戶名稱不能包含特殊字元 < > : " / \\ | ? *');
  }

  // 檢查重複名稱
  if (existingAccounts.includes(trimmedName)) {
    result.isValid = false;
    result.errors.push('帳戶名稱已存在');
  }

  return result;
}

/**
 * 驗證投資組合資料完整性
 */
export function validatePortfolioData(data: Partial<PortfolioData>): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!data.stocks || !Array.isArray(data.stocks)) {
    result.errors.push('股票清單格式不正確');
  } else {
    // 驗證每個股票記錄
    data.stocks.forEach((stock, index) => {
      const stockValidation = validateStockRecord(stock);
      if (!stockValidation.isValid) {
        result.errors.push(`股票記錄 ${index + 1}: ${stockValidation.errors.join(', ')}`);
      }
    });
  }

  if (!data.accounts || !Array.isArray(data.accounts)) {
    result.errors.push('帳戶清單格式不正確');
  } else if (data.accounts.length === 0) {
    result.errors.push('至少需要一個帳戶');
  }

  if (!data.currentAccount || !data.accounts?.includes(data.currentAccount)) {
    result.errors.push('當前帳戶必須存在於帳戶清單中');
  }

  if (!data.version) {
    result.warnings.push('缺少版本資訊');
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * 驗證數值範圍
 */
export function validateNumberRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (typeof value !== 'number' || isNaN(value)) {
    result.isValid = false;
    result.errors.push(`${fieldName}必須是有效數字`);
    return result;
  }

  if (value < min) {
    result.isValid = false;
    result.errors.push(`${fieldName}不能小於${min}`);
  }

  if (value > max) {
    result.isValid = false;
    result.errors.push(`${fieldName}不能大於${max}`);
  }

  return result;
}

/**
 * 驗證日期格式
 */
export function validateDate(dateString: string, fieldName: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!dateString) {
    result.isValid = false;
    result.errors.push(`${fieldName}為必填欄位`);
    return result;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    result.isValid = false;
    result.errors.push(`${fieldName}格式不正確`);
  }

  return result;
}

/**
 * 清理和標準化股票代碼
 */
export function normalizeStockCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }
  return code.trim().toUpperCase();
}

/**
 * 清理和標準化帳戶名稱
 */
export function normalizeAccountName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  return name.trim();
}