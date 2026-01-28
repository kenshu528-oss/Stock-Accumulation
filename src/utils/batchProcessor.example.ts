/**
 * 批次處理工具使用範例
 * Examples of using Batch Processing Utilities
 * 
 * 這個檔案展示如何在實際場景中使用批次處理、並發控制和防抖動功能
 */

import {
  processBatch,
  debounce,
  throttle,
  retry,
  processBatchWithProgress,
  type BatchProcessResult
} from './batchProcessor';

// ============================================================================
// 範例 1: 批次更新股價（控制並發數量）
// ============================================================================

/**
 * 模擬股價 API 呼叫
 */
async function fetchStockPrice(code: string): Promise<number> {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 模擬隨機失敗（10% 機率）
  if (Math.random() < 0.1) {
    throw new Error(`無法取得 ${code} 的股價`);
  }
  
  return Math.random() * 1000;
}

/**
 * 批次更新多支股票的股價
 */
export async function batchUpdateStockPrices(stockCodes: string[]): Promise<void> {
  console.log(`開始批次更新 ${stockCodes.length} 支股票的股價...`);

  const result = await processBatch(stockCodes, {
    batchSize: 10,           // 每批處理 10 支股票
    concurrency: 5,          // 最多同時 5 個請求
    delayBetweenBatches: 500, // 批次之間延遲 500ms
    processor: async (code) => {
      const price = await fetchStockPrice(code);
      console.log(`${code}: $${price.toFixed(2)}`);
      return price;
    },
    onError: 'continue'      // 繼續處理其他股票
  });

  console.log(`
更新完成！
- 成功: ${result.successCount}
- 失敗: ${result.failureCount}
- 總計: ${result.total}
  `);

  // 處理失敗的股票
  if (result.failed.length > 0) {
    console.log('失敗的股票:');
    result.failed.forEach(({ index, error }) => {
      console.log(`  - ${stockCodes[index]}: ${error.message}`);
    });
  }
}

// ============================================================================
// 範例 2: 帶進度追蹤的批次處理
// ============================================================================

/**
 * 批次更新股價並顯示進度
 */
export async function batchUpdateWithProgress(stockCodes: string[]): Promise<void> {
  console.log(`開始批次更新 ${stockCodes.length} 支股票...`);

  const result = await processBatchWithProgress(
    stockCodes,
    {
      batchSize: 10,
      concurrency: 5,
      processor: fetchStockPrice
    },
    (stats) => {
      // 進度回調
      console.log(`
進度: ${stats.progress.toFixed(1)}%
已處理: ${stats.processed}/${stats.total}
成功: ${stats.successful}
失敗: ${stats.failed}
預估剩餘時間: ${(stats.estimatedTimeRemaining! / 1000).toFixed(1)}秒
      `);
    }
  );

  console.log('更新完成！', result);
}

// ============================================================================
// 範例 3: 防抖動 - 自動儲存功能
// ============================================================================

/**
 * 模擬儲存資料到 LocalStorage
 */
function saveToStorage(data: any): void {
  console.log('儲存資料到 LocalStorage...', data);
  localStorage.setItem('portfolioData', JSON.stringify(data));
}

/**
 * 建立防抖動的自動儲存函數
 * 使用者編輯後 500ms 才實際儲存，避免頻繁寫入
 */
export const autoSave = debounce((data: any) => {
  saveToStorage(data);
}, 500);

/**
 * 使用範例
 */
export function exampleAutoSave(): void {
  const data = { stocks: [], accounts: [] };

  // 使用者快速編輯多次
  autoSave(data); // 不會立即執行
  autoSave(data); // 重置計時器
  autoSave(data); // 重置計時器
  
  // 500ms 後才會實際執行一次 saveToStorage
}

// ============================================================================
// 範例 4: 節流 - 滾動事件處理
// ============================================================================

/**
 * 處理滾動事件（計算可見的股票）
 */
function handleScroll(): void {
  console.log('計算可見的股票...');
  // 實際的滾動處理邏輯
}

/**
 * 建立節流的滾動處理函數
 * 最多每 200ms 執行一次，避免過度計算
 */
export const throttledScroll = throttle(handleScroll, 200);

/**
 * 使用範例
 */
export function exampleThrottle(): void {
  // 在實際應用中綁定到滾動事件
  // window.addEventListener('scroll', throttledScroll);
  
  // 模擬快速滾動
  throttledScroll(); // 立即執行
  throttledScroll(); // 被忽略
  throttledScroll(); // 被忽略
  
  // 200ms 後
  setTimeout(() => {
    throttledScroll(); // 再次執行
  }, 200);
}

