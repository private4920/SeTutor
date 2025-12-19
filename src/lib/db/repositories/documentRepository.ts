import { query } from '../config';
import { Document, CreateDocumentInput, UpdateDocumentInput } from '../types';

/**
 * All document queries are filtered by user_id to ensure data isolation
 * per Requirements 11.1
 */

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const result = await query<Document>(
    `INSERT INTO documents (name, original_name, folder_id, user_id, s3_key, s3_url, file_size, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.name,
      input.original_name,
      input.folder_id || null,
      input.user_id,
      input.s3_key,
      input.s3_url,
      input.file_size,
      input.mime_type
    ]
  );
  if (!result[0]) {
    throw new Error('Failed to create document');
  }
  return result[0];
}

export async function getDocumentById(id: string, userId: string): Promise<Document | null> {
  const result = await query<Document>(
    'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result[0] || null;
}

export async function getDocumentsByFolderId(
  folderId: string | null,
  userId: string
): Promise<Document[]> {
  if (folderId === null) {
    return query<Document>(
      'SELECT * FROM documents WHERE folder_id IS NULL AND user_id = $1 ORDER BY name',
      [userId]
    );
  }
  return query<Document>(
    'SELECT * FROM documents WHERE folder_id = $1 AND user_id = $2 ORDER BY name',
    [folderId, userId]
  );
}

export async function getAllDocumentsByUserId(userId: string): Promise<Document[]> {
  return query<Document>(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
}

export async function getRecentDocuments(userId: string, limit: number = 10): Promise<Document[]> {
  return query<Document>(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
}

export async function searchDocuments(userId: string, searchQuery: string): Promise<Document[]> {
  const searchPattern = `%${searchQuery}%`;
  return query<Document>(
    `SELECT * FROM documents 
     WHERE user_id = $1 AND (name ILIKE $2 OR original_name ILIKE $2)
     ORDER BY name`,
    [userId, searchPattern]
  );
}

export async function updateDocument(
  id: string,
  userId: string,
  updates: UpdateDocumentInput
): Promise<Document | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.folder_id !== undefined) {
    fields.push(`folder_id = $${paramIndex++}`);
    values.push(updates.folder_id);
  }

  if (fields.length === 0) return getDocumentById(id, userId);

  values.push(id, userId);
  const result = await query<Document>(
    `UPDATE documents SET ${fields.join(', ')} 
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result[0] || null;
}

export async function deleteDocument(id: string, userId: string): Promise<Document | null> {
  const result = await query<Document>(
    'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );
  return result[0] || null;
}

export async function countDocumentsByUserId(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM documents WHERE user_id = $1',
    [userId]
  );
  return parseInt(result[0]?.count ?? '0', 10);
}

export async function getDocumentsPaginated(
  userId: string,
  page: number = 1,
  pageSize: number = 20,
  folderId?: string | null
): Promise<{ documents: Document[]; total: number }> {
  const offset = (page - 1) * pageSize;
  
  let countQuery: string;
  let dataQuery: string;
  let params: unknown[];

  if (folderId === undefined) {
    countQuery = 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1';
    dataQuery = `SELECT * FROM documents WHERE user_id = $1 
                 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    params = [userId, pageSize, offset];
  } else if (folderId === null) {
    countQuery = 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1 AND folder_id IS NULL';
    dataQuery = `SELECT * FROM documents WHERE user_id = $1 AND folder_id IS NULL
                 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    params = [userId, pageSize, offset];
  } else {
    countQuery = 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1 AND folder_id = $2';
    dataQuery = `SELECT * FROM documents WHERE user_id = $1 AND folder_id = $2
                 ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
    params = [userId, folderId, pageSize, offset];
  }

  const countResult = await query<{ count: string }>(
    countQuery,
    folderId === undefined ? [userId] : folderId === null ? [userId] : [userId, folderId]
  );
  const documents = await query<Document>(dataQuery, params);

  return {
    documents,
    total: parseInt(countResult[0]?.count ?? '0', 10)
  };
}
