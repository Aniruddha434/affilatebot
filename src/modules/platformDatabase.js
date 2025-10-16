/**
 * Platform Database Module
 * 
 * Handles database operations for multi-platform functionality:
 * - Platform settings CRUD operations
 * - Platform-aware duplicate checking
 * - Platform-specific analytics
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class PlatformDatabase {
  constructor() {
    this.supabase = null;
  }

  /**
   * Initialize Supabase client
   */
  async initialize() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        logger.success('Platform database client initialized');
      } else {
        throw new Error('Supabase credentials not found for platform database');
      }
    } catch (error) {
      logger.error('Failed to initialize platform database', error);
      throw error;
    }
  }

  // ============================================
  // PLATFORM SETTINGS OPERATIONS
  // ============================================

  /**
   * Get all platform settings
   */
  async getAllPlatformSettings() {
    try {
      const { data, error } = await this.supabase
        .from('platform_settings')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching platform settings', error);
      return [];
    }
  }

  /**
   * Get settings for a specific platform
   */
  async getPlatformSettings(platform) {
    try {
      const { data, error } = await this.supabase
        .from('platform_settings')
        .select('*')
        .eq('platform', platform)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`Error fetching settings for ${platform}`, error);
      return null;
    }
  }

  /**
   * Get only enabled platforms
   */
  async getEnabledPlatforms() {
    try {
      const { data, error } = await this.supabase
        .from('platform_settings')
        .select('*')
        .eq('enabled', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching enabled platforms', error);
      return [];
    }
  }

  /**
   * Update platform settings
   */
  async updatePlatformSettings(platform, updates) {
    try {
      const { data, error } = await this.supabase
        .from('platform_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('platform', platform)
        .select()
        .single();

      if (error) throw error;
      
      logger.success(`Platform settings updated for ${platform}`);
      return data;
    } catch (error) {
      logger.error(`Error updating settings for ${platform}`, error);
      throw error;
    }
  }

  /**
   * Enable/disable a platform
   */
  async setPlatformEnabled(platform, enabled) {
    return await this.updatePlatformSettings(platform, { enabled });
  }

  /**
   * Update platform priority
   */
  async setPlatformPriority(platform, priority) {
    return await this.updatePlatformSettings(platform, { priority });
  }

  /**
   * Update posting ratio
   */
  async setPostingRatio(platform, ratio) {
    return await this.updatePlatformSettings(platform, { posting_ratio: ratio });
  }

  /**
   * Bulk update platform settings
   */
  async bulkUpdatePlatformSettings(platformUpdates) {
    try {
      const promises = platformUpdates.map(update =>
        this.updatePlatformSettings(update.platform, update.settings)
      );

      await Promise.all(promises);
      logger.success('Bulk platform settings update completed');
      return true;
    } catch (error) {
      logger.error('Error in bulk platform settings update', error);
      return false;
    }
  }

  // ============================================
  // POSTED DEALS OPERATIONS (Platform-Aware)
  // ============================================

  /**
   * Check if a product has been posted (platform-aware)
   */
  async isProductPosted(productId, platform) {
    try {
      const { data, error } = await this.supabase
        .from('posted_deals')
        .select('product_id')
        .eq('product_id', productId)
        .eq('platform', platform)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error(`Error checking if product ${productId} from ${platform} is posted`, error);
      return false;
    }
  }

  /**
   * Mark a product as posted (platform-aware)
   */
  async markAsPosted(product) {
    try {
      const { error } = await this.supabase
        .from('posted_deals')
        .insert({
          product_id: product.productId,
          platform: product.platform,
          title: product.title,
          discount_percentage: product.discountPercentage,
          current_price: product.currentPrice,
          original_price: product.originalPrice,
          product_url: product.productUrl,
          category: product.category,
          brand: product.brand,
          posted_at: new Date().toISOString()
        });

      if (error) {
        if (error.code === '23505') {
          logger.debug(`Product ${product.productId} from ${product.platform} already in database`);
          return true;
        }
        throw error;
      }

      logger.success(`Marked product ${product.productId} from ${product.platform} as posted`);
      return true;
    } catch (error) {
      logger.error(`Error marking product ${product.productId} as posted`, error);
      return false;
    }
  }

  /**
   * Get posted deals count by platform
   */
  async getPostedCountByPlatform(platform) {
    try {
      const { count, error } = await this.supabase
        .from('posted_deals')
        .select('*', { count: 'exact', head: true })
        .eq('platform', platform);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error(`Error getting posted count for ${platform}`, error);
      return 0;
    }
  }

  /**
   * Get total posted deals count (all platforms)
   */
  async getTotalPostedCount() {
    try {
      const { count, error } = await this.supabase
        .from('posted_deals')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting total posted count', error);
      return 0;
    }
  }

  /**
   * Get recent deals by platform
   */
  async getRecentDealsByPlatform(platform, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('posted_deals')
        .select('*')
        .eq('platform', platform)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error fetching recent deals for ${platform}`, error);
      return [];
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    try {
      const { data, error } = await this.supabase
        .rpc('platform_stats');

      if (error) {
        // If view doesn't exist, calculate manually
        return await this.calculatePlatformStats();
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching platform stats', error);
      return await this.calculatePlatformStats();
    }
  }

  /**
   * Calculate platform statistics manually
   */
  async calculatePlatformStats() {
    try {
      const platforms = await this.getAllPlatformSettings();
      const stats = [];

      for (const platform of platforms) {
        const count = await this.getPostedCountByPlatform(platform.platform);
        
        stats.push({
          platform: platform.platform,
          enabled: platform.enabled,
          priority: platform.priority,
          posting_ratio: platform.posting_ratio,
          total_deals_posted: count
        });
      }

      return stats;
    } catch (error) {
      logger.error('Error calculating platform stats', error);
      return [];
    }
  }

  // ============================================
  // ANALYTICS OPERATIONS
  // ============================================

  /**
   * Record platform-specific analytics
   */
  async recordPlatformAnalytics(date, platform, metrics) {
    try {
      const { error } = await this.supabase
        .from('bot_analytics')
        .upsert({
          date,
          platform,
          deals_posted: metrics.deals_posted || 0,
          deals_found: metrics.deals_found || 0,
          api_calls: metrics.api_calls || 0,
          api_errors: metrics.api_errors || 0,
          platform_metrics: metrics.additional || {}
        }, {
          onConflict: 'date,platform'
        });

      if (error) throw error;
      logger.info(`Analytics recorded for ${platform} on ${date}`);
    } catch (error) {
      logger.error(`Error recording analytics for ${platform}`, error);
    }
  }

  /**
   * Get analytics by platform
   */
  async getAnalyticsByPlatform(platform, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('bot_analytics')
        .select('*')
        .eq('platform', platform)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error fetching analytics for ${platform}`, error);
      return [];
    }
  }

  // ============================================
  // KEYWORD MANAGEMENT OPERATIONS
  // ============================================

  /**
   * Get all keywords
   */
  async getAllKeywords() {
    try {
      const { data, error } = await this.supabase
        .from('search_keywords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching keywords', error);
      return [];
    }
  }

  /**
   * Add a new keyword
   */
  async addKeyword(keyword, platform = null) {
    try {
      const { data, error } = await this.supabase
        .from('search_keywords')
        .insert({
          keyword,
          platform,
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      logger.success(`Keyword added: ${keyword} (${platform || 'global'})`);
      return data.id;
    } catch (error) {
      logger.error('Error adding keyword', error);
      throw error;
    }
  }

  /**
   * Delete a keyword
   */
  async deleteKeyword(keywordId) {
    try {
      const { error } = await this.supabase
        .from('search_keywords')
        .delete()
        .eq('id', keywordId);

      if (error) throw error;
      logger.success(`Keyword deleted: ID ${keywordId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting keyword', error);
      return false;
    }
  }

  /**
   * Increment keyword usage count
   */
  async incrementKeywordUsage(keywordId) {
    try {
      // Try the RPC function first
      const { error } = await this.supabase
        .rpc('increment_keyword_usage', { keyword_id: keywordId });

      // If function doesn't exist, fall back to direct update
      if (error && error.code === 'PGRST202') {
        logger.warn('RPC function not found, using direct update');

        // First, get the current usage count
        const { data: keyword, error: fetchError } = await this.supabase
          .from('search_keywords')
          .select('usage_count')
          .eq('id', keywordId)
          .single();

        if (fetchError) throw fetchError;

        // Then update with incremented count
        const { error: updateError } = await this.supabase
          .from('search_keywords')
          .update({ usage_count: (keyword.usage_count || 0) + 1 })
          .eq('id', keywordId);

        if (updateError) throw updateError;
        logger.info(`Keyword usage incremented: ID ${keywordId} (new count: ${(keyword.usage_count || 0) + 1})`);
      } else if (error) {
        throw error;
      } else {
        logger.info(`Keyword usage incremented via RPC: ID ${keywordId}`);
      }
    } catch (error) {
      logger.error('Error incrementing keyword usage', error);
    }
  }

  /**
   * Get keywords for a specific platform (including global keywords)
   */
  async getKeywordsForPlatform(platform) {
    try {
      const { data, error } = await this.supabase
        .from('search_keywords')
        .select('*')
        .or(`platform.eq.${platform},platform.is.null`)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error fetching keywords for ${platform}`, error);
      return [];
    }
  }
}

module.exports = new PlatformDatabase();

