"use client";

import { useState, useCallback, useEffect } from 'react';
import { Folder } from '@/lib/hooks/useFolders';
import { Document } from '@/lib/db/types';

interface FolderWithDocuments extends Folder {
  documents: Document[];
}

interface DocumentSelectionTreeNodeProps {
  folder: FolderWithDocuments;
  allFolders: FolderWithDocuments[];
  level: number;
  expandedIds: Set<string>;
  selectedDocumentIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onToggleDocument: (docId: string) => void;
  onToggleFolderDocuments: (folderId: string, select: boolean) => void;
}

function DocumentSelectionTreeNode({
  folder,
  allFolders,
  level,
  expandedIds,
  selectedDocumentIds,
  onToggleExpand,
  onToggleDocument,
  onToggleFolderDocuments,
}: DocumentSelectionTreeNodeProps) {
  const children = allFolders.filter(f => f.parent_id === folder.id);
  const hasChildren = children.length > 0 || folder.documents.length > 0;
  const isExpanded = expandedIds.has(folder.id);
  
  // Check if all documents in this folder are selected
  const allDocsSelected = folder.documents.length > 0 && 
    folder.documents.every(doc => selectedDocumentIds.has(doc.id));
  const someDocsSelected = folder.documents.some(doc => selectedDocumentIds.has(doc.id));

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(folder.id);
  };

  const handleFolderCheckboxChange = () => {
    onToggleFolderDocuments(folder.id, !allDocsSelected);
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
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

        {/* Folder Checkbox - selects all documents in folder */}
        {folder.documents.length > 0 && (
          <input
            type="checkbox"
            checked={allDocsSelected}
            ref={(el) => {
              if (el) el.indeterminate = someDocsSelected && !allDocsSelected;
            }}
            onChange={handleFolderCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select all documents in ${folder.name}`}
          />
        )}
        {folder.documents.length === 0 && (
          <div className="h-4 w-4" /> 
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
        
        {/* Document count badge */}
        {folder.documents.length > 0 && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {folder.documents.length} doc{folder.documents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Documents and Children */}
      {hasChildren && isExpanded && (
        <div>
          {/* Documents in this folder */}
          {folder.documents.map(doc => (
            <DocumentItem
              key={doc.id}
              document={doc}
              level={level + 1}
              isSelected={selectedDocumentIds.has(doc.id)}
              onToggle={() => onToggleDocument(doc.id)}
            />
          ))}
          
          {/* Child folders */}
          {children.map(child => (
            <DocumentSelectionTreeNode
              key={child.id}
              folder={child}
              allFolders={allFolders}
              level={level + 1}
              expandedIds={expandedIds}
              selectedDocumentIds={selectedDocumentIds}
              onToggleExpand={onToggleExpand}
              onToggleDocument={onToggleDocument}
              onToggleFolderDocuments={onToggleFolderDocuments}
            />
          ))}
        </div>
      )}
    </div>
  );
}


interface DocumentItemProps {
  document: Document;
  level: number;
  isSelected: boolean;
  onToggle: () => void;
}

function DocumentItem({ document, level, isSelected, onToggle }: DocumentItemProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50' : ''
      }`}
      style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
    >
      {/* Spacer for alignment */}
      <div className="h-5 w-5" />
      
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Select ${document.name}`}
      />

      {/* Document Icon */}
      <svg
        className="h-5 w-5 flex-shrink-0 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>

      {/* Document Name */}
      <span className="truncate text-sm text-gray-700">{document.name}</span>
      
      {/* File size */}
      <span className="ml-auto text-xs text-gray-400">
        {formatFileSize(document.file_size)}
      </span>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export interface DocumentSelectionTreeProps {
  folders: Folder[];
  documents: Document[];
  selectedDocumentIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  className?: string;
}

export function DocumentSelectionTree({
  folders,
  documents,
  selectedDocumentIds,
  onSelectionChange,
  className = '',
}: DocumentSelectionTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Build folders with their documents
  const foldersWithDocuments: FolderWithDocuments[] = folders.map(folder => ({
    ...folder,
    documents: documents.filter(doc => doc.folder_id === folder.id),
  }));

  // Documents without a folder (root level)
  const rootDocuments = documents.filter(doc => doc.folder_id === null);
  const rootFolders = foldersWithDocuments.filter(f => f.parent_id === null);

  // Auto-expand folders that have selected documents
  useEffect(() => {
    const foldersToExpand = new Set<string>();
    selectedDocumentIds.forEach(docId => {
      const doc = documents.find(d => d.id === docId);
      if (doc?.folder_id) {
        foldersToExpand.add(doc.folder_id);
        // Also expand parent folders
        let parentId = folders.find(f => f.id === doc.folder_id)?.parent_id;
        while (parentId) {
          foldersToExpand.add(parentId);
          parentId = folders.find(f => f.id === parentId)?.parent_id;
        }
      }
    });
    if (foldersToExpand.size > 0) {
      setExpandedIds(prev => new Set([...prev, ...foldersToExpand]));
    }
  }, [selectedDocumentIds, documents, folders]);

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

  const handleToggleDocument = useCallback((docId: string) => {
    const newSelectedIds = new Set(selectedDocumentIds);
    if (newSelectedIds.has(docId)) {
      newSelectedIds.delete(docId);
    } else {
      newSelectedIds.add(docId);
    }
    onSelectionChange(newSelectedIds);
  }, [selectedDocumentIds, onSelectionChange]);

  const handleToggleFolderDocuments = useCallback((folderId: string, select: boolean) => {
    const folder = foldersWithDocuments.find(f => f.id === folderId);
    if (!folder) return;
    
    const newSelectedIds = new Set(selectedDocumentIds);
    folder.documents.forEach(doc => {
      if (select) {
        newSelectedIds.add(doc.id);
      } else {
        newSelectedIds.delete(doc.id);
      }
    });
    onSelectionChange(newSelectedIds);
  }, [foldersWithDocuments, selectedDocumentIds, onSelectionChange]);

  // Expand all folders
  const expandAll = useCallback(() => {
    setExpandedIds(new Set(folders.map(f => f.id)));
  }, [folders]);

  // Collapse all folders
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Select all documents
  const selectAll = useCallback(() => {
    onSelectionChange(new Set(documents.map(d => d.id)));
  }, [documents, onSelectionChange]);

  // Deselect all documents
  const deselectAll = useCallback(() => {
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  // Clear selection (alias for deselect all)
  const clearSelection = deselectAll;

  const totalDocuments = documents.length;
  const selectedCount = selectedDocumentIds.size;

  if (totalDocuments === 0) {
    return (
      <div className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center ${className}`}>
        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-500">No documents available</p>
        <p className="mt-1 text-xs text-gray-400">Upload some PDF documents to get started</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Action Buttons */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
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
      </div>

      {/* Selection Count */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {selectedCount} of {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} selected
        </span>
        {selectedCount > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-red-600 hover:text-red-800 hover:underline"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Tree */}
      <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white">
        {/* Root level documents */}
        {rootDocuments.map(doc => (
          <DocumentItem
            key={doc.id}
            document={doc}
            level={-1}
            isSelected={selectedDocumentIds.has(doc.id)}
            onToggle={() => handleToggleDocument(doc.id)}
          />
        ))}
        
        {/* Folders */}
        {rootFolders.map(folder => (
          <DocumentSelectionTreeNode
            key={folder.id}
            folder={folder}
            allFolders={foldersWithDocuments}
            level={0}
            expandedIds={expandedIds}
            selectedDocumentIds={selectedDocumentIds}
            onToggleExpand={handleToggleExpand}
            onToggleDocument={handleToggleDocument}
            onToggleFolderDocuments={handleToggleFolderDocuments}
          />
        ))}
      </div>
    </div>
  );
}
