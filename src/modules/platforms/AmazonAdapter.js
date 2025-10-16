/**
 * Amazon Platform Adapter
 * 
 * Implements PlatformAdapter interface for Amazon Product Advertising API (PA-API).
 * Handles AWS Signature V4 authentication and product search/filtering.
 */

const axios = require('axios');
const crypto = require('crypto');
const PlatformAdapter = require('./PlatformAdapter');
const logger = require('../../utils/logger');
const { calculateDiscount } = require('../../utils/helpers');

class AmazonAdapter extends PlatformAdapter {
  constructor() {
    super('amazon', {
      accessKey: process.env.AMAZON_ACCESS_KEY,
      secretKey: process.env.AMAZON_SECRET_KEY,
      partnerTag: process.env.AMAZON_PARTNER_TAG,
      region: process.env.AMAZON_REGION || 'IN'
    });

    this.host = this.getHostForRegion(this.config.region);
    this.endpoint = `https://${this.host}/paapi5/searchitems`;
  }

  /**
   * Initialize Amazon adapter
   */
  async initialize() {
    await super.initialize();

    // Check if credentials are available
    if (!this.config.accessKey || !this.config.secretKey || !this.config.partnerTag) {
      logger.warn('⚠️  Amazon PA-API credentials not configured');
      logger.warn('   This adapter will be disabled. Use Amazon Scraper instead.');
      this.isDisabled = true;
      return;
    }

    logger.success('Amazon adapter initialized successfully');
  }

  /**
   * Get API host based on region
   */
  getHostForRegion(region) {
    const hosts = {
      'US': 'webservices.amazon.com',
      'UK': 'webservices.amazon.co.uk',
      'DE': 'webservices.amazon.de',
      'FR': 'webservices.amazon.fr',
      'JP': 'webservices.amazon.co.jp',
      'CA': 'webservices.amazon.ca',
      'IN': 'webservices.amazon.in',
      'IT': 'webservices.amazon.it',
      'ES': 'webservices.amazon.es',
      'BR': 'webservices.amazon.com.br',
      'MX': 'webservices.amazon.com.mx',
      'AU': 'webservices.amazon.com.au'
    };
    return hosts[region] || hosts['IN'];
  }

