/**
 * Platform Manager
 * 
 * Orchestrates multiple e-commerce platform adapters and manages
 * multi-platform product fetching, content mix ratios, and platform priorities.
 * 
 * This is the central hub for all platform operations.
 */

const logger = require('../../utils/logger');
const searchCache = require('../SearchCache');

class PlatformManager {
  constructor() {
    this.platforms = new Map();
    this.platformSettings = new Map();
    this.isInitialized = false;
  }

  /**
   * Register a platform adapter
   * @param {string} platformName - Platform identifier
   * @param {PlatformAdapter} adapter - Platform adapter instance
   */
  registerPlatform(platformName, adapter) {
    if (this.platforms.has(platformName)) {
      logger.warn(`Platform ${platformName} is already registered, replacing...`);
    }
    
    this.platforms.set(platformName, adapter);
    logger.info(`Platform registered: ${platformName}`);
  }

  /**
   * Initialize all registered platforms
   * @returns {Promise<void>}
   */
  async initialize() {
    logger.info('Initializing Platform Manager...');
    
    const initPromises = [];
    for (const [name, adapter] of this.platforms.entries()) {
      initPromises.push(
        adapter.initialize()
          .then(() => logger.success(`✅ ${name} adapter initialized`))
          .catch(err => logger.error(`Failed to initialize ${name} adapter`, err))
      );
    }

    await Promise.allSettled(initPromises);
    this.isInitialized = true;
    logger.success('Platform Manager initialized');
  }

  /**
   * Update platform settings from database
   * IMPORTANT: Invalidates search cache when settings change to prevent stale results
   * @param {Array<Object>} settings - Array of platform settings from DB
   */
  updatePlatformSettings(settings) {
    // Check if settings have actually changed
    const oldSettingsJson = JSON.stringify(Array.from(this.platformSettings.entries()));

    this.platformSettings.clear();

    for (const setting of settings) {
      this.platformSettings.set(setting.platform, {
        enabled: setting.enabled,
        priority: setting.priority || 1,
        postingRatio: setting.posting_ratio || 33,
        minDiscount: setting.min_discount || 50,
        keywordsInclude: setting.keywords_include || [],
        keywordsExclude: setting.keywords_exclude || [],
        priceMin: setting.price_min || null,
        priceMax: setting.price_max || null,
        categories: setting.categories || []
      });
    }

    const newSettingsJson = JSON.stringify(Array.from(this.platformSettings.entries()));

    // If settings changed, invalidate cache to prevent stale products
    if (oldSettingsJson !== newSettingsJson) {
      logger.warn('⚠️  Platform settings changed - invalidating search cache');
      searchCache.invalidateAll();
    }

    logger.info(`Platform settings updated for ${settings.length} platforms`);
  }

  /**
   * Get enabled platforms sorted by priority
   * @returns {Array<string>} Array of platform names
   */
  getEnabledPlatforms() {
    const enabled = [];
    
    for (const [name, settings] of this.platformSettings.entries()) {
      if (settings.enabled && this.platforms.has(name)) {
        enabled.push({ name, priority: settings.priority });
      }
    }

    // Sort by priority (lower number = higher priority)
    enabled.sort((a, b) => a.priority - b.priority);
    
    return enabled.map(p => p.name);
  }

  /**
   * Calculate how many products to fetch from each platform based on content mix
   * @param {number} totalProducts - Total number of products to fetch
   * @returns {Object} Map of platform name to product count
   */
  calculateContentMix(totalProducts) {
    const enabledPlatforms = this.getEnabledPlatforms();
    
    if (enabledPlatforms.length === 0) {
      logger.warn('No enabled platforms found');
      return {};
    }

    // Calculate total ratio
    let totalRatio = 0;
    const ratios = {};
    
    for (const platform of enabledPlatforms) {
      const settings = this.platformSettings.get(platform);
      ratios[platform] = settings.postingRatio;
      totalRatio += settings.postingRatio;
    }

    // Calculate product count for each platform
    const productCounts = {};
    let allocated = 0;

    for (const platform of enabledPlatforms) {
      const ratio = ratios[platform] / totalRatio;
      const count = Math.round(totalProducts * ratio);
      productCounts[platform] = count;
      allocated += count;
    }

    // Adjust for rounding errors - give extra products to highest priority platform
    if (allocated < totalProducts) {
      const diff = totalProducts - allocated;
      productCounts[enabledPlatforms[0]] += diff;
    } else if (allocated > totalProducts) {
      const diff = allocated - totalProducts;
      productCounts[enabledPlatforms[0]] = Math.max(0, productCounts[enabledPlatforms[0]] - diff);
    }

    logger.info(`Content mix calculated: ${JSON.stringify(productCounts)}`);
    return productCounts;
  }

