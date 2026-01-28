# v1.3.X 架構說明

## 目錄結構

```
src/
├── managers/          # 業務邏輯層
│   ├── StockManager.ts
│   ├── AccountManager.ts
│   ├── DividendManager.ts
│   └── PortfolioManager.ts
│
├── services/          # 服務層
│   ├── StockApiService.ts
│   ├── StorageService.ts
│   ├── CloudSyncService.ts
│   └── MigrationService.ts
│
├── types/             # 型別定義
│   ├── Stock.ts
│   ├── Account.ts
│   ├── Dividend.ts
│   ├── Portfolio.ts
│   ├── Errors.ts
│   └── Api.ts
│
├── utils/             # 工具函數
│   ├── formatters.ts
│   ├── validators.ts
│   ├── calculators.ts
│   ├── errorHandler.ts
│   └── batchProcessor.ts
│
└── main.ts            # 應用程式入口
```

## 架構原則

### 1. 分層架構
- **Manager 層**: 業務邏輯，協調各個服務
- **Service 層**: 外部服務封裝（API、儲存、同步）
- **Utils 層**: 純函數工具，無副作用

### 2. 依賴注入
- Manager 透過建構函數接收 Service 實例
- 方便測試和替換實作

### 3. 型別安全
- 所有模組使用 TypeScript
- 明確的介面定義
- 編譯時型別檢查

### 4. 版本隔離
- LocalStorage Key: `stockPortfolio_v1.3`
- 與 v1.2.X 完全獨立
- 支援資料遷移

## 開發指南

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

### 建置
```bash
npm run build
```

### 測試
```bash
npm test
npm run test:coverage
```

### 程式碼品質
```bash
npm run lint
npm run format
npm run type-check
```

## 配置檔案

- `tsconfig.json` - TypeScript 配置
- `vite.config.ts` - Vite 建置工具配置
- `jest.config.js` - Jest 測試框架配置
- `.eslintrc.json` - ESLint 程式碼檢查配置
- `.prettierrc.json` - Prettier 程式碼格式化配置

## 版本資訊

- **版本範圍**: v1.3.X.XXXX
- **主要版本**: 1.3 (架構升級)
- **次版本**: X (功能更新)
- **建置號**: XXXX (4位數，0001-9999)
