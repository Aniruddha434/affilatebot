# 🚀 Vercel Deployment Guide

**Complete guide to deploy your affiliate bot to Vercel**

---

## 📋 Prerequisites

- GitHub repository created and pushed
- Vercel account ([Create here](https://vercel.com/signup))
- All environment variables ready
- Supabase project set up

---

## 🌐 Step 1: Connect GitHub to Vercel

### 1.1 Sign Up / Sign In to Vercel

Go to [Vercel.com](https://vercel.com) and sign in with GitHub.

### 1.2 Import Project

1. Click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Paste your GitHub repository URL:
   ```
   https://github.com/YOUR_USERNAME/amazon-affiliate-bot
   ```
4. Click "Continue"

### 1.3 Select Repository

- Find your `amazon-affiliate-bot` repository
- Click "Import"

---

## ⚙️ Step 2: Configure Project Settings

### 2.1 Project Name

- **Name**: `amazon-affiliate-bot` (or your preferred name)
- This becomes your Vercel URL: `amazon-affiliate-bot.vercel.app`

### 2.2 Framework Preset

- **Framework**: Select `Other` (Node.js)
- **Root Directory**: `./` (leave as is)

### 2.3 Build Settings

| Setting | Value |
|---------|-------|
| Build Command | `npm install` |
| Output Directory | (leave empty) |
| Install Command | `npm install` |

### 2.4 Environment Variables

**IMPORTANT**: Add all required variables here!

Click "Environment Variables" and add:

#### Required Variables

```
AMAZON_ACCESS_KEY = your_access_key
AMAZON_SECRET_KEY = your_secret_key
AMAZON_PARTNER_TAG = yourtag-21
AMAZON_REGION = IN
TELEGRAM_BOT_TOKEN = your_bot_token
TELEGRAM_CHANNEL_ID = @your_channel
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_KEY = your_anon_key
```

#### Optional Variables

```
MIN_DISCOUNT_PERCENTAGE = 50
CRON_SCHEDULE = 0 */2 * * *
MAX_PRODUCTS_PER_RUN = 10
NODE_ENV = production
JWT_SECRET = your_jwt_secret
ADMIN_API_SECRET = your_admin_secret
SESSION_SECRET = your_session_secret
ENCRYPTION_KEY = your_encryption_key
```

**For each variable:**
1. Enter **Name** (e.g., `AMAZON_ACCESS_KEY`)
2. Enter **Value** (your actual value)
3. Select **Environment**: `Production`
4. Click "Add"

---

## 🚀 Step 3: Deploy

### 3.1 Click Deploy

Click the "Deploy" button. Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the project
4. Start the bot
5. Assign a URL

### 3.2 Monitor Deployment

Watch the deployment progress:
- ✅ Cloning repository
- ✅ Installing dependencies
- ✅ Building project
- ✅ Starting bot

### 3.3 Deployment Complete

Once complete, you'll see:
- ✅ Deployment successful
- 🌐 Your Vercel URL (e.g., `amazon-affiliate-bot.vercel.app`)
- 📊 Deployment details

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Health Endpoint

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

### 4.2 View Logs

In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click latest deployment
4. Click "Logs" tab
5. Look for:
   - ✅ "Bot started successfully"
   - ✅ "Connected to Supabase"
   - ✅ "Telegram bot initialized"
   - ✅ "Scheduler started"

### 4.3 Check Telegram Integration

1. Look in logs for Telegram connection message
2. Verify bot is connected to your channel
3. Test manual trigger:
   ```bash
   curl -X POST https://amazon-affiliate-bot.vercel.app/trigger
   ```

### 4.4 Monitor First Run

1. Wait for first scheduled job to run
2. Check logs for product search
3. Verify products posted to Telegram
4. Check Supabase database for records

---

## 🔄 Step 5: Set Up Continuous Deployment

### 5.1 Automatic Deployments

Vercel automatically deploys when you:
- Push to `main` branch
- Create pull requests
- Merge pull requests

### 5.2 Deployment Status

Each push shows:
- ✅ Deployment successful
- ⏳ Deployment in progress
- ❌ Deployment failed

### 5.3 View Deployment History

In Vercel dashboard:
1. Click "Deployments"
2. See all deployments with timestamps
3. Click any deployment to view logs
4. Promote previous deployments if needed

---

## 🔐 Step 6: Security Configuration

### 6.1 Protect Environment Variables

Vercel automatically encrypts environment variables:
- ✅ Encrypted at rest
- ✅ Encrypted in transit
- ✅ Not visible in logs
- ✅ Not exposed in source code

### 6.2 Manage Access

1. Go to Settings → Team
2. Add team members
3. Set permissions (Admin, Member, Guest)

### 6.3 Enable Branch Protection

1. Go to Settings → Git
2. Enable "Require approval for production deployments"
3. Set reviewers

---

## 📊 Step 7: Monitoring & Logs

### 7.1 View Real-Time Logs

```bash
# Using Vercel CLI
vercel logs amazon-affiliate-bot --follow
```

### 7.2 Check Metrics

In Vercel dashboard:
1. Click "Analytics"
2. View:
   - Request count
   - Response time
   - Error rate
   - Uptime

### 7.3 Set Up Alerts

1. Go to Settings → Alerts
2. Configure notifications for:
   - Deployment failures
   - High error rates
   - Performance issues

---

## 🔄 Step 8: Rollback & Recovery

### 8.1 Rollback to Previous Deployment

If something goes wrong:
1. Go to "Deployments"
2. Find previous successful deployment
3. Click "..." menu
4. Click "Promote to Production"

### 8.2 Redeploy Current Version

```bash
# Using Vercel CLI
vercel --prod
```

### 8.3 View Deployment Logs

1. Click on any deployment
2. Click "Logs" tab
3. Search for errors
4. Check timestamps

---

## 🆘 Troubleshooting

### Bot Not Starting

**Check logs for:**
- Missing environment variables
- Database connection errors
- Telegram token issues

**Solution:**
1. Verify all env vars in Vercel dashboard
2. Check Supabase connection
3. Test Telegram token

### No Products Found

**Check logs for:**
- Amazon API errors
- Search query issues
- Filter settings

**Solution:**
1. Verify Amazon credentials
2. Check MIN_DISCOUNT_PERCENTAGE
3. Test with different keywords

### Telegram Not Posting

**Check logs for:**
- Bot token errors
- Channel ID issues
- Permission errors

**Solution:**
1. Verify bot is admin in channel
2. Check channel ID format
3. Test with manual trigger

### Database Errors

**Check logs for:**
- Connection timeouts
- Authentication errors
- Query failures

**Solution:**
1. Verify SUPABASE_URL and SUPABASE_KEY
2. Check Supabase dashboard
3. Verify tables exist

---

## 📈 Performance Optimization

### 1. Enable Caching

In `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=60"
        }
      ]
    }
  ]
}
```

### 2. Monitor Function Duration

- Keep functions under 60 seconds
- Optimize database queries
- Use caching where possible

### 3. Optimize Dependencies

```bash
npm audit
npm update
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Health check passing
- [ ] Logs show no errors
- [ ] Telegram integration working
- [ ] Database connected
- [ ] First job executed
- [ ] Products posted to Telegram
- [ ] Continuous deployment enabled

---

## 📞 Support

For issues:
1. Check Vercel logs
2. Verify environment variables
3. Test each component
4. Check service status
5. Review error messages


