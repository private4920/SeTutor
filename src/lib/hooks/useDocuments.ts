"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Document } from '@/lib/db/types';
import { getIdToken } from './useAuthenticatedFetch';

export type { Document };

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  abortController?: AbortController;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadProgress: Map<string, UploadProgress>;
  pagination: PaginationState;
  fetchDocuments: (folderId?: string | null) => Promise<void>;
  fetchDocumentsPaginated: (folderId?: string | null, page?: number, pageSize?: number) => Promise<void>;
  searchDocuments: (query: string) => Promise<void>;
  uploadDocument: (file: File, folderId?: string | null) => Promise<Document | null>;
  uploadMultipleDocuments: (files: File[], folderId?: string | null) => Promise<void>;
  cancelUpload: (fileName: string) => void;
  deleteDocument: (id: string) => Promise<boolean>;
  moveDocument: (id: string, newFolderId: string | null) => Promise<Document | null>;
  renameDocument: (id: string, newName: string) => Promise<Document | null>;
  clearError: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

/**
 * Helper to create authenticated headers with JWT token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function useDocuments(): UseDocumentsReturn {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });

  const clearError = useCallback(() => setError(null), []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const fetchDocuments = useCallback(async (folderId?: string | null) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (folderId !== undefined) {
        params.set('folderId', folderId === null ? 'null' : folderId);
      }
      
      const response = await fetch(`/api/documents?${params}`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents');
      }
      
      setDocuments(data.documents);
      setPagination(prev => ({
        ...prev,
        totalItems: data.documents.length,
        totalPages: 1,
        currentPage: 1,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchDocumentsPaginated = useCallback(async (
    folderId?: string | null,
    page?: number,
    pageSize?: number
  ) => {
    if (!user) return;
    
    const currentPageSize = pageSize ?? pagination.pageSize;
    const currentPage = page ?? pagination.currentPage;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ 
        page: currentPage.toString(),
        pageSize: currentPageSize.toString(),
      });
      if (folderId !== undefined) {
        params.set('folderId', folderId === null ? 'null' : folderId);
      }
      
      const response = await fetch(`/api/documents?${params}`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents');
      }
      
      setDocuments(data.documents);
      setPagination({
        currentPage,
        pageSize: currentPageSize,
        totalItems: data.total,
        totalPages: Math.ceil(data.total / currentPageSize),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, pagination.pageSize, pagination.currentPage]);

  const searchDocuments = useCallback(async (query: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ search: query });
      
      const response = await fetch(`/api/documents?${params}`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search documents');
      }
      
      setDocuments(data.documents);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search documents';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUploadProgress = useCallback((fileName: string, update: Partial<UploadProgress>) => {
    setUploadProgress(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(fileName) || { 
        fileName, 
        progress: 0, 
        status: 'pending' as const 
      };
      newMap.set(fileName, { ...current, ...update });
      return newMap;
    });
  }, []);

  const uploadDocument = useCallback(async (
    file: File, 
    folderId?: string | null
  ): Promise<Document | null> => {
    if (!user) return null;

    const abortController = new AbortController();
    
    updateUploadProgress(file.name, { 
      status: 'uploading', 
      progress: 0,
      abortController 
    });

    try {
      // Get JWT token for authentication
      const token = await getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      if (folderId) {
        formData.append('folderId', folderId);
      }

      // Use XMLHttpRequest for progress tracking - Requirements 4.3
      const document = await new Promise<Document>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateUploadProgress(file.name, { progress });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.document);
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Handle abort signal - Requirements 4.3 (cancel option)
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });

        xhr.open('POST', '/api/documents/upload');
        // Set Authorization header with JWT token
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      updateUploadProgress(file.name, { status: 'completed', progress: 100 });
      
      // Add to documents list
      setDocuments(prev => [document, ...prev]);
      
      return document;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      const isCancelled = message === 'Upload cancelled';
      
      updateUploadProgress(file.name, { 
        status: isCancelled ? 'cancelled' : 'error', 
        error: message 
      });
      
      if (!isCancelled) {
        setError(message);
      }
      
      return null;
    }
  }, [user, updateUploadProgress]);

  // Multiple file upload support - Requirements 4.2
  const uploadMultipleDocuments = useCallback(async (
    files: File[], 
    folderId?: string | null
  ): Promise<void> => {
    // Initialize progress for all files
    files.forEach(file => {
      updateUploadProgress(file.name, { status: 'pending', progress: 0 });
    });

    // Upload files sequentially to avoid overwhelming the server
    for (const file of files) {
      const progress = uploadProgress.get(file.name);
      if (progress?.status === 'cancelled') continue;
      
      await uploadDocument(file, folderId);
    }
  }, [uploadDocument, uploadProgress, updateUploadProgress]);

  const cancelUpload = useCallback((fileName: string) => {
    const progress = uploadProgress.get(fileName);
    if (progress?.abortController) {
      progress.abortController.abort();
    }
    updateUploadProgress(fileName, { status: 'cancelled' });
  }, [uploadProgress, updateUploadProgress]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }
      
      setDocuments(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      setError(message);
      return false;
    }
  }, [user]);

  const moveDocument = useCallback(async (
    id: string, 
    newFolderId: string | null
  ): Promise<Document | null> => {
    if (!user) return null;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ folderId: newFolderId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to move document');
      }
      
      setDocuments(prev => 
        prev.map(d => d.id === id ? data.document : d)
      );
      
      return data.document;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move document';
      setError(message);
      return null;
    }
  }, [user]);

  const renameDocument = useCallback(async (
    id: string, 
    newName: string
  ): Promise<Document | null> => {
    if (!user) return null;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name: newName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename document');
      }
      
      setDocuments(prev => 
        prev.map(d => d.id === id ? data.document : d)
      );
      
      return data.document;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename document';
      setError(message);
      return null;
    }
  }, [user]);

  return {
    documents,
    loading,
    error,
    uploadProgress,
    pagination,
    fetchDocuments,
    fetchDocumentsPaginated,
    searchDocuments,
    uploadDocument,
    uploadMultipleDocuments,
    cancelUpload,
    deleteDocument,
    moveDocument,
    renameDocument,
    clearError,
    setPage,
    setPageSize,
  };
}
