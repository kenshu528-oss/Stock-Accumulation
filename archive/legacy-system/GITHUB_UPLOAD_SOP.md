# GitHub 上傳標準作業程序 (SOP)

## 📋 目標
將本地專案上傳到 GitHub，並設定為可公開存取的網站。

## ⏱️ 預估時間
- 首次設定：15-20 分鐘
- 後續上傳：5-10 分鐘

## 🛠️ 前置準備

### 必要工具
- [x] Git 已安裝 (`git --version` 檢查)
- [x] GitHub 帳號
- [x] 網路連線

### 檢查清單
- [x] 專案檔案整理完成
- [x] README.md 撰寫完成
- [x] LICENSE 檔案確認
- [x] .gitignore 設定完成

---

## 🚀 步驟 1：建立 GitHub Repository

### 1.1 登入 GitHub
```
網址：https://github.com
登入你的帳號
```

### 1.2 建立新 Repository
```
1. 點擊右上角 "+" 按鈕
2. 選擇 "New repository"
3. 填入 Repository 資訊：
   - Repository name: [專案名稱]
   - Description: [專案描述]
   - 選擇 Public (公開)
   - 不要勾選 "Add a README file"
   - 不要勾選 "Add .gitignore"
   - License: 選擇 "None"
4. 點擊 "Create repository"
```

### 1.3 記錄 Repository 資訊
```
Repository URL: https://github.com/[用戶名]/[專案名稱].git
用戶名: [你的GitHub用戶名]
專案名稱: [Repository名稱]
```

---

## 🔧 步驟 2：本地 Git 設定

### 2.1 開啟命令提示字元
```powershell
# Windows: 在專案資料夾按住 Shift + 右鍵，選擇「在此處開啟 PowerShell 視窗」
# 或使用 Windows Terminal / Command Prompt
```

### 2.2 檢查 Git 版本
```bash
git --version
```
**預期結果**: 顯示 Git 版本號

### 2.3 設定 Git 用戶資訊（首次使用）
```bash
git config --global user.name "你的姓名"
git config --global user.email "你的email@gmail.com"
```

### 2.4 初始化 Git Repository
```bash
git init
```
**預期結果**: `Initialized empty Git repository`

---

## 📤 步驟 3：準備上傳檔案

### 3.1 檢查檔案狀態
```bash
git status
```
**預期結果**: 顯示未追蹤的檔案清單

### 3.2 加入所有檔案到版本控制
```bash
git add .
```

### 3.3 確認加入的檔案
```bash
git status
```
**預期結果**: 顯示準備提交的檔案（綠色）

### 3.4 建立第一個 Commit
```bash
git commit -m "Initial commit: [專案名稱] v[版本號]"
```
**預期結果**: 顯示提交的檔案數量和變更

---

## 🔐 步驟 4：設定身份驗證

### 4.1 建立 Personal Access Token
```
1. 前往：https://github.com/settings/tokens
2. 點擊 "Generate new token" → "Generate new token (classic)"
3. 填入資訊：
   - Note: [專案名稱] Upload Token
   - Expiration: 30 days (或依需求)
   - 勾選權限：
     ✅ repo (完整的 repository 存取權限)
4. 點擊 "Generate token"
5. 複製 Token（只會顯示一次！）
```

### 4.2 設定 Git Credential Manager
```bash
git config --global credential.helper manager-core
```

---

## 🌐 步驟 5：連接並上傳到 GitHub

### 5.1 連接到遠端 Repository
```bash
git remote add origin https://github.com/[用戶名]/[專案名稱].git
```

### 5.2 設定主分支名稱
```bash
git branch -M main
```

### 5.3 第一次推送
```bash
git push -u origin main
```

**可能的情況**:

#### 情況 A：成功推送
```
預期結果: 顯示上傳進度和成功訊息
```

#### 情況 B：需要身份驗證
```
1. 瀏覽器會自動開啟 GitHub 登入頁面
2. 登入你的 GitHub 帳號
3. 授權存取
4. 回到命令列等待完成
```

#### 情況 C：權限錯誤 (403)
```bash
# 使用 Token 方式
git remote set-url origin https://[Token]@github.com/[用戶名]/[專案名稱].git
git push origin main
```

