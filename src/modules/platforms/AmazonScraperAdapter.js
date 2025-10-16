/**
 * Amazon Scraper Platform Adapter
 * 
 * Implements PlatformAdapter interface using amazon-buddy scraper library.
 * This is a temporary solution for scraping Amazon products while waiting
 * for official PA-API credentials to become active (2-day waiting period).
 * 
 * Features:
 * - Free, no API credentials required
 * - Extracts product data from Amazon search results
 * - Supports discount filtering and rating filters
 * - Includes rate limiting to avoid being blocked
 * - Falls back to mock data on errors
 * 
 * Limitations:
 * - Maximum 10 products per search (amazon-buddy limit)
 * - Slower than PA-API (web scraping overhead)
 * - May be blocked if too many requests
 * - Less reliable than official API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const PlatformAdapter = require('./PlatformAdapter');
const logger = require('../../utils/logger');
const { calculateDiscount, sleep } = require('../../utils/helpers');

class AmazonScraperAdapter extends PlatformAdapter {
  constructor() {
    super('amazon-scraper', {
      partnerTag: process.env.AMAZON_PARTNER_TAG,
      region: process.env.AMAZON_REGION || 'IN',
      country: process.env.AMAZON_REGION || 'IN',
      requestDelay: 1500, // 1.5 seconds between requests
      maxProducts: 10 // amazon-buddy limitation
    });

    this.baseUrl = this.getBaseUrlForRegion(this.config.region);
  }

  /**
   * Initialize Amazon scraper adapter
   */
  async initialize() {
    await super.initialize();

    // Validate partner tag for affiliate links
    if (!this.config.partnerTag) {
      logger.warn('⚠️  Amazon partner tag not configured. Affiliate links will not work properly.');
      logger.warn('   Set AMAZON_PARTNER_TAG in .env file');
    }

    logger.success('Amazon Scraper adapter initialized successfully');
    logger.info(`   Region: ${this.config.region}`);
    logger.info(`   Base URL: ${this.baseUrl}`);
    logger.info(`   Rate limit: ${this.config.requestDelay}ms between requests`);
  }

  /**
   * Get Amazon base URL for region
   */
  getBaseUrlForRegion(region) {
    const urls = {
      'US': 'https://www.amazon.com',
      'UK': 'https://www.amazon.co.uk',
      'DE': 'https://www.amazon.de',
      'FR': 'https://www.amazon.fr',
      'JP': 'https://www.amazon.co.jp',
      'CA': 'https://www.amazon.ca',
      'IN': 'https://www.amazon.in',
      'IT': 'https://www.amazon.it',
      'ES': 'https://www.amazon.es',
      'BR': 'https://www.amazon.com.br',
      'MX': 'https://www.amazon.com.mx',
      'AU': 'https://www.amazon.com.au'
    };
    return urls[region] || urls['IN'];
  }

  /**
   * Search for products (implements PlatformAdapter interface)
   * CRITICAL: Validates keywords to prevent duplicate product issues
   */
  async searchProducts(keywords = 'deals', filters = {}) {
    try {
      // VALIDATION: Ensure keywords are not empty
      if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
        logger.warn(`[Amazon Scraper] Invalid keywords: "${keywords}", using default "deals"`);
        keywords = 'deals';
      }

      const normalizedKeywords = keywords.trim();
      logger.info(`[Amazon Scraper] Searching for products with keyword: "${normalizedKeywords}"`);

      // Add delay before request to avoid rate limiting
      await sleep(this.config.requestDelay);

      // Build search URL with normalized keywords
      const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(normalizedKeywords)}`;

      logger.info(`[Amazon Scraper] Fetching: ${searchUrl}`);

      // Make HTTP request with headers to mimic browser
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      // Parse HTML with cheerio
      const $ = cheerio.load(response.data);

      // Extract products from search results
      const scrapedProducts = [];
      const maxResults = Math.min(filters.maxResults || 10, this.config.maxProducts);

      // Amazon search results are in div[data-component-type="s-search-result"]
      $('div[data-component-type="s-search-result"]').each((index, element) => {
        if (scrapedProducts.length >= maxResults) return false;

        try {
          const $product = $(element);

          // Extract ASIN
          const asin = $product.attr('data-asin');
          if (!asin || asin === '') return;

          // Extract title - it's in h2 > span
          const title = $product.find('h2 span').first().text().trim();
          if (!title || title.length < 10) return;

          // Extract price - look for .a-price span.a-offscreen first
          let currentPrice = 0;
          const priceOffscreen = $product.find('.a-price:not(.a-text-price) .a-offscreen').first().text();
          if (priceOffscreen) {
            const priceMatch = priceOffscreen.replace(/[,₹\s]/g, '');
            currentPrice = parseFloat(priceMatch);
          }

          if (!currentPrice || currentPrice === 0 || isNaN(currentPrice)) return;

          // Extract original price (if discounted) - look for .a-text-price
          let originalPrice = currentPrice;
          const originalPriceOffscreen = $product.find('.a-price.a-text-price .a-offscreen').first().text();
          if (originalPriceOffscreen) {
            const origMatch = originalPriceOffscreen.replace(/[,₹\s]/g, '');
            const origPrice = parseFloat(origMatch);
            if (origPrice && origPrice > currentPrice) {
              originalPrice = origPrice;
            }
          }

          // Extract image
          const imageUrl = $product.find('img.s-image').attr('src') || '';

          // Extract rating
          let rating = 0;
          const ratingAlt = $product.find('.a-icon-star-small .a-icon-alt, .a-icon-star-mini .a-icon-alt').first().text();
          if (ratingAlt) {
            const ratingMatch = ratingAlt.match(/(\d+\.?\d*)/);
            if (ratingMatch) {
              rating = parseFloat(ratingMatch[1]);
            }
          }

          // Extract review count
          let reviewCount = 0;
          const reviewLink = $product.find('a[href*="customerReviews"]').first();
          if (reviewLink.length > 0) {
            const reviewText = reviewLink.find('span').first().text();
            if (reviewText) {
              const reviewMatch = reviewText.replace(/[,]/g, '');
              reviewCount = parseInt(reviewMatch) || 0;
            }
          }

          scrapedProducts.push({
            asin,
            title,
            currentPrice,
            originalPrice,
            imageUrl,
            rating,
            reviewCount,
            inStock: true
          });

        } catch (err) {
          logger.debug('[Amazon Scraper] Error parsing product element:', err.message);
        }
      });

      if (scrapedProducts.length === 0) {
        logger.warn('[Amazon Scraper] No products found in search results');
        logger.warn('[Amazon Scraper] This may be due to Amazon blocking or HTML structure changes');
        return [];
      }

      logger.info(`[Amazon Scraper] Scraped ${scrapedProducts.length} products`);

      // Normalize products
      const products = scrapedProducts.map(product => this.normalizeProduct(product));

      // Apply filters
      const filtered = this.applyFilters(products, filters);

      logger.info(`[Amazon Scraper] Returning ${filtered.length} filtered products`);
      return filtered;

    } catch (error) {
      logger.error('[Amazon Scraper] Error searching for products', error.message);
      return [];
    }
  }

  /**
   * Convert amazon-buddy scraped products to normalized format
   */
  convertScrapedProducts(scrapedProducts) {
    const products = [];

    for (const item of scrapedProducts) {
      try {
        // Extract ASIN from URL
        const asin = this.extractAsinFromUrl(item.url);
        if (!asin) {
          logger.warn('[Amazon Scraper] Could not extract ASIN from URL:', item.url);
          continue;
        }

        // Parse prices
        const currentPrice = item.price?.current_price || 0;
        const originalPrice = item.price?.before_price || currentPrice;

        // Calculate discount if not provided
        let discountPercentage = item.price?.savings_percent || 0;
        if (!discountPercentage && originalPrice > currentPrice) {
          discountPercentage = calculateDiscount(originalPrice, currentPrice);
        }

        // Skip products with no discount if we're looking for deals
        if (currentPrice === 0) {
          continue;
        }

        const product = this.normalizeProduct({
          asin,
          title: item.title || 'Unknown Product',
          currentPrice,
          originalPrice,
          discountPercentage,
          imageUrl: item.thumbnail || '',
          category: 'General', // amazon-buddy doesn't provide category
          brand: '', // amazon-buddy doesn't provide brand
          rating: item.reviews?.rating || 0,
          reviewCount: item.reviews?.total_reviews || 0,
          inStock: true, // Assume in stock if listed
          sponsored: item.sponsored || false,
          amazonChoice: item.amazonChoice || false,
          bestSeller: item.bestSeller || false,
          amazonPrime: item.amazonPrime || false
        });

        products.push(product);
      } catch (error) {
        logger.error('[Amazon Scraper] Error processing scraped item', error);
      }
    }

    return products;
  }

  /**
   * Extract ASIN from Amazon URL
   */
  extractAsinFromUrl(url) {
    if (!url) return null;
    
    // Match patterns like /dp/B07CSLG8ST or /gp/product/B07CSLG8ST
    const match = url.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/);
    return match ? match[2] : null;
  }



  /**
   * Normalize scraped product to standard format
   */
  normalizeProduct(rawProduct) {
    // Calculate discount percentage if not provided
    const discountPercentage = rawProduct.discountPercentage ||
      calculateDiscount(rawProduct.originalPrice, rawProduct.currentPrice);

    return {
      platform: 'amazon-scraper',
      productId: rawProduct.asin,
      title: rawProduct.title,
      currentPrice: rawProduct.currentPrice,
      originalPrice: rawProduct.originalPrice,
      discountPercentage: Math.round(discountPercentage),
      currency: 'INR',
      imageUrl: rawProduct.imageUrl,
      category: rawProduct.category || 'General',
      brand: rawProduct.brand || '',
      rating: rawProduct.rating || 0,
      reviewCount: rawProduct.reviewCount || 0,
      inStock: rawProduct.inStock !== false,
      availabilityMessage: rawProduct.inStock ? 'In Stock' : 'Out of Stock',
      productUrl: `${this.baseUrl}/dp/${rawProduct.asin}`,
      affiliateLink: this.getAffiliateLink(rawProduct.asin),
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      // Additional metadata from scraper
      sponsored: rawProduct.sponsored || false,
      amazonChoice: rawProduct.amazonChoice || false,
      bestSeller: rawProduct.bestSeller || false,
      amazonPrime: rawProduct.amazonPrime || false
    };
  }

  /**
   * Get product details (implements PlatformAdapter interface)
   */
  async getProductDetails(productId) {
    try {
      logger.info(`[Amazon Scraper] Fetching details for ASIN: ${productId}`);
      
      // Add delay before request
      await sleep(this.config.requestDelay);
      
      // Use amazon-buddy's asin method
      const productData = await amazonScraper.asin({ 
        asin: productId,
        country: this.config.country 
      });

      if (!productData) {
        throw new Error('Product not found');
      }

      // Convert to normalized format
      return this.normalizeProduct({
        asin: productData.asin,
        title: productData.title,
        currentPrice: productData.price?.current_price || 0,
        originalPrice: productData.price?.before_price || 0,
        discountPercentage: productData.price?.savings_percent || 0,
        imageUrl: productData.main_image || '',
        category: 'General',
        brand: productData.product_information?.brand || '',
        rating: productData.reviews?.rating || 0,
        reviewCount: productData.reviews?.total_reviews || 0,
        inStock: true
      });

    } catch (error) {
      logger.error(`[Amazon Scraper] Error fetching product details for ${productId}`, error);
      throw error;
    }
  }

  /**
   * Generate affiliate link (implements PlatformAdapter interface)
   */
  async generateAffiliateLink(product) {
    return this.getAffiliateLink(product.productId);
  }

  /**
   * Get affiliate link for ASIN
   */
  getAffiliateLink(asin) {
    if (!this.config.partnerTag) {
      logger.warn('[Amazon Scraper] Partner tag not configured, returning plain URL');
      return `${this.baseUrl}/dp/${asin}`;
    }
    return `${this.baseUrl}/dp/${asin}?tag=${this.config.partnerTag}`;
  }

  /**
   * Check availability (implements PlatformAdapter interface)
   */
  async checkAvailability(product) {
    return product.inStock;
  }
}

module.exports = AmazonScraperAdapter;

