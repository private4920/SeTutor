"use client";

import Link from 'next/link';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  className?: string;
  showHomeIcon?: boolean;
}

export function Breadcrumbs({
  items,
  onItemClick,
  className = '',
  showHomeIcon = true,
}: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.id ?? 'root'} className="flex items-center">
              {/* Separator */}
              {!isFirst && (
                <svg
                  className="mx-1 h-4 w-4 flex-shrink-0 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}

              {/* Breadcrumb Item */}
              {isLast ? (
                <span
                  className="flex items-center gap-1.5 font-medium text-gray-900"
                  aria-current="page"
                >
                  {isFirst && showHomeIcon && (
                    <svg
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  )}
                  {!isFirst && (
                    <svg
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  )}
                  <span className="truncate max-w-[200px]">{item.name}</span>
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  {isFirst && showHomeIcon && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  )}
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </Link>
              ) : (
                <button
                  onClick={() => onItemClick?.(item, index)}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  {isFirst && showHomeIcon && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  )}
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Utility function to build breadcrumb items from a folder path
 * @param folders - All folders for the user
 * @param currentFolderId - The current folder ID (null for root)
 * @returns Array of breadcrumb items from root to current folder
 */
export function buildBreadcrumbsFromPath(
  folders: { id: string; name: string; parent_id: string | null }[],
  currentFolderId: string | null
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ id: null, name: 'Root' }];

  if (!currentFolderId) {
    return breadcrumbs;
  }

  // Build path from current folder to root
  const path: { id: string; name: string; parent_id: string | null }[] = [];
  let current = folders.find(f => f.id === currentFolderId);

  while (current) {
    path.unshift(current);
    current = current.parent_id
      ? folders.find(f => f.id === current!.parent_id)
      : undefined;
  }

  // Add each folder in the path to breadcrumbs
  for (const folder of path) {
    breadcrumbs.push({ id: folder.id, name: folder.name });
  }

  return breadcrumbs;
}
