/**
 * 錯誤處理工具 - v1.3.X 架構
 * 提供統一的錯誤處理、日誌記錄和錯誤報告功能
 * 
 * 主要功能：
 * - 統一錯誤處理機制
 * - 詳細的錯誤日誌記錄
 * - 開發/生產模式的不同處理策略
 * - 錯誤上下文資訊收集
 */

import { StockError, ApiError, ValidationError, StorageError } from '../types/Errors';

/**
 * 錯誤日誌物件介面
 * 包含所有必要的錯誤資訊欄位
 */
export interface ErrorLog {
  /** 時間戳記 - ISO 8601 格式 */
  timestamp: string;
  
  /** 錯誤類型 */
  type: string;
  
  /** 錯誤訊息 */
  message: string;
  
  /** 堆疊追蹤 */
  stack?: string;
  
  /** 錯誤代碼（如果是 StockError） */
  code?: string;
  
  /** HTTP 狀態碼（如果是 ApiError） */
  statusCode?: number;
  
  /** 驗證失敗的欄位（如果是 ValidationError） */
  field?: string;
  
  /** 額外的上下文資訊 */
  context?: Record<string, any>;
  
  /** 使用者代理字串 */
  userAgent?: string;
  
  /** 當前 URL */
  url?: string;
}

/**
 * 環境模式
 */
type Environment = 'development' | 'production';

/**
 * 取得當前環境模式
 * 開發模式：顯示詳細錯誤資訊
 * 生產模式：僅記錄關鍵錯誤，避免洩漏敏感資訊
 */
function getEnvironment(): Environment {
  // 檢查是否在開發模式
  // 可以透過 process.env.NODE_ENV 或 location.hostname 判斷
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    return 'development';
  }
  
  // 檢查是否在 localhost
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'development';
    }
  }
  
  return 'production';
}

/**
 * 建立錯誤日誌物件
 * 收集所有必要的錯誤資訊，包含時間戳記、錯誤類型、堆疊追蹤等
 * 
 * @param error - 錯誤物件
 * @param context - 額外的上下文資訊
 * @returns 完整的錯誤日誌物件
 * 
 * @example
 * ```typescript
 * try {
 *   // 某些操作
 * } catch (error) {
 *   const errorLog = createErrorLog(error, { userId: '123', action: 'addStock' });
 *   console.error(errorLog);
 * }
 * ```
 */
export function createErrorLog(error: Error | unknown, context?: Record<string, any>): ErrorLog {
  const timestamp = new Date().toISOString();
  
  // 基本錯誤資訊
  let errorLog: ErrorLog = {
    timestamp,
    type: 'Error',
    message: '未知錯誤',
  };
  
  // 如果是 Error 物件，提取詳細資訊
  if (error instanceof Error) {
    errorLog.message = error.message;
    errorLog.type = error.name;
    errorLog.stack = error.stack;
    
    // 如果是自訂錯誤類型，提取額外資訊
    if (error instanceof StockError) {
      errorLog.code = error.code;
      
      if (error instanceof ApiError && error.statusCode) {
        errorLog.statusCode = error.statusCode;
      }
      
      if (error instanceof ValidationError) {
        errorLog.field = error.field;
      }
    }
  } else if (typeof error === 'string') {
    // 如果是字串錯誤
    errorLog.message = error;
  } else if (error && typeof error === 'object') {
    // 如果是物件，嘗試提取訊息
    errorLog.message = JSON.stringify(error);
  }
  
  // 添加上下文資訊
  if (context) {
    errorLog.context = context;
  }
  
  // 添加瀏覽器環境資訊（僅在瀏覽器環境）
  if (typeof window !== 'undefined') {
    if (window.navigator) {
      errorLog.userAgent = window.navigator.userAgent;
    }
    if (window.location) {
      errorLog.url = window.location.href;
    }
  }
  
  return errorLog;
}

/**
 * 記錄錯誤日誌
 * 根據環境模式決定日誌的詳細程度
 * 開發模式：顯示完整的錯誤資訊
 * 生產模式：僅記錄關鍵錯誤，避免洩漏敏感資訊
 * 
 * @param errorLog - 錯誤日誌物件
 * 
 * @example
 * ```typescript
 * const errorLog = createErrorLog(error, { action: 'updatePrice' });
 * logError(errorLog);
 * ```
 */
