/**
 * 存股紀錄系統 - 主要入口點
 * 
 * 系統初始化和模組整合
 */

import { DataStorage } from './services/DataStorage.js';
import { PortfolioData } from './types/interfaces.js';

/**
 * 主要應用程式類別
 */
export class StockPortfolioApp {
  private dataStorage: DataStorage;
  private portfolioData: PortfolioData | null = null;

  constructor() {
    this.dataStorage = new DataStorage();
    this.init();
  }

  /**
   * 初始化應用程式
   */
  private async init(): Promise<void> {
    try {
      console.log('🚀 初始化存股紀錄系統...');
      
      // 載入資料
      this.portfolioData = await this.dataStorage.loadData();
      
      if (this.portfolioData) {
        console.log('✅ 資料載入成功');
        console.log(`📊 股票數量: ${this.portfolioData.stocks.length}`);
        console.log(`🏦 帳戶數量: ${this.portfolioData.accounts.length}`);
        console.log(`📅 最後更新: ${this.portfolioData.lastUpdate}`);
      } else {
        console.log('⚠️ 無法載入資料，使用預設設定');
      }

      // 檢查儲存空間
      const storageUsage = this.dataStorage.getStorageUsage();
      console.log(`💾 儲存空間使用: ${storageUsage.percentage}%`);
      
      if (storageUsage.percentage > 80) {
        console.warn('⚠️ 儲存空間使用率過高，建議清理資料或啟用雲端同步');
      }

      console.log('✅ 系統初始化完成');
      
    } catch (error) {
      console.error('❌ 系統初始化失敗:', error);
    }
  }

  /**
   * 獲取投資組合資料
   */
  getPortfolioData(): PortfolioData | null {
    return this.portfolioData;
  }

  /**
   * 儲存投資組合資料
   */
  async savePortfolioData(data: PortfolioData): Promise<boolean> {
    const success = await this.dataStorage.saveData(data);
    if (success) {
      this.portfolioData = data;
    }
    return success;
  }

  /**
   * 獲取系統狀態
   */
  getSystemStatus() {
    const storageUsage = this.dataStorage.getStorageUsage();
    
    return {
      isInitialized: this.portfolioData !== null,
      stockCount: this.portfolioData?.stocks.length || 0,
      accountCount: this.portfolioData?.accounts.length || 0,
      lastUpdate: this.portfolioData?.lastUpdate || null,
      storageUsage: storageUsage,
      version: this.portfolioData?.version || 'unknown'
    };
  }
}

// 全域應用程式實例
let appInstance: StockPortfolioApp | null = null;

/**
 * 獲取應用程式實例（單例模式）
 */
export function getApp(): StockPortfolioApp {
  if (!appInstance) {
    appInstance = new StockPortfolioApp();
  }
  return appInstance;
}

/**
 * 初始化應用程式（供 HTML 頁面使用）
 */
export function initializeApp(): StockPortfolioApp {
  return getApp();
}

// 如果在瀏覽器環境中，自動初始化
if (typeof window !== 'undefined') {
  // 等待 DOM 載入完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.stockPortfolioApp = initializeApp();
    });
  } else {
    window.stockPortfolioApp = initializeApp();
  }
}

// 擴展 Window 介面以包含應用程式實例
declare global {
  interface Window {
    stockPortfolioApp: StockPortfolioApp;
  }
}