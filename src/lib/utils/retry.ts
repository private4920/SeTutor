/**
 * Retry utility for failed operations
 * Requirements: 4.5 - Implement retry logic for failed operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

/**
 * Executes an async function with retry logic using exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = DEFAULT_OPTIONS.maxAttempts,
    delayMs = DEFAULT_OPTIONS.delayMs,
    backoffMultiplier = DEFAULT_OPTIONS.backoffMultiplier,
    maxDelayMs = DEFAULT_OPTIONS.maxDelayMs,
    shouldRetry,
    onRetry,
  } = options;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (shouldRetry && !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Call onRetry callback
      onRetry?.(lastError, attempt);

      // Wait before retrying with exponential backoff
      await sleep(currentDelay);
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError!;
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determines if an error is retryable based on common patterns
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return true;
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return true;
  }
  
  // Server errors (5xx)
  if (message.includes('500') || message.includes('502') || 
      message.includes('503') || message.includes('504')) {
    return true;
  }
  
  // Rate limiting
  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }
  
  return false;
}

/**
 * Creates a retryable fetch function
 */
export function createRetryableFetch(options: RetryOptions = {}) {
  return async function retryableFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    return withRetry(
      async () => {
        const response = await fetch(input, init);
        
        // Retry on server errors
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        return response;
      },
      {
        ...options,
        shouldRetry: (error, attempt) => {
          if (options.shouldRetry) {
            return options.shouldRetry(error, attempt);
          }
          return isRetryableError(error);
        },
      }
    );
  };
}
