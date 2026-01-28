/**
 * 資�??��?管�???
 * 
 * 負責?��??�地?��??��??��??��??�控?��??�移
 */

import { PortfolioData, PortfolioSettings } from '../types/interfaces.js';
import { validatePortfolioData } from '../utils/validation.js';
import { VersionManager } from '../utils/VersionManager.js';

export class DataStorage {
  private readonly STORAGE_KEY = 'stockPortfolio';
  private readonly VERSION_KEY = 'portfolioVersion';
  private readonly CURRENT_VERSION = 'v1.3.0.0014'; // 新模組化系統版本

  // 建置?��??��??�已移至?�本管�?系統

  /**
   * ?�新?�本?��??�於bug修正�?
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
    
    // 確�?建置?�為4位數
    const buildStr = build.toString().padStart(4, '0');
    return `v${major}.${minor}.${patch}.${buildStr}`;
  }

  /**
   * 載入?��?組�?資�?
   */
  async loadData(): Promise<PortfolioData | null> {
    try {
      const dataString = localStorage.getItem(this.STORAGE_KEY);
      if (!dataString) {
        return this.createDefaultData();
      }

      const data = JSON.parse(dataString) as PortfolioData;
      
      // 驗�?資�?完整??
      const validation = validatePortfolioData(data);
      if (!validation.isValid) {
        console.warn('載入?��??��?證失??', validation.errors);
        return this.createDefaultData();
      }

      // 檢查?�本並進�??�移
      const migratedData = await this.migrateData(data);
      return migratedData;
      
    } catch (error) {
      console.error('載入資�?失�?:', error);
      return this.createDefaultData();
    }
  }

  /**
   * ?��??��?組�?資�?
   */
  async saveData(data: PortfolioData): Promise<boolean> {
    try {
      // 驗�?資�?
      const validation = validatePortfolioData(data);
      if (!validation.isValid) {
        console.error('?��?資�?驗�?失�?:', validation.errors);
        return false;
      }

      // ?�新?�本?��??�戳
      const dataToSave: PortfolioData = {
        ...data,
        version: this.CURRENT_VERSION,
        lastUpdate: new Date().toISOString()
      };

      // ?��???localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
      
      return true;
    } catch (error) {
      console.error('?��?資�?失�?:', error);
      return false;
    }
  }

  /**
   * 清除?�?��???
   */
  clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.VERSION_KEY);
  }

  /**
   * 檢查?��?空�?使用??
   */
  getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }

      // localStorage ?�常?�制??5-10MB，這裡?�設 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (totalSize / maxSize) * 100;

      return {
        used: totalSize,
        available: maxSize - totalSize,
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      console.error('檢查?��?空�?失�?:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * 建�??�設資�?
   */
  private createDefaultData(): PortfolioData {
    const defaultSettings: PortfolioSettings = {
      darkMode: false,
      privacyMode: true, // ?�設?�用?��?模�?
      autoUpdate: true,
      updateInterval: 30000, // 30�?
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
      version: 'v1.0.0.0001' // 使用4位數建置?�格�?
    };
  }

  /**
   * 資�??�本?�移
   */
  private async migrateData(data: PortfolioData): Promise<PortfolioData> {
    const currentVersion = data.version || 'v0.0.0.0001';
    
    if (!VersionManager.needsMigration(currentVersion, this.CURRENT_VERSION)) {
      return data;
    }

    console.log(`�?��?�移資�?從�???${currentVersion} ??${this.CURRENT_VERSION}`);

    let migratedData = { ...data };

    // ?�本?�移?�輯
    if (VersionManager.compareVersions(currentVersion, 'v1.0.0.0001') < 0) {
      migratedData = this.migrateTo1_0_0(migratedData);
    }

    // ?�新?�本??
    migratedData.version = this.CURRENT_VERSION;
    
    // ?��??�移後�?資�?
    await this.saveData(migratedData);
    
    return migratedData;
  }

  /**
   * ?�移?��???1.0.0
   */
  private migrateTo1_0_0(data: any): PortfolioData {
    // 確�??�?��?要�?位�???
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

    // ?�移?�票記�??��?
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
   * ?��??��?系統?�本
   */
  getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }

  /**
   * ?�新系統?�本（用?��??��?段�?
   */
  updateSystemVersion(type: 'major' | 'minor' | 'patch' | 'build' = 'build'): string {
    const newVersion = VersionManager.incrementVersion(this.CURRENT_VERSION, type);
    console.log(`?�本?�新: ${this.CURRENT_VERSION} ??${newVersion}`);
    return newVersion;
  }

  /**
   * ?�出資�???JSON
   */
  exportData(): string {
    const dataString = localStorage.getItem(this.STORAGE_KEY);
    return dataString || '{}';
  }

  /**
   * �?JSON ?�入資�?
   */
  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString) as PortfolioData;
      return await this.saveData(data);
    } catch (error) {
      console.error('?�入資�?失�?:', error);
      return false;
    }
  }
}
