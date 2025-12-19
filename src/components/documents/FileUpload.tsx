"use client";

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react';
import { S3_CONFIG } from '@/lib/s3';
import { UploadProgress } from '@/lib/hooks/useDocuments';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  uploadProgress: Map<string, UploadProgress>;
  onCancelUpload: (fileName: string) => void;
  disabled?: boolean;
  folderId?: string | null;
}

export function FileUpload({ 
  onUpload, 
  uploadProgress, 
  onCancelUpload,
  disabled = false 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];
    const maxSize = S3_CONFIG.MAX_FILE_SIZE;

    for (const file of files) {
      // Check file type - Requirements 4.1
      if (file.type !== 'application/pdf') {
        errors.push(`"${file.name}" is not a PDF file. Only PDF files are allowed.`);
        continue;
      }

      // Check file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'pdf') {
        errors.push(`"${file.name}" does not have a .pdf extension.`);
        continue;
      }

      // Check file size - Requirements 4.1 (50MB limit)
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        errors.push(`"${file.name}" exceeds the 50MB limit (${sizeMB}MB).`);
        continue;
      }

      valid.push(file);
    }

    return { valid, errors };
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);
    
    setValidationErrors(errors);
    
    if (valid.length > 0) {
      await onUpload(valid);
    }
  }, [validateFiles, onUpload]);

  // Drag and drop handlers - Requirements 4.2
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const activeUploads = Array.from(uploadProgress.entries()).filter(
    ([, progress]) => progress.status === 'uploading' || progress.status === 'pending'
  );

  const hasActiveUploads = activeUploads.length > 0;

  return (
    <div className="space-y-4">
      {/* Drop Zone - Requirements 1.3, 6.4: Responsive design */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload PDF files. Click to browse or drag and drop files here."
        aria-disabled={disabled}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-6 sm:p-8 text-center transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-label="Select PDF files to upload"
        />
        
        <div className="flex flex-col items-center">
          <svg 
            className={`h-10 w-10 sm:h-12 sm:w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <p className="mt-3 sm:mt-4 text-sm font-medium text-gray-900">
            {isDragging ? 'Drop files here' : 'Tap to select PDF files'}
          </p>
          <p className="mt-1 text-xs text-gray-600 hidden sm:block">
            or drag and drop
          </p>
          <p className="mt-2 text-xs text-gray-500">
            PDF files only, max 50MB each
          </p>
        </div>
      </div>

      {/* Validation Errors - Requirements 4.5 */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4" role="alert" aria-live="polite">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Some files could not be uploaded
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-red-700" aria-label="Upload errors">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setValidationErrors([])}
            className="mt-2 text-sm text-red-600 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded"
            aria-label="Dismiss error messages"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Progress - Requirements 4.3 */}
      {hasActiveUploads && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploading files...</h4>
          {activeUploads.map(([fileName, progress]) => (
            <UploadProgressItem
              key={fileName}
              fileName={fileName}
              progress={progress}
              onCancel={() => onCancelUpload(fileName)}
            />
          ))}
        </div>
      )}

      {/* Completed/Failed Uploads */}
      {Array.from(uploadProgress.entries())
        .filter(([, p]) => p.status === 'completed' || p.status === 'error' || p.status === 'cancelled')
        .length > 0 && (
        <div className="space-y-2">
          {Array.from(uploadProgress.entries())
            .filter(([, p]) => p.status === 'completed' || p.status === 'error' || p.status === 'cancelled')
            .map(([fileName, progress]) => (
              <UploadStatusItem key={fileName} fileName={fileName} progress={progress} />
            ))}
        </div>
      )}
    </div>
  );
}

interface UploadProgressItemProps {
  fileName: string;
  progress: UploadProgress;
  onCancel: () => void;
}

function UploadProgressItem({ fileName, progress, onCancel }: UploadProgressItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3" role="status" aria-label={`Uploading ${fileName}: ${progress.progress}% complete`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <span className="truncate text-sm font-medium text-gray-900">{fileName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600" aria-live="polite">{progress.progress}%</span>
          {/* Cancel button - Requirements 4.3 */}
          <button
            onClick={onCancel}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={`Cancel upload of ${fileName}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Progress bar - Requirements 4.3 */}
      <div 
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={progress.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress for ${fileName}`}
      >
        <div 
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
}

interface UploadStatusItemProps {
  fileName: string;
  progress: UploadProgress;
}

function UploadStatusItem({ fileName, progress }: UploadStatusItemProps) {
  const isCompleted = progress.status === 'completed';
  const isCancelled = progress.status === 'cancelled';
  
  return (
    <div className={`
      flex items-center gap-3 rounded-lg p-3
      ${isCompleted ? 'bg-green-50' : isCancelled ? 'bg-gray-50' : 'bg-red-50'}
    `}>
      {isCompleted ? (
        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : isCancelled ? (
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${
          isCompleted ? 'text-green-800' : isCancelled ? 'text-gray-600' : 'text-red-800'
        }`}>
          {fileName}
        </p>
        {progress.error && !isCancelled && (
          <p className="text-xs text-red-600">{progress.error}</p>
        )}
        {isCancelled && (
          <p className="text-xs text-gray-500">Upload cancelled</p>
        )}
      </div>
    </div>
  );
}
