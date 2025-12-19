"use client";

import { memo, useCallback } from 'react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Memoized view toggle component
 * Requirements: 12.1, 12.3 - Performance optimization with React.memo
 * Accessibility: ARIA labels and role for toggle group
 */
export const ViewToggle = memo(function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  const handleGridClick = useCallback(() => onViewModeChange('grid'), [onViewModeChange]);
  const handleListClick = useCallback(() => onViewModeChange('list'), [onViewModeChange]);
  return (
    <div 
      className="flex items-center rounded-lg border border-gray-300 bg-white p-1"
      role="group"
      aria-label="View mode selection"
    >
      <button
        onClick={handleGridClick}
        className={`
          flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
          ${viewMode === 'grid' 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100'
          }
        `}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={handleListClick}
        className={`
          flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
          ${viewMode === 'list' 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100'
          }
        `}
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
});
