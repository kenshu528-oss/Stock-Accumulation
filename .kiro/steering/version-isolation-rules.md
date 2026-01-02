---
inclusion: always
---

# 版本隔離規則 (Version Isolation Rules)

## 🎯 目標
確保新舊版本的資料、代碼、規則完全隔離，避免互相干擾。

## 📂 版本分支策略

### 舊版系統 (v1.2.X.XXXX)
- **Git分支**: `release/v1.2.x`
- **資料夾**: `archive/legacy-system/`
- **用途**: 維護、bug修正、小幅改進
- **LocalStorage Key**: `stockPortfolio_v1.2`
- **部署**: 
  - GitHub Pages: 主目錄
  - Netlify: `netlify-upload/`

### 新版系統 (v1.3.X.XXXX)
- **Git分支**: `main` (或 `develop/v1.3.x`)
- **資料夾**: `src/`, `index.html` (主目錄)
- **用途**: 新功能開發、重大更新、架構改進
- **LocalStorage Key**: `stockPortfolio_v1.3`
- **部署**: 
  - GitHub Pages: 新分支或子目錄
  - Netlify: 新站點

## 🔒 資料隔離策略

### 1. LocalStorage Key 隔離
```javascript
// 舊版 (v1.2.X)
localStorage.getItem('stockPortfolio_v1.2')

// 新版 (v1.3.X)
localStorage.getItem('stockPortfolio_v1.3')
```

### 2. 版本檢測與遷移
```javascript
// 檢測舊版資料
const oldData = localStorage.getItem('stockPortfolio_v1.2');
if (oldData && !localStorage.getItem('stockPortfolio_v1.3')) {
    // 提示用戶是否遷移資料
    if (confirm('偵測到舊版資料，是否遷移到新版？')) {
        migrateFromV12ToV13(oldData);
    }
}
```

### 3. 資料備份機制
- 遷移前自動備份舊版資料
- 保留舊版資料不刪除
- 提供回滾功能

## 📋 開發規則隔離

### 舊版規則 (v1.2.X)
- **檔案**: `.kiro/steering/version-rules-v1.2.md`
- **適用範圍**: `archive/legacy-system/`
- **修改原則**: 最小改動，只修bug
- **版本號範圍**: v1.2.2.0001 ~ v1.2.9.9999

### 新版規則 (v1.3.X)
- **檔案**: `.kiro/steering/version-rules-v1.3.md`
- **適用範圍**: `src/`, 主目錄
- **修改原則**: 可重構、新增功能
- **版本號範圍**: v1.3.0.0001 ~ v1.3.9.9999

## 🚀 部署隔離策略

### 方案1: 雙站點部署（推薦）
```
舊版: https://your-site-v1-2.netlify.app
新版: https://your-site-v1-3.netlify.app
```

### 方案2: 子路徑部署
```
舊版: https://your-site.netlify.app/v1.2/
新版: https://your-site.netlify.app/v1.3/
```

### 方案3: 分支部署
```
舊版: release/v1.2.x 分支 → Netlify Production
新版: main 分支 → Netlify Preview
```

## 🔄 版本切換流程

### 從舊版切換到新版
1. 用戶訪問新版網址
2. 系統檢測到舊版資料
3. 提示用戶遷移選項：
   - ✅ 遷移並保留舊版資料
   - ✅ 僅複製資料（不刪除舊版）
   - ❌ 不遷移（從頭開始）

### 從新版回退到舊版
1. 用戶訪問舊版網址
2. 舊版資料仍然存在
3. 可以繼續使用舊版

## ⚠️ 重要規則

### 絕對禁止
- **禁止** 新舊版本使用相同的 LocalStorage Key
- **禁止** 在 main 分支直接修改 `archive/legacy-system/`
- **禁止** 混用版本號範圍
- **禁止** 刪除用戶的舊版資料

### 必須遵守
- **必須** 在修改前確認當前版本分支
- **必須** 使用正確的版本號範圍
- **必須** 提供資料遷移功能
- **必須** 保留舊版資料備份

## 📊 版本管理矩陣

| 項目 | 舊版 (v1.2.X) | 新版 (v1.3.X) |
|------|---------------|---------------|
| Git分支 | release/v1.2.x | main |
| 資料夾 | archive/legacy-system/ | src/ |
| LocalStorage | stockPortfolio_v1.2 | stockPortfolio_v1.3 |
| 版本號 | v1.2.2.XXXX | v1.3.X.XXXX |
| 修改原則 | 最小改動 | 可重構 |
| 部署方式 | 主目錄/netlify-upload | 新站點 |

## 🛠️ 實作檢查清單

### 設定隔離
- [x] 建立 release/v1.2.x 分支
- [ ] 修改舊版 LocalStorage Key
- [ ] 修改新版 LocalStorage Key
- [ ] 建立資料遷移函數
- [ ] 建立版本檢測機制

### 部署隔離
- [ ] 設定舊版 Netlify 站點
- [ ] 設定新版 Netlify 站點
- [ ] 測試雙站點獨立運作
- [ ] 建立版本切換導引頁面

### 文檔隔離
- [x] 建立版本隔離規則文件
- [ ] 更新開發文檔
- [ ] 建立用戶遷移指南
- [ ] 建立版本對照表

---

**記住：新舊版本必須完全隔離，確保用戶資料安全！**
