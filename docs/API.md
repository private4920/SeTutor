# API Reference

This document describes the REST API endpoints for SETutor.

## Table of Contents

- [Authentication](#authentication)
- [Folders API](#folders-api)
- [Documents API](#documents-api)
- [Dashboard API](#dashboard-api)
- [Error Handling](#error-handling)

---

## Authentication

All API endpoints require authentication via Firebase. Include the Firebase ID token in the request headers:

```http
Authorization: Bearer <firebase_id_token>
```

### Getting the Token

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const token = await auth.currentUser?.getIdToken();
```

---

## Folders API

### List Folders

Retrieve all folders for the authenticated user.

```http
GET /api/folders
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `parentId` | string | Filter by parent folder ID (optional) |

**Response:**

```json
{
  "folders": [
    {
      "id": "uuid",
      "name": "My Folder",
      "parentId": null,
      "userId": "uuid",
      "path": "/My Folder",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Folder

Create a new folder.

```http
POST /api/folders
```

**Request Body:**

```json
{
  "name": "New Folder",
  "parentId": "uuid-or-null"
}
```

**Response:**

```json
{
  "folder": {
    "id": "uuid",
    "name": "New Folder",
    "parentId": "uuid-or-null",
    "userId": "uuid",
    "path": "/Parent/New Folder",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Folder

Retrieve a specific folder.

```http
GET /api/folders/:id
```

**Response:**

```json
{
  "folder": {
    "id": "uuid",
    "name": "My Folder",
    "parentId": null,
    "userId": "uuid",
    "path": "/My Folder",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update Folder

Update a folder's name.

```http
PATCH /api/folders/:id
```

**Request Body:**

```json
{
  "name": "Renamed Folder"
}
```

**Response:**

```json
{
  "folder": {
    "id": "uuid",
    "name": "Renamed Folder",
    "parentId": null,
    "userId": "uuid",
    "path": "/Renamed Folder",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### Delete Folder

Delete a folder and all its contents.

```http
DELETE /api/folders/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

### Move Folder

Move a folder to a new parent.

```http
POST /api/folders/:id/move
```

**Request Body:**

```json
{
  "newParentId": "uuid-or-null"
}
```

**Response:**

```json
{
  "folder": {
    "id": "uuid",
    "name": "My Folder",
    "parentId": "new-parent-uuid",
    "userId": "uuid",
    "path": "/New Parent/My Folder",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### Get Folder Path

Get the full path of a folder (breadcrumbs).

```http
GET /api/folders/:id/path
```

**Response:**

```json
{
  "path": [
    { "id": "root-uuid", "name": "Root Folder" },
    { "id": "parent-uuid", "name": "Parent Folder" },
    { "id": "current-uuid", "name": "Current Folder" }
  ]
}
```

---

## Documents API

### List Documents

Retrieve documents for the authenticated user.

```http
GET /api/documents
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `folderId` | string | Filter by folder ID (optional) |
| `search` | string | Search by document name (optional) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 50) |

**Response:**

```json
{
  "documents": [
    {
      "id": "uuid",
      "name": "Document.pdf",
      "originalName": "Original Document.pdf",
      "folderId": "uuid",
      "userId": "uuid",
      "s3Key": "users/uuid/documents/uuid.pdf",
      "s3Url": "https://...",
      "fileSize": 1048576,
      "mimeType": "application/pdf",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Upload Document

Upload a new document.

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF file (max 50MB) |
| `folderId` | string | Target folder ID (optional) |

**Response:**

```json
{
  "document": {
    "id": "uuid",
    "name": "Document.pdf",
    "originalName": "Document.pdf",
    "folderId": "uuid",
    "userId": "uuid",
    "s3Key": "users/uuid/documents/uuid.pdf",
    "s3Url": "https://...",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Document

Retrieve a specific document.

```http
GET /api/documents/:id
```

**Response:**

```json
{
  "document": {
    "id": "uuid",
    "name": "Document.pdf",
    "originalName": "Document.pdf",
    "folderId": "uuid",
    "userId": "uuid",
    "s3Key": "users/uuid/documents/uuid.pdf",
    "s3Url": "https://...",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Delete Document

Delete a document.

```http
DELETE /api/documents/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Move Document

Move a document to a different folder.

```http
POST /api/documents/:id/move
```

**Request Body:**

```json
{
  "folderId": "new-folder-uuid"
}
```

**Response:**

```json
{
  "document": {
    "id": "uuid",
    "name": "Document.pdf",
    "folderId": "new-folder-uuid",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

## Dashboard API

### Get Dashboard Stats

Retrieve statistics for the dashboard.

```http
GET /api/dashboard/stats
```

**Response:**

```json
{
  "stats": {
    "totalDocuments": 25,
    "totalFolders": 8,
    "totalFlashcards": 150,
    "totalQuizzes": 12,
    "recentDocuments": [
      {
        "id": "uuid",
        "name": "Recent Document.pdf",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large - File exceeds limit |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication token missing or invalid |
| `INVALID_INPUT` | Request body validation failed |
| `NOT_FOUND` | Requested resource not found |
| `FORBIDDEN` | User doesn't have access to resource |
| `DUPLICATE_NAME` | Folder/document name already exists |
| `FILE_TOO_LARGE` | Uploaded file exceeds 50MB limit |
| `INVALID_FILE_TYPE` | File is not a PDF |
| `STORAGE_ERROR` | S3 storage operation failed |
| `DATABASE_ERROR` | Database operation failed |

### Example Error Responses

**Validation Error (400):**

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": {
      "name": "Folder name is required",
      "parentId": "Invalid folder ID format"
    }
  }
}
```

**Authentication Error (401):**

```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required"
  }
}
```

**Not Found Error (404):**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Folder not found"
  }
}
```

**File Upload Error (413):**

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds the 50MB limit"
  }
}
```

---

## Rate Limiting

API requests are rate limited to prevent abuse:

| Endpoint Type | Limit |
|---------------|-------|
| Read operations | 100 requests/minute |
| Write operations | 30 requests/minute |
| File uploads | 10 requests/minute |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

---

## TypeScript Types

```typescript
// Folder
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  userId: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

// Document
interface Document {
  id: string;
  name: string;
  originalName: string;
  folderId: string | null;
  userId: string;
  s3Key: string;
  s3Url: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// API Response
interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// Pagination
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## SDK Usage Examples

### Fetch Documents

```typescript
async function fetchDocuments(folderId?: string) {
  const token = await auth.currentUser?.getIdToken();
  
  const params = new URLSearchParams();
  if (folderId) params.set('folderId', folderId);
  
  const response = await fetch(`/api/documents?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Upload Document

```typescript
async function uploadDocument(file: File, folderId?: string) {
  const token = await auth.currentUser?.getIdToken();
  
  const formData = new FormData();
  formData.append('file', file);
  if (folderId) formData.append('folderId', folderId);
  
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Create Folder

```typescript
async function createFolder(name: string, parentId?: string) {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch('/api/folders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, parentId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```
