# 中文優先規則 (Chinese First Rule)

## 🎯 目標
確保所有 AI 助手的回覆優先使用中文（繁體中文）進行說明，提供更好的本地化體驗。

## 📋 語言使用規則

### 回覆語言優先順序
1. **中文（繁體）** - 最高優先級
   - 所有說明、解釋、總結都使用中文
   - 錯誤訊息使用中文
   - 任務狀態更新使用中文
   - 與使用者的對話使用中文

2. **英文** - 僅在必要時使用
   - 程式碼註解可以使用英文（但中文更佳）
   - 技術術語可以保留英文原文
   - 變數名稱、函數名稱使用英文（程式碼規範）

### 具體實施規則

#### ✅ 必須使用中文的場景
- 任務完成總結
- 功能說明
- 錯誤解釋
- 實作步驟說明
- 問題診斷
- 建議和推薦
- 文檔撰寫（README、說明文件）
- 使用者互動對話

#### ⚠️ 可以使用英文的場景
- 程式碼中的變數名稱（遵循程式設計慣例）
- 程式碼中的函數名稱（遵循程式設計慣例）
- Git commit 訊息（可選，但中文更佳）
- 技術術語的英文原文（可在括號中標註）

#### 🔄 混合使用的場景
- 技術說明：中文為主，英文術語輔助
  - 範例：「我實作了 StorageService（儲存服務）」
  - 範例：「使用 LocalStorage 進行資料持久化」

### 程式碼註解規則

#### JSDoc / TSDoc 註解
```typescript
/**
 * 儲存服務 - 處理所有 LocalStorage 操作
 * StorageService for v1.3.X architecture
 * 
 * 主要功能：
 * - 版本隔離儲存（使用 'stockPortfolio_v1.3' 鍵值）
 * - 錯誤處理（配額超出情況）
 * - JSON 序列化/反序列化
 */
export class StorageService {
  /** 儲存鍵值 - v1.3.X 專用，與 v1.2.X 隔離 */
  private readonly STORAGE_KEY = 'stockPortfolio_v1.3';
}
```

#### 內聯註解
```typescript
// 更新最後修改時間戳記
data.metadata.lastModified = new Date().toISOString();

// 處理配額超出錯誤
if (error.name === 'QuotaExceededError') {
  throw new StorageError('儲存空間不足');
}
```

### 錯誤訊息規則

#### ✅ 正確範例
```typescript
throw new StorageError('儲存空間不足，請清理瀏覽器資料或匯出備份');
throw new ValidationError('股票代碼格式不正確', 'stockCode');
console.error('資料解析失敗:', error);
```

#### ❌ 錯誤範例
```typescript
throw new StorageError('Storage quota exceeded');
throw new ValidationError('Invalid stock code', 'stockCode');
console.error('Data parsing failed:', error);
```

### 文檔撰寫規則

#### README.md
- 標題使用中文
- 說明使用中文
- 範例程式碼的註解使用中文
- 技術術語可以中英並列

#### 設計文件
- 主要內容使用中文
- 圖表標籤使用中文
- 技術術語可以保留英文原文

#### 需求文件
- 完全使用中文
- 遵循 EARS 格式（中文版）

## 🎯 回覆格式範例

### 任務完成回覆
```markdown
## 任務 4.1 完成：StorageService 實作

我已成功實作 `StorageService` 類別，位於 `src/services/StorageService.ts`，包含所有必要功能：

### 已實作功能：
✅ **save()** - 儲存投資組合資料到 LocalStorage，自動更新時間戳記
✅ **load()** - 從 LocalStorage 載入資料，包含錯誤處理
✅ **clear()** - 清除所有 v1.3 投資組合資料
✅ **hasData()** - 檢查投資組合資料是否存在
✅ **版本隔離** - 使用 `stockPortfolio_v1.3` 鍵值（與 v1.2.X 隔離）
✅ **錯誤處理** - 正確處理 QuotaExceededError 和解析錯誤

### 重要實作細節：
- 儲存鍵值為 `stockPortfolio_v1.3`，確保與 v1.2.X 資料完全隔離
- 每次儲存時自動更新 `lastModified` 時間戳記
- 完整的錯誤處理，提供使用者友善的中文錯誤訊息
- 使用 TypeScript 介面確保型別安全
- 無 TypeScript 診斷錯誤

StorageService 現在已準備好供 v1.3.X 架構中的其他管理器和服務使用。
```

## ⚠️ 重要提醒

### 必須遵守
- **所有與使用者的互動都使用中文**
- **任務說明和總結使用中文**
- **錯誤訊息使用中文**
- **文檔撰寫優先使用中文**

### 例外情況
- 程式碼中的識別符號（變數、函數名稱）遵循英文命名慣例
- 技術術語可以保留英文，但建議加上中文說明
- Git commit 可以使用英文（但中文更佳）

## 📊 品質檢查

### 回覆品質指標
- **中文使用率**: 應達到 80% 以上（不含程式碼）
- **可讀性**: 使用者能輕鬆理解
- **專業性**: 保持技術準確性
- **友善性**: 語氣親切、易懂

---

**記住：優先使用中文，讓使用者獲得最佳的本地化體驗！**
