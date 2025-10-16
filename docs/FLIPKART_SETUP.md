# Flipkart Affiliate API Integration Guide

## Overview
This guide will help you integrate the Flipkart Affiliate API with your multi-platform affiliate bot. Currently, the bot uses placeholder/mock data for Flipkart. Follow these steps to connect to the real Flipkart Affiliate API.

## Prerequisites
- Active Flipkart Affiliate account
- API credentials from Flipkart
- Node.js environment configured

## Step 1: Register for Flipkart Affiliate Program

1. Visit [Flipkart Affiliate Program](https://affiliate.flipkart.com/)
2. Sign up or log in to your account
3. Complete the registration process
4. Wait for approval (usually 24-48 hours)

## Step 2: Obtain API Credentials

Once approved:

1. Log in to your Flipkart Affiliate dashboard
2. Navigate to **API** or **Tools** section
3. Generate your API credentials:
   - **Affiliate ID** (also called Tracking ID)
   - **API Token** (authentication token)
   - **Tracking ID** (for commission tracking)

4. Save these credentials securely

## Step 3: Update Environment Variables

Add your Flipkart credentials to the `.env` file:

```env
# Flipkart Affiliate API Credentials
FLIPKART_AFFILIATE_ID=your_affiliate_id_here
FLIPKART_API_TOKEN=your_api_token_here
FLIPKART_TRACKING_ID=your_tracking_id_here
```

## Step 4: Update FlipkartAdapter.js

Open `src/modules/platforms/FlipkartAdapter.js` and replace the placeholder implementation with real API calls.

### Current Placeholder Code:
```javascript
async searchProducts(keywords, maxResults = 10) {
  logger.warn('⚠️  Using Flipkart PLACEHOLDER - Replace with real API');
  return this.getMockProducts(keywords, this.filters);
}
```

### Replace with Real API Implementation:

```javascript
async searchProducts(keywords, maxResults = 10) {
  try {
    const response = await axios.get('https://affiliate-api.flipkart.net/affiliate/api/[YOUR_AFFILIATE_ID].json', {
      params: {
        query: keywords,
        resultType: 'json',
        limit: maxResults
      },
      headers: {
        'Fk-Affiliate-Id': this.affiliateId,
        'Fk-Affiliate-Token': this.apiToken
      }
    });

    const products = response.data.productInfoList || [];
    return products.map(product => this.normalizeProduct(product));
  } catch (error) {
    logger.error('Flipkart API error', error);
    return [];
  }
}
```

### Update normalizeProduct Method:

```javascript
normalizeProduct(rawProduct) {
  const productInfo = rawProduct.productBaseInfoV1;
  const price = productInfo.flipkartSpecialPrice || productInfo.flipkartSellingPrice;
  const originalPrice = productInfo.maximumRetailPrice;
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  return {
    platform: 'flipkart',
    productId: productInfo.productId,
    title: productInfo.title,
    currentPrice: price,
    originalPrice: originalPrice,
    discountPercentage: discount,
    currency: 'INR',
    imageUrl: productInfo.imageUrls?.[0] || '',
    category: productInfo.categoryPath || '',
    brand: productInfo.productBrand || '',
    inStock: productInfo.inStock,
    productUrl: productInfo.productUrl,
    affiliateLink: this.generateAffiliateLink(productInfo.productId),
    fetchedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
}
```

### Update generateAffiliateLink Method:

```javascript
generateAffiliateLink(productId) {
  return `https://www.flipkart.com/dl/product?pid=${productId}&affid=${this.affiliateId}&affExtParam1=${this.trackingId}`;
}
```

## Step 5: API Endpoints Reference

### Flipkart Affiliate API Endpoints:

1. **Product Search**
   ```
   GET https://affiliate-api.flipkart.net/affiliate/api/[AFFILIATE_ID].json
   ```
   Parameters:
   - `query`: Search keywords
   - `resultType`: json
   - `limit`: Number of results

2. **Product Details**
   ```
   GET https://affiliate-api.flipkart.net/affiliate/product/json
   ```
   Parameters:
   - `id`: Product ID

3. **Category Listing**
   ```
   GET https://affiliate-api.flipkart.net/affiliate/api/[AFFILIATE_ID].json
   ```
   Parameters:
   - `category`: Category name

## Step 6: Test the Integration

1. Restart your bot:
   ```bash
   npm start
   ```

2. Check logs for Flipkart API calls:
   ```bash
   tail -f logs/bot.log | grep Flipkart
   ```

3. Trigger a manual job from the admin panel:
   - Go to **Platform Management**
   - Find Flipkart platform
   - Click **Trigger Job**

4. Verify products are being fetched from real API (no placeholder warnings)

## Step 7: Configure Filters

In the admin panel:

1. Navigate to **Advanced Filters**
2. Select **Flipkart** platform
3. Configure:
   - Minimum discount percentage
   - Price range
   - Include/exclude keywords
   - Categories

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Verify your API credentials are correct
   - Check if your affiliate account is approved
   - Ensure API token hasn't expired

2. **No Products Returned**
   - Check if your search keywords are valid
   - Verify minimum discount filter isn't too high
   - Try broader search terms

3. **Rate Limiting**
   - Flipkart API has rate limits (typically 100 requests/hour)
   - Adjust `CRON_SCHEDULE` to reduce frequency
   - Implement caching for frequently accessed products

4. **Invalid Affiliate Links**
   - Verify your Tracking ID is correct
   - Check link format matches Flipkart requirements
   - Test links manually before posting

## API Rate Limits

- **Requests per hour**: 100
- **Requests per day**: 1000
- **Concurrent requests**: 5

To stay within limits:
- Cache product data for 1-2 hours
- Reduce posting frequency
- Use batch requests when possible

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Logging**: Log all API responses for debugging
3. **Caching**: Cache product data to reduce API calls
4. **Validation**: Validate all product data before posting
5. **Monitoring**: Monitor API usage in Flipkart dashboard

## Additional Resources

- [Flipkart Affiliate API Documentation](https://affiliate.flipkart.com/api-docs)
- [Flipkart Affiliate Dashboard](https://affiliate.flipkart.com/dashboard)
- [Flipkart Affiliate Support](https://affiliate.flipkart.com/support)

## Support

If you encounter issues:
1. Check Flipkart Affiliate dashboard for API status
2. Review bot logs for error messages
3. Contact Flipkart Affiliate support
4. Check GitHub issues for similar problems

---

**Note**: This integration guide is based on Flipkart Affiliate API v1. API endpoints and parameters may change. Always refer to official Flipkart documentation for the latest information.

