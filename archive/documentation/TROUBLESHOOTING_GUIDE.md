# GitHub 上傳疑難排解指南

## 🔍 診斷工具

### 基本檢查命令
```bash
# 檢查 Git 版本
git --version

# 檢查當前狀態
git status

# 檢查遠端設定
git remote -v

# 檢查分支
git branch -a

# 檢查提交歷史
git log --oneline -n 5
```

---

## 🚨 常見錯誤與解決方案

### 錯誤 1: `'git' 不是內部或外部命令`

**原因**: Git 未安裝或未加入 PATH

**解決方案**:
```bash
# 1. 下載安裝 Git
# 網址: https://git-scm.com/download/windows

# 2. 重新啟動命令提示字元

# 3. 驗證安裝
git --version
```

---

### 錯誤 2: `remote: Repository not found`

**原因**: Repository 名稱錯誤或不存在

**診斷步驟**:
```bash
# 檢查遠端設定
git remote -v
```

**解決方案**:
```bash
# 1. 確認 Repository 存在於 GitHub
# 2. 檢查用戶名和專案名拼寫
# 3. 重新設定遠端 URL
git remote set-url origin https://github.com/正確用戶名/正確專案名.git
```

---

### 錯誤 3: `remote: Permission to repository.git denied`

**原因**: 身份驗證失敗

**診斷步驟**:
```bash
# 檢查當前遠端設定
git remote -v

# 檢查 Git 設定
git config --global user.name
git config --global user.email
```

**解決方案 A - 使用 Personal Access Token**:
```bash
# 1. 建立新的 Token (https://github.com/settings/tokens)
# 2. 勾選 repo 權限
# 3. 複製 Token
# 4. 更新遠端 URL
git remote set-url origin https://TOKEN@github.com/用戶名/專案名.git
```

**解決方案 B - 使用 Git Credential Manager**:
```bash
# 設定 credential helper
git config --global credential.helper manager-core

# 清除舊的認證
git config --global --unset credential.helper

# 重新推送（會彈出登入視窗）
git push origin main
```

---

### 錯誤 4: `fatal: refusing to merge unrelated histories`

**原因**: 本地和遠端有不相關的提交歷史

**解決方案**:
```bash
# 允許合併不相關的歷史
git pull origin main --allow-unrelated-histories

# 如果有衝突，解決衝突後提交
git add .
git commit -m "Merge remote changes"
git push origin main
```

---

### 錯誤 5: 合併衝突 (Merge Conflicts)

**識別衝突**:
```bash
git status
# 會顯示 "both modified" 或 "both added" 的檔案
```

**解決方案**:
```bash
# 方法 1: 使用本地版本
git checkout --ours 衝突檔案名
git add 衝突檔案名

# 方法 2: 使用遠端版本
git checkout --theirs 衝突檔案名
git add 衝突檔案名

# 方法 3: 手動編輯衝突檔案
# 開啟檔案，找到 <<<<<<< HEAD 和 >>>>>>> 標記
# 手動選擇要保留的內容，刪除衝突標記
# 儲存檔案後執行：
git add 衝突檔案名

# 完成合併
git commit -m "Resolve merge conflict"
git push origin main
```

---

### 錯誤 6: `error: failed to push some refs`

**原因**: 遠端有新的提交，本地落後

**解決方案**:
```bash
# 先拉取遠端變更
git pull origin main

# 解決可能的衝突後推送
git push origin main
```

---

### 錯誤 7: GitHub Pages 無法存取

**可能原因與解決方案**:

**原因 1: Repository 為 Private**
```
解決: 將 Repository 設定為 Public
Settings → General → Danger Zone → Change visibility
```

**原因 2: Pages 設定錯誤**
```
解決: 重新設定 Pages
Settings → Pages → Source: Deploy from a branch
Branch: main, Folder: / (root)
```

**原因 3: index.html 不在根目錄**
```bash
# 檢查檔案結構
ls -la
# 確保 index.html 在專案根目錄
```

