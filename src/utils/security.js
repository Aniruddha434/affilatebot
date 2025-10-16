/**
 * Security Utilities
 * Provides cryptographic functions, secret generation, and security helpers
 */

const crypto = require('crypto');
const logger = require('./logger');

/**
 * Generate a cryptographically secure random secret
 * @param {number} length - Length in bytes (default: 32)
 * @returns {string} Hex-encoded secret
 */
function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate multiple secrets for different purposes
 * @returns {Object} Object containing generated secrets
 */
function generateAllSecrets() {
  return {
    JWT_SECRET: generateSecureSecret(32),
    ADMIN_API_SECRET: generateSecureSecret(32),
    SESSION_SECRET: generateSecureSecret(32),
    ENCRYPTION_KEY: generateSecureSecret(32)
  };
}

/**
 * Hash a string using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hex-encoded hash
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} Hex-encoded signature
 */
function generateHMAC(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature with timing-safe comparison
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} True if signature is valid
 */
function verifyHMAC(data, signature, secret) {
  try {
    const expectedSignature = generateHMAC(data, secret);
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');
    
    if (sigBuf.length !== expBuf.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (error) {
    logger.error('HMAC verification error', error);
    return false;
  }
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {string} key - Encryption key (hex-encoded)
 * @returns {Object} Object containing encrypted data and IV
 */
function encrypt(plaintext, key) {
  try {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(key, 'hex');
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    logger.error('Encryption error', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encrypted - Encrypted data (hex-encoded)
 * @param {string} key - Encryption key (hex-encoded)
 * @param {string} iv - Initialization vector (hex-encoded)
 * @param {string} authTag - Authentication tag (hex-encoded)
 * @returns {string} Decrypted plaintext
 */
function decrypt(encrypted, key, iv, authTag) {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '') // Remove semicolons
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generate a secure random token
 * @param {number} length - Length in bytes
 * @returns {string} URL-safe base64 token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Check if a timestamp is within acceptable clock skew
 * @param {string|number} timestamp - Timestamp to check (ISO string or Unix ms)
 * @param {number} maxSkewSeconds - Maximum allowed skew in seconds
 * @returns {boolean} True if within acceptable range
 */
function isTimestampValid(timestamp, maxSkewSeconds = 120) {
  try {
    const tsMs = typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp;
    if (Number.isNaN(tsMs)) {
      return false;
    }
    
    const nowMs = Date.now();
    const skewSec = Math.abs(nowMs - tsMs) / 1000;
    
    return skewSec <= maxSkewSeconds;
  } catch {
    return false;
  }
}

/**
 * Rate limiting helper - check if action is allowed
 * @param {Map} rateLimitStore - Map to store rate limit data
 * @param {string} key - Unique identifier (e.g., IP address, user ID)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} Object with allowed status and remaining attempts
 */
function checkRateLimit(rateLimitStore, key, maxAttempts, windowMs) {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }
  
  if (now > record.resetTime) {
    // Window expired, reset
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }
  
  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count, resetTime: record.resetTime };
}

/**
 * Clean up expired rate limit entries
 * @param {Map} rateLimitStore - Map to clean
 */
function cleanupRateLimitStore(rateLimitStore) {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

module.exports = {
  generateSecureSecret,
  generateAllSecrets,
  sha256,
  generateHMAC,
  verifyHMAC,
  encrypt,
  decrypt,
  sanitizeInput,
  isValidEmail,
  isValidUrl,
  generateToken,
  isTimestampValid,
  checkRateLimit,
  cleanupRateLimitStore
};

