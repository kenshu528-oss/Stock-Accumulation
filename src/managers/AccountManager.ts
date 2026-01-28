/**
 * AccountManager for v1.3.X architecture
 * Manages account CRUD operations and account-related business logic
 * 
 * Key features:
 * - Create, read, update, delete accounts
 * - Account validation
 * - Integration with StorageService for persistence
 * - Automatic data synchronization
 */

import { Account } from '../types/Account';
import { StorageService } from '../services/StorageService';
import { ValidationError } from '../types/Errors';
import { PortfolioData } from '../types/Portfolio';

/**
 * Manager class for account operations
 * Handles all account-related business logic
 */
export class AccountManager {
  /** In-memory map of accounts for fast access */
  private accounts: Map<string, Account> = new Map();
  
  /**
   * Constructor
   * @param storageService - Storage service for data persistence
   */
  constructor(private storageService: StorageService) {
    this.loadAccounts();
  }
  
  /**
   * Load accounts from storage into memory
   * Called during initialization
   */
  private loadAccounts(): void {
    const data = this.storageService.load();
    if (data && data.accounts) {
      data.accounts.forEach(account => {
        this.accounts.set(account.id, account);
      });
    }
  }
  
  /**
   * Save current accounts to storage
   * Updates the complete portfolio data
   */
  private saveAccounts(): void {
    const data = this.storageService.load() || this.createEmptyPortfolioData();
    data.accounts = Array.from(this.accounts.values());
    this.storageService.save(data);
  }
  
  /**
   * Create empty portfolio data structure
   * Used when no data exists in storage
   */
  private createEmptyPortfolioData(): PortfolioData {
    return {
      version: '1.3.0',
      accounts: [],
      stocks: [],
      dividends: [],
      settings: {
        privacyMode: false,
        darkMode: false,
        autoUpdate: true,
        updateInterval: 300000, // 5 minutes
        cloudSync: {
          enabled: false
        }
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }
  
  /**
   * Generate a unique ID for an account
   * Uses timestamp and random string for uniqueness
   */
  private generateId(): string {
    return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Validate account name
   * @param name - Account name to validate
   * @throws {ValidationError} If name is invalid
   */
  private validateAccountName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('帳戶名稱不能為空', 'name');
    }
    
    if (name.trim().length > 50) {
      throw new ValidationError('帳戶名稱不能超過 50 個字元', 'name');
    }
  }
  
  /**
   * Create a new account
   * @param name - Account name
   * @returns The newly created account
   * @throws {ValidationError} If name is invalid
   */
  createAccount(name: string): Account {
    // Validate account name
    this.validateAccountName(name);
    
    // Create new account
    const account: Account = {
      id: this.generateId(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Add to in-memory map
    this.accounts.set(account.id, account);
    
    // Persist to storage
    this.saveAccounts();
    
    return account;
  }
  
  /**
   * Update an existing account's name
   * @param accountId - ID of the account to update
   * @param newName - New account name
   * @returns The updated account
   * @throws {ValidationError} If account not found or name is invalid
   */
  updateAccount(accountId: string, newName: string): Account {
    // Check if account exists
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new ValidationError(`找不到帳戶 ID: ${accountId}`, 'accountId');
    }
    
    // Validate new name
    this.validateAccountName(newName);
    
    // Update account name
    account.name = newName.trim();
    
    // Update in map
    this.accounts.set(accountId, account);
    
    // Persist to storage
    this.saveAccounts();
    
    return account;
  }
  
  /**
   * Delete an account
   * Note: This does not delete associated stocks - caller should handle that
   * @param accountId - ID of the account to delete
   * @throws {ValidationError} If account not found
   */
  deleteAccount(accountId: string): void {
    // Check if account exists
    if (!this.accounts.has(accountId)) {
      throw new ValidationError(`找不到帳戶 ID: ${accountId}`, 'accountId');
    }
    
    // Remove from map
    this.accounts.delete(accountId);
    
    // Persist to storage
    this.saveAccounts();
  }
  
  /**
   * Get a single account by ID
   * @param accountId - ID of the account to retrieve
   * @returns The account if found, undefined otherwise
   */
  getAccount(accountId: string): Account | undefined {
    return this.accounts.get(accountId);
  }
  
  /**
   * Get all accounts
   * @returns Array of all accounts
   */
  getAllAccounts(): Account[] {
    return Array.from(this.accounts.values());
  }
  
  /**
   * Check if an account exists
   * @param accountId - ID of the account to check
   * @returns true if account exists, false otherwise
   */
  hasAccount(accountId: string): boolean {
    return this.accounts.has(accountId);
  }
  
  /**
   * Get the number of accounts
   * @returns Total number of accounts
   */
  getAccountCount(): number {
    return this.accounts.size;
  }
}
