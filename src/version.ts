/**
 * 版本資訊管理 - v1.3.X 架構
 * Version Information Management for v1.3.X Architecture
 * 
 * 此檔案包含應用程式的版本資訊、建置資訊和版本歷史
 */

/**
 * 當前版本資訊
 */
export const VERSION = {
  /** 完整版本號 */
  full: 'v1.3.0.0014',
  
  /** 主版本號 */
  major: 1,
  
  /** 次版本號 */
  minor: 3,
  
  /** 修訂版本號 */
  patch: 0,
  
  /** 建置號 */
  build: 14,
  
  /** 版本代號 */
  codename: 'TypeScript Architecture',
  
  /** 發布日期 */
  releaseDate: '2025-01-02',
  
  /** 建置時間（由建置工具自動填入） */
  buildTime: new Date().toISOString(),
  
  /** 是否為開發版本 */
  isDevelopment: process.env.NODE_ENV === 'development',
  
  /** Git 提交雜湊（如果可用） */
  gitHash: process.env.VITE_GIT_HASH || 'unknown',
} as const;

/**
 * 版本歷史記錄
 */
export const VERSION_HISTORY = [
  {
    version: 'v1.3.0.0014',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '新增完整技術棧文件',
    description: '在設計文件中新增詳細的技術棧資訊，包含核心技術、建置工具、部署配置等',
    features: [
      '📝 新增技術棧章節到設計文件',
      '📝 詳細記錄 TypeScript 5.0+ 配置',
      '📝 說明 Vite 5.0 建置工具配置',
      '📝 記錄 GitHub Pages 部署策略',
      '📝 說明 CORS 代理解決方案',
      '📝 完整的開發工具鏈文件',
    ],
  },
  {
    version: 'v1.3.0.0013',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修復新增股票功能',
    description: '修正新增股票後更新股價時使用錯誤參數的問題',
    features: [
      '🔧 修正 handleAddStock 使用股票 ID 而非股票代碼更新股價',
      '🔧 新增股票後自動重新載入頁面',
      '🔧 改善錯誤處理，股價更新失敗不影響新增成功',
      '✅ 新增股票功能正常運作',
    ],
  },
  {
    version: 'v1.3.0.0012',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修正本地資料庫錯誤資料',
    description: '修正 006208 為富邦台50 ETF（非巨大），新增 9921 巨大',
    features: [
      '🔧 修正本地資料庫：006208 改為富邦台50 (ETF)',
      '🔧 新增 9921 巨大（上市）',
      '✅ 確保股票名稱正確對照',
    ],
  },
  {
    version: 'v1.3.0.0011',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修正新增個股查詢邏輯並更新規格',
    description: '移除新增個股時使用本地資料庫作為查詢來源，僅使用 Yahoo 和證交所 API',
    features: [
      '🔧 修正 searchStockByCode 方法，移除本地資料庫查詢',
      '🔧 新增個股時只使用 Yahoo API 和證交所 API',
      '📝 在設計文件中明確規範新增個股查詢規則',
      '📝 本地資料庫僅用於提供中文名稱對照',
      '✅ 確保查詢邏輯符合規格要求',
    ],
  },
  {
    version: 'v1.3.0.0010',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修正本地資料庫錯誤資料並更新規格',
    description: '修正 4585 為達明（非宏達電），預設改為深色模式，並在設計文件中明確規範不可使用本地資料庫查詢股價',
    features: [
      '🔧 修正本地資料庫：4585 改為達明（上櫃）',
      '🔧 預設改為深色模式',
      '🔧 移除本地資料庫的股價查詢功能',
      '📝 在設計文件中明確規範股價查詢規則',
      '📝 本地資料庫僅用於提供中文名稱對照',
    ],
  },
  {
    version: 'v1.3.0.0009',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修復股價顯示和深色模式功能',
    description: '修復查詢時股價不顯示的問題，並實作深色模式切換功能',
    features: [
      '🔧 修復查詢時沒有股價時自動補查股價',
      '🔧 實作深色模式切換功能',
      '🔧 深色模式設定儲存到 localStorage',
      '🔧 預設為亮色模式',
      '✅ 深色模式按鈕正常運作',
    ],
  },
  {
    version: 'v1.3.0.0008',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修復股票名稱顯示和查詢備援',
    description: '優先顯示本地資料庫的中文名稱，並加入本地資料庫作為查詢備援',
    features: [
      '🔧 Yahoo API 查詢時優先使用本地資料庫的中文名稱',
      '🔧 searchStockByCode 加入本地資料庫作為第三備援',
      '🔧 證交所 API 查詢時也使用本地資料庫的中文名稱',
      '✅ 股票名稱正確顯示為中文',
    ],
  },
  {
    version: 'v1.3.0.0007',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '改用 Yahoo API 優先查詢',
    description: '變更搜尋順序為 Yahoo API 優先，移除本地資料庫查找',
    features: [
      '🔧 變更搜尋順序：Yahoo API → 證交所 API',
      '🔧 新增 fetchStockInfoFromYahoo 方法',
      '🔧 Yahoo API 可返回完整股票名稱',
      '✅ 查詢功能更穩定可靠',
    ],
  },
  {
    version: 'v1.3.0.0006',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '擴充本地股票資料庫',
    description: '新增 006208(巨大)、4585(宏達電)、6188(廣明) 到本地資料庫',
    features: [
      '🔧 新增 006208 巨大',
      '🔧 新增 4585 宏達電',
      '🔧 新增 6188 廣明',
      '✅ 查詢時正確顯示股票名稱',
    ],
  },
  {
    version: 'v1.3.0.0005',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修復查詢欄位清除問題',
    description: '修復每次查詢前清空所有欄位，避免殘留舊資料',
    features: [
      '🔧 查詢前清空股票名稱欄位',
      '🔧 查詢前清空成本價欄位',
      '🔧 查詢前清空狀態提示',
      '✅ 避免欄位殘留舊資料',
    ],
  },
  {
    version: 'v1.3.0.0004',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修復股票查詢防抖動與顯示',
    description: '加入防抖動機制避免查詢被覆蓋，修復股票名稱顯示格式',
    features: [
      '🔧 加入 500ms 防抖動機制',
      '🔧 修復股票名稱顯示格式',
      '🔧 加入查詢中狀態提示',
      '✅ 查詢功能穩定運作',
    ],
  },
  {
    version: 'v1.3.0.0003',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修復對話框事件綁定',
    description: '修復新增股票對話框的關閉和表單提交功能',
    features: [
      '🔧 修復對話框關閉按鈕功能',
      '🔧 添加股票代碼自動查詢',
      '🔧 修復表單提交功能',
      '✅ 對話框完整功能正常運作',
    ],
  },
  {
    version: 'v1.3.0.0002',
    date: '2025-01-02',
    type: 'patch' as const,
    title: '修復全域物件暴露問題',
    description: '修復按鈕功能無法使用的問題',
    features: [
      '🔧 修復全域物件暴露問題',
      '🔧 添加 portfolio 物件相容性',
      '🔧 修復版權資訊顯示功能',
      '✅ 所有按鈕功能正常運作',
    ],
  },
  {
    version: 'v1.3.0.0001',
    date: '2025-01-02',
    type: 'major' as const,
    title: 'TypeScript 架構升級',
    description: '完全重寫為 TypeScript 模組化架構',
    features: [
      '🏗️ TypeScript 架構重構',
      '📦 模組化設計（Managers, Services, Utils）',
      '🔧 依賴注入機制',
      '📊 完整的型別定義',
      '🔄 資料遷移功能（v1.2.X → v1.3.X）',
      '🚀 Vite 建置工具',
      '🧪 Jest 測試框架',
      '📈 即時股價 API（證交所 + Yahoo Finance）',
      '💾 版本隔離儲存',
      '⚡ 效能最佳化',
    ],
    breaking: [
      '需要 Node.js 環境進行開發',
      '與 v1.2.X 資料格式不相容（提供遷移工具）',
      'API 介面完全重新設計',
    ],
    migration: {
      from: 'v1.2.X',
      automatic: true,
      preserveOldData: true,
      guide: '系統會自動偵測舊版資料並提示遷移',
    },
  },
  {
    version: 'v1.2.2.0008',
    date: '2024-12-24',
    type: 'patch' as const,
    title: '最後的 v1.2.X 版本',
    description: 'v1.2.X 系列的最終版本，已遷移至 archive/legacy-system/',
    features: [
      '🔧 Bug 修復和穩定性改進',
      '📱 響應式設計優化',
      '🎨 UI/UX 改進',
    ],
    status: 'archived',
    location: 'archive/legacy-system/',
  },
] as const;

