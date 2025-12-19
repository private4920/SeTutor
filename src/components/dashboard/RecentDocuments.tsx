"use client";

import { memo } from 'react';
import Link from "next/link";
import { Document } from "@/lib/db/types";
import { RecentDocumentsSkeleton } from '@/components/ui/Skeleton';

interface RecentDocumentsProps {
  documents: Document[];
  loading?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Memoized recent documents component
 * Requirements: 1.3, 6.4, 12.1, 12.3, 12.5 - Responsive design and performance optimization
 */
export const RecentDocuments = memo(function RecentDocuments({ documents, loading = false }: RecentDocumentsProps) {
  // Use skeleton component for loading state - Requirements 12.5
  if (loading) {
    return <RecentDocumentsSkeleton />;
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Documents</h3>
        <div className="mt-4 flex flex-col items-center justify-center py-6 sm:py-8 text-center">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400"
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
          </div>
          <p className="mt-3 sm:mt-4 text-sm text-gray-500 px-4">
            No documents uploaded yet. Start by uploading your first PDF document.
          </p>
          <Link
            href="/dashboard/files/upload"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 sm:py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Documents</h3>
        <Link
          href="/dashboard/files"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 active:text-blue-800"
        >
          View all
        </Link>
      </div>
      <div className="mt-3 sm:mt-4 divide-y divide-gray-100">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {doc.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
              </p>
            </div>
            <Link
              href={doc.folder_id ? `/dashboard/files?folderId=${doc.folder_id}` : '/dashboard/files'}
              className="flex-shrink-0 rounded-lg p-2.5 sm:p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-95"
              aria-label={`View ${doc.name}`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
});
