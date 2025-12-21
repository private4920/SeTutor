"use client";

import { useState, useCallback, useEffect } from 'react';
import { Folder } from '@/lib/hooks/useFolders';
import { Document } from '@/lib/db/types';
import {
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  FileText,
  CheckSquare,
  Square,
  Maximize2,
  Minimize2,
  X,
  UploadCloud
} from 'lucide-react';
import { cn } from "@/lib/utils";

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
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-2 transition-all duration-200",
          "hover:bg-gray-50 group"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          onClick={handleExpandClick}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
            "hover:bg-gray-200 text-gray-400 hover:text-gray-600",
            !hasChildren && "invisible"
          )}
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
        </button>

        {/* Custom Checkbox */}
        {folder.documents.length > 0 ? (
          <div
            onClick={handleFolderCheckboxChange}
            className={cn(
              "flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-colors",
              allDocsSelected
                ? "border-black bg-black text-brand-neon"
                : someDocsSelected
                  ? "border-black bg-black text-brand-neon"
                  : "border-gray-300 bg-white hover:border-gray-400"
            )}
          >
            {allDocsSelected && <CheckSquare className="h-3.5 w-3.5" />}
            {someDocsSelected && !allDocsSelected && <div className="h-2 w-2 bg-brand-neon rounded-sm" />}
          </div>
        ) : (
          <div className="h-5 w-5" />
        )}

        <div className="flex items-center gap-2 text-gray-600">
          {isExpanded
            ? <FolderOpen className="h-5 w-5 text-gray-900" />
            : <FolderIcon className="h-5 w-5" />
          }
          <span className="truncate text-sm font-medium">{folder.name}</span>
        </div>

        {folder.documents.length > 0 && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
            {folder.documents.length}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {folder.documents.map(doc => (
            <DocumentItem
              key={doc.id}
              document={doc}
              level={level + 1}
              isSelected={selectedDocumentIds.has(doc.id)}
              onToggle={() => onToggleDocument(doc.id)}
            />
          ))}

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
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-all duration-200 border border-transparent",
        isSelected
          ? "bg-brand-neon/5 border-brand-neon/20 shadow-sm"
          : "hover:bg-gray-50"
      )}
      style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
      onClick={onToggle}
    >
      <div className="h-5 w-6" /> {/* Spacer alignment */}

      <div className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
        isSelected
          ? "border-black bg-black text-brand-neon"
          : "border-gray-300 bg-white group-hover:border-gray-400"
      )}>
        {isSelected && <CheckSquare className="h-3.5 w-3.5" />}
      </div>

      <FileText className={cn(
        "h-4 w-4 shrink-0",
        isSelected ? "text-black" : "text-gray-400"
      )} />

      <span className={cn(
        "truncate text-sm",
        isSelected ? "font-medium text-black" : "text-gray-600"
      )}>
        {document.name}
      </span>

      <span className="ml-auto text-[10px] text-gray-400 font-mono">
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

  // Documents without a folder
  const rootDocuments = documents.filter(doc => doc.folder_id === null);
  const rootFolders = foldersWithDocuments.filter(f => f.parent_id === null);

  // Auto-expand
  useEffect(() => {
    const foldersToExpand = new Set<string>();
    selectedDocumentIds.forEach(docId => {
      const doc = documents.find(d => d.id === docId);
      if (doc?.folder_id) {
        foldersToExpand.add(doc.folder_id);
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleDocument = useCallback((docId: string) => {
    const newSelectedIds = new Set(selectedDocumentIds);
    if (newSelectedIds.has(docId)) newSelectedIds.delete(docId);
    else newSelectedIds.add(docId);
    onSelectionChange(newSelectedIds);
  }, [selectedDocumentIds, onSelectionChange]);

  const handleToggleFolderDocuments = useCallback((folderId: string, select: boolean) => {
    const folder = foldersWithDocuments.find(f => f.id === folderId);
    if (!folder) return;
    const newSelectedIds = new Set(selectedDocumentIds);
    folder.documents.forEach(doc => {
      if (select) newSelectedIds.add(doc.id);
      else newSelectedIds.delete(doc.id);
    });
    onSelectionChange(newSelectedIds);
  }, [foldersWithDocuments, selectedDocumentIds, onSelectionChange]);

  const expandAll = useCallback(() => setExpandedIds(new Set(folders.map(f => f.id))), [folders]);
  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);
  const selectAll = useCallback(() => onSelectionChange(new Set(documents.map(d => d.id))), [documents, onSelectionChange]);
  const deselectAll = useCallback(() => onSelectionChange(new Set()), [onSelectionChange]);
  const clearSelection = deselectAll;

  const totalDocuments = documents.length;
  const selectedCount = selectedDocumentIds.size;

  if (totalDocuments === 0) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center ${className}`}>
        <div className="mb-3 rounded-full bg-gray-100 p-3">
          <UploadCloud className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900">No documents yet</p>
        <p className="mt-1 text-xs text-gray-500">Upload PDFs to start generating quizzes</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Selection Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex bg-gray-100/50 p-1 rounded-lg gap-1">
          <button
            onClick={expandAll}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black"
            title="Expand All"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={collapseAll}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black"
            title="Collapse All"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">
            {selectedCount} selected
          </div>
          {selectedCount > 0 && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tree View */}
      <div className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm space-y-1">
        {rootDocuments.map(doc => (
          <DocumentItem
            key={doc.id}
            document={doc}
            level={-1}
            isSelected={selectedDocumentIds.has(doc.id)}
            onToggle={() => handleToggleDocument(doc.id)}
          />
        ))}
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

      <div className="text-right mt-2">
        <button
          onClick={selectAll}
          className="text-xs font-medium text-gray-400 hover:text-brand-neon hover:underline decoration-brand-neon underline-offset-4 transition-all"
        >
          Select All Documents
        </button>
      </div>
    </div>
  );
}
