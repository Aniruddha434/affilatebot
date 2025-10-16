# 🚀 Complete Deployment Workflow

**Step-by-step guide to deploy your affiliate bot to production**

---

## 📋 Overview

This workflow has 4 main phases:
1. **GitHub Repository Setup** (15 minutes)
2. **Environment Variables & Security** (10 minutes)
3. **Vercel Deployment** (10 minutes)
4. **Post-Deployment Verification** (15 minutes)

**Total Time**: ~50 minutes

---

## ✅ Phase 1: GitHub Repository Setup (15 min)

### Step 1.1: Initialize Git Repository

```bash
cd "c:\Users\aniru\OneDrive\Desktop\affilate bot"
git init
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 1.2: Create Initial Commit

```bash
git add .
git status  # Verify all files are staged
git commit -m "Initial commit: Amazon Affiliate Telegram Bot"
```

### Step 1.3: Create GitHub Repository

1. Go to [GitHub.com/new](https://github.com/new)
2. Repository name: `amazon-affiliate-bot`
3. Description: `Automated Amazon affiliate deals bot that posts to Telegram`
4. Visibility: `Public` (or `Private`)
5. **Uncheck** "Initialize with README"
6. **Uncheck** "Add .gitignore"
7. **Check** "Add license" → Select `MIT`
8. Click "Create repository"

### Step 1.4: Connect and Push to GitHub

```bash
# Copy the HTTPS URL from GitHub
git remote add origin https://github.com/YOUR_USERNAME/amazon-affiliate-bot.git
git branch -M main
git push -u origin main
```

### Step 1.5: Verify on GitHub

- Go to your GitHub repository
- Verify all files are visible
- Verify `.env` file is NOT there
- Verify `node_modules/` is NOT there

✅ **Phase 1 Complete!**

---

## 🔐 Phase 2: Environment Variables & Security (10 min)

### Step 2.1: Gather All Credentials

Collect these credentials:

**Amazon:**
- [ ] AMAZON_ACCESS_KEY
- [ ] AMAZON_SECRET_KEY
- [ ] AMAZON_PARTNER_TAG

**Telegram:**
- [ ] TELEGRAM_BOT_TOKEN
- [ ] TELEGRAM_CHANNEL_ID

**Supabase:**
- [ ] SUPABASE_URL
- [ ] SUPABASE_KEY

**Optional (for admin panel):**
- [ ] JWT_SECRET (generate: `node generate-secrets.js`)
- [ ] ADMIN_API_SECRET
- [ ] SESSION_SECRET
- [ ] ENCRYPTION_KEY

### Step 2.2: Verify .env File is Ignored

```bash
# Check that .env is in .gitignore
cat .gitignore | grep "^\.env"
```

Should output: `.env`

### Step 2.3: Verify .env.example

Check that `.env.example` has:
- ✅ All required variables
- ✅ No real credentials
- ✅ Only placeholder values

### Step 2.4: Test Configuration Locally

```bash
# Create .env file locally (for testing)
copy .env.example .env

# Edit .env with your real credentials
# Then test:
npm start

# Verify bot starts without errors
# Press Ctrl+C to stop
```

✅ **Phase 2 Complete!**

---

## 🌐 Phase 3: Vercel Deployment (10 min)

### Step 3.1: Sign Up to Vercel

Go to [Vercel.com](https://vercel.com) and sign in with GitHub.

### Step 3.2: Import Project

1. Click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Paste: `https://github.com/YOUR_USERNAME/amazon-affiliate-bot`
4. Click "Continue"
5. Select your repository
6. Click "Import"

### Step 3.3: Configure Project

**Project Settings:**
- Name: `amazon-affiliate-bot`
- Framework: `Other` (Node.js)
- Root Directory: `./`

**Build Settings:**
- Build Command: `npm install`
- Output Directory: (leave empty)
- Install Command: `npm install`

### Step 3.4: Add Environment Variables

Click "Environment Variables" and add each variable:

