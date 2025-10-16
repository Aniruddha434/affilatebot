# Search Improvements - Quick Reference Guide

## 🎯 What Was Fixed

### Problem 1: Duplicate Results ✅ FIXED
**Before:** Same products appeared for different keyword searches  
**After:** Each keyword returns unique, relevant products

### Problem 2: Low Product Coverage ✅ FIXED
**Before:** Only 5-10 products per search  
**After:** 25-50+ products per search (5x increase)

---

## 🚀 Quick Start

### 1. Test the Improvements
```bash
# Run the test suite
node test-search-improvements.js
```

Expected output:
- ✅ Keyword-aware mock data generation
- ✅ Search result diversity
- ✅ Cache functionality
- ✅ Increased product coverage

### 2. Add Keywords via Admin Panel
1. Open admin panel: `http://localhost:3000/admin`
2. Navigate to "Keywords" section
3. Add new keywords like:
   - "gaming laptop"
   - "wireless headphones"
   - "running shoes"
   - "smart home devices"

### 3. Verify Keyword Usage
```bash
# Start the bot
npm start

# Check logs for:
# "Selected keyword from database: ..."
# "Fetched X products from Y platform"
```

---

## 📊 Key Improvements

### Keyword Management
- **Database Integration:** Scheduler now uses database keywords
- **Rotation:** Least-recently-used keyword selection
- **Fallback:** 20 hardcoded keywords if database empty
- **Tracking:** Usage count incremented automatically

### Mock Data Generation
- **Keyword-Aware:** Products match search intent
- **Category Detection:** Auto-detects electronics, fashion, home, etc.
- **Diverse Products:** 8+ templates per category
- **Realistic Data:** Dynamic pricing, brands, discounts

### Caching System
- **Keyword-Based Keys:** Each search cached separately
- **15-Minute TTL:** Balances freshness and performance
- **LRU Eviction:** Automatic cleanup when full
- **Statistics:** Monitor cache hit rate

### Product Coverage
- **5x Multiplier:** Fetches 50 products instead of 10
- **No Artificial Limits:** Returns all fetched products
- **Platform-Aware:** Each platform contributes proportionally

---

## 🔧 Configuration

### Environment Variables
```bash
# Increase products per run (default: 10)
MAX_PRODUCTS_PER_RUN=50

# Adjust cron schedule (default: every 2 hours)
CRON_SCHEDULE="0 */2 * * *"
```

### Cache Settings
Edit `src/modules/SearchCache.js`:
```javascript
this.defaultTTL = 15 * 60 * 1000;  // 15 minutes
this.maxCacheSize = 1000;  // Max cached entries
```

---

## 📈 Monitoring

### Check Cache Statistics
```javascript
const searchCache = require('./src/modules/SearchCache');
console.log(searchCache.getStats());
```

Output:
```json
{
  "size": 15,
  "maxSize": 1000,
  "hits": 42,
  "misses": 15,
  "sets": 15,
  "evictions": 0,
  "hitRate": "73.68%",
  "defaultTTL": "900s"
}
```

### View Cached Keywords
```javascript
console.log(searchCache.getCachedKeywords());
// Output: ['laptop deals', 'fashion sale', 'headphones', ...]
```

### Clear Cache
```javascript
searchCache.clear();  // Clear all entries
searchCache.invalidate('laptop');  // Clear entries matching pattern
```

---

## 🧪 Testing Different Scenarios

### Test 1: Keyword Diversity
```javascript
const amazonAdapter = require('./src/modules/platforms/AmazonAdapter');

// Search 1
const products1 = await amazonAdapter.searchProducts('laptop deals', { maxResults: 20 });
console.log('Laptops:', products1.map(p => p.title));

// Search 2
const products2 = await amazonAdapter.searchProducts('fashion sale', { maxResults: 20 });
console.log('Fashion:', products2.map(p => p.title));

// Verify they're different
console.log('Different?', products1[0].title !== products2[0].title);
```

### Test 2: Cache Hit/Miss
```javascript
const searchCache = require('./src/modules/SearchCache');

// First search (miss)
let products = await platformManager.fetchFromAllPlatforms('headphones', 50);
searchCache.set('headphones', products, 'all');
console.log('Stats:', searchCache.getStats());  // 1 miss, 1 set

// Second search (hit)
products = searchCache.get('headphones', 'all');
console.log('Stats:', searchCache.getStats());  // 1 hit
```

### Test 3: Increased Coverage
```javascript
// Before: 10 products
const products = await platformManager.fetchFromAllPlatforms('deals', 10);
console.log('Count:', products.length);  // ~10

// After: 50 products
const moreProducts = await platformManager.fetchFromAllPlatforms('deals', 50);
console.log('Count:', moreProducts.length);  // ~50
```

---

## 🐛 Troubleshooting

### Issue: Still seeing duplicate results
**Solution:** Clear cache and restart
```bash
# In Node.js console
searchCache.clear();
# Restart the bot
npm start
```

### Issue: Not enough products
**Check:**
1. Platform settings in database (min discount, price filters)
2. Keyword relevance to platform
3. Mock data vs real API usage

### Issue: Keywords not rotating
**Check:**
1. Database connection working
2. Keywords added to database
3. Scheduler logs for "Selected keyword from database"

### Issue: Cache not working
**Check:**
1. SearchCache module imported correctly
2. Cache.set() called after fetching
3. Cache.get() called before fetching

---

## 📝 API Endpoints

### Get Cache Statistics
```bash
GET /admin/cache/stats
Authorization: Bearer YOUR_TOKEN
```

### Clear Cache
```bash
POST /admin/cache/clear
Authorization: Bearer YOUR_TOKEN
```

### Get Keywords
```bash
GET /admin/keywords
Authorization: Bearer YOUR_TOKEN
```

### Add Keyword
```bash
POST /admin/keywords
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "keyword": "gaming laptop",
  "platform": null
}
```

---

## 🎓 Best Practices

### Keyword Management
1. Add 20-30 diverse keywords to database
2. Mix broad terms ("deals") with specific ("wireless headphones")
3. Include platform-specific keywords (fashion for Myntra, mobiles for Flipkart)
4. Monitor usage counts and add more for underused categories

### Cache Management
1. Monitor hit rate (aim for >60%)
2. Adjust TTL based on product freshness needs
3. Clear cache after major platform setting changes
4. Use invalidate() for targeted cache clearing

### Performance Optimization
1. Start with MAX_PRODUCTS_PER_RUN=50
2. Increase if you need more variety
3. Monitor API rate limits
4. Use cache to reduce API calls

---

## 📚 Related Files

- `src/scheduler.js` - Main scheduler with keyword integration
- `src/modules/SearchCache.js` - Caching layer
- `src/modules/platforms/PlatformManager.js` - Multi-platform orchestration
- `src/modules/platforms/AmazonAdapter.js` - Amazon integration
- `src/modules/platforms/FlipkartAdapter.js` - Flipkart integration
- `src/modules/platforms/MyntraAdapter.js` - Myntra integration
- `test-search-improvements.js` - Test suite

---

## 🆘 Support

If you encounter issues:
1. Check logs for error messages
2. Run test suite: `node test-search-improvements.js`
3. Verify database connection
4. Check platform adapter initialization
5. Review cache statistics

---

**Last Updated:** 2025-10-15  
**Version:** 2.0  
**Status:** ✅ Production Ready

