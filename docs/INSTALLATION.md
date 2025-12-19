# Installation Guide

This guide provides detailed instructions for setting up SETutor in a development environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended Version |
|----------|-----------------|---------------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| PostgreSQL | 14.x | 16.x |
| Git | 2.x | Latest |

### External Services

1. **Firebase Project** - For authentication
2. **S3-Compatible Storage** - For document storage (AWS S3, MinIO, DigitalOcean Spaces, etc.)

## Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/setutor.git
cd setutor

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

## Detailed Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/setutor.git
cd setutor
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16
- React 19
- Firebase SDK
- PostgreSQL client (pg)
- AWS S3 SDK
- Tailwind CSS
- And more...

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration. See [Configuration Guide](CONFIGURATION.md) for detailed information.

### Step 4: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. **Install PostgreSQL**

   **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

   **macOS (Homebrew):**
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```

   **Windows:**
   Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Create Database and User**

   ```bash
   sudo -u postgres psql
   ```

   ```sql
   CREATE USER setutor_user WITH PASSWORD 'your_secure_password';
   CREATE DATABASE setutor OWNER setutor_user;
   GRANT ALL PRIVILEGES ON DATABASE setutor TO setutor_user;
   \q
   ```

3. **Update Environment Variables**

   ```env
   DATABASE_URL=postgresql://setutor_user:your_secure_password@localhost:5432/setutor
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=setutor
   DATABASE_USER=setutor_user
   DATABASE_PASSWORD=your_secure_password
   DATABASE_SSL=false
   ```

#### Option B: Docker PostgreSQL

```bash
docker run --name setutor-postgres \
  -e POSTGRES_USER=setutor_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=setutor \
  -p 5432:5432 \
  -d postgres:16
```

### Step 5: Run Database Migrations

```bash
npm run db:migrate
```

This creates the required tables:
- `users` - User accounts
- `folders` - Folder hierarchy
- `documents` - Document metadata

### Step 6: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Authentication** → **Sign-in method** → **Google**
4. Go to **Project Settings** → **General**
5. Under "Your apps", click **Web** icon to add a web app
6. Copy the configuration values to your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 7: Set Up S3 Storage

#### AWS S3

1. Create an S3 bucket in AWS Console
2. Create an IAM user with S3 access
3. Configure CORS for the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. Update environment variables:

```env
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-documents
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=your_secret_key
```

#### MinIO (Self-hosted alternative)

```bash
# Run MinIO with Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

```env
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-documents
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

### Step 8: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Verifying Installation

### Check Database Connection

```bash
# Connect to database
psql -h localhost -U setutor_user -d setutor

# List tables
\dt

# Expected output:
#  Schema |   Name    | Type  |    Owner
# --------+-----------+-------+-------------
#  public | documents | table | setutor_user
#  public | folders   | table | setutor_user
#  public | users     | table | setutor_user
```

### Check Application Health

1. Open `http://localhost:3000`
2. You should see the landing page
3. Click "Sign in with Google"
4. After authentication, you should be redirected to the dashboard

## Troubleshooting

### Common Issues

#### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

#### Database Connection Failed

1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check connection string format:
   ```
   postgresql://user:password@host:port/database
   ```

3. Verify user permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE setutor TO setutor_user;
   ```

#### Firebase Authentication Error

1. Verify Firebase configuration values
2. Check that Google Sign-in is enabled in Firebase Console
3. Ensure authorized domains include `localhost`

#### S3 Upload Failed

1. Verify bucket exists and is accessible
2. Check CORS configuration
3. Verify IAM credentials have proper permissions

### Getting Help

- Check [GitHub Issues](https://github.com/yourusername/setutor/issues)
- Email: me@gabrielseto.dev
