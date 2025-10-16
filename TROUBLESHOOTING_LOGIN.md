# 🔧 Admin Login Troubleshooting Guide

## Quick Diagnosis Steps

### Step 1: Verify Bot is Running

```bash
# Check if bot is running
curl http://localhost:3000/health

# Or in PowerShell
Invoke-WebRequest -Uri http://localhost:3000/health
```

**Expected Response**: `{"status":"ok","timestamp":"..."}`

**If bot is not running**:
```bash
npm start
```

---

### Step 2: Verify Admin User Exists

Your admin user:
- **Username**: `Aniruddha`
- **Email**: `aniruddhagayki0@gmail.com`
- **Created**: 2025-10-10 11:41:42
- **Status**: Active ✅

If you forgot your password, you can reset it by running:
```bash
node create-admin-user.js
```
(This will let you create a new user or update existing one)

---

### Step 3: Test Login from Command Line

I've created a test script for you. Update it with your password and run:

```bash
# Edit the file first
# Change TEST_PASSWORD to your actual password

node test-admin-login.js
```

This will test:
1. ✅ Bot health check
2. ✅ Login endpoint
3. ✅ HMAC authentication

---

### Step 4: Check Browser Console

1. Open admin panel: `http://localhost:3001`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to login
5. Look for error messages

**Common errors and solutions**:

#### Error: "Network Error" or "Failed to fetch"
**Cause**: Bot is not running or wrong URL
**Solution**: 
- Start bot: `npm start`
- Check `admin-panel/.env.local` has correct URL: `NEXT_PUBLIC_API_URL=http://localhost:3000`

#### Error: "Invalid credentials"
**Cause**: Wrong username or password
**Solution**: 
- Verify username is exactly: `Aniruddha` (case-sensitive!)
- If you forgot password, create new user: `node create-admin-user.js`

#### Error: "CORS error"
**Cause**: CORS not configured
**Solution**: 
- Check bot's `.env` has: `ADMIN_API_ALLOWED_ORIGIN=http://localhost:3001`
- Restart bot after changing

#### Error: "Invalid admin signature"
**Cause**: Secrets don't match
**Solution**: 
- Verify secrets match in both files:
  - Bot `.env`: `ADMIN_API_SECRET=your-admin-api-secret-change-this`
  - Admin panel `.env.local`: `NEXT_PUBLIC_ADMIN_API_SECRET=your-admin-api-secret-change-this`
- Restart both bot and admin panel

---

### Step 5: Check Network Tab

1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Try to login
4. Look for the `/admin/auth/login` request
5. Click on it to see details

**What to check**:
- **Status Code**: Should be 200 (success) or 401 (wrong credentials)
- **Request Payload**: Should have `username` and `password`
- **Response**: Should have `token` and `user` if successful

---

## Common Issues and Solutions

### Issue 1: "Cannot connect to bot"

**Symptoms**: Login button does nothing, or shows network error

**Diagnosis**:
```bash
# Test if bot is accessible
curl http://localhost:3000/health
```

**Solutions**:
1. Start the bot: `npm start`
2. Check firewall isn't blocking port 3000
3. Verify `NEXT_PUBLIC_API_URL` in `admin-panel/.env.local`

---

### Issue 2: "Invalid credentials" (but password is correct)

**Symptoms**: Login fails even with correct password

**Possible Causes**:
1. Username is case-sensitive (must be exactly `Aniruddha`)
2. Password has extra spaces
3. Database connection issue

**Solutions**:
1. Try creating a new admin user:
   ```bash
   node create-admin-user.js
   ```
2. Use a simple password for testing (e.g., `admin123`)
3. Check bot logs for database errors

---

### Issue 3: Login succeeds but redirects back to login

**Symptoms**: Login appears to work but immediately redirects back

**Cause**: Token not being stored or validated correctly

**Solutions**:
1. Clear browser localStorage:
   - Open Console (F12)
   - Type: `localStorage.clear()`
   - Press Enter
   - Refresh page
2. Check browser console for JavaScript errors
3. Verify `isAuthenticated()` function in `admin-panel/lib/utils.ts`

---

### Issue 4: CORS errors in browser console

**Symptoms**: Error message about CORS policy

**Solution**:
1. Edit bot's `.env`:
   ```env
   ADMIN_API_ALLOWED_ORIGIN=http://localhost:3001
   ```
2. Restart bot: `npm start`
3. Clear browser cache and reload

---

## Manual Login Test (Using curl)

Test the login endpoint directly:

```bash
# Windows PowerShell
$body = @{
    username = "Aniruddha"
    password = "your-password-here"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/admin/auth/login `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

```bash
# Linux/Mac
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Aniruddha","password":"your-password-here"}'
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "Aniruddha",
    "email": "aniruddhagayki0@gmail.com"
  }
}
```

---

## Reset Everything (Nuclear Option)

If nothing works, reset everything:

### 1. Stop all processes
```bash
# Press Ctrl+C in bot terminal
# Press Ctrl+C in admin panel terminal
```

### 2. Clear browser data
- Open browser settings
- Clear cache and cookies for localhost
- Or use Incognito/Private mode

### 3. Recreate admin user
```bash
node create-admin-user.js
# Use simple credentials for testing:
# Username: admin
# Password: admin123
```

### 4. Restart bot
```bash
npm start
```

### 5. Restart admin panel
```bash
cd admin-panel
npm run dev
```

### 6. Try login again
- Go to `http://localhost:3001`
- Username: `admin`
- Password: `admin123`

---

## Still Not Working?

### Collect Debug Information

1. **Bot logs**: Copy the output from `npm start`
2. **Browser console**: Copy any error messages (F12 → Console)
3. **Network tab**: Screenshot of failed request (F12 → Network)
4. **Test script output**: Run `node test-admin-login.js` and copy output

### Check These Files

1. **Bot `.env`** (lines 69-78):
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ADMIN_API_SECRET=your-admin-api-secret-change-this
   ADMIN_API_ALLOWED_ORIGIN=http://localhost:3001
   ADMIN_API_CLOCK_SKEW_SEC=120
   ```

2. **Admin Panel `.env.local`**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_ADMIN_API_SECRET=your-admin-api-secret-change-this
   ```

3. **Verify secrets match**: `ADMIN_API_SECRET` must be identical in both files!

---

## Quick Checklist

Before asking for help, verify:

- [ ] Bot is running (`npm start`)
- [ ] Admin panel is running (`cd admin-panel && npm run dev`)
- [ ] Admin user exists (check database or create new one)
- [ ] Secrets match in `.env` and `.env.local`
- [ ] CORS origin is set correctly
- [ ] Browser console shows no errors
- [ ] Network tab shows request is being sent
- [ ] Tried clearing browser cache/localStorage
- [ ] Tested with `test-admin-login.js` script

---

**Need more help? Share the output from `node test-admin-login.js` and browser console errors!**