#### 情況 D：Repository 已有檔案（合併衝突）
```bash
# 先拉取遠端變更
git pull origin main --allow-unrelated-histories

# 如果有衝突，選擇使用本地版本
git checkout --ours [衝突檔案名稱]
git add [衝突檔案名稱]

# 完成合併
git commit -m "Merge remote changes"
git push origin main
```

---

## 🌍 步驟 6：設定 GitHub Pages

### 6.1 進入 Repository 設定
```
1. 前往你的 Repository 頁面
2. 點擊 "Settings" 標籤
```

### 6.2 設定 Pages
```
1. 在左側選單找到 "Pages"
2. 設定部署來源：
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
3. 點擊 "Save"
```

### 6.3 等待部署完成
```
1. 等待 2-5 分鐘
2. 頁面會顯示網站網址：
   https://[用戶名].github.io/[專案名稱]/
3. 點擊網址測試是否正常運作
```

---

## 🔄 後續更新流程

### 更新檔案並上傳
```bash
# 1. 修改檔案後，檢查變更
git status

# 2. 加入變更的檔案
git add .

# 3. 提交變更
git commit -m "Update: [描述你的變更]"

# 4. 推送到 GitHub
git push origin main
```

### 版本標籤（可選）
```bash
# 建立版本標籤
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 🚨 常見問題與解決方案

### 問題 1：`git` 不是內部或外部命令
**解決方案**:
```
1. 下載並安裝 Git: https://git-scm.com/download/windows
2. 重新啟動命令提示字元
3. 執行 git --version 確認安裝成功
```

### 問題 2：權限被拒絕 (Permission denied)
**解決方案**:
```bash
# 檢查 Token 是否正確
git remote -v

# 重新設定 remote URL
git remote set-url origin https://[新Token]@github.com/[用戶名]/[專案名稱].git
```

### 問題 3：Repository not found
**解決方案**:
```
1. 確認 Repository 名稱拼寫正確
2. 確認 Repository 是否為 Public
3. 確認用戶名是否正確
```

### 問題 4：合併衝突
**解決方案**:
```bash
# 查看衝突檔案
git status

# 選擇使用本地版本
git checkout --ours [檔案名稱]

# 或選擇使用遠端版本
git checkout --theirs [檔案名稱]

# 加入解決後的檔案
git add [檔案名稱]

# 完成合併
git commit -m "Resolve merge conflict"
```

### 問題 5：GitHub Pages 無法存取
**解決方案**:
```
1. 確認 Repository 為 Public
2. 確認 Pages 設定正確
3. 等待 5-10 分鐘讓部署完成
4. 檢查 index.html 是否在根目錄
```

---

## 📝 檢查清單

### 上傳前檢查
- [ ] Git 已安裝並設定用戶資訊
- [ ] GitHub Repository 已建立
- [ ] Personal Access Token 已建立
- [ ] 專案檔案已整理完成

### 上傳後檢查
- [ ] `git status` 顯示 "nothing to commit, working tree clean"
- [ ] GitHub Repository 頁面顯示所有檔案
- [ ] GitHub Pages 設定完成
- [ ] 網站可以正常存取

### 功能測試
- [ ] 網站首頁正常載入
- [ ] 所有功能正常運作
- [ ] 在不同裝置上測試響應式設計
- [ ] 檢查版權資訊顯示正確

---

## 📞 需要幫助時

### 官方文檔
- Git 官方文檔: https://git-scm.com/doc
- GitHub 說明文檔: https://docs.github.com/

### 常用命令速查
```bash
# 檢查狀態
git status

# 查看提交歷史
git log --oneline

# 查看遠端設定
git remote -v

# 強制推送（謹慎使用）
git push --force origin main

# 復原最後一次提交
git reset --soft HEAD~1
```

---

## 🎯 成功指標

✅ **完成標準**:
1. GitHub Repository 建立成功
2. 所有檔案成功上傳
3. GitHub Pages 網站可正常存取
4. 版權保護機制正確顯示
5. 功能測試全部通過

**恭喜！你已經成功掌握 GitHub 上傳流程！** 🎉

---

**版本**: v1.0  
**建立日期**: 2025-12-30  
**作者**: 徐國洲  
**適用於**: Windows 系統 + PowerShell/CMD