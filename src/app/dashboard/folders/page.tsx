"use client";

import { useState, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FolderList, Breadcrumbs, buildBreadcrumbsFromPath, BreadcrumbItem } from '@/components/folders';
import { useFolders, Folder } from '@/lib/hooks/useFolders';

export default function FoldersPage() {
  const { folders, fetchFolders } = useFolders();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: 'Root' }
  ]);

  // Fetch all folders to build breadcrumbs accurately
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Update breadcrumbs when current folder or folders list changes
  useEffect(() => {
    if (folders.length > 0 || currentFolderId === null) {
      const newBreadcrumbs = buildBreadcrumbsFromPath(folders, currentFolderId);
      setBreadcrumbs(newBreadcrumbs);
    }
  }, [currentFolderId, folders]);

  const handleFolderClick = useCallback((folder: Folder) => {
    setCurrentFolderId(folder.id);
  }, []);

  const handleBreadcrumbClick = useCallback((item: BreadcrumbItem) => {
    setCurrentFolderId(item.id);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Folders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your documents into folders for easy access.
          </p>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={breadcrumbs}
          onItemClick={handleBreadcrumbClick}
          showHomeIcon={true}
        />

        {/* Folder List - Requirements 12.2 */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <FolderList 
            parentId={currentFolderId} 
            onFolderClick={handleFolderClick}
            enablePagination={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
