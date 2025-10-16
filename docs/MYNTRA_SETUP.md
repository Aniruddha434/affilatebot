# Myntra Affiliate API Integration Guide

## Overview
This guide will help you integrate Myntra affiliate functionality with your multi-platform affiliate bot. Currently, the bot uses placeholder/mock data for Myntra. Follow these steps to connect to a real affiliate network or Myntra's API.

## Important Note
Myntra does not have a public affiliate API. You'll need to work through affiliate networks like:
- **Admitad**
- **vCommission**
- **CueLinks**
- **Optimise**

This guide covers integration through affiliate networks.

## Step 1: Choose an Affiliate Network

### Recommended Networks for Myntra:

1. **Admitad** (Recommended)
   - Website: https://www.admitad.com/
   - Good commission rates
   - Reliable tracking
   - API access available

2. **vCommission**
   - Website: https://www.vcommission.com/
   - India-focused
   - Good support

3. **CueLinks**
   - Website: https://www.cuelinks.com/
   - Automatic link conversion
   - Easy integration

## Step 2: Register with Affiliate Network

1. Visit your chosen affiliate network's website
2. Sign up for an account
3. Apply for Myntra affiliate program within the network
4. Wait for approval (1-3 days typically)

## Step 3: Obtain API Credentials

Once approved:

1. Log in to your affiliate network dashboard
2. Navigate to **API** or **Developer** section
3. Generate API credentials:
   - **API Key**
   - **Affiliate ID**
   - **Tracking ID** (for commission tracking)

4. Note the API endpoint URLs

## Step 4: Update Environment Variables

Add your Myntra/Network credentials to the `.env` file:

```env
# Myntra Affiliate API Credentials (via Affiliate Network)
MYNTRA_AFFILIATE_ID=your_affiliate_id_here
MYNTRA_API_KEY=your_api_key_here
MYNTRA_TRACKING_ID=your_tracking_id_here
MYNTRA_NETWORK=admitad  # or vcommission, cuelinks, etc.
```

## Step 5: Update MyntraAdapter.js

Open `src/modules/platforms/MyntraAdapter.js` and replace the placeholder implementation.

### Option A: Using Admitad API

```javascript
async searchProducts(keywords, maxResults = 10) {
  try {
    const response = await axios.get('https://api.admitad.com/products/search/', {
      params: {
        q: keywords,
        limit: maxResults,
        campaign: 'myntra',  // Myntra campaign ID
        category: 'fashion'
      },
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const products = response.data.results || [];
    return products.map(product => this.normalizeProduct(product));
  } catch (error) {
    logger.error('Myntra/Admitad API error', error);
    return [];
  }
}

normalizeProduct(rawProduct) {
  const price = parseFloat(rawProduct.price);
  const originalPrice = parseFloat(rawProduct.oldprice || rawProduct.price);
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  return {
    platform: 'myntra',
    productId: rawProduct.id,
    title: rawProduct.name,
    currentPrice: price,
    originalPrice: originalPrice,
    discountPercentage: discount,
    currency: 'INR',
    imageUrl: rawProduct.picture || '',
    category: rawProduct.category || 'Fashion',
    brand: rawProduct.brand || '',
    inStock: true,
    productUrl: rawProduct.url,
    affiliateLink: this.generateAffiliateLink(rawProduct.url),
    fetchedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
}

generateAffiliateLink(productUrl) {
  // Admitad deeplink generation
  const encodedUrl = encodeURIComponent(productUrl);
  return `https://ad.admitad.com/g/${this.affiliateId}/?ulp=${encodedUrl}&subid=${this.trackingId}`;
}
```

### Option B: Using CueLinks (Automatic Link Conversion)

```javascript
async searchProducts(keywords, maxResults = 10) {
  try {
    // CueLinks doesn't have product search API
    // You'll need to scrape Myntra or use their product feed
    // Then convert links using CueLinks API
    
    const myntraProducts = await this.scrapeMyntraProducts(keywords, maxResults);
    
    // Convert each product URL to affiliate link
    for (const product of myntraProducts) {
      product.affiliateLink = await this.convertToCueLink(product.productUrl);
    }
    
    return myntraProducts;
  } catch (error) {
    logger.error('Myntra/CueLinks error', error);
    return [];
  }
}