```
AMAZON_ACCESS_KEY = your_value
AMAZON_SECRET_KEY = your_value
AMAZON_PARTNER_TAG = your_value
AMAZON_REGION = IN
TELEGRAM_BOT_TOKEN = your_value
TELEGRAM_CHANNEL_ID = your_value
SUPABASE_URL = your_value
SUPABASE_KEY = your_value
MIN_DISCOUNT_PERCENTAGE = 50
CRON_SCHEDULE = 0 */2 * * *
MAX_PRODUCTS_PER_RUN = 10
NODE_ENV = production
```

**For each variable:**
1. Enter Name
2. Enter Value
3. Select Environment: `Production`
4. Click "Add"

### Step 3.5: Deploy

Click "Deploy" button and wait for completion.

✅ **Phase 3 Complete!**

---

## 🧪 Phase 4: Post-Deployment Verification (15 min)

### Step 4.1: Check Deployment Status

In Vercel dashboard:
1. Go to "Deployments"
2. Verify latest deployment shows ✅ "Ready"
3. Copy your Vercel URL (e.g., `amazon-affiliate-bot.vercel.app`)

### Step 4.2: Test Health Endpoint

```bash
curl https://amazon-affiliate-bot.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 123456,
  "environment": "production"
}
```

### Step 4.3: Check Logs

In Vercel dashboard:
1. Click latest deployment
2. Click "Logs" tab
3. Look for:
   - ✅ "Bot started successfully"
   - ✅ "Connected to Supabase"
   - ✅ "Telegram bot initialized"
   - ✅ "Scheduler started"

### Step 4.4: Test Telegram Integration

```bash
# Trigger a manual job
curl -X POST https://amazon-affiliate-bot.vercel.app/trigger
```

Check:
- [ ] Logs show job executed
- [ ] Products were fetched
- [ ] Message posted to Telegram
- [ ] No errors in logs

### Step 4.5: Verify Database

1. Go to Supabase dashboard
2. Check your project
3. Verify tables have data
4. Check for any errors

### Step 4.6: Monitor First Scheduled Run

1. Wait for next scheduled time (or adjust CRON_SCHEDULE for testing)
2. Check logs for job execution
3. Verify products posted to Telegram
4. Check database for new records

✅ **Phase 4 Complete!**

---

## 🎉 Deployment Complete!

### What's Running Now

✅ Bot is running on Vercel  
✅ Scheduled jobs are active  
✅ Telegram integration working  
✅ Database connected  
✅ Products being posted  

### Next Steps

1. **Monitor for 24 hours**
   - Check logs regularly
   - Verify scheduled jobs run
   - Monitor Telegram posts

2. **Set Up Alerts** (Optional)
   - Vercel: Settings → Alerts
   - Enable deployment failure alerts
   - Enable error rate alerts

3. **Enable Continuous Deployment**
   - Every push to `main` auto-deploys
   - Vercel handles everything

4. **Document Your Setup**
   - Save your Vercel URL
   - Document environment variables
   - Keep credentials secure

---

## 🆘 Troubleshooting

### Bot Not Starting

```bash
# Check logs in Vercel
# Look for error messages
# Common issues:
# - Missing environment variables
# - Invalid credentials
# - Database connection failed
```

### No Products Found

```bash
# Check logs for:
# - Amazon API errors
# - Search query issues
# - Filter settings too strict
```

### Telegram Not Posting

```bash
# Check logs for:
# - Bot token errors
# - Channel ID issues
# - Permission errors
```

### Database Errors

```bash
# Check logs for:
# - Connection timeouts
# - Authentication errors
# - Query failures
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com
- **Supabase Docs**: https://supabase.com/docs
- **Telegram Bot API**: https://core.telegram.org/bots/api

---

## ✅ Final Checklist

- [ ] GitHub repository created and pushed
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Health check passing
- [ ] Logs show no errors
- [ ] Telegram integration working
- [ ] Database connected
- [ ] Scheduled jobs running
- [ ] Products being posted

**Status**: 🎉 **READY FOR PRODUCTION**


