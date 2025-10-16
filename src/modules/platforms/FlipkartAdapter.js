/**
 * Flipkart Platform Adapter
 * 
 * Implements PlatformAdapter interface for Flipkart Affiliate API.
 * 
 * ⚠️ PLACEHOLDER IMPLEMENTATION ⚠️
 * This is a mock implementation with sample data. To integrate with real Flipkart API:
 * 1. Register at https://affiliate.flipkart.com/
 * 2. Get your Affiliate ID and API Token
 * 3. Add credentials to .env file
 * 4. Replace mock methods with real API calls
 * 
 * See docs/FLIPKART_SETUP.md for detailed integration guide.
 */

const axios = require('axios');
const PlatformAdapter = require('./PlatformAdapter');
const logger = require('../../utils/logger');

class FlipkartAdapter extends PlatformAdapter {
  constructor() {
    super('flipkart', {
      affiliateId: process.env.FLIPKART_AFFILIATE_ID || 'YOUR_AFFILIATE_ID',
      apiToken: process.env.FLIPKART_API_TOKEN || 'YOUR_API_TOKEN',
      trackingId: process.env.FLIPKART_TRACKING_ID || 'YOUR_TRACKING_ID'
    });

    // Flipkart API endpoints (example - verify with official docs)
    this.baseUrl = 'https://affiliate-api.flipkart.net/affiliate/api';
    this.searchEndpoint = `${this.baseUrl}/search.json`;
    this.productEndpoint = `${this.baseUrl}/product.json`;
  }

  /**
   * Initialize Flipkart adapter
   */
  async initialize() {
    await super.initialize();

    // Check if real credentials are configured
    if (this.config.affiliateId === 'YOUR_AFFILIATE_ID') {
      logger.warn('⚠️  Flipkart adapter using PLACEHOLDER mode - configure real credentials in .env');
      logger.warn('   See docs/FLIPKART_SETUP.md for integration guide');
      this.isPlaceholder = true;
    } else {
      logger.info('Flipkart adapter configured with real credentials');
      this.isPlaceholder = false;
    }

    logger.success('Flipkart adapter initialized');
  }

  /**
   * Search for products (implements PlatformAdapter interface)
   * CRITICAL: Validates keywords to prevent duplicate product issues
   */
  async searchProducts(keywords = 'deals', filters = {}) {
    // VALIDATION: Ensure keywords are not empty
    if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
      logger.warn(`[Flipkart] Invalid keywords: "${keywords}", using default "deals"`);
      keywords = 'deals';
    }

    const normalizedKeywords = keywords.trim();

    if (this.isPlaceholder) {
      logger.info(`[Flipkart] Using mock data for keyword: "${normalizedKeywords}"`);
      return this.getMockProducts(normalizedKeywords, filters);
    }

