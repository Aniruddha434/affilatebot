# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## ⚠️ Hydration Mismatch Errors (Admin Panel)

### Symptom
You see console errors like:
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
...
- bis_skin_checked="1"
```

### Cause
This is caused by **browser extensions** (like Bitwarden, LastPass, Grammarly, etc.) that inject attributes into your HTML before React hydrates. This is **NOT a bug in your code**.

### Impact
- ✅ **No functional impact** - Your app works perfectly
- ⚠️ **Cosmetic only** - Just console warnings
- ✅ **Already handled** - Warnings are suppressed

### Solution
The warnings are already suppressed by `HydrationWarningSuppress.tsx`. If you still see them:

1. **Disable browser extensions temporarily** to verify:
   - Open DevTools
   - Go to Extensions
   - Disable extensions one by one
   - Refresh the page

2. **Clear browser cache**:
   ```bash
   # In browser DevTools
   Right-click refresh button → Empty Cache and Hard Reload
   ```

3. **Restart the dev server**:
   ```bash
   cd admin-panel
   # Stop the server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

### Prevention
These warnings are harmless and expected when using browser extensions. The suppressor is already in place to keep your console clean.

---

## 🔐 Authentication Issues

### "Invalid credentials" on login

**Check:**
1. Admin user exists:
   ```bash
   node create-admin-user.js
   ```

2. Correct credentials in database:
   ```bash
   # Check Supabase admin_users table
   ```

3. JWT_SECRET is set in `.env`:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET ? 'OK' : 'MISSING')"
   ```

### "Too many login attempts"

**Cause:** Rate limiting (5 attempts per 15 minutes)

**Solution:** Wait 15 minutes or restart the backend:
```bash
# Stop and restart
npm start
```

---

## 🗄️ Database Connection Issues

### "Failed to connect to Supabase"

**Check:**
1. Supabase URL and key in `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

2. Test connection:
   ```bash
   node -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); client.from('posted_deals').select('count').then(console.log).catch(console.error)"
   ```

3. Check Supabase project status at https://app.supabase.com

### "Table does not exist"

**Solution:** Run the SQL schemas:
```bash
# Run all schemas
psql <connection-string> -f supabase-setup.sql
psql <connection-string> -f multi-platform-schema.sql
psql <connection-string> -f admin-panel-setup.sql
psql <connection-string> -f supabase-keywords-schema.sql
```

---

## 📱 Telegram Bot Issues

### "Failed to send message"

