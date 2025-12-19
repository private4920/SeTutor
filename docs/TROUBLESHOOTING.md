# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with SETutor.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Issues](#authentication-issues)
- [Database Issues](#database-issues)
- [File Upload Issues](#file-upload-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)

---

## Installation Issues

### npm install fails

**Symptoms:**
- Error messages during `npm install`
- Missing dependencies

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 18.x or higher
   ```

3. **Use npm ci for clean install:**
   ```bash
   npm ci
   ```

### TypeScript compilation errors

**Symptoms:**
- Type errors during build
- Red squiggles in IDE

**Solutions:**

1. **Rebuild TypeScript:**
   ```bash
   rm -rf .next tsconfig.tsbuildinfo
   npm run build
   ```

2. **Check TypeScript version:**
   ```bash
   npx tsc --version  # Should be 5.x
   ```

---

## Authentication Issues

### Google Sign-in not working

**Symptoms:**
- Sign-in button doesn't respond
- Redirect loop after sign-in
- "Unauthorized domain" error

**Solutions:**

1. **Check Firebase configuration:**
   ```bash
   # Verify environment variables are set
   echo $NEXT_PUBLIC_FIREBASE_API_KEY
   echo $NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   ```

2. **Add authorized domain:**
   - Go to Firebase Console → Authentication → Settings
   - Add your domain to "Authorized domains"
   - Include `localhost` for development

3. **Enable Google provider:**
   - Firebase Console → Authentication → Sign-in method
   - Enable Google provider
   - Configure OAuth consent screen

### Session not persisting

**Symptoms:**
- User logged out after page refresh
- Session expires too quickly

**Solutions:**

1. **Check Firebase persistence:**
   ```typescript
   // In AuthContext.tsx
   import { browserLocalPersistence, setPersistence } from 'firebase/auth';
   
   await setPersistence(auth, browserLocalPersistence);
   ```

2. **Clear browser storage:**
   - Open DevTools → Application → Storage
   - Clear all site data
   - Try signing in again

### "User not found" after sign-in

**Symptoms:**
- Sign-in succeeds but user not created in database

**Solutions:**

1. **Check database connection:**
   ```bash
   psql -h localhost -U setutor_user -d setutor -c "SELECT 1"
   ```

2. **Verify user creation logic:**
   - Check API logs for errors
   - Ensure `userRepository.createUser()` is called

---

## Database Issues

### Connection refused

**Symptoms:**
- `ECONNREFUSED` error
- "Connection refused" in logs

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # Ubuntu
   sudo systemctl status postgresql
   
   # Windows
   Get-Service postgresql*
   ```

2. **Verify connection string:**
   ```bash
   # Test connection
   psql "postgresql://user:pass@localhost:5432/setutor"
   ```

3. **Check firewall:**
   ```bash
   # Ubuntu
   sudo ufw status
   
   # Allow PostgreSQL
   sudo ufw allow 5432/tcp
   ```

### Migration fails

**Symptoms:**
- `npm run db:migrate` fails
- "relation does not exist" errors

**Solutions:**

1. **Check database exists:**
   ```sql
   \l  -- List databases
   ```

2. **Run migrations manually:**
   ```bash
   psql -U setutor_user -d setutor -f src/lib/db/migrations/001_initial_schema.sql
   ```

3. **Reset database:**
   ```sql
   DROP DATABASE setutor;
   CREATE DATABASE setutor OWNER setutor_user;
   ```
   Then run migrations again.

### Query timeout

**Symptoms:**
- Slow API responses
- "Query timeout" errors

**Solutions:**

1. **Check indexes exist:**
   ```sql
   \di  -- List indexes
   ```

2. **Analyze slow queries:**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM documents WHERE user_id = 'uuid';
   ```

3. **Increase connection pool:**
   ```typescript
   // In db/config.ts
   const pool = new Pool({
     max: 20,  // Increase from default
     idleTimeoutMillis: 30000
   });
   ```

---

## File Upload Issues

### Upload fails with 413 error

**Symptoms:**
- "Request Entity Too Large" error
- Files over certain size fail

**Solutions:**

1. **Check Nginx config:**
   ```nginx
   client_max_body_size 50M;
   ```

2. **Check Next.js config:**
   ```typescript
   // next.config.ts
   export const config = {
     api: {
       bodyParser: {
         sizeLimit: '50mb'
       }
     }
   };
   ```

### S3 upload fails

**Symptoms:**
- "Access Denied" error
- "NoSuchBucket" error

**Solutions:**

1. **Verify S3 credentials:**
   ```bash
   # Test with AWS CLI
   aws s3 ls s3://your-bucket --endpoint-url https://your-endpoint
   ```

2. **Check bucket CORS:**
   ```json
   {
     "CORSRules": [{
       "AllowedOrigins": ["http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"]
     }]
   }
   ```

3. **Verify IAM permissions:**
   - Ensure user has `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`

### File not found after upload

**Symptoms:**
- Upload succeeds but file not accessible
- 404 when accessing file URL

**Solutions:**

1. **Check S3 key format:**
   ```typescript
   // Ensure consistent key format
   const key = `users/${userId}/documents/${documentId}.pdf`;
   ```

2. **Verify presigned URL generation:**
   ```typescript
   const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
   ```

---

## Performance Issues

### Slow page loads

**Symptoms:**
- Pages take > 3 seconds to load
- High Time to First Byte (TTFB)

**Solutions:**

1. **Enable production mode:**
   ```bash
   NODE_ENV=production npm run build
   npm start
   ```

2. **Check for N+1 queries:**
   - Use database query logging
   - Batch related queries

3. **Implement caching:**
   ```typescript
   // Add cache headers
   res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
   ```

### High memory usage

**Symptoms:**
- Application crashes with OOM
- PM2 shows high memory

**Solutions:**

1. **Set memory limit in PM2:**
   ```javascript
   // ecosystem.config.js
   max_memory_restart: '1G'
   ```

2. **Check for memory leaks:**
   ```bash
   # Monitor memory
   pm2 monit
   ```

3. **Optimize image handling:**
   - Use Next.js Image component
   - Implement lazy loading

### Database connection exhaustion

**Symptoms:**
- "Too many connections" error
- Intermittent connection failures

**Solutions:**

1. **Use connection pooling:**
   ```typescript
   const pool = new Pool({
     max: 20,
     min: 5,
     idleTimeoutMillis: 30000
   });
   ```

2. **Close connections properly:**
   ```typescript
   finally {
     client.release();
   }
   ```

---

## Deployment Issues

### PM2 won't start application

**Symptoms:**
- `pm2 start` fails
- Application crashes immediately

**Solutions:**

1. **Check logs:**
   ```bash
   pm2 logs setutor --lines 100
   ```

2. **Verify environment:**
   ```bash
   pm2 env setutor
   ```

3. **Test manually first:**
   ```bash
   npm start
   ```

### Nginx 502 Bad Gateway

**Symptoms:**
- 502 error in browser
- Application not accessible

**Solutions:**

1. **Check if app is running:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Check Nginx error log:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Verify proxy settings:**
   ```nginx
   location / {
     proxy_pass http://localhost:3000;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
   }
   ```

### SSL certificate issues

**Symptoms:**
- "Certificate expired" warning
- HTTPS not working

**Solutions:**

1. **Renew certificate:**
   ```bash
   sudo certbot renew
   ```

2. **Check certificate status:**
   ```bash
   sudo certbot certificates
   ```

3. **Test SSL configuration:**
   ```bash
   openssl s_client -connect yourdomain.com:443
   ```

---

## Getting Help

If you can't resolve your issue:

1. **Search existing issues:** [GitHub Issues](https://github.com/yourusername/setutor/issues)
2. **Create a new issue** with:
   - Error messages
   - Steps to reproduce
   - Environment details
3. **Join our Discord:** [discord.gg/setutor](https://discord.gg/setutor)
4. **Email support:** support@setutor.com

### Useful Debug Information

When reporting issues, include:

```bash
# System info
node --version
npm --version
cat /etc/os-release  # Linux
systeminfo  # Windows

# Application info
cat package.json | grep version

# Logs
pm2 logs setutor --lines 50
```
