/**
 * Amazon Affiliate Telegram Bot
 * Main Entry Point
 * 
 * This bot automatically finds Amazon products with huge discounts
 * and posts them to a Telegram channel every 2 hours.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');
const { validateEnvVars } = require('./utils/helpers');
const { checkRateLimit, cleanupRateLimitStore } = require('./utils/security');
const { ValidationError, validateConfigUpdate, validatePlatformSettings } = require('./utils/validation');
const database = require('./modules/database');
const adminDatabase = require('./modules/adminDatabase');
const platformDatabase = require('./modules/platformDatabase');
const platformManager = require('./modules/platforms/PlatformManager');
const AmazonAdapter = require('./modules/platforms/AmazonAdapter');
const AmazonScraperAdapter = require('./modules/platforms/AmazonScraperAdapter');
const FlipkartAdapter = require('./modules/platforms/FlipkartAdapter');
const MyntraAdapter = require('./modules/platforms/MyntraAdapter');
const telegramBot = require('./modules/telegramBot');
const imageManager = require('./modules/imageManager');
const scheduler = require('./scheduler');

// Express app for health checks and admin API
const app = express();
const PORT = process.env.PORT || 3000;

// Check if running on Vercel (serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';

// Rate limiting store
const rateLimitStore = new Map();

// Cleanup rate limit store every 5 minutes
setInterval(() => {
  cleanupRateLimitStore(rateLimitStore);
}, 5 * 60 * 1000);

// CORS configuration for admin panel
const ADMIN_API_ALLOWED_ORIGIN = process.env.ADMIN_API_ALLOWED_ORIGIN || 'http://localhost:3001';
app.use(cors({
  origin: ADMIN_API_ALLOWED_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-timestamp', 'x-admin-signature']
}));

/**
 * Validate required environment variables
 */
function validateConfiguration() {
  logger.info('Validating configuration...');

  // REQUIRED: Telegram and Supabase (essential for bot operation)
  const requiredVars = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHANNEL_ID'
  ];

  // OPTIONAL: Amazon API credentials (bot can run with scraper instead)
  const amazonApiCredentials = [
    'AMAZON_ACCESS_KEY',
    'AMAZON_SECRET_KEY',
    'AMAZON_PARTNER_TAG'
  ];

  // Check required variables
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Check Amazon credentials (optional, but warn if missing)
  const missingAmazonCredentials = amazonApiCredentials.filter(v => !process.env[v]);
  if (missingAmazonCredentials.length > 0) {
    logger.warn('⚠️  Amazon API credentials not configured');
    logger.warn('   Bot will use Amazon Scraper instead (no API credentials needed)');
    logger.warn('   To use official PA-API, set: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG');
  }

  // Supabase: Either MCP (PROJECT_REF) or manual (URL + KEY)
  const hasSupabaseMCP = !!process.env.SUPABASE_PROJECT_REF;
  const hasSupabaseManual = !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);

  if (!hasSupabaseMCP && !hasSupabaseManual) {
    throw new Error(
      'Supabase configuration missing. Please set either:\n' +
      '  - SUPABASE_PROJECT_REF (for MCP automatic mode), or\n' +
      '  - SUPABASE_URL and SUPABASE_KEY (for manual mode)\n' +
      'Run: node setup-supabase.js for help'
    );
  }

  if (hasSupabaseMCP) {
    logger.info('✅ Using Supabase MCP mode (automatic credentials)');
    logger.info(`   Project: ${process.env.SUPABASE_PROJECT_REF}`);
  } else {
    logger.info('✅ Using Supabase manual credentials mode');
  }

  try {
    validateEnvVars(requiredVars);
    logger.success('✅ All required environment variables are set');
    return true;
  } catch (error) {
    logger.error('Configuration validation failed', error);
    return false;
  }
}

/**
 * Initialize all modules
 */
