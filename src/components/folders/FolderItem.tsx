"use client";

import { useState, memo, useCallback } from 'react';
import { Folder } from '@/lib/hooks/useFolders';

interface FolderItemProps {
  folder: Folder;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onMove: (folder: Folder) => void;
  onClick: (folder: Folder) => void;
}

/**
 * Memoized folder item component
 * Requirements: 12.1, 12.3 - Performance optimization with React.memo
 * Accessibility: Keyboard navigation and ARIA labels
 */
export const FolderItem = memo(function FolderItem({
  folder,
  onRename,
  onDelete,
  onMove,
  onClick
}: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(folder);
    }
  }, [folder, onClick]);

  const handleAction = useCallback((action: () => void) => {
    setShowMenu(false);
    action();
  }, []);

  const handleClick = useCallback(() => onClick(folder), [folder, onClick]);
  const handleRename = useCallback(() => handleAction(() => onRename(folder)), [folder, onRename, handleAction]);
  const handleMove = useCallback(() => handleAction(() => onMove(folder)), [folder, onMove, handleAction]);
  const handleDelete = useCallback(() => handleAction(() => onDelete(folder)), [folder, onDelete, handleAction]);

  return (
    <article
      className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 transition-all hover:border-blue-300 hover:shadow-md cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open folder ${folder.name}`}
    >
      {/* Folder Icon - Requirements 1.3, 6.4: Responsive design */}
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-100 to-purple-100" aria-hidden="true">
        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>

      {/* Folder Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{folder.name}</h3>
        <p className="text-xs text-gray-500 truncate">{folder.path}</p>
      </div>

      {/* Actions Menu - always visible on mobile for touch accessibility */}
      <div className="relative">
        <button
          onClick={handleMenuClick}
          className="rounded-lg p-2.5 sm:p-2 text-gray-400 sm:opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:opacity-100"
          aria-label={`Actions for folder ${folder.name}`}
          aria-expanded={showMenu}
          aria-haspopup="menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
              aria-hidden="true"
            />
            <div 
              className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              role="menu"
              aria-label={`Actions for ${folder.name}`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleRename(); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-none focus-visible:bg-gray-100"
                role="menuitem"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rename
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleMove(); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-none focus-visible:bg-gray-100"
                role="menuitem"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Move
              </button>
              <hr className="my-1 border-gray-200" role="separator" />
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 focus-visible:outline-none focus-visible:bg-red-50"
                role="menuitem"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
});
