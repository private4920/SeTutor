"use client";

import { useState, useCallback } from 'react';
import { Folder } from '@/lib/hooks/useFolders';

interface FolderTreeNodeProps {
  folder: Folder;
  allFolders: Folder[];
  level: number;
  expandedIds: Set<string>;
  selectedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onToggleSelect?: (id: string) => void;
  onFolderClick?: (folder: Folder) => void;
  selectable?: boolean;
}

function FolderTreeNode({
  folder,
  allFolders,
  level,
  expandedIds,
  selectedIds,
  onToggleExpand,
  onToggleSelect,
  onFolderClick,
  selectable = false,
}: FolderTreeNodeProps) {
  const children = allFolders.filter(f => f.parent_id === folder.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(folder.id);
  const isSelected = selectedIds.has(folder.id);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(folder.id);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect?.(folder.id);
  };

  const handleFolderClick = () => {
    onFolderClick?.(folder);
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100 cursor-pointer ${
          isSelected && !selectable ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleFolderClick}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={handleExpandClick}
          className={`flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-gray-200 ${
            !hasChildren ? 'invisible' : ''
          }`}
          aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
        >
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Checkbox for selection (AI features) */}
        {selectable && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select ${folder.name}`}
          />
        )}

        {/* Folder Icon */}
        <svg
          className={`h-5 w-5 flex-shrink-0 ${isExpanded ? 'text-blue-500' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isExpanded ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          )}
        </svg>

        {/* Folder Name */}
        <span className="truncate text-sm text-gray-700">{folder.name}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              allFolders={allFolders}
              level={level + 1}
              expandedIds={expandedIds}
              selectedIds={selectedIds}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              onFolderClick={onFolderClick}
              selectable={selectable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export interface FolderTreeProps {
  folders: Folder[];
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onFolderClick?: (folder: Folder) => void;
  selectable?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
}

export function FolderTree({
  folders,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onFolderClick,
  selectable = false,
  defaultExpandedIds = [],
  className = '',
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(defaultExpandedIds));
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());

  // Use controlled or internal selection state
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;

  const rootFolders = folders.filter(f => f.parent_id === null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    } else {
      setInternalSelectedIds(newSelectedIds);
    }
  }, [selectedIds, onSelectionChange]);

  // Expand all folders
  const expandAll = useCallback(() => {
    setExpandedIds(new Set(folders.map(f => f.id)));
  }, [folders]);

  // Collapse all folders
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Select all folders
  const selectAll = useCallback(() => {
    const allIds = new Set(folders.map(f => f.id));
    if (onSelectionChange) {
      onSelectionChange(allIds);
    } else {
      setInternalSelectedIds(allIds);
    }
  }, [folders, onSelectionChange]);

  // Deselect all folders
  const deselectAll = useCallback(() => {
    const emptySet = new Set<string>();
    if (onSelectionChange) {
      onSelectionChange(emptySet);
    } else {
      setInternalSelectedIds(emptySet);
    }
  }, [onSelectionChange]);

  if (folders.length === 0) {
    return (
      <div className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center ${className}`}>
        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-500">No folders available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Action Buttons */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={expandAll}
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          Expand All
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          Collapse All
        </button>
        {selectable && (
          <>
            <span className="text-gray-300">|</span>
            <button
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={deselectAll}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Deselect All
            </button>
          </>
        )}
      </div>

      {/* Selection Count */}
      {selectable && selectedIds.size > 0 && (
        <div className="mb-2 text-sm text-gray-600">
          {selectedIds.size} folder{selectedIds.size !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Tree */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {rootFolders.map(folder => (
          <FolderTreeNode
            key={folder.id}
            folder={folder}
            allFolders={folders}
            level={0}
            expandedIds={expandedIds}
            selectedIds={selectedIds}
            onToggleExpand={handleToggleExpand}
            onToggleSelect={handleToggleSelect}
            onFolderClick={onFolderClick}
            selectable={selectable}
          />
        ))}
      </div>
    </div>
  );
}
