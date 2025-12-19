/**
 * Zod validation schemas for all form inputs
 * Implements Requirements 11.3 - Input validation and sanitization
 */

import { z } from 'zod';

// ============================================================================
// Common Validators
// ============================================================================

/**
 * UUID validator - validates standard UUID format
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Firebase UID validator - alphanumeric string, typically 28 characters
 */
export const firebaseUidSchema = z
  .string()
  .min(1, 'User ID is required')
  .max(128, 'User ID is too long')
  .regex(/^[a-zA-Z0-9]+$/, 'Invalid user ID format');

/**
 * Safe string validator - prevents XSS by disallowing dangerous characters
 */
export const safeStringSchema = z
  .string()
  .transform((val) => val.trim())
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Input contains potentially dangerous content'
  );

/**
 * Pagination validators
 */
export const pageSchema = z.coerce
  .number()
  .int()
  .min(1, 'Page must be at least 1')
  .default(1);

export const pageSizeSchema = z.coerce
  .number()
  .int()
  .min(1, 'Page size must be at least 1')
  .max(100, 'Page size cannot exceed 100')
  .default(20);

// ============================================================================
// Folder Schemas
// ============================================================================

/**
 * Folder name validation
 * - Required, non-empty after trimming
 * - Max 255 characters
 * - No path separators or dangerous characters
 */
export const folderNameSchema = z
  .string()
  .min(1, 'Folder name is required')
  .max(255, 'Folder name cannot exceed 255 characters')
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, 'Folder name cannot be empty')
  .refine(
    (val) => !/[<>:"/\\|?*]/.test(val),
    'Folder name contains invalid characters'
  )
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Folder name contains potentially dangerous content'
  );

/**
 * Create folder request schema
 */
export const createFolderSchema = z.object({
  name: folderNameSchema,
  parentId: uuidSchema.nullable().optional(),
  uid: firebaseUidSchema,
});

/**
 * Update folder request schema
 */
export const updateFolderSchema = z.object({
  name: folderNameSchema.optional(),
  uid: firebaseUidSchema,
});

/**
 * Move folder request schema
 */
export const moveFolderSchema = z.object({
  newParentId: uuidSchema.nullable(),
  uid: firebaseUidSchema,
});

/**
 * Get folders query params schema
 */
export const getFoldersQuerySchema = z.object({
  uid: firebaseUidSchema,
  parentId: z.union([uuidSchema, z.literal('null')]).optional(),
  page: pageSchema.optional(),
  pageSize: pageSizeSchema.optional(),
});

// ============================================================================
// Document Schemas
// ============================================================================

/**
 * Document name validation
 */
export const documentNameSchema = z
  .string()
  .min(1, 'Document name is required')
  .max(255, 'Document name cannot exceed 255 characters')
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, 'Document name cannot be empty')
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Document name contains potentially dangerous content'
  );

/**
 * Search query validation
 */
export const searchQuerySchema = z
  .string()
  .max(500, 'Search query is too long')
  .transform((val) => val.trim())
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Search query contains potentially dangerous content'
  );

/**
 * Get documents query params schema
 */
export const getDocumentsQuerySchema = z.object({
  uid: firebaseUidSchema,
  folderId: z.union([uuidSchema, z.literal('null')]).optional(),
  search: searchQuerySchema.optional(),
  page: pageSchema.optional(),
  pageSize: pageSizeSchema.optional(),
});

/**
 * Update document request schema
 */
export const updateDocumentSchema = z.object({
  uid: firebaseUidSchema,
  name: documentNameSchema.optional(),
  folderId: uuidSchema.nullable().optional(),
});

/**
 * Move document request schema
 */
export const moveDocumentSchema = z.object({
  folderId: uuidSchema.nullable(),
  uid: firebaseUidSchema,
});

// ============================================================================
// File Upload Schemas
// ============================================================================

/**
 * File upload metadata validation
 */
export const fileUploadMetadataSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name is too long')
    .refine(
      (val) => val.toLowerCase().endsWith('.pdf'),
      'Only PDF files are allowed'
    ),
  fileType: z.literal('application/pdf', {
    errorMap: () => ({ message: 'Only PDF files are allowed' }),
  }),
  fileSize: z
    .number()
    .int()
    .positive('File size must be positive')
    .max(50 * 1024 * 1024, 'File size cannot exceed 50MB'),
  folderId: uuidSchema.nullable().optional(),
  uid: firebaseUidSchema,
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type MoveFolderInput = z.infer<typeof moveFolderSchema>;
export type GetFoldersQuery = z.infer<typeof getFoldersQuerySchema>;
export type GetDocumentsQuery = z.infer<typeof getDocumentsQuerySchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type MoveDocumentInput = z.infer<typeof moveDocumentSchema>;
export type FileUploadMetadata = z.infer<typeof fileUploadMetadataSchema>;
