/**
 * Image Manager Module
 * Handles image caching, proxying, and management for product images
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class ImageManager {
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'cache', 'images');
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB
    this.maxImageSize = 5 * 1024 * 1024; // 5MB per image
    this.allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.cacheMetadata = new Map(); // In-memory cache metadata
  }

  /**
   * Initialize image manager
   */
  async initialize() {
    try {
      // Create cache directory if it doesn't exist
      await fs.mkdir(this.cacheDir, { recursive: true });
      
      // Load existing cache metadata
      await this.loadCacheMetadata();
      
      logger.success('Image manager initialized');
    } catch (error) {
      logger.error('Failed to initialize image manager', error);
      throw error;
    }
  }

  /**
   * Load cache metadata from disk
   */
  async loadCacheMetadata() {
    try {
      const metadataPath = path.join(this.cacheDir, 'metadata.json');
      const data = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(data);
      
      this.cacheMetadata = new Map(Object.entries(metadata));
      logger.info(`Loaded ${this.cacheMetadata.size} cached images`);
    } catch (error) {
      // Metadata file doesn't exist yet, that's okay
      logger.info('No existing cache metadata found');
    }
  }

  /**
   * Save cache metadata to disk
   */
  async saveCacheMetadata() {
    try {
      const metadataPath = path.join(this.cacheDir, 'metadata.json');
      const metadata = Object.fromEntries(this.cacheMetadata);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      logger.error('Failed to save cache metadata', error);
    }
  }

  /**
   * Generate cache key for an image URL
   * @param {string} imageUrl - Image URL
   * @returns {string} Cache key
   */
  generateCacheKey(imageUrl) {
    return crypto.createHash('md5').update(imageUrl).digest('hex');
  }

  /**
   * Get cached image path
   * @param {string} cacheKey - Cache key
   * @returns {string} File path
   */
  getCachePath(cacheKey) {
    return path.join(this.cacheDir, `${cacheKey}.img`);
  }

  /**
   * Check if image is cached
   * @param {string} imageUrl - Image URL
   * @returns {boolean} True if cached
   */
  isCached(imageUrl) {
    const cacheKey = this.generateCacheKey(imageUrl);
    return this.cacheMetadata.has(cacheKey);
  }

  /**
   * Get cached image
   * @param {string} imageUrl - Image URL
   * @returns {Object|null} Cached image data or null
   */
  async getCachedImage(imageUrl) {
    const cacheKey = this.generateCacheKey(imageUrl);
    const metadata = this.cacheMetadata.get(cacheKey);
    
    if (!metadata) {
      return null;
    }
    
    try {
      const cachePath = this.getCachePath(cacheKey);
      const imageBuffer = await fs.readFile(cachePath);
      
      // Update last accessed time
      metadata.lastAccessed = Date.now();
      this.cacheMetadata.set(cacheKey, metadata);
      
      return {
        buffer: imageBuffer,
        contentType: metadata.contentType,
        size: metadata.size,
        originalUrl: metadata.originalUrl
      };
    } catch (error) {
      logger.error('Failed to read cached image', error);
      // Remove invalid cache entry
      this.cacheMetadata.delete(cacheKey);
      return null;
    }
  }

  /**
   * Download and cache an image
   * @param {string} imageUrl - Image URL to download
   * @returns {Object} Downloaded image data
   */
  async downloadAndCacheImage(imageUrl) {
    try {
      logger.info(`Downloading image: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        maxContentLength: this.maxImageSize,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AffiliateBot/1.0)'
        }
      });
      
      const contentType = response.headers['content-type'];
      
      // Validate content type
      if (!this.allowedFormats.includes(contentType)) {
        throw new Error(`Unsupported image format: ${contentType}`);
      }
      
      const imageBuffer = Buffer.from(response.data);
      const imageSize = imageBuffer.length;
      
      // Validate size
      if (imageSize > this.maxImageSize) {
        throw new Error(`Image too large: ${imageSize} bytes`);
      }
      
      // Cache the image
      const cacheKey = this.generateCacheKey(imageUrl);
      const cachePath = this.getCachePath(cacheKey);
      
      await fs.writeFile(cachePath, imageBuffer);
      
      // Update metadata
      const metadata = {
        originalUrl: imageUrl,
        contentType,
        size: imageSize,
        cachedAt: Date.now(),
        lastAccessed: Date.now()
      };
      
      this.cacheMetadata.set(cacheKey, metadata);
      await this.saveCacheMetadata();
      
      logger.success(`Image cached: ${cacheKey}`);
      
      return {
        buffer: imageBuffer,
        contentType,
        size: imageSize,
        originalUrl: imageUrl
      };
    } catch (error) {
      logger.error('Failed to download image', error);
      throw error;
    }
  }

  /**
   * Get image (from cache or download)
   * @param {string} imageUrl - Image URL
   * @returns {Object} Image data
   */
  async getImage(imageUrl) {
    // Check cache first
    const cached = await this.getCachedImage(imageUrl);
    if (cached) {
      logger.debug(`Image served from cache: ${imageUrl}`);
      return cached;
    }
    
    // Download and cache
    return await this.downloadAndCacheImage(imageUrl);
  }

  /**
   * Validate image URL
   * @param {string} imageUrl - Image URL to validate
   * @returns {Promise<boolean>} True if valid
   */
  async validateImageUrl(imageUrl) {
    try {
      const response = await axios.head(imageUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AffiliateBot/1.0)'
        }
      });
      
      const contentType = response.headers['content-type'];
      const contentLength = parseInt(response.headers['content-length'] || '0');
      
      if (!this.allowedFormats.includes(contentType)) {
        return false;
      }
      
      if (contentLength > this.maxImageSize) {
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Image URL validation failed', error);
      return false;
    }
  }

  /**
   * Clean up old cached images
   * @param {number} maxAgeMs - Maximum age in milliseconds
   */
  async cleanupOldCache(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
    try {
      const now = Date.now();
      let deletedCount = 0;
      
      for (const [cacheKey, metadata] of this.cacheMetadata.entries()) {
        const age = now - metadata.lastAccessed;
        
        if (age > maxAgeMs) {
          const cachePath = this.getCachePath(cacheKey);
          
          try {
            await fs.unlink(cachePath);
            this.cacheMetadata.delete(cacheKey);
            deletedCount++;
          } catch (error) {
            logger.error(`Failed to delete cached image: ${cacheKey}`, error);
          }
        }
      }
      
      if (deletedCount > 0) {
        await this.saveCacheMetadata();
        logger.info(`Cleaned up ${deletedCount} old cached images`);
      }
    } catch (error) {
      logger.error('Cache cleanup failed', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  async getCacheStats() {
    let totalSize = 0;
    
    for (const metadata of this.cacheMetadata.values()) {
      totalSize += metadata.size;
    }
    
    return {
      totalImages: this.cacheMetadata.size,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      maxCacheSizeMB: (this.maxCacheSize / (1024 * 1024)).toFixed(2),
      usagePercent: ((totalSize / this.maxCacheSize) * 100).toFixed(2)
    };
  }

  /**
   * Clear all cached images
   */
  async clearCache() {
    try {
      for (const cacheKey of this.cacheMetadata.keys()) {
        const cachePath = this.getCachePath(cacheKey);
        try {
          await fs.unlink(cachePath);
        } catch (error) {
          // Ignore errors for individual files
        }
      }
      
      this.cacheMetadata.clear();
      await this.saveCacheMetadata();
      
      logger.info('Image cache cleared');
    } catch (error) {
      logger.error('Failed to clear cache', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new ImageManager();

