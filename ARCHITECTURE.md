# 🏗️ System Architecture

## 📊 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Amazon Affiliate Bot                         │
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Scheduler  │─────▶│  Orchestrator│─────▶│   Telegram   │  │
│  │  (node-cron) │      │   (index.js) │      │   Channel    │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                                │
│         │                      ▼                                │
│         │              ┌──────────────┐                         │
│         └─────────────▶│  Amazon API  │                         │
│                        │   Module     │                         │
│                        └──────────────┘                         │
│                                │                                │
│                                ▼                                │
│                        ┌──────────────┐                         │
│                        │   Supabase   │                         │
│                        │   Database   │                         │
│                        └──────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
1. TRIGGER (Every 2 hours)
   │
   ▼
2. SEARCH Amazon PA-API
   │ (Keywords: "electronics deals", etc.)
   ▼
3. FILTER Products
   │ (Discount >= 50%, In Stock)
   ▼
4. CHECK Database
   │ (Already posted?)
   ▼
5. POST to Telegram
   │ (Formatted message + image)
   ▼
6. SAVE to Database
   │ (Mark as posted)
   ▼
7. COMPLETE
```

## 📁 Module Breakdown

### 1. **index.js** (Main Entry Point)
```
Responsibilities:
├── Load environment variables
├── Validate configuration
├── Initialize all modules
├── Start Express server (health checks)
├── Handle graceful shutdown
└── Error handling
```

### 2. **scheduler.js** (Cron Job Manager)
```
Responsibilities:
├── Schedule jobs (every 2 hours)
├── Orchestrate the deal-finding process
├── Coordinate between modules
├── Handle retries and errors
└── Cleanup old database entries
```

### 3. **modules/amazonAPI.js** (Amazon Integration)
```
Responsibilities:
├── Generate AWS Signature V4
├── Make authenticated API requests
├── Search for products
├── Filter by discount percentage
├── Filter by availability
├── Generate affiliate links
└── Handle API errors
```

### 4. **modules/telegramBot.js** (Telegram Integration)
```
Responsibilities:
├── Initialize Telegram bot
├── Format deal messages
├── Send messages with images
├── Handle rate limits (1 msg/sec)
├── Send notifications
└── Escape special characters
```

### 5. **modules/database.js** (Supabase Integration)
```
Responsibilities:
├── Initialize Supabase client
├── Check if product already posted
├── Mark products as posted
├── Get statistics
├── Cleanup old entries
└── Handle database errors
```

### 6. **utils/logger.js** (Logging)
```
Responsibilities:
├── Info messages (ℹ️)
├── Success messages (✅)
├── Error messages (❌)
├── Warning messages (⚠️)
└── Debug messages (🐛)
```

### 7. **utils/helpers.js** (Utilities)
```
Responsibilities:
├── Calculate discount percentage
├── Format prices (₹)
├── Retry with backoff
├── Validate environment variables
├── Sleep function
└── Text sanitization
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Environment Variables (.env)                             │
│     └── All credentials stored securely                      │
│                                                              │
│  2. AWS Signature V4                                         │
│     └── Signed requests to Amazon API                        │
│                                                              │
│  3. Supabase Row Level Security (RLS)                        │
│     └── Database access control                              │
│                                                              │
│  4. Telegram Bot Token                                       │
│     └── Authenticated bot communication                      │
│                                                              │
│  5. Error Handling                                           │
│     └── No credential leakage in logs                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ⚡ Performance Optimizations

### 1. **Retry Logic**
- Exponential backoff for failed requests
- Max 3 retries with increasing delays
- Prevents API rate limit issues

### 2. **Rate Limiting**
- 1.5 second delay between Telegram messages
- Prevents Telegram API throttling
- Ensures reliable delivery

### 3. **Database Indexing**
```sql
CREATE INDEX idx_asin ON posted_deals(asin);        -- Fast duplicate checks
CREATE INDEX idx_posted_at ON posted_deals(posted_at); -- Fast date queries
```

### 4. **Efficient Filtering**
- Filter products at API level when possible
- Early return for invalid products
- Minimize database queries

## 🔄 Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Handling Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  API Error                                                   │
│    ├── Log error details                                     │
│    ├── Retry with backoff (3 attempts)                       │
│    ├── Send notification to Telegram                         │
│    └── Continue to next scheduled run                        │
│                                                              │
│  Database Error                                              │
│    ├── Log error details                                     │
│    ├── Assume product not posted (fail-safe)                 │
│    └── Continue processing                                   │
│                                                              │
│  Telegram Error                                              │
│    ├── Log error details                                     │
│    ├── Skip this product                                     │
│    └── Continue with next product                            │
│                                                              │
│  Fatal Error                                                 │
│    ├── Log full stack trace                                  │
│    ├── Graceful shutdown                                     │
│    └── PM2 auto-restart (if configured)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

