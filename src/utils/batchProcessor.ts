/**
 * 批次處理與並發控制工具
 * Batch Processing and Concurrency Control Utilities
 * 
 * 主要功能：
 * - 批次處理：將大量任務分批執行
 * - 並發限制：控制同時執行的任務數量（最多 5 個）
 * - 防抖動：延遲執行頻繁觸發的函數
 * 
 * @module batchProcessor
 */

/**
 * 批次處理選項
 */
export interface BatchProcessOptions<T, R> {
  /** 批次大小（每批處理的項目數量） */
  batchSize?: number;
  /** 並發限制（同時執行的任務數量，預設 5） */
  concurrency?: number;
  /** 批次之間的延遲時間（毫秒） */
  delayBetweenBatches?: number;
  /** 處理函數 - 接收單一項目並回傳 Promise */
  processor: (item: T) => Promise<R>;
  /** 錯誤處理策略：'continue' 繼續處理其他項目，'stop' 停止所有處理 */
  onError?: 'continue' | 'stop';
}

/**
 * 批次處理結果
 */
export interface BatchProcessResult<R> {
  /** 成功處理的結果 */
  successful: R[];
  /** 失敗的項目及其錯誤 */
  failed: Array<{ index: number; error: Error }>;
  /** 總處理數量 */
  total: number;
  /** 成功數量 */
  successCount: number;
  /** 失敗數量 */
  failureCount: number;
}

/**
 * 批次處理函數 - 將大量任務分批執行，並控制並發數量
 * 
 * 使用場景：
 * - 批次更新股價（避免同時發送過多 API 請求）
 * - 批次處理大量資料
 * - 需要控制並發數量的任何操作
 * 
 * @param items 要處理的項目陣列
 * @param options 批次處理選項
 * @returns 批次處理結果
 * 
 * @example
 * ```typescript
 * const stockCodes = ['2330', '2317', '2454', ...];
 * const result = await processBatch(stockCodes, {
 *   batchSize: 10,
 *   concurrency: 5,
 *   processor: async (code) => await fetchStockPrice(code),
 *   onError: 'continue'
 * });
 * console.log(`成功: ${result.successCount}, 失敗: ${result.failureCount}`);
 * ```
 */
export async function processBatch<T, R>(
  items: T[],
  options: BatchProcessOptions<T, R>
): Promise<BatchProcessResult<R>> {
  const {
    batchSize = 10,
    concurrency = 5,
    delayBetweenBatches = 0,
    processor,
    onError = 'continue'
  } = options;

  const successful: R[] = [];
  const failed: Array<{ index: number; error: Error }> = [];
  
  // 將項目分批
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // 處理每一批
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchStartIndex = batchIndex * batchSize;

    try {
      // 使用並發限制處理當前批次
      const batchResults = await processWithConcurrencyLimit(
        batch,
        processor,
        concurrency,
        batchStartIndex
      );

      // 收集結果
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value as R);
        } else {
          failed.push({
            index: result.index,
            error: result.reason instanceof Error 
              ? result.reason 
              : new Error(String(result.reason))
          });
        }
      });

    } catch (error) {
      // 如果錯誤策略是 'stop'，則停止處理
      if (onError === 'stop') {
        // 記錄剩餘未處理的項目為失敗
        for (let i = batchStartIndex; i < items.length; i++) {
          failed.push({
            index: i,
            error: new Error('批次處理已停止')
          });
        }
        break;
      }
    }

    // 批次之間的延遲（避免 API 限流）
    if (delayBetweenBatches > 0 && batchIndex < batches.length - 1) {
      await delay(delayBetweenBatches);
    }
  }

  return {
    successful,
    failed,
    total: items.length,
    successCount: successful.length,
    failureCount: failed.length
  };
}

/**
 * 並發限制處理結果
 */
interface ConcurrencyResult<R> {
  status: 'fulfilled' | 'rejected';
  value?: R;
  reason?: any;
  index: number;
}

/**
 * 使用並發限制處理項目
 * 確保同時執行的任務數量不超過指定限制
 * 
 * @param items 要處理的項目
 * @param processor 處理函數
 * @param concurrency 並發限制
 * @param startIndex 起始索引（用於錯誤報告）
 * @returns 處理結果陣列
 */
