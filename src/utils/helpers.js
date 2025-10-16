/**
 * Helper Utilities
 * Common utility functions used across the application
 */

const logger = require('./logger');

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
function calculateDiscount(originalPrice, discountedPrice) {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) {
    return 0;
  }
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Format price for display (Indian Rupees)
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
function formatPrice(price) {
  if (!price) return '0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise}
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      const waitTime = delay * Math.pow(2, i);
      logger.warn(`Retry attempt ${i + 1}/${maxRetries} after ${waitTime}ms`, {
        error: error.message
      });
      await sleep(waitTime);
    }
  }
}

/**
 * Validate environment variables
 * @param {Array<string>} requiredVars - Array of required variable names
 * @throws {Error} If any required variable is missing
 */
function validateEnvVars(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
}

/**
 * Sanitize text for Telegram (escape special characters)
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeForTelegram(text) {
  if (!text) return '';
  // Escape special characters for Telegram MarkdownV2
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

module.exports = {
  calculateDiscount,
  formatPrice,
  sleep,
  retryWithBackoff,
  validateEnvVars,
  sanitizeForTelegram
};