export function logError(errorLog: ErrorLog): void {
  const env = getEnvironment();
  
  if (env === 'development') {
    // 開發模式：顯示完整的錯誤資訊
    console.group(`🔴 錯誤 [${errorLog.type}] - ${errorLog.timestamp}`);
    console.error('訊息:', errorLog.message);
    
    if (errorLog.code) {
      console.error('錯誤代碼:', errorLog.code);
    }
    
    if (errorLog.statusCode) {
      console.error('HTTP 狀態碼:', errorLog.statusCode);
    }
    
    if (errorLog.field) {
      console.error('驗證欄位:', errorLog.field);
    }
    
    if (errorLog.context) {
      console.error('上下文:', errorLog.context);
    }
    
    if (errorLog.stack) {
      console.error('堆疊追蹤:', errorLog.stack);
    }
    
    if (errorLog.url) {
      console.error('URL:', errorLog.url);
    }
    
    console.groupEnd();
  } else {
    // 生產模式：僅記錄關鍵錯誤，避免洩漏敏感資訊
    console.error(`[${errorLog.timestamp}] ${errorLog.type}: ${errorLog.message}`);
    
    // 可以在這裡添加錯誤追蹤服務的整合
    // 例如：Sentry, LogRocket, etc.
  }
}

/**
 * 統一錯誤處理函數
 * 處理錯誤、建立日誌、記錄日誌，並根據錯誤類型決定是否向使用者顯示訊息
 * 
 * @param error - 錯誤物件
 * @param context - 額外的上下文資訊
 * @param showToUser - 是否向使用者顯示錯誤訊息（預設為 true）
 * @returns 錯誤日誌物件
 * 
 * @example
 * ```typescript
 * try {
 *   await stockManager.addStock(stockData);
 * } catch (error) {
 *   handleError(error, { action: 'addStock', stockCode: '2330' });
 * }
 * ```
 */
export function handleError(
  error: Error | unknown,
  context?: Record<string, any>,
  showToUser: boolean = true
): ErrorLog {
  // 建立錯誤日誌
  const errorLog = createErrorLog(error, context);
  
  // 記錄錯誤日誌
  logError(errorLog);
  
  // 根據錯誤類型決定是否向使用者顯示訊息
  if (showToUser && typeof window !== 'undefined') {
    const userMessage = getUserFriendlyMessage(error);
    
    // 可以使用 alert 或自訂的通知系統
    // 這裡使用 console.warn 作為示範
    console.warn('使用者訊息:', userMessage);
    
    // 在實際應用中，可以使用 UI 通知系統
    // 例如：showNotification(userMessage, 'error');
  }
  
  return errorLog;
}

/**
 * 取得使用者友善的錯誤訊息
 * 將技術性錯誤轉換為使用者可理解的訊息
 * 
 * @param error - 錯誤物件
 * @returns 使用者友善的錯誤訊息
 */
function getUserFriendlyMessage(error: Error | unknown): string {
  if (error instanceof ValidationError) {
    return `輸入驗證失敗：${error.message}`;
  }
  
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      return '找不到股票資訊，請確認股票代碼是否正確';
    }
    if (error.statusCode === 429) {
      return 'API 請求過於頻繁，請稍後再試';
    }
    if (error.statusCode && error.statusCode >= 500) {
      return '伺服器錯誤，請稍後再試';
    }
    return `API 錯誤：${error.message}`;
  }
  
  if (error instanceof StorageError) {
    return `儲存錯誤：${error.message}`;
  }
  
  if (error instanceof StockError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '發生未知錯誤，請稍後再試';
}

/**
 * 錯誤處理裝飾器（用於 async 函數）
 * 自動捕獲並處理 async 函數中的錯誤
 * 
 * @param context - 錯誤上下文資訊
 * @returns 裝飾器函數
 * 
 * @example
 * ```typescript
 * class StockManager {
 *   @withErrorHandling({ component: 'StockManager', method: 'addStock' })
 *   async addStock(data: StockData) {
 *     // 實作邏輯
 *   }
 * }
 * ```
 */
export function withErrorHandling(context: Record<string, any>) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        handleError(error, {
          ...context,
          method: propertyKey,
          arguments: args,
        });
        throw error; // 重新拋出錯誤，讓呼叫者可以處理
      }
    };
    
    return descriptor;
  };
}
