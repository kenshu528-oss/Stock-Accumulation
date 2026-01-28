/**
 * Portfolio type definitions for v1.3.X architecture
 * Represents portfolio statistics and complete portfolio data structure
 */

import { Stock } from './Stock';
import { Account } from './Account';
import { Dividend } from './Dividend';

/**
 * Portfolio statistics interface
 * Contains calculated metrics for portfolio performance
 */
export interface PortfolioStats {
  /** Total current market value of all holdings */
  totalValue: number;
  
  /** Total cost basis of all holdings */
  totalCost: number;
  
  /** Total unrealized gain/loss (totalValue - totalCost) */
  totalGain: number;
  
  /** Total gain percentage ((totalGain / totalCost) * 100) */
  totalGainPercent: number;
  
  /** Total dividend income received */
  totalDividend: number;
  
  /** Total return including dividends (totalGain + totalDividend) */
  totalReturn: number;
  
  /** Total return percentage ((totalReturn / totalCost) * 100) */
  totalReturnPercent: number;
}

/**
 * Complete portfolio data structure
 * Stored in LocalStorage with key 'stockPortfolio_v1.3'
 */
export interface PortfolioData {
  /** Version identifier for data format */
  version: string;
  
  /** List of all accounts */
  accounts: Account[];
  
  /** List of all stock holdings */
  stocks: Stock[];
  
  /** List of all dividend records */
  dividends: Dividend[];
  
  /** Application settings */
  settings: {
    /** Privacy mode enabled/disabled */
    privacyMode: boolean;
    
    /** Dark mode enabled/disabled */
    darkMode: boolean;
    
    /** Auto-update stock prices enabled/disabled */
    autoUpdate: boolean;
    
    /** Update interval in milliseconds */
    updateInterval: number;
    
    /** Cloud sync configuration */
    cloudSync: {
      /** Cloud sync enabled/disabled */
      enabled: boolean;
      
      /** GitHub personal access token (optional) */
      token?: string;
      
      /** GitHub Gist ID for sync (optional) */
      gistId?: string;
      
      /** Last sync timestamp in ISO 8601 format (optional) */
      lastSync?: string;
    };
  };
  
  /** Metadata about the portfolio data */
  metadata: {
    /** Portfolio creation timestamp in ISO 8601 format */
    createdAt: string;
    
    /** Last modification timestamp in ISO 8601 format */
    lastModified: string;
    
    /** Version migrated from (e.g., "1.2.2.0025") (optional) */
    migratedFrom?: string;
  };
}