async function initializeModules() {
  try {
    logger.info('Initializing modules...');

    // Initialize database
    await database.initialize();
    logger.success('✅ Database initialized');

    // Initialize admin database
    await adminDatabase.initialize();
    logger.success('✅ Admin database initialized');

    // Initialize platform database
    await platformDatabase.initialize();
    logger.success('✅ Platform database initialized');

    // Initialize platform adapters
    const amazonAdapter = new AmazonAdapter();
    const amazonScraperAdapter = new AmazonScraperAdapter();
    const flipkartAdapter = new FlipkartAdapter();
    const myntraAdapter = new MyntraAdapter();

    // Register platforms with manager
    platformManager.registerPlatform('amazon', amazonAdapter);
    platformManager.registerPlatform('amazon-scraper', amazonScraperAdapter);
    platformManager.registerPlatform('flipkart', flipkartAdapter);
    platformManager.registerPlatform('myntra', myntraAdapter);

    // Initialize platform manager
    await platformManager.initialize();
    logger.success('✅ Platform manager initialized');

    // Load platform settings from database
    const platformSettings = await platformDatabase.getAllPlatformSettings();
    platformManager.updatePlatformSettings(platformSettings);
    logger.info(`📊 Loaded settings for ${platformSettings.length} platforms`);

    // Initialize Telegram bot
    try {
      telegramBot.initialize();
      logger.success('✅ Telegram bot initialized');
    } catch (error) {
      logger.error('Failed to initialize Telegram bot', error);
      logger.warn('⚠️  Telegram bot will not be available, but bot will continue running');
      logger.warn('   Check your TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID');
      // Don't throw - allow bot to continue without Telegram
    }

    // Initialize image manager
    await imageManager.initialize();
    logger.success('✅ Image manager initialized');

    // Get current stats
    const postedCount = await database.getPostedCount();
    logger.info(`📊 Total deals posted so far: ${postedCount}`);

    return true;
  } catch (error) {
    logger.error('Module initialization failed', error);
    return false;
  }
}

/**
 * Start the bot
 */
async function startBot() {
  try {
    logger.info('');
    logger.info('═══════════════════════════════════════════════════');
    logger.info('🤖  Amazon Affiliate Telegram Bot');
    logger.info('═══════════════════════════════════════════════════');
    logger.info('');

    // Validate configuration
    if (!validateConfiguration()) {
      logger.error('❌ Bot startup failed due to configuration errors');
      logger.info('Please check your .env file and ensure all required variables are set');
      process.exit(1);
    }

    // Initialize modules
    if (!await initializeModules()) {
      logger.error('❌ Bot startup failed due to initialization errors');
      process.exit(1);
    }

    // Start scheduler
    try {
      scheduler.start();
      logger.success('✅ Scheduler started');
    } catch (error) {
      logger.error('Failed to start scheduler', error);
      logger.warn('⚠️  Scheduler will not run, but bot will continue');
    }

    // Send startup notification to Telegram (after scheduler is started)
    // Add a small delay to ensure everything is ready
    setTimeout(async () => {
      try {
        logger.info('Sending startup notification to Telegram...');
        await telegramBot.sendStartupNotification();
      } catch (error) {
        logger.error('Failed to send startup notification', error);
      }
    }, 2000); // Wait 2 seconds after scheduler starts

    logger.info('');
    logger.info('═══════════════════════════════════════════════════');
    logger.success('✅ Bot is now running!');
    logger.info(`📅 Schedule: Every 2 hours`);
    logger.info(`💰 Minimum discount: ${process.env.MIN_DISCOUNT_PERCENTAGE || 50}%`);
    logger.info(`📢 Channel: ${process.env.TELEGRAM_CHANNEL_ID}`);
    logger.info('═══════════════════════════════════════════════════');
    logger.info('');

  } catch (error) {
    logger.error('Fatal error during bot startup', error);
    process.exit(1);
  }
}

/**
 * Setup Express server for health checks
 */