/**
 * 版本比較功能
 */
export class VersionManager {
  /**
   * 解析版本字串
   * @param versionString - 版本字串，如 "v1.3.0.0001"
   * @returns 解析後的版本物件
   */
  static parseVersion(versionString: string) {
    const match = versionString.match(/^v?(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (!match) {
      throw new Error(`無效的版本格式: ${versionString}`);
    }
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      build: parseInt(match[4], 10),
      full: versionString,
    };
  }
  
  /**
   * 比較兩個版本
   * @param version1 - 版本 1
   * @param version2 - 版本 2
   * @returns -1: version1 < version2, 0: 相等, 1: version1 > version2
   */
  static compareVersions(version1: string, version2: string): number {
    const v1 = this.parseVersion(version1);
    const v2 = this.parseVersion(version2);
    
    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    if (v1.patch !== v2.patch) return v1.patch - v2.patch;
    return v1.build - v2.build;
  }
  
  /**
   * 檢查是否為相容版本
   * @param currentVersion - 當前版本
   * @param requiredVersion - 需要的版本
   * @returns 是否相容
   */
  static isCompatible(currentVersion: string, requiredVersion: string): boolean {
    const current = this.parseVersion(currentVersion);
    const required = this.parseVersion(requiredVersion);
    
    // 主版本號必須相同
    if (current.major !== required.major) return false;
    
    // 次版本號必須大於等於需要的版本
    if (current.minor < required.minor) return false;
    
    return true;
  }
  
  /**
   * 取得版本資訊摘要
   * @returns 版本資訊摘要
   */
  static getVersionSummary() {
    return {
      version: VERSION.full,
      codename: VERSION.codename,
      releaseDate: VERSION.releaseDate,
      buildTime: VERSION.buildTime,
      isDevelopment: VERSION.isDevelopment,
      architecture: 'TypeScript Modular',
      compatibility: {
        node: '>=18.0.0',
        browsers: ['Chrome >= 80', 'Firefox >= 78', 'Safari >= 14'],
      },
    };
  }
  
  /**
   * 檢查是否需要更新
   * @param latestVersion - 最新版本
   * @returns 是否需要更新
   */
  static needsUpdate(latestVersion: string): boolean {
    return this.compareVersions(VERSION.full, latestVersion) < 0;
  }
}

/**
 * 版本資訊顯示功能
 */
export function showVersionInfo(): void {
  const summary = VersionManager.getVersionSummary();
  
  console.group(`📦 存股紀錄系統 ${summary.version}`);
  console.log(`🏷️  代號: ${summary.codename}`);
  console.log(`📅 發布日期: ${summary.releaseDate}`);
  console.log(`🔨 建置時間: ${summary.buildTime}`);
  console.log(`🏗️  架構: ${summary.architecture}`);
  console.log(`🌍 環境: ${summary.isDevelopment ? '開發' : '生產'}`);
  console.log(`🔧 Node.js: ${summary.compatibility.node}`);
  console.log(`🌐 瀏覽器: ${summary.compatibility.browsers.join(', ')}`);
  console.groupEnd();
}

/**
 * 版本變更日誌
 */
export function showChangelog(): void {
  console.group('📋 版本歷史');
  
  VERSION_HISTORY.forEach((release) => {
    console.group(`${release.version} (${release.date})`);
    console.log(`📝 ${release.title}`);
    console.log(`📄 ${release.description}`);
    
    if (release.features.length > 0) {
      console.log('✨ 新功能:');
      release.features.forEach(feature => console.log(`  ${feature}`));
    }
    
    if ('breaking' in release && release.breaking && release.breaking.length > 0) {
      console.log('⚠️ 重大變更:');
      release.breaking.forEach((change: string) => console.log(`  • ${change}`));
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

/**
 * 匯出版本常數供全域使用
 */
export default VERSION;

// 在開發模式下自動顯示版本資訊
if (VERSION.isDevelopment && typeof window !== 'undefined') {
  // 延遲顯示，避免干擾應用程式初始化日誌
  setTimeout(() => {
    showVersionInfo();
  }, 1000);
}