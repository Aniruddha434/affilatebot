# 🚀 START HERE - Quick Setup in 10 Minutes

Welcome! This guide will get your Amazon Affiliate Bot running in **10 minutes or less**.

---

## ⚡ Super Quick Setup (For Experienced Users)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
copy .env.example .env

# 3. Run Supabase setup helper
npm run setup

# 4. Edit .env with your credentials (see below)
# Note: Supabase uses MCP - no manual credentials needed!

# 5. Run database setup SQL in Supabase dashboard

# 6. Start the bot
npm start
```

**That's it!** Your bot should now be running.

---

## 📋 What You Need (Gather These First)

Before starting, collect these credentials:

### ✅ Amazon Credentials
- [ ] Access Key (from Amazon PA-API)
- [ ] Secret Key (from Amazon PA-API)
- [ ] Partner Tag (your Associate ID, format: `yourtag-21`)

**Get them here:** https://affiliate-program.amazon.in/

### ✅ Telegram Credentials
- [ ] Bot Token (from @BotFather)
- [ ] Channel ID (format: `@channelname` or `-1001234567890`)

**Create bot here:** https://t.me/botfather

### ✅ Supabase Setup (Automatic via MCP!)
- [ ] Project Reference (e.g., `dbnldknxqqsysfwlswtb`)

**Good news!** Supabase credentials are handled automatically via MCP.
Just run `npm run setup` to see your available projects!

---

## 🎯 Step-by-Step Setup

### Step 1: Install Node.js (if not installed)

**Windows:**
1. Download from https://nodejs.org/
2. Run installer (choose LTS version)
3. Verify: Open PowerShell and run `node --version`

**Already have Node.js?** Skip to Step 2.

---

### Step 2: Install Dependencies

Open PowerShell in the project folder and run:

```bash
npm install
```

**Expected output:**
```
added 150 packages in 30s
```

**If you see errors:** Make sure you're in the correct folder.

---

### Step 3: Configure Environment Variables

1. **Copy the template:**
   ```bash
   copy .env.example .env
   ```

2. **Open `.env` in a text editor** (Notepad, VS Code, etc.)

3. **Fill in your credentials:**

```env
# Amazon Credentials
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE          # ← Your Amazon access key
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG...      # ← Your Amazon secret key
AMAZON_PARTNER_TAG=yourtag-21                   # ← Your Associate ID
AMAZON_REGION=IN                                # ← Your region (IN, US, UK, etc.)

# Telegram Credentials
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHI...      # ← Your bot token from @BotFather
TELEGRAM_CHANNEL_ID=@amazingdeals               # ← Your channel ID

# Supabase Configuration (MCP - Automatic!)
SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb       # ← Your project reference (run: npm run setup)

# Bot Settings (optional - defaults are fine)
MIN_DISCOUNT_PERCENTAGE=50
CRON_SCHEDULE=0 */2 * * *
MAX_PRODUCTS_PER_RUN=10
PORT=3000
NODE_ENV=production
```

4. **Save the file**

**Important:** 
- Remove the example values
- No spaces around `=` sign
- No quotes around values
- Keep it on single lines

---

### Step 4: Setup Supabase Database (Easy with MCP!)

1. **Run the setup helper:**
   ```bash
   npm run setup
   ```
   This will show you available Supabase projects and setup instructions.

2. **Choose a project** (or use existing):
   - Option 1: Use `cell_project` (ID: dbnldknxqqsysfwlswtb)
   - Option 2: Use `augcell-subscriptions` (ID: ysmpwkovtbatonurahpt)
   - Option 3: Create a new project

3. **Add to your `.env` file:**
   ```env
   SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb
   ```
   (No URL or KEY needed - MCP handles it automatically!)

4. **Create the database table:**
   - Go to: https://app.supabase.com/project/dbnldknxqqsysfwlswtb/sql
   - Click "New Query"
   - Copy and paste contents of `supabase-setup.sql`
   - Click "Run"

5. **Verify:** You should see "✅ Database setup complete!"

---

### Step 5: Start the Bot

```bash
npm start
```

**Expected output:**
```
═══════════════════════════════════════════════════
🤖  Amazon Affiliate Telegram Bot
═══════════════════════════════════════════════════