async function processWithConcurrencyLimit<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number,
  startIndex: number = 0
): Promise<ConcurrencyResult<R>[]> {
  const results: ConcurrencyResult<R>[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const globalIndex = startIndex + i;

    // 建立處理 Promise
    const promise = processor(item)
      .then((value) => {
        results[i] = { status: 'fulfilled', value, index: globalIndex };
      })
      .catch((reason) => {
        results[i] = { status: 'rejected', reason, index: globalIndex };
      })
      .then(() => {
        // 完成後從執行中的陣列移除
        const index = executing.indexOf(promise);
        if (index !== -1) {
          executing.splice(index, 1);
        }
      });

    executing.push(promise);

    // 如果達到並發限制，等待至少一個完成
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  // 等待所有剩餘的任務完成
  await Promise.all(executing);

  return results;
}

/**
 * 延遲函數
 * @param ms 延遲毫秒數
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 防抖動函數 - 延遲執行頻繁觸發的函數
 * 
 * 使用場景：
 * - 搜尋輸入框（等待使用者停止輸入後才搜尋）
 * - 視窗大小調整事件
 * - 自動儲存功能
 * 
 * @param func 要執行的函數
 * @param wait 等待時間（毫秒）
 * @param immediate 是否立即執行第一次呼叫
 * @returns 防抖動後的函數
 * 
 * @example
 * ```typescript
 * const saveData = debounce(() => {
 *   storageService.save(data);
 * }, 500);
 * 
 * // 頻繁呼叫，但只會在最後一次呼叫後 500ms 執行
 * saveData();
 * saveData();
 * saveData();
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    const later = () => {
      timeoutId = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && timeoutId === null;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * 節流函數 - 限制函數執行頻率
 * 
 * 與防抖動的區別：
 * - 防抖動：等待停止觸發後才執行
 * - 節流：固定時間間隔內最多執行一次
 * 
 * 使用場景：
 * - 滾動事件處理
 * - 滑鼠移動事件
 * - API 請求頻率限制
 * 
 * @param func 要執行的函數
 * @param limit 時間限制（毫秒）
 * @returns 節流後的函數
 * 
 * @example
 * ```typescript
 * const handleScroll = throttle(() => {
 *   console.log('Scrolling...');
 * }, 200);
 * 
 * window.addEventListener('scroll', handleScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      lastResult = func.apply(context, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}

/**
 * 重試函數 - 自動重試失敗的操作
 * 
 * 使用場景：
 * - API 請求失敗重試
 * - 網路不穩定時的操作
 * - 暫時性錯誤的處理
 * 
 * @param func 要執行的函數
 * @param maxRetries 最大重試次數
 * @param delayMs 重試之間的延遲（毫秒）
 * @param backoff 是否使用指數退避（每次重試延遲加倍）
 * @returns 執行結果
 * 
 * @example
 * ```typescript
 * const data = await retry(
 *   () => fetchStockPrice('2330'),
 *   3,
 *   1000,
 *   true
 * );
 * ```
 */
export async function retry<T>(
  func: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  backoff: boolean = true
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await func();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 如果是最後一次嘗試，直接拋出錯誤
      if (attempt === maxRetries) {
        throw lastError;
      }

      // 計算延遲時間（指數退避）
      const currentDelay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      
      console.warn(
        `重試 ${attempt + 1}/${maxRetries}，${currentDelay}ms 後重試...`,
        lastError.message
      );

      await delay(currentDelay);
    }
  }

  // TypeScript 需要這個，但實際上不會執行到這裡
  throw lastError!;
}

/**
 * 批次處理統計資訊
 */
export interface BatchStats {
  /** 總項目數 */
  total: number;
  /** 已處理數量 */
  processed: number;
  /** 成功數量 */
  successful: number;
  /** 失敗數量 */
  failed: number;
  /** 處理進度（0-100） */
  progress: number;
  /** 預估剩餘時間（毫秒） */
  estimatedTimeRemaining?: number;
}

/**
 * 帶進度追蹤的批次處理
 * 
 * @param items 要處理的項目
 * @param options 批次處理選項
 * @param onProgress 進度回調函數
 * @returns 批次處理結果
 */
export async function processBatchWithProgress<T, R>(
  items: T[],
  options: BatchProcessOptions<T, R>,
  onProgress?: (stats: BatchStats) => void
): Promise<BatchProcessResult<R>> {
  const startTime = Date.now();
  let processed = 0;
  let successful = 0;
  let failed = 0;

  // 包裝處理函數以追蹤進度
  const wrappedProcessor = async (item: T): Promise<R> => {
    try {
      const result = await options.processor(item);
      successful++;
      return result;
    } catch (error) {
      failed++;
      throw error;
    } finally {
      processed++;

      // 計算進度
      if (onProgress) {
        const progress = (processed / items.length) * 100;
        const elapsed = Date.now() - startTime;
        const avgTimePerItem = elapsed / processed;
        const remaining = items.length - processed;
        const estimatedTimeRemaining = avgTimePerItem * remaining;

        onProgress({
          total: items.length,
          processed,
          successful,
          failed,
          progress,
          estimatedTimeRemaining
        });
      }
    }
  };

  return processBatch(items, {
    ...options,
    processor: wrappedProcessor
  });
}
