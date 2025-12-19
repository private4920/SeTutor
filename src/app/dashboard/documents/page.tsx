"use client";

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useDocuments, Document } from '@/lib/hooks/useDocuments';
import { useFolders } from '@/lib/hooks/useFolders';
import { Breadcrumbs, buildBreadcrumbsFromPath } from '@/components/folders/Breadcrumbs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { DocumentListSkeleton, DocumentGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { 
  DocumentGrid, 
  DocumentList, 
  DocumentPreview, 
  MoveDocumentModal,
  ViewToggle,
  ViewMode 
} from '@/components/documents';

function DocumentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folderId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);
  const [documentToPreview, setDocumentToPreview] = useState<Document | null>(null);
  
  const { 
    documents, 
    loading, 
    error, 
    pagination,
    fetchDocumentsPaginated, 
    searchDocuments,
    deleteDocument,
    moveDocument,
    setPage,
    setPageSize,
  } = useDocuments();
  
  const { folders, fetchFolders } = useFolders();
  const toast = useToast();

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Debounce search query for performance - Requirements 12.1
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchDocuments(debouncedSearchQuery);
    } else {
      fetchDocumentsPaginated(folderId, pagination.currentPage, pagination.pageSize);
    }
  }, [folderId, debouncedSearchQuery, fetchDocumentsPaginated, searchDocuments, pagination.currentPage, pagination.pageSize]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleDeleteDocument = useCallback(async () => {
    if (!documentToDelete) return;
    const success = await deleteDocument(documentToDelete.id);
    if (success) {
      toast.success(`"${documentToDelete.name}" deleted successfully`);
    } else {
      toast.error(`Failed to delete "${documentToDelete.name}"`);
    }
    setDocumentToDelete(null);
  }, [documentToDelete, deleteDocument, toast]);

  const handleMoveDocument = useCallback(async (documentId: string, newFolderId: string | null) => {
    const result = await moveDocument(documentId, newFolderId);
    if (result) {
      toast.success('Document moved successfully');
    } else {
      toast.error('Failed to move document');
    }
    // Refresh documents after move
    if (searchQuery.trim()) {
      searchDocuments(searchQuery);
    } else {
      fetchDocumentsPaginated(folderId, pagination.currentPage, pagination.pageSize);
    }
  }, [moveDocument, searchQuery, searchDocuments, fetchDocumentsPaginated, folderId, pagination.currentPage, pagination.pageSize, toast]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPageSize(pageSize);
  }, [setPageSize]);

  const handlePreview = useCallback((doc: Document) => {
    setDocumentToPreview(doc);
  }, []);

  const handleMove = useCallback((doc: Document) => {
    setDocumentToMove(doc);
  }, []);

  const handleDelete = useCallback((doc: Document) => {
    setDocumentToDelete(doc);
  }, []);

  return (
    <DashboardLayout>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            {folderId && folders.length > 0 && (
              <Breadcrumbs 
                items={buildBreadcrumbsFromPath(folders, folderId)}
                className="mt-1"
              />
            )}
          </div>
          <button
            onClick={() => router.push(`/dashboard/documents/upload${folderId ? `?folderId=${folderId}` : ''}`)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Documents
          </button>
        </div>

        {/* Search and View Toggle - Requirements 5.1, 5.2 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading - Skeleton screens for smooth UX - Requirements 12.5 */}
        {loading && documents.length === 0 && (
          viewMode === 'grid' ? (
            <DocumentGridSkeleton count={8} />
          ) : (
            <DocumentListSkeleton count={5} />
          )
        )}

        {/* Empty State */}
        {!loading && documents.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No documents match your search.' : 'Get started by uploading a document.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/dashboard/documents/upload')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Document
              </button>
            )}
          </div>
        )}

        {/* Document Display - Grid or List View */}
        {documents.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <DocumentGrid
                documents={documents}
                onPreview={handlePreview}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ) : (
              <DocumentList
                documents={documents}
                onPreview={handlePreview}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            )}

            {/* Pagination - Requirements 12.2 */}
            {!searchQuery.trim() && pagination.totalPages > 0 && (
              <div className="mt-6">
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

        {/* Document Preview Modal - Requirements 5.3 */}
        {documentToPreview && (
          <DocumentPreview
            document={documentToPreview}
            onClose={() => setDocumentToPreview(null)}
          />
        )}

        {/* Move Document Modal - Requirements 5.4 */}
        {documentToMove && (
          <MoveDocumentModal
            document={documentToMove}
            folders={folders}
            onMove={handleMoveDocument}
            onClose={() => setDocumentToMove(null)}
          />
        )}

        {/* Delete Confirmation - Requirements 5.5 */}
        <ConfirmDialog
          isOpen={!!documentToDelete}
          title="Delete Document"
          message={`Are you sure you want to delete "${documentToDelete?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDeleteDocument}
          onCancel={() => setDocumentToDelete(null)}
        />
      </div>
    </DashboardLayout>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    }>
      <DocumentsPageContent />
    </Suspense>
  );
}
