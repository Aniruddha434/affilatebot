# 🚀 Vercel Environment Variables - Copy & Paste Ready

**Copy these variables directly into Vercel dashboard**

---

## ✅ REQUIRED VARIABLES (Must Have)

### Amazon Credentials
```
AMAZON_ACCESS_KEY=your_access_key_here
AMAZON_SECRET_KEY=your_secret_key_here
AMAZON_PARTNER_TAG=4340c5-21
AMAZON_REGION=IN
```

### Telegram Configuration
```
TELEGRAM_BOT_TOKEN=7731512306:AAHEhFMEydtCZajLx0g8HT_iR8iuN2SpfzE
TELEGRAM_CHANNEL_ID=@amazondealsmake
```

### Supabase Configuration
```
SUPABASE_URL=https://dbnldknxqqsysfwlswtb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibmxka254cXFzeXNmd2xzd3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTg0MDgsImV4cCI6MjA3NDg3NDQwOH0.k9jP4xRGu9AsuJo3T--76FuPaZ480fsMqTOv8CoFGO0
```

---

## ⚙️ OPTIONAL VARIABLES (Nice to Have)

### Bot Behavior
```
MIN_DISCOUNT_PERCENTAGE=85
CRON_SCHEDULE=*/2 * * * *
MAX_PRODUCTS_PER_RUN=10
```

### Server Configuration
```
PORT=3000
NODE_ENV=production
```

