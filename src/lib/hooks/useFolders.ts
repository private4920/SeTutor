"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { getIdToken } from './useAuthenticatedFetch';

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface UseFoldersReturn {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchFolders: (parentId?: string | null) => Promise<void>;
  fetchFoldersPaginated: (parentId?: string | null, page?: number, pageSize?: number) => Promise<void>;
  fetchFolderPath: (folderId: string) => Promise<Folder[]>;
  createFolder: (name: string, parentId?: string | null) => Promise<Folder | null>;
  renameFolder: (id: string, name: string) => Promise<Folder | null>;
  deleteFolder: (id: string) => Promise<boolean>;
  moveFolder: (id: string, newParentId: string | null) => Promise<Folder | null>;
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

export function useFolders(): UseFoldersReturn {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const fetchFolders = useCallback(async (parentId?: string | null) => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (parentId !== undefined) {
        params.append('parentId', parentId === null ? 'null' : parentId);
      }
      
      const response = await fetch(`/api/folders?${params}`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch folders');
      }
      
      setFolders(data.folders);
      setPagination(prev => ({
        ...prev,
        totalItems: data.folders.length,
        totalPages: 1,
        currentPage: 1,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch folders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const fetchFoldersPaginated = useCallback(async (
    parentId?: string | null,
    page?: number,
    pageSize?: number
  ) => {
    if (!user?.uid) return;
    
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
      if (parentId !== undefined) {
        params.append('parentId', parentId === null ? 'null' : parentId);
      }
      
      const response = await fetch(`/api/folders?${params}`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch folders');
      }
      
      setFolders(data.folders);
      setPagination({
        currentPage,
        pageSize: currentPageSize,
        totalItems: data.total,
        totalPages: Math.ceil(data.total / currentPageSize),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch folders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, pagination.pageSize, pagination.currentPage]);

  const fetchFolderPath = useCallback(async (folderId: string): Promise<Folder[]> => {
    if (!user?.uid) return [];
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/folders/${folderId}/path`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch folder path');
      }
      
      return data.path;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch folder path';
      setError(message);
      return [];
    }
  }, [user?.uid]);

  const createFolder = useCallback(async (name: string, parentId?: string | null): Promise<Folder | null> => {
    if (!user?.uid) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, parentId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create folder');
      }
      
      setFolders(prev => [...prev, data.folder]);
      return data.folder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create folder';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const renameFolder = useCallback(async (id: string, name: string): Promise<Folder | null> => {
    if (!user?.uid) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename folder');
      }
      
      setFolders(prev => prev.map(f => f.id === id ? data.folder : f));
      return data.folder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename folder';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const deleteFolder = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.uid) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/folders/${id}`, {
        method: 'DELETE',
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete folder');
      }
      
      setFolders(prev => prev.filter(f => f.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete folder';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const moveFolder = useCallback(async (id: string, newParentId: string | null): Promise<Folder | null> => {
    if (!user?.uid) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/folders/${id}/move`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ newParentId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to move folder');
      }
      
      // Refresh folders to get updated paths
      await fetchFolders();
      return data.folder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move folder';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, fetchFolders]);

  return {
    folders,
    loading,
    error,
    pagination,
    fetchFolders,
    fetchFoldersPaginated,
    fetchFolderPath,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    setPage,
    setPageSize,
  };
}