function setupHealthCheckServer() {
// Parse JSON for admin API
app.use(express.json());

// Admin API security and middleware (HMAC)
const crypto = require('crypto');
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || null;
const ADMIN_API_CLOCK_SKEW_SEC = parseInt(process.env.ADMIN_API_CLOCK_SKEW_SEC || '120', 10);

/**
 * Compute expected HMAC signature for an admin request
 */
function computeAdminSignature(method, path, timestamp, bodySha256) {
  const baseString = `${method}\n${path}\n${timestamp}\n${bodySha256}`;
  return crypto.createHmac('sha256', ADMIN_API_SECRET).update(baseString).digest('hex');
}

/**
 * Admin auth middleware: verifies HMAC signature, timestamp skew, and optional origin allowlist
 */
function adminAuthMiddleware(req, res, next) {
  try {
    if (!ADMIN_API_SECRET) {
      return res.status(503).json({ error: 'ADMIN_API_SECRET not configured' });
    }

    // Optional origin allowlist (useful when calling from a web dashboard)
    if (ADMIN_API_ALLOWED_ORIGIN && req.headers.origin && req.headers.origin !== ADMIN_API_ALLOWED_ORIGIN) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

    const timestamp = req.headers['x-admin-timestamp'];
    const signature = req.headers['x-admin-signature'];

    if (!timestamp || !signature) {
      return res.status(401).json({ error: 'Missing admin signature headers' });
    }

    const nowMs = Date.now();
    const tsMs = Date.parse(timestamp);
    if (Number.isNaN(tsMs)) {
      return res.status(401).json({ error: 'Invalid timestamp format' });
    }
    const skewSec = Math.abs(nowMs - tsMs) / 1000;
    if (skewSec > ADMIN_API_CLOCK_SKEW_SEC) {
      return res.status(401).json({ error: 'Request timestamp outside allowed skew' });
    }

    const bodyString = JSON.stringify(req.body || {});
    const bodySha256 = crypto.createHash('sha256').update(bodyString).digest('hex');
    const expectedSig = computeAdminSignature(req.method, req.path, timestamp, bodySha256);

    // Constant-time comparison
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return res.status(401).json({ error: 'Invalid admin signature' });
    }

    next();
  } catch (err) {
    logger.error('Admin auth middleware error', err);
    return res.status(500).json({ error: 'Admin auth error' });
  }
}

/**
 * Admin API: configuration, stats, deals listing, and manual trigger
 * Note: Some endpoints rely on Supabase manual credentials being configured.
 */

