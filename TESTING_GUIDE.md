# 🧪 Amazon Scraper Bot - Testing Guide

**Test Configuration**: Every 2 minutes  
**Discount Filter**: 85%+ (High filter - may result in fewer products)  
**Channel**: @amazondealsmake  
**Status**: ✅ Ready to test

---

## 🚀 Starting the Bot

### Command:
```bash
npm start
```

### What to Look For:
1. ✅ "Database connected successfully"
2. ✅ "Amazon Scraper adapter initialized successfully"
3. ✅ "Telegram bot started successfully"
4. ✅ "Scheduler started successfully"
5. ✅ "Next job scheduled at: [timestamp]"

---

## 📊 Monitoring the Bot

### Console Logs to Watch:

#### Startup Logs:
```
[INFO] Starting Amazon Affiliate Telegram Bot...
[SUCCESS] ✅ Database connected successfully
[INFO] Initializing amazon-scraper adapter...
[SUCCESS] ✅ Amazon Scraper adapter initialized successfully
[SUCCESS] ✅ Telegram bot started successfully
[SUCCESS] ✅ Scheduler started successfully
[INFO] Next job scheduled at: 2025-10-16T01:35:00.000Z
```

#### Job Execution Logs (Every 2 Minutes):
```
[INFO] ⏰ Scheduled job started
[INFO] [Amazon Scraper] Searching for products with keyword: "deals"
[INFO] [Amazon Scraper] Fetching: https://www.amazon.in/s?k=deals
[INFO] [Amazon Scraper] Scraped 5 products
[INFO] [Amazon Scraper] Returning 2 filtered products
[INFO] 📦 Found 2 products from amazon-scraper
[INFO] 🔍 Filtering products with 85%+ discount
[INFO] ✅ 1 products passed filters
[INFO] 📤 Posting product to Telegram: [Product Name]
[SUCCESS] ✅ Posted to Telegram successfully
[INFO] 💾 Saved to database
```

#### Success Indicators:
- ✅ "Scraped X products" - Real data from Amazon
- ✅ "X products passed filters" - Products meet 85% discount
- ✅ "Posted to Telegram successfully" - Message sent
- ✅ "Saved to database" - Recorded in Supabase

#### Warning Indicators:
- ⚠️ "No products found" - Amazon may be blocking or no products match filters
- ⚠️ "0 products passed filters" - No products with 85%+ discount
- ⚠️ "Already posted" - Duplicate prevention working

#### Error Indicators:
- ❌ "Error searching for products" - Scraping failed
- ❌ "Error posting to Telegram" - Check bot token/channel
- ❌ "Database error" - Check Supabase connection

---

## 📱 Checking Telegram Channel

### Channel URL:
https://t.me/amazondealsmake

### What to Expect in Posts:

**Example Post Format:**
```
🔥 DEAL ALERT! 95% OFF

Fire-Boltt Ninja Call Pro Plus Smart Watch
1.83" HD Display, Bluetooth Calling

💰 Price: ₹999
🏷️ Was: ₹19,999
🔥 Save: 95% (₹19,000 OFF!)

⭐ Rating: 3.8/5 (104,002 reviews)
📦 In Stock

🛒 Buy Now: [Affiliate Link]
```

### Post Components:
- ✅ Product title
- ✅ Current price (₹)
- ✅ Original price (₹)
- ✅ Discount percentage
- ✅ Savings amount
- ✅ Rating and review count
- ✅ Stock status
- ✅ Product image
- ✅ Affiliate link with partner tag

---

## ⏱️ Testing Timeline

### Minute 0: Start Bot
```bash
npm start
```
- Bot initializes
- Scheduler starts
- First job scheduled for minute 2

### Minute 2: First Job Execution
- Bot searches Amazon for products
- Filters products (85%+ discount)
- Posts to Telegram (if products found)
- Saves to database

### Minute 4: Second Job Execution
- Repeats the process
- Checks for duplicates
- Posts new products only

### Minute 6, 8, 10...: Subsequent Jobs
- Continues every 2 minutes
- Monitor for consistency

---

## 🔍 Verification Checklist

### ✅ Bot Startup
- [ ] Bot starts without errors
- [ ] Database connection successful
- [ ] Amazon scraper initialized
- [ ] Telegram bot connected
- [ ] Scheduler started
- [ ] First job scheduled

### ✅ Product Scraping
- [ ] Products scraped from Amazon.in
- [ ] Real product data (not mock)
- [ ] Products have valid ASINs
- [ ] Prices are current
- [ ] Discounts calculated correctly

### ✅ Filtering
- [ ] Only 85%+ discount products pass
- [ ] Duplicate products filtered out
- [ ] Out-of-stock products filtered out