  /**
   * Fetch products from all enabled platforms
   * CRITICAL: Validates keywords to ensure they're properly passed through
   * @param {string} keywords - Search keywords
   * @param {number} totalProducts - Total number of products to fetch
   * @returns {Promise<Array<Object>>} Array of products from all platforms
   */
  async fetchFromAllPlatforms(keywords, totalProducts) {
    // VALIDATION: Ensure keywords are not empty or null
    if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
      logger.error(`❌ CRITICAL: Invalid keywords passed to fetchFromAllPlatforms: "${keywords}"`);
      throw new Error('Keywords parameter is required and must be a non-empty string');
    }

    const normalizedKeywords = keywords.trim();
    logger.info(`🔍 Fetching products for keyword: "${normalizedKeywords}" (requesting ${totalProducts} total)`);

    const contentMix = this.calculateContentMix(totalProducts);
    const allProducts = [];
    const fetchPromises = [];

    for (const [platformName, count] of Object.entries(contentMix)) {
      if (count <= 0) continue;

      const adapter = this.platforms.get(platformName);
      const settings = this.platformSettings.get(platformName);

      if (!adapter || !adapter.isReady()) {
        logger.warn(`Platform ${platformName} is not ready, skipping`);
        continue;
      }

      // Build filters from platform settings
      const filters = {
        minDiscount: settings.minDiscount,
        maxResults: count * 5, // Fetch 5x extra to maximize coverage
        minPrice: settings.priceMin,
        maxPrice: settings.priceMax,
        categories: settings.categories,
        includeKeywords: settings.keywordsInclude,
        excludeKeywords: settings.keywordsExclude
      };

      // Fetch products from this platform
      // IMPORTANT: Keywords are explicitly passed to each adapter
      const promise = adapter.searchProducts(normalizedKeywords, filters)
        .then(products => {
          logger.info(`✅ [${platformName}] Fetched ${products.length} products for "${normalizedKeywords}"`);
          // Return all products, don't artificially limit
          // The scheduler will select the best ones
          return products;
        })
        .catch(err => {
          logger.error(`❌ [${platformName}] Failed to fetch for "${normalizedKeywords}"`, err.message);
          return [];
        });

      fetchPromises.push(promise);
    }

    // Wait for all platforms to respond
    const results = await Promise.allSettled(fetchPromises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allProducts.push(...result.value);
      }
    }

    logger.info(`📊 Total products fetched from all platforms for "${normalizedKeywords}": ${allProducts.length}`);
    return allProducts;
  }

  /**
   * Fetch products from a specific platform
   * @param {string} platformName - Platform to fetch from
   * @param {string} keywords - Search keywords
   * @param {number} maxResults - Maximum results
   * @returns {Promise<Array<Object>>} Array of products
   */
  async fetchFromPlatform(platformName, keywords, maxResults = 10) {
    const adapter = this.platforms.get(platformName);
    
    if (!adapter) {
      throw new Error(`Platform ${platformName} is not registered`);
    }

    if (!adapter.isReady()) {
      throw new Error(`Platform ${platformName} is not initialized`);
    }

    const settings = this.platformSettings.get(platformName) || {
      minDiscount: 50,
      keywordsInclude: [],
      keywordsExclude: [],
      priceMin: null,
      priceMax: null,
      categories: []
    };

    const filters = {
      minDiscount: settings.minDiscount,
      maxResults: maxResults,
      minPrice: settings.priceMin,
      maxPrice: settings.priceMax,
      categories: settings.categories,
      includeKeywords: settings.keywordsInclude,
      excludeKeywords: settings.keywordsExclude
    };

    return await adapter.searchProducts(keywords, filters);
  }

  /**
   * Get platform adapter by name
   * @param {string} platformName - Platform name
   * @returns {PlatformAdapter|null}
   */
  getPlatform(platformName) {
    return this.platforms.get(platformName) || null;
  }

  /**
   * Get all registered platform names
   * @returns {Array<string>}
   */
  getAllPlatformNames() {
    return Array.from(this.platforms.keys());
  }

  /**
   * Get platform settings
   * @param {string} platformName - Platform name
   * @returns {Object|null}
   */
  getPlatformSettings(platformName) {
    return this.platformSettings.get(platformName) || null;
  }

  /**
   * Check if platform is enabled
   * @param {string} platformName - Platform name
   * @returns {boolean}
   */
  isPlatformEnabled(platformName) {
    const settings = this.platformSettings.get(platformName);
    return settings ? settings.enabled : false;
  }

  /**
   * Get statistics about registered platforms
   * @returns {Object}
   */
  getStats() {
    const stats = {
      totalPlatforms: this.platforms.size,
      enabledPlatforms: 0,
      disabledPlatforms: 0,
      platforms: {}
    };

    for (const [name, adapter] of this.platforms.entries()) {
      const settings = this.platformSettings.get(name);
      const enabled = settings ? settings.enabled : false;
      
      if (enabled) stats.enabledPlatforms++;
      else stats.disabledPlatforms++;

      stats.platforms[name] = {
        enabled,
        ready: adapter.isReady(),
        priority: settings ? settings.priority : 999,
        postingRatio: settings ? settings.postingRatio : 0
      };
    }

    return stats;
  }
}

// Export singleton instance
module.exports = new PlatformManager();

