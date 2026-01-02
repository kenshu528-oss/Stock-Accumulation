# 存股紀錄系統功能清單與自檢標準

## 🔥 核心功能 (Critical Functions)
> 這些功能如果失效，系統基本無法使用

### 1. 股票管理
- [ ] **新增股票** - 模態框表單，自動查詢股票名稱
- [ ] **股票列表顯示** - 正確渲染所有股票資料
- [ ] **編輯股數** - 點擊股數欄位可編輯
- [ ] **編輯成本價** - 點擊編輯按鈕可修改
- [ ] **刪除股票** - 操作選單中的刪除功能

### 2. 帳戶管理
- [ ] **帳戶切換** - Ken/Mom 帳戶標籤切換
- [ ] **資料隔離** - 不同帳戶顯示不同股票
- [ ] **新增帳戶** - 可以創建新帳戶
- [ ] **資料儲存** - localStorage 正確儲存/載入

### 3. 股息計算
- [ ] **自動股息計算** - 新增股票時自動計算歷史股息
- [ ] **成本價調整** - 扣除股息後的調整成本價
- [ ] **成本價切換** - 原始/調整後成本價切換顯示
- [ ] **股息資料庫** - 包含主要股票的股息資料

### 4. 財務計算
- [ ] **總市值計算** - 股數 × 現價的總和
- [ ] **損益計算** - 市值 - 成本的損益
- [ ] **損益率計算** - (損益 / 成本) × 100%
- [ ] **總報酬計算** - 損益 + 股息收入

## ⭐ 重要功能 (Important Functions)
> 這些功能影響用戶體驗，但不會導致系統完全無法使用

### 5. 股價更新
- [ ] **批量更新股價** - 🔄 按鈕更新所有股價
- [ ] **單一股票更新** - 操作選單中的更新功能
- [ ] **更新時間顯示** - 顯示最後更新時間
- [ ] **更新狀態提示** - 更新中/完成提示

### 6. 用戶介面
- [ ] **深色模式切換** - 🌙/☀️ 按鈕切換主題
- [ ] **隱私模式** - 🙈/👁️ 按鈕隱藏金額
- [ ] **操作選單** - 下拉式操作選單
- [ ] **響應式設計** - 手機/平板適配

### 7. 資料管理
- [ ] **匯出資料** - 資料備份功能
- [ ] **匯入資料** - 資料還原功能
- [ ] **雲端同步** - 跨裝置同步
- [ ] **版本管理** - 版本資訊顯示

## 🔧 輔助功能 (Secondary Functions)
> 這些功能提供額外便利，但不是必需的

### 8. 進階功能
- [ ] **批量編輯** - 批量修改股票資料
- [ ] **股息管理** - 手動新增/編輯股息記錄
- [ ] **API 測試** - 測試外部 API 連接
- [ ] **帳戶管理** - 刪除/重命名帳戶

### 9. 系統功能
- [ ] **版本資訊** - 顯示版本歷史
- [ ] **版權資訊** - 顯示版權聲明
- [ ] **使用說明** - 功能說明文檔
- [ ] **錯誤處理** - 友善的錯誤提示

## 🧪 自檢測試腳本

### 核心功能自檢
```javascript
// 系統載入檢查
function checkSystemLoad() {
    return {
        portfolioLoaded: typeof window.portfolio !== 'undefined',
        domReady: document.readyState === 'complete',
        versionMatch: document.querySelector('#versionInfo').textContent.includes('1.2.2.0006')
    };
}

// 股票管理功能檢查
function checkStockManagement() {
    return {
        addStockModal: !!document.getElementById('addStockModal'),
        stockTable: !!document.querySelector('#stockTable tbody'),
        addStockBtn: !!document.getElementById('addStockBtn')
    };
}

// 帳戶管理功能檢查
function checkAccountManagement() {
    return {
        accountTabs: document.querySelectorAll('.account-tab').length >= 2,
        currentAccount: window.portfolio?.currentAccount === 'Ken',
        accountSwitching: typeof window.portfolio?.switchAccount === 'function'
    };
}

// 股息計算功能檢查
function checkDividendCalculation() {
    const db = window.portfolio?.getDividendDatabase();
    return {
        dividendDB: !!db,
        stock0056Data: db?.['0056']?.length >= 4,
        stock00878Data: db?.['00878']?.length >= 4,
        calculationFunction: typeof window.portfolio?.calculateHistoricalDividends === 'function'
    };
}

// 財務計算功能檢查
function checkFinancialCalculation() {
    return {
        totalValueDisplay: !!document.querySelector('.total-value'),
        profitCalculation: typeof window.portfolio?.updateSummary === 'function',
        privacyToggle: !!document.getElementById('privacyToggle')
    };
}
```

## 📊 自檢報告格式

### 通過標準
- ✅ **通過**: 功能正常運作
- ⚠️ **警告**: 功能部分異常但不影響使用
- ❌ **失敗**: 功能完全失效
- 🔄 **待測**: 需要手動測試確認

### 發版前必檢項目
1. **系統載入** - portfolio 物件正確初始化
2. **新增股票** - 模態框正常開啟，表單提交成功
3. **股票顯示** - 列表正確渲染，資料完整
4. **帳戶切換** - Ken/Mom 切換正常
5. **股息計算** - 0056/00878 股息正確計算
6. **成本價切換** - 原始/調整後正確切換
7. **操作選單** - 下拉選單正常運作
8. **總市值** - 數值計算正確

## 🎯 測試用例

### 標準測試流程
1. **載入測試**: 重新載入頁面，檢查版本號和初始化
2. **新增測試**: 新增 00878，檢查股息自動計算
3. **顯示測試**: 檢查成本價、總市值、損益顯示
4. **操作測試**: 測試編輯、刪除、更新功能
5. **切換測試**: 測試帳戶切換、主題切換
6. **計算測試**: 驗證財務數據計算正確性

### 回歸測試
每次發版前必須執行完整的核心功能測試，確保沒有破壞現有功能。