/**
 * 存股紀錄系統 - 版本管理模組
 * Stock Portfolio System - Version Management Module
 * 
 * 版權所有 (c) 2025 徐國洲
 * Copyright (c) 2025 Xu Guo Zhou
 * 
 * 採用 CC BY-NC 4.0 授權條款 (禁止商業使用)
 * Licensed under CC BY-NC 4.0 License (Non-Commercial)
 */

// 版本管理系統
class VersionManager {
    constructor() {
        this.currentVersion = 'v1.2.2.0034';
        this.versionHistory = [
            {
                version: '1.0.0.0',
                date: '2025-12-24',
                features: [
                    '基本股票管理功能',
                    '多帳戶支援',
                    '即時股價更新',
                    '損益計算'
                ]
            },
            {
                version: '1.1.0.0',
                date: '2025-12-24',
                features: [
                    '真實股價 API 整合',
                    '多重資料源備援',
                    '即時編輯股數和成本價',
                    '批量編輯功能',
                    '個別股票更新'
                ]
            },
            {
                version: '1.2.0.0',
                date: '2025-12-24',
                features: [
                    '雲端同步功能',
                    '跨裝置資料同步',
                    '版本管理系統',
                    '帳戶管理功能 (刪除/更名)',
                    '部署指南'
                ]
            },
            {
                version: '1.2.0.3',
                date: '2025-12-24',
                features: [
                    '新增深色模式功能',
                    '支援亮色/深色主題切換',
                    '改善夜間使用體驗',
                    '自動記憶使用者偏好設定'
                ]
            },
            {
                version: '1.2.1.0',
                date: '2025-12-30',
                features: [
                    '完整股息管理系統',
                    '股息記錄與統計',
                    '自動調整成本價功能',
                    '真實報酬率計算',
                    '股息殖利率分析',
                    '個股股息設定管理',
                    'UI 界面優化',
                    '雙隱私保護系統',
                    '購買追蹤與自動股息計算'
                ]
            },
            {
                version: '1.2.2.0',
                date: '2025-12-30',
                features: [
                    '版權保護升級 (CC BY-NC 4.0)',
                    '明確禁止商業使用',
                    '新增商業使用聲明文件',
                    '完整文檔套件',
                    'GitHub 上傳標準作業程序',
                    '快速參考卡',
                    '疑難排解指南',
                    '版權資訊更新',
                    '保護機制強化'
                ]
            },
            {
                version: '1.2.2.0001',
                date: '2025-01-02',
                features: [
                    '導入4位數版本號機制',
                    '建立開發執行規則',
                    '清理多餘檔案',
                    '準備搜尋順序優化'
                ]
            },
            {
                version: '1.2.2.0002',
                date: '2025-01-02',
                features: [
                    '優化股票搜尋順序',
                    '搜尋順序：本地中文名稱 + 證交所API驗證',
                    '備援：Yahoo Finance → 證交所API → 錯誤提示',
                    '優先顯示中文股票名稱'
                ]
            },
            {
                version: '1.2.2.0003',
                date: '2025-01-02',
                features: [
                    '修正搜尋問題',
                    '新增光寶科(2301)到本地資料庫',
                    '修正股號搜尋顯示英文名問題',
                    '修正名稱搜尋找不到股票問題'
                ]
            },
            {
                version: '1.2.2.0004',
                date: '2025-01-02',
                features: [
                    '修正搜尋順序邏輯',
                    '正確實作搜尋順序：證交所API → Yahoo Finance → 本地資料庫 → 錯誤',
                    '優先使用API驗證股票存在性',
                    '保持中文名稱優先顯示'
                ]
            },
            {
                version: '1.2.2.0005',
                date: '2025-01-02',
                features: [
                    '修正名稱搜尋邏輯',
                    '改善searchStockByName函數遵循搜尋順序',
                    '新增環泥(1104)到本地資料庫',
                    '名稱搜尋後用證交所API驗證'
                ]
            },
            {
                version: '1.2.2.0006',
                date: '2025-01-02',
                features: [
                    '新增廣明光電(6188)到本地資料庫',
                    '修正名稱搜尋找不到廣明的問題',
                    '持續完善本地股票資料庫'
                ]
            },
            {
                version: '1.2.2.0007',
                date: '2025-01-02',
                features: [
                    '修正searchStockByName函數違反搜尋順序規則',
                    '強制遵循搜尋順序：證交所API → Yahoo Finance → 本地資料庫',
                    '不再跳過API搜尋步驟',
                    '完整實作搜尋順序軟體規則'
                ]
            },
            {
                version: '1.2.2.0008',
                date: '2025-01-02',
                features: [
                    '修正Yahoo Finance API搜尋邏輯',
                    '移除name !== code的限制條件',
                    '修正4585達明等股票找不到的問題',
                    '確保API搜尋步驟不被跳過'
                ]
            },
            {
                version: '1.2.2.0009',
                date: '2025-01-02',
                features: [
                    '完整重構證交所API支援',
                    '新增上市、上櫃、興櫃、ETF全市場支援',
                    '智能判斷股票類型並使用對應API',
                    '確保所有台灣證券商品都可被搜尋'
                ]
            },
            {
                version: '1.2.2.0024',
                date: '2025-01-02',
                features: [
                    '完成證交所API整合到主程式',
                    '修正股價更新邏輯使用新API模組',
                    '修正新增股票時的股價獲取',
                    '確保遵循搜尋順序：證交所API → Yahoo Finance → 本地資料庫',
                    '版本號統一更新',
                    '系統整合測試完成'
                ]
            },
            {
                version: '1.2.2.0025',
                date: '2025-01-02',
                features: [
                    '修正股票搜尋功能無法找到股票的問題',
                    '新增StockAPI.getStockInfo方法',
                    '優化searchStockByCode邏輯，優先使用本地資料庫',
                    '修正新增股票時的錯誤處理',
                    '確保2330等常見股票可以正常搜尋',
                    '改善錯誤訊息顯示'
                ]
            },
            {
                version: '1.2.2.0026',
                date: '2025-01-02',
                features: [
                    '修正搜尋邏輯回歸正確順序：證交所API → Yahoo Finance → 本地資料庫',
                    '新增達明(4585)到本地股票資料庫',
                    '建立股票搜尋順序強制規則',
                    '防止未來再次違反搜尋順序',
                    '確保遵循軟體核心邏輯規範',
                    '強化搜尋規則文檔化'
                ]
            },
            {
                version: '1.2.2.0027',
                date: '2025-01-02',
                features: [
                    '合併股票搜尋欄位：支援股號或名稱輸入',
                    '搜尋結果顯示股價資訊',
                    '遵循最小改動原則：隱藏而非刪除原有欄位',
                    '統一搜尋邏輯：自動判斷輸入類型',
                    '建立最小改動原則開發規範',
                    '確保向後相容性'
                ]
            },
            {
                version: '1.2.2.0028',
                date: '2025-01-02',
                features: [
                    '新增金寶(2312)到股票資料庫',
                    '擴充常見股票支援'
                ]
            },
            {
                version: '1.2.2.0029',
                date: '2025-01-02',
                features: [
                    '修正searchStockByName函數違反搜尋順序的重大問題',
                    '確保名稱搜尋也遵循：證交所API → Yahoo Finance → 本地資料庫',
                    '移除空的註釋，實作真正的API調用',
                    '修正搜尋邏輯合規性',
                    '確保所有搜尋函數都遵循強制順序規則'
                ]
            },
            {
                version: '1.2.2.0030',
                date: '2025-01-02',
                features: [
                    '修正StockAPI優先順序：證交所API改為priority 1',
                    '優化API超時時間：10秒→3秒，提高搜尋速度',
                    '確保搜尋順序真正遵循：TWSE → Yahoo Finance → Investing',
                    '解決搜尋速度慢的問題',
                    '股價顯示格式優化'
                ]
            },
            {
                version: '1.2.2.0031',
                date: '2025-01-02',
                features: [
                    '修正搜尋失敗提示：改為"請重新輸入"',
                    '新增達廣(6589)和達麗(6177)到股票資料庫',
                    '分析Yahoo Finance搜尋API實作方式',
                    'Yahoo使用search API: query1.finance.yahoo.com/v1/finance/search',
                    '擴充股票資料庫支援更多股票'
                ]
            },
            {
                version: '1.2.2.0032',
                date: '2025-01-02',
                features: [
                    '新增00878(國泰永續高股息)股息資料庫',
                    '支援2025年3次除息記錄(Q1/Q2/Q3各0.37元)',
                    '修正股息收入計算錯誤問題',
                    '確保購買後的除息自動計算',
                    '成本價自動調整功能已內建於calculateHistoricalDividends'
                ]
            },
            {
                version: '1.2.2.0033',
                date: '2025-01-02',
                features: [
                    '修正00878股息金額為官方正確數據',
                    '2025 Q1: 0.47元 (除息日: 2025-05-19)',
                    '2025 Q2: 0.4元 (除息日: 2025-08-18)',
                    '2025 Q3: 0.4元 (除息日: 2025-11-18)',
                    '資料來源：公開資訊觀測站官方除權息日程表',
                    '總股息: 1.27元/股'
                ]
            },
            {
                version: '1.2.2.0034',
                date: '2025-01-02',
                features: [
                    '修正股息計算邏輯：預設不扣稅',
                    '股息收入顯示稅前金額',
                    '新增詳細的股息計算除錯日誌',
                    '修正股息計算錯誤問題',
                    '1000股 × 1.27元 = 1,270元（正確）'
                ]
            }
        ];
        
        this.checkForUpdates();
    }

