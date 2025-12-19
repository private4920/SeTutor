"use client";

import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loading component for smooth loading states
 * Requirements: 12.5 - Skeleton screens for smooth user experience
 */
export const Skeleton = memo(function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
});

/**
 * Skeleton for a card component
 */
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
    </div>
  );
});

/**
 * Skeleton for a stat card
 */
export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
        <div className="space-y-2">
          <Skeleton height={14} width={60} />
          <Skeleton height={24} width={40} />
        </div>
      </div>
    </div>
  );
});

/**
 * Skeleton for a document item in list view
 */
export const DocumentListItemSkeleton = memo(function DocumentListItemSkeleton() {
  return (
    <tr>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
          <div className="space-y-1">
            <Skeleton height={14} width={180} />
            <Skeleton height={10} width={120} />
          </div>
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
        <Skeleton height={14} width={60} />
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
        <Skeleton height={14} width={80} />
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </div>
      </td>
    </tr>
  );
});

/**
 * Skeleton for a document item in grid view
 */
export const DocumentGridItemSkeleton = memo(function DocumentGridItemSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Skeleton height={96} className="mb-3 w-full rounded-lg" />
      <Skeleton height={14} width="80%" className="mb-2" />
      <Skeleton height={10} width="60%" />
    </div>
  );
});

/**
 * Skeleton for a folder item
 */
export const FolderItemSkeleton = memo(function FolderItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
      <div className="flex-1 space-y-1">
        <Skeleton height={14} width="70%" />
        <Skeleton height={10} width="50%" />
      </div>
    </div>
  );
});

/**
 * Skeleton for recent documents section
 */
export const RecentDocumentsSkeleton = memo(function RecentDocumentsSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <Skeleton height={20} width={140} className="mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton height={14} width="75%" />
              <Skeleton height={10} width="50%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Skeleton for document list
 */
export const DocumentListSkeleton = memo(function DocumentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
              Size
            </th>
            <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
              Uploaded
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...Array(count)].map((_, i) => (
            <DocumentListItemSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

/**
 * Skeleton for document grid
 */
export const DocumentGridSkeleton = memo(function DocumentGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <DocumentGridItemSkeleton key={i} />
      ))}
    </div>
  );
});

/**
 * Skeleton for folder grid
 */
export const FolderGridSkeleton = memo(function FolderGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <FolderItemSkeleton key={i} />
      ))}
    </div>
  );
});
