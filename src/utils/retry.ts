import { logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
}

export const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryCondition: (error: any) => {
    // Retry on network errors, rate limits, and server errors
    if (error?.response?.status) {
      const status = error.response.status;
      return status === 429 || (status >= 500 && status < 600);
    }
    
    // Retry on network errors
    if (error?.code) {
      return ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code);
    }
    
    return false;
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 1) {
        logger.info(`Operation succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      logger.warn(`Attempt ${attempt} failed:`, {
        error: error instanceof Error ? error.message : String(error),
        attempt,
        maxAttempts: opts.maxAttempts
      });
      
      // Don't retry if this is the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }
      
      // Don't retry if the error doesn't match retry conditions
      if (!opts.retryCondition(error)) {
        logger.info('Error does not match retry conditions, giving up');
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );
      
      logger.info(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${opts.maxAttempts})`);
      await sleep(delay);
    }
  }
  
  logger.error(`Operation failed after ${opts.maxAttempts} attempts`);
  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Shopify-specific retry options
export const shopifyRetryOptions: RetryOptions = {
  maxAttempts: 5,
  baseDelay: 2000, // 2 seconds for Shopify
  maxDelay: 60000, // 1 minute max delay
  backoffMultiplier: 2,
  retryCondition: (error: any) => {
    // Shopify rate limiting
    if (error?.response?.status === 429) {
      return true;
    }
    
    // Shopify server errors
    if (error?.response?.status && error.response.status >= 500) {
      return true;
    }
    
    // Network errors
    if (error?.code) {
      return ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code);
    }
    
    return false;
  }
};
