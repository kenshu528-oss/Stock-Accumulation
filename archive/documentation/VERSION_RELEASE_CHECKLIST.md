# 版本發布檢查清單 (Version Release Checklist)

## 📋 發版前必檢項目

### 🔢 版本號更新 (Version Number Update)
- [ ] **src/script.js** - 更新註釋中的版本號
- [ ] **src/script.js** - 更新 `showVersionInfo()` 中的版本號
- [ ] **src/script.js** - 更新 console.log 中的版本號 (2處)
- [ ] **src/version.js** - 更新 `currentVersion` 變數
- [ ] **src/version.js** - 新增版本歷史記錄到 `versionHistory` 陣列
- [ ] **index.html** - 更新頁面標題中的版本號
- [ ] **netlify-upload/index.html** - 更新Netlify版本的版本號
- [ ] **netlify-upload/src/version.js** - 更新Netlify版本的version.js
- [ ] **README.md** - 更新開發者資訊中的版本號和日期
- [ ] **README.md** - 新增版本歷史記錄

### 🧪 功能測試 (Function Testing)
- [ ] **基本功能**
  - [ ] 新增股票功能正常
  - [ ] 刪除股票功能正常
  - [ ] 編輯股數功能正常
  - [ ] 編輯成本價功能正常
  - [ ] 股價更新功能正常

- [ ] **帳戶管理**
  - [ ] 新增帳戶功能正常
  - [ ] 刪除帳戶功能正常
  - [ ] 重新命名帳戶功能正常
  - [ ] 帳戶順序調整功能正常
  - [ ] 帳戶切換功能正常

- [ ] **股息管理**
  - [ ] 股息記錄顯示正常
  - [ ] 股息統計計算正確
  - [ ] 股息設定功能正常
  - [ ] 成本價調整功能正常

- [ ] **介面功能**
  - [ ] Action按鈕顯示正常
  - [ ] 隱私模式切換正常
  - [ ] 深色模式切換正常
  - [ ] 響應式設計正常

### 🎨 介面檢查 (UI/UX Check)
- [ ] **按鈕間距** - 所有按鈕間距適當
- [ ] **中文化** - 所有介面文字已中文化
- [ ] **圖示顯示** - 所有圖示正常顯示
- [ ] **顏色主題** - 亮色/深色模式都正常
- [ ] **響應式** - 手機/平板/桌面都正常

### 📄 文檔更新 (Documentation Update)
- [ ] **README.md** - 功能列表已更新
- [ ] **README.md** - 版本歷史已更新
- [ ] **CHANGELOG.md** - 變更記錄已更新（如果有）
- [ ] **使用說明** - 新功能說明已添加

### 🔍 代碼品質 (Code Quality)
- [ ] **語法檢查** - 無JavaScript語法錯誤
- [ ] **CSS檢查** - 無CSS語法錯誤
- [ ] **HTML檢查** - 無HTML語法錯誤
- [ ] **控制台** - 無錯誤訊息
- [ ] **註釋更新** - 新功能有適當註釋

### 🚀 部署準備 (Deployment Preparation)
- [ ] **本地測試** - 本地環境完全正常
- [ ] **瀏覽器測試** - Chrome/Firefox/Safari都正常
- [ ] **檔案完整性** - 所有必要檔案都存在
- [ ] **備份確認** - 重要資料已備份

## 🤖 自動化檢查腳本

### 版本號一致性檢查
```bash
# 檢查所有檔案中的版本號是否一致
grep -r "1\.2\.2\." src/ index.html README.md netlify-upload/
```

### 功能測試腳本
```javascript
// 在瀏覽器控制台執行
function quickSystemCheck() {
    const tests = [
        { name: '系統載入', test: () => typeof window.portfolio !== 'undefined' },
        { name: '新增股票按鈕', test: () => !!document.getElementById('addStockBtn') },
        { name: '帳戶管理按鈕', test: () => !!document.getElementById('manageAccountBtn') },
        { name: '股息管理按鈕', test: () => !!document.getElementById('dividendBtn') },
        { name: 'Action按鈕', test: () => document.querySelectorAll('.action-btn').length > 0 },
        { name: '隱私按鈕', test: () => !!document.getElementById('stockPrivacyBtn') },
        { name: '深色模式按鈕', test: () => !!document.getElementById('darkModeBtn') }
    ];
    
    let passed = 0;
    tests.forEach(test => {
        const result = test.test();
        console.log(`${result ? '✅' : '❌'} ${test.name}`);
        if (result) passed++;
    });
    
    console.log(`\n通過率: ${((passed / tests.length) * 100).toFixed(1)}%`);
    return passed === tests.length;
}

// 執行檢查
quickSystemCheck();
```

## 📝 版本發布流程

### 1. 準備階段
1. 確定版本號（遵循語義化版本規則）
2. 整理本次更新的功能清單
3. 準備版本說明文字

### 2. 更新階段
1. 按照檢查清單逐項更新版本號
2. 更新版本歷史和說明文檔
3. 執行自動化檢查腳本

### 3. 測試階段
1. 本地功能完整測試
2. 多瀏覽器兼容性測試
3. 響應式設計測試

### 4. 發布階段
1. 提交所有變更到版本控制
2. 建立版本標籤
3. 更新部署版本

### 5. 驗證階段
1. 部署後功能驗證
2. 用戶反饋收集
3. 問題追蹤和修正

## 🔄 版本號規則

### 格式：`v主版本.次版本.修訂版本.建置號`
- **主版本** (1.x.x.x) - 重大架構變更
- **次版本** (x.2.x.x) - 新功能添加
- **修訂版本** (x.x.2.x) - Bug修正和小改進
- **建置號** (x.x.x.0017) - 每次發布遞增

### 範例：
- `v1.2.2.0017` - 第1個主版本，第2個次版本，第2個修訂版本，第17次建置

## 📋 檢查清單範本

```markdown
## 發版檢查 - v1.2.2.0018

### 版本號更新
- [ ] src/script.js (3處)
- [ ] src/version.js (2處)
- [ ] index.html (1處)
- [ ] netlify-upload/ (2處)
- [ ] README.md (2處)

### 功能測試
- [ ] 基本功能 (5項)
- [ ] 帳戶管理 (5項)
- [ ] 股息管理 (4項)
- [ ] 介面功能 (4項)

### 文檔更新
- [ ] README.md功能列表
- [ ] 版本歷史記錄
- [ ] 使用說明更新

### 最終確認
- [ ] 自動化檢查通過
- [ ] 本地測試完成
- [ ] 準備發布
```

## 🎯 建議

1. **每次開發前** - 複製檢查清單到新文件
2. **開發過程中** - 隨時勾選完成項目
3. **發版前** - 確保所有項目都已勾選
4. **建立習慣** - 將檢查清單作為標準流程
5. **持續改進** - 根據經驗更新檢查清單

---

**記住：寧可多花5分鐘檢查，也不要花50分鐘修復！**