// ============================================================================
// 範例 5: 重試 - 處理不穩定的 API
// ============================================================================

/**
 * 模擬不穩定的 API（前幾次會失敗）
 */
let apiCallCount = 0;
async function unstableApi(): Promise<string> {
  apiCallCount++;
  
  if (apiCallCount < 3) {
    throw new Error('網路暫時不穩定');
  }
  
  return '成功取得資料';
}

/**
 * 使用重試機制呼叫不穩定的 API
 */
export async function fetchWithRetry(): Promise<string> {
  try {
    const result = await retry(
      unstableApi,
      3,        // 最多重試 3 次
      1000,     // 每次延遲 1 秒
      true      // 使用指數退避（1s, 2s, 4s）
    );
    
    console.log('API 呼叫成功:', result);
    return result;
  } catch (error) {
    console.error('API 呼叫失敗，已達最大重試次數:', error);
    throw error;
  }
}

// ============================================================================
// 範例 6: 實際應用 - StockManager 中的批次更新
// ============================================================================

/**
 * 在 StockManager 中使用批次處理
 */
export class StockManagerExample {
  /**
   * 批次更新所有股票的股價
   */
  async updateAllPrices(stockCodes: string[]): Promise<BatchProcessResult<number>> {
    console.log('開始批次更新股價...');

    return processBatch(stockCodes, {
      batchSize: 10,
      concurrency: 5,
      delayBetweenBatches: 500,
      processor: async (code) => {
        // 使用重試機制確保可靠性
        return retry(
          () => fetchStockPrice(code),
          3,
          1000,
          true
        );
      },
      onError: 'continue'
    });
  }

  /**
   * 防抖動的搜尋功能
   */
  searchStocks = debounce(async (keyword: string) => {
    console.log('搜尋股票:', keyword);
    // 實際的搜尋邏輯
  }, 300);

  /**
   * 節流的價格更新
   */
  refreshPrices = throttle(() => {
    console.log('刷新股價...');
    // 實際的刷新邏輯
  }, 5000); // 最多每 5 秒刷新一次
}

// ============================================================================
// 範例 7: 錯誤處理策略比較
// ============================================================================

/**
 * 使用 'continue' 策略 - 繼續處理其他項目
 */
export async function exampleContinueStrategy(): Promise<void> {
  const items = [1, 2, 3, 4, 5];
  
  const result = await processBatch(items, {
    processor: async (item) => {
      if (item === 3) {
        throw new Error('項目 3 處理失敗');
      }
      return item * 2;
    },
    onError: 'continue'
  });

  console.log('Continue 策略結果:');
  console.log('- 成功:', result.successful); // [2, 4, 8, 10]
  console.log('- 失敗:', result.failed.length); // 1
}

/**
 * 使用 'stop' 策略 - 遇到錯誤立即停止
 */
export async function exampleStopStrategy(): Promise<void> {
  const items = [1, 2, 3, 4, 5];
  
  const result = await processBatch(items, {
    processor: async (item) => {
      if (item === 3) {
        throw new Error('項目 3 處理失敗');
      }
      return item * 2;
    },
    onError: 'stop'
  });

  console.log('Stop 策略結果:');
  console.log('- 成功:', result.successful); // [2, 4]
  console.log('- 失敗:', result.failed.length); // 3 (包含未處理的項目)
}

// ============================================================================
// 執行範例（僅供測試）
// ============================================================================

/**
 * 執行所有範例
 */
export async function runAllExamples(): Promise<void> {
  console.log('=== 批次處理工具使用範例 ===\n');

  // 範例 1: 批次更新股價
  console.log('--- 範例 1: 批次更新股價 ---');
  await batchUpdateStockPrices(['2330', '2317', '2454', '2881', '2882']);
  console.log('\n');

  // 範例 3: 防抖動
  console.log('--- 範例 3: 防抖動 ---');
  exampleAutoSave();
  console.log('\n');

  // 範例 4: 節流
  console.log('--- 範例 4: 節流 ---');
  exampleThrottle();
  console.log('\n');

  // 範例 5: 重試
  console.log('--- 範例 5: 重試 ---');
  await fetchWithRetry();
  console.log('\n');

  // 範例 7: 錯誤處理策略
  console.log('--- 範例 7: 錯誤處理策略 ---');
  await exampleContinueStrategy();
  await exampleStopStrategy();
  console.log('\n');

  console.log('=== 所有範例執行完成 ===');
}

// 如果直接執行此檔案，則運行範例
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}
