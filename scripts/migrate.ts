import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Debug: verify env is loaded
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

async function main() {
  console.log('Starting database migrations...');
  
  // Dynamic import AFTER env is loaded
  const { runMigrations } = await import('../src/lib/db/migrations/index');
  const { closePool } = await import('../src/lib/db/config');
  
  try {
    await runMigrations();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
