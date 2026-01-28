/**
 * 格式化工具函數
 * 提供金額、日期、百分比、數字的格式化功能
 * 
 * @module formatters
 */

/**
 * 格式化金額為台幣格式
 * @param amount - 金額數值
 * @param decimals - 小數位數，預設為 2
 * @returns 格式化後的金額字串，例如 "1,234.56"
 * 
 * @example
 * formatCurrency(1234.567) // "1,234.57"
 * formatCurrency(1234.567, 0) // "1,235"
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  
  return amount.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 格式化日期為指定格式
 * @param date - 日期物件、ISO 字串或時間戳記
 * @param format - 格式類型，預設為 'YYYY-MM-DD'
 * @returns 格式化後的日期字串
 * 
 * @example
 * formatDate(new Date('2024-01-15')) // "2024-01-15"
 * formatDate('2024-01-15T10:30:00.000Z', 'YYYY-MM-DD HH:mm') // "2024-01-15 10:30"
 */
export function formatDate(
  date: Date | string | number,
  format: 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm' | 'YYYY-MM-DD HH:mm:ss' = 'YYYY-MM-DD'
): string {
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'YYYY-MM-DD HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 格式化百分比
 * @param value - 數值（0.1234 表示 12.34%）
 * @param decimals - 小數位數，預設為 2
 * @param includeSign - 是否包含正負號，預設為 false
 * @returns 格式化後的百分比字串，例如 "12.34%"
 * 
 * @example
 * formatPercent(0.1234) // "12.34%"
 * formatPercent(0.1234, 1) // "12.3%"
 * formatPercent(0.1234, 2, true) // "+12.34%"
 * formatPercent(-0.05, 2, true) // "-5.00%"
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  includeSign: boolean = false
): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.00%';
  }
  
  const percentValue = value * 100;
  const sign = includeSign && percentValue > 0 ? '+' : '';
  
  return `${sign}${percentValue.toFixed(decimals)}%`;
}

/**
 * 格式化數字（添加千分位符號）
 * @param value - 數值
 * @param decimals - 小數位數，預設為 0
 * @returns 格式化後的數字字串，例如 "1,234"
 * 
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1234.567, 2) // "1,234.57"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return value.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
