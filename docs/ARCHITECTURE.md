# Architecture Overview

This document describes the technical architecture of SETutor.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## System Overview

SETutor is a modern web application built with Next.js that provides document management and AI-powered learning tools. The system follows a component-based architecture with clear separation between presentation, business logic, and data layers.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Browser                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    React Application                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Pages   │  │Components│  │  Hooks   │  │ Context  │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTPS
┌─────────────────────────────────▼───────────────────────────────────┐
│                         Next.js Server                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      API Routes                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │ Folders  │  │Documents │  │Dashboard │  │   Auth   │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└───────────┬─────────────────────┬─────────────────────┬─────────────┘
            │                     │                     │
┌───────────▼───────┐  ┌─────────▼─────────┐  ┌───────▼───────────┐
│   PostgreSQL      │  │   S3 Storage      │  │  Firebase Auth    │
│   (Metadata)      │  │   (Documents)     │  │  (Authentication) │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with App Router | 16.x |
| React | UI library | 19.x |
| TypeScript | Type-safe JavaScript | 5.7.x |
| Tailwind CSS | Utility-first CSS | 3.4.x |
| React Hook Form | Form handling | 7.x |
| Zod | Schema validation | 3.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js API Routes | REST API endpoints | 16.x |
| PostgreSQL | Relational database | 14+ |
| pg | PostgreSQL client | 8.x |
| AWS SDK | S3 storage client | 3.x |

### Authentication

| Technology | Purpose |
|------------|---------|
| Firebase Auth | Google OAuth authentication |
| Firebase SDK | Client-side auth management |

### DevOps

| Technology | Purpose |
|------------|---------|
| PM2 | Process management |
| Nginx/IIS | Reverse proxy |
| GitHub Actions | CI/CD |
| Jest | Testing |

---

## Application Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── dashboard/        # Dashboard endpoints
│   │   ├── documents/        # Document CRUD
│   │   └── folders/          # Folder CRUD
│   ├── dashboard/            # Dashboard pages
│   └── page.tsx              # Landing page
├── components/               # React components
│   ├── auth/                 # Authentication UI
│   ├── dashboard/            # Dashboard UI
│   ├── documents/            # Document management UI
│   ├── flashcards/           # Flashcard features
│   ├── folders/              # Folder management UI
│   ├── learning-plan/        # Learning plan features
│   ├── quiz/                 # Quiz features
│   ├── summary/              # Summary features
│   └── ui/                   # Shared UI components
├── lib/                      # Utilities and services
│   ├── db/                   # Database layer
│   │   ├── migrations/       # SQL migrations
│   │   └── repositories/     # Data access
│   ├── firebase/             # Firebase configuration
│   ├── hooks/                # Custom React hooks
│   ├── s3/                   # S3 storage utilities
│   ├── utils/                # Helper functions
│   └── validation/           # Input validation
└── types/                    # TypeScript definitions
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Page Components                         │
│  (src/app/dashboard/*, src/app/page.tsx)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Feature Components                        │
│  (src/components/documents/*, src/components/folders/*)     │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      UI Components                           │
│  (src/components/ui/*)                                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Custom Hooks                              │
│  (src/lib/hooks/*)                                          │
└─────────────────────────────────────────────────────────────┘
```

### Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  (src/app/api/*)                                            │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Repositories                              │
│  (src/lib/db/repositories/*)                                │
│  - userRepository                                           │
│  - folderRepository                                         │
│  - documentRepository                                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   Database Client                            │
│  (src/lib/db/config.ts)                                     │
│  - Connection pooling                                       │
│  - Query execution                                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     PostgreSQL                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Client  │────▶│ Firebase │────▶│  Google  │
│          │     │          │     │   Auth   │     │  OAuth   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                  │
                      │◀─────────── ID Token ───────────┘
                      │
                      ▼
               ┌──────────┐
               │   API    │
               │  Routes  │
               └──────────┘
                      │
                      ▼
               ┌──────────┐
               │ Database │
               │  (User)  │
               └──────────┘
```

### Document Upload Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│    S3    │
│          │     │  Route   │     │ Storage  │
└──────────┘     └──────────┘     └──────────┘
                      │
                      ▼
               ┌──────────┐
               │ Database │
               │(Metadata)│
               └──────────┘
```

### Data Retrieval Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│Repository│────▶│ Database │
│          │     │  Route   │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ▲                                                   │
     │                                                   │
     └───────────────── JSON Response ──────────────────┘
```

---

## Security Architecture

### Authentication Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Flow                              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Firebase Token Validation                   │
│  - Verify JWT signature                                     │
│  - Check token expiration                                   │
│  - Extract user ID                                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   User Data Isolation                        │
│  - Filter queries by user_id                                │
│  - Verify resource ownership                                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Input Validation                          │
│  - Zod schema validation                                    │
│  - SQL injection prevention                                 │
│  - XSS sanitization                                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Protection

| Layer | Protection |
|-------|------------|
| Transport | HTTPS/TLS encryption |
| Authentication | Firebase JWT tokens |
| Authorization | User ID filtering |
| Input | Zod validation + sanitization |
| Database | Parameterized queries |
| Storage | Presigned URLs with expiration |

---

## Database Schema

### Entity Relationship Diagram

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
         │
┌────────▼────────┐       ┌─────────────────┐
│    folders      │       │   documents     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ parent_id (FK)──┼──┐    │ original_name   │
│ user_id (FK)    │  │    │ folder_id (FK)──┼──┐
│ path            │  │    │ user_id (FK)    │  │
│ created_at      │◀─┘    │ s3_key          │  │
│ updated_at      │       │ s3_url          │  │
└────────┬────────┘       │ file_size       │  │
         │                │ mime_type       │  │
         │ 1:N            │ created_at      │  │
         │                │ updated_at      │  │
         └────────────────┼─────────────────┘  │
                          │                    │
                          └────────────────────┘
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
```

---

## Scalability Considerations

### Horizontal Scaling

```
                    ┌─────────────┐
                    │   Nginx     │
                    │   (LB)      │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
    │ Node 1  │       │ Node 2  │       │ Node 3  │
    │ (PM2)   │       │ (PM2)   │       │ (PM2)   │
    └────┬────┘       └────┬────┘       └────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Primary)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Replica)  │
                    └─────────────┘
```

### Caching Strategy

| Cache Layer | Purpose | TTL |
|-------------|---------|-----|
| Browser | Static assets | 1 year |
| CDN | Images, JS, CSS | 1 year |
| Application | API responses | 5 min |
| Database | Query results | 1 min |

### Performance Optimizations

1. **Code Splitting** - Route-based lazy loading
2. **Image Optimization** - Next.js Image component
3. **Database Pooling** - Connection reuse
4. **Pagination** - Limit result sets
5. **Debouncing** - Search input optimization

---

## Monitoring

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time | < 200ms | > 500ms |
| Error Rate | < 0.1% | > 1% |
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |
| Database Connections | < 80 | > 90 |

### Logging

```
Application Logs → PM2 → Log Files → Log Aggregator
                                          │
                                          ▼
                                    ┌──────────┐
                                    │ Alerting │
                                    └──────────┘
```
