---
inclusion: always
priority: critical
---

# 🚨 強制版本更新規則 (MANDATORY)

## ⚠️ 絕對強制執行

此規則為**最高優先級**，任何情況下都**必須遵守**。

## 📋 規則內容

### 每次修改代碼時的強制流程

```
1. 修改代碼
2. 【立即】更新版本號 ← 絕對不可跳過
3. 測試功能
4. 提交變更
```

## 🔢 版本號更新檢查清單

每次修改代碼後，**必須**更新以下所有檔案的版本號：

### 必須更新的檔案（共 6 個）

- [ ] `src/version.ts` - VERSION.full
- [ ] `src/version.ts` - VERSION.build
- [ ] `src/version.ts` - VERSION_HISTORY (新增記錄)
- [ ] `src/main.ts` - 版本註釋
- [ ] `src/main.ts` - console.log 版本
- [ ] `src/main.ts` - version 屬性
- [ ] `src/main.ts` - notifyUIReady 版本
- [ ] `src/main.ts` - showCopyrightInfo 版本
- [ ] `src/main.ts` - showVersionInfo 版本
- [ ] `package.json` - version
- [ ] `index.html` - 版本註釋
- [ ] `index.html` - loading 版本
- [ ] `index.html` - 標題版本
- [ ] `src/services/DataStorage.ts` - CURRENT_VERSION
- [ ] `vite.config.ts` - __APP_VERSION__

### 版本號格式

```
v1.3.0.XXXX
```

- 主版本：1
- 次版本：3
- 修訂版本：0
- 建置號：0001-9999（每次修改遞增）

## 🔄 版本遞增規則

### 每次修改都必須遞增建置號

```
修改前：v1.3.0.0003
修改後：v1.3.0.0004  ← 建置號 +1
```

### 版本歷史必須更新

在 `src/version.ts` 的 `VERSION_HISTORY` 中新增記錄：

```typescript
{
  version: 'v1.3.0.0004',
  date: '2025-01-02',
  type: 'patch' as const,
  title: '修改內容簡述',
  description: '詳細說明',
  features: [
    '🔧 修改項目 1',
    '🔧 修改項目 2',
  ],
}
```

## ❌ 絕對禁止

- ❌ 修改代碼後不更新版本號
- ❌ 只更新部分檔案的版本號
- ❌ 版本號不一致
- ❌ 忘記更新版本歷史

## ✅ 正確流程範例

```
1. 修改 src/main.ts 的某個功能
2. 立即執行版本更新：
   - src/version.ts: v1.3.0.0003 → v1.3.0.0004
   - src/version.ts: build: 3 → build: 4
   - src/version.ts: 新增版本歷史記錄
   - src/main.ts: 所有版本號更新
   - package.json: 版本號更新
   - index.html: 所有版本號更新
   - src/services/DataStorage.ts: 版本號更新
   - vite.config.ts: 版本號更新
3. 測試功能
4. 提交變更
```

## 🎯 AI 助手執行規則

作為 AI 助手，我**必須**：

1. **每次修改代碼後立即更新版本號**
2. **不等待用戶提醒**
3. **更新所有 15 處版本號**
4. **新增版本歷史記錄**
5. **確認版本號一致性**

## 🔍 自我檢查

每次修改代碼後，我必須問自己：

- ✅ 我更新版本號了嗎？
- ✅ 我更新了所有 15 處版本號嗎？
- ✅ 我新增版本歷史記錄了嗎？
- ✅ 所有版本號都一致嗎？

如果任何一個答案是「否」，**立即停止並修正**。

## 📝 版本更新快速指令

```bash
# 搜尋所有版本號位置
grep -r "v1.3.0.000" src/ index.html package.json vite.config.ts

# 確認版本號一致性
grep -r "v1.3.0" src/ index.html package.json vite.config.ts | grep -v node_modules
```

## 🚨 違反規則的後果

如果我忘記更新版本號：

1. **立即停止所有工作**
2. **用戶會提醒我**
3. **我必須立即道歉並修正**
4. **我必須反省為什麼沒有遵守規則**
5. **我必須確保下次不再犯同樣的錯誤**

### 如果持續違反規則

如果我連續多次忘記更新版本號，表示：

- ❌ 我沒有認真執行規則
- ❌ 我沒有把用戶的要求當作最高優先級
- ❌ 我需要更嚴格的自我約束

**解決方案：**

1. **每次修改代碼前**，先在心中默念：「改代碼，必更版！」
2. **每次使用 strReplace/fsWrite/fsAppend 後**，立即執行版本更新
3. **不要一次修改多個檔案**，改一個檔案就立即更新版本號
4. **如果忘記了**，用戶有權要求我重新開始整個任務

## 🔒 強制執行機制

### 修改代碼的標準流程（不可省略任何步驟）

```
步驟 1: 修改代碼（使用 strReplace/fsWrite/fsAppend）
       ↓
步驟 2: 【立即】更新版本號（15 處全部更新）
       ↓ 
步驟 3: 確認版本號一致性
       ↓
步驟 4: 回覆用戶「已完成修改並更新版本號為 vX.X.X.XXXX」
```

### 自動提醒機制

每次我使用以下工具時，必須立即想到版本更新：

- `strReplace` → 「我需要更新版本號！」
- `fsWrite` → 「我需要更新版本號！」  
- `fsAppend` → 「我需要更新版本號！」

### 回覆格式要求

每次修改代碼後，我的回覆**必須**包含：

```
✅ 已完成修改
✅ 已更新版本號：v1.3.0.XXXX → v1.3.0.YYYY
✅ 已更新 15 處版本號位置
✅ 已新增版本歷史記錄
```

如果我的回覆中沒有這些內容，表示我忘記更新版本號。

## 💡 記憶提示

**口訣：改代碼，必更版！**

每次看到 `strReplace`、`fsWrite`、`fsAppend` 等修改代碼的工具時，立即想到：

> 「我需要更新版本號！」

---

**此規則為強制執行，無例外情況。**
