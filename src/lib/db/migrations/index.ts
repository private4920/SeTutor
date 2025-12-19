import { getPool } from '../config';
import * as fs from 'fs';
import * as path from 'path';

interface Migration {
  id: number;
  name: string;
  applied_at: Date;
}

async function ensureMigrationsTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(): Promise<string[]> {
  const pool = getPool();
  const result = await pool.query<Migration>('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

async function recordMigration(name: string): Promise<void> {
  const pool = getPool();
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  
  const migrationsDir = path.join(__dirname);
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of migrationFiles) {
    if (appliedMigrations.includes(file)) {
      // Migration already applied, skipping
      continue;
    }
    
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await recordMigration(file);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Migration ${file} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export async function rollbackLastMigration(): Promise<void> {
  console.warn('Rollback functionality not implemented - manual intervention required');
}
