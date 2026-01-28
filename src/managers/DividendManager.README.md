# DividendManager - 股息管理器

## 概述

`DividendManager` 是 v1.3.X 架構中負責管理股息記錄的核心管理器。

## 主要功能

### 1. 股息記錄管理
- 新增股息記錄 (`addDividend`)
- 更新股息記錄 (`updateDividend`)
- 刪除股息記錄 (`deleteDividend`)
- 查詢股息記錄 (`getDividend`, `getDividendsByStock`, `getAllDividends`)

### 2. 股息計算
- 計算調整成本價 (`calculateAdjustedCostPrice`)
- 計算總股息收入 (`calculateTotalDividend`)

## 使用範例

```typescript
import { DividendManager } from './managers/DividendManager';
import { StorageService } from './services/StorageService';

const storageService = new StorageService();
const dividendManager = new DividendManager(storageService);

// 新增股息記錄
const dividend = await dividendManager.addDividend({
  stockId: 'stock_123',
  exDividendDate: '2024-06-15',
  dividendPerShare: 2.5,
  totalDividend: 250
});

// 計算調整成本價
const adjustedCostPrice = dividendManager.calculateAdjustedCostPrice(
  'stock_123',
  100,  // 原始成本價
  100   // 持股數
);
```

## 調整成本價計算

公式：調整成本價 = 原始成本價 - (總股息收入 / 持股數)

這反映了股息收入對實際投資成本的影響。
