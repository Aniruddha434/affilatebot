# 🚀 Affiliate Bot Upgrade Guide

## Overview

This guide covers the major upgrades implemented to transform the affiliate bot into an A-grade production-ready system with enhanced security, image management, and comprehensive admin panel features.

---

## 🆕 New Features

### 1. **Image Sharing & Management API**

#### Features:
- **Image Proxy**: Automatically caches and serves product images
- **Image Validation**: Validates image URLs before posting
- **Cache Management**: Automatic cleanup and manual cache control
- **Statistics**: Track cache usage and performance

#### API Endpoints:
```
GET  /api/images/proxy?url=<image_url>     - Proxy and cache images
POST /api/images/validate                   - Validate image URL
GET  /admin/images/stats                    - Get cache statistics
POST /admin/images/clear-cache              - Clear image cache
```

#### Admin Panel:
- Navigate to **Images** page from dashboard
- View cache statistics (total images, size, usage)
- Validate image URLs with preview
- Clear cache with one click

---

### 2. **Manual Product Posting**

#### Features:
- Post products manually without waiting for automated jobs
- Full product form with validation
- Auto-calculate discount percentage
- Image URL validation before posting
- Duplicate detection

#### Admin Panel:
- Navigate to **Manual Post** page from dashboard
- Fill in product details (platform, title, prices, URLs)
- Preview and post to Telegram instantly

---

### 3. **Keyword Management System**

#### Features:
- Add/remove search keywords dynamically
- Platform-specific or global keywords
- Track keyword usage statistics
- Keywords used for automated product discovery

#### Database Schema:
```sql
-- Run: supabase-keywords-schema.sql
CREATE TABLE search_keywords (
  id BIGSERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('amazon', 'flipkart', 'myntra')),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### API Endpoints:
```
GET    /admin/keywords           - Get all keywords
POST   /admin/keywords           - Add new keyword
DELETE /admin/keywords/:id       - Delete keyword
```

#### Admin Panel:
- Navigate to **Keywords** page from dashboard
- View all keywords with platform filters
- Add new keywords (global or platform-specific)
- Delete keywords with confirmation

---

### 4. **Enhanced Security**

#### New Security Features:
- **Rate Limiting**: Login endpoint limited to 5 attempts per 15 minutes
- **Secure Secret Generation**: Cryptographically secure secrets
- **Input Validation**: Comprehensive validation for all API inputs
- **HMAC Verification**: Timing-safe signature comparison
- **Encryption Utilities**: AES-256-GCM encryption/decryption

#### Security Utilities (`src/utils/security.js`):
```javascript
const { generateSecureSecret, checkRateLimit, encrypt, decrypt } = require('./utils/security');

// Generate secure secrets
const secrets = generateAllSecrets();

// Rate limiting
const rateLimit = checkRateLimit(store, key, maxAttempts, windowMs);

// Encryption
const encrypted = encrypt(plaintext, key);
const decrypted = decrypt(encrypted.encrypted, key, encrypted.iv, encrypted.authTag);
```

#### Validation Utilities (`src/utils/validation.js`):
```javascript
const { validateProduct, validatePlatformSettings, validateConfigUpdate } = require('./utils/validation');

// Validate product data
validateProduct(product);

// Validate platform settings
const validated = validatePlatformSettings(settings);
```

---

### 5. **Comprehensive Health Checks**

#### Enhanced `/health` Endpoint:
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

---

## 🔧 Installation & Setup

### 1. **Install Dependencies**

No new dependencies required! All features use existing packages.

### 2. **Database Setup**

Run the new SQL schema for keywords:

```bash
# Connect to your Supabase project
psql <your-supabase-connection-string>

# Run the schema
\i supabase-keywords-schema.sql
```

### 3. **Generate Secure Secrets**

```bash
node generate-secrets.js
```

This will generate:
- `JWT_SECRET`
- `ADMIN_API_SECRET`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`

**Copy these to your `.env` file and delete `secrets.txt`**

### 4. **Update Environment Variables**

Add to your `.env`:

