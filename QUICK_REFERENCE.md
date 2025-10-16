# 📖 Quick Reference Guide

## 🚀 Common Commands

### Start the Bot
```bash
npm start                 # Production mode
npm run dev              # Development mode (auto-reload)
```

### Process Management (PM2)
```bash
pm2 start src/index.js --name amazon-bot   # Start
pm2 stop amazon-bot                        # Stop
pm2 restart amazon-bot                     # Restart
pm2 logs amazon-bot                        # View logs
pm2 status                                 # Check status
pm2 delete amazon-bot                      # Remove from PM2
```

### Testing
```bash
# Manual trigger (while bot is running)
curl -X POST http://localhost:3000/trigger

# Health check
curl http://localhost:3000/health

# View status
curl http://localhost:3000/
```

---

## 🔧 Configuration Quick Edit

### Change Posting Frequency

Edit `.env`:
```env
# Every hour
CRON_SCHEDULE=0 * * * *

# Every 2 hours (default)
CRON_SCHEDULE=0 */2 * * *

# Every 6 hours
CRON_SCHEDULE=0 */6 * * *

# Twice daily (9 AM & 9 PM)
CRON_SCHEDULE=0 9,21 * * *
```

### Change Minimum Discount

Edit `.env`:
```env
MIN_DISCOUNT_PERCENTAGE=50   # 50% or higher
MIN_DISCOUNT_PERCENTAGE=70   # 70% or higher (fewer deals)
MIN_DISCOUNT_PERCENTAGE=30   # 30% or higher (more deals)
```

### Change Products Per Run

Edit `.env`:
```env
MAX_PRODUCTS_PER_RUN=10   # Default
MAX_PRODUCTS_PER_RUN=5    # Fewer products
MAX_PRODUCTS_PER_RUN=20   # More products
```

---

## 🔍 Customizing Search Keywords

Edit `src/scheduler.js` around line 25:

```javascript
const searchKeywords = [
  'electronics deals',
  'fashion sale',
  'home appliances discount',
  'books offer',
  'beauty products sale',
  // Add your own keywords:
  'smartphone discount',
  'laptop deals',
  'kitchen appliances sale'
];
```

---

## 📊 Database Queries

### View Posted Deals (Supabase Dashboard)

```sql
-- View all deals
SELECT * FROM posted_deals ORDER BY posted_at DESC LIMIT 20;

-- Count total deals
SELECT COUNT(*) as total FROM posted_deals;

-- Deals by discount
SELECT * FROM posted_deals 
WHERE discount_percentage >= 70 
ORDER BY posted_at DESC;

-- Deals from last 7 days
SELECT * FROM posted_deals 
WHERE posted_at > NOW() - INTERVAL '7 days'
ORDER BY posted_at DESC;
```

### Cleanup Old Deals

```sql
-- Delete deals older than 30 days
DELETE FROM posted_deals 
WHERE posted_at < NOW() - INTERVAL '30 days';

-- Clear all data (careful!)
TRUNCATE TABLE posted_deals;
```

---

## 🐛 Debugging

### Enable Debug Logs

Edit `.env`:
```env
NODE_ENV=development   # Shows debug logs
```

### Check Specific Logs

```bash
# All logs
pm2 logs amazon-bot

# Only errors
pm2 logs amazon-bot --err

# Last 100 lines
pm2 logs amazon-bot --lines 100

# Follow logs in real-time
pm2 logs amazon-bot --lines 0
```

### Test Individual Components

Create `test.js`:
```javascript
require('dotenv').config();
const amazonAPI = require('./src/modules/amazonAPI');

(async () => {
  const products = await amazonAPI.searchDiscountedProducts('electronics', 5);
  console.log(products);
})();
```

Run: `node test.js`

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Never commit credentials to Git
- [ ] Use strong Supabase password
- [ ] Rotate API keys every 90 days
- [ ] Monitor bot activity regularly
- [ ] Keep dependencies updated: `npm update`

---

## 📈 Monitoring

### Check Bot Health

```bash
# Is it running?
pm2 status

# Recent activity
pm2 logs amazon-bot --lines 50

# System resources
pm2 monit
```

### Telegram Channel Stats

- Check message count
- Monitor engagement
- Track click-through rates (if using link shortener)

### Supabase Stats

```sql
-- Deals posted today
SELECT COUNT(*) FROM posted_deals 
WHERE posted_at::date = CURRENT_DATE;

-- Deals posted this week
SELECT COUNT(*) FROM posted_deals 
WHERE posted_at > NOW() - INTERVAL '7 days';

-- Average discount
SELECT AVG(discount_percentage) as avg_discount 
FROM posted_deals;

-- Top discounts
SELECT title, discount_percentage, posted_at 
FROM posted_deals 
ORDER BY discount_percentage DESC 
LIMIT 10;
```

---

## 🔄 Updating the Bot

```bash
# Stop bot
pm2 stop amazon-bot

# Pull latest changes (if using Git)
git pull

# Install new dependencies
npm install

# Restart bot
pm2 restart amazon-bot

# Verify
pm2 logs amazon-bot
```

---

## 🆘 Emergency Commands

### Bot Stuck or Not Responding

```bash
pm2 restart amazon-bot --update-env
```

### Clear PM2 Logs

```bash
pm2 flush
```

### Reset Everything

```bash
pm2 delete amazon-bot
pm2 start src/index.js --name amazon-bot
```

### Database Issues

```sql
-- Recreate table
DROP TABLE IF EXISTS posted_deals;
-- Then run supabase-setup.sql again
```

---

## 📞 Support Resources

### Documentation
- [Amazon PA-API Docs](https://webservices.amazon.in/paapi5/documentation/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Supabase Docs](https://supabase.com/docs)
- [Node-Cron Syntax](https://www.npmjs.com/package/node-cron)

### Tools
- [Cron Expression Generator](https://crontab.guru/)
- [Telegram Bot Testing](https://t.me/userinfobot)
- [JSON Formatter](https://jsonformatter.org/)

---

## 💡 Pro Tips

1. **Start Small**: Begin with `MIN_DISCOUNT_PERCENTAGE=70` to ensure quality
2. **Monitor First Week**: Check logs daily for the first week
3. **Adjust Schedule**: Find the best posting times for your audience
4. **Vary Keywords**: Rotate search keywords for diverse products
5. **Backup Database**: Export Supabase data monthly
6. **Track Performance**: Monitor which deals get most engagement
7. **Stay Compliant**: Follow Amazon Associates rules
8. **Update Regularly**: Keep Node.js and packages updated

---

## 📊 Performance Optimization

### Reduce API Calls
```env
MAX_PRODUCTS_PER_RUN=5    # Fewer products = fewer API calls
CRON_SCHEDULE=0 */3 * * * # Less frequent = fewer API calls
```

### Increase Deal Quality
```env
MIN_DISCOUNT_PERCENTAGE=60  # Higher threshold
```

### Speed Up Posting
Edit `src/modules/telegramBot.js` line 85:
```javascript
await new Promise(resolve => setTimeout(resolve, 1000)); // Faster (1 sec)
```

---

## 🎯 Success Metrics

Track these weekly:
- [ ] Total deals posted
- [ ] Average discount percentage
- [ ] Channel subscriber growth
- [ ] Bot uptime percentage
- [ ] API error rate
- [ ] Database size

---

**Keep this file handy for quick reference!** 📌

