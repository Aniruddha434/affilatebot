/**
 * Admin Database Module
 * Handles database operations for admin panel using Supabase client
 * This module provides CRUD operations for admin panel tables
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

class AdminDatabase {
  constructor() {
    this.supabase = null;
    this.projectRef = process.env.SUPABASE_PROJECT_REF || null;
  }

  /**
   * Initialize Supabase client for admin operations
   */
  async initialize() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        logger.success('Admin database client initialized');
      } else {
        throw new Error('Supabase credentials not found for admin database');
      }
    } catch (error) {
      logger.error('Failed to initialize admin database', error);
      throw error;
    }
  }

  // ============================================
  // ADMIN USERS OPERATIONS
  // ============================================

  /**
   * Create a new admin user
   */
  async createAdminUser(username, password, email) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      
      const { data, error } = await this.supabase
        .from('admin_users')
        .insert({
          username,
          password_hash: passwordHash,
          email,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      logger.success(`Admin user created: ${username}`);
      return data;
    } catch (error) {
      logger.error('Error creating admin user', error);
      throw error;
    }
  }

  /**
   * Authenticate admin user
   */
  async authenticateAdmin(username, password) {
    try {
      const { data, error } = await this.supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      const isValid = await bcrypt.compare(password, data.password_hash);
      
      if (isValid) {
        // Update last login
        await this.supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        // Don't return password hash
        delete data.password_hash;
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Error authenticating admin', error);
      return null;
    }
  }

  /**
   * Get all admin users
   */
  async getAllAdminUsers() {
    try {
      const { data, error } = await this.supabase
        .from('admin_users')
        .select('id, username, email, created_at, last_login, is_active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching admin users', error);
      return [];
    }
  }

  // ============================================
  // BOT LOGS OPERATIONS
  // ============================================

  /**
   * Insert a log entry
   */
  async insertLog(level, message, metadata = null) {
    try {
      const { error } = await this.supabase
        .from('bot_logs')
        .insert({
          level,
          message,
          metadata,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      // Don't log errors about logging to avoid infinite loops
      console.error('Error inserting log:', error);
    }
  }

  /**
   * Get logs with pagination and filtering
   */
  async getLogs(limit = 100, offset = 0, level = null) {
    try {
      let query = this.supabase
        .from('bot_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data || [],
        total: count || 0,
        limit,
        offset
      };
    } catch (error) {
      logger.error('Error fetching logs', error);
      return { logs: [], total: 0, limit, offset };
    }
  }

  /**
   * Delete old logs (cleanup)
   */
  async cleanupOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await this.supabase
        .from('bot_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) throw error;
      
      logger.info(`Cleaned up logs older than ${daysToKeep} days`);
    } catch (error) {
      logger.error('Error cleaning up old logs', error);
    }
  }

  // ============================================
  // BOT CONFIG OPERATIONS
  // ============================================

  /**
   * Get all configuration
   */
  async getAllConfig() {
    try {
      const { data, error } = await this.supabase
        .from('bot_config')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching config', error);
      return [];
    }
  }

  /**
   * Get config by key
   */
  async getConfigValue(key) {
    try {
      const { data, error } = await this.supabase
        .from('bot_config')
        .select('config_value')
        .eq('config_key', key)
        .single();

      if (error) throw error;
      return data?.config_value || null;
    } catch (error) {
      logger.error(`Error fetching config key: ${key}`, error);
      return null;
    }
  }

  /**
   * Update config value
   */
  async updateConfig(key, value, updatedBy = 'admin') {
    try {
      const { error } = await this.supabase
        .from('bot_config')
        .update({
          config_value: value,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy
        })
        .eq('config_key', key);

      if (error) throw error;
      
      logger.success(`Config updated: ${key} = ${value}`);
      return true;
    } catch (error) {
      logger.error(`Error updating config: ${key}`, error);
      return false;
    }
  }

  /**
   * Bulk update configuration
   */
  async bulkUpdateConfig(configUpdates, updatedBy = 'admin') {
    try {
      const promises = Object.entries(configUpdates).map(([key, value]) =>
        this.updateConfig(key, value, updatedBy)
      );

      await Promise.all(promises);
      logger.success('Bulk config update completed');
      return true;
    } catch (error) {
      logger.error('Error in bulk config update', error);
      return false;
    }
  }

  // ============================================
  // BOT ANALYTICS OPERATIONS
  // ============================================

  /**
   * Record daily analytics
   */
  async recordAnalytics(date, metrics) {
    try {
      const { error } = await this.supabase
        .from('bot_analytics')
        .upsert({
          date,
          deals_posted: metrics.deals_posted || 0,
          deals_found: metrics.deals_found || 0,
          api_calls: metrics.api_calls || 0,
          api_errors: metrics.api_errors || 0,
          telegram_posts: metrics.telegram_posts || 0,
          telegram_errors: metrics.telegram_errors || 0,
          uptime_seconds: metrics.uptime_seconds || 0
        }, {
          onConflict: 'date'
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Error recording analytics', error);
    }
  }

  /**
   * Get analytics for date range
   */
  async getAnalytics(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('bot_analytics')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching analytics', error);
      return [];
    }
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('bot_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const summary = {
        total_deals_posted: 0,
        total_deals_found: 0,
        total_api_calls: 0,
        total_api_errors: 0,
        total_telegram_posts: 0,
        total_telegram_errors: 0,
        avg_deals_per_day: 0,
        success_rate: 0,
        days_analyzed: data?.length || 0
      };

      if (data && data.length > 0) {
        data.forEach(day => {
          summary.total_deals_posted += day.deals_posted || 0;
          summary.total_deals_found += day.deals_found || 0;
          summary.total_api_calls += day.api_calls || 0;
          summary.total_api_errors += day.api_errors || 0;
          summary.total_telegram_posts += day.telegram_posts || 0;
          summary.total_telegram_errors += day.telegram_errors || 0;
        });

        summary.avg_deals_per_day = Math.round(summary.total_deals_posted / data.length);
        
        if (summary.total_api_calls > 0) {
          summary.success_rate = Math.round(
            ((summary.total_api_calls - summary.total_api_errors) / summary.total_api_calls) * 100
          );
        }
      }

      return summary;
    } catch (error) {
      logger.error('Error fetching analytics summary', error);
      return null;
    }
  }
}

module.exports = new AdminDatabase();

