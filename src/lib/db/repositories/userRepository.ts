import { query } from '../config';
import { User, CreateUserInput } from '../types';

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, name, photo_url, firebase_uid)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.email, input.name, input.photo_url || null, input.firebase_uid]
  );
  if (!result[0]) {
    throw new Error('Failed to create user');
  }
  return result[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result[0] || null;
}

export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE firebase_uid = $1',
    [firebaseUid]
  );
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result[0] || null;
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name' | 'photo_url'>>
): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.photo_url !== undefined) {
    fields.push(`photo_url = $${paramIndex++}`);
    values.push(updates.photo_url);
  }

  if (fields.length === 0) return getUserById(id);

  values.push(id);
  const result = await query<User>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result[0] || null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return result.length > 0;
}

export async function findOrCreateUser(input: CreateUserInput): Promise<User> {
  const existing = await getUserByFirebaseUid(input.firebase_uid);
  if (existing) {
    return existing;
  }
  return createUser(input);
}

/**
 * Get or create a user from a verified Firebase UID
 * Used by JWT-authenticated API routes
 * 
 * @param firebaseUid - The verified Firebase UID from the JWT token
 * @param email - Optional email from the JWT token
 * @param displayName - Optional display name from the JWT token
 * @returns The user record
 */
export async function getOrCreateUser(
  firebaseUid: string,
  email: string | null,
  displayName?: string | null
): Promise<User | null> {
  try {
    // First try to get existing user
    const existing = await getUserByFirebaseUid(firebaseUid);
    if (existing) {
      return existing;
    }

    // Create new user if not found
    // Use displayName, or extract name from email, or use 'User' as fallback
    const name = displayName || (email ? email.split('@')[0] : 'User');
    
    const result = await query<User>(
      `INSERT INTO users (email, name, firebase_uid)
       VALUES ($1, $2, $3)
       ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email
       RETURNING *`,
      [email, name, firebaseUid]
    );
    
    return result[0] || null;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    return null;
  }
}
