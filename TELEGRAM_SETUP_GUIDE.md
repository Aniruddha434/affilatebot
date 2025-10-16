# Telegram Bot Setup & Troubleshooting Guide

## 🎯 Quick Start

Your bot is configured with:
- **Bot Token**: `7731512306:AAHEhFMEydtCZajLx0g8HT_iR8iuN2SpfzE`
- **Channel**: `amazondealsmake`

---

## ⚠️ Important: Channel ID Format

Telegram requires the channel ID in one of these formats:

### For Public Channels:
```
@channelname
```
Example: `@amazondealsmake`

### For Private Channels/Groups:
```
-1001234567890
```
(A negative number starting with -100)

---

## 🔧 Step-by-Step Setup

### 1. Add Bot to Your Channel

1. Open your Telegram channel `amazondealsmake`
2. Click on the channel name at the top
3. Click "Administrators"
4. Click "Add Administrator"
5. Search for your bot: `@YourBotUsername`
6. Grant these permissions:
   - ✅ Post messages
   - ✅ Edit messages
   - ✅ Delete messages (optional)

### 2. Get the Correct Channel ID

#### Method 1: For Public Channels
If your channel is public, use: `@amazondealsmake`

Update your `.env` file:
```env
TELEGRAM_CHANNEL_ID=@amazondealsmake
```

