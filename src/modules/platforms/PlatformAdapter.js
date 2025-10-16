/**
 * Platform Adapter Base Class
 * 
 * This abstract base class defines the standard interface that all
 * e-commerce platform integrations must implement. It ensures consistent
 * data structures and behavior across Amazon, Flipkart, Myntra, and any
 * future platforms.
 * 
 * @abstract
 */

const logger = require('../../utils/logger');

class PlatformAdapter {
  /**
   * @param {string} platformName - Name of the platform (e.g., 'amazon', 'flipkart', 'myntra')
   * @param {Object} config - Platform-specific configuration
   */
  constructor(platformName, config = {}) {
    if (new.target === PlatformAdapter) {
      throw new Error('PlatformAdapter is an abstract class and cannot be instantiated directly');
    }

    this.platformName = platformName;
    this.config = config;
    this.isInitialized = false;
  }

  /**
   * Initialize the platform adapter
   * Override this method to perform platform-specific initialization
   * @returns {Promise<void>}
   */
  async initialize() {
    logger.info(`Initializing ${this.platformName} adapter...`);
    this.isInitialized = true;
  }

  /**
   * Search for products with discounts
   * @abstract
   * @param {string} keywords - Search keywords
   * @param {Object} filters - Search filters
   * @param {number} filters.minDiscount - Minimum discount percentage
   * @param {number} filters.maxResults - Maximum number of results
   * @param {number} filters.minPrice - Minimum price (optional)
   * @param {number} filters.maxPrice - Maximum price (optional)
   * @param {string[]} filters.categories - Product categories (optional)
   * @param {string[]} filters.includeKeywords - Keywords that must be present (optional)
   * @param {string[]} filters.excludeKeywords - Keywords to exclude (optional)
   * @returns {Promise<Array<Object>>} Array of normalized products
   */
  async searchProducts(keywords, filters = {}) {
    throw new Error(`searchProducts() must be implemented by ${this.platformName} adapter`);
  }

  /**
   * Get detailed product information
   * @abstract
   * @param {string} productId - Platform-specific product ID
   * @returns {Promise<Object>} Normalized product object
   */
  async getProductDetails(productId) {
    throw new Error(`getProductDetails() must be implemented by ${this.platformName} adapter`);
  }

  /**
   * Generate affiliate link for a product
   * @abstract
   * @param {Object} product - Product object
   * @returns {Promise<string>} Affiliate link URL
   */
  async generateAffiliateLink(product) {
    throw new Error(`generateAffiliateLink() must be implemented by ${this.platformName} adapter`);
  }

  /**
   * Check if product is available for purchase
   * @abstract
   * @param {Object} product - Product object
   * @returns {Promise<boolean>} True if available
   */
  async checkAvailability(product) {
    throw new Error(`checkAvailability() must be implemented by ${this.platformName} adapter`);
  }

  /**
   * Normalize raw platform data to standard format
   * This ensures all platforms return consistent data structure
   * @abstract
   * @param {Object} rawProduct - Raw product data from platform API
   * @returns {Object} Normalized product object
   */
  normalizeProduct(rawProduct) {
    throw new Error(`normalizeProduct() must be implemented by ${this.platformName} adapter`);
  }

  /**
   * Standard product structure that all platforms must return
   * @returns {Object} Product schema
   */
  getProductSchema() {
    return {
      // Platform identification
      platform: '',              // 'amazon', 'flipkart', 'myntra'
      
      // Product identification
      productId: '',             // Platform-specific product ID (ASIN, SKU, etc.)
      title: '',                 // Product title
      
      // Pricing
      currentPrice: 0,           // Current price (number)
      originalPrice: 0,          // Original price before discount (number)
      discountPercentage: 0,     // Discount percentage (number)
      currency: 'INR',           // Currency code
      
      // Product details
      imageUrl: '',              // Primary product image URL
      category: '',              // Product category
      brand: '',                 // Brand name (optional)
      rating: 0,                 // Product rating (optional)
      reviewCount: 0,            // Number of reviews (optional)
      
      // Availability
      inStock: false,            // Stock availability
      availabilityMessage: '',   // Availability message
      
      // Links
      productUrl: '',            // Direct product URL
      affiliateLink: '',         // Affiliate tracking link
      
      // Metadata
      fetchedAt: null,           // Timestamp when data was fetched
      expiresAt: null            // When this data should be refreshed
    };
  }

  /**
   * Validate that a product object meets the standard schema
   * @param {Object} product - Product object to validate
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validateProduct(product) {
    const required = ['platform', 'productId', 'title', 'currentPrice', 'discountPercentage', 'imageUrl'];
    
    for (const field of required) {
      if (!product[field] && product[field] !== 0) {
        throw new Error(`Product validation failed: missing required field '${field}'`);
      }
    }

    if (product.discountPercentage < 0 || product.discountPercentage > 100) {
      throw new Error('Product validation failed: discountPercentage must be between 0 and 100');
    }

    if (product.currentPrice < 0) {
      throw new Error('Product validation failed: currentPrice must be non-negative');
    }

    return true;
  }

  /**
   * Apply filters to a list of products
   * @param {Array<Object>} products - Array of products
   * @param {Object} filters - Filters to apply
   * @returns {Array<Object>} Filtered products
   */
  applyFilters(products, filters = {}) {
    let filtered = [...products];

    // Minimum discount filter
    if (filters.minDiscount) {
      filtered = filtered.filter(p => p.discountPercentage >= filters.minDiscount);
    }

    // Price range filters
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.currentPrice >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.currentPrice <= filters.maxPrice);
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => 
        filters.categories.some(cat => 
          p.category.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Include keywords filter
    if (filters.includeKeywords && filters.includeKeywords.length > 0) {
      filtered = filtered.filter(p => {
        const searchText = `${p.title} ${p.category} ${p.brand || ''}`.toLowerCase();
        return filters.includeKeywords.every(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    }

    // Exclude keywords filter
    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      filtered = filtered.filter(p => {
        const searchText = `${p.title} ${p.category} ${p.brand || ''}`.toLowerCase();
        return !filters.excludeKeywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    }

    // In stock filter (default: only show in-stock items)
    if (filters.inStockOnly !== false) {
      filtered = filtered.filter(p => p.inStock);
    }

    return filtered;
  }

  /**
   * Get platform name
   * @returns {string}
   */
  getName() {
    return this.platformName;
  }

  /**
   * Check if adapter is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Get platform configuration
   * @returns {Object}
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update platform configuration
   * @param {Object} newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    logger.info(`${this.platformName} configuration updated`);
  }
}

module.exports = PlatformAdapter;

