# 🚀 Quick Start Guide - A-Grade Affiliate Bot

## Get Started in 5 Minutes!

This guide will help you set up and run your upgraded affiliate bot quickly.

---

## ⚡ Prerequisites

- Node.js 16+ installed
- Supabase account and project
- Telegram bot token
- Amazon PA-API credentials (optional for testing)

---

## 📦 Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install admin panel dependencies
cd admin-panel
npm install
cd ..
```

---

## 🔐 Step 2: Generate Secure Secrets

```bash
node generate-secrets.js
```

This will generate:
- `JWT_SECRET`
- `ADMIN_API_SECRET`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`

**Copy these secrets to your `.env` file!**

---

## 🗄️ Step 3: Set Up Database

### Option A: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-keywords-schema.sql`
4. Click "Run"

### Option B: Using psql
```bash
psql <your-supabase-connection-string> -f supabase-keywords-schema.sql
```

---

## ⚙️ Step 4: Configure Environment

Update your `.env` file:

```env
# === CRITICAL: REPLACE THESE WITH GENERATED SECRETS ===
JWT_SECRET=<paste-generated-secret-here>
ADMIN_API_SECRET=<paste-generated-secret-here>
SESSION_SECRET=<paste-generated-secret-here>
ENCRYPTION_KEY=<paste-generated-secret-here>

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHANNEL_ID=@your_channel

# Bot Configuration
MIN_DISCOUNT_PERCENTAGE=50
CRON_SCHEDULE=0 */6 * * *
MAX_PRODUCTS_PER_RUN=10

# Amazon PA-API (Optional for testing)
AMAZON_ACCESS_KEY=your-access-key
AMAZON_SECRET_KEY=your-secret-key
AMAZON_PARTNER_TAG=your-tag
AMAZON_HOST=webservices.amazon.in
AMAZON_REGION=eu-west-1

# Server
PORT=3000
```

---

## 🎯 Step 5: Create Admin User

```bash
node create-admin-user.js
```

Follow the prompts to create your first admin user.

---

## 🚀 Step 6: Start the Bot

### Terminal 1 - Backend:
```bash
npm start
```

You should see:
```
✅ Database initialized
✅ Platforms initialized
✅ Telegram bot initialized
✅ Image manager initialized
🚀 Server running on port 3000
⏰ Scheduler started
```

### Terminal 2 - Admin Panel:
```bash
cd admin-panel
npm run dev
```

Admin panel will be available at: `http://localhost:3001`

---

## ✅ Step 7: Verify Installation

### Test Backend Health:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 10,
  "checks": {
    "server": true,
    "database": true,
    "telegram": true,
    "scheduler": true,
    "imageCache": true
  }
}
```

### Run Feature Tests:
```bash
node test-new-features.js
```

All tests should pass! ✅

---

## 🎨 Step 8: Access Admin Panel

1. Open browser: `http://localhost:3001`
2. Login with your admin credentials
3. You'll see the dashboard with:
   - Bot status
   - Statistics
   - Quick navigation to all features

---

## 🎯 Quick Feature Tour

### 1. **Dashboard** (`/dashboard`)
- View bot status and statistics
- Start/stop bot
- Trigger manual job runs
- Quick navigation to all features

### 2. **Platform Management** (`/platforms`)
- Enable/disable platforms
- Adjust posting ratios
- Configure platform-specific settings

### 3. **Keywords** (`/keywords`) 🆕
- Add search keywords
- Platform-specific or global
- Track usage statistics

### 4. **Images** (`/images`) 🆕
- View cache statistics
- Validate image URLs
- Clear cache
- Monitor storage usage

### 5. **Manual Post** (`/manual-post`) 🆕
- Post products manually
- Full form with validation
- Auto-calculate discounts
- Instant Telegram posting

### 6. **Logs** (`/logs`)
- Real-time log monitoring
- Filter by level
- Search logs
- Auto-refresh

### 7. **Filters** (`/filters`)
- Configure price ranges
- Set discount thresholds
- Manage keywords (legacy)

---

## 🔧 Common Tasks

### Add a New Keyword
1. Go to **Keywords** page
2. Enter keyword (e.g., "laptop")
3. Select platform or "All Platforms"
4. Click "Add Keyword"

### Post a Product Manually
1. Go to **Manual Post** page
2. Fill in product details
3. System validates image URL
4. Click "Post to Telegram"

### Monitor Bot Health
1. Check **Dashboard** for status
2. View **Logs** for activity
3. Check `/health` endpoint programmatically

### Clear Image Cache
1. Go to **Images** page
2. View current cache size
3. Click "Clear Cache"
4. Confirm action

---

## 🐛 Troubleshooting

### Bot Not Starting?
```bash
# Check logs
tail -f logs/bot.log

# Verify environment variables
node -e "require('dotenv').config(); console.log(process.env.TELEGRAM_BOT_TOKEN ? 'OK' : 'MISSING')"
```

### Database Connection Issues?
```bash
# Test Supabase connection
node -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); client.from('posted_deals').select('count').then(console.log)"
```

### Admin Panel Not Loading?
```bash
# Check if backend is running
curl http://localhost:3000/health

# Rebuild admin panel
cd admin-panel
rm -rf .next
npm run dev
```

### Image Cache Not Working?
```bash
# Check cache directory
ls -la cache/images/

# Test image validation
curl -X POST http://localhost:3000/api/images/validate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/image.jpg"}'
```

---

## 📚 Next Steps

### Recommended Actions:
1. ✅ Add your favorite search keywords
2. ✅ Configure platform ratios
3. ✅ Test manual posting
4. ✅ Set up monitoring alerts
5. ✅ Review security settings

### Advanced Configuration:
- Set up custom cron schedules
- Configure platform-specific filters
- Adjust cache size limits
- Enable additional platforms

### Production Deployment:
- Use environment-specific secrets
- Set up SSL/TLS
- Configure reverse proxy
- Enable monitoring
- Set up automated backups

---

## 🎉 You're All Set!

Your A-grade affiliate bot is now running with:
- ✅ Secure authentication
- ✅ Image management
- ✅ Keyword system
- ✅ Manual posting
- ✅ Real-time monitoring
- ✅ Comprehensive admin panel

**Happy bot running! 🤖**

---

## 📞 Need Help?

- Check `UPGRADE-GUIDE.md` for detailed documentation
- Review `IMPLEMENTATION-SUMMARY.md` for technical details
- Run `node test-new-features.js` to verify setup
- Check logs in admin panel for errors

---

## 🔗 Quick Links

- **Backend**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3001`
- **Health Check**: `http://localhost:3000/health`
- **API Docs**: See `UPGRADE-GUIDE.md`

---

**Made with ❤️ for affiliate marketers**