```env
# Security (REPLACE WITH GENERATED SECRETS!)
JWT_SECRET=<generated-secret>
ADMIN_API_SECRET=<generated-secret>
SESSION_SECRET=<generated-secret>
ENCRYPTION_KEY=<generated-secret>

# Image Cache Settings (Optional)
IMAGE_CACHE_DIR=./cache/images
IMAGE_CACHE_MAX_SIZE=104857600  # 100MB
IMAGE_MAX_SIZE=5242880           # 5MB
```

### 5. **Start the Bot**

```bash
# Backend
npm start

# Admin Panel (in separate terminal)
cd admin-panel
npm run dev
```

---

## 📚 API Documentation

### Image Management

#### Proxy Image
```http
GET /api/images/proxy?url=<encoded-url>
```

**Response**: Image binary data with appropriate `Content-Type`

#### Validate Image URL
```http
POST /api/images/validate
Content-Type: application/json

{
  "url": "https://example.com/image.jpg"
}
```

**Response**:
```json
{
  "valid": true,
  "url": "https://example.com/image.jpg"
}
```

### Manual Posting

#### Post Product Manually
```http
POST /admin/deals/manual
X-Admin-Signature: <hmac-signature>
X-Admin-Timestamp: <iso-timestamp>
Content-Type: application/json

{
  "platform": "amazon",
  "productId": "B08N5WRWNW",
  "title": "Product Title",
  "currentPrice": 999,
  "originalPrice": 1999,
  "discountPercentage": 50,
  "imageUrl": "https://...",
  "productUrl": "https://...",
  "category": "Electronics",
  "brand": "Samsung"
}
```

### Keyword Management

#### Get All Keywords
```http
GET /admin/keywords
X-Admin-Signature: <hmac-signature>
X-Admin-Timestamp: <iso-timestamp>
```

#### Add Keyword
```http
POST /admin/keywords
X-Admin-Signature: <hmac-signature>
X-Admin-Timestamp: <iso-timestamp>
Content-Type: application/json

{
  "keyword": "laptop",
  "platform": "amazon"  // Optional: null for global
}
```

#### Delete Keyword
```http
DELETE /admin/keywords/:id
X-Admin-Signature: <hmac-signature>
X-Admin-Timestamp: <iso-timestamp>
```

---

## 🔒 Security Best Practices

### 1. **Secret Management**
- ✅ Generate unique secrets for each environment
- ✅ Never commit secrets to version control
- ✅ Rotate secrets every 90 days
- ✅ Use different secrets for dev/staging/production

### 2. **Rate Limiting**
- Login: 5 attempts per 15 minutes per IP
- Automatic cleanup of rate limit store every 5 minutes

### 3. **Input Validation**
- All admin API endpoints validate inputs
- Product data validated before posting
- Image URLs validated before caching

### 4. **HMAC Authentication**
- All admin endpoints (except login) require HMAC signature
- Timing-safe signature comparison prevents timing attacks
- Clock skew tolerance: 120 seconds

---

## 📊 Monitoring & Maintenance

### Image Cache Maintenance
- Automatic cleanup after 7 days of inactivity
- Manual cleanup via admin panel
- Monitor cache usage in Images page

### Keyword Performance
- Track keyword usage counts
- Remove underperforming keywords
- Add new keywords based on trends

### Health Monitoring
- Check `/health` endpoint regularly
- Monitor all subsystems (database, Telegram, scheduler, cache)
- Set up alerts for degraded status

---

## 🎯 Next Steps

### Recommended Enhancements:
1. **Testing**: Add unit tests for new modules
2. **Analytics**: Enhanced keyword performance tracking
3. **Notifications**: Email/SMS alerts for critical errors
4. **Backup**: Automated database backups
5. **Scaling**: Redis for distributed caching

---

## 📞 Support

For issues or questions:
1. Check the logs in admin panel
2. Review health check status
3. Verify environment variables
4. Check database connectivity

---

## 📝 Changelog

### Version 2.0.0 (Current)

**Added:**
- Image sharing and caching API
- Manual product posting interface
- Keyword management system
- Enhanced security utilities
- Comprehensive health checks
- Rate limiting on authentication
- Input validation framework

**Improved:**
- Admin panel navigation
- Error handling and logging
- Database operations
- API documentation

**Security:**
- Secure secret generation
- Rate limiting
- Input validation
- Timing-safe comparisons

---

**Congratulations! Your affiliate bot is now production-ready! 🎉**