    getCurrentVersion() {
        return this.currentVersion;
    }

    getVersionHistory() {
        return this.versionHistory;
    }

    checkForUpdates() {
        const savedVersion = localStorage.getItem('app_version');
        
        if (!savedVersion) {
            // 首次使用
            this.showWelcomeMessage();
            localStorage.setItem('app_version', this.currentVersion);
        } else if (savedVersion !== this.currentVersion) {
            // 版本更新
            this.showUpdateMessage(savedVersion, this.currentVersion);
            localStorage.setItem('app_version', this.currentVersion);
            
            // 執行資料遷移 (如果需要)
            this.migrateData(savedVersion, this.currentVersion);
        }
    }

    showWelcomeMessage() {
        const message = `
🎉 歡迎使用存股紀錄系統！

版本: ${this.currentVersion}

主要功能:
• 多帳戶股票管理
• 即時股價更新
• 損益計算
• 雲端同步
• 跨裝置使用

開始使用前，建議先設定雲端同步功能，
這樣就能在不同裝置間同步資料！
        `;
        
        alert(message);
    }

    showUpdateMessage(oldVersion, newVersion) {
        const latestUpdate = this.versionHistory.find(v => v.version === newVersion);
        
        let message = `🚀 系統已更新！\n\n`;
        message += `${oldVersion} → ${newVersion}\n\n`;
        message += `新功能:\n`;
        
        if (latestUpdate) {
            latestUpdate.features.forEach(feature => {
                message += `• ${feature}\n`;
            });
        }
        
        message += `\n感謝您的使用！`;
        
        alert(message);
    }

