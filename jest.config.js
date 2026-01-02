/**
 * Jest 測試框架設定
 */

export default {
  // 測試環境
  testEnvironment: 'jsdom',
  
  // 使用 ts-jest 處理 TypeScript
  preset: 'ts-jest/presets/default-esm',
  
  // 模組檔案副檔名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 測試檔案匹配模式
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // 轉換設定
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true
    }]
  },
  
  // 模組名稱對應
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  
  // 設定檔案
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // 覆蓋率設定
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  
  // 覆蓋率閾值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 覆蓋率報告格式
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 忽略的路徑
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // 全域設定
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // 模組解析
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // 測試超時時間（毫秒）
  testTimeout: 10000,
  
  // 詳細輸出
  verbose: true
};