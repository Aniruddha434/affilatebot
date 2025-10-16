# ✅ Installation Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## 📦 Phase 1: Prerequisites

- [ ] **Node.js installed** (v16 or higher)
  ```bash
  node --version
  npm --version
  ```
  Expected: v16.x.x or higher

- [ ] **Git installed** (optional, for version control)
  ```bash
  git --version
  ```

- [ ] **Text editor ready** (VS Code, Notepad++, etc.)

---

## 🛒 Phase 2: Amazon Setup

- [ ] **Amazon Associates account created**
  - URL: https://affiliate-program.amazon.in/
  - Account status: Approved ✅

- [ ] **Product Advertising API access granted**
  - URL: https://webservices.amazon.in/paapi5/documentation/
  - Status: Approved ✅
  - Note: Requires 3+ sales in 180 days

- [ ] **Credentials obtained:**
  - [ ] Access Key (starts with `AKIA...`)
  - [ ] Secret Key (long alphanumeric string)
  - [ ] Partner Tag (format: `yourtag-21`)
  - [ ] Region confirmed (e.g., `IN`, `US`, `UK`)

- [ ] **Credentials tested** (will verify after bot setup)

---

## 📱 Phase 3: Telegram Setup

- [ ] **Bot created via @BotFather**
  - Bot name: ________________
  - Bot username: ________________
  - Bot token saved: ✅

- [ ] **Channel created**
  - Channel name: ________________
  - Channel type: ☐ Public ☐ Private
  - Channel username (if public): @________________
  - Channel ID (if private): -100________________

- [ ] **Bot added to channel as administrator**
  - Permission: "Post Messages" ✅

- [ ] **Channel ID verified**
  - Format correct: ✅
  - Bot can post: (will verify later)

---

## 🗄️ Phase 4: Supabase Setup

- [ ] **Supabase account created**
  - URL: https://supabase.com/
  - Email: ________________

- [ ] **Project created**
  - Project name: ________________
  - Region: ________________
  - Status: Active ✅

- [ ] **Credentials obtained:**
  - [ ] Project URL (format: `https://xxx.supabase.co`)
  - [ ] Anon/Public key (starts with `eyJ...`)

- [ ] **Database table created**
  - [ ] Ran `supabase-setup.sql` in SQL Editor
  - [ ] Table `posted_deals` exists
  - [ ] Indexes created
  - [ ] Success message received: ✅

---

## 💻 Phase 5: Bot Installation

- [ ] **Project files downloaded/cloned**
  - Location: `c:\Users\aniru\OneDrive\Desktop\affilate bot`

- [ ] **Dependencies installed**
  ```bash
  npm install
  ```
  - No errors: ✅
  - `node_modules` folder created: ✅

- [ ] **Environment file created**
  ```bash
  copy .env.example .env
  ```
  - `.env` file exists: ✅

- [ ] **All credentials added to `.env`:**
  - [ ] AMAZON_ACCESS_KEY
  - [ ] AMAZON_SECRET_KEY
  - [ ] AMAZON_PARTNER_TAG
  - [ ] AMAZON_REGION
  - [ ] TELEGRAM_BOT_TOKEN
  - [ ] TELEGRAM_CHANNEL_ID
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_KEY

- [ ] **Configuration verified:**
  - [ ] No placeholder values (like `your_key_here`)
  - [ ] No extra spaces or quotes
  - [ ] All values on single lines

---

## 🧪 Phase 6: Testing

- [ ] **Bot starts without errors**
  ```bash
  npm start
  ```
  Expected output:
  ```
  ✅ All required environment variables are set
  ✅ Database initialized
  ✅ Telegram bot initialized
  ✅ Bot is now running!
  ```

- [ ] **Startup notification received in Telegram**
  - Message received: ✅
  - Message formatted correctly: ✅

- [ ] **Health check works**
  ```bash
  curl http://localhost:3000/health
  ```
  - Returns JSON: ✅
  - Status: "healthy": ✅

- [ ] **Manual trigger works** (optional)
  ```bash
  curl -X POST http://localhost:3000/trigger
  ```
  - Job triggered: ✅
  - Check logs for activity: ✅

- [ ] **First deal posted** (or "No products found" message)
  - Deal appeared in channel: ✅
  - Image displayed: ✅
  - Link works: ✅
  - Formatting correct: ✅

---

## 🚀 Phase 7: Production Deployment

### Option A: Local/Windows

- [ ] **Bot running in terminal**
  - Command: `npm start`
  - No errors: ✅

- [ ] **PM2 installed** (optional, for background running)
  ```bash
  npm install -g pm2
  ```

- [ ] **Bot started with PM2**
  ```bash
  pm2 start src/index.js --name amazon-bot
  pm2 save
  ```
  - Status: online ✅

### Option B: VPS/Linux Server

- [ ] **Server access confirmed**
  - SSH working: ✅
  - Node.js installed: ✅

