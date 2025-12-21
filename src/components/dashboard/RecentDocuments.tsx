"use client";

import { memo } from 'react';
import Link from "next/link";
import { Document } from "@/lib/db/types";
import { RecentDocumentsSkeleton } from '@/components/ui/Skeleton';
import { FileText, ChevronRight, UploadCloud } from 'lucide-react';
import { cn } from "@/lib/utils";

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

export const RecentDocuments = memo(function RecentDocuments({ documents, loading = false }: RecentDocumentsProps) {
  if (loading) {
    return <RecentDocumentsSkeleton />;
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mb-4">
          <UploadCloud className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No documents yet</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Start building your knowledge base by uploading your first PDF document.
        </p>
        <Link
          href="/dashboard/files/upload"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-gray-900"
        >
          <UploadCloud className="h-4 w-4" />
          Upload Files
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-50 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Documents</h3>
        <Link
          href="/dashboard/files"
          className="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-black transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={doc.folder_id ? `/dashboard/files?folderId=${doc.folder_id}` : '/dashboard/files'}
            className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-black group-hover:text-brand-neon">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 group-hover:text-black transition-colors">
                {doc.name}
              </p>
              <p className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{formatFileSize(doc.file_size)}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>{formatDate(doc.created_at)}</span>
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-gray-900" />
          </Link>
        ))}
      </div>
    </div>
  );
});
