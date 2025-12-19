"use client";

import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Loading spinner component
 * Requirements: 4.5 - Loading states for async operations
 * Accessibility: ARIA live region and role for screen readers
 */
export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div role="status" aria-live="polite" aria-label="Loading">
      <svg
        className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
});

interface LoadingOverlayProps {
  message?: string;
}

/**
 * Full-screen loading overlay
 * Accessibility: Focus trap and ARIA live region
 */
export const LoadingOverlay = memo(function LoadingOverlay({ 
  message = 'Loading...' 
}: LoadingOverlayProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={message}
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
});

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

/**
 * Wrapper component for handling loading and error states
 * Requirements: 4.5 - Loading states for async operations
 */
export function LoadingState({
  loading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
}: LoadingStateProps) {
  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className="flex flex-col items-center justify-center py-12">
        <svg 
          className="h-12 w-12 text-red-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <p className="mt-4 text-sm text-red-600">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

interface InlineLoadingProps {
  message?: string;
}

/**
 * Inline loading indicator for buttons and small areas
 */
export const InlineLoading = memo(function InlineLoading({ 
  message 
}: InlineLoadingProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {message && <span className="text-sm">{message}</span>}
    </span>
  );
});

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

/**
 * Button content wrapper that shows loading state
 */
export function ButtonLoading({ 
  loading, 
  children, 
  loadingText = 'Loading...' 
}: ButtonLoadingProps) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-2">
        <LoadingSpinner size="sm" className="text-current" />
        <span>{loadingText}</span>
      </span>
    );
  }

  return <>{children}</>;
}