- [ ] **Project deployed**
  - Files uploaded: ✅
  - Dependencies installed: ✅
  - `.env` configured: ✅

- [ ] **PM2 configured**
  - Bot running: ✅
  - Auto-start enabled: ✅
  - Logs accessible: ✅

### Option C: Heroku

- [ ] **Heroku CLI installed**
- [ ] **App created**
- [ ] **Environment variables set**
- [ ] **Deployed successfully**
- [ ] **Logs show bot running**

---

## 📊 Phase 8: Monitoring

- [ ] **First 24 hours monitored**
  - No errors: ✅
  - Deals posted: _____ (count)
  - All deals unique: ✅

- [ ] **Database checked**
  ```sql
  SELECT COUNT(*) FROM posted_deals;
  ```
  - Count matches posted deals: ✅

- [ ] **Logs reviewed**
  - No critical errors: ✅
  - API calls successful: ✅
  - Telegram posts successful: ✅

- [ ] **Performance verified**
  - Bot runs on schedule: ✅
  - No duplicate posts: ✅
  - Memory usage normal: ✅

---

## 🔧 Phase 9: Optimization (Optional)

- [ ] **Settings adjusted:**
  - [ ] `MIN_DISCOUNT_PERCENTAGE` optimized
  - [ ] `MAX_PRODUCTS_PER_RUN` adjusted
  - [ ] `CRON_SCHEDULE` customized

- [ ] **Search keywords customized**
  - Edited `src/scheduler.js`: ✅
  - Keywords relevant to niche: ✅

- [ ] **Message format customized** (optional)
  - Edited `src/modules/telegramBot.js`: ✅
  - Tested new format: ✅

---

## 🔒 Phase 10: Security

- [ ] **`.env` file secured**
  - Not committed to Git: ✅
  - Proper file permissions: ✅

- [ ] **Credentials backed up securely**
  - Stored in password manager: ✅
  - Recovery plan in place: ✅

- [ ] **Git repository configured** (if using)
  - `.gitignore` includes `.env`: ✅
  - No credentials in commit history: ✅

---

## 📈 Phase 11: Growth

- [ ] **Channel promoted**
  - Social media posts: ☐
  - Friends/family invited: ☐
  - SEO optimized: ☐

- [ ] **Analytics tracked**
  - Subscriber count: _____
  - Daily active users: _____
  - Click-through rate: _____%

- [ ] **Feedback collected**
  - User comments reviewed: ☐
  - Improvements identified: ☐

---

## 🆘 Troubleshooting Completed

If you encountered issues, mark what you fixed:

- [ ] Environment variables issue → Fixed
- [ ] Amazon API error → Fixed
- [ ] Telegram posting error → Fixed
- [ ] Database connection error → Fixed
- [ ] Scheduling issue → Fixed
- [ ] Other: ________________ → Fixed

---

## 📝 Final Verification

Run through this final checklist:

- [ ] Bot is running continuously
- [ ] Deals are posting automatically every 2 hours
- [ ] No duplicate deals are being posted
- [ ] All deals meet minimum discount requirement
- [ ] Telegram messages are formatted correctly
- [ ] Images are displaying properly
- [ ] Affiliate links are working
- [ ] Database is tracking posted deals
- [ ] Logs show no critical errors
- [ ] You understand how to stop/restart the bot
- [ ] You know how to check logs
- [ ] You have a backup of your `.env` file

---

## 🎉 Success Criteria

Your bot is successfully deployed if:

✅ Bot runs for 24 hours without errors  
✅ At least 1 deal posted successfully  
✅ No duplicate deals posted  
✅ Telegram channel receives formatted messages  
✅ Database contains posted deal records  
✅ You can stop and restart the bot  
✅ Logs are accessible and readable  

---

## 📞 Next Steps

After completing this checklist:

1. **Monitor for 1 week** - Check daily for any issues
2. **Optimize settings** - Adjust based on results
3. **Grow your channel** - Promote to get subscribers
4. **Track earnings** - Monitor Amazon affiliate dashboard
5. **Scale up** - Consider multiple channels/regions

---

## 📚 Documentation Reference

- [ ] Read `README.md` - Overview and features
- [ ] Read `SETUP_GUIDE.md` - Detailed setup instructions
- [ ] Read `QUICK_REFERENCE.md` - Common commands
- [ ] Read `ARCHITECTURE.md` - System design
- [ ] Bookmark for future reference

---

**Congratulations! Your Amazon Affiliate Bot is now live! 🎊**

Date completed: _______________  
Time to complete: _______________  
First deal posted at: _______________  

---

## 💡 Pro Tips

1. Keep this checklist for future reference
2. Document any custom changes you make
3. Set calendar reminders to check bot weekly
4. Join Amazon Associates forums for tips
5. Network with other affiliate marketers
6. Stay updated on Amazon API changes
7. Backup your database monthly
8. Review and optimize quarterly

---

**Need help? Refer to SETUP_GUIDE.md or README.md** 📖

