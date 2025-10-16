/**
 * Scheduler Module
 * Manages cron jobs for automated deal posting
 * Supports multi-platform fetching (Amazon, Flipkart, Myntra)
 */

const cron = require('node-cron');
const logger = require('./utils/logger');
const platformManager = require('./modules/platforms/PlatformManager');
const platformDatabase = require('./modules/platformDatabase');
const telegramBot = require('./modules/telegramBot');
const database = require('./modules/database');
const searchCache = require('./modules/SearchCache');
const { retryWithBackoff } = require('./utils/helpers');

class Scheduler {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
    // Default: Every 2 hours (0 */2 * * *)
    this.cronSchedule = process.env.CRON_SCHEDULE || '0 */2 * * *';
    this.maxProductsPerRun = parseInt(process.env.MAX_PRODUCTS_PER_RUN) || 10;

    // Fallback keywords if database is empty
    this.fallbackKeywords = [
      'electronics deals',
      'fashion sale',
      'home appliances discount',
      'books offer',
      'beauty products sale',
      'mobile phones',
      'laptops',
      'clothing',
      'shoes',
      'watches',
      'headphones',
      'smartwatch',
      'camera',
      'tablet',
      'gaming',
      'fitness',
      'kitchen appliances',
      'furniture',
      'toys',
      'sports equipment'
    ];

