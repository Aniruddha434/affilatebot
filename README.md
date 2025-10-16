# 🤖 Amazon Affiliate Telegram Bot

A production-ready automated bot that finds Amazon products with huge discounts (50-90% OFF) and posts them to your Telegram channel every 2 hours.

## ✨ Features

- 🔍 **Automatic Product Discovery** - Uses Amazon Product Advertising API to find trending deals
- 💰 **Smart Filtering** - Only posts products with 50%+ discount
- 📱 **Telegram Integration** - Beautiful formatted messages with product images
- 🗄️ **Duplicate Prevention** - Uses Supabase to track posted deals
- ⏰ **Scheduled Posting** - Runs automatically every 2 hours
- 🔄 **Retry Logic** - Handles API failures with exponential backoff
- 📊 **Comprehensive Logging** - Track all actions and errors
- 🛡️ **Error Handling** - Graceful error recovery and notifications

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Amazon Product Advertising API** credentials:
   - Access Key
   - Secret Key
   - Partner Tag (Associate ID)
   - [Sign up here](https://affiliate-program.amazon.in/)
3. **Telegram Bot Token**:
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Get your channel ID (use [@userinfobot](https://t.me/userinfobot))
4. **Supabase Account** (Easy with MCP!):
   - [Sign up for free](https://supabase.com/)
   - **Good news:** Credentials are handled automatically via MCP
   - Just run `npm run setup` to see your available projects

## 🚀 Quick Start

### 1. Clone or Download

```bash
cd "c:\Users\aniru\OneDrive\Desktop\affilate bot"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase (Automatic with MCP!)

Run the setup helper to see your available projects:

```bash
npm run setup
```

This will show you which Supabase projects you can use and provide setup instructions.

### 4. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` with your credentials:

```env
# Amazon Product Advertising API Credentials
AMAZON_ACCESS_KEY=your_access_key_here
AMAZON_SECRET_KEY=your_secret_key_here
AMAZON_PARTNER_TAG=yourtag-21
AMAZON_REGION=IN

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=@your_channel_id

# Supabase Configuration (MCP - Automatic!)
# Just add your project reference - no URL or KEY needed!
SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb

# Bot Configuration
MIN_DISCOUNT_PERCENTAGE=50
CRON_SCHEDULE=0 */2 * * *
MAX_PRODUCTS_PER_RUN=10

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 4. Setup Supabase Database

Go to your Supabase project dashboard → SQL Editor and run:

```sql
CREATE TABLE posted_deals (
  id SERIAL PRIMARY KEY,
  asin VARCHAR(20) UNIQUE NOT NULL,
  title TEXT,
  discount_percentage INTEGER,
  posted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_asin ON posted_deals(asin);
CREATE INDEX idx_posted_at ON posted_deals(posted_at);
```

### 5. Setup Telegram Bot

1. Create a bot with [@BotFather](https://t.me/botfather):
   - Send `/newbot`
   - Choose a name and username
   - Copy the bot token

2. Create a Telegram channel:
   - Make it public or private
   - Add your bot as an administrator
   - Get the channel ID (format: `@channelname` or `-100123456789`)

3. Test your bot:
   - Send a message to your channel manually
   - Verify the bot can post

### 6. Get Amazon API Credentials

1. Join [Amazon Associates Program](https://affiliate-program.amazon.in/)
2. Apply for [Product Advertising API](https://webservices.amazon.in/paapi5/documentation/)
3. Get your credentials from the dashboard:
   - Access Key
   - Secret Key
   - Partner Tag (your Associate ID)

### 7. Run the Bot

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 📁 Project Structure

```
affilate bot/
├── src/
│   ├── modules/
│   │   ├── amazonAPI.js      # Amazon PA-API integration
│   │   ├── telegramBot.js    # Telegram messaging
│   │   └── database.js       # Supabase database operations
│   ├── utils/
│   │   ├── logger.js         # Logging utility
│   │   └── helpers.js        # Helper functions
│   ├── scheduler.js          # Cron job scheduler
│   └── index.js              # Main entry point
├── .env                      # Environment variables (create this)
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AMAZON_ACCESS_KEY` | Amazon PA-API access key | Required |
| `AMAZON_SECRET_KEY` | Amazon PA-API secret key | Required |
| `AMAZON_PARTNER_TAG` | Your Amazon Associate ID | Required |
| `AMAZON_REGION` | Amazon region (US, UK, IN, etc.) | `IN` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Required |
| `TELEGRAM_CHANNEL_ID` | Telegram channel ID | Required |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_KEY` | Supabase anon/public key | Required |
| `MIN_DISCOUNT_PERCENTAGE` | Minimum discount to post | `50` |
| `CRON_SCHEDULE` | Cron expression for schedule | `0 */2 * * *` |
| `MAX_PRODUCTS_PER_RUN` | Max products per execution | `10` |
| `PORT` | Health check server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `production` |

### Cron Schedule Examples

- Every 2 hours: `0 */2 * * *`
- Every hour: `0 * * * *`
- Every 6 hours: `0 */6 * * *`
- Every day at 9 AM: `0 9 * * *`
- Twice a day (9 AM & 9 PM): `0 9,21 * * *`

## 📊 How It Works

1. **Scheduled Execution**: Bot runs every 2 hours (configurable)
2. **Product Search**: Queries Amazon PA-API for discounted products
3. **Filtering**: Keeps only products with 50%+ discount and in stock
4. **Duplicate Check**: Verifies product hasn't been posted before (via Supabase)
5. **Telegram Posting**: Sends formatted message with image to channel
6. **Database Update**: Marks product as posted to prevent duplicates
7. **Error Handling**: Retries failed requests, logs errors, sends notifications

## 🎯 Message Format

The bot posts messages in this format:

```
🔥 HUGE DISCOUNT ALERT 🔥

🛍 Samsung Galaxy M32 (6GB RAM, 128GB Storage)

💸 Original: ₹20,000
🏷️ Discounted: ₹9,999 (50% OFF)

🛒 Buy Now: [Affiliate Link]

⚡ Limited time offer! Grab it before it's gone!
```

## 🔍 API Endpoints

The bot includes a health check server:

- `GET /` - Bot status and uptime
- `GET /health` - Health check
- `POST /trigger` - Manually trigger job (for testing)

Example:
```bash
curl http://localhost:3000/health
```

## 🐛 Troubleshooting

### Bot not posting to Telegram

1. Verify bot token is correct
2. Ensure bot is added as admin to channel
3. Check channel ID format (`@channelname` or `-100123456789`)
4. Test with a private message first

### Amazon API errors

1. Verify credentials are correct
2. Check if you have PA-API access (requires approved Associate account)
3. Ensure you've made at least 3 sales in 180 days (Amazon requirement)
4. Check API rate limits

### Database errors

1. Verify Supabase URL and key
2. Ensure table `posted_deals` exists
3. Check Supabase dashboard for errors
4. Verify network connectivity

### No products found

1. Try different search keywords
2. Lower `MIN_DISCOUNT_PERCENTAGE` temporarily
3. Check if Amazon has deals available
4. Verify your region setting

## 📝 Logs

The bot provides detailed logging:

- ℹ️ **INFO**: General information
- ✅ **SUCCESS**: Successful operations
- ⚠️ **WARNING**: Non-critical issues
- ❌ **ERROR**: Errors with stack traces
- 🐛 **DEBUG**: Debug info (development only)

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate keys regularly** - Change API keys periodically
4. **Monitor usage** - Check for unusual activity
5. **Use HTTPS** - Always use secure connections
6. **Limit permissions** - Use minimal required permissions

## 🚀 Deployment

### Deploy to VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your project
git clone <your-repo>
cd affilate-bot

# Install dependencies
npm install --production

# Install PM2 for process management
sudo npm install -g pm2

# Start bot
pm2 start src/index.js --name amazon-bot

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
```

### Deploy to Heroku

```bash
# Install Heroku CLI
# Create Procfile
echo "web: node src/index.js" > Procfile

# Deploy
heroku create your-bot-name
heroku config:set AMAZON_ACCESS_KEY=your_key
# ... set all other env vars
git push heroku main
```

## 📈 Monitoring

Monitor your bot with PM2:

```bash
pm2 status          # Check status
pm2 logs amazon-bot # View logs
pm2 restart amazon-bot # Restart
pm2 stop amazon-bot # Stop
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## ⚠️ Disclaimer

This bot is for educational purposes. Ensure you comply with:
- Amazon Associates Program Operating Agreement
- Amazon Product Advertising API License Agreement
- Telegram Bot API Terms of Service
- Your local laws and regulations

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review logs for error messages
3. Verify all credentials are correct
4. Ensure all services (Amazon, Telegram, Supabase) are accessible

## 🎉 Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all credentials
- [ ] Supabase table created
- [ ] Telegram bot created and added to channel
- [ ] Amazon PA-API credentials obtained
- [ ] Bot started successfully
- [ ] First deal posted to Telegram

---

**Made with ❤️ for affiliate marketers**

Happy deal hunting! 🎯

