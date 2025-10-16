/**
 * Search Cache Module
 * 
 * Implements intelligent caching for product search results with:
 * - Keyword-based cache keys (prevents duplicate result issues)
 * - TTL-based expiration (15 minutes default)
 * - Platform-aware caching
 * - Cache statistics and monitoring
 * 
 * This solves the duplicate results problem by ensuring each unique
 * keyword search is cached separately.
 */

const logger = require('../utils/logger');

class SearchCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
    this.defaultTTL = 15 * 60 * 1000; // 15 minutes
    this.maxCacheSize = 1000; // Maximum number of cached entries
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Generate cache key from search parameters
   * CRITICAL: Includes all filter parameters to prevent cross-contamination
   * @param {string} keywords - Search keywords
   * @param {string} platform - Platform name (optional)
   * @param {Object} filters - Search filters (optional)
   * @returns {string} Cache key
   */
  generateKey(keywords, platform = 'all', filters = {}) {
    // Validate keywords parameter
    if (!keywords || typeof keywords !== 'string') {
      logger.warn(`[SearchCache] Invalid keywords parameter: ${keywords}, using 'default'`);
      keywords = 'default';
    }

    const normalizedKeywords = keywords.toLowerCase().trim();

    // Include ALL filter parameters to prevent cache collisions
    // This ensures different filter combinations don't share cache entries
    const filterKey = JSON.stringify({
      minDiscount: filters.minDiscount || 0,
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 999999,
      categories: filters.categories || [],
      includeKeywords: filters.includeKeywords || [],
      excludeKeywords: filters.excludeKeywords || [],
      maxResults: filters.maxResults || 0,
      inStockOnly: filters.inStockOnly !== false // Default to true
    });

    const cacheKey = `${platform}:${normalizedKeywords}:${filterKey}`;

    // Log cache key generation for debugging
    logger.debug(`[SearchCache] Generated key for "${keywords}" on ${platform}: ${cacheKey.substring(0, 80)}...`);

    return cacheKey;
  }

  /**
   * Get cached search results
   * @param {string} keywords - Search keywords
   * @param {string} platform - Platform name
   * @param {Object} filters - Search filters
   * @returns {Array|null} Cached products or null if not found/expired
   */
  get(keywords, platform = 'all', filters = {}) {
    const key = this.generateKey(keywords, platform, filters);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      logger.debug(`[SearchCache] MISS: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      logger.debug(`[SearchCache] EXPIRED: ${key}`);
      return null;
    }

    // Update last accessed time
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    logger.debug(`[SearchCache] HIT: ${key} (${entry.products.length} products)`);
    
    return entry.products;
  }

  /**
   * Cache search results
   * @param {string} keywords - Search keywords
   * @param {Array} products - Products to cache
   * @param {string} platform - Platform name
   * @param {Object} filters - Search filters
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(keywords, products, platform = 'all', filters = {}, ttl = null) {
    const key = this.generateKey(keywords, platform, filters);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    // Enforce max cache size (LRU eviction)
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      products,
      keywords,
      platform,
      filters,
      cachedAt: Date.now(),
      expiresAt,
      lastAccessed: Date.now()
    });

    this.stats.sets++;
    logger.debug(`[SearchCache] SET: ${key} (${products.length} products, TTL: ${Math.round((ttl || this.defaultTTL) / 1000)}s)`);
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      logger.debug(`[SearchCache] EVICTED (LRU): ${oldestKey}`);
    }
  }

  /**
   * Invalidate cache entries matching pattern
   * @param {string} pattern - Pattern to match (keywords or platform)
   */
  invalidate(pattern) {
    let count = 0;
    const keysToDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(pattern) || entry.keywords.includes(pattern) || entry.platform === pattern) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      count++;
    }

    logger.info(`[SearchCache] Invalidated ${count} entries matching: ${pattern}`);
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`[SearchCache] Cleared ${size} entries`);
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.stats.evictions += count;
      logger.debug(`[SearchCache] Cleaned up ${count} expired entries`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      evictions: this.stats.evictions,
      hitRate: `${hitRate}%`,
      defaultTTL: `${this.defaultTTL / 1000}s`
    };
  }

  /**
   * Get all cached keywords (for debugging)
   * @returns {Array<string>} List of cached keywords
   */
  getCachedKeywords() {
    const keywords = new Set();
    for (const entry of this.cache.values()) {
      keywords.add(entry.keywords);
    }
    return Array.from(keywords);
  }

  /**
   * Invalidate all cache entries (used when platform settings change)
   * This prevents stale cached products from being used with new filter settings
   */
  invalidateAll() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`[SearchCache] Invalidated ALL ${size} cache entries due to settings change`);
  }

  /**
   * Destroy cache and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    logger.info('[SearchCache] Destroyed');
  }
}

// Export singleton instance
module.exports = new SearchCache();

