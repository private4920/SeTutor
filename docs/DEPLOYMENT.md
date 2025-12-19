# Deployment Guide

This guide covers production deployment of SETutor on Ubuntu and Windows servers.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Ubuntu Server Deployment](#ubuntu-server-deployment)
- [Windows Server Deployment](#windows-server-deployment)
- [Database Setup](#database-setup)
- [Reverse Proxy Configuration](#reverse-proxy-configuration)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Process Management](#process-management)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 20 GB SSD | 50+ GB SSD |
| Network | 100 Mbps | 1 Gbps |

### Software Requirements

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Nginx (Ubuntu) or IIS (Windows)
- PM2 (process manager)
- Git

---

## Ubuntu Server Deployment

### Step 1: System Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 2: Install Node.js

```bash
# Install Node.js 20.x LTS using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER setutor_prod WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE setutor_prod OWNER setutor_prod;
GRANT ALL PRIVILEGES ON DATABASE setutor_prod TO setutor_prod;
\q
EOF
```

### Step 4: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

### Step 5: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs
```

### Step 6: Create Application User

```bash
# Create dedicated user for the application
sudo useradd -m -s /bin/bash setutor
sudo mkdir -p /var/www/setutor
sudo chown setutor:setutor /var/www/setutor
```

### Step 7: Clone and Setup Application

```bash
# Switch to setutor user
sudo su - setutor

# Clone repository
cd /var/www/setutor
git clone https://github.com/yourusername/setutor.git .

# Install dependencies
npm ci --production=false

# Create environment file
cp .env.example .env.local
nano .env.local  # Edit with production values
```

### Step 8: Configure Environment Variables

Edit `/var/www/setutor/.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Database Configuration
DATABASE_URL=postgresql://setutor_prod:your_secure_password@localhost:5432/setutor_prod
DATABASE_SSL=false

# S3 Storage Configuration
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-production
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Step 9: Run Database Migrations

```bash
npm run db:migrate
```

### Step 10: Build Application

```bash
npm run build
```

### Step 11: Configure PM2

Create `/var/www/setutor/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'setutor',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/setutor',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/setutor/error.log',
    out_file: '/var/log/setutor/out.log',
    log_file: '/var/log/setutor/combined.log',
    time: true,
    max_memory_restart: '1G',
    exp_backoff_restart_delay: 100
  }]
};
```

Create log directory:

```bash
sudo mkdir -p /var/log/setutor
sudo chown setutor:setutor /var/log/setutor
```

### Step 12: Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# View logs
pm2 logs setutor
```

### Step 13: Configure Nginx

Create `/etc/nginx/sites-available/setutor`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (update paths after certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Client max body size (for file uploads)
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/setutor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 14: Install SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 15: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Ubuntu Deployment Complete! ✅

Your application should now be accessible at `https://yourdomain.com`

---

## Windows Server Deployment

### Step 1: Install Prerequisites

#### Install Node.js

1. Download Node.js 20.x LTS from [nodejs.org](https://nodejs.org/)
2. Run the installer with default options
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

#### Install PostgreSQL

1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Set a password for the `postgres` user
4. Keep default port (5432)
5. Complete installation

#### Install Git

1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run installer with default options

### Step 2: Create Database

Open pgAdmin or use psql:

```sql
-- Connect as postgres user
CREATE USER setutor_prod WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE setutor_prod OWNER setutor_prod;
GRANT ALL PRIVILEGES ON DATABASE setutor_prod TO setutor_prod;
```

### Step 3: Setup Application Directory

```powershell
# Create application directory
New-Item -ItemType Directory -Path "C:\inetpub\setutor" -Force

# Navigate to directory
cd C:\inetpub\setutor

# Clone repository
git clone https://github.com/yourusername/setutor.git .

# Install dependencies
npm ci --production=false
```

### Step 4: Configure Environment

Create `C:\inetpub\setutor\.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Database Configuration
DATABASE_URL=postgresql://setutor_prod:your_secure_password@localhost:5432/setutor_prod
DATABASE_SSL=false

# S3 Storage Configuration
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=setutor-production
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Step 5: Run Migrations and Build

```powershell
# Run database migrations
npm run db:migrate

# Build application
npm run build
```

### Step 6: Install PM2 for Windows

```powershell
# Install PM2 globally
npm install -g pm2

# Install pm2-windows-startup
npm install -g pm2-windows-startup
pm2-startup install
```

### Step 7: Create PM2 Configuration

Create `C:\inetpub\setutor\ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'setutor',
    script: 'npm',
    args: 'start',
    cwd: 'C:\\inetpub\\setutor',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'C:\\inetpub\\setutor\\logs\\error.log',
    out_file: 'C:\\inetpub\\setutor\\logs\\out.log',
    log_file: 'C:\\inetpub\\setutor\\logs\\combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
```

Create logs directory:

```powershell
New-Item -ItemType Directory -Path "C:\inetpub\setutor\logs" -Force
```

### Step 8: Start Application

```powershell
cd C:\inetpub\setutor
pm2 start ecosystem.config.js
pm2 save
```

### Step 9: Install and Configure IIS

#### Install IIS

1. Open Server Manager
2. Click "Add roles and features"
3. Select "Web Server (IIS)"
4. Include these features:
   - Application Development → WebSocket Protocol
   - Common HTTP Features → All
   - Health and Diagnostics → All
   - Performance → All
   - Security → All

#### Install URL Rewrite Module

1. Download from [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
2. Install the module

#### Install Application Request Routing (ARR)

1. Download from [IIS ARR](https://www.iis.net/downloads/microsoft/application-request-routing)
2. Install the module

### Step 10: Configure IIS as Reverse Proxy

#### Enable Proxy in ARR

1. Open IIS Manager
2. Select server node
3. Double-click "Application Request Routing Cache"
4. Click "Server Proxy Settings"
5. Check "Enable proxy"
6. Click Apply

#### Create Website

1. In IIS Manager, right-click "Sites"
2. Click "Add Website"
3. Configure:
   - Site name: `setutor`
   - Physical path: `C:\inetpub\setutor\public`
   - Binding: HTTP, port 80, hostname: yourdomain.com

#### Configure URL Rewrite

Create `C:\inetpub\setutor\public\web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_FORWARDED_HOST" value="{HTTP_HOST}" />
            <set name="HTTP_X_REAL_IP" value="{REMOTE_ADDR}" />
            <set name="HTTP_X_FORWARDED_PROTO" value="https" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="52428800" />
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

### Step 11: Configure SSL with Let's Encrypt

#### Option A: Using win-acme

1. Download win-acme from [win-acme.com](https://www.win-acme.com/)
2. Extract to `C:\win-acme`
3. Run as Administrator:

```powershell
cd C:\win-acme
.\wacs.exe
```

4. Follow prompts to create certificate for your domain

#### Option B: Using Certify The Web

1. Download from [certifytheweb.com](https://certifytheweb.com/)
2. Install and run
3. Add new certificate for your domain
4. Configure auto-renewal

### Step 12: Configure Windows Firewall

```powershell
# Allow HTTP
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Allow HTTPS
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

### Windows Deployment Complete! ✅

Your application should now be accessible at `https://yourdomain.com`

---

## Database Setup

### PostgreSQL Optimization

Edit `postgresql.conf`:

```ini
# Memory Settings
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 16MB
maintenance_work_mem = 128MB

# Connection Settings
max_connections = 100

# Write Ahead Log
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Database Backup Script

**Ubuntu:**
```bash
#!/bin/bash
# /usr/local/bin/backup-setutor.sh

BACKUP_DIR="/var/backups/setutor"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="setutor_backup_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -U setutor_prod setutor_prod | gzip > "${BACKUP_DIR}/${FILENAME}"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup-setutor.sh
```

**Windows (PowerShell):**
```powershell
# C:\Scripts\backup-setutor.ps1

$BackupDir = "C:\Backups\setutor"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$Filename = "setutor_backup_$Date.sql"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U setutor_prod setutor_prod > "$BackupDir\$Filename"

# Compress
Compress-Archive -Path "$BackupDir\$Filename" -DestinationPath "$BackupDir\$Filename.zip"
Remove-Item "$BackupDir\$Filename"

# Keep only last 7 days
Get-ChildItem $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item
```

Schedule with Task Scheduler.

---

## Monitoring and Logging

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs setutor

# Monitor resources
pm2 monit

# View metrics
pm2 show setutor
```

### Log Rotation (Ubuntu)

Create `/etc/logrotate.d/setutor`:

```
/var/log/setutor/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 setutor setutor
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Check Endpoint

Add to your application a health check endpoint at `/api/health`:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check PM2 logs
pm2 logs setutor --lines 100

# Check if port is in use
lsof -i :3000  # Ubuntu
netstat -ano | findstr :3000  # Windows
```

#### Database Connection Failed

```bash
# Test connection
psql -h localhost -U setutor_prod -d setutor_prod

# Check PostgreSQL status
sudo systemctl status postgresql  # Ubuntu
Get-Service postgresql*  # Windows
```

#### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

#### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

### Performance Issues

```bash
# Check system resources
htop  # Ubuntu
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10  # Windows

# Check PM2 memory usage
pm2 monit

# Restart application
pm2 restart setutor
```

---

## Quick Reference Commands

### Ubuntu

| Task | Command |
|------|---------|
| Start app | `pm2 start setutor` |
| Stop app | `pm2 stop setutor` |
| Restart app | `pm2 restart setutor` |
| View logs | `pm2 logs setutor` |
| Check status | `pm2 status` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Check Nginx | `sudo nginx -t` |

### Windows

| Task | Command |
|------|---------|
| Start app | `pm2 start setutor` |
| Stop app | `pm2 stop setutor` |
| Restart app | `pm2 restart setutor` |
| View logs | `pm2 logs setutor` |
| Check status | `pm2 status` |
| Restart IIS | `iisreset` |
