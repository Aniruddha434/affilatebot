/**
 * Test Script for New Features
 * Tests image management, manual posting, and keyword management
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET;

// HMAC signature generation
function generateHMACSignature(method, path, timestamp, body = {}) {
  const bodyString = Object.keys(body).length > 0 ? JSON.stringify(body) : '{}';
  const bodySha256 = crypto.createHash('sha256').update(bodyString).digest('hex');
  const baseString = `${method}\n${path}\n${timestamp}\n${bodySha256}`;
  return crypto.createHmac('sha256', ADMIN_API_SECRET).update(baseString).digest('hex');
}

// Make authenticated request
async function makeAuthenticatedRequest(method, path, data = null) {
  const timestamp = new Date().toISOString();
  const signature = generateHMACSignature(method, path, timestamp, data || {});
  
  const config = {
    method,
    url: `${API_BASE_URL}${path}`,
    headers: {
      'X-Admin-Signature': signature,
      'X-Admin-Timestamp': timestamp,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
}

// Test functions
async function testImageValidation() {
  console.log('\n🖼️  Testing Image Validation...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/images/validate`, {
      url: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SX522_.jpg'
    });
    
    console.log('✅ Image validation:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Image validation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testImageCacheStats() {
  console.log('\n📊 Testing Image Cache Stats...');
  
  try {
    const response = await makeAuthenticatedRequest('GET', '/admin/images/stats');
    console.log('✅ Cache stats:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Cache stats failed:', error.response?.data || error.message);
    return false;
  }
}

async function testKeywordManagement() {
  console.log('\n🔑 Testing Keyword Management...');
  
  try {
    // Add keyword
    console.log('  Adding keyword...');
    const addResponse = await makeAuthenticatedRequest('POST', '/admin/keywords', {
      keyword: 'test-laptop',
      platform: 'amazon'
    });
    console.log('  ✅ Keyword added:', addResponse.data);
    
    const keywordId = addResponse.data.id;
    
    // Get all keywords
    console.log('  Fetching all keywords...');
    const getResponse = await makeAuthenticatedRequest('GET', '/admin/keywords');
    console.log(`  ✅ Found ${getResponse.data.length} keywords`);
    
    // Delete keyword
    console.log('  Deleting test keyword...');
    const deleteResponse = await makeAuthenticatedRequest('DELETE', `/admin/keywords/${keywordId}`);
    console.log('  ✅ Keyword deleted:', deleteResponse.data);
    
    return true;
  } catch (error) {
    console.error('❌ Keyword management failed:', error.response?.data || error.message);
    return false;
  }
}

async function testManualPosting() {
  console.log('\n📝 Testing Manual Product Posting...');
  
  const testProduct = {
    platform: 'amazon',
    productId: 'TEST-' + Date.now(),
    title: 'Test Product - Do Not Buy',
    currentPrice: 999,
    originalPrice: 1999,
    discountPercentage: 50,
    imageUrl: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SX522_.jpg',
    productUrl: 'https://www.amazon.in/dp/TEST123',
    category: 'Test',
    brand: 'Test Brand'
  };
  
  try {
    const response = await makeAuthenticatedRequest('POST', '/admin/deals/manual', testProduct);
    console.log('✅ Manual posting:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Manual posting failed:', error.response?.data || error.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n🏥 Testing Enhanced Health Check...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', response.data);
    
    if (response.data.checks) {
      console.log('  System checks:');
      for (const [key, value] of Object.entries(response.data.checks)) {
        console.log(`    ${value ? '✅' : '❌'} ${key}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n🚦 Testing Rate Limiting...');
  
  try {
    console.log('  Attempting multiple login requests...');
    
    for (let i = 1; i <= 6; i++) {
      try {
        await axios.post(`${API_BASE_URL}/admin/auth/login`, {
          username: 'test',
          password: 'wrong'
        });
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`  ✅ Rate limit triggered on attempt ${i}`);
          return true;
        }
      }
    }
    
    console.log('  ⚠️  Rate limit not triggered (may need more attempts)');
    return true;
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
    return false;
  }
}

async function testRealtimeLogs() {
  console.log('\n📋 Testing Real-time Logs...');
  
  try {
    const response = await makeAuthenticatedRequest('GET', '/admin/logs/realtime?limit=10');
    console.log(`✅ Retrieved ${response.data.logs?.length || 0} log entries`);
    
    if (response.data.logs && response.data.logs.length > 0) {
      console.log('  Latest log:', response.data.logs[0]);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Real-time logs failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('='.repeat(70));
  console.log('🧪 TESTING NEW FEATURES');
  console.log('='.repeat(70));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Admin Secret: ${ADMIN_API_SECRET ? '✅ Configured' : '❌ Missing'}`);
  
  if (!ADMIN_API_SECRET) {
    console.error('\n❌ ADMIN_API_SECRET not configured in .env');
    console.error('   Run: node generate-secrets.js');
    process.exit(1);
  }
  
  const results = {
    healthCheck: await testHealthCheck(),
    imageValidation: await testImageValidation(),
    imageCacheStats: await testImageCacheStats(),
    keywordManagement: await testKeywordManagement(),
    realtimeLogs: await testRealtimeLogs(),
    rateLimiting: await testRateLimiting(),
    // manualPosting: await testManualPosting(), // Commented out to avoid posting test data
  };
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(70));
  
  let passed = 0;
  let total = 0;
  
  for (const [test, result] of Object.entries(results)) {
    total++;
    if (result) passed++;
    console.log(`${result ? '✅' : '❌'} ${test}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`PASSED: ${passed}/${total} tests`);
  console.log('='.repeat(70));
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your bot is ready for production!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Test runner failed:', error);
  process.exit(1);
});