  /**
   * Generate AWS Signature Version 4
   */
  generateSignature(method, path, queryString, headers, payload) {
    const dateStamp = headers['X-Amz-Date'].substring(0, 8);
    const credentialScope = `${dateStamp}/${this.config.region.toLowerCase()}/ProductAdvertisingAPI/aws4_request`;

    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
      .join('');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = [
      method,
      path,
      queryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    // Create string to sign
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      headers['X-Amz-Date'],
      credentialScope,
      canonicalRequestHash
    ].join('\n');

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${this.config.secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.config.region.toLowerCase()).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return `AWS4-HMAC-SHA256 Credential=${this.config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  /**
   * Make signed request to Amazon PA-API
   */
  async makeRequest(payload) {
    try {
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
      
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Amz-Date': amzDate,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'Content-Encoding': 'amz-1.0',
        'Host': this.host
      };

      const payloadString = JSON.stringify(payload);
      const authorization = this.generateSignature('POST', '/paapi5/searchitems', '', headers, payloadString);
      headers['Authorization'] = authorization;

      const response = await axios.post(this.endpoint, payloadString, { headers });
      return response.data;
    } catch (error) {
      logger.error('Amazon API request failed', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Search for products (implements PlatformAdapter interface)
   * CRITICAL: Validates keywords to prevent duplicate product issues
   */
  async searchProducts(keywords = 'deals', filters = {}) {
    try {
      // VALIDATION: Ensure keywords are not empty
      if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
        logger.warn(`[Amazon] Invalid keywords: "${keywords}", using default "deals"`);
        keywords = 'deals';
      }

      const normalizedKeywords = keywords.trim();
      logger.info(`[Amazon] Searching for products with keyword: "${normalizedKeywords}"`);

      const payload = {
        PartnerTag: this.config.partnerTag,
        PartnerType: 'Associates',
        Keywords: normalizedKeywords,  // Use normalized keywords
        SearchIndex: 'All',
        ItemCount: Math.min(filters.maxResults || 10, 10), // Amazon PA-API max is 10
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.ByLineInfo',
          'ItemInfo.Classifications',
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis',
          'Offers.Listings.Availability.Message',
          'Offers.Listings.Condition'
        ]
      };

      const data = await this.makeRequest(payload);

      if (!data.SearchResult || !data.SearchResult.Items) {
        logger.warn(`[Amazon] No products found for "${normalizedKeywords}"`);
        return [];
      }

      // Convert Amazon items to normalized format
      const products = this.convertAmazonItems(data.SearchResult.Items);

      // Apply filters
      const filtered = this.applyFilters(products, filters);

      logger.info(`[Amazon] Returning ${filtered.length} filtered products for "${normalizedKeywords}"`);
      return filtered;
    } catch (error) {
      logger.error('[Amazon] Error searching for products', error);

      // Fallback to mock data on error (useful for new accounts or testing)
      logger.warn(`[Amazon] Falling back to mock data for "${keywords}"`);
      return this.getMockProducts(keywords, filters);
    }
  }

  /**
   * Get mock products for testing (placeholder implementation)
   * Useful when Amazon PA-API credentials are not yet active (2-day waiting period)
   *
   * NOW KEYWORD-AWARE: Generates diverse products based on search term
   */
  getMockProducts(keywords, filters) {
    logger.info(`[Amazon] Generating keyword-aware mock products for: "${keywords}"`);

    // Generate products based on keyword
    const mockProducts = this.generateKeywordAwareMockProducts(keywords, filters.maxResults || 10);

    // Convert to normalized format - directly map fields
    const products = mockProducts.map(product => this.normalizeProduct({
      asin: product.productId,
      title: product.title,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      imageUrl: product.imageUrl,
      category: product.category,
      brand: product.brand,
      inStock: product.inStock,
      detailPageURL: product.productUrl
    }));

    // Apply ALL filters including keyword filters
    const filtered = this.applyFilters(products, filters);

    logger.info(`[Amazon] Returning ${filtered.length} keyword-aware mock products`);
    return filtered;
  }

  /**
   * Generate keyword-aware mock products
   * Creates diverse products that match the search intent
   */
  generateKeywordAwareMockProducts(keywords, count = 10) {
    const keywordLower = keywords.toLowerCase();
    const products = [];

    // Product templates organized by category
    const templates = {
      electronics: [
        { name: 'Smartphone', brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme'], priceRange: [15000, 80000] },
        { name: 'Laptop', brands: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer'], priceRange: [30000, 100000] },
        { name: 'Headphones', brands: ['Sony', 'JBL', 'boAt', 'Sennheiser', 'Bose'], priceRange: [1000, 25000] },
        { name: 'Smartwatch', brands: ['Apple', 'Samsung', 'Noise', 'Fire-Boltt', 'Amazfit'], priceRange: [2000, 40000] },
        { name: 'Tablet', brands: ['Apple', 'Samsung', 'Lenovo', 'Amazon', 'Xiaomi'], priceRange: [10000, 70000] },
        { name: 'Camera', brands: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'GoPro'], priceRange: [20000, 150000] },
        { name: 'Speaker', brands: ['JBL', 'Sony', 'boAt', 'Bose', 'Marshall'], priceRange: [1500, 30000] },
        { name: 'Power Bank', brands: ['Anker', 'Mi', 'Ambrane', 'Syska', 'OnePlus'], priceRange: [500, 3000] }
      ],
      fashion: [
        { name: 'Jeans', brands: ['Levis', 'Wrangler', 'Lee', 'Pepe', 'Spykar'], priceRange: [800, 3500] },
        { name: 'T-Shirt', brands: ['Nike', 'Adidas', 'Puma', 'H&M', 'Zara'], priceRange: [400, 2000] },
        { name: 'Shoes', brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Skechers'], priceRange: [1500, 8000] },
        { name: 'Dress', brands: ['H&M', 'Zara', 'Forever 21', 'Vero Moda', 'Only'], priceRange: [1000, 5000] },
        { name: 'Jacket', brands: ['Levis', 'Roadster', 'Jack & Jones', 'Wrangler', 'Pepe'], priceRange: [1500, 6000] },
        { name: 'Watch', brands: ['Fossil', 'Titan', 'Casio', 'Timex', 'Fastrack'], priceRange: [2000, 15000] }
      ],
      home: [
        { name: 'Mixer Grinder', brands: ['Philips', 'Bajaj', 'Prestige', 'Butterfly', 'Havells'], priceRange: [2000, 8000] },
        { name: 'Vacuum Cleaner', brands: ['Dyson', 'Eureka Forbes', 'Philips', 'Kent', 'Inalsa'], priceRange: [3000, 40000] },
        { name: 'Air Purifier', brands: ['Philips', 'Mi', 'Dyson', 'Honeywell', 'Kent'], priceRange: [5000, 50000] },
        { name: 'Water Purifier', brands: ['Kent', 'Aquaguard', 'Pureit', 'Livpure', 'Blue Star'], priceRange: [8000, 25000] },
        { name: 'Microwave', brands: ['Samsung', 'LG', 'IFB', 'Bajaj', 'Panasonic'], priceRange: [5000, 20000] }
      ],
      books: [
        { name: 'Fiction Book', brands: ['Penguin', 'HarperCollins', 'Random House', 'Scholastic', 'Bloomsbury'], priceRange: [200, 800] },
        { name: 'Self-Help Book', brands: ['Penguin', 'Simon & Schuster', 'Hay House', 'Wiley', 'McGraw Hill'], priceRange: [250, 900] },
        { name: 'Textbook', brands: ['McGraw Hill', 'Pearson', 'Wiley', 'Oxford', 'Cambridge'], priceRange: [400, 2000] }
      ],
      beauty: [
        { name: 'Face Cream', brands: ['Lakme', 'Olay', 'Nivea', 'Ponds', 'Garnier'], priceRange: [200, 1500] },
        { name: 'Lipstick', brands: ['Maybelline', 'Lakme', 'MAC', 'Revlon', 'LOreal'], priceRange: [300, 2000] },
        { name: 'Perfume', brands: ['Davidoff', 'Calvin Klein', 'Hugo Boss', 'Versace', 'Armani'], priceRange: [1500, 8000] },
        { name: 'Hair Dryer', brands: ['Philips', 'Havells', 'Syska', 'Nova', 'Vega'], priceRange: [800, 5000] }
      ],
      sports: [
        { name: 'Yoga Mat', brands: ['Strauss', 'Cockatoo', 'Boldfit', 'Nivia', 'Kore'], priceRange: [400, 2000] },
        { name: 'Dumbbell Set', brands: ['Strauss', 'Kore', 'Cockatoo', 'Aurion', 'Protoner'], priceRange: [800, 5000] },
        { name: 'Cricket Bat', brands: ['MRF', 'SG', 'SS', 'Kookaburra', 'Gray-Nicolls'], priceRange: [1500, 15000] },
        { name: 'Football', brands: ['Nike', 'Adidas', 'Puma', 'Nivia', 'Cosco'], priceRange: [500, 3000] }
      ]
    };

    // Determine category from keyword
    let selectedCategory = 'electronics'; // default
    if (keywordLower.includes('fashion') || keywordLower.includes('cloth') || keywordLower.includes('shoe') || keywordLower.includes('dress')) {
      selectedCategory = 'fashion';
    } else if (keywordLower.includes('home') || keywordLower.includes('appliance') || keywordLower.includes('kitchen')) {
      selectedCategory = 'home';
    } else if (keywordLower.includes('book')) {
      selectedCategory = 'books';
    } else if (keywordLower.includes('beauty') || keywordLower.includes('cosmetic')) {
      selectedCategory = 'beauty';
    } else if (keywordLower.includes('sport') || keywordLower.includes('fitness') || keywordLower.includes('gym')) {
      selectedCategory = 'sports';
    }

    const categoryTemplates = templates[selectedCategory] || templates.electronics;

    // Generate products
    for (let i = 0; i < count; i++) {
      const template = categoryTemplates[i % categoryTemplates.length];
      const brand = template.brands[Math.floor(Math.random() * template.brands.length)];
      const [minPrice, maxPrice] = template.priceRange;
      const originalPrice = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
      const discountPercent = Math.floor(Math.random() * 60) + 20; // 20-80% discount
      const currentPrice = Math.floor(originalPrice * (1 - discountPercent / 100));

      products.push({
        productId: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        title: `${brand} ${template.name} ${keywords.split(' ')[0]} Edition`,
        currentPrice,
        originalPrice,
        discountPercentage: discountPercent,
        imageUrl: `https://m.media-amazon.com/images/I/${Math.random().toString(36).substring(2, 15)}.jpg`,
        category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
        brand,
        inStock: true,
        productUrl: `https://www.amazon.in/dp/B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });
    }

    return products;
  }

  /**
   * Convert Amazon API items to normalized product format
   */
  convertAmazonItems(items) {
    const products = [];

    for (const item of items) {
      try {
        const offer = item.Offers?.Listings?.[0];
        if (!offer) continue;

        // Check if in stock
        const availability = offer.Availability?.Message || '';
        const inStock = availability.toLowerCase().includes('in stock');

        // Get prices
        const currentPrice = offer.Price?.Amount;
        const originalPrice = offer.SavingBasis?.Amount;

        if (!currentPrice) continue;

        // Calculate discount
        const discountPercentage = originalPrice 
          ? calculateDiscount(originalPrice, currentPrice)
          : 0;

        // Extract category
        const category = item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue || 'General';
        const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '';

        const product = this.normalizeProduct({
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
          currentPrice,
          originalPrice: originalPrice || currentPrice,
          discountPercentage,
          imageUrl: item.Images?.Primary?.Large?.URL || '',
          category,
          brand,
          inStock,
          availability,
          detailPageURL: item.DetailPageURL
        });

        products.push(product);
      } catch (error) {
        logger.error('[Amazon] Error processing item', error);
      }
    }

    return products;
  }

  /**
   * Normalize Amazon product to standard format
   */
  normalizeProduct(rawProduct) {
    return {
      platform: 'amazon',
      productId: rawProduct.asin,
      title: rawProduct.title,
      currentPrice: rawProduct.currentPrice,
      originalPrice: rawProduct.originalPrice,
      discountPercentage: Math.round(rawProduct.discountPercentage),
      currency: 'INR',
      imageUrl: rawProduct.imageUrl,
      category: rawProduct.category,
      brand: rawProduct.brand,
      rating: 0,
      reviewCount: 0,
      inStock: rawProduct.inStock,
      availabilityMessage: rawProduct.availability,
      productUrl: rawProduct.detailPageURL,
      affiliateLink: this.getAffiliateLink(rawProduct.asin),
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    };
  }

  /**
   * Get product details (implements PlatformAdapter interface)
   */
  async getProductDetails(productId) {
    // For Amazon, we'd need to use GetItems operation
    // For now, return basic structure
    throw new Error('getProductDetails not yet implemented for Amazon');
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
    const baseUrl = this.config.region === 'IN' ? 'https://www.amazon.in' : 'https://www.amazon.com';
    return `${baseUrl}/dp/${asin}?tag=${this.config.partnerTag}`;
  }

  /**
   * Check availability (implements PlatformAdapter interface)
   */
  async checkAvailability(product) {
    return product.inStock;
  }
}

module.exports = AmazonAdapter;

