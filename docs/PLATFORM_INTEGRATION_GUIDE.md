# Multi-Platform Integration Guide

## Overview
This guide explains the architecture and process for integrating new e-commerce platforms into the affiliate bot system.

## Architecture

### Platform Abstraction Layer

The bot uses a plugin-style architecture with the following components:

1. **PlatformAdapter** (Base Class)
   - Abstract base class defining standard interface
   - Located: `src/modules/platforms/PlatformAdapter.js`
   - All platform adapters must extend this class

2. **PlatformManager** (Orchestrator)
   - Singleton managing all platform adapters
   - Handles content mix distribution
   - Located: `src/modules/platforms/PlatformManager.js`

3. **Platform-Specific Adapters**
   - AmazonAdapter: `src/modules/platforms/AmazonAdapter.js`
   - FlipkartAdapter: `src/modules/platforms/FlipkartAdapter.js`
   - MyntraAdapter: `src/modules/platforms/MyntraAdapter.js`

### Data Flow

```
Scheduler → PlatformManager → Platform Adapters → Normalize → Filter → Database → Telegram
```

## Adding a New Platform

### Step 1: Create Platform Adapter

Create a new file: `src/modules/platforms/YourPlatformAdapter.js`

```javascript
const PlatformAdapter = require('./PlatformAdapter');
const axios = require('axios');
const logger = require('../../utils/logger');

class YourPlatformAdapter extends PlatformAdapter {
  constructor() {
    super('yourplatform'); // Platform identifier
    
    // Load credentials from environment
    this.apiKey = process.env.YOURPLATFORM_API_KEY;
    this.affiliateId = process.env.YOURPLATFORM_AFFILIATE_ID;
    this.trackingId = process.env.YOURPLATFORM_TRACKING_ID;
  }

  /**
   * Search for products (REQUIRED)
   */
  async searchProducts(keywords, maxResults = 10) {
    try {
      // Implement your API call here
      const response = await axios.get('YOUR_API_ENDPOINT', {
        params: {
          query: keywords,
          limit: maxResults
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const products = response.data.products || [];
      return products.map(product => this.normalizeProduct(product));
    } catch (error) {
      logger.error(`${this.platformName} API error`, error);
      return [];
    }
  }

  /**
   * Get product details (OPTIONAL)
   */
  async getProductDetails(productId) {
    try {
      const response = await axios.get(`YOUR_API_ENDPOINT/${productId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return this.normalizeProduct(response.data);
    } catch (error) {
      logger.error(`${this.platformName} product details error`, error);
      return null;
    }
  }

  /**
   * Normalize product to standard format (REQUIRED)
   */
  normalizeProduct(rawProduct) {
    return {
      platform: this.platformName,
      productId: rawProduct.id,
      title: rawProduct.name,
      currentPrice: parseFloat(rawProduct.price),
      originalPrice: parseFloat(rawProduct.original_price || rawProduct.price),
      discountPercentage: this.calculateDiscount(rawProduct),
      currency: 'INR',
      imageUrl: rawProduct.image_url || '',
      category: rawProduct.category || '',
      brand: rawProduct.brand || '',
      inStock: rawProduct.in_stock !== false,
      productUrl: rawProduct.url,
      affiliateLink: this.generateAffiliateLink(rawProduct.id),
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  /**
   * Generate affiliate link (REQUIRED)
   */
  generateAffiliateLink(productId) {
    return `https://yourplatform.com/product/${productId}?affid=${this.affiliateId}&tracking=${this.trackingId}`;
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscount(product) {
    const original = parseFloat(product.original_price || product.price);
    const current = parseFloat(product.price);
    return Math.round(((original - current) / original) * 100);
  }
}

module.exports = YourPlatformAdapter;
```

### Step 2: Register Platform

Update `src/index.js` to register your new platform:

```javascript
// Import your adapter
const YourPlatformAdapter = require('./modules/platforms/YourPlatformAdapter');

// In initializeModules() function:
const yourPlatformAdapter = new YourPlatformAdapter();
platformManager.registerPlatform('yourplatform', yourPlatformAdapter);
```

### Step 3: Add Database Configuration

Run SQL to add platform settings:

```sql
INSERT INTO platform_settings (
  platform, 
  enabled, 
  priority, 
  posting_ratio, 
  min_discount
) VALUES (
  'yourplatform',
  true,
  4,  -- Priority (1 = highest)
  20, -- Posting ratio (percentage)
  50  -- Minimum discount
);
```

### Step 4: Add Environment Variables

Update `.env`:

```env
# Your Platform Credentials
YOURPLATFORM_API_KEY=your_api_key
YOURPLATFORM_AFFILIATE_ID=your_affiliate_id
YOURPLATFORM_TRACKING_ID=your_tracking_id
```

### Step 5: Test Integration

Create a test script: `test-yourplatform.js`

```javascript
const YourPlatformAdapter = require('./src/modules/platforms/YourPlatformAdapter');
const logger = require('./src/utils/logger');

async function testYourPlatform() {
  const adapter = new YourPlatformAdapter();
  
  console.log('Testing product search...');
  const products = await adapter.searchProducts('electronics', 5);
  
  console.log(`Found ${products.length} products`);
  products.forEach(product => {
    console.log(`- ${product.title}`);
    console.log(`  Price: ₹${product.currentPrice} (${product.discountPercentage}% off)`);
    console.log(`  Link: ${product.affiliateLink}`);
  });
}

testYourPlatform().catch(console.error);
```

Run test:
```bash
node test-yourplatform.js
```

## Platform Adapter Interface

### Required Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `searchProducts(keywords, maxResults)` | Search for products | `Promise<Product[]>` |
| `normalizeProduct(rawProduct)` | Convert to standard format | `Product` |
| `generateAffiliateLink(productId)` | Create affiliate link | `string` |

### Optional Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `getProductDetails(productId)` | Get detailed product info | `Promise<Product>` |
| `initialize()` | Setup/authentication | `Promise<void>` |
| `validateCredentials()` | Check API credentials | `Promise<boolean>` |

### Standard Product Schema

```typescript
interface Product {
  platform: string;           // 'amazon', 'flipkart', etc.
  productId: string;          // Platform-specific ID
  title: string;              // Product name
  currentPrice: number;       // Current selling price
  originalPrice: number;      // Original/MRP price
  discountPercentage: number; // Calculated discount
  currency: string;           // 'INR', 'USD', etc.
  imageUrl: string;           // Product image URL
  category: string;           // Product category
  brand: string;              // Brand name
  inStock: boolean;           // Availability
  productUrl: string;         // Direct product URL
  affiliateLink: string;      // Affiliate tracking URL
  fetchedAt: Date;            // When data was fetched
  expiresAt: Date;            // When data expires
}
```

## Content Mix Algorithm

The PlatformManager distributes products based on `posting_ratio`:

```javascript
// Example: 10 total products
// Amazon: 40% = 4 products
// Flipkart: 30% = 3 products
// Myntra: 30% = 3 products

calculateContentMix(totalProducts) {
  const enabledPlatforms = this.getEnabledPlatforms();
  const totalRatio = enabledPlatforms.reduce((sum, p) => sum + p.postingRatio, 0);
  
  const mix = {};
  let allocated = 0;
  
  for (const platform of enabledPlatforms) {
    const count = Math.floor((platform.postingRatio / totalRatio) * totalProducts);
    mix[platform.name] = count;
    allocated += count;
  }
  
  // Allocate remaining to highest priority
  if (allocated < totalProducts) {
    const highest = enabledPlatforms.sort((a, b) => a.priority - b.priority)[0];
    mix[highest.name] += (totalProducts - allocated);
  }
  
  return mix;
}
```

## Filtering System

Filters are applied in `PlatformAdapter.applyFilters()`:

1. **Keyword Include**: Product title must contain at least one keyword
2. **Keyword Exclude**: Product title must not contain any excluded keyword
3. **Price Range**: Price must be within min/max range
4. **Category**: Product must be in allowed categories
5. **Minimum Discount**: Discount must meet threshold

## Error Handling

### Best Practices

1. **Always use try-catch** in async methods
2. **Log errors** with context
3. **Return empty arrays** on failure (don't throw)
4. **Validate data** before normalizing
5. **Handle rate limits** gracefully

### Example

```javascript
async searchProducts(keywords, maxResults) {
  try {
    const response = await this.makeAPICall(keywords, maxResults);
    return this.processResponse(response);
  } catch (error) {
    if (error.response?.status === 429) {
      logger.warn(`${this.platformName} rate limit hit`);
      // Implement backoff strategy
    } else if (error.response?.status === 401) {
      logger.error(`${this.platformName} authentication failed`);
    } else {
      logger.error(`${this.platformName} API error`, error);
    }
    return []; // Always return empty array, never throw
  }
}
```

## Testing Checklist

- [ ] Products are fetched successfully
- [ ] Product data is normalized correctly
- [ ] Affiliate links are generated properly
- [ ] Filters are applied correctly
- [ ] Duplicate prevention works
- [ ] Error handling is robust
- [ ] Logging is comprehensive
- [ ] Rate limits are respected
- [ ] Database operations succeed
- [ ] Telegram posting works

## Admin Panel Integration

Your platform will automatically appear in:

1. **Platform Management** (`/platforms`)
   - Toggle enable/disable
   - Adjust posting ratio
   - Set priority
   - Configure min discount

2. **Advanced Filters** (`/filters`)
   - Keyword filters
   - Price ranges
   - Categories

3. **Dashboard** (`/dashboard`)
   - Platform statistics
   - Recent deals
   - Performance metrics

## Monitoring

Monitor your platform integration:

```bash
# View platform-specific logs
tail -f logs/bot.log | grep YourPlatform

# Check database for posted deals
psql -d your_db -c "SELECT COUNT(*) FROM posted_deals WHERE platform = 'yourplatform';"

# Monitor API usage
# (Implement in your adapter)
```

## Common Pitfalls

1. **Not handling pagination**: Implement if API returns paginated results
2. **Ignoring rate limits**: Always respect API rate limits
3. **Poor error messages**: Log detailed error information
4. **Hardcoded values**: Use environment variables for configuration
5. **Missing validation**: Validate all product data before normalizing
6. **Incorrect discount calculation**: Ensure math is correct
7. **Broken affiliate links**: Test links before deploying

## Support

For help with platform integration:
1. Check existing adapter implementations
2. Review PlatformAdapter base class
3. Test with mock data first
4. Enable debug logging
5. Check API documentation

---

**Happy integrating! 🚀**

