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
import {
  Folder as FolderIcon,
  FileText,
  MoreVertical,
  Search,
  Plus,
  Upload,
  Trash2,
  Edit,
  Move,
  Eye,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';

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
      className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-black hover:shadow-lg cursor-pointer"
      onClick={() => onNavigate(folder)}
      onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(folder); }}
      tabIndex={0}
      role="button"
      aria-label={`Open folder ${folder.name}`}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-black group-hover:text-brand-neon">
        <FolderIcon className="h-6 w-6" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-black">{folder.name}</h3>
        <p className="text-xs text-gray-500 font-medium group-hover:text-gray-600">Folder</p>
      </div>

      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="rounded-lg p-2 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-black group-hover:opacity-100"
          aria-label="Actions"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRename(folder); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4" />
                Rename
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove(folder); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Move className="h-4 w-4" />
                Move
              </button>
              <div className="my-1 h-px bg-gray-100" />
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(folder); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 className="h-4 w-4" />
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
      className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-brand-neon hover:shadow-lg cursor-pointer"
      onClick={() => onPreview(doc)}
      onKeyDown={(e) => { if (e.key === 'Enter') onPreview(doc); }}
      tabIndex={0}
      role="button"
      aria-label={`Preview ${doc.name}`}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-brand-neon group-hover:text-black">
        <FileText className="h-6 w-6" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-black">{doc.name}</h3>
        <p className="text-xs text-gray-500 font-medium group-hover:text-gray-600">{formatFileSize(doc.file_size)}</p>
      </div>

      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="rounded-lg p-2 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-black group-hover:opacity-100"
          aria-label="Actions"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onPreview(doc); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove(doc); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Move className="h-4 w-4" />
                Move
              </button>
              <div className="my-1 h-px bg-gray-100" />
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(doc); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 className="h-4 w-4" />
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

  // Effects (unchanged)
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchDocuments(debouncedSearchQuery);
    } else {
      fetchFolders(currentFolderId);
      fetchDocuments(currentFolderId);
    }
  }, [currentFolderId, debouncedSearchQuery, fetchFolders, fetchDocuments, searchDocuments]);

  useEffect(() => {
    const newBreadcrumbs = buildBreadcrumbsFromPath(folders, currentFolderId);
    if (newBreadcrumbs.length > 0) {
      const firstItem = newBreadcrumbs[0];
      if (firstItem && firstItem.name === 'Root') firstItem.name = 'My Files';
    }
    setBreadcrumbs(newBreadcrumbs);
  }, [currentFolderId, folders]);

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

  // Handlers (unchanged)
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

  const handleCreateFolder = useCallback(async (name: string) => {
    const result = await createFolder(name, currentFolderId);
    if (result) toast.success(`Folder "${name}" created`);
    else { toast.error('Failed to create folder'); throw new Error('Failed to create folder'); }
  }, [createFolder, currentFolderId, toast]);

  const handleRenameFolder = useCallback(async (newName: string) => {
    if (!folderToRename) return;
    const result = await renameFolder(folderToRename.id, newName);
    if (result) toast.success(`Folder renamed to "${newName}"`);
    else { toast.error('Failed to rename folder'); throw new Error('Failed to rename folder'); }
  }, [renameFolder, folderToRename, toast]);

  const handleMoveFolder = useCallback(async (newParentId: string | null) => {
    if (!folderToMove) return;
    const result = await moveFolder(folderToMove.id, newParentId);
    if (result) { toast.success('Folder moved'); fetchFolders(currentFolderId); }
    else { toast.error('Failed to move folder'); throw new Error('Failed to move folder'); }
  }, [moveFolder, folderToMove, toast, fetchFolders, currentFolderId]);

  const handleMoveDocument = useCallback(async (documentId: string, newFolderId: string | null) => {
    const result = await moveDocument(documentId, newFolderId);
    if (result) { toast.success('Document moved'); fetchDocuments(currentFolderId); }
    else toast.error('Failed to move document');
  }, [moveDocument, toast, fetchDocuments, currentFolderId]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'folder') {
      const success = await deleteFolder(deleteTarget.item.id);
      if (success) toast.success(`Folder "${deleteTarget.item.name}" deleted`);
      else toast.error('Failed to delete folder');
    } else {
      const success = await deleteDocument(deleteTarget.item.id);
      if (success) toast.success(`"${deleteTarget.item.name}" deleted`);
      else toast.error('Failed to delete document');
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteFolder, deleteDocument, toast]);

  const currentFolders = debouncedSearchQuery.trim() ? [] : folders.filter(f => f.parent_id === currentFolderId);
  const currentDocuments = documents;
  const isEmpty = currentFolders.length === 0 && currentDocuments.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
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
        <div className="flex flex-col gap-4 p-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSidebar}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Toggle folder navigation"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <Breadcrumbs
                  items={breadcrumbs}
                  onItemClick={handleBreadcrumbClick}
                  showHomeIcon={true}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <NeonButton
                variant="outline"
                onClick={() => setShowCreateFolderModal(true)}
                className="h-9 px-3 text-xs"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">New Folder</span>
              </NeonButton>
              <NeonButton
                onClick={() => router.push(`/dashboard/files/upload${currentFolderId ? `?folderId=${currentFolderId}` : ''}`)}
                className="h-9 px-3 text-xs"
              >
                <Upload className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Upload</span>
              </NeonButton>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm bg-gray-50/50 focus:bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 mb-6 font-medium">{error}</div>
          )}

          {loading && isEmpty && (
            <div className="space-y-6">
              <FolderGridSkeleton count={3} />
              <DocumentGridSkeleton count={4} />
            </div>
          )}

          {/* Empty State */}
          {!loading && isEmpty && !debouncedSearchQuery.trim() && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Inbox className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">This folder is empty</h3>
              <p className="mt-2 text-gray-500 max-w-xs">Create a folder or upload files to start organizing your knowledge base.</p>
              <div className="mt-8 flex gap-3">
                <NeonButton variant="outline" onClick={() => setShowCreateFolderModal(true)}>
                  New Folder
                </NeonButton>
                <NeonButton onClick={() => router.push(`/dashboard/files/upload${currentFolderId ? `?folderId=${currentFolderId}` : ''}`)}>
                  Upload Files
                </NeonButton>
              </div>
            </div>
          )}

          {!loading && isEmpty && debouncedSearchQuery.trim() && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No results found</h3>
              <p className="mt-2 text-gray-500">No files match &ldquo;{debouncedSearchQuery}&rdquo;</p>
            </div>
          )}

          {!isEmpty && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {currentFolders.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Folders</h2>
                  <div className={viewMode === 'grid'
                    ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "space-y-3"
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

              {currentDocuments.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Files</h2>
                  <div className={viewMode === 'grid'
                    ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "space-y-3"
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
