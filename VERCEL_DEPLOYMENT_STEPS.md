# 🚀 Vercel Deployment - Step by Step

**Your code is on GitHub! Now let's deploy to Vercel.**

---

## ✅ What's Done

✅ GitHub repository created: `https://github.com/Aniruddha434/affilatebot.git`  
✅ Code pushed to GitHub  
✅ All files committed (158 files, 321.87 KiB)  

---

## 🎯 Next Steps: Deploy to Vercel

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Sign in with your GitHub account (if not already signed in)

---

### Step 2: Import Your GitHub Repository

1. Click **"Add New..."** button
2. Select **"Project"**
3. Click **"Import Git Repository"**
4. Search for: **"affilatebot"**
5. Click **"Import"** next to your repository

---

### Step 3: Configure Project Settings

**Project Name**: `affilatebot` (or your preferred name)

**Framework Preset**: Select **"Other"** (since it's a Node.js Express app)

**Root Directory**: Leave as `.` (root)

**Build Command**: Leave empty (no build needed)

**Output Directory**: Leave empty

**Install Command**: `npm install`

**Start Command**: `node src/index.js`

---

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add all these:

#### Required Variables

```
AMAZON_ACCESS_KEY = [Your Amazon Access Key]
AMAZON_SECRET_KEY = [Your Amazon Secret Key]
AMAZON_PARTNER_TAG = [Your Amazon Partner Tag]
TELEGRAM_BOT_TOKEN = [Your Telegram Bot Token]
TELEGRAM_CHANNEL_ID = [Your Telegram Channel ID]
SUPABASE_URL = [Your Supabase URL]
SUPABASE_KEY = [Your Supabase Key]
```

#### Optional Variables

```
AMAZON_REGION = in
MIN_DISCOUNT_PERCENTAGE = 20
CRON_SCHEDULE = 0 */6 * * *
MAX_PRODUCTS_PER_RUN = 5
PORT = 3000
NODE_ENV = production
```

#### Admin Panel Variables (if using admin panel)

```
JWT_SECRET = [Generate a random string]
ADMIN_API_SECRET = [Generate a random string]
SESSION_SECRET = [Generate a random string]
ENCRYPTION_KEY = [Generate a random string]
```

---

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for deployment to complete (usually 2-3 minutes)
3. You'll see a success message with your deployment URL

---

## 📊 Deployment URL

After deployment, you'll get a URL like:
```
https://affilatebot-[random].vercel.app
```

This is your bot's public URL!

---

## ✅ Verify Deployment

### Check Health Endpoint

Open in browser or use curl:
```bash
curl https://affilatebot-[random].vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T...",
  "uptime": "..."
}
```

### Check Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click on the latest deployment
5. Click **"Logs"** to see real-time logs

---

## 🔄 Enable Continuous Deployment

Your deployment is now set up for continuous deployment!

**How it works**:
1. You push code to GitHub
2. Vercel automatically detects the push
3. Vercel automatically deploys the new code
4. Your bot updates without manual intervention

---

## 🎯 What Happens Next

### Automatic Deployment
- Every time you push to GitHub, Vercel deploys automatically
- Takes 2-3 minutes per deployment
- You can see deployment status in Vercel dashboard

### Scheduled Jobs
- Your cron jobs will run on Vercel's infrastructure
- Jobs run according to your CRON_SCHEDULE
- Logs are available in Vercel dashboard

### Telegram Integration
- Bot will post to your Telegram channel
- Check your Telegram channel for posts
- If no posts, check Vercel logs for errors

---

## 📋 Troubleshooting

### Deployment Failed

**Check logs**:
1. Go to Vercel Dashboard
2. Click your project
3. Click latest deployment
4. Click "Logs" tab
5. Look for error messages

**Common issues**:
- Missing environment variables → Add them in Settings
- Wrong Node.js version → Vercel uses latest by default
- Missing dependencies → Run `npm install` locally first

### Bot Not Running

**Check health endpoint**:
```bash
curl https://affilatebot-[random].vercel.app/health
```

**Check logs**:
1. Vercel Dashboard → Your Project → Deployments → Latest → Logs
2. Look for error messages
3. Check if environment variables are set

### No Telegram Posts

**Check**:
1. Is TELEGRAM_BOT_TOKEN correct?
2. Is TELEGRAM_CHANNEL_ID correct?
3. Is bot admin in the channel?
4. Check Vercel logs for errors

---

## 🔐 Security Notes

✅ `.env` file is in `.gitignore` - never committed  
✅ Environment variables stored securely in Vercel  
✅ No credentials in code  
✅ All sensitive data in environment variables  

---

## 📞 Support

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/concepts/deployments/overview

### Common Commands

**View logs**:
```bash
vercel logs
```

**Redeploy**:
```bash
vercel deploy --prod
```

**Check status**:
```bash
vercel status
```

---

## ✨ You're Done!

Your affiliate bot is now deployed to production on Vercel!

✅ Code on GitHub  
✅ Deployed to Vercel  
✅ Environment variables configured  
✅ Continuous deployment enabled  
✅ Scheduled jobs running  
✅ Telegram integration active  

---

## 🎉 Next Steps

1. **Monitor your bot**
   - Check Vercel logs daily
   - Verify Telegram posts
   - Monitor error rates

2. **Optimize performance**
   - Review logs for slow operations
   - Optimize database queries
   - Cache frequently used data

3. **Scale up**
   - Add more keywords
   - Add more platforms
   - Increase posting frequency

---

## 📝 Quick Reference

| Item | Value |
|------|-------|
| GitHub Repo | https://github.com/Aniruddha434/affilatebot |
| Vercel Dashboard | https://vercel.com/dashboard |
| Bot URL | https://affilatebot-[random].vercel.app |
| Health Check | /health endpoint |
| Manual Trigger | /trigger endpoint |
| Logs | Vercel Dashboard → Deployments → Logs |

---

**Your bot is now live in production!** 🚀