**原因 4: 部署尚未完成**
```
解決: 等待 5-10 分鐘讓 GitHub 完成部署
檢查 Actions 標籤頁是否有部署進度
```

---

### 錯誤 8: `fatal: not a git repository`

**原因**: 當前目錄不是 Git repository

**解決方案**:
```bash
# 檢查是否在正確的專案目錄
pwd

# 如果在正確目錄但沒有 .git 資料夾
git init

# 如果在錯誤目錄，切換到正確目錄
cd /path/to/your/project
```

---

### 錯誤 9: `error: src refspec main does not exist`

**原因**: 本地沒有 main 分支

**解決方案**:
```bash
# 檢查當前分支
git branch

# 如果在 master 分支，重新命名為 main
git branch -M main

# 或者建立並切換到 main 分支
git checkout -b main
```

---

### 錯誤 10: 檔案太大無法上傳

**原因**: 單一檔案超過 100MB

**解決方案**:
```bash
# 檢查大檔案
find . -size +50M -type f

# 方法 1: 移除大檔案
git rm 大檔案名
git commit -m "Remove large file"

# 方法 2: 使用 Git LFS (Large File Storage)
git lfs install
git lfs track "*.大檔案副檔名"
git add .gitattributes
git add 大檔案名
git commit -m "Add large file with LFS"
```

---

## 🔧 進階疑難排解

### 完全重置本地 Repository
```bash
# 警告：這會刪除所有本地變更！
rm -rf .git
git init
git add .
git commit -m "Fresh start"
git remote add origin https://github.com/用戶名/專案名.git
git push -u origin main --force
```

### 檢查網路連線問題
```bash
# 測試 GitHub 連線
ping github.com

# 測試 HTTPS 連線
curl -I https://github.com

# 如果在公司網路，可能需要設定代理
git config --global http.proxy http://proxy.company.com:port
```

### 清除 Git 快取
```bash
# 清除全域設定
git config --global --unset-all credential.helper

# 清除本地快取
git config --unset credential.helper

# Windows 清除認證管理員
# 控制台 → 認證管理員 → Windows 認證 → 刪除 GitHub 相關項目
```

---

## 📞 尋求幫助

### 官方資源
- **Git 官方文檔**: https://git-scm.com/doc
- **GitHub 說明**: https://docs.github.com/
- **GitHub Community**: https://github.community/

### 檢查系統資訊
```bash
# Git 版本
git --version

# 作業系統
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# PowerShell 版本
$PSVersionTable.PSVersion
```

### 產生診斷報告
```bash
# 建立診斷檔案
echo "=== Git 診斷報告 ===" > git-diagnosis.txt
echo "日期: $(Get-Date)" >> git-diagnosis.txt
echo "" >> git-diagnosis.txt
echo "Git 版本:" >> git-diagnosis.txt
git --version >> git-diagnosis.txt
echo "" >> git-diagnosis.txt
echo "Git 設定:" >> git-diagnosis.txt
git config --list >> git-diagnosis.txt
echo "" >> git-diagnosis.txt
echo "遠端設定:" >> git-diagnosis.txt
git remote -v >> git-diagnosis.txt
echo "" >> git-diagnosis.txt
echo "分支資訊:" >> git-diagnosis.txt
git branch -a >> git-diagnosis.txt
echo "" >> git-diagnosis.txt
echo "最近提交:" >> git-diagnosis.txt
git log --oneline -n 5 >> git-diagnosis.txt
```

---

## ✅ 預防措施

### 定期備份
```bash
# 建立專案備份
git bundle create backup.bundle --all

# 從備份恢復
git clone backup.bundle restored-project
```

### 最佳實踐
1. **定期提交**: 小步驟、頻繁提交
2. **清楚的提交訊息**: 描述做了什麼變更
3. **分支管理**: 使用分支進行功能開發
4. **定期同步**: 經常 pull 遠端變更
5. **備份重要檔案**: 不要只依賴 Git

---

**💡 記住**: 大部分問題都可以透過重新設定遠端 URL 和身份驗證來解決！

**版本**: v1.0  
**更新日期**: 2025-12-30