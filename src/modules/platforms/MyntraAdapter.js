/**
 * Myntra Platform Adapter
 * 
 * Implements PlatformAdapter interface for Myntra Affiliate API.
 * 
 * ⚠️ PLACEHOLDER IMPLEMENTATION ⚠️
 * This is a mock implementation with sample data. To integrate with real Myntra API:
 * 1. Register at Myntra Affiliate Program or use affiliate networks (Admitad, vCommission)
 * 2. Get your Affiliate credentials
 * 3. Add credentials to .env file
 * 4. Replace mock methods with real API calls
 * 
 * See docs/MYNTRA_SETUP.md for detailed integration guide.
 */

const axios = require('axios');
const PlatformAdapter = require('./PlatformAdapter');
const logger = require('../../utils/logger');

class MyntraAdapter extends PlatformAdapter {
  constructor() {
    super('myntra', {
      affiliateId: process.env.MYNTRA_AFFILIATE_ID || 'YOUR_AFFILIATE_ID',
      apiKey: process.env.MYNTRA_API_KEY || 'YOUR_API_KEY',
      trackingId: process.env.MYNTRA_TRACKING_ID || 'YOUR_TRACKING_ID'
    });

    // Myntra API endpoints (example - verify with official docs or affiliate network)
    this.baseUrl = 'https://api.myntra.com/affiliate/v1';
    this.searchEndpoint = `${this.baseUrl}/search`;
  }

  /**
   * Initialize Myntra adapter
   */
  async initialize() {
    await super.initialize();

    // Check if real credentials are configured
    if (this.config.affiliateId === 'YOUR_AFFILIATE_ID') {
      logger.warn('⚠️  Myntra adapter using PLACEHOLDER mode - configure real credentials in .env');
      logger.warn('   See docs/MYNTRA_SETUP.md for integration guide');
      this.isPlaceholder = true;
    } else {
      logger.info('Myntra adapter configured with real credentials');
      this.isPlaceholder = false;
    }

    logger.success('Myntra adapter initialized');
  }

  /**
   * Search for products (implements PlatformAdapter interface)
   * CRITICAL: Validates keywords to prevent duplicate product issues
   */
  async searchProducts(keywords = 'fashion', filters = {}) {
    // VALIDATION: Ensure keywords are not empty
    if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
      logger.warn(`[Myntra] Invalid keywords: "${keywords}", using default "fashion"`);
      keywords = 'fashion';
    }

    const normalizedKeywords = keywords.trim();

    if (this.isPlaceholder) {
      logger.info(`[Myntra] Using mock data for keyword: "${normalizedKeywords}"`);
      return this.getMockProducts(normalizedKeywords, filters);
    }

    try {
      logger.info(`[Myntra] Searching for products with keyword: "${normalizedKeywords}"`);

      // Real API implementation would look like this:
      const params = {
        q: normalizedKeywords,  // Use normalized keywords
        limit: filters.maxResults || 10,
        affiliate_id: this.config.affiliateId
      };

      const headers = {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.get(this.searchEndpoint, { params, headers });

      // Convert Myntra response to normalized format
      const products = this.convertMyntraProducts(response.data.products || []);

      // Apply filters
      const filtered = this.applyFilters(products, filters);

      logger.info(`[Myntra] Returning ${filtered.length} filtered products for "${normalizedKeywords}"`);
      return filtered;

    } catch (error) {
      logger.error('[Myntra] Error searching for products', error);

      // Fallback to mock data on error
      logger.warn(`[Myntra] Falling back to mock data for "${normalizedKeywords}"`);
      return this.getMockProducts(normalizedKeywords, filters);
    }
  }

  /**
   * Get mock products for testing (placeholder implementation)
   * NOW KEYWORD-AWARE: Generates diverse products based on search term
   */
  getMockProducts(keywords, filters) {
    logger.info(`[Myntra] Generating keyword-aware mock products for: "${keywords}"`);

    // Generate keyword-aware products
    const mockProducts = this.generateKeywordAwareMockProducts(keywords, filters.maxResults || 10);

    // Normalize mock products
    const normalized = mockProducts.map(p => this.normalizeProduct(p));

    // Apply ALL filters including keyword filters
    const filtered = this.applyFilters(normalized, filters);

    logger.info(`[Myntra] Returning ${filtered.length} keyword-aware mock products`);
    return filtered;
  }

