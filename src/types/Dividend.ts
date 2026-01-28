/**
 * Dividend type definition for v1.3.X architecture
 * Represents a dividend payment record for a stock
 */

export interface Dividend {
  /** Unique identifier for the dividend record */
  id: string;
  
  /** ID of the stock this dividend belongs to */
  stockId: string;
  
  /** Ex-dividend date in ISO 8601 format */
  exDividendDate: string;
  
  /** Dividend amount per share */
  dividendPerShare: number;
  
  /** Total dividend received (dividendPerShare * shares at the time) */
  totalDividend: number;
  
  /** Record creation timestamp in ISO 8601 format */
  createdAt: string;
}
