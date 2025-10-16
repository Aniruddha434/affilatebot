# 🔐 Environment Variables Guide

**Complete reference for all environment variables used in the affiliate bot**

---

## 📋 Required Variables

### Amazon Credentials

#### `AMAZON_ACCESS_KEY`
- **Type**: String
- **Required**: Yes
- **Description**: Your Amazon Product Advertising API access key
- **Where to get**: [Amazon Associates Dashboard](https://affiliate-program.amazon.in/)
- **Format**: `AKIA...` (starts with AKIA)
- **Example**: `AKIAIOSFODNN7EXAMPLE`

#### `AMAZON_SECRET_KEY`
- **Type**: String
- **Required**: Yes
- **Description**: Your Amazon Product Advertising API secret key
- **Where to get**: [Amazon Associates Dashboard](https://affiliate-program.amazon.in/)
- **Format**: Long alphanumeric string
- **Example**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

#### `AMAZON_PARTNER_TAG`
- **Type**: String
- **Required**: Yes
- **Description**: Your Amazon Associate ID (Partner Tag)
- **Where to get**: [Amazon Associates Dashboard](https://affiliate-program.amazon.in/)
- **Format**: `yourtag-21` (ends with -21 for India)
- **Example**: `myaffiliate-21`

#### `AMAZON_REGION`
- **Type**: String
- **Required**: No (Default: `IN`)
- **Description**: Amazon region for product searches
- **Valid Values**: `IN`, `US`, `UK`, `DE`, `FR`, `ES`, `IT`, `CA`, `AU`, `JP`
- **Example**: `IN`

---

### Telegram Configuration

#### `TELEGRAM_BOT_TOKEN`
- **Type**: String
- **Required**: Yes
- **Description**: Your Telegram bot token from @BotFather
- **Where to get**: [Telegram @BotFather](https://t.me/botfather)
- **Format**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- **Steps**:
  1. Message @BotFather on Telegram
  2. Send `/newbot`
  3. Choose a name and username
  4. Copy the token

#### `TELEGRAM_CHANNEL_ID`
- **Type**: String
- **Required**: Yes
- **Description**: Your Telegram channel ID where deals will be posted
- **Format**: `@channelname` or `-100123456789`
- **Where to get**: [Telegram @userinfobot](https://t.me/userinfobot)
- **Steps**:
  1. Create a Telegram channel
  2. Add your bot as administrator
  3. Message @userinfobot in the channel
  4. Copy the channel ID

---

### Supabase Configuration

#### `SUPABASE_URL`
- **Type**: String
- **Required**: Yes
- **Description**: Your Supabase project URL
- **Where to get**: [Supabase Dashboard](https://app.supabase.com/)
- **Format**: `https://your-project.supabase.co`
- **Steps**:
  1. Go to Supabase dashboard
  2. Select your project
  3. Go to Settings → API
  4. Copy Project URL

#### `SUPABASE_KEY`
- **Type**: String
- **Required**: Yes
- **Description**: Your Supabase anon/public key
- **Where to get**: [Supabase Dashboard](https://app.supabase.com/)
- **Format**: Long JWT token
- **Steps**:
  1. Go to Supabase dashboard
  2. Select your project
  3. Go to Settings → API
  4. Copy anon/public key

---

## 🎛️ Optional Variables

### Bot Configuration

#### `MIN_DISCOUNT_PERCENTAGE`
- **Type**: Number
- **Default**: `50`
- **Description**: Minimum discount percentage to post products
- **Valid Range**: 1-100
- **Example**: `50` (only post products with 50%+ discount)

#### `CRON_SCHEDULE`
- **Type**: String (Cron expression)
- **Default**: `0 */2 * * *` (every 2 hours)
- **Description**: Schedule for running product searches
- **Examples**:
  - `0 */2 * * *` - Every 2 hours
  - `0 * * * *` - Every hour
  - `0 */6 * * *` - Every 6 hours
  - `0 9 * * *` - Daily at 9 AM
  - `0 9,21 * * *` - Twice daily (9 AM & 9 PM)

#### `MAX_PRODUCTS_PER_RUN`
- **Type**: Number
- **Default**: `10`
- **Description**: Maximum products to fetch per scheduled run
- **Valid Range**: 1-50
- **Example**: `10`

#### `PORT`
- **Type**: Number
- **Default**: `3000`
- **Description**: Port for health check server
- **Example**: `3000`

#### `NODE_ENV`
- **Type**: String
- **Default**: `production`
- **Valid Values**: `production`, `development`
- **Description**: Environment mode
- **Example**: `production`

---

### Admin Panel (Optional)

#### `JWT_SECRET`
- **Type**: String
- **Required**: If using admin panel
- **Description**: Secret key for JWT token signing
- **Generate**: `node generate-secrets.js`
- **Format**: Random string (min 32 characters)

#### `ADMIN_API_SECRET`
- **Type**: String
- **Required**: If using admin panel
- **Description**: Secret for admin API authentication
- **Generate**: `node generate-secrets.js`
- **Format**: Random string (min 32 characters)

#### `SESSION_SECRET`
- **Type**: String
- **Required**: If using admin panel
- **Description**: Secret for session management
- **Generate**: `node generate-secrets.js`
- **Format**: Random string (min 32 characters)

#### `ENCRYPTION_KEY`
- **Type**: String
- **Required**: If using admin panel
- **Description**: Key for encrypting sensitive data
- **Generate**: `node generate-secrets.js`
- **Format**: Random string (min 32 characters)

---

## 🔒 Security Best Practices

### DO ✅
- Use strong, random values for secrets
- Store secrets in environment variables
- Rotate secrets regularly
- Use different secrets for each environment
- Keep `.env` file in `.gitignore`
- Use Vercel's environment variable management

### DON'T ❌
- Commit `.env` file to Git
- Hardcode credentials in code
- Share secrets in messages or emails
- Use same secrets across environments
- Use weak or predictable values
- Store secrets in version control

---

## 🚀 Vercel Deployment

### Setting Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Click "Settings"
3. Click "Environment Variables"
4. Add each variable:
   - **Name**: Variable name (e.g., `AMAZON_ACCESS_KEY`)
   - **Value**: Your value
   - **Environment**: Select `Production`
5. Click "Save"

### Vercel Environment Variable Limits

- Maximum 100 variables per project
- Maximum 4KB per variable value
- Variables are encrypted at rest

---

## 🧪 Testing Environment Variables

### Verify Configuration

```bash
node pre-flight-check.js
```

This will check:
- All required variables are set
- Values are not placeholder text
- Configuration is valid

### Generate Secrets

```bash
node generate-secrets.js
```

This will generate secure secrets for:
- JWT_SECRET
- ADMIN_API_SECRET
- SESSION_SECRET
- ENCRYPTION_KEY

---

## 📝 .env File Template

```env
# Amazon Credentials (REQUIRED)
AMAZON_ACCESS_KEY=your_access_key_here
AMAZON_SECRET_KEY=your_secret_key_here
AMAZON_PARTNER_TAG=yourtag-21
AMAZON_REGION=IN

# Telegram (REQUIRED)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=@your_channel_id

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here

# Bot Configuration (OPTIONAL)
MIN_DISCOUNT_PERCENTAGE=50
CRON_SCHEDULE=0 */2 * * *
MAX_PRODUCTS_PER_RUN=10
PORT=3000
NODE_ENV=production

# Admin Panel (OPTIONAL)
JWT_SECRET=your_jwt_secret_here
ADMIN_API_SECRET=your_admin_secret_here
SESSION_SECRET=your_session_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

---

## ✅ Deployment Checklist

- [ ] All required variables configured
- [ ] No placeholder values remaining
- [ ] Secrets are strong and random
- [ ] Variables set in Vercel dashboard
- [ ] Pre-flight check passes
- [ ] Bot starts successfully
- [ ] All services connected