### ✅ Telegram Posting
- [ ] Posts appear in channel
- [ ] Images load correctly
- [ ] Prices formatted correctly
- [ ] Affiliate links work
- [ ] Partner tag present in links

### ✅ Database
- [ ] Products saved to posted_deals table
- [ ] Timestamps recorded correctly
- [ ] Duplicate prevention working

---

## 🐛 Troubleshooting

### Issue: No Products Found

**Symptoms:**
- Logs show "Scraped 0 products"
- No Telegram posts

**Possible Causes:**
1. Amazon is blocking requests
2. 85% discount filter too high
3. Network issues

**Solutions:**
1. Wait a few minutes and check next run
2. Lower discount filter to 50-70% (via admin panel)
3. Check internet connection
4. Verify Amazon.in is accessible

---

### Issue: Products Found But Not Posted

**Symptoms:**
- Logs show "Scraped X products"
- Logs show "0 products passed filters"
- No Telegram posts

**Cause:**
- No products meet 85% discount threshold

**Solution:**
- Lower MIN_DISCOUNT_PERCENTAGE to 50-70%
- This is expected with 85% filter - very few products have such high discounts

---

### Issue: Telegram Posting Failed

**Symptoms:**
- Logs show "Error posting to Telegram"
- Products scraped but not posted

**Possible Causes:**
1. Invalid bot token
2. Bot not added to channel
3. Bot doesn't have posting permissions

**Solutions:**
1. Verify TELEGRAM_BOT_TOKEN in .env
2. Add bot to @amazondealsmake channel
3. Make bot an admin with post permissions

---

### Issue: Duplicate Posts

**Symptoms:**
- Same product posted multiple times

**Cause:**
- Database duplicate check not working

**Solution:**
- Check Supabase connection
- Verify posted_deals table exists
- Check logs for database errors

---

## 📈 Expected Results

### With 85% Discount Filter:
- **Products Found**: 5-10 per search
- **Products Posted**: 0-2 per run (85% discount is rare)
- **Posting Frequency**: Every 2 minutes (testing)
- **Expected Posts**: 0-30 per hour (highly variable)

### With 50% Discount Filter (Recommended):
- **Products Found**: 5-10 per search
- **Products Posted**: 2-5 per run
- **Posting Frequency**: Every 2 minutes (testing)
- **Expected Posts**: 60-150 per hour

---

## 🎯 Success Criteria

### ✅ Test is Successful If:
1. Bot starts without errors
2. Scraper fetches real Amazon products
3. Products are filtered correctly
4. At least 1 product posts to Telegram within 10 minutes
5. Telegram post includes all required information
6. Affiliate link has correct partner tag
7. No duplicate posts
8. Database records the post

### ⚠️ Test Needs Adjustment If:
1. No products posted after 10 minutes → Lower discount filter
2. Too many posts → Increase discount filter or posting interval
3. Duplicate posts → Check database connection
4. Scraping fails → Check Amazon accessibility

---

## 🔄 After Testing

### 1. Stop the Bot
Press `Ctrl+C` in the terminal

### 2. Update Configuration (via Admin Panel)
- Change CRON_SCHEDULE to: `0 */2 * * *` (every 2 hours)
- Adjust MIN_DISCOUNT_PERCENTAGE to: `50-70%` (recommended)
- Configure platform posting ratios
- Set other filters as needed

### 3. Restart for Production
```bash
npm start
```

### 4. Monitor Production
- Check logs daily
- Monitor Telegram channel
- Review database for posted products
- Adjust filters based on results

---

## 📞 Support

### If Issues Persist:
1. Check logs for specific error messages
2. Verify all environment variables
3. Test Amazon scraper independently: `node test-amazon-scraper.js`
4. Test Telegram bot independently
5. Check Supabase dashboard for database issues

### Useful Commands:
```bash
# Test scraper only
node test-amazon-scraper.js

# Verify configuration
node pre-flight-check.js

# Check environment variables
cat .env

# View logs (if using PM2)
pm2 logs

# Restart bot
npm start
```

---

## 📊 Monitoring Dashboard

### Key Metrics to Track:
- **Scraping Success Rate**: % of successful scrapes
- **Products Found**: Average per search
- **Products Posted**: Average per run
- **Telegram Success Rate**: % of successful posts
- **Duplicate Rate**: % of duplicates filtered
- **Uptime**: Bot availability

### Access Metrics:
- Supabase Dashboard: https://app.supabase.com/project/dbnldknxqqsysfwlswtb
- Telegram Channel: https://t.me/amazondealsmake
- Bot Logs: Console output

---

**Status**: ✅ Ready to Test  
**Next Step**: Run `npm start` and monitor logs  
**Expected First Post**: Within 2-4 minutes (if products found)

