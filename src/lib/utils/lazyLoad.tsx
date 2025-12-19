"use client";

import { lazy, Suspense, ComponentType, ReactNode, JSX } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Creates a lazy-loaded component with a fallback loading state
 * Requirements: 12.3 - Lazy loading for images and components
 * 
 * @param importFn - Dynamic import function for the component
 * @param fallback - Optional custom fallback component
 * @returns Lazy-loaded component wrapped in Suspense
 */
export function lazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
): (props: P) => JSX.Element {
  const LazyComponent = lazy(importFn);

  return function LazyLoadedComponent(props: P): JSX.Element {
    return (
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Default loading fallback component
 */
function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Card loading fallback
 */
export function CardLoadingFallback() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
    </div>
  );
}

/**
 * Page loading fallback
 */
export function PageLoadingFallback() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton height={32} width="40%" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
              <div className="space-y-2">
                <Skeleton height={14} width={60} />
                <Skeleton height={24} width={40} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <Skeleton height={200} className="w-full rounded-lg" />
    </div>
  );
}
