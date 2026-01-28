/**
 * Stock type definition for v1.3.X architecture
 * Represents a stock holding in the portfolio
 */

export interface Stock {
  /** Unique identifier for the stock record */
  id: string;
  
  /** Stock code (e.g., "2330" for TSMC) */
  code: string;
  
  /** Stock name (e.g., "台積電") */
  name: string;
  
  /** Number of shares held */
  shares: number;
  
  /** Average cost price per share */
  costPrice: number;
  
  /** Current market price per share */
  currentPrice: number;
  
  /** Purchase date in ISO 8601 format */
  purchaseDate: string;
  
  /** ID of the account this stock belongs to */
  accountId: string;
  
  /** Last updated timestamp in ISO 8601 format */
  lastUpdated: string;
  
  /** Source of the stock price data */
  dataSource: 'TWSE' | 'Yahoo' | 'Local';
}
