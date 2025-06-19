# portal.ask Deployment Guide

This guide provides step-by-step instructions for deploying the portal.ask platform to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Blockchain Setup](#blockchain-setup)
5. [Media Storage Setup](#media-storage-setup)
6. [Deployment Options](#deployment-options)
7. [Production Configuration](#production-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: Version 20 or higher
- **npm**: Latest version
- **MongoDB**: Version 5.0 or higher
- **Solana CLI**: Latest version
- **Git**: For version control

### Required Accounts

- **MongoDB Atlas** (or self-hosted MongoDB)
- **Cloudinary** (for media storage)
- **Solana Wallet** (for blockchain operations)
- **Domain Name** (for production URL)
- **SSL Certificate** (for HTTPS)

### Development Tools

- **Anchor Framework** (for Solana program deployment)
- **Docker** (optional, for containerized deployment)
- **PM2** (for process management)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd xPortal
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Environment Variables

Create a `.env` file with production values:

```env
# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://portal.ask

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/portal?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-session-secret-key-here

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
SOLANA_PROGRAM_ID=your_program_id_here

# Security
CORS_ORIGIN=https://portal.ask
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Generate Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Choose "Shared" cluster (free tier)
   - Select cloud provider and region
   - Choose cluster name (e.g., "portal-cluster")

3. **Configure Network Access**
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (allow all IPs)
   - Or add specific IP addresses for security

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `portal_user`
   - Password: Generate secure password
   - Role: "Read and write to any database"

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Local MongoDB Setup (Alternative)

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS
brew install mongodb-community

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongosh
use portal
db.createUser({
  user: "portal_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database with initial data
npx prisma db seed
```

---

## Blockchain Setup

### Solana Program Deployment

1. **Install Anchor Framework**

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

2. **Build Program**

```bash
cd programs/bounty-program
anchor build
```

3. **Deploy to Mainnet**

```bash
# Set to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Deploy program
anchor deploy --provider.cluster mainnet

# Note the program ID and update it in your .env file
```

### Token Setup

1. **Create SPL Token**

```bash
# Create token mint
spl-token create-token --decimals 9

# Create token account
spl-token create-account <TOKEN_MINT_ADDRESS>

# Mint initial supply
spl-token mint <TOKEN_MINT_ADDRESS> 1000000000
```

2. **Update Token Configuration**

Update `bounty-bucks-info.json`:

```json
{
  "config": {
    "symbol": "PORTAL",
    "name": "Portal Bucks",
    "decimals": 9,
    "mintAddress": "your_token_mint_address_here"
  }
}
```

---

## Media Storage Setup

### Cloudinary Setup

1. **Create Cloudinary Account**
   - Visit [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get Credentials**
   - Go to Dashboard
   - Note your Cloud Name, API Key, and API Secret

3. **Configure Upload Presets**
   - Go to Settings → Upload
   - Create upload preset for different file types
   - Set folder structure (e.g., `portal/users`, `portal/posts`)

4. **Configure CORS**
   - Go to Settings → Security
   - Add your domain to allowed origins

### Alternative: AWS S3

If you prefer AWS S3 over Cloudinary:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=portal-media
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure Build Settings**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build/client",
     "installCommand": "npm ci",
     "framework": "remix"
   }
   ```

3. **Set Environment Variables**
   - Add all production environment variables
   - Ensure `NODE_ENV=production`

4. **Deploy**
   - Vercel will automatically deploy on push to main branch

### Option 2: Railway (Full Stack)

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository

2. **Configure Service**
   ```json
   // railway.json
   {
     "build": {
       "builder": "nixpacks"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/health",
       "healthcheckTimeout": 100,
       "restartPolicyType": "on_failure"
     }
   }
   ```

3. **Set Environment Variables**
   - Add all production environment variables

4. **Deploy**
   - Railway will automatically deploy

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub repository

2. **Configure Build**
   - Build command: `npm run build`
   - Run command: `npm start`
   - Output directory: `build/client`

3. **Set Environment Variables**
   - Add all production environment variables

4. **Deploy**
   - Deploy the app

### Option 4: Self-Hosted (VPS)

1. **Set Up Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install nginx
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url> /var/www/portal
   cd /var/www/portal

   # Install dependencies
   npm ci

   # Build application
   npm run build

   # Start with PM2
   pm2 start build/server/index.js --name "portal"
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/portal
   server {
       listen 80;
       server_name portal.ask;

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
       }
   }
   ```

4. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Production Configuration

### SSL Certificate

1. **Let's Encrypt (Free)**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Get certificate
   sudo certbot --nginx -d portal.ask

   # Auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

2. **Commercial SSL**
   - Purchase SSL certificate from provider
   - Install according to provider instructions

### Domain Configuration

1. **DNS Setup**
   ```
   Type: A
   Name: @
   Value: your_server_ip

   Type: CNAME
   Name: www
   Value: portal.ask
   ```

2. **CDN Setup (Optional)**
   - Cloudflare for DNS and CDN
   - AWS CloudFront for global distribution

### Environment Optimization

```env
# Performance
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=64

# Security
HELMET_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true

# Monitoring
NEW_RELIC_LICENSE_KEY=your_new_relic_key
DATADOG_API_KEY=your_datadog_key
```

---

## Monitoring & Maintenance

### Application Monitoring

1. **Sentry Setup**
   ```javascript
   // app/utils/error.server.ts
   import * as Sentry from '@sentry/node';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

2. **Health Check Endpoint**
   ```typescript
   // app/routes/health.tsx
   export async function loader() {
     try {
       // Check database connection
       await prisma.$queryRaw`SELECT 1`;
       
       // Check Solana connection
       const connection = new Connection(process.env.SOLANA_RPC_URL!);
       await connection.getSlot();
       
       return json({ status: 'healthy', timestamp: new Date().toISOString() });
     } catch (error) {
       return json({ status: 'unhealthy', error: error.message }, { status: 500 });
     }
   }
   ```

### Database Monitoring

1. **MongoDB Atlas Monitoring**
   - Enable monitoring in Atlas dashboard
   - Set up alerts for performance issues

2. **Database Backups**
   ```bash
   # Automated backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   mongodump --uri="your_mongodb_uri" --out="/backups/$DATE"
   ```

### Log Management

1. **Structured Logging**
   ```typescript
   // app/utils/logger.server.ts
   import winston from 'winston';

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. **Log Rotation**
   ```bash
   # Install logrotate
   sudo apt install logrotate

   # Configure rotation
   # /etc/logrotate.d/portal
   /var/log/portal/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 www-data www-data
   }
   ```

---

## Security Considerations

### Application Security

1. **Input Validation**
   ```typescript
   // app/utils/validators.server.ts
   import { z } from 'zod';

   export const postSchema = z.object({
     title: z.string().min(1).max(200),
     content: z.string().min(1).max(10000),
     bounty: z.object({
       amount: z.number().positive().max(1000)
     }).optional()
   });
   ```

2. **Rate Limiting**
   ```typescript
   // app/utils/rate-limiter.server.ts
   import rateLimit from 'express-rate-limit';

   export const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // limit each IP to 5 requests per windowMs
     message: 'Too many login attempts'
   });
   ```

3. **CORS Configuration**
   ```typescript
   // app/entry.server.tsx
   app.use(cors({
     origin: process.env.CORS_ORIGIN,
     credentials: true
   }));
   ```

### Infrastructure Security

1. **Firewall Configuration**
   ```bash
   # UFW firewall setup
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **SSL/TLS Configuration**
   ```nginx
   # /etc/nginx/sites-available/portal
   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
   ssl_prefer_server_ciphers off;
   ```

3. **Security Headers**
   ```typescript
   // app/entry.server.tsx
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"],
       },
     },
   }));
   ```

### Blockchain Security

1. **Private Key Management**
   - Use hardware wallets for production
   - Store keys securely (not in code)
   - Implement multi-signature wallets

2. **Transaction Validation**
   ```typescript
   // app/utils/solana.server.ts
   export async function validateTransaction(signature: string) {
     const connection = new Connection(process.env.SOLANA_RPC_URL!);
     const transaction = await connection.getTransaction(signature);
     
     if (!transaction) {
       throw new Error('Transaction not found');
     }
     
     // Validate transaction details
     return transaction;
   }
   ```

---

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB connection
mongosh "your_connection_string"

# Check Prisma connection
npx prisma db pull

# Reset database (development only)
npx prisma db push --force-reset
```

