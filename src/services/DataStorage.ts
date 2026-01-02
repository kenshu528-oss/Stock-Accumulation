/**
 * 資料儲存管理器
 * 
 * 負責處理本地儲存操作、資料版本控制和遷移
 */

import { PortfolioData, PortfolioSettings } from '../types/interfaces.js';
import { validatePortfolioData } from '../utils/validation.js';
import { VersionManager } from '../utils/VersionManager.js';

export class DataStorage {
  private readonly STORAGE_KEY = 'stockPortfolio';
  private readonly VERSION_KEY = 'portfolioVersion';
  private readonly CURRENT_VERSION = 'v1.3.0.0001'; // 新模組化系統版本

  /**
   * 生成新的建置版本號（4位數格式）
   */
  private generateBuildNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // 後兩位年份
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    
    // 生成4位數建置號：年月日時（壓縮格式）
    const buildNumber = `${year}${month}${day}`.slice(-4);
    return buildNumber.padStart(4, '0');
  }

  /**
   * 更新版本號（用於bug修正）
   */
  updateVersion(currentVersion: string, type: 'patch' | 'minor' | 'major' = 'patch'): string {
    const versionParts = currentVersion.replace('v', '').split('.');
    let [major, minor, patch, build] = versionParts.map(Number);
    
    switch (type) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        build = 1;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        build = 1;
        break;
      case 'patch':
      default:
        if (build) {
          build += 1;
        } else {
          patch += 1;
          build = 1;
        }
        break;
    }
    
    // 確保建置號為4位數
    const buildStr = build.toString().padStart(4, '0');
    return `v${major}.${minor}.${patch}.${buildStr}`;
  }

  /**
   * 載入投資組合資料
   */
  async loadData(): Promise<PortfolioData | null> {
    try {
      const dataString = localStorage.getItem(this.STORAGE_KEY);
      if (!dataString) {
        return this.createDefaultData();
      }

      const data = JSON.parse(dataString) as PortfolioData;
      
      // 驗證資料完整性
      const validation = validatePortfolioData(data);
      if (!validation.isValid) {
        console.warn('載入的資料驗證失敗:', validation.errors);
        return this.createDefaultData();
      }

      // 檢查版本並進行遷移
      const migratedData = await this.migrateData(data);
      return migratedData;
      
    } catch (error) {
      console.error('載入資料失敗:', error);
      return this.createDefaultData();
    }
  }

  /**
   * 儲存投資組合資料
   */
  async saveData(data: PortfolioData): Promise<boolean> {
    try {
      // 驗證資料
      const validation = validatePortfolioData(data);
      if (!validation.isValid) {
        console.error('儲存資料驗證失敗:', validation.errors);
        return false;
      }

      // 更新版本和時間戳
      const dataToSave: PortfolioData = {
        ...data,
        version: this.CURRENT_VERSION,
        lastUpdate: new Date().toISOString()
      };

      // 儲存到 localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
      
      return true;
    } catch (error) {
      console.error('儲存資料失敗:', error);
      return false;
    }
  }

  /**
   * 清除所有資料
   */
  clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.VERSION_KEY);
  }

  /**
   * 檢查儲存空間使用量
   */
  getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }

      // localStorage 通常限制為 5-10MB，這裡假設 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (totalSize / maxSize) * 100;

      return {
        used: totalSize,
        available: maxSize - totalSize,
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      console.error('檢查儲存空間失敗:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * 建立預設資料
   */
  private createDefaultData(): PortfolioData {
    const defaultSettings: PortfolioSettings = {
      darkMode: false,
      privacyMode: true, // 預設啟用隱私模式
      autoUpdate: true,
      updateInterval: 30000, // 30秒
      dividendAdjustment: true,
      defaultTaxRate: 0,
      currency: 'TWD',
      language: 'zh-TW'
    };

    return {
      stocks: [],
      accounts: ['帳戶1', '帳戶2'],
      currentAccount: '帳戶1',
      settings: defaultSettings,
      lastUpdate: new Date().toISOString(),
      version: 'v1.0.0.0001' // 使用4位數建置號格式
    };
  }

  /**
   * 資料版本遷移
   */
  private async migrateData(data: PortfolioData): Promise<PortfolioData> {
    const currentVersion = data.version || 'v0.0.0.0001';
    
    if (!VersionManager.needsMigration(currentVersion, this.CURRENT_VERSION)) {
      return data;
    }

    console.log(`正在遷移資料從版本 ${currentVersion} 到 ${this.CURRENT_VERSION}`);

    let migratedData = { ...data };

    // 版本遷移邏輯
    if (VersionManager.compareVersions(currentVersion, 'v1.0.0.0001') < 0) {
      migratedData = this.migrateTo1_0_0(migratedData);
    }

    // 更新版本號
    migratedData.version = this.CURRENT_VERSION;
    
    // 儲存遷移後的資料
    await this.saveData(migratedData);
    
    return migratedData;
  }

  /**
   * 遷移到版本 1.0.0
   */
  private migrateTo1_0_0(data: any): PortfolioData {
    // 確保所有必要欄位存在
    const migratedData: PortfolioData = {
      stocks: data.stocks || [],
      accounts: data.accounts || ['帳戶1', '帳戶2'],
      currentAccount: data.currentAccount || '帳戶1',
      settings: {
        darkMode: data.settings?.darkMode || false,
        privacyMode: data.settings?.privacyMode !== undefined ? data.settings.privacyMode : true,
        autoUpdate: data.settings?.autoUpdate !== undefined ? data.settings.autoUpdate : true,
        updateInterval: data.settings?.updateInterval || 30000,
        dividendAdjustment: data.settings?.dividendAdjustment !== undefined ? data.settings.dividendAdjustment : true,
        defaultTaxRate: data.settings?.defaultTaxRate || 0,
        currency: data.settings?.currency || 'TWD',
        language: data.settings?.language || 'zh-TW'
      },
      lastUpdate: data.lastUpdate || new Date().toISOString(),
      version: 'v1.0.0.0001'
    };

    // 遷移股票記錄格式
    migratedData.stocks = migratedData.stocks.map(stock => ({
      ...stock,
      dividends: stock.dividends || [],
      totalDividends: stock.totalDividends || 0,
      adjustedCostPrice: stock.adjustedCostPrice || stock.costPrice,
      purchaseHistory: stock.purchaseHistory || [{
        date: stock.purchaseDate,
        shares: stock.shares,
        costPrice: stock.costPrice,
        totalCost: stock.shares * stock.costPrice
      }],
      dataSource: stock.dataSource || 'TWSE'
    }));

    return migratedData;
  }

  /**
   * 獲取當前系統版本
   */
  getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }

  /**
   * 更新系統版本（用於開發階段）
   */
  updateSystemVersion(type: 'major' | 'minor' | 'patch' | 'build' = 'build'): string {
    const newVersion = VersionManager.incrementVersion(this.CURRENT_VERSION, type);
    console.log(`版本更新: ${this.CURRENT_VERSION} → ${newVersion}`);
    return newVersion;
  }

  /**
   * 匯出資料為 JSON
   */
  exportData(): string {
    const dataString = localStorage.getItem(this.STORAGE_KEY);
    return dataString || '{}';
  }

  /**
   * 從 JSON 匯入資料
   */
  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString) as PortfolioData;
      return await this.saveData(data);
    } catch (error) {
      console.error('匯入資料失敗:', error);
      return false;
    }
  }
}