# 🚀 Complete Setup Guide - Amazon Affiliate Telegram Bot

This guide will walk you through setting up the bot from scratch, step by step.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Amazon Associates Setup](#amazon-associates-setup)
3. [Telegram Bot Setup](#telegram-bot-setup)
4. [Supabase Setup](#supabase-setup)
5. [Bot Installation](#bot-installation)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## 1️⃣ Prerequisites

### Install Node.js

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer (choose LTS version)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**Mac/Linux:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

---

## 2️⃣ Amazon Associates Setup

### Step 1: Join Amazon Associates Program

1. Go to [Amazon Associates](https://affiliate-program.amazon.in/)
2. Click "Join Now for Free"
3. Fill in your details:
   - Website/Mobile app (you can use your social media)
   - Preferred store ID (this becomes your Partner Tag)
4. Complete the application

### Step 2: Get Product Advertising API Access

1. After approval, go to [Product Advertising API](https://webservices.amazon.in/paapi5/documentation/)
2. Click "Sign Up for PA-API"
3. Accept terms and conditions
4. **Important**: You need at least 3 qualified sales in 180 days to maintain access

### Step 3: Get Your Credentials

1. Go to [Associates Central](https://affiliate-program.amazon.in/)
2. Navigate to "Tools" → "Product Advertising API"
3. Click "Add Credentials" or "Manage Credentials"
4. Copy these values:
   - **Access Key** (looks like: `AKIAIOSFODNN7EXAMPLE`)
   - **Secret Key** (looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - **Partner Tag** (looks like: `yourtag-21`)

**Save these securely - you'll need them later!**

---

## 3️⃣ Telegram Bot Setup

### Step 1: Create a Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Choose a name (e.g., "My Deals Bot")
4. Choose a username (must end in 'bot', e.g., "mydeals_bot")
5. **Copy the bot token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Create a Channel

1. In Telegram, create a new channel:
   - Click "New Channel"
   - Choose a name (e.g., "Amazon Mega Deals")
   - Make it Public or Private
   - If public, choose a username (e.g., `@amazingdeals`)

2. Add your bot as administrator:
   - Go to channel settings
   - Click "Administrators"
   - Click "Add Administrator"
   - Search for your bot username
   - Give it "Post Messages" permission

### Step 3: Get Channel ID

**For Public Channels:**
- Your channel ID is `@channelname` (e.g., `@amazingdeals`)

**For Private Channels:**
1. Forward any message from the channel to [@userinfobot](https://t.me/userinfobot)
2. It will show the channel ID (looks like: `-1001234567890`)

---

## 4️⃣ Supabase Setup

### Step 1: Create Account

1. Go to [supabase.com](https://supabase.com/)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### Step 2: Create Project

1. Click "New Project"
2. Choose organization (or create one)
3. Fill in details:
   - **Name**: amazon-deals-bot
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### Step 3: Get Credentials

1. In your project dashboard, click "Settings" (gear icon)
2. Go to "API" section
3. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 4: Create Database Table

1. Click "SQL Editor" in sidebar
2. Click "New Query"
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run" or press `Ctrl+Enter`
5. You should see "✅ Database setup complete!"

**Verify:**
- Go to "Table Editor"
- You should see `posted_deals` table

---

## 5️⃣ Bot Installation

### Step 1: Download/Clone Project

```bash
cd "c:\Users\aniru\OneDrive\Desktop\affilate bot"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express
- axios
- dotenv
- node-cron
- @supabase/supabase-js
- node-telegram-bot-api
- aws4
- crypto-js

### Step 3: Configure Environment

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` in a text editor

3. Fill in your credentials:

```env
# Amazon Credentials (from Step 2)
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AMAZON_PARTNER_TAG=yourtag-21
AMAZON_REGION=IN

# Telegram Credentials (from Step 3)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=@amazingdeals

# Supabase Credentials (from Step 4)
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Bot Settings (optional - defaults are fine)
MIN_DISCOUNT_PERCENTAGE=50
CRON_SCHEDULE=0 */2 * * *
MAX_PRODUCTS_PER_RUN=10
PORT=3000
NODE_ENV=production
```

4. Save the file

---

## 6️⃣ Testing

### Test 1: Verify Configuration

```bash
npm start
```

You should see:
```
✅ All required environment variables are set
✅ Database initialized
✅ Telegram bot initialized
✅ Bot is now running!
```

### Test 2: Check Telegram

- Your channel should receive a startup notification
- If not, check bot permissions and channel ID

### Test 3: Manual Trigger (Optional)

Open another terminal and run:

```bash
curl -X POST http://localhost:3000/trigger
```

This will run the job immediately for testing.

### Test 4: Check Logs

Watch the console for:
- ✅ Success messages (green)
- ℹ️ Info messages (blue)
- ⚠️ Warnings (yellow)
- ❌ Errors (red)

---

## 7️⃣ Deployment

### Option A: Run Locally (Windows)

**Keep it running:**
```bash
npm start
```

**Run in background (using PM2):**
```bash
npm install -g pm2
pm2 start src/index.js --name amazon-bot
pm2 save
pm2 startup
```

### Option B: Deploy to VPS (Linux)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your project
git clone <your-repo-url>
cd affilate-bot

# Install dependencies
npm install --production

# Create .env file
nano .env
# (paste your credentials)

# Install PM2
sudo npm install -g pm2

# Start bot
pm2 start src/index.js --name amazon-bot
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs amazon-bot
```

### Option C: Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-bot-name

# Set environment variables
heroku config:set AMAZON_ACCESS_KEY=your_key
heroku config:set AMAZON_SECRET_KEY=your_secret
heroku config:set AMAZON_PARTNER_TAG=your_tag
heroku config:set AMAZON_REGION=IN
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set TELEGRAM_CHANNEL_ID=@your_channel
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key

# Create Procfile
echo "web: node src/index.js" > Procfile

# Deploy
git add .
git commit -m "Initial deployment"
git push heroku main

# Check logs
heroku logs --tail
```

---

## ✅ Success Checklist

- [ ] Node.js installed and verified
- [ ] Amazon Associates account approved
- [ ] Amazon PA-API credentials obtained
- [ ] Telegram bot created
- [ ] Telegram channel created
- [ ] Bot added as channel admin
- [ ] Supabase project created
- [ ] Database table created
- [ ] All credentials added to `.env`
- [ ] Dependencies installed (`npm install`)
- [ ] Bot started successfully
- [ ] Startup notification received in Telegram
- [ ] First deal posted (or manual trigger tested)

---

## 🆘 Common Issues

### "Missing required environment variables"
- Check `.env` file exists
- Verify all variables are filled in
- No spaces around `=` sign
- No quotes around values

### "Telegram API error"
- Verify bot token is correct
- Check bot is admin in channel
- Verify channel ID format
- Try sending a test message manually

### "Amazon API error"
- Verify credentials are correct
- Check if PA-API access is approved
- Ensure you have 3+ sales (Amazon requirement)
- Check API rate limits

### "Database error"
- Verify Supabase URL and key
- Check if table exists
- Run `supabase-setup.sql` again
- Check Supabase dashboard for errors

### "No products found"
- Amazon might not have deals at the moment
- Try lowering `MIN_DISCOUNT_PERCENTAGE`
- Try different search keywords
- Check your region setting

---

## 📞 Need Help?

1. Check the main [README.md](README.md)
2. Review error logs carefully
3. Verify all credentials are correct
4. Test each component individually
5. Check service status (Amazon, Telegram, Supabase)

---

## 🎉 You're All Set!

Your bot is now running and will automatically post deals every 2 hours!

**Next Steps:**
- Monitor the logs for the first few runs
- Adjust `MIN_DISCOUNT_PERCENTAGE` if needed
- Customize search keywords in `src/scheduler.js`
- Share your channel and grow your audience!

Happy deal hunting! 🎯

