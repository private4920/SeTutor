"use client";

import { memo, useCallback } from 'react';
import { Document } from '@/lib/db/types';

interface DocumentListProps {
  documents: Document[];
  onPreview: (document: Document) => void;
  onMove: (document: Document) => void;
  onDelete: (document: Document) => void;
}

interface DocumentListItemProps {
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
 * Memoized document list item component
 * Requirements: 12.1, 12.3 - Performance optimization with React.memo
 */
const DocumentListItem = memo(function DocumentListItem({
  document: doc,
  onPreview,
  onMove,
  onDelete,
}: DocumentListItemProps) {
  const handlePreview = useCallback(() => onPreview(doc), [doc, onPreview]);
  const handleMove = useCallback(() => onMove(doc), [doc, onMove]);
  const handleDelete = useCallback(() => onDelete(doc), [doc, onDelete]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap px-6 py-4">
        <button
          onClick={handlePreview}
          className="flex items-center gap-3 text-left"
        >
          <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-gray-900 hover:text-blue-600">{doc.name}</p>
            <p className="text-xs text-gray-500">{doc.original_name}</p>
          </div>
        </button>
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 sm:table-cell">
        {formatFileSize(doc.file_size)}
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 md:table-cell">
        {formatDate(doc.created_at)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handlePreview}
            className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
            title="Preview"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={handleMove}
            className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
            title="Move"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-800"
            title="Delete"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
});

/**
 * Memoized document list component
 * Requirements: 12.1, 12.3 - Performance optimization with React.memo
 */
export const DocumentList = memo(function DocumentList({ 
  documents, 
  onPreview, 
  onMove, 
  onDelete 
}: DocumentListProps) {

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
              Size
            </th>
            <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
              Uploaded
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {documents.map(doc => (
            <DocumentListItem
              key={doc.id}
              document={doc}
              onPreview={onPreview}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
