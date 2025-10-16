# 🚀 Supabase MCP Setup Guide

## What is MCP?

**MCP (Model Context Protocol)** allows the bot to access Supabase automatically without you needing to manually copy credentials. This makes setup much easier!

---

## 🎯 Benefits of Using MCP

✅ **No manual credential copying** - Just provide project reference  
✅ **Automatic authentication** - MCP handles it for you  
✅ **More secure** - Credentials never stored in .env  
✅ **Easier setup** - One line instead of two  
✅ **Future-proof** - Credentials auto-update if changed  

---

## 📋 Available Supabase Projects

You currently have access to these Supabase projects:

### 1. cell_project
- **ID:** `dbnldknxqqsysfwlswtb`
- **Region:** ap-southeast-1 (Singapore)
- **Status:** ACTIVE_HEALTHY
- **URL:** https://app.supabase.com/project/dbnldknxqqsysfwlswtb

### 2. augcell-subscriptions
- **ID:** `ysmpwkovtbatonurahpt`
- **Region:** us-east-1 (US East)
- **Status:** ACTIVE_HEALTHY
- **URL:** https://app.supabase.com/project/ysmpwkovtbatonurahpt

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Choose a Project

Pick one of the projects above. We recommend `cell_project` for this bot.

### Step 2: Add to .env

Edit your `.env` file and add:

```env
SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb
```

**That's it!** No URL or KEY needed.

### Step 3: Create Database Table

1. Go to your project's SQL Editor:
   - For cell_project: https://app.supabase.com/project/dbnldknxqqsysfwlswtb/sql

2. Click "New Query"

3. Copy and paste the SQL from `supabase-setup.sql`

4. Click "Run" (or press Ctrl+Enter)

5. Verify you see: "✅ Database setup complete!"

---

## 🔄 How It Works

### Traditional Method (Manual)
```env
SUPABASE_URL=https://dbnldknxqqsysfwlswtb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibmxka254cXFzeXNmd2xzd3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3NjQ4MDgsImV4cCI6MjA0MzM0MDgwOH0.xxx
```
❌ Long and error-prone  
❌ Need to copy from dashboard  
❌ Credentials can expire  

### MCP Method (Automatic)
```env
SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb
```
✅ Short and simple  
✅ No copying needed  
✅ Always up-to-date  

---

## 🛠️ Setup Helper Script

Run this command to see setup instructions:

```bash
npm run setup
```

This will:
- Show your available Supabase projects
- Provide setup instructions
- Check your current configuration
- Guide you through the process

---

## 📊 Verification

After setup, verify everything is working:

### 1. Check Configuration
```bash
npm run setup
```

You should see:
```
✅ SUPABASE_PROJECT_REF is set: dbnldknxqqsysfwlswtb
   Using MCP mode (automatic credentials)
```

### 2. Start the Bot
```bash
npm start
```

You should see:
```
✅ Using Supabase MCP mode (automatic credentials)
   Project: dbnldknxqqsysfwlswtb
✅ Database initialized
```

### 3. Test Database
The bot will automatically:
- Connect to Supabase via MCP
- Check if table exists
- Start tracking deals

---

## 🔧 Troubleshooting

### "Supabase configuration missing"

**Problem:** No SUPABASE_PROJECT_REF in .env

**Solution:**
```bash
# Edit .env and add:
SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb
```

### "Table does not exist"

**Problem:** Database table not created

**Solution:**
1. Go to: https://app.supabase.com/project/dbnldknxqqsysfwlswtb/sql
2. Run the SQL from `supabase-setup.sql`

### "MCP not working"

**Problem:** MCP might not be available in your environment

**Solution:** Use manual credentials instead:
```env
# Comment out or remove:
# SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb

# Add manual credentials:
SUPABASE_URL=https://dbnldknxqqsysfwlswtb.supabase.co
SUPABASE_KEY=your_anon_key_here
```

Get credentials from:
https://app.supabase.com/project/dbnldknxqqsysfwlswtb/settings/api

---

## 🎯 Which Project Should I Use?

### Use `cell_project` if:
- ✅ You want to use the Singapore region (faster for Asia)
- ✅ You don't have other data in it
- ✅ You want a dedicated project for this bot

### Use `augcell-subscriptions` if:
- ✅ You want to use the US region (faster for Americas/Europe)
- ✅ You want to consolidate with other data
- ✅ You're already using it for other purposes

### Create a new project if:
- ✅ You want complete isolation
- ✅ You want a specific region
- ✅ You want to keep things organized

---

## 🆕 Creating a New Project (Optional)

If you want a dedicated project for this bot:

### 1. Go to Supabase Dashboard
https://app.supabase.com/

### 2. Click "New Project"

### 3. Fill in Details
- **Name:** amazon-deals-bot
- **Database Password:** (generate strong password)
- **Region:** Choose closest to you
- **Pricing Plan:** Free

### 4. Wait for Setup
Takes 2-3 minutes

### 5. Get Project Reference
From the URL: `https://app.supabase.com/project/[PROJECT_REF]/...`

### 6. Add to .env
```env
SUPABASE_PROJECT_REF=[PROJECT_REF]
```

### 7. Create Table
Run `supabase-setup.sql` in SQL Editor

---

## 📚 Additional Resources

### Supabase Dashboard
- cell_project: https://app.supabase.com/project/dbnldknxqqsysfwlswtb
- augcell-subscriptions: https://app.supabase.com/project/ysmpwkovtbatonurahpt

### SQL Editor
- cell_project: https://app.supabase.com/project/dbnldknxqqsysfwlswtb/sql
- augcell-subscriptions: https://app.supabase.com/project/ysmpwkovtbatonurahpt/sql

### Table Editor
- cell_project: https://app.supabase.com/project/dbnldknxqqsysfwlswtb/editor
- augcell-subscriptions: https://app.supabase.com/project/ysmpwkovtbatonurahpt/editor

### API Settings (if you need manual credentials)
- cell_project: https://app.supabase.com/project/dbnldknxqqsysfwlswtb/settings/api
- augcell-subscriptions: https://app.supabase.com/project/ysmpwkovtbatonurahpt/settings/api

---

## ✅ Final Checklist

- [ ] Chose a Supabase project
- [ ] Added `SUPABASE_PROJECT_REF` to .env
- [ ] Ran SQL from `supabase-setup.sql`
- [ ] Verified table exists in Table Editor
- [ ] Ran `npm run setup` to verify
- [ ] Started bot with `npm start`
- [ ] Saw "Using Supabase MCP mode" message
- [ ] Bot connected successfully

---

## 🎉 Success!

If you see this when starting the bot:

```
✅ Using Supabase MCP mode (automatic credentials)
   Project: dbnldknxqqsysfwlswtb
✅ Database initialized
✅ Telegram bot initialized
✅ Bot is now running!
```

**Congratulations!** Your bot is using Supabase via MCP successfully!

---

## 💡 Pro Tips

1. **Use MCP when possible** - It's easier and more secure
2. **Keep project reference handy** - Save it in a password manager
3. **Monitor database usage** - Check Supabase dashboard weekly
4. **Backup your data** - Export table data monthly
5. **Use Table Editor** - View posted deals in real-time

---

## 🆘 Need Help?

1. Run `npm run setup` for guided instructions
2. Check `README.md` for full documentation
3. Review `SETUP_GUIDE.md` for detailed steps
4. Verify credentials in Supabase dashboard

---

**MCP makes Supabase setup a breeze! 🚀**

