# 🎛️ Admin Panel Setup Guide

Complete guide for setting up and using the Amazon Affiliate Telegram Bot Admin Panel.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Creating Admin User](#creating-admin-user)
6. [Running the Admin Panel](#running-the-admin-panel)
7. [Features Guide](#features-guide)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

The Admin Panel is a modern web application that provides a graphical interface for managing your Amazon Affiliate Telegram Bot. It offers:

- **Real-time monitoring** of bot status and performance
- **Bot control** (start, stop, manual trigger)
- **Configuration management** without editing files
- **Analytics and reporting**
- **Log viewing and filtering**
- **Deals management**

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, SWR

---

## ✅ Prerequisites

Before setting up the admin panel, ensure you have:

1. ✅ **Bot installed and configured** (see main README.md)
2. ✅ **Bot database setup complete** (Supabase tables created)
3. ✅ **Node.js v16+** installed
4. ✅ **Bot running** on port 3000 (or configured port)

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

The admin panel dependencies should already be installed. If not:

```bash
cd admin-panel
npm install
```

### Step 2: Configure Environment Variables

Edit `admin-panel/.env.local`:

```env
# Bot API URL (where your bot is running)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Admin API Secret (must match bot's ADMIN_API_SECRET)
NEXT_PUBLIC_ADMIN_API_SECRET=your-admin-api-secret-change-this
```

**Important**: The `NEXT_PUBLIC_ADMIN_API_SECRET` must match the `ADMIN_API_SECRET` in your bot's `.env` file!

### Step 3: Update Bot Configuration

Ensure your bot's `.env` file has these settings:

```env
# JWT secret for admin authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin API secret for HMAC authentication
ADMIN_API_SECRET=your-admin-api-secret-change-this

# Allowed origin for admin panel (CORS)
ADMIN_API_ALLOWED_ORIGIN=http://localhost:3001

# Clock skew tolerance in seconds
ADMIN_API_CLOCK_SKEW_SEC=120
```

---

## 👤 Creating Admin User

### Step 1: Run the Admin User Creation Script

From the **bot root directory** (not admin-panel):

```bash
node create-admin-user.js
```

### Step 2: Follow the Prompts

```
Enter admin username: admin
Enter admin email: admin@example.com
Enter admin password: ********
Confirm password: ********
```

**Password Requirements**:
- Minimum 8 characters
- Stored securely with bcrypt hashing

### Step 3: Verify Creation

You should see:

```
✅ Admin user created successfully!

Username: admin
Email: admin@example.com
Created: 2025-01-10T...

You can now login to the admin panel with these credentials.
```

---

## 🏃 Running the Admin Panel

### Development Mode

```bash
cd admin-panel
npm run dev
```

The admin panel will be available at: **http://localhost:3001**

### Production Mode

```bash
cd admin-panel
npm run build
npm start
```

---

## 🎮 Features Guide

### 1. Login Page

- Navigate to `http://localhost:3001`
- Enter your admin username and password
- Click "Sign in"
- You'll be redirected to the dashboard

### 2. Dashboard

**Status Cards**:
- 🟢 **Bot Status**: Shows if bot is running or stopped
- ⏱️ **Uptime**: How long the bot has been running
- 📊 **Total Deals**: Number of deals posted
- 💾 **Memory Usage**: Current memory consumption

**Bot Controls**:
- ▶️ **Start Bot**: Starts the scheduler (if stopped)
- ⏸️ **Stop Bot**: Gracefully stops the scheduler
- 🚀 **Trigger Job Now**: Manually runs a deal-finding job

**Analytics (7-Day Summary)**:
- Deals Posted
- Deals Found
- API Calls
- Success Rate

**Recent Deals**:
- Shows last 5 posted deals
- Displays discount percentage
- Shows time posted

### 3. Real-time Updates

The dashboard automatically refreshes:
- **Bot Status**: Every 5 seconds
- **Stats**: Every 10 seconds
- **Analytics**: Every 30 seconds
- **Recent Deals**: Every 30 seconds

---

## 🐛 Troubleshooting

### Problem: "ADMIN_API_SECRET not configured"

**Solution**:
1. Check that `.env.local` exists in `admin-panel/` directory
2. Verify `NEXT_PUBLIC_ADMIN_API_SECRET` is set
3. Restart the development server: `npm run dev`

### Problem: "Invalid admin signature"

**Causes**:
- Secrets don't match between bot and admin panel
- System clock is out of sync

**Solution**:
1. Verify `ADMIN_API_SECRET` in bot's `.env` matches `NEXT_PUBLIC_ADMIN_API_SECRET` in admin panel's `.env.local`
2. Check system time is correct
3. Increase `ADMIN_API_CLOCK_SKEW_SEC` if needed (default: 120 seconds)

### Problem: "Login failed" or "Invalid credentials"

**Solution**:
1. Ensure bot is running: `npm start` in bot directory
2. Check `NEXT_PUBLIC_API_URL` points to correct bot URL
3. Verify admin user exists: Run `node create-admin-user.js` again
4. Check bot logs for authentication errors

### Problem: CORS Errors

**Solution**:
1. Set `ADMIN_API_ALLOWED_ORIGIN=http://localhost:3001` in bot's `.env`
2. Restart the bot
3. Clear browser cache and reload admin panel

### Problem: "Cannot connect to bot"

**Solution**:
1. Verify bot is running: Check `http://localhost:3000/health`
2. Check firewall settings
3. Verify `NEXT_PUBLIC_API_URL` is correct
4. Check bot logs for errors

---

## 🔒 Security Best Practices

### 1. Strong Secrets

Generate strong, random secrets:

```bash
# Generate random secret (Linux/Mac)
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Environment Variables

- ❌ **Never commit** `.env` or `.env.local` files
- ✅ **Use different secrets** for development and production
- ✅ **Rotate secrets** regularly (every 3-6 months)

### 3. HTTPS in Production

- ✅ Always use HTTPS for production deployments
- ✅ Use SSL/TLS certificates (Let's Encrypt is free)
- ✅ Set `ADMIN_API_ALLOWED_ORIGIN` to your production domain

### 4. Access Control

- ✅ Limit admin users to trusted personnel only
- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ✅ Monitor access logs regularly
- ✅ Disable unused admin accounts

### 5. Network Security

- ✅ Use firewall rules to restrict access
- ✅ Consider VPN for remote access
- ✅ Use fail2ban or similar for brute-force protection

---

## 📊 Architecture Overview

```
┌─────────────────┐         HTTPS/HTTP          ┌──────────────────┐
│                 │◄──────────────────────────►│                  │
│  Admin Panel    │    HMAC-authenticated      │   Bot API        │
│  (Next.js)      │         requests           │   (Express)      │
│  Port: 3001     │                            │   Port: 3000     │
│                 │                            │                  │
└─────────────────┘                            └──────────────────┘
                                                        │
                                                        │
                                                        ▼
                                                ┌──────────────────┐
                                                │                  │
                                                │   Supabase DB    │
                                                │   (PostgreSQL)   │
                                                │                  │
                                                └──────────────────┘
```

### Authentication Flow

1. **Login**: User submits username/password
2. **JWT Token**: Bot validates and returns JWT token
3. **Token Storage**: Admin panel stores token in localStorage
4. **HMAC Signing**: All subsequent requests signed with HMAC-SHA256
5. **Validation**: Bot validates both JWT and HMAC signature

---

## 🎓 Next Steps

After setup, you can:

1. **Monitor bot performance** in real-time
2. **Control bot operations** without SSH/terminal access
3. **View and analyze** deal posting history
4. **Troubleshoot issues** using the log viewer
5. **Optimize configuration** based on analytics

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check bot logs: `npm start` output
2. Check browser console for errors (F12)
3. Verify all environment variables are set correctly
4. Ensure bot and admin panel are on compatible versions

---

**Happy bot managing! 🎛️**