async convertToCueLink(url) {
  try {
    const response = await axios.post('https://api.cuelinks.com/api/v2/shortUrl', {
      url: url,
      subId: this.trackingId
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return response.data.shortUrl;
  } catch (error) {
    logger.error('CueLinks conversion error', error);
    return url; // Fallback to original URL
  }
}
```

### Option C: Using Web Scraping (Last Resort)

If no API is available, you can scrape Myntra's website:

```javascript
const cheerio = require('cheerio');

async searchProducts(keywords, maxResults = 10) {
  try {
    const searchUrl = `https://www.myntra.com/${keywords.replace(/\s+/g, '-')}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const products = [];

    $('.product-base').slice(0, maxResults).each((i, elem) => {
      const title = $(elem).find('.product-product').text().trim();
      const price = parseInt($(elem).find('.product-discountedPrice').text().replace(/[^0-9]/g, ''));
      const originalPrice = parseInt($(elem).find('.product-strike').text().replace(/[^0-9]/g, ''));
      const imageUrl = $(elem).find('img').attr('src');
      const productUrl = 'https://www.myntra.com' + $(elem).find('a').attr('href');

      if (title && price) {
        products.push({
          platform: 'myntra',
          productId: productUrl.split('/').pop(),
          title,
          currentPrice: price,
          originalPrice: originalPrice || price,
          discountPercentage: Math.round(((originalPrice - price) / originalPrice) * 100),
          currency: 'INR',
          imageUrl,
          category: 'Fashion',
          brand: '',
          inStock: true,
          productUrl,
          affiliateLink: this.generateAffiliateLink(productUrl),
          fetchedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      }
    });

    return products;
  } catch (error) {
    logger.error('Myntra scraping error', error);
    return [];
  }
}
```

**Note**: Web scraping should be a last resort and may violate terms of service. Always check Myntra's robots.txt and terms.

## Step 6: Install Additional Dependencies (if needed)

For web scraping:
```bash
npm install cheerio
```

For advanced HTTP requests:
```bash
npm install axios-retry
```

## Step 7: Test the Integration

1. Restart your bot:
   ```bash
   npm start
   ```

2. Check logs:
   ```bash
   tail -f logs/bot.log | grep Myntra
   ```

3. Trigger manual job from admin panel

4. Verify products are being fetched correctly

## Step 8: Configure Filters

In the admin panel:

1. Navigate to **Advanced Filters**
2. Select **Myntra** platform
3. Configure fashion-specific filters:
   - Categories: Men, Women, Kids, Home & Living
   - Keywords: Include brand names, product types
   - Price ranges appropriate for fashion items

## Troubleshooting

### Common Issues:

1. **No API Available**
   - Use affiliate network APIs (Admitad, vCommission)
   - Consider web scraping as last resort
   - Contact Myntra business team for API access

2. **Link Conversion Fails**
   - Verify affiliate network credentials
   - Check if Myntra campaign is active
   - Test links manually

3. **Scraping Blocked**
   - Use rotating user agents
   - Add delays between requests
   - Consider using proxy services
   - Respect robots.txt

4. **Commission Not Tracking**
   - Verify tracking ID is correct
   - Check cookie settings
   - Test affiliate links manually
   - Contact network support

## Best Practices

1. **Use Affiliate Networks**: Preferred over direct scraping
2. **Cache Product Data**: Reduce API calls and scraping frequency
3. **Respect Rate Limits**: Don't overload Myntra's servers
4. **Monitor Performance**: Track click-through and conversion rates
5. **Update Regularly**: Fashion products change frequently

## Affiliate Network Comparison

| Network | API Access | Commission | Support | Recommended |
|---------|-----------|-----------|---------|-------------|
| Admitad | ✅ Yes | 5-10% | Good | ⭐⭐⭐⭐⭐ |
| vCommission | ✅ Yes | 4-8% | Excellent | ⭐⭐⭐⭐ |
| CueLinks | ⚠️ Limited | 5-9% | Good | ⭐⭐⭐ |
| Optimise | ✅ Yes | 5-10% | Good | ⭐⭐⭐⭐ |

## Additional Resources

- [Admitad API Documentation](https://developers.admitad.com/)
- [vCommission Dashboard](https://www.vcommission.com/)
- [CueLinks API](https://www.cuelinks.com/api)
- [Myntra Seller Hub](https://www.myntra.com/seller)

## Legal Considerations

1. **Terms of Service**: Always comply with Myntra's ToS
2. **Robots.txt**: Respect crawling rules if scraping
3. **Affiliate Disclosure**: Disclose affiliate relationships
4. **Data Privacy**: Handle user data responsibly

---

**Note**: Myntra's affiliate program and API availability may change. Always verify current options with Myntra or affiliate networks before implementation.

