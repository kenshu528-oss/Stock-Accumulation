/**
 * Jest 測試環境設定
 */

// 模擬 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// 模擬 fetch API
global.fetch = jest.fn();

// 模擬 console 方法（避免測試時的日誌輸出）
const originalConsole = { ...console };

beforeEach(() => {
  // 重置 localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // 重置 fetch mock
  (fetch as jest.Mock).mockClear();
});

afterEach(() => {
  // 恢復 console
  Object.assign(console, originalConsole);
});

// 全域測試工具函數
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidStockCode(): R;
      toBeValidDate(): R;
    }
  }
}

// 自定義 Jest matchers
expect.extend({
  toBeValidStockCode(received: string) {
    const taiwanStockPattern = /^[0-9]{4}[A-Z]?$|^00[0-9]{3}[A-Z]?$/;
    const pass = taiwanStockPattern.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Taiwan stock code`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Taiwan stock code`,
        pass: false,
      };
    }
  },
  
  toBeValidDate(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  }
});

// 測試資料生成工具
export const testUtils = {
  // 生成測試用股票代碼
  generateStockCode: (): string => {
    const codes = ['2330', '0050', '00878', '2317', '2454'];
    return codes[Math.floor(Math.random() * codes.length)];
  },
  
  // 生成測試用日期
  generateDate: (daysAgo: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  },
  
  // 生成測試用股票記錄
  generateStockRecord: (overrides: any = {}) => ({
    id: Date.now() + Math.random(),
    code: testUtils.generateStockCode(),
    name: '測試股票',
    shares: 1000,
    costPrice: 100,
    adjustedCostPrice: 100,
    currentPrice: 105,
    purchaseDate: testUtils.generateDate(30),
    account: '測試帳戶',
    dividends: [],
    totalDividends: 0,
    lastUpdate: new Date().toISOString(),
    dataSource: 'TWSE' as const,
    purchaseHistory: [],
    ...overrides
  })
};