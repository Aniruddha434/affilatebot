# 🎯 Environment Variables - Ready to Copy to Vercel

**All your environment variables extracted and ready for Vercel**

---

## ✅ REQUIRED VARIABLES (Copy These First)

### 1️⃣ Amazon Credentials
```
Variable Name: AMAZON_ACCESS_KEY
Variable Value: your_access_key_here
```

```
Variable Name: AMAZON_SECRET_KEY
Variable Value: your_secret_key_here
```

```
Variable Name: AMAZON_PARTNER_TAG
Variable Value: 4340c5-21
```

```
Variable Name: AMAZON_REGION
Variable Value: IN
```

### 2️⃣ Telegram Configuration
```
Variable Name: TELEGRAM_BOT_TOKEN
Variable Value: 7731512306:AAHEhFMEydtCZajLx0g8HT_iR8iuN2SpfzE
```

```
Variable Name: TELEGRAM_CHANNEL_ID
Variable Value: @amazondealsmake
```

### 3️⃣ Supabase Configuration
```
Variable Name: SUPABASE_URL
Variable Value: https://dbnldknxqqsysfwlswtb.supabase.co
```

```
Variable Name: SUPABASE_KEY
Variable Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibmxka254cXFzeXNmd2xzd3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTg0MDgsImV4cCI6MjA3NDg3NDQwOH0.k9jP4xRGu9AsuJo3T--76FuPaZ480fsMqTOv8CoFGO0
```

---

## ⚙️ OPTIONAL VARIABLES (Recommended)

### Bot Behavior
```
Variable Name: MIN_DISCOUNT_PERCENTAGE
Variable Value: 85
```

```
Variable Name: CRON_SCHEDULE
Variable Value: */2 * * * *
```

```
Variable Name: MAX_PRODUCTS_PER_RUN
Variable Value: 10
```

### Server Configuration
```
Variable Name: PORT
Variable Value: 3000
```

```
Variable Name: NODE_ENV
Variable Value: production
```

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open Vercel Dashboard
```
1. Go to: https://vercel.com/dashboard
2. Sign in with GitHub
3. Click on "affilatebot" project
```

### Step 2: Go to Environment Variables
```
1. Click "Settings" tab
2. Click "Environment Variables" in left sidebar
```

### Step 3: Add Each Variable
```
For each variable:
1. Click "Add New" button
2. Enter Variable Name (from above)
3. Enter Variable Value (from above)
4. Select "Production" (or all environments)
5. Click "Save"
```

### Step 4: Redeploy
```
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete (2-3 minutes)
```

---

## 🎯 QUICK REFERENCE TABLE

| # | Variable Name | Variable Value |
|---|---|---|
| 1 | AMAZON_ACCESS_KEY | your_access_key_here |
| 2 | AMAZON_SECRET_KEY | your_secret_key_here |
| 3 | AMAZON_PARTNER_TAG | 4340c5-21 |
| 4 | AMAZON_REGION | IN |
| 5 | TELEGRAM_BOT_TOKEN | 7731512306:AAHEhFMEydtCZajLx0g8HT_iR8iuN2SpfzE |
| 6 | TELEGRAM_CHANNEL_ID | @amazondealsmake |
| 7 | SUPABASE_URL | https://dbnldknxqqsysfwlswtb.supabase.co |
| 8 | SUPABASE_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| 9 | MIN_DISCOUNT_PERCENTAGE | 85 |
| 10 | CRON_SCHEDULE | */2 * * * * |
| 11 | MAX_PRODUCTS_PER_RUN | 10 |
| 12 | PORT | 3000 |
| 13 | NODE_ENV | production |

---

## ✅ VERIFICATION CHECKLIST

After adding all variables:

- [ ] All 8 required variables added
- [ ] All variable values are correct
- [ ] No typos in variable names
- [ ] No extra spaces in values
- [ ] Redeployed successfully
- [ ] Deployment shows "Ready"
- [ ] Health endpoint responds
- [ ] Logs show no errors

---

## 🔐 SECURITY NOTES

✅ **Your `.env` file is secure**
- Not committed to GitHub
- In `.gitignore`
- Only on your local machine

✅ **Vercel environment variables are secure**
- Encrypted at rest
- Encrypted in transit
- Only accessible to your project
- Not visible in logs

✅ **Best practices**
- Never share `.env` file
- Never commit `.env` to Git
- Rotate credentials regularly
- Use strong secrets

---

## 📊 VARIABLE SUMMARY

### Required (8 variables)
```
✅ AMAZON_ACCESS_KEY
✅ AMAZON_SECRET_KEY
✅ AMAZON_PARTNER_TAG
✅ AMAZON_REGION
✅ TELEGRAM_BOT_TOKEN
✅ TELEGRAM_CHANNEL_ID
✅ SUPABASE_URL
✅ SUPABASE_KEY
```

### Optional (5 variables)
```
⚙️ MIN_DISCOUNT_PERCENTAGE
⚙️ CRON_SCHEDULE
⚙️ MAX_PRODUCTS_PER_RUN
⚙️ PORT
⚙️ NODE_ENV
```

**Total**: 13 variables

---

## 🚀 DEPLOYMENT FLOW

```
1. Add Variables to Vercel
   ↓
2. Redeploy Project
   ↓
3. Wait 2-3 minutes
   ↓
4. Check Health Endpoint
   ↓
5. Verify Logs
   ↓
6. Test Telegram Integration
   ↓
7. ✅ Bot Live!
```

---

## 📞 TROUBLESHOOTING

### Variables Not Working
1. Check variable names (case-sensitive)
2. Check variable values (no extra spaces)
3. Check all required variables are added
4. Redeploy after adding variables

### Bot Not Starting
1. Check Vercel logs
2. Verify all required variables
3. Check variable values are correct
4. Check Supabase connection

### Telegram Not Posting
1. Verify TELEGRAM_BOT_TOKEN
2. Verify TELEGRAM_CHANNEL_ID
3. Verify bot is admin in channel
4. Check Vercel logs

---

## ✨ NEXT STEPS

### Immediate (Now)
1. ✅ Copy environment variables
2. ⏳ Open Vercel dashboard
3. ⏳ Add variables to Vercel

### Short Term (5 minutes)
1. ⏳ Add all 8 required variables
2. ⏳ Add optional variables
3. ⏳ Redeploy project

### Verification (10 minutes)
1. ⏳ Check health endpoint
2. ⏳ Verify logs
3. ⏳ Test Telegram
4. ✅ Bot live!

---

## 🎉 YOU'RE READY!

All environment variables are extracted and ready to copy to Vercel!

**Next Action**: 
1. Open Vercel dashboard
2. Go to Environment Variables
3. Add each variable from the table above
4. Redeploy

**Time**: ~5 minutes  
**Difficulty**: Easy  

---

**Let's deploy!** 🚀


