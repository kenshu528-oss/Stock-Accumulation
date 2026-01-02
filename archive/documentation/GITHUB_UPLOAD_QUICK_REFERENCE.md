# GitHub 上傳快速參考卡

## 🚀 快速上傳流程（5分鐘版）

### 前置準備
```bash
# 檢查 Git
git --version

# 設定用戶（首次）
git config --global user.name "你的姓名"
git config --global user.email "你的email"
```

### 上傳步驟
```bash
# 1. 初始化
git init

# 2. 加入檔案
git add .

# 3. 提交
git commit -m "Initial commit: 專案名稱 v版本號"

# 4. 連接遠端（替換用戶名和專案名）
git remote add origin https://github.com/用戶名/專案名.git

# 5. 設定分支
git branch -M main

# 6. 推送
git push -u origin main
```

---

## 🔐 身份驗證快速設定

### Personal Access Token
1. 前往: https://github.com/settings/tokens
2. "Generate new token (classic)"
3. 勾選 `repo` 權限
4. 複製 Token

### 使用 Token 推送
```bash
git remote set-url origin https://TOKEN@github.com/用戶名/專案名.git
git push origin main
```

---

## 🌐 GitHub Pages 快速設定

1. Repository → Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "main", Folder: "/ (root)"
4. Save

**網址**: `https://用戶名.github.io/專案名/`

---

## 🔄 更新流程
```bash
git add .
git commit -m "Update: 描述變更"
git push origin main
```

---

## 🚨 常見錯誤快速修復

### 權限錯誤 (403)
```bash
git remote set-url origin https://新TOKEN@github.com/用戶名/專案名.git
```

### Repository not found
- 檢查用戶名和專案名拼寫
- 確認 Repository 為 Public

### 合併衝突
```bash
git pull origin main --allow-unrelated-histories
git checkout --ours 衝突檔案
git add 衝突檔案
git commit -m "Resolve conflict"
git push origin main
```

---

## 📋 檢查清單

**上傳前**:
- [ ] Git 已安裝
- [ ] GitHub Repository 已建立
- [ ] Token 已建立

**上傳後**:
- [ ] `git status` 顯示乾淨
- [ ] GitHub 顯示所有檔案
- [ ] Pages 網站可存取

---

**💡 提示**: 將此檔案加入書籤，方便日後參考！