  /**
   * Generate keyword-aware mock products for Myntra
   */
  generateKeywordAwareMockProducts(keywords, count = 10) {
    const keywordLower = keywords.toLowerCase();
    const products = [];

    // Myntra fashion templates
    const templates = {
      men: {
        brands: ['Roadster', 'H&M', 'Levis', 'Jack & Jones', 'Nike', 'Puma', 'Adidas'],
        items: ['Jeans', 'T-Shirt', 'Shirt', 'Jacket', 'Shoes', 'Sneakers', 'Watch'],
        priceRange: [500, 5000]
      },
      women: {
        brands: ['H&M', 'Zara', 'Forever 21', 'Vero Moda', 'Only', 'Nike', 'Puma'],
        items: ['Dress', 'Top', 'Jeans', 'Kurti', 'Shoes', 'Heels', 'Handbag'],
        priceRange: [600, 6000]
      },
      sports: {
        brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour', 'Asics'],
        items: ['Running Shoes', 'Sports Bra', 'Track Pants', 'Jersey', 'Gym Bag'],
        priceRange: [800, 8000]
      },
      accessories: {
        brands: ['Fossil', 'Titan', 'Fastrack', 'Daniel Wellington', 'Casio'],
        items: ['Watch', 'Sunglasses', 'Belt', 'Wallet', 'Backpack'],
        priceRange: [1000, 15000]
      }
    };

    // Determine category from keyword
    let selectedTemplate = templates.men; // default
    if (keywordLower.includes('women') || keywordLower.includes('girl') || keywordLower.includes('dress') || keywordLower.includes('kurti')) {
      selectedTemplate = templates.women;
    } else if (keywordLower.includes('sport') || keywordLower.includes('fitness') || keywordLower.includes('gym') || keywordLower.includes('running')) {
      selectedTemplate = templates.sports;
    } else if (keywordLower.includes('watch') || keywordLower.includes('accessories') || keywordLower.includes('bag')) {
      selectedTemplate = templates.accessories;
    }

    for (let i = 0; i < count; i++) {
      const brand = selectedTemplate.brands[i % selectedTemplate.brands.length];
      const item = selectedTemplate.items[i % selectedTemplate.items.length];
      const [minPrice, maxPrice] = selectedTemplate.priceRange;
      const originalPrice = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
      const discountPercent = Math.floor(Math.random() * 60) + 30; // 30-90% discount
      const currentPrice = Math.floor(originalPrice * (1 - discountPercent / 100));

      const colors = ['Black', 'Blue', 'Red', 'White', 'Grey', 'Navy', 'Green', 'Pink'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      products.push({
        productId: `MYN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        title: `${brand} ${color} ${item} ${keywords.split(' ')[0]} Collection`,
        currentPrice,
        originalPrice,
        discountPercentage: discountPercent,
        imageUrl: `https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/${Math.random().toString(36).substring(2, 15)}.jpg`,
        category: item,
        brand,
        inStock: true,
        productUrl: `https://www.myntra.com/${item.toLowerCase().replace(' ', '-')}/${brand.toLowerCase()}/${Math.random().toString(36).substring(2, 10)}/buy`
      });
    }

    return products;
  }

  /**
   * Convert Myntra API response to normalized format
   * (This would be used with real API)
   */
  convertMyntraProducts(myntraProducts) {
    return myntraProducts.map(product => {
      try {
        return this.normalizeProduct({
          productId: product.styleId || product.productId,
          title: product.productDisplayName || product.name,
          currentPrice: product.discountedPrice || product.price,
          originalPrice: product.mrp || product.originalPrice,
          discountPercentage: product.discountPercent || 0,
          imageUrl: product.searchImage || product.defaultImage,
          category: product.articleType || product.category,
          brand: product.brand || product.brandName,
          inStock: product.inventoryInfo?.available !== false,
          productUrl: product.landingPageUrl || `https://www.myntra.com/product/${product.styleId}`
        });
      } catch (error) {
        logger.error('[Myntra] Error converting product', error);
        return null;
      }
    }).filter(p => p !== null);
  }

  /**
   * Normalize Myntra product to standard format
   */
  normalizeProduct(rawProduct) {
    return {
      platform: 'myntra',
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
    throw new Error('getProductDetails not yet implemented for Myntra');
  }

  /**
   * Generate affiliate link (implements PlatformAdapter interface)
   */
  generateAffiliateLink(product) {
    const productUrl = product.productUrl || `https://www.myntra.com/product/${product.productId}`;
    
    // Add tracking parameters to URL
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}utm_source=affiliate&utm_medium=${this.config.trackingId}`;
  }

  /**
   * Check availability (implements PlatformAdapter interface)
   */
  async checkAvailability(product) {
    return product.inStock;
  }
}

module.exports = MyntraAdapter;