    migrateData(fromVersion, toVersion) {
        console.log(`執行資料遷移: ${fromVersion} → ${toVersion}`);
        
        // 根據版本執行不同的遷移邏輯
        if (this.compareVersions(fromVersion, '1.1.0.0') < 0) {
            this.migrateToV110();
        }
        
        if (this.compareVersions(fromVersion, '1.2.0.0') < 0) {
            this.migrateToV120();
        }
        
        if (this.compareVersions(fromVersion, '1.2.0.3') < 0) {
            this.migrateToV1203();
        }
        
        if (this.compareVersions(fromVersion, '1.2.1.0') < 0) {
            this.migrateToV1210();
        }
        
        if (this.compareVersions(fromVersion, '1.2.2.0') < 0) {
            this.migrateToV1220();
        }
    }

    migrateToV110() {
        console.log('遷移到 v1.1.0.0...');
        // 新增 error 和 source 欄位到現有股票
        const data = JSON.parse(localStorage.getItem('stockPortfolio') || '{}');
        if (data.stocks) {
            data.stocks.forEach(stock => {
                if (!stock.hasOwnProperty('error')) {
                    stock.error = null;
                }
                if (!stock.hasOwnProperty('source')) {
                    stock.source = null;
                }
            });
            localStorage.setItem('stockPortfolio', JSON.stringify(data));
        }
    }

