"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useFolders, Folder } from '@/lib/hooks/useFolders';
import { useDocuments, Document } from '@/lib/hooks/useDocuments';
import { Breadcrumbs, buildBreadcrumbsFromPath, BreadcrumbItem } from '@/components/folders/Breadcrumbs';
import { CreateFolderModal } from '@/components/folders/CreateFolderModal';
import { RenameFolderModal } from '@/components/folders/RenameFolderModal';
import { MoveFolderModal } from '@/components/folders/MoveFolderModal';
import { MoveDocumentModal, DocumentPreview, ViewToggle, ViewMode } from '@/components/documents';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FolderGridSkeleton, DocumentGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { FolderTreeNav } from './FolderTreeNav';

type DeleteTarget = { type: 'folder'; item: Folder } | { type: 'document'; item: Document } | null;

interface FileExplorerProps {
  initialFolderId?: string | null;
}

// Folder item for the explorer
const FolderCard = memo(function FolderCard({
  folder,
  onNavigate,
  onRename,
  onMove,
  onDelete,
}: {
  folder: Folder;
  onNavigate: (folder: Folder) => void;
  onRename: (folder: Folder) => void;
  onMove: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
      onClick={() => onNavigate(folder)}
      onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(folder); }}
      tabIndex={0}
      role="button"
      aria-label={`Open folder ${folder.name}`}
    >
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-100 to-purple-100">
        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{folder.name}</h3>
        <p className="text-xs text-gray-500">Folder</p>
      </div>
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:opacity-0 group-hover:opacity-100"
          aria-label="Actions"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRename(folder); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Rename
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove(folder); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                Move
              </button>
              <hr className="my-1" />
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(folder); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});