#### Method 2: For Private Channels/Groups
1. Forward any message from your channel to [@userinfobot](https://t.me/userinfobot)
2. The bot will reply with the channel ID (e.g., `-1001234567890`)
3. Copy that ID

Update your `.env` file:
```env
TELEGRAM_CHANNEL_ID=-1001234567890
```

### 3. Test the Connection

Run the test script:
```bash
node test-telegram.js
```

This will:
- ✅ Verify bot token is valid
- ✅ Try different channel ID formats
- ✅ Send a test message to your channel
- ✅ Tell you which format works

### 4. Test Complete Flow

Once Telegram connection works, test the complete flow:
```bash
node test-complete-flow.js
```

This will:
- ✅ Fetch mock products from all 3 platforms
- ✅ Post 3 test deals to your Telegram channel
- ✅ Verify the entire pipeline works

---

## 🧪 Testing Commands

### Test 1: Telegram Connection Only
```bash
node test-telegram.js
```
**What it does**: Tests if bot can send messages to your channel

**Expected output**:
```
✅ Bot connected: @YourBotName
✅ SUCCESS! Messages can be sent to: @amazondealsmake
```

### Test 2: Complete Flow (Mock Data → Telegram)
```bash
node test-complete-flow.js
```
**What it does**: 
- Fetches mock products from Amazon, Flipkart, Myntra
- Posts them to your Telegram channel

**Expected output**:
```
✅ Platforms initialized: 3
✅ Products fetched: 9
✅ Test messages sent: 3
```

### Test 3: Start the Bot Server
```bash
npm start
```
Then click "Trigger Job Now" in the admin panel at http://localhost:3001/dashboard

---

## 🐛 Troubleshooting

### Issue 1: "Chat not found" Error

**Cause**: Incorrect channel ID format or bot not added to channel

**Solution**:
1. Make sure bot is added as administrator to the channel
2. Try both formats:
   - `@amazondealsmake` (for public channels)
   - `-1001234567890` (for private channels - get from @userinfobot)

### Issue 2: "Bot was blocked by the user"

**Cause**: Bot doesn't have permission to post

**Solution**:
1. Remove bot from channel
2. Re-add bot as administrator
3. Grant "Post messages" permission

### Issue 3: "Trigger Job" Button Does Nothing

**Cause**: Backend server not running or API error

**Solution**:
1. Check if backend is running: `npm start`
2. Check browser console for errors (F12 → Console tab)
3. Check backend logs for errors
4. Verify `.env` file has all required variables

### Issue 4: No Products Being Posted

**Cause**: Amazon API credentials not active yet (2-day waiting period)

**Solution**:
✅ **Already Fixed!** The bot now uses mock data for all platforms when real APIs fail.

Mock data includes:
- **Amazon**: 5 electronics products (phones, earbuds, smartwatch)
- **Flipkart**: 5 products (phone, shoes, laptop, headphones, watch)
- **Myntra**: 6 fashion products (shirts, jeans, dress, shoes, watch, bag)

### Issue 5: Rate Limiting Errors

**Cause**: Sending too many messages too quickly

**Solution**:
The bot automatically waits 2 seconds between messages. If you still get rate limited:
1. Reduce `MAX_PRODUCTS_PER_RUN` in `.env`
2. Increase `CRON_SCHEDULE` interval

---

## 📊 Monitoring

### Check Backend Logs
```bash
npm start
```
Look for these log messages:
- `[Amazon] Falling back to mock data` ✅ Good - using mock data
- `[Flipkart] Returning mock products` ✅ Good - using mock data
- `[Myntra] Returning mock products` ✅ Good - using mock data
- `Telegram bot initialized successfully` ✅ Good - bot connected
- `Successfully sent deal to Telegram` ✅ Good - message posted

### Check Admin Panel Logs
1. Go to http://localhost:3001/dashboard
2. Click "View Logs" card
3. Look for recent activity

---

## ✅ Verification Checklist

Before running the bot, verify:

- [ ] Bot token is in `.env` file
- [ ] Channel ID is in `.env` file (with `@` for public or `-100...` for private)
- [ ] Bot is added to channel as administrator
- [ ] Bot has "Post messages" permission
- [ ] `node test-telegram.js` succeeds
- [ ] `node test-complete-flow.js` posts to channel
- [ ] Backend server is running (`npm start`)
- [ ] Admin panel is accessible (http://localhost:3001)

---

## 🎉 Success Indicators

When everything works correctly, you should see:

### In Telegram Channel:
- Test message from `test-telegram.js`
- 3 product deals from `test-complete-flow.js`
- Formatted messages with:
  - Product title
  - Original price
  - Discounted price
  - Discount percentage
  - Product image
  - "Buy Now" link

### In Admin Panel:
- "Job triggered successfully!" message
- Logs showing products fetched and posted
- Analytics showing posts count

### In Backend Logs:
```
[Amazon] Falling back to mock data
[Flipkart] Returning mock products
[Myntra] Returning mock products
Successfully sent deal to Telegram
```

---

## 🚀 Next Steps

Once Telegram is working:

1. **Adjust Platform Ratios**
   - Go to Admin Panel → Platform Management
   - Set posting ratios (e.g., 40% Amazon, 30% Flipkart, 30% Myntra)

2. **Configure Filters**
   - Go to Admin Panel → Advanced Filters
   - Set minimum discount thresholds
   - Add keyword filters
   - Set price ranges

3. **Wait for Amazon API Activation**
   - Amazon PA-API requires 2 days for new accounts
   - Bot will automatically switch from mock to real data once API is active
   - No code changes needed!

4. **Monitor Performance**
   - Check Admin Panel → Dashboard for statistics
   - Review logs regularly
   - Adjust schedule if needed

---

## 📞 Support

If you're still having issues:

1. Run diagnostic tests:
   ```bash
   node test-telegram.js
   node test-complete-flow.js
   ```

2. Check all logs:
   - Browser console (F12)
   - Backend terminal output
   - Admin Panel → Logs page

3. Verify environment variables:
   ```bash
   # On Windows PowerShell
   Get-Content .env
   ```

4. Common fixes:
   - Restart backend server
   - Clear browser cache
   - Re-add bot to channel
   - Update channel ID format

---

## 🔐 Security Notes

- ✅ Never share your bot token publicly
- ✅ Keep `.env` file secure
- ✅ Don't commit `.env` to git
- ✅ Use environment variables in production
- ✅ Rotate tokens if compromised

---

**Last Updated**: 2025-01-10
**Bot Version**: 2.0 (Multi-Platform with Mock Data Support)