    migrateToV120() {
        console.log('遷移到 v1.2.0.0...');
        // 新增 lastSync 欄位
        const data = JSON.parse(localStorage.getItem('stockPortfolio') || '{}');
        if (!data.lastSync) {
            data.lastSync = new Date().toISOString();
            localStorage.setItem('stockPortfolio', JSON.stringify(data));
        }
    }

    migrateToV1203() {
        console.log('遷移到 v1.2.0.3...');
        // 初始化深色模式設定
        if (localStorage.getItem('darkMode') === null) {
            localStorage.setItem('darkMode', 'false'); // 預設使用亮色模式
        }
        console.log('已初始化深色模式功能');
    }

    migrateToV1210() {
        console.log('遷移到 v1.2.1.0...');
        // 初始化股息管理功能
        const data = JSON.parse(localStorage.getItem('stockPortfolio') || '{}');
        if (data.stocks) {
            data.stocks.forEach(stock => {
                // 新增股息相關欄位
                if (!stock.hasOwnProperty('dividends')) {
                    stock.dividends = [];
                }
                if (!stock.hasOwnProperty('totalDividends')) {
                    stock.totalDividends = 0;
                }
                if (!stock.hasOwnProperty('adjustedCostPrice')) {
                    stock.adjustedCostPrice = stock.costPrice;
                }
                if (!stock.hasOwnProperty('dividendAdjustment')) {
                    stock.dividendAdjustment = true; // 預設啟用股息調整
                }
            });
            localStorage.setItem('stockPortfolio', JSON.stringify(data));
        }
        
        // 初始化股息管理設定
        if (localStorage.getItem('globalDividendAdjustment') === null) {
            localStorage.setItem('globalDividendAdjustment', 'true');
        }
        if (localStorage.getItem('defaultTaxRate') === null) {
            localStorage.setItem('defaultTaxRate', '10'); // 預設扣稅率 10%
        }
        
        console.log('已初始化股息管理功能');
    }

    migrateToV1220() {
        console.log('遷移到 v1.2.2.0...');
        // 版權保護升級通知
        const message = `
🔒 重要更新：版權保護升級

本系統已更新為 CC BY-NC 4.0 授權條款：
✅ 允許個人使用、修改、分發
❌ 禁止商業使用

新增功能：
• 完整的 GitHub 上傳文檔套件
• 標準作業程序 (SOP)
• 快速參考卡
• 疑難排解指南

如需商業使用，請聯絡：kenshu528@gmail.com
        `;
        
        // 顯示版權更新通知（只顯示一次）
        if (localStorage.getItem('copyrightNoticeShown') !== '1.2.2.0') {
            setTimeout(() => {
                alert(message);
                localStorage.setItem('copyrightNoticeShown', '1.2.2.0');
            }, 2000); // 延遲2秒顯示，避免與其他通知衝突
        }
        
        console.log('已完成版權保護升級');
    }

    compareVersions(version1, version2) {
        // 支援四位數版本號比較 (major.minor.patch.build)
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        // 確保都是四位數版本號
        while (v1parts.length < 4) v1parts.push(0);
        while (v2parts.length < 4) v2parts.push(0);
        
        for (let i = 0; i < 4; i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }

    showVersionInfo() {
        let info = `📋 版本資訊\n\n`;
        info += `目前版本: ${this.currentVersion}\n\n`;
        info += `版本歷史:\n`;
        
        this.versionHistory.reverse().forEach(version => {
            info += `\n${version.version} (${version.date})\n`;
            version.features.forEach(feature => {
                info += `• ${feature}\n`;
            });
        });
        
        alert(info);
    }

    exportVersionInfo() {
        return {
            currentVersion: this.currentVersion,
            versionHistory: this.versionHistory,
            lastCheck: new Date().toISOString()
        };
    }
}

// 匯出給主程式使用
window.VersionManager = VersionManager;