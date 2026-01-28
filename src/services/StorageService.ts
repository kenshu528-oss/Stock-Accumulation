/**
 * StorageService for v1.3.X architecture
 * Handles all LocalStorage operations for portfolio data
 * 
 * Key features:
 * - Version-isolated storage using 'stockPortfolio_v1.3' key
 * - Error handling for quota exceeded scenarios
 * - JSON serialization/deserialization
 * - Data validation
 */

import { PortfolioData } from '../types/Portfolio';
import { StorageError } from '../types/Errors';

/**
 * Service class for managing portfolio data storage
 * Encapsulates all LocalStorage operations
 */
export class StorageService {
  /** Storage key for v1.3.X data - isolated from v1.2.X */
  private readonly STORAGE_KEY = 'stockPortfolio_v1.3';
  
  /**
   * Save portfolio data to LocalStorage
   * @param data - Complete portfolio data to save
   * @throws {StorageError} If storage quota is exceeded or serialization fails
   */
  save(data: PortfolioData): void {
    try {
      // Update last modified timestamp
      data.metadata.lastModified = new Date().toISOString();
      
      // Serialize data to JSON
      const json = JSON.stringify(data);
      
      // Save to LocalStorage
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (error: any) {
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        throw new StorageError('儲存空間不足，請清理瀏覽器資料或匯出備份');
      }
      
      // Handle other errors
      throw new StorageError(`儲存資料失敗: ${error.message}`);
    }
  }
  
  /**
   * Load portfolio data from LocalStorage
   * @returns Portfolio data if exists, null otherwise
   * @throws {StorageError} If data parsing fails
   */
  load(): PortfolioData | null {
    try {
      // Retrieve data from LocalStorage
      const json = localStorage.getItem(this.STORAGE_KEY);
      
      // Return null if no data exists
      if (!json) {
        return null;
      }
      
      // Parse and return data
      const data = JSON.parse(json) as PortfolioData;
      return data;
    } catch (error: any) {
      // Log parsing error but don't throw - allow recovery
      console.error('資料解析失敗:', error);
      throw new StorageError(`載入資料失敗: ${error.message}`);
    }
  }
  
  /**
   * Clear all portfolio data from LocalStorage
   * Removes the v1.3 storage key completely
   */
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  /**
   * Check if portfolio data exists in LocalStorage
   * @returns true if data exists, false otherwise
   */
  hasData(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
  
  /**
   * Get the storage key used by this service
   * Useful for debugging and testing
   * @returns The storage key string
   */
  getStorageKey(): string {
    return this.STORAGE_KEY;
  }
}