#### Solana Connection Issues
```bash
# Check Solana cluster status
solana cluster-version

# Check wallet balance
solana balance

# Check program deployment
solana program show <PROGRAM_ID>
```

#### Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check TypeScript errors
npm run typecheck

# Check linting errors
npm run lint
```

#### Performance Issues

1. **Database Optimization**
   ```sql
   -- Add indexes for common queries
   db.posts.createIndex({ "authorId": 1, "createdAt": -1 })
   db.votes.createIndex({ "userId": 1, "postId": 1 })
   ```

2. **Caching Strategy**
   ```typescript
   // app/utils/cache.server.ts
   import Redis from 'ioredis';

   const redis = new Redis(process.env.REDIS_URL);

   export async function cacheGet(key: string) {
     return await redis.get(key);
   }

   export async function cacheSet(key: string, value: string, ttl: number) {
     await redis.setex(key, ttl, value);
   }
   ```

### Monitoring Commands

```bash
# Check application status
pm2 status
pm2 logs portal

# Check system resources
htop
df -h
free -h

# Check network connections
netstat -tulpn | grep :3000

# Check SSL certificate
openssl s_client -connect portal.ask:443 -servername portal.ask
```

### Backup and Recovery

1. **Database Backup**
   ```bash
   # Create backup
   mongodump --uri="your_mongodb_uri" --out="/backups/$(date +%Y%m%d)"

   # Restore backup
   mongorestore --uri="your_mongodb_uri" /backups/20240101
   ```

2. **Application Backup**
   ```bash
   # Backup application files
   tar -czf portal-backup-$(date +%Y%m%d).tar.gz /var/www/portal

   # Backup environment variables
   cp /var/www/portal/.env /backups/env-backup-$(date +%Y%m%d)
   ```

---

## Support

### Getting Help

- **Documentation**: Check this guide and related docs
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join community for real-time help
- **Email**: bountybucks524@gmail.com

### Useful Resources

- [Remix Deployment Guide](https://remix.run/docs/en/main/guides/deployment)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Solana Documentation](https://docs.solana.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## Conclusion

This deployment guide covers the essential steps to deploy portal.ask to production. Remember to:

1. **Test thoroughly** in staging environment
2. **Monitor continuously** after deployment
3. **Backup regularly** to prevent data loss
4. **Update security** patches and dependencies
5. **Scale gradually** as your user base grows

For additional support or questions, please refer to the documentation or contact the development team.

Happy deploying! 🚀 