**Check:**
1. Bot token is valid:
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
   ```

2. Channel ID is correct:
   ```env
   TELEGRAM_CHANNEL_ID=@your_channel
   # or
   TELEGRAM_CHANNEL_ID=-1001234567890
   ```

3. Bot is admin in the channel

### "Bot not responding"

**Solution:**
```bash
# Test bot connection
node test-telegram.js
```

---

## 🖼️ Image Cache Issues

### "Image validation failed"

**Causes:**
- Image URL is not accessible
- Image format not supported (only JPEG, PNG, WebP, GIF)
- Image too large (max 5MB)

**Solution:**
1. Test image URL in browser
2. Check image format
3. Verify image size

### "Cache directory not found"

**Solution:**
```bash
# Create cache directory
mkdir -p cache/images
```

### "Cache full"

**Solution:**
1. Clear cache via admin panel: `/images` → "Clear Cache"
2. Or manually:
   ```bash
   rm -rf cache/images/*
   ```

---

## 🔑 Keyword Management Issues

### "Failed to add keyword"

**Check:**
1. Keywords table exists:
   ```bash
   psql <connection-string> -c "\d search_keywords"
   ```

2. Run keywords schema if missing:
   ```bash
   psql <connection-string> -f supabase-keywords-schema.sql
   ```

### "Duplicate keyword error"

**Cause:** Keyword already exists for that platform

**Solution:** Delete the existing keyword first or use a different keyword

---

## 📝 Manual Posting Issues

### "Product already posted"

**Cause:** Duplicate detection - product ID already in database

**Solution:**
1. Use a different product ID
2. Or delete the existing entry from `posted_deals` table

### "Invalid image URL"

**Solution:**
1. Validate image URL first in `/images` page
2. Ensure image is accessible
3. Check image format and size

---

## 🚀 Performance Issues

### "Bot is slow"

**Check:**
1. Database connection pooling
2. Image cache size (clear if > 100MB)
3. Log file size (rotate if > 100MB)
4. Memory usage

**Solutions:**
```bash
# Clear image cache
curl -X POST http://localhost:3000/admin/images/clear-cache \
  -H "X-Admin-Signature: <signature>" \
  -H "X-Admin-Timestamp: <timestamp>"

# Rotate logs
mv logs/bot.log logs/bot.log.old
```

### "High memory usage"

**Check:**
1. Image cache size
2. Number of cached products
3. Log file size

**Solution:**
```bash
# Restart with PM2
pm2 restart affiliate-bot

# Or restart manually
# Stop (Ctrl+C) and start again
npm start
```

---

## 🔍 Debugging Tips

### Enable Debug Logging

Add to `.env`:
```env
DEBUG=true
LOG_LEVEL=debug
```

### Check Health Status

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "checks": {
    "server": true,
    "database": true,
    "telegram": true,
    "scheduler": true,
    "imageCache": true
  }
}
```

### View Logs

**Backend logs:**
```bash
# If using PM2
pm2 logs affiliate-bot

# If running directly
tail -f logs/bot.log
```

**Admin panel logs:**
- Open browser DevTools (F12)
- Go to Console tab
- Check for errors

### Test API Endpoints

```bash
# Test health
curl http://localhost:3000/health

# Test image validation
curl -X POST http://localhost:3000/api/images/validate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/image.jpg"}'
```

---

## 🆘 Still Having Issues?

### Diagnostic Checklist

Run through this checklist:

1. **Environment Variables**
   ```bash
   node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌'); console.log('ADMIN_API_SECRET:', process.env.ADMIN_API_SECRET ? '✅' : '❌'); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');"
   ```

2. **Database Connection**
   ```bash
   node test-database-module.js
   ```

3. **Telegram Bot**
   ```bash
   node test-telegram.js
   ```

4. **All Features**
   ```bash
   node test-new-features.js
   ```

5. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

### Clean Slate Restart

If all else fails:

```bash
# Stop everything
pm2 stop all  # or Ctrl+C if running directly

# Clean cache
rm -rf cache/images/*
rm -rf admin-panel/.next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install
cd admin-panel && npm install && cd ..

# Restart
npm start

# In another terminal
cd admin-panel && npm run dev
```

---

## 📞 Getting Help

### Information to Provide

When asking for help, include:

1. **Error message** (full text)
2. **Steps to reproduce**
3. **Environment**:
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - OS: Windows/Mac/Linux
4. **Logs**:
   - Backend logs
   - Browser console errors
5. **Health check output**:
   ```bash
   curl http://localhost:3000/health
   ```

### Useful Commands

```bash
# Check versions
node --version
npm --version

# Check running processes
pm2 list  # if using PM2
lsof -i :3000  # check what's using port 3000

# Check disk space
df -h

# Check memory
free -h  # Linux
vm_stat  # Mac
```

---

## ✅ Prevention Tips

### Regular Maintenance

1. **Weekly:**
   - Clear image cache if > 50MB
   - Review error logs
   - Check keyword performance

2. **Monthly:**
   - Update dependencies: `npm update`
   - Rotate secrets (every 90 days)
   - Database maintenance

3. **Always:**
   - Monitor health endpoint
   - Keep backups of `.env`
   - Test after changes

---

**Most issues can be resolved by:**
1. Checking environment variables
2. Verifying database connection
3. Restarting the services
4. Clearing caches

**Remember:** The hydration warnings are harmless and already suppressed! 🎉