// Document item for the explorer
const DocumentCard = memo(function DocumentCard({
  document: doc,
  onPreview,
  onMove,
  onDelete,
}: {
  document: Document;
  onPreview: (doc: Document) => void;
  onMove: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 transition-all hover:border-gray-300 hover:shadow-md cursor-pointer"
      onClick={() => onPreview(doc)}
      onKeyDown={(e) => { if (e.key === 'Enter') onPreview(doc); }}
      tabIndex={0}
      role="button"
      aria-label={`Preview ${doc.name}`}
    >
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
        <p className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</p>
      </div>
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:opacity-0 group-hover:opacity-100"
          aria-label="Actions"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onPreview(doc); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Preview
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove(doc); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                Move
              </button>
              <hr className="my-1" />
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(doc); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});


export function FileExplorer({ initialFolderId = null }: FileExplorerProps) {
  const router = useRouter();
  const toast = useToast();
  
  // Current folder state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'My Files' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Folder state
  const {
    folders,
    loading: foldersLoading,
    error: foldersError,
    fetchFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
  } = useFolders();
  
  // Document state
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    fetchDocuments,
    searchDocuments,
    deleteDocument,
    moveDocument,
  } = useDocuments();
  
  // Modal states
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [folderToMove, setFolderToMove] = useState<Folder | null>(null);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);
  const [documentToPreview, setDocumentToPreview] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const loading = foldersLoading || documentsLoading;
  const error = foldersError || documentsError;

  // Fetch folders and documents for current folder
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchDocuments(debouncedSearchQuery);
    } else {
      fetchFolders(currentFolderId);
      fetchDocuments(currentFolderId);
    }
  }, [currentFolderId, debouncedSearchQuery, fetchFolders, fetchDocuments, searchDocuments]);

  // Update breadcrumbs when folder changes
  useEffect(() => {
    const newBreadcrumbs = buildBreadcrumbsFromPath(folders, currentFolderId);
    // Replace "Root" with "My Files"
    if (newBreadcrumbs.length > 0) {
      const firstItem = newBreadcrumbs[0];
      if (firstItem && firstItem.name === 'Root') {
        firstItem.name = 'My Files';
      }
    }
    setBreadcrumbs(newBreadcrumbs);
  }, [currentFolderId, folders]);

  // Fetch all folders for move modals
  useEffect(() => {
    const fetchAllFolders = async () => {
      try {
        const { getIdToken } = await import('@/lib/hooks/useAuthenticatedFetch');
        const token = await getIdToken();
        if (!token) return;
        const response = await fetch('/api/folders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAllFolders(data.folders || []);
        }
      } catch (err) {
        console.error('Failed to fetch all folders:', err);
      }
    };
    fetchAllFolders();
  }, [folders]);

  // Navigation
  const handleFolderNavigate = useCallback((folder: Folder) => {
    setCurrentFolderId(folder.id);
    setSearchQuery('');
  }, []);

  const handleBreadcrumbClick = useCallback((item: BreadcrumbItem) => {
    setCurrentFolderId(item.id);
    setSearchQuery('');
  }, []);

  const handleSidebarFolderSelect = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSearchQuery('');
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Folder actions
  const handleCreateFolder = useCallback(async (name: string) => {
    const result = await createFolder(name, currentFolderId);
    if (result) {
      toast.success(`Folder "${name}" created`);
    } else {
      toast.error('Failed to create folder');
      throw new Error('Failed to create folder');
    }
  }, [createFolder, currentFolderId, toast]);

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
      toast.success('Folder moved');
      fetchFolders(currentFolderId);
    } else {
      toast.error('Failed to move folder');
      throw new Error('Failed to move folder');
    }
  }, [moveFolder, folderToMove, toast, fetchFolders, currentFolderId]);

  const handleMoveDocument = useCallback(async (documentId: string, newFolderId: string | null) => {
    const result = await moveDocument(documentId, newFolderId);
    if (result) {
      toast.success('Document moved');
      fetchDocuments(currentFolderId);
    } else {
      toast.error('Failed to move document');
    }
  }, [moveDocument, toast, fetchDocuments, currentFolderId]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'folder') {
      const success = await deleteFolder(deleteTarget.item.id);
      if (success) {
        toast.success(`Folder "${deleteTarget.item.name}" deleted`);
      } else {
        toast.error('Failed to delete folder');
      }
    } else {
      const success = await deleteDocument(deleteTarget.item.id);
      if (success) {
        toast.success(`"${deleteTarget.item.name}" deleted`);
      } else {
        toast.error('Failed to delete document');
      }
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteFolder, deleteDocument, toast]);

  // Filter items for current folder (when not searching)
  const currentFolders = debouncedSearchQuery.trim() ? [] : folders.filter(f => f.parent_id === currentFolderId);
  const currentDocuments = documents;

  const isEmpty = currentFolders.length === 0 && currentDocuments.length === 0;


  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[500px] rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Folder Tree Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <FolderTreeNav
          folders={allFolders}
          currentFolderId={currentFolderId}
          onFolderSelect={handleSidebarFolderSelect}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with breadcrumbs and actions */}
        <div className="flex flex-col gap-3 p-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {/* Mobile sidebar toggle */}
              <button
                onClick={handleToggleSidebar}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Toggle folder navigation"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <Breadcrumbs
                  items={breadcrumbs}
                  onItemClick={handleBreadcrumbClick}
                  showHomeIcon={true}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">New Folder</span>
              </button>
              <button
                onClick={() => router.push(`/dashboard/files/upload${currentFolderId ? `?folderId=${currentFolderId}` : ''}`)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-1.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-4">{error}</div>
          )}

          {/* Loading */}
          {loading && isEmpty && (
            <div className="space-y-4">
              <FolderGridSkeleton count={3} />
              <DocumentGridSkeleton count={4} />
            </div>
          )}

          {/* Empty State */}
          {!loading && isEmpty && !debouncedSearchQuery.trim() && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">This folder is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Create a folder or upload files to get started.</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  New Folder
                </button>
                <button
                  onClick={() => router.push(`/dashboard/files/upload${currentFolderId ? `?folderId=${currentFolderId}` : ''}`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Files
                </button>
              </div>
            </div>
          )}

          {/* Search empty state */}
          {!loading && isEmpty && debouncedSearchQuery.trim() && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">No files match &ldquo;{debouncedSearchQuery}&rdquo;</p>
            </div>
          )}

          {/* Content - Folders first, then documents */}
          {!isEmpty && (
            <div className="space-y-6">
              {/* Folders Section */}
              {currentFolders.length > 0 && (
                <div>
                  <h2 className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Folders</h2>
                  <div className={viewMode === 'grid' 
                    ? "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "space-y-2"
                  }>
                    {currentFolders.map(folder => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onNavigate={handleFolderNavigate}
                        onRename={setFolderToRename}
                        onMove={setFolderToMove}
                        onDelete={(f) => setDeleteTarget({ type: 'folder', item: f })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {currentDocuments.length > 0 && (
                <div>
                  <h2 className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Files</h2>
                  <div className={viewMode === 'grid' 
                    ? "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "space-y-2"
                  }>
                    {currentDocuments.map(doc => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onPreview={setDocumentToPreview}
                        onMove={setDocumentToMove}
                        onDelete={(d) => setDeleteTarget({ type: 'document', item: d })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
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

      {documentToMove && (
        <MoveDocumentModal
          document={documentToMove}
          folders={allFolders.length > 0 ? allFolders : folders}
          onMove={handleMoveDocument}
          onClose={() => setDocumentToMove(null)}
        />
      )}

      {documentToPreview && (
        <DocumentPreview
          document={documentToPreview}
          onClose={() => setDocumentToPreview(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'folder' ? 'Delete Folder' : 'Delete File'}
        message={
          deleteTarget
            ? deleteTarget.type === 'folder'
              ? `Are you sure you want to delete "${deleteTarget.item.name}"? This will also delete all contents inside. This action cannot be undone.`
              : `Are you sure you want to delete "${deleteTarget.item.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
