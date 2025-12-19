"use client";

import { useState, useEffect, useCallback } from 'react';
import { useFolders } from '@/lib/hooks/useFolders';
import { FolderTree } from './FolderTree';

interface FolderSelectorProps {
  onSelectionChange: (selectedFolderIds: string[]) => void;
  selectedFolderIds?: string[];
  className?: string;
  title?: string;
  description?: string;
}

export function FolderSelector({
  onSelectionChange,
  selectedFolderIds: controlledSelectedIds,
  className = '',
  title = 'Select Folders',
  description = 'Choose folders containing documents for AI processing',
}: FolderSelectorProps) {
  const { folders, loading, error, fetchFolders } = useFolders();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(controlledSelectedIds || [])
  );

  // Fetch all folders on mount
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Sync with controlled prop
  useEffect(() => {
    if (controlledSelectedIds) {
      setSelectedIds(new Set(controlledSelectedIds));
    }
  }, [controlledSelectedIds]);

  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedIds(newSelectedIds);
      onSelectionChange(Array.from(newSelectedIds));
    },
    [onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(folders.map(f => f.id));
    setSelectedIds(allIds);
    onSelectionChange(Array.from(allIds));
  }, [folders, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
    onSelectionChange([]);
  }, [onSelectionChange]);

  if (loading && folders.length === 0) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => fetchFolders()}
          className="mt-2 text-sm text-red-700 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={handleSelectAll}
          className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={handleDeselectAll}
          className="rounded-md bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Deselect All
        </button>
        {selectedIds.size > 0 && (
          <span className="text-sm text-gray-500">
            {selectedIds.size} folder{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Folder Tree */}
      <FolderTree
        folders={folders}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        selectable={true}
      />

      {/* Selected Folders Summary */}
      {selectedIds.size > 0 && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <h4 className="text-sm font-medium text-blue-900">Selected Folders:</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(selectedIds).map(id => {
              const folder = folders.find(f => f.id === id);
              if (!folder) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  <svg
                    className="h-3.5 w-3.5"
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
                  {folder.name}
                  <button
                    onClick={() => {
                      const newIds = new Set(selectedIds);
                      newIds.delete(id);
                      handleSelectionChange(newIds);
                    }}
                    className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
                    aria-label={`Remove ${folder.name}`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
