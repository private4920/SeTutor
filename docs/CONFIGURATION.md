# Configuration Guide

This guide explains all configuration options for SETutor.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Firebase Configuration](#firebase-configuration)
- [Database Configuration](#database-configuration)
- [S3 Storage Configuration](#s3-storage-configuration)
- [Application Configuration](#application-configuration)
- [Security Configuration](#security-configuration)

## Environment Variables

SETutor uses environment variables for configuration. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DATABASE_HOST` | No | Database host (alternative to URL) |
| `DATABASE_PORT` | No | Database port (default: 5432) |
| `DATABASE_NAME` | No | Database name |
| `DATABASE_USER` | No | Database user |
| `DATABASE_PASSWORD` | No | Database password |
| `DATABASE_SSL` | No | Enable SSL (default: false) |
| `S3_ENDPOINT` | Yes | S3 endpoint URL |
| `S3_REGION` | Yes | S3 region |
| `S3_BUCKET_NAME` | Yes | S3 bucket name |
| `S3_ACCESS_KEY_ID` | Yes | S3 access key |
| `S3_SECRET_ACCESS_KEY` | Yes | S3 secret key |
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL |
| `NODE_ENV` | No | Environment (development/production) |

## Firebase Configuration

### Setting Up Firebase

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Google Authentication**
   - Navigate to Authentication → Sign-in method
   - Enable Google provider
   - Add authorized domains

3. **Get Configuration**
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Register your app and copy config

### Configuration Values

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### Authorized Domains

Add these domains in Firebase Console → Authentication → Settings → Authorized domains:

- `localhost` (development)
- `yourdomain.com` (production)
- `*.vercel.app` (if using Vercel)

## Database Configuration

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

### Development Configuration

```env
DATABASE_URL=postgresql://setutor_user:password@localhost:5432/setutor
DATABASE_SSL=false
```

### Production Configuration

```env
DATABASE_URL=postgresql://setutor_user:secure_password@db.example.com:5432/setutor?sslmode=require
DATABASE_SSL=true
```

### Connection Pooling

For production, consider using connection pooling:

```env
# With PgBouncer
DATABASE_URL=postgresql://user:pass@pgbouncer.example.com:6432/setutor?pgbouncer=true

# Connection pool settings (in code)
# Max connections: 20
# Idle timeout: 30000ms
```

### SSL Configuration

For production databases with SSL:

```env
DATABASE_SSL=true
# Or with certificate
DATABASE_SSL_CA=/path/to/ca-certificate.crt
```

## S3 Storage Configuration

### AWS S3

```env
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-documents
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### DigitalOcean Spaces

```env
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=nyc3
S3_BUCKET_NAME=setutor-documents
S3_ACCESS_KEY_ID=your_spaces_key
S3_SECRET_ACCESS_KEY=your_spaces_secret
```

### MinIO (Self-hosted)

```env
S3_ENDPOINT=http://minio.example.com:9000
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-documents
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

### Cloudflare R2

```env
S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET_NAME=setutor-documents
S3_ACCESS_KEY_ID=your_r2_access_key
S3_SECRET_ACCESS_KEY=your_r2_secret_key
```

### Bucket CORS Configuration

Configure CORS on your S3 bucket:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://yourdomain.com"
      ],
      "ExposeHeaders": ["ETag", "Content-Length"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### IAM Policy (AWS)

Minimum required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::setutor-documents",
        "arn:aws:s3:::setutor-documents/*"
      ]
    }
  ]
}
```

## Application Configuration

### Basic Settings

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Production Settings

```env
NEXT_PUBLIC_APP_URL=https://setutor.com
NODE_ENV=production
```

## Security Configuration

### Environment-Specific Settings

**Development:**
```env
NODE_ENV=development
DATABASE_SSL=false
```

**Production:**
```env
NODE_ENV=production
DATABASE_SSL=true
```

### Secrets Management

For production, use a secrets manager:

**AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name setutor/production \
  --secret-string '{"DATABASE_URL":"...", "S3_SECRET_ACCESS_KEY":"..."}'
```

**HashiCorp Vault:**
```bash
vault kv put secret/setutor/production \
  DATABASE_URL="postgresql://..." \
  S3_SECRET_ACCESS_KEY="..."
```

## Configuration Validation

The application validates configuration on startup. Missing required variables will cause the application to fail with descriptive error messages.

### Manual Validation

```bash
# Check if all required variables are set
node -e "
const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'DATABASE_URL',
  'S3_ENDPOINT',
  'S3_BUCKET_NAME',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY'
];
const missing = required.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing:', missing.join(', '));
  process.exit(1);
}
console.log('All required variables set!');
"
```

## Example Configurations

### Complete Development Configuration

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=setutor-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=setutor-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=setutor-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123

# Database
DATABASE_URL=postgresql://setutor_user:devpassword@localhost:5432/setutor_dev
DATABASE_SSL=false

# S3 (MinIO local)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-dev
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Complete Production Configuration

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=setutor.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=setutor-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=setutor-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321098
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321098:web:xyz789

# Database
DATABASE_URL=postgresql://setutor_prod:securepassword@db.setutor.com:5432/setutor?sslmode=require
DATABASE_SSL=true

# S3 (AWS)
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-production
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Application
NEXT_PUBLIC_APP_URL=https://setutor.com
NODE_ENV=production
```
