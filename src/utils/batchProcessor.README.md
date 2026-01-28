# 批次處理與並發控制工具

## 概述

`batchProcessor.ts` 提供了一套完整的批次處理、並發控制和函數執行優化工具，專為 v1.3.X 架構設計。

## 主要功能

### 1. 批次處理 (`processBatch`)

將大量任務分批執行，並控制並發數量，避免同時發送過多請求導致 API 限流或瀏覽器卡頓。

**特點：**
- ✅ 自動分批處理
- ✅ 並發數量限制（預設最多 5 個同時請求）
- ✅ 批次間延遲控制
- ✅ 錯誤處理策略（continue/stop）
- ✅ 詳細的結果報告

**使用場景：**
- 批次更新股價
- 批次查詢股票資訊
- 大量資料處理

**範例：**
```typescript
import { processBatch } from './batchProcessor';

const stockCodes = ['2330', '2317', '2454', '2881', '2882'];

const result = await processBatch(stockCodes, {
  batchSize: 10,           // 每批處理 10 支股票
  concurrency: 5,          // 最多同時 5 個請求
  delayBetweenBatches: 500, // 批次之間延遲 500ms
  processor: async (code) => {
    return await fetchStockPrice(code);
  },
  onError: 'continue'      // 繼續處理其他股票
});

console.log(`成功: ${result.successCount}, 失敗: ${result.failureCount}`);
```

### 2. 帶進度追蹤的批次處理 (`processBatchWithProgress`)

在批次處理的基礎上增加進度追蹤功能，適合需要向使用者顯示處理進度的場景。

**範例：**
```typescript
import { processBatchWithProgress } from './batchProcessor';

await processBatchWithProgress(
  stockCodes,
  {
    batchSize: 10,
    concurrency: 5,
    processor: fetchStockPrice
  },
  (stats) => {
    console.log(`進度: ${stats.progress.toFixed(1)}%`);
    console.log(`已處理: ${stats.processed}/${stats.total}`);
    console.log(`預估剩餘: ${(stats.estimatedTimeRemaining! / 1000).toFixed(1)}秒`);
  }
);
```

### 3. 防抖動 (`debounce`)

延遲執行頻繁觸發的函數，等待使用者停止操作後才執行。

**特點：**
- ✅ 減少不必要的函數呼叫
- ✅ 支援 immediate 模式（立即執行第一次）
- ✅ 自動重置計時器

**使用場景：**
- 搜尋輸入框（等待使用者停止輸入）
- 自動儲存功能
- 視窗大小調整事件

**範例：**
```typescript
import { debounce } from './batchProcessor';

// 建立防抖動的搜尋函數
const searchStocks = debounce((keyword: string) => {
  console.log('搜尋:', keyword);
  // 執行搜尋邏輯
}, 300);

// 使用者快速輸入
searchStocks('台'); // 不執行
searchStocks('台積'); // 不執行
searchStocks('台積電'); // 300ms 後執行一次
```

**自動儲存範例：**
```typescript
const autoSave = debounce((data) => {
  localStorage.setItem('portfolioData', JSON.stringify(data));
}, 500);

// 使用者編輯資料
autoSave(data); // 不立即執行
autoSave(data); // 重置計時器
autoSave(data); // 500ms 後才執行
```

### 4. 節流 (`throttle`)

限制函數執行頻率，在固定時間間隔內最多執行一次。

**特點：**
- ✅ 固定時間間隔執行
- ✅ 適合高頻事件處理

**使用場景：**
- 滾動事件處理
- 滑鼠移動事件
- 定期刷新股價

**範例：**
```typescript
import { throttle } from './batchProcessor';

// 建立節流的滾動處理函數
const handleScroll = throttle(() => {
  console.log('處理滾動事件');
  // 計算可見的股票
}, 200);

window.addEventListener('scroll', handleScroll);
// 快速滾動時，最多每 200ms 執行一次
```

### 5. 重試機制 (`retry`)

自動重試失敗的操作，支援指數退避策略。

**特點：**
- ✅ 自動重試失敗的操作
- ✅ 可配置重試次數和延遲
- ✅ 支援指數退避（每次延遲加倍）
- ✅ 詳細的錯誤日誌

**使用場景：**
- API 請求失敗重試
- 網路不穩定時的操作
- 暫時性錯誤處理

**範例：**
```typescript
import { retry } from './batchProcessor';

// 自動重試 API 呼叫
const price = await retry(
  () => fetchStockPrice('2330'),
  3,        // 最多重試 3 次
  1000,     // 初始延遲 1 秒
  true      // 使用指數退避（1s, 2s, 4s）
);
```

## 完整使用範例

### 在 StockManager 中使用

