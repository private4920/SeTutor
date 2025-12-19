"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileExplorer } from '@/components/files';

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
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    }>
      <FilesPageContent />
    </Suspense>
  );
}
