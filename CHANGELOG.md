# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js 16
- Firebase Authentication with Google OAuth
- PostgreSQL database integration
- S3-compatible file storage
- Document upload and management
- Hierarchical folder structure
- Flashcard generation and practice
- Quiz generation and taking
- Document summary generation
- Learning plan creation and tracking
- Responsive dashboard UI
- Input validation and sanitization

### Security
- CSRF protection middleware
- Input sanitization for XSS prevention
- Parameterized database queries
- Secure file upload validation

## [1.0.0] - 2024-XX-XX

### Added
- **Authentication**
  - Google OAuth sign-in via Firebase
  - Session persistence
  - Protected route middleware
  - User profile management

- **Document Management**
  - PDF file upload with drag-and-drop
  - File size validation (50MB limit)
  - Grid and list view layouts
  - Document preview
  - Document search functionality
  - Move documents between folders

- **Folder Management**
  - Create, rename, delete folders
  - Unlimited nesting depth
  - Move folders with contents
  - Breadcrumb navigation
  - Folder tree visualization

- **Flashcards**
  - AI-powered flashcard generation
  - Configurable quantity (5-50 cards)
  - Difficulty level selection
  - Interactive flip animations
  - Practice mode
  - Export functionality

- **Quizzes**
  - Multiple question types (MCQ, True/False, Short Answer)
  - Configurable question count (5-30)
  - Optional time limits
  - Score visualization
  - Question-by-question review

- **Summaries**
  - Length options (brief, standard, detailed)
  - Focus area selection
  - Key takeaways extraction
  - Copy to clipboard
  - Export to PDF/Word

- **Learning Plans**
  - Duration selection (1 week to custom)
  - Intensity levels
  - Calendar timeline view
  - Daily breakdown panels
  - Progress tracking
  - Study streak counter

- **Dashboard**
  - Statistics overview
  - Recent documents
  - Quick action buttons
  - Responsive sidebar navigation

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- Implemented user data isolation
- Added input validation with Zod schemas
- Configured secure S3 presigned URLs
- Added CSRF protection
- Implemented XSS prevention

---

---

Copyright (c) 2025 Gabriel Seto Pribadi (@private4920) and Muhammad Rofi Darmawan (@rofiperlungoding). All rights reserved.
