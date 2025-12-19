import { query } from '../config';
import { Folder, CreateFolderInput, UpdateFolderInput } from '../types';

/**
 * All folder queries are filtered by user_id to ensure data isolation
 * per Requirements 11.1
 */

export async function createFolder(input: CreateFolderInput): Promise<Folder> {
  const result = await query<Folder>(
    `INSERT INTO folders (name, parent_id, user_id, path)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.name, input.parent_id || null, input.user_id, input.path]
  );
  if (!result[0]) {
    throw new Error('Failed to create folder');
  }
  return result[0];
}

export async function getFolderById(id: string, userId: string): Promise<Folder | null> {
  const result = await query<Folder>(
    'SELECT * FROM folders WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result[0] || null;
}

export async function getFoldersByParentId(
  parentId: string | null,
  userId: string
): Promise<Folder[]> {
  if (parentId === null) {
    return query<Folder>(
      'SELECT * FROM folders WHERE parent_id IS NULL AND user_id = $1 ORDER BY name',
      [userId]
    );
  }
  return query<Folder>(
    'SELECT * FROM folders WHERE parent_id = $1 AND user_id = $2 ORDER BY name',
    [parentId, userId]
  );
}

export async function getAllFoldersByUserId(userId: string): Promise<Folder[]> {
  return query<Folder>(
    'SELECT * FROM folders WHERE user_id = $1 ORDER BY path, name',
    [userId]
  );
}

export async function updateFolder(
  id: string,
  userId: string,
  updates: UpdateFolderInput
): Promise<Folder | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.parent_id !== undefined) {
    fields.push(`parent_id = $${paramIndex++}`);
    values.push(updates.parent_id);
  }
  if (updates.path !== undefined) {
    fields.push(`path = $${paramIndex++}`);
    values.push(updates.path);
  }

  if (fields.length === 0) return getFolderById(id, userId);

  values.push(id, userId);
  const result = await query<Folder>(
    `UPDATE folders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result[0] || null;
}

export async function deleteFolder(id: string, userId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    'DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.length > 0;
}

export async function getFolderPath(id: string, userId: string): Promise<Folder[]> {
  // Recursive CTE to get full folder path from root to current folder
  const result = await query<Folder>(
    `WITH RECURSIVE folder_path AS (
      SELECT * FROM folders WHERE id = $1 AND user_id = $2
      UNION ALL
      SELECT f.* FROM folders f
      INNER JOIN folder_path fp ON f.id = fp.parent_id
      WHERE f.user_id = $2
    )
    SELECT * FROM folder_path ORDER BY path`,
    [id, userId]
  );
  return result;
}

export async function getChildFolders(id: string, userId: string): Promise<Folder[]> {
  // Recursive CTE to get all descendant folders
  const result = await query<Folder>(
    `WITH RECURSIVE descendants AS (
      SELECT * FROM folders WHERE parent_id = $1 AND user_id = $2
      UNION ALL
      SELECT f.* FROM folders f
      INNER JOIN descendants d ON f.parent_id = d.id
      WHERE f.user_id = $2
    )
    SELECT * FROM descendants ORDER BY path`,
    [id, userId]
  );
  return result;
}

export async function countFoldersByUserId(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM folders WHERE user_id = $1',
    [userId]
  );
  return parseInt(result[0]?.count ?? '0', 10);
}

/**
 * Move a folder to a new parent, updating paths for the folder and all descendants
 * Validates that the move doesn't create a circular reference
 */
export async function moveFolder(
  id: string,
  userId: string,
  newParentId: string | null
): Promise<Folder | null> {
  // Get the folder to move
  const folder = await getFolderById(id, userId);
  if (!folder) return null;

  // Prevent moving to itself
  if (newParentId === id) {
    throw new Error('Cannot move folder into itself');
  }

  // If moving to a parent, validate it's not a descendant
  if (newParentId) {
    const descendants = await getChildFolders(id, userId);
    if (descendants.some(d => d.id === newParentId)) {
      throw new Error('Cannot move folder into its own descendant');
    }
  }

  // Calculate new path
  let newPath: string;
  if (newParentId) {
    const newParent = await getFolderById(newParentId, userId);
    if (!newParent) {
      throw new Error('Target parent folder not found');
    }
    newPath = `${newParent.path}/${folder.name}`;
  } else {
    newPath = `/${folder.name}`;
  }

  // Update the folder
  const updatedFolder = await updateFolder(id, userId, {
    parent_id: newParentId,
    path: newPath
  });

  // Update paths for all descendants
  if (updatedFolder) {
    const descendants = await getChildFolders(id, userId);
    for (const descendant of descendants) {
      const relativePath = descendant.path.substring(folder.path.length);
      const newDescendantPath = newPath + relativePath;
      await updateFolder(descendant.id, userId, { path: newDescendantPath });
    }
  }

  return updatedFolder;
}


export async function getFoldersPaginated(
  userId: string,
  page: number = 1,
  pageSize: number = 20,
  parentId?: string | null
): Promise<{ folders: Folder[]; total: number }> {
  const offset = (page - 1) * pageSize;
  
  let countQuery: string;
  let dataQuery: string;
  let countParams: unknown[];
  let dataParams: unknown[];

  if (parentId === undefined) {
    countQuery = 'SELECT COUNT(*) as count FROM folders WHERE user_id = $1';
    dataQuery = `SELECT * FROM folders WHERE user_id = $1 
                 ORDER BY name LIMIT $2 OFFSET $3`;
    countParams = [userId];
    dataParams = [userId, pageSize, offset];
  } else if (parentId === null) {
    countQuery = 'SELECT COUNT(*) as count FROM folders WHERE user_id = $1 AND parent_id IS NULL';
    dataQuery = `SELECT * FROM folders WHERE user_id = $1 AND parent_id IS NULL
                 ORDER BY name LIMIT $2 OFFSET $3`;
    countParams = [userId];
    dataParams = [userId, pageSize, offset];
  } else {
    countQuery = 'SELECT COUNT(*) as count FROM folders WHERE user_id = $1 AND parent_id = $2';
    dataQuery = `SELECT * FROM folders WHERE user_id = $1 AND parent_id = $2
                 ORDER BY name LIMIT $3 OFFSET $4`;
    countParams = [userId, parentId];
    dataParams = [userId, parentId, pageSize, offset];
  }

  const countResult = await query<{ count: string }>(countQuery, countParams);
  const folders = await query<Folder>(dataQuery, dataParams);

  return {
    folders,
    total: parseInt(countResult[0]?.count ?? '0', 10)
  };
}
