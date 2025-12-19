"use client";

import { useState, useEffect } from 'react';
import { Folder } from '@/lib/hooks/useFolders';

interface MoveFolderModalProps {
  isOpen: boolean;
  folder: Folder | null;
  allFolders: Folder[];
  onClose: () => void;
  onMove: (newParentId: string | null) => Promise<void>;
}

export function MoveFolderModal({
  isOpen,
  folder,
  allFolders,
  onClose,
  onMove
}: MoveFolderModalProps) {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && folder) {
      setSelectedParentId(folder.parent_id);
      setError(null);
    }
  }, [isOpen, folder]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Get valid destination folders (exclude self and descendants)
  const getValidDestinations = (): Folder[] => {
    if (!folder) return [];
    
    const folderPath = folder.path;
    return allFolders.filter(f => {
      // Exclude the folder itself
      if (f.id === folder.id) return false;
      // Exclude descendants (paths that start with this folder's path)
      if (f.path.startsWith(folderPath + '/')) return false;
      return true;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folder) return;

    if (selectedParentId === folder.parent_id) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onMove(selectedParentId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !folder) return null;

  const validDestinations = getValidDestinations();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-folder-title"
        className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="move-folder-title" className="text-lg font-semibold text-gray-900">
          Move Folder
        </h2>
        
        <p className="mt-1 text-sm text-gray-500">
          Moving: <span className="font-medium">{folder.name}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label htmlFor="destination-folder" className="block text-sm font-medium text-gray-700">
              Destination
            </label>
            <select
              id="destination-folder"
              value={selectedParentId || ''}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Root (No parent)</option>
              {validDestinations.map(f => (
                <option key={f.id} value={f.id}>
                  {f.path}
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Moving...' : 'Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