```sql
┌─────────────────────────────────────────────────────────────┐
│                    posted_deals Table                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  id                  SERIAL PRIMARY KEY                      │
│  asin                VARCHAR(20) UNIQUE NOT NULL             │
│  title               TEXT                                    │
│  discount_percentage INTEGER                                 │
│  posted_at           TIMESTAMP DEFAULT NOW()                 │
│  created_at          TIMESTAMP DEFAULT NOW()                 │
│                                                              │
│  Indexes:                                                    │
│    - idx_asin (for duplicate checks)                         │
│    - idx_posted_at (for date queries)                        │
│    - idx_discount (for analytics)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 API Integration Details

### Amazon Product Advertising API

**Endpoint:** `https://webservices.amazon.in/paapi5/searchitems`

**Request:**
```json
{
  "PartnerTag": "yourtag-21",
  "PartnerType": "Associates",
  "Keywords": "electronics deals",
  "SearchIndex": "All",
  "ItemCount": 10,
  "Resources": [
    "Images.Primary.Large",
    "ItemInfo.Title",
    "Offers.Listings.Price",
    "Offers.Listings.SavingBasis",
    "Offers.Listings.Availability.Message"
  ]
}
```

**Authentication:** AWS Signature Version 4

### Telegram Bot API

**Endpoint:** `https://api.telegram.org/bot{token}/sendPhoto`

**Request:**
```json
{
  "chat_id": "@channelname",
  "photo": "https://image-url.jpg",
  "caption": "Deal message",
  "parse_mode": "Markdown"
}
```

**Rate Limit:** 30 messages/second (we use 1 msg/1.5 sec to be safe)

### Supabase REST API

**Endpoint:** `https://your-project.supabase.co/rest/v1/posted_deals`

**Operations:**
- `GET` - Check if product exists
- `POST` - Insert new posted deal
- `DELETE` - Cleanup old entries

**Authentication:** Bearer token (anon key)

## 🔧 Configuration Flow

```
.env file
   │
   ▼
process.env (Node.js)
   │
   ├──▶ amazonAPI.js (Amazon credentials)
   ├──▶ telegramBot.js (Telegram credentials)
   ├──▶ database.js (Supabase credentials)
   └──▶ scheduler.js (Bot settings)
```

## 📈 Scalability Considerations

### Current Capacity
- **Products/Run:** 10 (configurable)
- **Runs/Day:** 12 (every 2 hours)
- **Max Deals/Day:** 120
- **Database:** Unlimited (Supabase free tier: 500MB)

### Scaling Options

**Horizontal Scaling:**
- Run multiple instances with different keywords
- Use different Amazon regions
- Post to multiple Telegram channels

**Vertical Scaling:**
- Increase `MAX_PRODUCTS_PER_RUN`
- Decrease `CRON_SCHEDULE` interval
- Add more search keywords

**Optimization:**
- Implement caching for API responses
- Use Redis for duplicate checking
- Batch database operations

## 🧪 Testing Strategy

### Unit Tests (Future Enhancement)
```
tests/
├── amazonAPI.test.js
├── telegramBot.test.js
├── database.test.js
└── helpers.test.js
```

### Integration Tests
```
tests/integration/
├── end-to-end.test.js
└── api-integration.test.js
```

### Manual Testing
1. Configuration validation
2. API connectivity
3. Database operations
4. Telegram posting
5. Error handling
6. Scheduled execution

## 🚀 Deployment Architecture

### Development
```
Local Machine
├── Node.js runtime
├── .env file (local credentials)
└── npm start
```

### Production (VPS)
```
Linux Server
├── Node.js runtime
├── PM2 process manager
├── .env file (production credentials)
├── Nginx (optional reverse proxy)
└── SSL certificate (optional)
```

### Production (Heroku)
```
Heroku Dyno
├── Node.js buildpack
├── Config vars (environment variables)
├── Procfile (web: node src/index.js)
└── Auto-scaling (optional)
```

## 📊 Monitoring & Observability

### Logs
- Console logs (stdout/stderr)
- PM2 logs (`~/.pm2/logs/`)
- Application logs (structured JSON)

### Metrics
- Deals posted per day
- API success/failure rate
- Database query performance
- Bot uptime percentage

### Alerts
- Telegram error notifications
- Email alerts (future enhancement)
- Slack integration (future enhancement)

## 🔮 Future Enhancements

1. **Multi-Region Support**
   - Support multiple Amazon regions simultaneously
   - Different channels for different regions

2. **Advanced Filtering**
   - Category-specific channels
   - Price range filters
   - Brand preferences

3. **Analytics Dashboard**
   - Web dashboard for statistics
   - Click tracking
   - Revenue tracking

4. **Machine Learning**
   - Predict best posting times
   - Recommend products based on engagement
   - Optimize discount thresholds

5. **User Interaction**
   - Allow users to set preferences
   - Wishlist notifications
   - Price drop alerts

---

**This architecture is designed for reliability, scalability, and maintainability.** 🏗️

