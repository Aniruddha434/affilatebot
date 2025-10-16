/**
 * Logger Utility
 * Provides consistent logging across the application
 * Also persists logs to database when adminDatabase is available
 */

let adminDatabase = null;

// Lazy load adminDatabase to avoid circular dependencies
function getAdminDatabase() {
  if (!adminDatabase) {
    try {
      adminDatabase = require('../modules/adminDatabase');
    } catch (error) {
      // AdminDatabase not available yet, that's okay
      adminDatabase = null;
    }
  }
  return adminDatabase;
}

/**
 * Persist log to database (async, non-blocking)
 */
async function persistLog(level, message, metadata = null) {
  try {
    const db = getAdminDatabase();
    if (db && db.supabase) {
      // Don't await - fire and forget to avoid blocking
      db.insertLog(level, message, metadata).catch(() => {
        // Silently fail to avoid infinite loops
      });
    }
  } catch (error) {
    // Silently fail to avoid infinite loops
  }
}

const logger = {
  /**
   * Log informational messages
   */
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  INFO: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    persistLog('info', message, data);
  },

  /**
   * Log success messages
   */
  success: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ SUCCESS: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    persistLog('success', message, data);
  },

  /**
   * Log error messages
   */
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ERROR: ${message}`);
    if (error) {
      console.error(error.stack || error);
    }
    const metadata = error ? {
      message: error.message,
      stack: error.stack
    } : null;
    persistLog('error', message, metadata);
  },

  /**
   * Log warning messages
   */
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️  WARNING: ${message}`);
    if (data) {
      console.warn(JSON.stringify(data, null, 2));
    }
    persistLog('warn', message, data);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🐛 DEBUG: ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
      persistLog('debug', message, data);
    }
  }
};

module.exports = logger;

