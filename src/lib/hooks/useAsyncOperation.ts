"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { withRetry, RetryOptions, isRetryableError } from '@/lib/utils/retry';

interface UseAsyncOperationOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  retryOptions?: RetryOptions;
}

interface UseAsyncOperationReturn<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Custom hook for handling async operations with loading states, error handling,
 * toast notifications, and retry logic
 * Requirements: 4.5 - Error handling and user feedback
 */
export function useAsyncOperation<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
): UseAsyncOperationReturn<T, Args> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
    retryOptions,
  } = options;

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        let result: T;

        if (retryOptions) {
          result = await withRetry(
            () => asyncFn(...args),
            {
              ...retryOptions,
              shouldRetry: retryOptions.shouldRetry ?? isRetryableError,
              onRetry: (err, attempt) => {
                toast.warning(`Retrying... (attempt ${attempt + 1})`);
                retryOptions.onRetry?.(err, attempt);
              },
            }
          );
        } else {
          result = await asyncFn(...args);
        }

        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (showErrorToast) {
          toast.error(errorMessage || error.message);
        }

        onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn, onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast, retryOptions, toast]
  );

  return { execute, loading, error, reset };
}

/**
 * Hook for handling form submissions with validation and feedback
 */
export function useFormSubmit<T, FormData>(
  submitFn: (data: FormData) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
) {
  return useAsyncOperation(submitFn, {
    showSuccessToast: true,
    showErrorToast: true,
    ...options,
  });
}

/**
 * Hook for handling delete operations with confirmation
 */
export function useDeleteOperation<T>(
  deleteFn: () => Promise<T>,
  options: UseAsyncOperationOptions<T> & { itemName?: string } = {}
) {
  const { itemName = 'item', ...restOptions } = options;
  
  return useAsyncOperation(deleteFn, {
    successMessage: `${itemName} deleted successfully`,
    errorMessage: `Failed to delete ${itemName}`,
    ...restOptions,
  });
}