### Admin Panel (Optional)
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_API_SECRET=your-admin-api-secret-change-this
ADMIN_API_ALLOWED_ORIGIN=http://localhost:3001
ADMIN_API_CLOCK_SKEW_SEC=120
```

---

## 📋 HOW TO ADD TO VERCEL

### Step 1: Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Click Your Project
```
Click on "affilatebot" project
```

### Step 3: Go to Settings
```
Click "Settings" tab
```

### Step 4: Go to Environment Variables
```
Click "Environment Variables" in left sidebar
```

### Step 5: Add Each Variable
```
For each variable:
1. Click "Add New"
2. Enter Variable Name (e.g., AMAZON_ACCESS_KEY)
3. Enter Variable Value (e.g., your_access_key_here)
4. Select "Production" (or all environments)
5. Click "Save"
```

---

## 🎯 QUICK COPY-PASTE GUIDE

### Copy This Entire Block (Required Variables)

```
AMAZON_ACCESS_KEY=your_access_key_here
AMAZON_SECRET_KEY=your_secret_key_here
AMAZON_PARTNER_TAG=4340c5-21
AMAZON_REGION=IN
TELEGRAM_BOT_TOKEN=7731512306:AAHEhFMEydtCZajLx0g8HT_iR8iuN2SpfzE
TELEGRAM_CHANNEL_ID=@amazondealsmake
SUPABASE_URL=https://dbnldknxqqsysfwlswtb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibmxka254cXFzeXNmd2xzd3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTg0MDgsImV4cCI6MjA3NDg3NDQwOH0.k9jP4xRGu9AsuJo3T--76FuPaZ480fsMqTOv8CoFGO0
MIN_DISCOUNT_PERCENTAGE=85
CRON_SCHEDULE=*/2 * * * *
MAX_PRODUCTS_PER_RUN=10
PORT=3000
NODE_ENV=production
```

---

## ✅ VARIABLE CHECKLIST

### Required (Must Add)
- [ ] AMAZON_ACCESS_KEY
- [ ] AMAZON_SECRET_KEY
- [ ] AMAZON_PARTNER_TAG
- [ ] AMAZON_REGION
- [ ] TELEGRAM_BOT_TOKEN
- [ ] TELEGRAM_CHANNEL_ID
- [ ] SUPABASE_URL
- [ ] SUPABASE_KEY

### Optional (Recommended)
- [ ] MIN_DISCOUNT_PERCENTAGE
- [ ] CRON_SCHEDULE
- [ ] MAX_PRODUCTS_PER_RUN
- [ ] PORT
- [ ] NODE_ENV

### Admin Panel (Optional)
- [ ] JWT_SECRET
- [ ] ADMIN_API_SECRET
- [ ] ADMIN_API_ALLOWED_ORIGIN
- [ ] ADMIN_API_CLOCK_SKEW_SEC

---

## 📊 VARIABLE DESCRIPTIONS

| Variable | Value | Description |
|----------|-------|-------------|
| AMAZON_ACCESS_KEY | your_access_key_here | Amazon API Access Key |
| AMAZON_SECRET_KEY | your_secret_key_here | Amazon API Secret Key |
| AMAZON_PARTNER_TAG | 4340c5-21 | Your Amazon Affiliate Tag |
| AMAZON_REGION | IN | Amazon Region (IN = India) |
| TELEGRAM_BOT_TOKEN | 7731512306:... | Your Telegram Bot Token |
| TELEGRAM_CHANNEL_ID | @amazondealsmake | Your Telegram Channel ID |
| SUPABASE_URL | https://dbnld... | Supabase Project URL |
| SUPABASE_KEY | eyJhbGc... | Supabase Anon Key |
| MIN_DISCOUNT_PERCENTAGE | 85 | Minimum discount to post |
| CRON_SCHEDULE | */2 * * * * | Job schedule (every 2 min) |
| MAX_PRODUCTS_PER_RUN | 10 | Max products per run |
| PORT | 3000 | Server port |
| NODE_ENV | production | Environment type |

---

## 🔐 SECURITY NOTES

✅ **These values are already in your `.env` file**  
✅ **Safe to add to Vercel (encrypted)**  
✅ **Never commit `.env` to GitHub**  
✅ **Vercel encrypts all environment variables**  

---

## ⚠️ IMPORTANT

### Before Adding to Vercel

1. **Verify Amazon Credentials**
   - Make sure AMAZON_ACCESS_KEY is correct
   - Make sure AMAZON_SECRET_KEY is correct
   - Make sure AMAZON_PARTNER_TAG is correct

2. **Verify Telegram Credentials**
   - Make sure TELEGRAM_BOT_TOKEN is correct
   - Make sure TELEGRAM_CHANNEL_ID is correct
   - Make sure bot is admin in channel

3. **Verify Supabase Credentials**
   - Make sure SUPABASE_URL is correct
   - Make sure SUPABASE_KEY is correct
   - Make sure database is accessible

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Go to Vercel Settings
```
1. Open: https://vercel.com/dashboard
2. Click your project: affilatebot
3. Click "Settings" tab
4. Click "Environment Variables"
```

### Step 2: Add Variables One by One
```
For each variable:
1. Click "Add New"
2. Paste variable name
3. Paste variable value
4. Click "Save"
```

### Step 3: Redeploy
```
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete
```

---

## ✨ AFTER ADDING VARIABLES

### Verify Deployment
```bash
curl https://affilatebot-[random].vercel.app/health
```

### Check Logs
```
1. Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Click latest deployment
5. Click "Logs"
```

### Test Bot
```
1. Check Telegram channel
2. Wait for scheduled job
3. Verify products posted
```

---

## 📞 TROUBLESHOOTING

### Bot Not Starting
- Check all required variables are added
- Check variable values are correct
- Check Vercel logs for errors

### No Telegram Posts
- Verify TELEGRAM_BOT_TOKEN is correct
- Verify TELEGRAM_CHANNEL_ID is correct
- Verify bot is admin in channel
- Check Vercel logs

### Database Connection Error
- Verify SUPABASE_URL is correct
- Verify SUPABASE_KEY is correct
- Check Supabase console for issues

---

## 🎉 YOU'RE READY!

All environment variables are ready to copy to Vercel!

**Next Step**: Add these variables to Vercel dashboard and redeploy.

**Time**: ~5 minutes  
**Difficulty**: Easy  

---

**Let's deploy!** 🚀