    try {
      logger.info(`[Flipkart] Searching for products with keyword: "${normalizedKeywords}"`);

      // Real API implementation would look like this:
      const params = {
        query: normalizedKeywords,  // Use normalized keywords
        resultCount: filters.maxResults || 10,
        trackingId: this.config.trackingId
      };

      const headers = {
        'Fk-Affiliate-Id': this.config.affiliateId,
        'Fk-Affiliate-Token': this.config.apiToken
      };

      const response = await axios.get(this.searchEndpoint, { params, headers });

      // Convert Flipkart response to normalized format
      const products = this.convertFlipkartProducts(response.data.products || []);

      // Apply filters
      const filtered = this.applyFilters(products, filters);

      logger.info(`[Flipkart] Returning ${filtered.length} filtered products for "${normalizedKeywords}"`);
      return filtered;

    } catch (error) {
      logger.error('[Flipkart] Error searching for products', error);

      // Fallback to mock data on error
      logger.warn(`[Flipkart] Falling back to mock data for "${normalizedKeywords}"`);
      return this.getMockProducts(normalizedKeywords, filters);
    }
  }

  /**
   * Get mock products for testing (placeholder implementation)
   * NOW KEYWORD-AWARE: Generates diverse products based on search term
   */
  getMockProducts(keywords, filters) {
    logger.info(`[Flipkart] Generating keyword-aware mock products for: "${keywords}"`);

    // Generate keyword-aware products
    const mockProducts = this.generateKeywordAwareMockProducts(keywords, filters.maxResults || 10);

    // Normalize mock products
    const normalized = mockProducts.map(p => this.normalizeProduct(p));

    // Apply ALL filters including keyword filters
    const filtered = this.applyFilters(normalized, filters);

    logger.info(`[Flipkart] Returning ${filtered.length} keyword-aware mock products`);
    return filtered;
  }

  /**
   * Generate keyword-aware mock products for Flipkart
   */
  generateKeywordAwareMockProducts(keywords, count = 10) {
    const keywordLower = keywords.toLowerCase();
    const products = [];

    // Flipkart product templates
    const templates = {
      mobiles: ['Samsung Galaxy', 'Realme', 'Redmi', 'POCO', 'Motorola', 'Vivo', 'OPPO'],
      fashion: ['Roadster', 'H&M', 'Levis', 'Nike', 'Puma', 'Adidas', 'Zara'],
      electronics: ['Samsung', 'LG', 'Sony', 'Philips', 'Boat', 'JBL', 'Mi'],
      home: ['Prestige', 'Pigeon', 'Butterfly', 'Havells', 'Bajaj', 'Philips'],
      books: ['Penguin', 'HarperCollins', 'Scholastic', 'Bloomsbury', 'Random House']
    };

    // Determine category
    let category = 'Electronics';
    let brands = templates.electronics;
    let priceRange = [2000, 50000];

    if (keywordLower.includes('mobile') || keywordLower.includes('phone')) {
      category = 'Mobiles';
      brands = templates.mobiles;
      priceRange = [8000, 60000];
    } else if (keywordLower.includes('fashion') || keywordLower.includes('cloth') || keywordLower.includes('shoe')) {
      category = 'Fashion';
      brands = templates.fashion;
      priceRange = [500, 5000];
    } else if (keywordLower.includes('home') || keywordLower.includes('appliance')) {
      category = 'Home & Kitchen';
      brands = templates.home;
      priceRange = [1000, 15000];
    } else if (keywordLower.includes('book')) {
      category = 'Books';
      brands = templates.books;
      priceRange = [200, 1000];
    }

    for (let i = 0; i < count; i++) {
      const brand = brands[i % brands.length];
      const [minPrice, maxPrice] = priceRange;
      const originalPrice = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
      const discountPercent = Math.floor(Math.random() * 50) + 25; // 25-75% discount
      const currentPrice = Math.floor(originalPrice * (1 - discountPercent / 100));

      products.push({
        productId: `FLP${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        title: `${brand} ${keywords.split(' ')[0]} ${category} Special Edition`,
        currentPrice,
        originalPrice,
        discountPercentage: discountPercent,
        imageUrl: `https://rukminim2.flixcart.com/image/416/416/xif0q/${Math.random().toString(36).substring(2, 15)}.jpeg`,
        category,
        brand,
        inStock: true,
        productUrl: `https://www.flipkart.com/product/p/itm${Math.random().toString(36).substring(2, 12)}`
      });
    }

    return products;
  }

  /**
   * Convert Flipkart API response to normalized format
   * (This would be used with real API)
   */
  convertFlipkartProducts(flipkartProducts) {
    return flipkartProducts.map(product => {
      try {
        return this.normalizeProduct({
          productId: product.productId,
          title: product.title,
          currentPrice: product.specialPrice?.amount || product.price?.amount,
          originalPrice: product.price?.amount,
          discountPercentage: product.discountPercentage || 0,
          imageUrl: product.imageUrls?.['400x400'] || product.imageUrls?.['200x200'],
          category: product.categoryPath || 'General',
          brand: product.brand || '',
          inStock: product.inStock !== false,
          productUrl: product.productUrl
        });
      } catch (error) {
        logger.error('[Flipkart] Error converting product', error);
        return null;
      }
    }).filter(p => p !== null);
  }

  /**
   * Normalize Flipkart product to standard format
   */
  normalizeProduct(rawProduct) {
    return {
      platform: 'flipkart',
      productId: rawProduct.productId,
      title: rawProduct.title,
      currentPrice: rawProduct.currentPrice,
      originalPrice: rawProduct.originalPrice,
      discountPercentage: Math.round(rawProduct.discountPercentage),
      currency: 'INR',
      imageUrl: rawProduct.imageUrl,
      category: rawProduct.category,
      brand: rawProduct.brand,
      rating: rawProduct.rating || 0,
      reviewCount: rawProduct.reviewCount || 0,
      inStock: rawProduct.inStock,
      availabilityMessage: rawProduct.inStock ? 'In Stock' : 'Out of Stock',
      productUrl: rawProduct.productUrl,
      affiliateLink: this.generateAffiliateLink(rawProduct),
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    };
  }

  /**
   * Get product details (implements PlatformAdapter interface)
   */
  async getProductDetails(productId) {
    if (this.isPlaceholder) {
      throw new Error('getProductDetails not available in placeholder mode');
    }

    // Real implementation would fetch detailed product info
    throw new Error('getProductDetails not yet implemented for Flipkart');
  }

  /**
   * Generate affiliate link (implements PlatformAdapter interface)
   */
  generateAffiliateLink(product) {
    const productUrl = product.productUrl || `https://www.flipkart.com/product/p/${product.productId}`;
    
    // Add tracking ID to URL
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}affid=${this.config.trackingId}`;
  }

  /**
   * Check availability (implements PlatformAdapter interface)
   */
  async checkAvailability(product) {
    return product.inStock;
  }
}

module.exports = FlipkartAdapter;

