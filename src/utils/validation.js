/**
 * Input Validation Utilities
 * Provides validation schemas and functions for API inputs
 */

const logger = require('./logger');

/**
 * Validation error class
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validate required fields in an object
 * @param {Object} data - Data to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {ValidationError} If validation fails
 */
function validateRequired(data, requiredFields) {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new ValidationError(`Field '${field}' is required`, field);
    }
  }
}

/**
 * Validate string field
 * @param {string} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
function validateString(value, options = {}) {
  const { minLength = 0, maxLength = Infinity, pattern = null, fieldName = 'field' } = options;
  
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`, fieldName);
  }
  
  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`, fieldName);
  }
  
  if (pattern && !pattern.test(value)) {
    throw new ValidationError(`${fieldName} format is invalid`, fieldName);
  }
  
  return true;
}

/**
 * Validate number field
 * @param {number} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
function validateNumber(value, options = {}) {
  const { min = -Infinity, max = Infinity, integer = false, fieldName = 'field' } = options;
  
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName);
  }
  
  if (integer && !Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`, fieldName);
  }
  
  if (value < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }
  
  if (value > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName);
  }
  
  return true;
}

/**
 * Validate boolean field
 * @param {boolean} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
function validateBoolean(value, fieldName = 'field') {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`, fieldName);
  }
  return true;
}

/**
 * Validate array field
 * @param {Array} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
function validateArray(value, options = {}) {
  const { minLength = 0, maxLength = Infinity, itemType = null, fieldName = 'field' } = options;
  
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName);
  }
  
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must have at least ${minLength} items`, fieldName);
  }
  
  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${maxLength} items`, fieldName);
  }
  
  if (itemType) {
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] !== itemType) {
        throw new ValidationError(`${fieldName}[${i}] must be of type ${itemType}`, fieldName);
      }
    }
  }
  
  return true;
}

/**
 * Validate enum field
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error messages
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
function validateEnum(value, allowedValues, fieldName = 'field') {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      fieldName
    );
  }
  return true;
}

/**
 * Validate configuration update request
 * @param {Object} updates - Configuration updates
 * @returns {Object} Validated updates
 * @throws {ValidationError} If validation fails
 */
function validateConfigUpdate(updates) {
  const validFields = [
    'MIN_DISCOUNT_PERCENTAGE',
    'CRON_SCHEDULE',
    'MAX_PRODUCTS_PER_RUN',
    'TELEGRAM_CHANNEL_ID'
  ];
  
  const validated = {};
  
  for (const [key, value] of Object.entries(updates)) {
    if (!validFields.includes(key)) {
      throw new ValidationError(`Invalid configuration field: ${key}`, key);
    }
    
    switch (key) {
      case 'MIN_DISCOUNT_PERCENTAGE':
        validateNumber(value, { min: 0, max: 100, integer: true, fieldName: key });
        validated[key] = value;
        break;
        
      case 'MAX_PRODUCTS_PER_RUN':
        validateNumber(value, { min: 1, max: 100, integer: true, fieldName: key });
        validated[key] = value;
        break;
        
      case 'CRON_SCHEDULE':
        validateString(value, { minLength: 9, maxLength: 100, fieldName: key });
        // Basic cron validation (5 fields)
        const cronParts = value.trim().split(/\s+/);
        if (cronParts.length !== 5) {
          throw new ValidationError('CRON_SCHEDULE must have 5 fields', key);
        }
        validated[key] = value;
        break;
        
      case 'TELEGRAM_CHANNEL_ID':
        validateString(value, { minLength: 1, maxLength: 100, fieldName: key });
        validated[key] = value;
        break;
    }
  }
  
  return validated;
}

/**
 * Validate platform settings
 * @param {Object} settings - Platform settings
 * @returns {Object} Validated settings
 * @throws {ValidationError} If validation fails
 */
function validatePlatformSettings(settings) {
  validateRequired(settings, ['platform']);
  
  const validated = {
    platform: settings.platform
  };
  
  validateEnum(settings.platform, ['amazon', 'flipkart', 'myntra'], 'platform');
  
  if (settings.enabled !== undefined) {
    validateBoolean(settings.enabled, 'enabled');
    validated.enabled = settings.enabled;
  }
  
  if (settings.priority !== undefined) {
    validateNumber(settings.priority, { min: 1, max: 100, integer: true, fieldName: 'priority' });
    validated.priority = settings.priority;
  }
  
  if (settings.posting_ratio !== undefined) {
    validateNumber(settings.posting_ratio, { min: 0, max: 100, integer: true, fieldName: 'posting_ratio' });
    validated.posting_ratio = settings.posting_ratio;
  }
  
  if (settings.min_discount !== undefined) {
    validateNumber(settings.min_discount, { min: 0, max: 100, integer: true, fieldName: 'min_discount' });
    validated.min_discount = settings.min_discount;
  }
  
  if (settings.keywords_include !== undefined) {
    validateArray(settings.keywords_include, { itemType: 'string', fieldName: 'keywords_include' });
    validated.keywords_include = settings.keywords_include;
  }
  
  if (settings.keywords_exclude !== undefined) {
    validateArray(settings.keywords_exclude, { itemType: 'string', fieldName: 'keywords_exclude' });
    validated.keywords_exclude = settings.keywords_exclude;
  }
  
  return validated;
}

/**
 * Validate product data
 * @param {Object} product - Product data
 * @returns {Object} Validated product
 * @throws {ValidationError} If validation fails
 */
function validateProduct(product) {
  validateRequired(product, ['platform', 'productId', 'title', 'currentPrice', 'discountPercentage']);
  
  validateEnum(product.platform, ['amazon', 'flipkart', 'myntra'], 'platform');
  validateString(product.productId, { minLength: 1, maxLength: 100, fieldName: 'productId' });
  validateString(product.title, { minLength: 1, maxLength: 500, fieldName: 'title' });
  validateNumber(product.currentPrice, { min: 0, fieldName: 'currentPrice' });
  validateNumber(product.discountPercentage, { min: 0, max: 100, fieldName: 'discountPercentage' });
  
  return true;
}

module.exports = {
  ValidationError,
  validateRequired,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateEnum,
  validateConfigUpdate,
  validatePlatformSettings,
  validateProduct
};

