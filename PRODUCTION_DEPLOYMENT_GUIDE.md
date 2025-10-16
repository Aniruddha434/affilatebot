# 🚀 Production Deployment Guide - Vercel

**Last Updated**: October 16, 2025  
**Status**: Ready for Deployment

---

## 📋 Table of Contents

1. [GitHub Repository Setup](#github-repository-setup)
2. [Environment Variables](#environment-variables)
3. [Vercel Deployment](#vercel-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)

---

## 🔧 GitHub Repository Setup

### Step 1: Initialize Git Repository

```bash
cd "c:\Users\aniru\OneDrive\Desktop\affilate bot"

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Amazon Affiliate Telegram Bot"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com/new)
2. Create a new repository named `amazon-affiliate-bot`
3. **DO NOT** initialize with README (we have one)
4. Copy the repository URL

### Step 3: Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/amazon-affiliate-bot.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## 🔐 Environment Variables

### Required Variables for Production

```env
# Amazon Credentials (REQUIRED)
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=yourtag-21
AMAZON_REGION=IN

# Telegram (REQUIRED)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=@your_channel

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key

# Bot Configuration (OPTIONAL)
MIN_DISCOUNT_PERCENTAGE=50
CRON_SCHEDULE=0 */2 * * *
MAX_PRODUCTS_PER_RUN=10
NODE_ENV=production

# Admin Panel (OPTIONAL)
JWT_SECRET=your_jwt_secret
ADMIN_API_SECRET=your_admin_secret
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_encryption_key
```

---

## 🌐 Vercel Deployment

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your `amazon-affiliate-bot` repository
5. Click "Import"

### Step 2: Configure Project Settings

**Framework**: Node.js  
**Build Command**: `npm install`  
**Start Command**: `node src/index.js`  
**Output Directory**: (leave empty)

### Step 3: Add Environment Variables

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add all required variables from the list above
3. Set them for Production environment

### Step 4: Deploy

Click "Deploy" button. Vercel will:
1. Clone your repository
2. Install dependencies
3. Start the bot
4. Assign a URL

---

## ✅ Post-Deployment Verification

### Check 1: Bot is Running

```bash
curl https://your-vercel-url.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 123456,
  "environment": "production"
}
```

### Check 2: Telegram Integration

1. Check Vercel logs for Telegram connection
2. Verify bot is connected to channel
3. Test manual trigger: `curl -X POST https://your-vercel-url.vercel.app/trigger`

### Check 3: Database Connection

1. Check logs for Supabase connection
2. Verify tables are created
3. Check for any database errors

### Check 4: Scheduled Jobs

1. Monitor logs for cron job execution
2. Verify products are being fetched
3. Check Telegram channel for posted deals

---

## 📊 Monitoring

### View Logs

```bash
# In Vercel dashboard:
# 1. Go to your project
# 2. Click "Deployments"
# 3. Click latest deployment
# 4. Click "Logs" tab
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Bot not starting | Check environment variables |
| No products found | Verify Amazon credentials |
| Telegram errors | Check bot token and channel ID |
| Database errors | Verify Supabase URL and key |

---

## 🔄 Continuous Deployment

Every push to `main` branch will:
1. Trigger automatic deployment
2. Run build process
3. Deploy new version
4. Restart bot

---

## 📝 Rollback

If deployment fails:
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous successful deployment
4. Click "Promote to Production"

---

## 🎯 Success Checklist

- [ ] GitHub repository created
- [ ] All files committed and pushed
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Bot deployed successfully
- [ ] Health check passing
- [ ] Telegram integration working
- [ ] Database connected
- [ ] Scheduled jobs running
- [ ] Products being posted

---

## 📞 Support

For issues:
1. Check Vercel logs
2. Verify environment variables
3. Test each component separately
4. Check service status (Amazon, Telegram, Supabase)


