/**
 * API type definitions for v1.3.X architecture
 * Types related to stock price API calls and responses
 */

/**
 * Result of a stock price query
 * Contains the price and the source it was retrieved from
 */
export interface StockPriceResult {
  /** Stock price value */
  price: number;
  
  /** Source of the price data */
  source: 'TWSE' | 'Yahoo' | 'Local';
  
  /** Timestamp when the price was retrieved (optional) */
  timestamp?: string;
}

/**
 * Stock information from API search
 * Contains basic stock details
 */
export interface StockInfo {
  /** Stock code (e.g., "2330") */
  code: string;
  
  /** Stock name (e.g., "台積電") */
  name: string;
  
  /** Current price (optional, may not be available in all searches) */
  price?: number;
  
  /** Stock type/category (e.g., "上市", "上櫃", "興櫃", "ETF") */
  type?: string;
  
  /** Source of the information */
  source: 'TWSE' | 'Yahoo' | 'Local';
}

/**
 * Cached price data structure
 * Used internally by StockApiService for caching
 */
export interface CachedPrice {
  /** The cached price result */
  data: StockPriceResult;
  
  /** Timestamp when the data was cached */
  cachedAt: number;
}

/**
 * TWSE (Taiwan Stock Exchange) API response structure
 * Represents the response from 證交所 API
 */
export interface TWSEApiResponse {
  /** Status code from API */
  stat: string;
  
  /** Response date */
  date: string;
  
  /** Stock data fields */
  fields?: string[];
  
  /** Stock data values */
  data?: any[][];
  
  /** Error message (if any) */
  error?: string;
}

/**
 * Yahoo Finance API response structure
 * Simplified representation of Yahoo Finance data
 */
export interface YahooFinanceResponse {
  /** Quote data */
  quoteResponse?: {
    /** Array of quote results */
    result?: Array<{
      /** Stock symbol */
      symbol: string;
      
      /** Stock name */
      longName?: string;
      shortName?: string;
      
      /** Regular market price */
      regularMarketPrice?: number;
      
      /** Previous close price */
      regularMarketPreviousClose?: number;
      
      /** Market time */
      regularMarketTime?: number;
    }>;
    
    /** Error information */
    error?: any;
  };
}

/**
 * Local database stock entry
 * Structure for local stock database lookup
 */
export interface LocalStockEntry {
  /** Stock code */
  code: string;
  
  /** Stock name in Chinese */
  name: string;
  
  /** Stock type (上市/上櫃/興櫃/ETF) */
  type: string;
  
  /** Last known price (optional, may be outdated) */
  lastPrice?: number;
}
