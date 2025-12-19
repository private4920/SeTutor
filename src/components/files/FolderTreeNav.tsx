"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import { Folder } from '@/lib/hooks/useFolders';

interface FolderTreeNavProps {
  folders: Folder[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface TreeNode {
  folder: Folder;
  children: TreeNode[];
}

// Build tree structure from flat folder list
function buildFolderTree(folders: Folder[]): TreeNode[] {
  const folderMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  // Create nodes for all folders
  folders.forEach(folder => {
    folderMap.set(folder.id, { folder, children: [] });
  });

  // Build tree structure
  folders.forEach(folder => {
    const node = folderMap.get(folder.id)!;
    if (folder.parent_id === null) {
      rootNodes.push(node);
    } else {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        rootNodes.push(node);
      }
    }
  });

  // Sort children alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    nodes.forEach(node => sortNodes(node.children));
  };
  sortNodes(rootNodes);

  return rootNodes;
}

// Check if a folder is an ancestor of the current folder
function isAncestorOf(folders: Folder[], ancestorId: string, descendantId: string | null): boolean {
  if (!descendantId) return false;
  
  let current = folders.find(f => f.id === descendantId);
  while (current) {
    if (current.parent_id === ancestorId) return true;
    current = folders.find(f => f.id === current?.parent_id);
  }
  return false;
}

// Tree item component
const TreeItem = memo(function TreeItem({
  node,
  level,
  currentFolderId,
  expandedFolders,
  onToggleExpand,
  onSelect,
  allFolders,
}: {
  node: TreeNode;
  level: number;
  currentFolderId: string | null;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
  onSelect: (folderId: string) => void;
  allFolders: Folder[];
}) {
  const isExpanded = expandedFolders.has(node.folder.id);
  const isSelected = currentFolderId === node.folder.id;
  const hasChildren = node.children.length > 0;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.folder.id);
  }, [node.folder.id, onToggleExpand]);

  const handleSelect = useCallback(() => {
    onSelect(node.folder.id);
  }, [node.folder.id, onSelect]);

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleSelect}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {/* Expand/Collapse button */}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-200 ${
            !hasChildren ? 'invisible' : ''
          }`}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          tabIndex={-1}
        >
          <svg
            className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Folder icon */}
        <svg
          className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-yellow-500'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isExpanded && hasChildren ? (
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
          ) : (
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          )}
        </svg>

        {/* Folder name */}
        <span className="truncate text-sm flex-1">{node.folder.name}</span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div role="group">
          {node.children.map(child => (
            <TreeItem
              key={child.folder.id}
              node={child}
              level={level + 1}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              allFolders={allFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const FolderTreeNav = memo(function FolderTreeNav({
  folders,
  currentFolderId,
  onFolderSelect,
  isCollapsed = false,
  onToggleCollapse,
}: FolderTreeNavProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const treeNodes = buildFolderTree(folders);

  // Auto-expand folders that are ancestors of the current folder
  useEffect(() => {
    if (currentFolderId) {
      setExpandedFolders(prev => {
        const newExpanded = new Set(prev);
        folders.forEach(folder => {
          if (isAncestorOf(folders, folder.id, currentFolderId)) {
            newExpanded.add(folder.id);
          }
        });
        // Also expand the current folder if it has children
        const currentFolder = folders.find(f => f.id === currentFolderId);
        if (currentFolder && folders.some(f => f.parent_id === currentFolderId)) {
          newExpanded.add(currentFolderId);
        }
        return newExpanded;
      });
    }
  }, [currentFolderId, folders]);

  const handleToggleExpand = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleSelectRoot = useCallback(() => {
    onFolderSelect(null);
  }, [onFolderSelect]);

  const handleSelectFolder = useCallback((folderId: string) => {
    onFolderSelect(folderId);
  }, [onFolderSelect]);

  if (isCollapsed) {
    return (
      <div className="w-10 flex-shrink-0 border-r border-gray-200 bg-gray-50">
        <button
          onClick={onToggleCollapse}
          className="w-full p-2 hover:bg-gray-100 flex items-center justify-center"
          aria-label="Expand folder navigation"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Folders</span>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-200 rounded"
            aria-label="Collapse folder navigation"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2" role="tree" aria-label="Folder navigation">
        {/* Root / My Files */}
        <div
          className={`flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer transition-colors mx-1 ${
            currentFolderId === null
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={handleSelectRoot}
          role="treeitem"
          aria-selected={currentFolderId === null}
        >
          <svg className={`w-4 h-4 ${currentFolderId === null ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm font-medium">My Files</span>
        </div>

        {/* Folder tree */}
        <div className="mt-1 mx-1">
          {treeNodes.map(node => (
            <TreeItem
              key={node.folder.id}
              node={node}
              level={0}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onToggleExpand={handleToggleExpand}
              onSelect={handleSelectFolder}
              allFolders={folders}
            />
          ))}
        </div>

        {/* Empty state */}
        {treeNodes.length === 0 && (
          <div className="px-3 py-4 text-center text-xs text-gray-500">
            No folders yet
          </div>
        )}
      </div>
    </div>
  );
});
