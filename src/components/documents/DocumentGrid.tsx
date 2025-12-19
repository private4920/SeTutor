"use client";

import { memo, useCallback } from 'react';
import { Document } from '@/lib/db/types';

interface DocumentGridProps {
  documents: Document[];
  onPreview: (document: Document) => void;
  onMove: (document: Document) => void;
  onDelete: (document: Document) => void;
}

interface DocumentGridItemProps {
  document: Document;
  onPreview: (document: Document) => void;
  onMove: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Memoized document grid item component
 * Requirements: 12.1, 12.3 - Performance optimization with React.memo
 */
const DocumentGridItem = memo(function DocumentGridItem({
  document: doc,
  onPreview,
  onMove,
  onDelete,
}: DocumentGridItemProps) {
  const handlePreview = useCallback(() => onPreview(doc), [doc, onPreview]);
  const handleMove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(doc);
  }, [doc, onMove]);
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(doc);
  }, [doc, onDelete]);

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Document Icon and Preview Button */}
      <button
        onClick={handlePreview}
        className="flex w-full flex-col items-center"
      >
        <div className="flex h-24 w-full items-center justify-center rounded-lg bg-red-50">
          <svg className="h-16 w-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Document Info */}
      <div className="mt-3 w-full">
        <h3 className="truncate text-sm font-medium text-gray-900" title={doc.name}>
          {doc.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
        </p>
      </div>

      {/* Action Buttons - Visible on hover */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handlePreview}
          className="rounded-lg bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-100"
          title="Preview"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button
          onClick={handleMove}
          className="rounded-lg bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-100"
          title="Move"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50"
          title="Delete"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
});

/**
 * Memoized document grid component
 * Requirements: 12.1, 12.3 - Performance optimization with React.memo
 */
export const DocumentGrid = memo(function DocumentGrid({ 
  documents, 
  onPreview, 
  onMove, 
  onDelete 
}: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map(doc => (
        <DocumentGridItem
          key={doc.id}
          document={doc}
          onPreview={onPreview}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});
