"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileExplorer } from '@/components/files';
import { Loader2 } from 'lucide-react';

function FilesPageContent() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folderId');

  return (
    <DashboardLayout>
      <div className="p-4 h-full">
        <FileExplorer initialFolderId={folderId} />
      </div>
    </DashboardLayout>
  );
}

export default function FilesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
            <span className="text-sm font-medium text-gray-500">Loading your files...</span>
          </div>
        </div>
      </DashboardLayout>
    }>
      <FilesPageContent />
    </Suspense>
  );
}
