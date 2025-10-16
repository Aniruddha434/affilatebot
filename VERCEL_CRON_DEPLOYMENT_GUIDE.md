# 🚀 VERCEL CRON DEPLOYMENT GUIDE - PRODUCTION FIX

## ✅ WHAT'S BEEN FIXED

Your bot now uses **Vercel Cron Jobs** instead of node-cron for production:

- ✅ `vercel.json` - Added cron configuration
- ✅ `src/index.js` - Added `/api/cron` endpoint with security
- ✅ `src/scheduler.js` - Detects Vercel environment and disables node-cron
- ✅ Development mode - Still uses node-cron locally

---

## 🎯 HOW IT WORKS NOW

### Development (Local)
```
npm start
  ↓
node-cron scheduler starts
  ↓
Runs every 2 hours locally
  ↓
Posts to Telegram
```

### Production (Vercel)
```
Vercel Cron Service (external)
  ↓
Calls /api/cron every 2 hours
  ↓
Triggers deal-finding job
  ↓
Posts to Telegram
  ↓
Returns response
```

---

## 📋 DEPLOYMENT STEPS

### STEP 1: Add Environment Variable to Vercel

1. Go to: https://vercel.com/dashboard
2. Click: **affilatebot-wbaw** project
3. Click: **Settings** (top menu)
4. Click: **Environment Variables** (left sidebar)
5. Add new variable:
   ```
   Name: CRON_SECRET
   Value: your-secret-key-here (use something random like: abc123xyz789)
   Environment: Production
   Click: Save
   ```

### STEP 2: Verify All Required Variables

Make sure these are set in Vercel:
- ✅ TELEGRAM_BOT_TOKEN
- ✅ TELEGRAM_CHANNEL_ID
- ✅ SUPABASE_URL
- ✅ SUPABASE_KEY
- ✅ CRON_SECRET (NEW)
- ✅ NODE_ENV=production

### STEP 3: Push Code to GitHub

```bash
git add .
git commit -m "Fix: Use Vercel Cron Jobs for production scheduling"
git push origin main
```

### STEP 4: Redeploy on Vercel

1. Go to: https://vercel.com/dashboard
2. Click: **affilatebot-wbaw** project
3. Click: **Deployments** (top menu)
4. Click: **Redeploy** on latest deployment
5. Wait: 2-3 minutes for deployment

---

## ✅ VERIFICATION STEPS

### Test 1: Health Endpoint (Immediate)
```
Open in browser:
https://affilatebot-wbaw.vercel.app/health

Should show:
{
  "status": "healthy",
  "uptime": ...,
  "checks": {
    "server": true,
    "database": true,
    "telegram": true,
    "scheduler": true,
    "imageCache": true
  }
}
```

### Test 2: Manual Cron Trigger (Immediate)
```bash
curl -X GET https://affilatebot-wbaw.vercel.app/api/cron \
  -H "Authorization: Bearer your-secret-key-here"

Should return:
{
  "success": true,
  "message": "Cron job executed successfully",
  "timestamp": "..."
}
```

### Test 3: Telegram Posts (Wait 2 hours)
```
1. Wait for next scheduled cron job (every 2 hours)
2. Check Telegram: @amazondealsmake
3. Verify: Products posted
```

### Test 4: Check Vercel Logs
```
1. Go to: https://vercel.com/dashboard
2. Click: affilatebot-wbaw
3. Click: Deployments
4. Click: Latest deployment
5. Click: Logs
6. Look for: "Vercel Cron Job triggered"
```

---

## 🔍 TROUBLESHOOTING

### Health Endpoint Returns Error
```
1. Wait 5 minutes after deployment
2. Hard refresh (Ctrl+Shift+R)
3. Check Vercel logs for errors
4. Verify all environment variables are set
```

### Cron Endpoint Returns 401 Unauthorized
```
1. Check CRON_SECRET is set in Vercel
2. Verify Authorization header format: "Bearer your-secret-key"
3. Make sure secret matches exactly
```

### No Telegram Posts After 2 Hours
```
1. Check Vercel logs for cron execution
2. Verify database connection
3. Check Telegram channel permissions
4. Manually trigger: curl /api/cron endpoint
```

### Scheduler Shows "Ready for Vercel Cron Jobs"
```
This is CORRECT! It means:
- Bot detected Vercel environment
- node-cron is disabled (as intended)
- Waiting for Vercel to call /api/cron
```

---

## 📊 TIMELINE

```
Now:        Push code to GitHub (1 min)
+1 min:     Vercel starts deployment
+3 min:     Deployment complete
+5 min:     Health endpoint responds
+2 hours:   First cron job triggers
+2 hours:   First products posted to Telegram
```

---

## 🎉 SUCCESS INDICATORS

✅ Health endpoint returns "healthy"
✅ Scheduler shows "Ready for Vercel Cron Jobs"
✅ Manual cron trigger returns success
✅ Telegram posts appear every 2 hours
✅ Vercel logs show "Vercel Cron Job triggered"

---

## 📞 SUPPORT

If issues persist:
1. Check Vercel logs for errors
2. Verify all environment variables
3. Test manual cron trigger
4. Check Telegram channel permissions
5. Verify database connection


