# Database Documentation

This document describes the database schema, migrations, and best practices for SETutor.

## Table of Contents

- [Schema Overview](#schema-overview)
- [Tables](#tables)
- [Migrations](#migrations)
- [Indexes](#indexes)
- [Queries](#queries)
- [Backup and Recovery](#backup-and-recovery)

---

## Schema Overview

SETutor uses PostgreSQL as its primary database. The schema consists of three main tables:

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ name            │
│ photo_url       │
│ firebase_uid    │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│    folders      │       │   documents     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──┐   │ id (PK)         │
│ name            │   │   │ name            │
│ parent_id (FK)──┼───┘   │ original_name   │
│ user_id (FK)    │       │ folder_id (FK)──┼──┐
│ path            │       │ user_id (FK)    │  │
│ created_at      │       │ s3_key          │  │
│ updated_at      │       │ s3_url          │  │
└─────────────────┘       │ file_size       │  │
         ▲                │ mime_type       │  │
         │                │ created_at      │  │
         │                │ updated_at      │  │
         │                └─────────────────┘  │
         │                                     │
         └─────────────────────────────────────┘
```

---

## Tables

### users

Stores user account information synced from Firebase Authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| name | VARCHAR(255) | NOT NULL | Display name |
| photo_url | TEXT | - | Profile picture URL |
| firebase_uid | VARCHAR(255) | UNIQUE, NOT NULL | Firebase user ID |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |

### folders

Stores hierarchical folder structure for organizing documents.

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, parent_id, name)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Folder name |
| parent_id | UUID | FK → folders(id) | Parent folder (null for root) |
| user_id | UUID | FK → users(id), NOT NULL | Owner user |
| path | TEXT | NOT NULL | Full path string |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |

### documents

Stores document metadata with references to S3 storage.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Display name |
| original_name | VARCHAR(255) | NOT NULL | Original filename |
| folder_id | UUID | FK → folders(id) | Parent folder (null for root) |
| user_id | UUID | FK → users(id), NOT NULL | Owner user |
| s3_key | VARCHAR(500) | NOT NULL | S3 object key |
| s3_url | TEXT | NOT NULL | S3 URL |
| file_size | BIGINT | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | MIME type |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |

---

## Migrations

### Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Or manually
npx ts-node scripts/migrate.ts
```

### Migration Files

Migrations are located in `src/lib/db/migrations/`:

```
migrations/
├── index.ts              # Migration runner
└── 001_initial_schema.sql  # Initial schema
```

### Creating New Migrations

1. Create a new SQL file:
   ```
   002_add_flashcards.sql
   ```

2. Write migration SQL:
   ```sql
   -- Migration: 002_add_flashcards
   -- Description: Add flashcards table
   
   CREATE TABLE flashcard_decks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Update migration runner to include new file.

---

## Indexes

### Existing Indexes

```sql
-- User lookup by Firebase UID
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Folder queries
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- Document queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
```

### Index Usage

| Index | Used For |
|-------|----------|
| idx_users_firebase_uid | User lookup during authentication |
| idx_folders_user_id | Listing user's folders |
| idx_folders_parent_id | Finding child folders |
| idx_documents_user_id | Listing user's documents |
| idx_documents_folder_id | Documents in a folder |
| idx_documents_created_at | Recent documents sorting |

---

## Queries

### Common Query Patterns

#### Get User by Firebase UID

```sql
SELECT * FROM users WHERE firebase_uid = $1;
```

#### List Root Folders

```sql
SELECT * FROM folders 
WHERE user_id = $1 AND parent_id IS NULL
ORDER BY name;
```

#### List Folder Contents

```sql
-- Subfolders
SELECT * FROM folders 
WHERE user_id = $1 AND parent_id = $2
ORDER BY name;

-- Documents
SELECT * FROM documents 
WHERE user_id = $1 AND folder_id = $2
ORDER BY name;
```

#### Get Folder Path (Breadcrumbs)

```sql
WITH RECURSIVE folder_path AS (
  SELECT id, name, parent_id, 1 as depth
  FROM folders
  WHERE id = $1
  
  UNION ALL
  
  SELECT f.id, f.name, f.parent_id, fp.depth + 1
  FROM folders f
  JOIN folder_path fp ON f.id = fp.parent_id
)
SELECT id, name FROM folder_path
ORDER BY depth DESC;
```

#### Search Documents

```sql
SELECT * FROM documents
WHERE user_id = $1 
  AND name ILIKE '%' || $2 || '%'
ORDER BY created_at DESC
LIMIT 50;
```

#### Recent Documents

```sql
SELECT * FROM documents
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 10;
```

---

## Backup and Recovery

### Manual Backup

```bash
# Full backup
pg_dump -U setutor_user -d setutor > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U setutor_user -d setutor | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Automated Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-setutor.sh

BACKUP_DIR="/var/backups/setutor"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="setutor_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -U setutor_user setutor | gzip > "${BACKUP_DIR}/${FILENAME}"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${FILENAME}"
```

### Restore from Backup

```bash
# From SQL file
psql -U setutor_user -d setutor < backup.sql

# From compressed file
gunzip -c backup.sql.gz | psql -U setutor_user -d setutor
```

### Point-in-Time Recovery

For production, enable WAL archiving:

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
```

---

## Performance Tuning

### PostgreSQL Configuration

```ini
# Memory
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 16MB
maintenance_work_mem = 128MB

# Connections
max_connections = 100

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Query Optimization Tips

1. **Use EXPLAIN ANALYZE:**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM documents WHERE user_id = 'uuid';
   ```

2. **Avoid SELECT *:**
   ```sql
   -- Bad
   SELECT * FROM documents WHERE user_id = $1;
   
   -- Good
   SELECT id, name, created_at FROM documents WHERE user_id = $1;
   ```

3. **Use pagination:**
   ```sql
   SELECT * FROM documents
   WHERE user_id = $1
   ORDER BY created_at DESC
   LIMIT 20 OFFSET 0;
   ```

4. **Batch operations:**
   ```sql
   -- Insert multiple rows
   INSERT INTO documents (name, user_id, ...) VALUES
     ('doc1', 'uuid', ...),
     ('doc2', 'uuid', ...);
   ```

---

## Security

### User Isolation

All queries must filter by `user_id`:

```typescript
// Good - always filter by user
const documents = await query(
  'SELECT * FROM documents WHERE user_id = $1',
  [userId]
);

// Bad - no user filter
const documents = await query('SELECT * FROM documents');
```

### Parameterized Queries

Always use parameterized queries:

```typescript
// Good - parameterized
await query('SELECT * FROM users WHERE email = $1', [email]);

// Bad - string concatenation (SQL injection risk!)
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Least Privilege

Create application user with minimal permissions:

```sql
CREATE USER setutor_app WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO setutor_app;
REVOKE DROP, TRUNCATE ON ALL TABLES IN SCHEMA public FROM setutor_app;
```
