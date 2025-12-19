"use client";

import { memo } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  loading?: boolean;
}

/**
 * Memoized stat card component
 * Requirements: 1.3, 6.4, 12.1, 12.3 - Responsive design and performance optimization
 * Accessibility: ARIA labels and semantic structure
 */
export const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  loading = false,
}: StatCardProps) {
  return (
    <article 
      className="rounded-lg bg-white p-4 sm:p-6 shadow-sm"
      aria-label={`${title}: ${loading ? 'Loading' : value}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg ${iconBgColor}`}
          aria-hidden="true"
        >
          <span className={`${iconColor} [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6`}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 truncate" id={`stat-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</p>
          {loading ? (
            <div 
              className="h-7 sm:h-8 w-10 sm:w-12 animate-pulse rounded bg-gray-200" 
              role="status"
              aria-label="Loading value"
            >
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <p 
              className="text-xl sm:text-2xl font-semibold text-gray-900"
              aria-labelledby={`stat-${title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {value}
            </p>
          )}
        </div>
      </div>
    </article>
  );
});