```typescript
import { processBatch, debounce, throttle, retry } from '@/utils/batchProcessor';

export class StockManager {
  /**
   * 批次更新所有股票的股價
   */
  async updateAllPrices(stockCodes: string[]): Promise<void> {
    const result = await processBatch(stockCodes, {
      batchSize: 10,
      concurrency: 5,
      delayBetweenBatches: 500,
      processor: async (code) => {
        // 使用重試機制確保可靠性
        return retry(
          () => this.apiService.getStockPrice(code),
          3,
          1000,
          true
        );
      },
      onError: 'continue'
    });

    console.log(`更新完成: 成功 ${result.successCount}, 失敗 ${result.failureCount}`);
  }

  /**
   * 防抖動的搜尋功能
   */
  searchStocks = debounce(async (keyword: string) => {
    const results = await this.apiService.searchStockByName(keyword);
    this.displaySearchResults(results);
  }, 300);

  /**
   * 節流的價格刷新
   */
  refreshPrices = throttle(() => {
    this.updateAllPrices(this.getAllStockCodes());
  }, 5000); // 最多每 5 秒刷新一次
}
```

## API 參考

### `processBatch<T, R>(items, options)`

批次處理函數。

**參數：**
- `items: T[]` - 要處理的項目陣列
- `options: BatchProcessOptions<T, R>` - 批次處理選項
  - `batchSize?: number` - 批次大小（預設 10）
  - `concurrency?: number` - 並發限制（預設 5）
  - `delayBetweenBatches?: number` - 批次間延遲（毫秒，預設 0）
  - `processor: (item: T) => Promise<R>` - 處理函數
  - `onError?: 'continue' | 'stop'` - 錯誤處理策略（預設 'continue'）

**回傳：**
- `Promise<BatchProcessResult<R>>` - 批次處理結果
  - `successful: R[]` - 成功的結果
  - `failed: Array<{ index: number; error: Error }>` - 失敗的項目
  - `total: number` - 總數
  - `successCount: number` - 成功數
  - `failureCount: number` - 失敗數

### `debounce<T>(func, wait, immediate?)`

防抖動函數。

**參數：**
- `func: T` - 要執行的函數
- `wait: number` - 等待時間（毫秒）
- `immediate?: boolean` - 是否立即執行第一次（預設 false）

**回傳：**
- 防抖動後的函數

### `throttle<T>(func, limit)`

節流函數。

**參數：**
- `func: T` - 要執行的函數
- `limit: number` - 時間限制（毫秒）

**回傳：**
- 節流後的函數

### `retry<T>(func, maxRetries?, delayMs?, backoff?)`

重試函數。

**參數：**
- `func: () => Promise<T>` - 要執行的函數
- `maxRetries?: number` - 最大重試次數（預設 3）
- `delayMs?: number` - 重試延遲（毫秒，預設 1000）
- `backoff?: boolean` - 是否使用指數退避（預設 true）

**回傳：**
- `Promise<T>` - 執行結果

## 效能考量

### 並發限制

預設並發限制為 5，這是為了：
1. 避免 API 限流（大多數 API 都有速率限制）
2. 避免瀏覽器卡頓（過多並發請求會影響效能）
3. 保持良好的使用者體驗

可以根據實際情況調整：
- **API 限制較嚴格**：降低到 2-3
- **本地處理**：可以提高到 10-20
- **網路不穩定**：降低到 1-2

### 批次大小

預設批次大小為 10，可以根據：
- **資料量大**：增加批次大小（20-50）
- **即時性要求高**：減少批次大小（5-10）
- **記憶體限制**：減少批次大小

### 延遲設定

批次間延遲預設為 0，但在以下情況建議增加：
- **API 有速率限制**：設定 500-1000ms
- **避免伺服器壓力**：設定 200-500ms
- **本地處理**：保持 0

## 錯誤處理

### Continue 策略（預設）

遇到錯誤時繼續處理其他項目，適合：
- 批次更新股價（部分失敗不影響其他）
- 資料同步（盡可能同步更多資料）
- 非關鍵操作

### Stop 策略

遇到錯誤時立即停止，適合：
- 關鍵資料處理（必須全部成功）
- 有依賴關係的操作
- 需要事務性的操作

## 測試

執行測試：
```bash
npm test tests/utils/batchProcessor.test.ts
```

查看測試覆蓋率：
```bash
npm run test:coverage -- tests/utils/batchProcessor.test.ts
```

## 相關需求

- **Requirements 9.2**: 執行股價更新時使用批次請求並限制並發數量

## 版本歷史

- **v1.3.0.0001**: 初始實作
  - 批次處理功能
  - 並發控制（最多 5 個同時請求）
  - 防抖動和節流功能
  - 重試機制
  - 進度追蹤功能
