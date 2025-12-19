"use client";

import { useState, useEffect, useCallback } from 'react';
import { useFolders, Folder } from '@/lib/hooks/useFolders';
import { FolderItem } from './FolderItem';
import { CreateFolderModal } from './CreateFolderModal';
import { RenameFolderModal } from './RenameFolderModal';
import { MoveFolderModal } from './MoveFolderModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { FolderGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface FolderListProps {
  parentId?: string | null;
  onFolderClick?: (folder: Folder) => void;
  enablePagination?: boolean;
}

export function FolderList({ parentId = null, onFolderClick, enablePagination = false }: FolderListProps) {
  const { 
    folders, 
    loading, 
    error, 
    pagination,
    fetchFolders,
    fetchFoldersPaginated, 
    createFolder, 
    renameFolder, 
    deleteFolder, 
    moveFolder,
    setPage,
    setPageSize,
  } = useFolders();
  const toast = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [folderToMove, setFolderToMove] = useState<Folder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);

  useEffect(() => {
    if (enablePagination) {
      fetchFoldersPaginated(parentId, pagination.currentPage, pagination.pageSize);
    } else {
      fetchFolders(parentId);
    }
  }, [fetchFolders, fetchFoldersPaginated, parentId, enablePagination, pagination.currentPage, pagination.pageSize]);

  // Fetch all folders for move modal (without pagination)
  useEffect(() => {
    const fetchAllFolders = async () => {
      try {
        const { getIdToken } = await import('@/lib/hooks/useAuthenticatedFetch');
        const token = await getIdToken();
        if (!token) return;
        
        // We need all folders for the move modal, so fetch without pagination
        const response = await fetch('/api/folders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAllFolders(data.folders || []);
        }
      } catch (error) {
        console.error('Failed to fetch all folders:', error);
      }
    };
    fetchAllFolders();
  }, [folders]);

  const handleCreateFolder = useCallback(async (name: string) => {
    const result = await createFolder(name, parentId);
    if (result) {
      toast.success(`Folder "${name}" created successfully`);
    } else {
      toast.error('Failed to create folder');
      throw new Error('Failed to create folder');
    }
  }, [createFolder, parentId, toast]);

  const handleRenameFolder = useCallback(async (newName: string) => {
    if (!folderToRename) return;
    const result = await renameFolder(folderToRename.id, newName);
    if (result) {
      toast.success(`Folder renamed to "${newName}"`);
    } else {
      toast.error('Failed to rename folder');
      throw new Error('Failed to rename folder');
    }
  }, [renameFolder, folderToRename, toast]);

  const handleMoveFolder = useCallback(async (newParentId: string | null) => {
    if (!folderToMove) return;
    const result = await moveFolder(folderToMove.id, newParentId);
    if (result) {
      toast.success('Folder moved successfully');
    } else {
      toast.error('Failed to move folder');
      throw new Error('Failed to move folder');
    }
  }, [moveFolder, folderToMove, toast]);

  const handleDeleteFolder = useCallback(async () => {
    if (!folderToDelete) return;
    const success = await deleteFolder(folderToDelete.id);
    if (success) {
      toast.success(`Folder "${folderToDelete.name}" deleted`);
    } else {
      toast.error('Failed to delete folder');
    }
    setFolderToDelete(null);
  }, [deleteFolder, folderToDelete, toast]);

  const handleFolderClick = useCallback((folder: Folder) => {
    if (onFolderClick) {
      onFolderClick(folder);
    }
  }, [onFolderClick]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPageSize(pageSize);
  }, [setPageSize]);

  // Filter folders by parent (only when not using pagination, as API handles it)
  const displayFolders = enablePagination ? folders : folders.filter(f => f.parent_id === parentId);

  // Skeleton loading state - Requirements 12.5
  if (loading && folders.length === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Folders</h2>
        </div>
        <FolderGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div>
      {/* Header - Requirements 1.3, 6.4: Responsive design */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Folders</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 sm:py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Folder</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Folder Grid */}
      {displayFolders.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No folders</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new folder.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Folder
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayFolders.map(folder => (
              <FolderItem
                key={folder.id}
                folder={folder}
                onRename={setFolderToRename}
                onDelete={setFolderToDelete}
                onMove={setFolderToMove}
                onClick={handleFolderClick}
              />
            ))}
          </div>

          {/* Pagination - Requirements 12.2 */}
          {enablePagination && pagination.totalPages > 0 && (
            <div className="mt-4 sm:mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[20, 30, 50]}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateFolder}
      />

      <RenameFolderModal
        isOpen={!!folderToRename}
        currentName={folderToRename?.name || ''}
        onClose={() => setFolderToRename(null)}
        onRename={handleRenameFolder}
      />

      <MoveFolderModal
        isOpen={!!folderToMove}
        folder={folderToMove}
        allFolders={allFolders.length > 0 ? allFolders : folders}
        onClose={() => setFolderToMove(null)}
        onMove={handleMoveFolder}
      />

      <ConfirmDialog
        isOpen={!!folderToDelete}
        title="Delete Folder"
        message={`Are you sure you want to delete "${folderToDelete?.name}"? This will also delete all contents inside this folder. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteFolder}
        onCancel={() => setFolderToDelete(null)}
      />
    </div>
  );
}
