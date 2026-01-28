/**
 * Account type definition for v1.3.X architecture
 * Represents a trading account in the portfolio system
 */

export interface Account {
  /** Unique identifier for the account */
  id: string;
  
  /** Account name (e.g., "證券戶A", "退休帳戶") */
  name: string;
  
  /** Account creation timestamp in ISO 8601 format */
  createdAt: string;
}
