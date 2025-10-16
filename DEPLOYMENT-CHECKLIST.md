# ✅ Deployment Checklist - A-Grade Affiliate Bot

## Pre-Deployment Checklist

### 🔐 Security
- [ ] Generated secure secrets using `node generate-secrets.js`
- [ ] Updated `.env` with all generated secrets
- [ ] Verified no secrets are committed to git
- [ ] Changed default admin password
- [ ] Reviewed `.gitignore` includes `.env` and `secrets.txt`
- [ ] Deleted `secrets.txt` after copying to `.env`

### 🗄️ Database
- [ ] Ran `supabase-keywords-schema.sql` on production database
- [ ] Verified `search_keywords` table exists
- [ ] Tested database connection from application
- [ ] Created admin user with `node create-admin-user.js`
- [ ] Verified all tables have proper indexes

### ⚙️ Configuration
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configured production Supabase URL and key
- [ ] Set correct Telegram bot token
- [ ] Verified Telegram channel ID
- [ ] Configured Amazon PA-API credentials (if using)
- [ ] Set appropriate `MIN_DISCOUNT_PERCENTAGE`
- [ ] Configured `CRON_SCHEDULE` for production
- [ ] Set `MAX_PRODUCTS_PER_RUN` appropriately

### 🧪 Testing
- [ ] Ran `node test-new-features.js` successfully
- [ ] Verified health check returns healthy status
- [ ] Tested manual product posting
- [ ] Verified keyword management works
- [ ] Tested image caching and validation
- [ ] Confirmed rate limiting works on login
- [ ] Tested all admin panel pages load correctly

### 📦 Dependencies
- [ ] Ran `npm install` in root directory
- [ ] Ran `npm install` in admin-panel directory
- [ ] Verified all dependencies are up to date
- [ ] No security vulnerabilities in `npm audit`

---

## Deployment Steps

### Step 1: Prepare Environment
```bash
# Set production environment
export NODE_ENV=production

# Verify environment variables
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌')"
node -e "require('dotenv').config(); console.log('ADMIN_API_SECRET:', process.env.ADMIN_API_SECRET ? '✅' : '❌')"
node -e "require('dotenv').config(); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌')"
```

### Step 2: Database Migration
```bash
# Run keyword schema
psql $DATABASE_URL -f supabase-keywords-schema.sql

# Verify tables
psql $DATABASE_URL -c "\dt"
```

### Step 3: Build Admin Panel
```bash
cd admin-panel
npm run build
cd ..
```

### Step 4: Start Services

#### Option A: Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start src/index.js --name "affiliate-bot"

# Start admin panel
cd admin-panel
pm2 start npm --name "admin-panel" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option B: Using systemd
Create `/etc/systemd/system/affiliate-bot.service`:
```ini
[Unit]
Description=Affiliate Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/affiliate-bot
ExecStart=/usr/bin/node src/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable affiliate-bot
sudo systemctl start affiliate-bot
```

### Step 5: Verify Deployment
```bash
# Check health
curl http://localhost:3000/health

# Check logs
pm2 logs affiliate-bot

# Verify admin panel
curl http://localhost:3001
```

---

## Post-Deployment Checklist

### 🔍 Verification
- [ ] Health check endpoint returns healthy
- [ ] All system checks pass (database, telegram, scheduler, cache)
- [ ] Admin panel loads correctly
- [ ] Can login to admin panel
- [ ] Dashboard shows correct statistics
- [ ] Bot is running and scheduler is active

### 📊 Monitoring Setup
- [ ] Set up health check monitoring (every 5 minutes)
- [ ] Configure alerts for degraded status
- [ ] Set up log aggregation
- [ ] Configure error notifications
- [ ] Monitor disk space for image cache
- [ ] Set up uptime monitoring

### 🔒 Security Hardening
- [ ] Firewall configured (only necessary ports open)
- [ ] SSL/TLS certificate installed
- [ ] Reverse proxy configured (nginx/Apache)
- [ ] Rate limiting configured at proxy level
- [ ] CORS properly configured
- [ ] Security headers added

### 📈 Performance
- [ ] Image cache directory has sufficient space
- [ ] Database connection pooling configured
- [ ] Logs rotation configured
- [ ] Memory limits set appropriately
- [ ] CPU usage monitored

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Review error logs
- [ ] Check bot posting activity
- [ ] Verify Telegram channel updates
- [ ] Monitor image cache size

### Weekly Checks
- [ ] Review keyword performance
- [ ] Check platform statistics
- [ ] Analyze posting patterns
- [ ] Review and clean old logs

### Monthly Checks
- [ ] Rotate secrets (recommended every 90 days)
- [ ] Update dependencies
- [ ] Review and optimize keywords
- [ ] Clean up old cached images
- [ ] Database maintenance (vacuum, analyze)

---

## Backup Strategy

### What to Backup
- [ ] `.env` file (securely!)
- [ ] Database (Supabase handles this)
- [ ] Admin user credentials
- [ ] Custom configuration files
- [ ] Keyword list

### Backup Schedule
- **Daily**: Database backup (automated by Supabase)
- **Weekly**: Configuration backup
- **Monthly**: Full system backup

---

## Rollback Plan

### If Deployment Fails

1. **Stop Services**
   ```bash
   pm2 stop affiliate-bot
   pm2 stop admin-panel
   ```

2. **Restore Previous Version**
   ```bash
   git checkout <previous-commit>
   npm install
   cd admin-panel && npm install
   ```

3. **Restart Services**
   ```bash
   pm2 restart affiliate-bot
   pm2 restart admin-panel
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:3000/health
   ```

---

## Production URLs

### Update These After Deployment
- **Backend API**: `https://api.yourdomain.com`
- **Admin Panel**: `https://admin.yourdomain.com`
- **Health Check**: `https://api.yourdomain.com/health`

### Update in Admin Panel
Edit `admin-panel/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## SSL/TLS Configuration

### Using Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Nginx Configuration Example

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/admin.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Emergency Contacts

### Critical Issues
- **Database**: Supabase support
- **Telegram**: @BotFather
- **Server**: Your hosting provider

### Escalation Path
1. Check logs: `pm2 logs affiliate-bot`
2. Check health: `curl http://localhost:3000/health`
3. Review recent changes: `git log`
4. Rollback if necessary

---

## Success Criteria

### Deployment is Successful When:
- ✅ Health check returns 200 OK
- ✅ All system checks pass
- ✅ Admin panel accessible
- ✅ Bot posting to Telegram
- ✅ No errors in logs
- ✅ Image caching working
- ✅ Keyword management functional
- ✅ Manual posting works

---

## 🎉 Deployment Complete!

Once all items are checked, your A-grade affiliate bot is live!

**Remember to:**
- Monitor health checks regularly
- Review logs daily
- Keep secrets secure
- Update dependencies monthly
- Backup configuration weekly

**Good luck with your affiliate bot! 🚀**

