"use client";

import { memo, useCallback, useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

/**
 * Memoized pagination component
 * Requirements: 12.1, 12.2, 12.3 - Performance optimization with React.memo
 */
export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 30, 50],
  showPageSizeSelector = true,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrevious = useCallback(() => onPageChange(currentPage - 1), [onPageChange, currentPage]);
  const handleNext = useCallback(() => onPageChange(currentPage + 1), [onPageChange, currentPage]);
  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onPageSizeChange?.(Number(e.target.value)),
    [onPageSizeChange]
  );

  // Generate page numbers to display - memoized for performance
  const pageNumbers = useMemo((): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [totalPages, currentPage]);

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 sm:flex-row">
      {/* Items info - Requirements 1.3, 6.4: Responsive design */}
      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
        {/* Page size selector - hidden on mobile for cleaner UI */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600 whitespace-nowrap">
              Items per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        {totalPages > 1 && (
          <nav className="flex items-center gap-0.5 sm:gap-1" aria-label={`Pagination, page ${currentPage} of ${totalPages}`}>
            {/* Previous button - touch-friendly size */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="rounded-md p-2.5 sm:p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={`Go to previous page, page ${currentPage - 1}`}
              aria-disabled={currentPage === 1}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page numbers - touch-friendly size */}
            {pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-gray-500" aria-hidden="true">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[2.5rem] min-h-[2.5rem] sm:min-w-[2.5rem] sm:min-h-0 rounded-md px-2 sm:px-3 py-2 sm:py-1.5 text-sm font-medium active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  aria-label={currentPage === page ? `Page ${page}, current page` : `Go to page ${page}`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next button - touch-friendly size */}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="rounded-md p-2.5 sm:p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={`Go to next page, page ${currentPage + 1}`}
              aria-disabled={currentPage === totalPages}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
});
