/**
 * Test script to verify admin login functionality
 * Run this with: node test-admin-login.js
 */

const axios = require('axios');
const crypto = require('crypto');

const API_URL = 'http://localhost:3000';
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || 'your-admin-api-secret-change-this';

// Test credentials - update these with your actual credentials
const TEST_USERNAME = 'Aniruddha';
const TEST_PASSWORD = 'your-password-here'; // Update this!

/**
 * Generate HMAC signature for admin API requests
 */
function generateHmacSignature(method, path, timestamp, body = '') {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const baseString = `${method}\n${path}\n${timestamp}\n${bodyHash}`;
  const signature = crypto.createHmac('sha256', ADMIN_API_SECRET)
    .update(baseString)
    .digest('hex');
  return signature;
}

/**
 * Test 1: Login without HMAC (login endpoint doesn't require HMAC)
 */
async function testLogin() {
  console.log('\n🧪 Test 1: Admin Login');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(`${API_URL}/admin/auth/login`, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('User:', response.data.user);
    
    return response.data.token;
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return null;
  }
}

/**
 * Test 2: Get bot status with HMAC authentication
 */
async function testBotStatus(token) {
  console.log('\n🧪 Test 2: Get Bot Status (with HMAC)');
  console.log('='.repeat(50));
  
  if (!token) {
    console.log('⏭️  Skipping - no token available');
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const path = '/admin/bot/status';
    const signature = generateHmacSignature(method, path, timestamp);

    const response = await axios.get(`${API_URL}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-admin-timestamp': timestamp,
        'x-admin-signature': signature
      }
    });

    console.log('✅ Bot status retrieved successfully!');
    console.log('Bot running:', response.data.is_running);
    console.log('Uptime:', response.data.uptime_seconds, 'seconds');
  } catch (error) {
    console.log('❌ Failed to get bot status!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

/**
 * Test 3: Check if bot is running
 */
async function testHealth() {
  console.log('\n🧪 Test 3: Health Check');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Bot is running!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Bot is not running!');
    console.log('Error:', error.message);
    console.log('\n⚠️  Please start the bot first: npm start');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n🚀 Admin Login Test Suite');
  console.log('='.repeat(50));
  console.log('API URL:', API_URL);
  console.log('Username:', TEST_USERNAME);
  console.log('Password:', TEST_PASSWORD === 'your-password-here' ? '⚠️  NOT SET!' : '✅ Set');
  
  if (TEST_PASSWORD === 'your-password-here') {
    console.log('\n❌ ERROR: Please update TEST_PASSWORD in this script!');
    console.log('Edit test-admin-login.js and set your actual password.');
    process.exit(1);
  }

  // Run tests
  await testHealth();
  const token = await testLogin();
  await testBotStatus(token);

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test suite complete!');
  console.log('='.repeat(50) + '\n');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

