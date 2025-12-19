# SETutor - AI-Powered Learning Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</p>

SETutor is a modern web application that enables users to upload PDF documents, organize them into hierarchical folder structures, and generate AI-powered learning materials including flashcards, quizzes, summaries, and personalized learning plans.

## ✨ Features

- **📁 Document Management** - Upload, organize, and manage PDF documents in hierarchical folders
- **🎴 Smart Flashcards** - Generate AI-powered flashcards with flip animations and practice modes
- **📝 Interactive Quizzes** - Create quizzes with multiple choice, true/false, and short answer questions
- **📋 Document Summaries** - Generate concise summaries with key takeaways
- **📅 Learning Plans** - Personalized study schedules with progress tracking
- **🔐 Secure Authentication** - Google OAuth via Firebase Authentication
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Firebase project with Google Auth enabled
- S3-compatible storage (AWS S3, MinIO, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/setutor.git
cd setutor

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables (see Configuration section)

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/INSTALLATION.md) | Detailed setup instructions |
| [Configuration Guide](docs/CONFIGURATION.md) | Environment variables and settings |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment for Ubuntu & Windows |
| [API Reference](docs/API.md) | REST API documentation |
| [Architecture](docs/ARCHITECTURE.md) | System architecture overview |
| [Database](docs/DATABASE.md) | Database schema and queries |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [Security Policy](SECURITY.md) | Security guidelines and reporting |
| [Changelog](CHANGELOG.md) | Version history and changes |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Next.js Application                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │    API Routes       │  │
│  │  (App Dir)  │  │    (UI)     │  │   (/api/*)          │  │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │
└──────────────────────────────────────────────┬──────────────┘
                                               │
          ┌────────────────────────────────────┼────────────────┐
          │                                    │                │
┌─────────▼─────────┐  ┌───────────────────────▼──┐  ┌─────────▼─────────┐
│  Firebase Auth    │  │     PostgreSQL           │  │   S3 Storage      │
│  (Google OAuth)   │  │     (Metadata)           │  │   (Documents)     │
└───────────────────┘  └──────────────────────────┘  └───────────────────┘
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| Authentication | Firebase Auth |
| Database | PostgreSQL |
| File Storage | S3-compatible |
| Form Handling | React Hook Form + Zod |
| Testing | Jest + React Testing Library |

## 📁 Project Structure

```
setutor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── documents/        # Document management
│   │   ├── flashcards/       # Flashcard features
│   │   ├── folders/          # Folder management
│   │   ├── learning-plan/    # Learning plan features
│   │   ├── quiz/             # Quiz features
│   │   ├── summary/          # Summary features
│   │   └── ui/               # Shared UI components
│   ├── lib/                   # Utilities and services
│   │   ├── db/               # Database configuration
│   │   ├── firebase/         # Firebase configuration
│   │   ├── hooks/            # Custom React hooks
│   │   ├── s3/               # S3 storage utilities
│   │   ├── utils/            # Helper functions
│   │   └── validation/       # Input validation
│   └── types/                 # TypeScript type definitions
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
└── public/                    # Static assets
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run db:migrate` | Run database migrations |

## 📄 License

Copyright (c) 2025 Gabriel Seto Pribadi ([@private4920](https://github.com/private4920)) and Muhammad Rofi Darmawan ([@rofiperlungoding](https://github.com/rofiperlungoding)). All rights reserved.

See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Authentication services
- [PostgreSQL](https://www.postgresql.org/) - Database

---

<p align="center">Made with ❤️ by Gabriel Seto Pribadi & Muhammad Rofi Darmawan</p>
