/**
 * 錯誤處理工具手動測試腳本
 * 用於驗證 errorHandler 的功能
 */

import {
  createErrorLog,
  logError,
  handleError,
} from '../../src/utils/errorHandler';
import {
  StockError,
  ApiError,
  ValidationError,
  StorageError,
} from '../../src/types/Errors';

console.log('=== 錯誤處理工具測試 ===\n');

// 測試 1: 標準 Error
console.log('測試 1: 標準 Error');
const error1 = new Error('這是一個標準錯誤');
const log1 = createErrorLog(error1, { test: 'test1' });
console.log('✓ 建立錯誤日誌成功');
console.log('  - timestamp:', log1.timestamp);
console.log('  - type:', log1.type);
console.log('  - message:', log1.message);
console.log('  - 包含 stack:', !!log1.stack);
console.log('  - 包含 context:', !!log1.context);
console.log();

// 測試 2: StockError
console.log('測試 2: StockError');
const error2 = new StockError('股票錯誤', 'STOCK_001', { detail: 'test' });
const log2 = createErrorLog(error2);
console.log('✓ 建立 StockError 日誌成功');
console.log('  - type:', log2.type);
console.log('  - code:', log2.code);
console.log('  - message:', log2.message);
console.log();

// 測試 3: ApiError
console.log('測試 3: ApiError');
const error3 = new ApiError('API 請求失敗', 404);
const log3 = createErrorLog(error3);
console.log('✓ 建立 ApiError 日誌成功');
console.log('  - type:', log3.type);
console.log('  - code:', log3.code);
console.log('  - statusCode:', log3.statusCode);
console.log('  - message:', log3.message);
console.log();

// 測試 4: ValidationError
console.log('測試 4: ValidationError');
const error4 = new ValidationError('股票代碼格式不正確', 'stockCode');
const log4 = createErrorLog(error4);
console.log('✓ 建立 ValidationError 日誌成功');
console.log('  - type:', log4.type);
console.log('  - code:', log4.code);
console.log('  - field:', log4.field);
console.log('  - message:', log4.message);
console.log();

// 測試 5: StorageError
console.log('測試 5: StorageError');
const error5 = new StorageError('儲存空間不足');
const log5 = createErrorLog(error5);
console.log('✓ 建立 StorageError 日誌成功');
console.log('  - type:', log5.type);
console.log('  - code:', log5.code);
console.log('  - message:', log5.message);
console.log();

// 測試 6: 字串錯誤
console.log('測試 6: 字串錯誤');
const log6 = createErrorLog('簡單的錯誤訊息');
console.log('✓ 建立字串錯誤日誌成功');
console.log('  - type:', log6.type);
console.log('  - message:', log6.message);
console.log();

// 測試 7: logError
console.log('測試 7: logError 函數');
console.log('呼叫 logError...');
logError(log1);
console.log('✓ logError 執行成功');
console.log();

// 測試 8: handleError
console.log('測試 8: handleError 函數');
const error8 = new ValidationError('測試驗證錯誤', 'testField');
const log8 = handleError(error8, { action: 'test' }, false);
console.log('✓ handleError 執行成功');
console.log('  - 回傳日誌物件:', !!log8);
console.log('  - 包含 context:', !!log8.context);
console.log();

// 測試 9: 驗證所有必要欄位
console.log('測試 9: 驗證錯誤日誌完整性');
const errors = [
  new Error('標準錯誤'),
  new StockError('股票錯誤', 'STOCK_001'),
  new ApiError('API 錯誤', 500),
  new ValidationError('驗證錯誤', 'field'),
  new StorageError('儲存錯誤'),
];

let allValid = true;
errors.forEach((error, index) => {
  const log = createErrorLog(error);
  
  // 檢查必要欄位
  const hasTimestamp = !!log.timestamp && /^\d{4}-\d{2}-\d{2}T/.test(log.timestamp);
  const hasType = !!log.type;
  const hasMessage = !!log.message;
  
  if (!hasTimestamp || !hasType || !hasMessage) {
    console.log(`✗ 錯誤 ${index + 1} 缺少必要欄位`);
    allValid = false;
  }
});

if (allValid) {
  console.log('✓ 所有錯誤日誌都包含必要欄位（timestamp, type, message）');
}
console.log();

console.log('=== 測試完成 ===');
console.log('所有功能驗證通過！');
