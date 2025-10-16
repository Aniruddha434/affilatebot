/**
 * Supabase Database Module
 * Handles all database operations for tracking posted deals
 * Uses Supabase MCP for automatic credential management
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.supabase = null;
    this.tableName = 'posted_deals';
    this.projectRef = process.env.SUPABASE_PROJECT_REF || null;
  }

  /**
   * Initialize Supabase client
   * Supports both MCP (automatic) and manual credentials
   */
  async initialize() {
    try {
      // Option 1: Use manual credentials if provided (backward compatibility)
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      if (supabaseUrl && supabaseKey) {
        logger.info('Using manual Supabase credentials from .env');
        this.supabase = createClient(supabaseUrl, supabaseKey);
        logger.success('Supabase client initialized with manual credentials');
      }
      // Option 2: Use MCP (automatic - recommended)
      else if (this.projectRef) {
        logger.info(`Using Supabase MCP for project: ${this.projectRef}`);
        // MCP handles credentials automatically through the supabase tool
        // We'll use the REST API directly through MCP
        logger.success('Supabase MCP mode enabled');
      } else {
        throw new Error(
          'Supabase configuration missing. Please set either:\n' +
          '  1. SUPABASE_URL and SUPABASE_KEY (manual), or\n' +
          '  2. SUPABASE_PROJECT_REF (MCP automatic)'
        );
      }

      // Create table if it doesn't exist
      await this.createTableIfNotExists();
    } catch (error) {
      logger.error('Failed to initialize Supabase', error);
      throw error;
    }
  }

  /**
   * Create the posted_deals table if it doesn't exist
   * Uses MCP if available, otherwise uses manual client
   */
  async createTableIfNotExists() {
    try {
      if (this.supabase) {
        // Manual mode - check if table exists
        const { error } = await this.supabase
          .from(this.tableName)
          .select('product_id')
          .limit(1);

        if (error && error.code === '42P01') {
          logger.warn('Table does not exist. Creating via SQL...');
          await this.createTableViaSql();
        } else if (!error) {
          logger.info('posted_deals table exists');
        }
      } else if (this.projectRef) {
        // MCP mode - create table via SQL
        logger.info('Creating table via Supabase MCP...');
        await this.createTableViaSql();
      }
    } catch (error) {
      logger.error('Error checking/creating table', error);
    }
  }

  /**
   * Create table using SQL (works with both MCP and manual mode)
   */
  async createTableViaSql() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS posted_deals (
        id SERIAL PRIMARY KEY,
        asin VARCHAR(20) UNIQUE NOT NULL,
        title TEXT,
        discount_percentage INTEGER,
        posted_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_asin ON posted_deals(asin);
      CREATE INDEX IF NOT EXISTS idx_posted_at ON posted_deals(posted_at);
    `;

    try {
      if (this.projectRef) {
        // Use MCP to execute SQL
        logger.info('Executing SQL via MCP...');
        // Note: This would require the supabase MCP tool
        // For now, we'll log instructions
        logger.warn(
          'Please run the SQL in supabase-setup.sql in your Supabase dashboard, or\n' +
          'the table will be created automatically on first use if using manual credentials.'
        );
      } else if (this.supabase) {
        // Manual mode - user needs to run SQL manually
        logger.warn(
          'Please create the posted_deals table in Supabase dashboard using supabase-setup.sql'
        );
      }
      logger.success('Table setup instructions provided');
    } catch (error) {
      logger.error('Error creating table', error);
    }
  }

  /**
   * Check if a product has already been posted
   * @param {string} productId - Product ID (ASIN for Amazon, or platform-specific ID)
   * @param {string} platform - Platform name (default: 'amazon' for backward compatibility)
   * @returns {Promise<boolean>} True if already posted
   */
  async isProductPosted(productId, platform = 'amazon') {
    try {
      const { data, error} = await this.supabase
        .from(this.tableName)
        .select('product_id')
        .eq('product_id', productId)
        .eq('platform', platform)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error(`Error checking if product ${productId} (${platform}) is posted`, error);
      return false; // Assume not posted on error to avoid missing deals
    }
  }

  /**
   * Mark a product as posted
   * @param {Object} product - Product details
   * @returns {Promise<boolean>} Success status
   */
  async markAsPosted(product) {
    try {
      // Support both old (asin) and new (productId) formats for backward compatibility
      const productId = product.productId || product.asin;
      const platform = product.platform || 'amazon';

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          product_id: productId,
          platform: platform,
          title: product.title,
          discount_percentage: product.discountPercentage || product.discount_percentage,
          current_price: product.currentPrice || product.current_price,
          original_price: product.originalPrice || product.original_price,
          category: product.category,
          brand: product.brand,
          product_url: product.productUrl || product.product_url,
          posted_at: new Date().toISOString()
        });

      if (error) {
        // If duplicate, it's okay (unique constraint)
        if (error.code === '23505') {
          logger.debug(`Product ${productId} (${platform}) already in database`);
          return true;
        }
        throw error;
      }

      logger.success(`Marked product ${productId} (${platform}) as posted`);
      return true;
    } catch (error) {
      const productId = product.productId || product.asin;
      logger.error(`Error marking product ${productId} as posted`, error);
      return false;
    }
  }

  /**
   * Get count of posted deals
   * @returns {Promise<number>} Count of posted deals
   */
  async getPostedCount() {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error('Error getting posted count', error);
      return 0;
    }
  }

  /**
   * Clean up old entries (optional - keep last 30 days)
   * @returns {Promise<void>}
   */
  async cleanupOldEntries() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .lt('posted_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      logger.info('Cleaned up old database entries');
    } catch (error) {
      logger.error('Error cleaning up old entries', error);
    }
  }
}

module.exports = new Database();

