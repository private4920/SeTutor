# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of SETutor seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

📧 **me@gabrielseto.dev**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Location** of the affected source code (file path, line numbers)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept** or exploit code (if possible)
- **Impact assessment** of the vulnerability
- **Suggested fix** (if you have one)

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Assessment**: We will investigate and assess the vulnerability within 7 days
3. **Resolution**: We will work on a fix and coordinate disclosure timeline
4. **Credit**: We will credit you in our security advisories (unless you prefer anonymity)

## Security Measures

### Authentication & Authorization

- **Firebase Authentication**: All user authentication is handled through Firebase with Google OAuth
- **JWT Token Verification**: All API requests are authenticated using Firebase ID tokens (JWTs) verified server-side using Firebase Admin SDK
- **Server-Side Token Validation**: User identity is extracted from cryptographically signed JWT tokens, not from client-provided parameters
- **Protected Routes**: All sensitive routes require valid JWT authentication
- **User Isolation**: Database queries are filtered by verified user ID to prevent data leakage

### Data Protection

- **Input Validation**: All user inputs are validated using Zod schemas
- **SQL Injection Prevention**: Parameterized queries are used throughout
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: CSRF tokens for state-changing operations

### File Security

- **File Type Validation**: Only PDF files are accepted
- **File Size Limits**: Maximum 50MB per file
- **Secure Storage**: Files stored in S3 with presigned URLs
- **Access Control**: Files are only accessible to their owners

### Infrastructure Security

- **Environment Variables**: All secrets stored in environment variables
- **HTTPS**: All communications encrypted in transit
- **Database Encryption**: Connection encryption enabled
- **Dependency Scanning**: Regular security audits of dependencies

## Security Best Practices for Deployment

### Environment Variables

Never commit sensitive data to version control:

```bash
# Required secrets (never commit these)
DATABASE_URL=postgresql://...
S3_SECRET_ACCESS_KEY=...
FIREBASE_API_KEY=...
```

### Database Security

```sql
-- Use least privilege principle
CREATE USER setutor_app WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO setutor_app;

-- Enable SSL connections
ALTER SYSTEM SET ssl = on;
```

### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::setutor-documents",
        "arn:aws:s3:::setutor-documents/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Security Checklist

Before deploying code, ensure:

- [ ] No hardcoded secrets or credentials
- [ ] User inputs are validated and sanitized
- [ ] Database queries use parameterized statements
- [ ] Authentication is required for protected routes
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date
- [ ] File uploads are validated

## Known Security Considerations

### Current Limitations

1. **Rate Limiting**: Currently implemented at application level; consider adding infrastructure-level rate limiting for production
2. **Audit Logging**: Basic logging implemented; consider enhanced audit trails for compliance requirements
3. **2FA**: Not currently supported; planned for future release

### Planned Security Enhancements

- [ ] Two-factor authentication
- [ ] API rate limiting
- [ ] Enhanced audit logging
- [ ] Automated security scanning in CI/CD
- [ ] Content Security Policy headers

## Security Updates

Security updates are released as patch versions. We recommend:

1. **Subscribe** to security advisories
2. **Update** dependencies regularly
3. **Monitor** for new releases
4. **Test** updates in staging before production

## Contact

For security-related inquiries:

- 📧 Email: me@gabrielseto.dev
- 🔐 PGP Key: [Available upon request]

Thank you for helping keep SETutor and its users safe!

---

Copyright (c) 2025 Gabriel Seto Pribadi (@private4920) and Muhammad Rofi Darmawan (@rofiperlungoding). All rights reserved.
