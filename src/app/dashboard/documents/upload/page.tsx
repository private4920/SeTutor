"use client";

import { Suspense, useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileUpload } from '@/components/documents';
import { FolderPickerModal } from '@/components/documents/FolderPickerModal';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useFolders, Folder } from '@/lib/hooks/useFolders';
import { useToast } from '@/components/ui/Toast';

function UploadDocumentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFolderId = searchParams.get('folderId');
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  
  const { 
    uploadProgress, 
    uploadMultipleDocuments, 
    cancelUpload,
    error: uploadError 
  } = useDocuments();
  
  const { folders, fetchFolders } = useFolders();
  const toast = useToast();

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    if (selectedFolderId && folders.length > 0) {
      const folder = folders.find(f => f.id === selectedFolderId);
      setSelectedFolder(folder || null);
    } else {
      setSelectedFolder(null);
    }
  }, [selectedFolderId, folders]);

  const handleUpload = useCallback(async (files: File[]) => {
    await uploadMultipleDocuments(files, selectedFolderId);
    // Toast notifications are handled by checking upload progress
    const successCount = Array.from(uploadProgress.values()).filter(p => p.status === 'completed').length;
    const errorCount = Array.from(uploadProgress.values()).filter(p => p.status === 'error').length;
    
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
    } else if (errorCount > 0) {
      toast.warning(`${successCount} uploaded, ${errorCount} failed`);
    }
  }, [uploadMultipleDocuments, selectedFolderId, uploadProgress, toast]);

  const handleFolderSelect = useCallback((folder: Folder | null) => {
    setSelectedFolderId(folder?.id || null);
    setSelectedFolder(folder);
    setShowFolderSelector(false);
  }, []);

  const completedUploads = Array.from(uploadProgress.values()).filter(
    p => p.status === 'completed'
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload PDF documents to your library. Files will be stored securely.
          </p>
        </div>

        {/* Folder Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload to folder
          </label>
          <button
            onClick={() => setShowFolderSelector(true)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-gray-900">
                {selectedFolder ? selectedFolder.name : 'Root (No folder)'}
              </span>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {selectedFolder && (
            <p className="mt-1 text-xs text-gray-500">
              Path: {selectedFolder.path}
            </p>
          )}
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {uploadError}
          </div>
        )}

        {/* File Upload Component */}
        <FileUpload
          onUpload={handleUpload}
          uploadProgress={uploadProgress}
          onCancelUpload={cancelUpload}
          folderId={selectedFolderId}
        />

        {/* Success Message */}
        {completedUploads > 0 && (
          <div className="mt-6 rounded-lg bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-green-800">
                {completedUploads} file{completedUploads > 1 ? 's' : ''} uploaded successfully
              </p>
            </div>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => router.push('/dashboard/documents')}
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                View all documents →
              </button>
              {selectedFolderId && (
                <button
                  onClick={() => router.push(`/dashboard/folders?id=${selectedFolderId}`)}
                  className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                  View folder →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Folder Picker Modal */}
        {showFolderSelector && (
          <FolderPickerModal
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelect={handleFolderSelect}
            onClose={() => setShowFolderSelector(false)}
            allowRoot={true}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function UploadDocumentsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    }>
      <UploadDocumentsPageContent />
    </Suspense>
  );
}