// Get current bot configuration (env-based for now; future: Supabase-backed)
app.get('/admin/config', adminAuthMiddleware, (req, res) => {
  try {
    const config = {
      min_discount_percentage: parseInt(process.env.MIN_DISCOUNT_PERCENTAGE || '50', 10),
      cron_schedule: scheduler.cronSchedule || process.env.CRON_SCHEDULE || '0 */2 * * *',
      max_products_per_run: parseInt(process.env.MAX_PRODUCTS_PER_RUN || '10', 10),
      default_region: process.env.AMAZON_REGION || 'IN',
      source: 'env',
      supabase_mode: (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) ? 'manual' : (process.env.SUPABASE_PROJECT_REF ? 'mcp-docs-only' : 'none')
    };
    res.json(config);
  } catch (error) {
    logger.error('Failed to get admin config', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

// Get bot stats
app.get('/admin/stats', adminAuthMiddleware, async (req, res) => {
  try {
    const postedCount = await database.getPostedCount();
    const stats = {
      posted_deals_total: postedCount,
      is_running: !!scheduler.isRunning,
      cron_schedule: scheduler.cronSchedule,
      channel: process.env.TELEGRAM_CHANNEL_ID || null,
      min_discount_percentage: parseInt(process.env.MIN_DISCOUNT_PERCENTAGE || '50', 10)
    };
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get admin stats', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// List recent posted deals (requires Supabase manual credentials)
app.get('/admin/deals', adminAuthMiddleware, async (req, res) => {
  try {
    if (!database.supabase) {
      return res.status(500).json({ error: 'Supabase not configured (manual credentials required)' });
    }
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const { data, error } = await database.supabase
      .from('posted_deals')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to fetch deals' });
    }
    res.json({ items: data || [], limit });
  } catch (error) {
    logger.error('Failed to list deals', error);
    res.status(500).json({ error: 'Failed to list deals' });
  }
});

// Secure manual trigger for a job run
app.post('/admin/trigger', adminAuthMiddleware, async (req, res) => {
  try {
    logger.info('Admin requested manual job trigger via API');
    res.json({ message: 'Admin job trigger accepted' });

    // Run job in background
    scheduler.runManually().catch(error => {
      logger.error('Admin manual job execution failed', error);
    });
  } catch (error) {
    logger.error('Admin trigger failed', error);
    res.status(500).json({ error: 'Failed to trigger job' });
  }
});

// ============================================
// EXTENDED ADMIN API ENDPOINTS
// ============================================

// JWT secret for admin authentication
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Admin login endpoint (no HMAC required for login, but rate limited)
 */
app.post('/admin/auth/login', async (req, res) => {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const clientIp = req.ip || req.connection.remoteAddress;
    const rateLimit = checkRateLimit(rateLimitStore, `login:${clientIp}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return res.status(429).json({
        error: 'Too many login attempts. Please try again later.',
        retryAfter
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Authenticate user
    const user = await adminDatabase.authenticateAdmin(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Admin login failed', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Get bot logs with pagination and filtering
 */
app.get('/admin/logs', adminAuthMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const offset = parseInt(req.query.offset || '0', 10);
    const level = req.query.level || null;

    const result = await adminDatabase.getLogs(limit, offset, level);
    res.json(result);
  } catch (error) {
    logger.error('Failed to fetch logs', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * Get real-time logs (last N logs)
 */
app.get('/admin/logs/realtime', adminAuthMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const level = req.query.level || null;

    const result = await adminDatabase.getLogs(limit, 0, level);
    res.json(result);
  } catch (error) {
    logger.error('Failed to fetch realtime logs', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * Manual product posting endpoint
 */
app.post('/admin/deals/manual', adminAuthMiddleware, async (req, res) => {
  try {
    const product = req.body;

    // Validate product data
    try {
      const { validateProduct } = require('./utils/validation');
      validateProduct(product);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Validate image URL
    const imageValid = await imageManager.validateImageUrl(product.imageUrl);
    if (!imageValid) {
      return res.status(400).json({ error: 'Invalid or inaccessible image URL' });
    }

    // Generate affiliate link
    const platformAdapter = platformManager.platforms.get(product.platform);
    if (!platformAdapter) {
      return res.status(400).json({ error: `Platform ${product.platform} not found` });
    }

    product.affiliateLink = platformAdapter.generateAffiliateLink(product);

    // Check if already posted
    const alreadyPosted = await platformDatabase.isProductPosted(product.productId, product.platform);
    if (alreadyPosted) {
      return res.status(409).json({ error: 'Product already posted' });
    }

    // Post to Telegram
    const success = await telegramBot.sendPlatformDeal(product);

    if (!success) {
      return res.status(500).json({ error: 'Failed to post to Telegram' });
    }

    // Mark as posted
    await platformDatabase.markAsPosted(product);

    logger.success(`Manual product posted: ${product.title}`);

    res.json({
      success: true,
      message: 'Product posted successfully',
      productId: product.productId,
      platform: product.platform
    });
  } catch (error) {
    logger.error('Manual posting failed', error);
    res.status(500).json({ error: 'Failed to post product' });
  }
});

// ============================================
// KEYWORD MANAGEMENT ENDPOINTS
// ============================================

/**
 * Get all keywords
 */
app.get('/admin/keywords', adminAuthMiddleware, async (req, res) => {
  try {
    const keywords = await platformDatabase.getAllKeywords();
    res.json(keywords);
  } catch (error) {
    logger.error('Failed to fetch keywords', error);
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
});

/**
 * Add a new keyword
 */
app.post('/admin/keywords', adminAuthMiddleware, async (req, res) => {
  try {
    const { keyword, platform } = req.body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Valid keyword is required' });
    }

    if (platform && !['amazon', 'flipkart', 'myntra'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const keywordId = await platformDatabase.addKeyword(keyword.trim(), platform);

    logger.success(`Keyword added: ${keyword} (${platform || 'global'})`);

    res.json({
      success: true,
      id: keywordId,
      keyword: keyword.trim(),
      platform: platform || null
    });
  } catch (error) {
    logger.error('Failed to add keyword', error);
    res.status(500).json({ error: 'Failed to add keyword' });
  }
});

/**
 * Delete a keyword
 */
app.delete('/admin/keywords/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const keywordId = parseInt(req.params.id);

    if (isNaN(keywordId)) {
      return res.status(400).json({ error: 'Invalid keyword ID' });
    }

    const success = await platformDatabase.deleteKeyword(keywordId);

    if (success) {
      logger.success(`Keyword deleted: ID ${keywordId}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Keyword not found' });
    }
  } catch (error) {
    logger.error('Failed to delete keyword', error);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
});

// ============================================
// CONFIGURATION MANAGEMENT
// ============================================

/**
 * Update bot configuration
 */
app.put('/admin/config', adminAuthMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No configuration updates provided' });
    }

    // Update configuration in database
    const success = await adminDatabase.bulkUpdateConfig(updates, 'admin');

    if (success) {
      // If scheduler config changed, update it
      if (updates.CRON_SCHEDULE) {
        scheduler.updateSchedule(updates.CRON_SCHEDULE);
      }

      res.json({ success: true, message: 'Configuration updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  } catch (error) {
    logger.error('Failed to update config', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

/**
 * Delete a specific deal
 */
app.delete('/admin/deals/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!database.supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const { error } = await database.supabase
      .from('posted_deals')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete deal', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

/**
 * Get analytics data
 */
app.get('/admin/analytics', adminAuthMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const summary = await adminDatabase.getAnalyticsSummary(days);

    res.json(summary);
  } catch (error) {
    logger.error('Failed to fetch analytics', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Get detailed bot status
 */
app.get('/admin/bot/status', adminAuthMiddleware, async (req, res) => {
  try {
    const postedCount = await database.getPostedCount();

    const status = {
      is_running: !!scheduler.isRunning,
      uptime_seconds: Math.floor(process.uptime()),
      cron_schedule: scheduler.cronSchedule,
      next_run: scheduler.getNextRunTime ? scheduler.getNextRunTime() : null,
      posted_deals_total: postedCount,
      channel: process.env.TELEGRAM_CHANNEL_ID || null,
      min_discount: parseInt(process.env.MIN_DISCOUNT_PERCENTAGE || '50', 10),
      max_products_per_run: parseInt(process.env.MAX_PRODUCTS_PER_RUN || '10', 10),
      amazon_region: process.env.AMAZON_REGION || 'IN',
      node_version: process.version,
      memory_usage: process.memoryUsage()
    };

    res.json(status);
  } catch (error) {
    logger.error('Failed to get bot status', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

/**
 * Stop the bot (graceful shutdown of scheduler)
 */
app.post('/admin/bot/stop', adminAuthMiddleware, async (req, res) => {
  try {
    scheduler.stop();
    logger.info('Bot stopped via admin API');
    res.json({ success: true, message: 'Bot stopped successfully' });
  } catch (error) {
    logger.error('Failed to stop bot', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

/**
 * Start the bot (restart scheduler)
 */
app.post('/admin/bot/start', adminAuthMiddleware, async (req, res) => {
  try {
    scheduler.start();
    logger.info('Bot started via admin API');
    res.json({ success: true, message: 'Bot started successfully' });
  } catch (error) {
    logger.error('Failed to start bot', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

// ============================================
// PLATFORM MANAGEMENT API ENDPOINTS
// ============================================

/**
 * Get all platform settings
 */
app.get('/admin/platforms', adminAuthMiddleware, async (req, res) => {
  try {
    const platforms = await platformDatabase.getAllPlatformSettings();
    const stats = platformManager.getStats();

    res.json({
      platforms,
      stats
    });
  } catch (error) {
    logger.error('Failed to get platform settings', error);
    res.status(500).json({ error: 'Failed to get platform settings' });
  }
});

/**
 * Get specific platform settings
 */
app.get('/admin/platforms/:platform', adminAuthMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const settings = await platformDatabase.getPlatformSettings(platform);

    if (!settings) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    res.json(settings);
  } catch (error) {
    logger.error(`Failed to get settings for ${req.params.platform}`, error);
    res.status(500).json({ error: 'Failed to get platform settings' });
  }
});

/**
 * Update platform settings
 */
app.put('/admin/platforms/:platform', adminAuthMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const updates = req.body;

    const updated = await platformDatabase.updatePlatformSettings(platform, updates);

    // Reload settings in platform manager
    const allSettings = await platformDatabase.getAllPlatformSettings();
    platformManager.updatePlatformSettings(allSettings);

    res.json({
      success: true,
      platform: updated
    });
  } catch (error) {
    logger.error(`Failed to update settings for ${req.params.platform}`, error);
    res.status(500).json({ error: 'Failed to update platform settings' });
  }
});

/**
 * Enable/disable a platform
 */
app.post('/admin/platforms/:platform/toggle', adminAuthMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    await platformDatabase.setPlatformEnabled(platform, enabled);

    // Reload settings in platform manager
    const allSettings = await platformDatabase.getAllPlatformSettings();
    platformManager.updatePlatformSettings(allSettings);

    logger.info(`Platform ${platform} ${enabled ? 'enabled' : 'disabled'} via admin API`);
    res.json({ success: true, platform, enabled });
  } catch (error) {
    logger.error(`Failed to toggle platform ${req.params.platform}`, error);
    res.status(500).json({ error: 'Failed to toggle platform' });
  }
});

/**
 * Bulk update platform settings
 */
app.put('/admin/platforms', adminAuthMiddleware, async (req, res) => {
  try {
    const { platforms } = req.body;

    if (!Array.isArray(platforms)) {
      return res.status(400).json({ error: 'platforms must be an array' });
    }

    await platformDatabase.bulkUpdatePlatformSettings(platforms);

    // Reload settings in platform manager
    const allSettings = await platformDatabase.getAllPlatformSettings();
    platformManager.updatePlatformSettings(allSettings);

    res.json({ success: true, message: 'Platform settings updated' });
  } catch (error) {
    logger.error('Failed to bulk update platform settings', error);
    res.status(500).json({ error: 'Failed to update platform settings' });
  }
});

/**
 * Get platform statistics
 */
app.get('/admin/platforms/stats/summary', adminAuthMiddleware, async (req, res) => {
  try {
    const stats = await platformDatabase.getPlatformStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get platform stats', error);
    res.status(500).json({ error: 'Failed to get platform stats' });
  }
});

/**
 * Get recent deals by platform
 */
app.get('/admin/platforms/:platform/deals', adminAuthMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);

    const deals = await platformDatabase.getRecentDealsByPlatform(platform, limit);
    res.json({ platform, deals, count: deals.length });
  } catch (error) {
    logger.error(`Failed to get deals for ${req.params.platform}`, error);
    res.status(500).json({ error: 'Failed to get platform deals' });
  }
});

/**
 * Trigger job for specific platform
 */
app.post('/admin/platforms/:platform/trigger', adminAuthMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;

    logger.info(`Admin requested manual job trigger for ${platform}`);
    res.json({ message: `Job trigger accepted for ${platform}` });

    // Run job in background for specific platform
    setTimeout(async () => {
      try {
        const keywords = 'deals';
        const maxResults = parseInt(process.env.MAX_PRODUCTS_PER_RUN) || 10;

        const products = await platformManager.fetchFromPlatform(platform, keywords, maxResults);

        // Filter out already posted
        const newProducts = [];
        for (const product of products) {
          const isPosted = await platformDatabase.isProductPosted(product.productId, product.platform);
          if (!isPosted) {
            newProducts.push(product);
          }
        }

        // Post to Telegram
        if (newProducts.length > 0) {
          await telegramBot.sendMultiplePlatformDeals(newProducts);

          // Mark as posted
          for (const product of newProducts) {
            await platformDatabase.markAsPosted(product);
          }

          logger.success(`Posted ${newProducts.length} deals from ${platform}`);
        } else {
          logger.info(`No new deals found from ${platform}`);
        }
      } catch (error) {
        logger.error(`Error in manual ${platform} job trigger`, error);
      }
    }, 100);
  } catch (error) {
    logger.error(`Failed to trigger job for ${req.params.platform}`, error);
    res.status(500).json({ error: 'Failed to trigger job' });
  }
});

// ============================================
// IMAGE SHARING API ENDPOINTS
// ============================================

/**
 * Get image proxy endpoint - serves cached or downloads images
 */
app.get('/api/images/proxy', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Get image (from cache or download)
    const image = await imageManager.getImage(url);

    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(image.buffer);
  } catch (error) {
    logger.error('Image proxy error', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

/**
 * Validate image URL endpoint
 */
app.post('/api/images/validate', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const isValid = await imageManager.validateImageUrl(url);

    res.json({ valid: isValid, url });
  } catch (error) {
    logger.error('Image validation error', error);
    res.status(500).json({ error: 'Failed to validate image' });
  }
});

/**
 * Get image cache statistics (admin only)
 */
app.get('/admin/images/stats', adminAuthMiddleware, async (req, res) => {
  try {
    const stats = await imageManager.getCacheStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get image cache stats', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

/**
 * Clear image cache (admin only)
 */
app.post('/admin/images/clear-cache', adminAuthMiddleware, async (req, res) => {
  try {
    await imageManager.clearCache();
    res.json({ success: true, message: 'Image cache cleared' });
  } catch (error) {
    logger.error('Failed to clear image cache', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// ============================================
// PUBLIC ENDPOINTS
// ============================================

  app.get('/', (req, res) => {
    res.json({
      status: 'running',
      bot: 'Amazon Affiliate Telegram Bot',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/health', async (req, res) => {
    try {
      // Comprehensive health check
      const checks = {
        server: true,
        database: false,
        telegram: false,
        scheduler: scheduler.isStarted, // Check if scheduler is started, not if job is running
        imageCache: false
      };

      // Check database
      try {
        await database.getPostedCount();
        checks.database = true;
      } catch (error) {
        logger.error('Database health check failed', error);
      }

      // Check Telegram
      try {
        checks.telegram = telegramBot.bot !== null;
      } catch (error) {
        logger.error('Telegram health check failed', error);
      }

      // Check image cache
      try {
        await imageManager.getCacheStats();
        checks.imageCache = true;
      } catch (error) {
        logger.error('Image cache health check failed', error);
      }

      // Consider healthy if server, database, and scheduler are working
      // Telegram and imageCache are optional
      const criticalChecks = checks.server && checks.database && checks.scheduler;
      const allChecks = Object.values(checks).every(v => v === true);

      const status = allChecks ? 'healthy' : (criticalChecks ? 'degraded' : 'unhealthy');
      const statusCode = allChecks ? 200 : (criticalChecks ? 200 : 503);

      res.status(statusCode).json({
        status: status,
        uptime: process.uptime(),
        checks,
        scheduler: {
          isStarted: scheduler.isStarted,
          isRunning: scheduler.isRunning,
          jobCount: scheduler.jobCount,
          lastJobTime: scheduler.lastJobTime,
          cronSchedule: scheduler.cronSchedule
        }
      });
    } catch (error) {
      logger.error('Health check error', error);
      res.status(503).json({ status: 'error', error: error.message });
    }
  });

  // Manual trigger endpoint (for testing - remove in production)
  app.post('/trigger', async (req, res) => {
    logger.info('Manual trigger requested via API');
    res.json({ message: 'Job triggered manually' });

    // Run job in background
    scheduler.runManually().catch(error => {
      logger.error('Manual job execution failed', error);
    });
  });

  // ============================================
  // VERCEL CRON JOB ENDPOINT
  // ============================================
  // This endpoint is called by Vercel Cron Jobs every 2 hours
  // It triggers the deal-finding job without needing a long-running process
  app.get('/api/cron', async (req, res) => {
    try {
      // Verify cron secret for security
      const cronSecret = process.env.CRON_SECRET;
      const authHeader = req.headers.authorization;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        logger.warn('Unauthorized cron request');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      logger.info('🔄 Vercel Cron Job triggered');

      // Run the deal-finding job
      await scheduler.runManually();

      res.status(200).json({
        success: true,
        message: 'Cron job executed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Cron job execution failed', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Only call listen() in development mode
  // In Vercel (serverless), the app is exported and Vercel handles the server
  if (!isVercel) {
    app.listen(PORT, () => {
      logger.info(`🌐 Health check server running on port ${PORT}`);
    });
  }
}

/**
 * Graceful shutdown handler
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.info(`\n${signal} received, shutting down gracefully...`);
    
    // Stop scheduler
    scheduler.stop();
    
    logger.info('✅ Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Main execution
 */

if (isVercel) {
  // Vercel serverless mode: Just export the app, don't start a server
  logger.info('🌐 Running on Vercel (serverless mode)');
  logger.info('   Bot will be triggered via Vercel Cron Jobs');
  logger.info('   Health and API endpoints available');

  // Setup health check server (Express app only, no listen)
  setupHealthCheckServer();

  // Export app for Vercel
  module.exports = app;
} else {
  // Development mode: Start the bot normally
  (async () => {
    try {
      // Setup health check server
      setupHealthCheckServer();

      // Setup graceful shutdown
      setupGracefulShutdown();

      // Start the bot
      await startBot();

    } catch (error) {
      logger.error('Unhandled error in main execution', error);
      process.exit(1);
    }
  })();

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    process.exit(1);
  });
}