ℹ️  INFO: Validating configuration...
✅ SUCCESS: All required environment variables are set
ℹ️  INFO: Initializing modules...
✅ SUCCESS: Database initialized
✅ SUCCESS: Telegram bot initialized
📊 INFO: Total deals posted so far: 0

═══════════════════════════════════════════════════
✅ Bot is now running!
📅 Schedule: Every 2 hours
💰 Minimum discount: 50%
📢 Channel: @amazingdeals
═══════════════════════════════════════════════════
```

**If you see this, congratulations! Your bot is running! 🎉**

---

### Step 6: Verify It's Working

1. **Check Telegram:** You should receive a startup notification in your channel

2. **Wait for first run:** The bot will run immediately, then every 2 hours

3. **Check logs:** Watch the console for activity

4. **Manual trigger (optional):** Open a new PowerShell window and run:
   ```bash
   curl -X POST http://localhost:3000/trigger
   ```

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and filled
- [ ] Supabase table created
- [ ] Bot started without errors
- [ ] Startup notification received in Telegram
- [ ] Bot is running in console

**All checked?** You're done! 🎊

---

## 🆘 Troubleshooting

### "Missing required environment variables"
→ Check your `.env` file. Make sure all values are filled in.

### "Telegram API error"
→ Verify your bot token and channel ID. Make sure bot is admin in channel.

### "Amazon API error"
→ Check your Amazon credentials. Ensure PA-API access is approved.

### "Database error"
→ Verify Supabase URL and key. Make sure you ran the SQL setup script.

### "No products found"
→ This is normal! Amazon might not have deals at the moment. The bot will keep trying.

---

## 🎯 What Happens Next?

1. **Bot runs every 2 hours** automatically
2. **Searches Amazon** for products with 50%+ discount
3. **Posts to Telegram** with beautiful formatting
4. **Tracks in database** to prevent duplicates
5. **Keeps running 24/7** until you stop it

---

## 🛑 How to Stop the Bot

Press `Ctrl+C` in the PowerShell window where the bot is running.

---

## 🔄 How to Restart the Bot

```bash
npm start
```

---

## 📚 Next Steps

Now that your bot is running:

1. **Monitor for 24 hours** - Check logs and Telegram channel
2. **Read QUICK_REFERENCE.md** - Learn common commands
3. **Customize settings** - Adjust discount percentage, schedule, etc.
4. **Promote your channel** - Get subscribers!
5. **Track earnings** - Monitor Amazon Associates dashboard

---

## 📖 Full Documentation

For detailed information, read these files:

- **README.md** - Complete documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **QUICK_REFERENCE.md** - Common commands and tips
- **ARCHITECTURE.md** - How the bot works
- **INSTALLATION_CHECKLIST.md** - Detailed checklist

---

## 💡 Pro Tips

1. **Keep the PowerShell window open** - The bot runs in the foreground
2. **Check logs regularly** - Watch for errors or issues
3. **Start with default settings** - Optimize later based on results
4. **Test with manual trigger** - Use the `/trigger` endpoint to test
5. **Join Amazon forums** - Learn from other affiliates

---

## 🚀 Running in Background (Optional)

To keep the bot running even after closing PowerShell:

```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start src/index.js --name amazon-bot

# Check status
pm2 status

# View logs
pm2 logs amazon-bot

# Stop bot
pm2 stop amazon-bot

# Restart bot
pm2 restart amazon-bot
```

---

## 🎉 You're All Set!

Your Amazon Affiliate Bot is now:
- ✅ Installed
- ✅ Configured
- ✅ Running
- ✅ Posting deals automatically

**Congratulations!** 🎊

Now sit back and let the bot do the work for you!

---

## 📞 Need More Help?

1. Check **SETUP_GUIDE.md** for detailed instructions
2. Review **QUICK_REFERENCE.md** for common commands
3. Read **README.md** for troubleshooting
4. Check the logs for error messages

---

## ⏱️ Time Spent

- Reading this guide: 2 minutes
- Gathering credentials: 3 minutes
- Installing & configuring: 3 minutes
- Testing: 2 minutes

**Total: ~10 minutes** ⚡

---

**Happy deal hunting! 🎯**

*Made with ❤️ for affiliate marketers*