    // Track last used keyword index for rotation
    this.lastKeywordIndex = -1;
  }

  /**
   * Main job function - fetch and post deals from all enabled platforms
   */
  async runDealFetchJob() {
    if (this.isRunning) {
      logger.warn('Job already running, skipping this execution');
      return;
    }

    this.isRunning = true;
    logger.info('🚀 Starting multi-platform deal fetch job...');

    try {
      // Load platform settings from database
      const platformSettings = await platformDatabase.getEnabledPlatforms();

      if (platformSettings.length === 0) {
        logger.warn('No enabled platforms found');
        return;
      }

      // Update platform manager with latest settings
      platformManager.updatePlatformSettings(platformSettings);

      // Get keyword from database or fallback to hardcoded list
      const keyword = await this.selectNextKeyword();

      // Validate keyword to prevent empty/null searches
      if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        logger.error('Invalid keyword selected, aborting job');
        return;
      }

      logger.info(`Searching for: "${keyword}" across all enabled platforms`);

      // Build cache filters from platform settings
      // This ensures cache keys are unique per platform configuration
      const cacheFilters = {
        minDiscount: platformSettings.length > 0 ? platformSettings[0].min_discount : 50,
        maxResults: this.maxProductsPerRun * 5,
        // Include other filter parameters to prevent cache collisions
        inStockOnly: true
      };

      // Check cache first with proper filters
      let products = searchCache.get(keyword, 'all', cacheFilters);

      if (products && products.length > 0) {
        logger.info(`✅ Cache HIT: Using ${products.length} cached products for "${keyword}"`);
      } else {
        logger.info(`🔄 Cache MISS: Fetching fresh products for "${keyword}"`);

        // Fetch products from all enabled platforms with increased limit
        const fetchLimit = this.maxProductsPerRun * 5; // Fetch 5x more products

        products = await retryWithBackoff(
          () => platformManager.fetchFromAllPlatforms(keyword, fetchLimit),
          3,
          2000
        );

        if (!products || products.length === 0) {
          logger.info('No products found from any platform');
          return;
        }

        // Cache the results with proper filters
        searchCache.set(keyword, products, 'all', cacheFilters);
        logger.info(`✅ Cached ${products.length} potential deals from all platforms for "${keyword}"`);
      }

      // Filter out already posted products (platform-aware)
      const newProducts = [];

      for (const product of products) {
        const isPosted = await platformDatabase.isProductPosted(product.productId, product.platform);

        if (!isPosted) {
          newProducts.push(product);
        } else {
          logger.debug(`Skipping already posted product: ${product.productId} from ${product.platform}`);
        }
      }

      if (newProducts.length === 0) {
        logger.info('All found products have already been posted');
        return;
      }

      // Select ONLY the product with the HIGHEST discount
      const bestProduct = newProducts.reduce((best, current) => {
        return (current.discountPercentage > best.discountPercentage) ? current : best;
      }, newProducts[0]);

      logger.info(`Found ${newProducts.length} new products. Selecting best deal: ${bestProduct.title.substring(0, 50)}... (${bestProduct.discountPercentage}% off)`);
      logger.info(`Posting 1 best deal to Telegram (highest discount: ${bestProduct.discountPercentage}%)`);

      // Post only the best deal to Telegram
      const postedCount = await telegramBot.sendMultiplePlatformDeals([bestProduct]);

      // Mark only the best product as posted in database
      await platformDatabase.markAsPosted(bestProduct);

      logger.success(`✅ Job completed successfully! Posted ${postedCount} best deal (${bestProduct.discountPercentage}% discount)`);

      // Log platform info
      logger.info(`Platform: ${bestProduct.platform}`);

      // Cleanup old entries once a day (check if hour is 0)
      const currentHour = new Date().getHours();
      if (currentHour === 0) {
        await database.cleanupOldEntries();
      }

    } catch (error) {
      logger.error('Error in deal fetch job', error);

      // Optionally send error notification to Telegram
      try {
        await telegramBot.sendErrorNotification(error.message);
      } catch (notifError) {
        logger.error('Failed to send error notification', notifError);
      }
    } finally {
      this.isRunning = false;
      logger.info('Job execution finished\n');
    }
  }

  /**
   * Start the cron scheduler
   */
  start() {
    try {
      // Validate cron expression
      if (!cron.validate(this.cronSchedule)) {
        throw new Error(`Invalid cron schedule: ${this.cronSchedule}`);
      }

      logger.info(`Starting scheduler with cron: ${this.cronSchedule}`);
      logger.info('Schedule: Every 2 hours');

      // Create cron job
      this.cronJob = cron.schedule(this.cronSchedule, async () => {
        await this.runDealFetchJob();
      });

      logger.success('✅ Scheduler started successfully');
      logger.info('Next execution will occur according to the cron schedule');

      // Run immediately on startup (optional - comment out if not desired)
      logger.info('Running initial job immediately...');
      setTimeout(() => {
        this.runDealFetchJob();
      }, 5000); // Wait 5 seconds after startup

    } catch (error) {
      logger.error('Failed to start scheduler', error);
      throw error;
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('Scheduler stopped');
    }
  }

  /**
   * Run job manually (for testing)
   */
  async runManually() {
    logger.info('Running job manually...');
    await this.runDealFetchJob();
  }

  /**
   * Update cron schedule dynamically
   */
  updateSchedule(newSchedule) {
    try {
      // Validate new schedule
      if (!cron.validate(newSchedule)) {
        throw new Error(`Invalid cron schedule: ${newSchedule}`);
      }

      // Stop current job
      if (this.cronJob) {
        this.cronJob.stop();
        logger.info('Stopped current cron job');
      }

      // Update schedule
      this.cronSchedule = newSchedule;

      // Create new cron job
      this.cronJob = cron.schedule(this.cronSchedule, async () => {
        await this.runDealFetchJob();
      });

      logger.success(`Schedule updated to: ${newSchedule}`);
      return true;
    } catch (error) {
      logger.error('Failed to update schedule', error);
      return false;
    }
  }

  /**
   * Get next scheduled run time (approximate)
   */
  getNextRunTime() {
    // This is a simple approximation
    // For more accurate calculation, you'd need a cron parser library
    return 'Next run according to cron schedule';
  }

  /**
   * Select next keyword using database or fallback
   * Implements least-recently-used rotation
   */
  async selectNextKeyword() {
    try {
      // Try to get keywords from database
      const dbKeywords = await platformDatabase.getAllKeywords();

      if (dbKeywords && dbKeywords.length > 0) {
        // Sort by usage_count (ascending) to prioritize least-used keywords
        dbKeywords.sort((a, b) => a.usage_count - b.usage_count);

        // Select the least-used keyword
        const selectedKeyword = dbKeywords[0];

        // Increment usage count
        await platformDatabase.incrementKeywordUsage(selectedKeyword.id);

        logger.info(`Selected keyword from database: "${selectedKeyword.keyword}" (used ${selectedKeyword.usage_count} times)`);
        return selectedKeyword.keyword;
      }

      // Fallback to hardcoded keywords with rotation
      logger.info('No keywords in database, using fallback keywords');
      this.lastKeywordIndex = (this.lastKeywordIndex + 1) % this.fallbackKeywords.length;
      const keyword = this.fallbackKeywords[this.lastKeywordIndex];

      logger.info(`Selected fallback keyword: "${keyword}" (${this.lastKeywordIndex + 1}/${this.fallbackKeywords.length})`);
      return keyword;

    } catch (error) {
      logger.error('Error selecting keyword from database, using fallback', error);

      // Fallback on error
      this.lastKeywordIndex = (this.lastKeywordIndex + 1) % this.fallbackKeywords.length;
      return this.fallbackKeywords[this.lastKeywordIndex];
    }
  }
}

module.exports = new Scheduler();

