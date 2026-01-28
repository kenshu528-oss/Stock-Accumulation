/**
 * Error type definitions for v1.3.X architecture
 * Custom error classes for different error scenarios
 */

/**
 * Base error class for stock portfolio system
 */
export class StockError extends Error {
  /** Error code for categorization */
  public code: string;
  
  /** Additional error details */
  public details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'StockError';
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StockError);
    }
  }
}

/**
 * Error class for API-related errors
 * Used when external API calls fail
 */
export class ApiError extends StockError {
  /** HTTP status code (if applicable) */
  public statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message, 'API_ERROR');
    this.name = 'ApiError';
    this.statusCode = statusCode;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Error class for validation errors
 * Used when user input or data validation fails
 */
export class ValidationError extends StockError {
  /** Field name that failed validation */
  public field: string;
  
  constructor(message: string, field: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Error class for storage-related errors
 * Used when LocalStorage or cloud sync operations fail
 */
export class StorageError extends StockError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }
}
