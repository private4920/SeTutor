"use client";

import { useState, useCallback, useEffect } from 'react';
import { Document } from '@/lib/db/types';
import { Folder } from '@/lib/hooks/useFolders';

interface MoveDocumentModalProps {
  document: Document;
  folders: Folder[];
  onMove: (documentId: string, folderId: string | null) => Promise<void>;
  onClose: () => void;
}

export function MoveDocumentModal({
  document,
  folders,
  onMove,
  onClose
}: MoveDocumentModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(document.folder_id);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isMoving, setIsMoving] = useState(false);

  const toggleExpand = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isMoving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isMoving]);

  const handleMove = async () => {
    if (selectedFolderId === document.folder_id) {
      onClose();
      return;
    }
    
    setIsMoving(true);
    try {
      await onMove(document.id, selectedFolderId);
      onClose();
    } finally {
      setIsMoving(false);
    }
  };

  // Build folder tree structure
  const rootFolders = folders.filter(f => f.parent_id === null);
  
  const getChildFolders = (parentId: string) => 
    folders.filter(f => f.parent_id === parentId);

  const renderFolder = (folder: Folder, level: number = 0) => {
    const children = getChildFolders(folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = folder.id === selectedFolderId;
    const isCurrent = folder.id === document.folder_id;

    return (
      <div key={folder.id}>
        <div
          className={`
            flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors
            ${isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
            ${isCurrent ? 'border-l-2 border-blue-500' : ''}
          `}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
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
          ) : (
            <span className="w-5" />
          )}
          
          <button
            onClick={() => setSelectedFolderId(folder.id)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <svg
              className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-yellow-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span className="text-sm font-medium">{folder.name}</span>
            {isCurrent && (
              <span className="text-xs text-gray-500">(current)</span>
            )}
          </button>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Move Document</h3>
            <p className="text-sm text-gray-500 truncate max-w-xs">{document.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isMoving}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Folder List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Root option */}
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`
              flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors
              ${selectedFolderId === null ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
              ${document.folder_id === null ? 'border-l-2 border-blue-500' : ''}
            `}
          >
            <svg
              className={`h-5 w-5 ${selectedFolderId === null ? 'text-blue-600' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium">Root (No folder)</span>
            {document.folder_id === null && (
              <span className="text-xs text-gray-500">(current)</span>
            )}
          </button>

          {/* Folder tree */}
          {rootFolders.length > 0 ? (
            rootFolders.map(folder => renderFolder(folder))
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">
              No folders available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-3">
          <button
            onClick={onClose}
            disabled={isMoving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={isMoving || selectedFolderId === document.folder_id}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isMoving ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  );
}
