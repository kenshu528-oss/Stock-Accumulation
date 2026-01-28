/**
 * 批次處理與並發控制工具測試
 * Tests for Batch Processing and Concurrency Control Utilities
 */

import {
  processBatch,
  debounce,
  throttle,
  retry,
  processBatchWithProgress,
  // type BatchProcessOptions,
  // BatchProcessOptions 暫時未使用
  type BatchStats
} from '../../src/utils/batchProcessor';

describe('batchProcessor', () => {
  describe('processBatch', () => {
    it('應該成功處理所有項目', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = jest.fn(async (item: number) => item * 2);

      const result = await processBatch(items, {
        processor,
        batchSize: 2,
        concurrency: 2
      });

      expect(result.successCount).toBe(5);
      expect(result.failureCount).toBe(0);
      expect(result.successful).toEqual([2, 4, 6, 8, 10]);
      expect(processor).toHaveBeenCalledTimes(5);
    });

    it('應該處理部分失敗的情況（continue 策略）', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = jest.fn(async (item: number) => {
        if (item === 3) {
          throw new Error('處理失敗');
        }
        return item * 2;
      });

      const result = await processBatch(items, {
        processor,
        batchSize: 2,
        concurrency: 2,
        onError: 'continue'
      });

      expect(result.successCount).toBe(4);
      expect(result.failureCount).toBe(1);
      expect(result.successful).toEqual([2, 4, 8, 10]);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error.message).toBe('處理失敗');
    });

    it('應該限制並發數量', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let currentConcurrency = 0;
      let maxConcurrency = 0;

      const processor = async (item: number) => {
        currentConcurrency++;
        maxConcurrency = Math.max(maxConcurrency, currentConcurrency);
        
        // 模擬異步操作
        await new Promise(resolve => setTimeout(resolve, 50));
        
        currentConcurrency--;
        return item * 2;
      };

      await processBatch(items, {
        processor,
        batchSize: 10,
        concurrency: 3
      });

      // 驗證並發數量不超過限制
      expect(maxConcurrency).toBeLessThanOrEqual(3);
      expect(maxConcurrency).toBeGreaterThan(0);
    });

    it('應該在批次之間延遲', async () => {
      const items = [1, 2, 3, 4, 5, 6];
      const processor = jest.fn(async (item: number) => item * 2);
      const startTime = Date.now();

      await processBatch(items, {
        processor,
        batchSize: 2,
        concurrency: 5,
        delayBetweenBatches: 100
      });

      const elapsed = Date.now() - startTime;
      
      // 應該有 2 次延遲（3 批，2 次批次間延遲）
      // 允許一些誤差
      expect(elapsed).toBeGreaterThanOrEqual(180);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('應該延遲執行函數', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('應該重置計時器當再次呼叫時', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      jest.advanceTimersByTime(50);
      
      debouncedFunc(); // 重置計時器
      jest.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('應該支援 immediate 模式', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100, true);

      debouncedFunc();
      expect(func).toHaveBeenCalledTimes(1);

      debouncedFunc();
      expect(func).toHaveBeenCalledTimes(1); // 不應該再次呼叫

      jest.advanceTimersByTime(100);
      debouncedFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('應該限制函數執行頻率', () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);

      throttledFunc();
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1); // 仍然只執行一次

      jest.advanceTimersByTime(100);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('retry', () => {
    it('應該在成功時不重試', async () => {
      const func = jest.fn(async () => 'success');

      const result = await retry(func, 3, 100);

      expect(result).toBe('success');
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('應該重試失敗的操作', async () => {
      let attempts = 0;
      const func = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('暫時失敗');
        }
        return 'success';
      });

      const result = await retry(func, 3, 10, false);

      expect(result).toBe('success');
      expect(func).toHaveBeenCalledTimes(3);
    });

    it('應該在達到最大重試次數後拋出錯誤', async () => {
      const func = jest.fn(async () => {
        throw new Error('永久失敗');
      });

      await expect(retry(func, 2, 10, false)).rejects.toThrow('永久失敗');
      expect(func).toHaveBeenCalledTimes(3); // 初始 + 2 次重試
    });
  });

  describe('processBatchWithProgress', () => {
    it('應該報告處理進度', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = jest.fn(async (item: number) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 2;
      });

      const progressUpdates: BatchStats[] = [];
      const onProgress = jest.fn((stats: BatchStats) => {
        progressUpdates.push(stats);
      });

      const result = await processBatchWithProgress(
        items,
        { processor, batchSize: 2, concurrency: 2 },
        onProgress
      );

      expect(result.successCount).toBe(5);
      expect(onProgress).toHaveBeenCalled();
      expect(progressUpdates.length).toBeGreaterThan(0);
      
      // 檢查最後一次進度更新
      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.processed).toBe(5);
      expect(lastUpdate.progress).toBe(100);
    });
  });
});
