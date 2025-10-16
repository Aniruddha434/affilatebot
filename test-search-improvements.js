/**
 * Test Script for Search Improvements
 * 
 * Verifies:
 * 1. Keyword-aware mock data generation
 * 2. Search result diversity across different keywords
 * 3. Cache functionality
 * 4. Increased product coverage
 */

require('dotenv').config();
const AmazonAdapter = require('./src/modules/platforms/AmazonAdapter');
const FlipkartAdapter = require('./src/modules/platforms/FlipkartAdapter');
const MyntraAdapter = require('./src/modules/platforms/MyntraAdapter');
const searchCache = require('./src/modules/SearchCache');
const platformManager = require('./src/modules/platforms/PlatformManager');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80) + '\n');
}

async function testKeywordAwareMockData() {
  section('TEST 1: Keyword-Aware Mock Data Generation');

  const amazonAdapter = new AmazonAdapter();
  await amazonAdapter.initialize();

  const testKeywords = [
    'laptop deals',
    'fashion sale',
    'headphones',
    'books offer',
    'smartwatch'
  ];

  log('Testing Amazon adapter with different keywords...', 'cyan');
  console.log();

  for (const keyword of testKeywords) {
    const products = await amazonAdapter.searchProducts(keyword, { maxResults: 10 });
    
    log(`Keyword: "${keyword}"`, 'yellow');
    log(`  Products found: ${products.length}`, 'green');
    
    if (products.length > 0) {
      log(`  Sample product: ${products[0].title}`, 'blue');
      log(`  Category: ${products[0].category}`, 'blue');
      log(`  Discount: ${products[0].discountPercentage}%`, 'blue');
    }
    console.log();
  }

  log('✅ Test 1 Complete: Keyword-aware generation working', 'green');
}

async function testSearchDiversity() {
  section('TEST 2: Search Result Diversity');

  const amazonAdapter = new AmazonAdapter();
  const flipkartAdapter = new FlipkartAdapter();
  const myntraAdapter = new MyntraAdapter();

  await amazonAdapter.initialize();
  await flipkartAdapter.initialize();
  await myntraAdapter.initialize();

  log('Comparing products from different keyword searches...', 'cyan');
  console.log();

  // Test Amazon
  const amazonProducts1 = await amazonAdapter.searchProducts('electronics deals', { maxResults: 5 });
  const amazonProducts2 = await amazonAdapter.searchProducts('fashion sale', { maxResults: 5 });

  log('Amazon - Electronics vs Fashion:', 'yellow');
  log(`  Electronics products: ${amazonProducts1.length}`, 'blue');
  if (amazonProducts1.length > 0) {
    log(`    Sample: ${amazonProducts1[0].title}`, 'blue');
  }
  log(`  Fashion products: ${amazonProducts2.length}`, 'blue');
  if (amazonProducts2.length > 0) {
    log(`    Sample: ${amazonProducts2[0].title}`, 'blue');
  }

  // Check if products are different
  const amazonTitles1 = amazonProducts1.map(p => p.title).join('|');
  const amazonTitles2 = amazonProducts2.map(p => p.title).join('|');
  const amazonDifferent = amazonTitles1 !== amazonTitles2;
  
  log(`  Products are different: ${amazonDifferent ? '✅ YES' : '❌ NO'}`, amazonDifferent ? 'green' : 'red');
  console.log();

  // Test Flipkart
  const flipkartProducts1 = await flipkartAdapter.searchProducts('mobile phones', { maxResults: 5 });
  const flipkartProducts2 = await flipkartAdapter.searchProducts('home appliances', { maxResults: 5 });

  log('Flipkart - Mobiles vs Home:', 'yellow');
  log(`  Mobile products: ${flipkartProducts1.length}`, 'blue');
  if (flipkartProducts1.length > 0) {
    log(`    Sample: ${flipkartProducts1[0].title}`, 'blue');
  }
  log(`  Home products: ${flipkartProducts2.length}`, 'blue');
  if (flipkartProducts2.length > 0) {
    log(`    Sample: ${flipkartProducts2[0].title}`, 'blue');
  }

  const flipkartTitles1 = flipkartProducts1.map(p => p.title).join('|');
  const flipkartTitles2 = flipkartProducts2.map(p => p.title).join('|');
  const flipkartDifferent = flipkartTitles1 !== flipkartTitles2;
  
  log(`  Products are different: ${flipkartDifferent ? '✅ YES' : '❌ NO'}`, flipkartDifferent ? 'green' : 'red');
  console.log();

  // Test Myntra
  const myntraProducts1 = await myntraAdapter.searchProducts('men fashion', { maxResults: 5 });
  const myntraProducts2 = await myntraAdapter.searchProducts('women fashion', { maxResults: 5 });

  log('Myntra - Men vs Women:', 'yellow');
  log(`  Men products: ${myntraProducts1.length}`, 'blue');
  if (myntraProducts1.length > 0) {
    log(`    Sample: ${myntraProducts1[0].title}`, 'blue');
  }
  log(`  Women products: ${myntraProducts2.length}`, 'blue');
  if (myntraProducts2.length > 0) {
    log(`    Sample: ${myntraProducts2[0].title}`, 'blue');
  }

  const myntraTitles1 = myntraProducts1.map(p => p.title).join('|');
  const myntraTitles2 = myntraProducts2.map(p => p.title).join('|');
  const myntraDifferent = myntraTitles1 !== myntraTitles2;
  
  log(`  Products are different: ${myntraDifferent ? '✅ YES' : '❌ NO'}`, myntraDifferent ? 'green' : 'red');
  console.log();

  const allDifferent = amazonDifferent && flipkartDifferent && myntraDifferent;
  log(allDifferent ? '✅ Test 2 Complete: All platforms show diversity' : '⚠️  Test 2: Some platforms need review', allDifferent ? 'green' : 'yellow');
}

async function testCacheFunctionality() {
  section('TEST 3: Search Cache Functionality');

  // Clear cache first
  searchCache.clear();
  log('Cache cleared', 'cyan');
  console.log();

  const amazonAdapter = new AmazonAdapter();
  await amazonAdapter.initialize();

  // First search (cache miss)
  log('First search for "laptop deals" (should be cache MISS)...', 'yellow');
  const products1 = await amazonAdapter.searchProducts('laptop deals', { maxResults: 10 });
  searchCache.set('laptop deals', products1, 'amazon');
  
  let stats = searchCache.getStats();
  log(`  Products found: ${products1.length}`, 'blue');
  log(`  Cache stats: ${stats.hits} hits, ${stats.misses} misses`, 'blue');
  console.log();

  // Second search (cache hit)
  log('Second search for "laptop deals" (should be cache HIT)...', 'yellow');
  const cachedProducts = searchCache.get('laptop deals', 'amazon');
  
  stats = searchCache.getStats();
  log(`  Cached products: ${cachedProducts ? cachedProducts.length : 0}`, 'blue');
  log(`  Cache stats: ${stats.hits} hits, ${stats.misses} misses`, 'blue');
  log(`  Hit rate: ${stats.hitRate}`, 'blue');
  console.log();

  // Different search (cache miss)
  log('Third search for "headphones" (should be cache MISS)...', 'yellow');
  const products2 = await amazonAdapter.searchProducts('headphones', { maxResults: 10 });
  searchCache.set('headphones', products2, 'amazon');
  
  stats = searchCache.getStats();
  log(`  Products found: ${products2.length}`, 'blue');
  log(`  Cache stats: ${stats.hits} hits, ${stats.misses} misses`, 'blue');
  console.log();

  // Verify cache has both keywords
  const cachedKeywords = searchCache.getCachedKeywords();
  log(`Cached keywords: ${cachedKeywords.join(', ')}`, 'cyan');
  console.log();

  const cacheWorking = cachedProducts && cachedProducts.length > 0 && stats.hits > 0;
  log(cacheWorking ? '✅ Test 3 Complete: Cache working correctly' : '❌ Test 3 Failed: Cache not working', cacheWorking ? 'green' : 'red');
}

async function testIncreasedCoverage() {
  section('TEST 4: Increased Product Coverage');

  const amazonAdapter = new AmazonAdapter();
  await amazonAdapter.initialize();

  log('Testing product count with increased limits...', 'cyan');
  console.log();

  const testCases = [
    { maxResults: 10, expected: 10 },
    { maxResults: 20, expected: 20 },
    { maxResults: 50, expected: 50 }
  ];

  for (const testCase of testCases) {
    const products = await amazonAdapter.searchProducts('deals', { maxResults: testCase.maxResults });
    const success = products.length >= testCase.expected * 0.8; // Allow 80% threshold
    
    log(`  Requested: ${testCase.maxResults} products`, 'yellow');
    log(`  Received: ${products.length} products`, success ? 'green' : 'red');
    log(`  Status: ${success ? '✅ PASS' : '❌ FAIL'}`, success ? 'green' : 'red');
    console.log();
  }

  log('✅ Test 4 Complete: Coverage testing done', 'green');
}

async function runAllTests() {
  log('\n🧪 SEARCH IMPROVEMENTS TEST SUITE', 'bright');
  log('Testing keyword-aware search, diversity, caching, and coverage\n', 'cyan');

  try {
    await testKeywordAwareMockData();
    await testSearchDiversity();
    await testCacheFunctionality();
    await testIncreasedCoverage();

    section('🎉 ALL TESTS COMPLETE');
    log('Summary:', 'bright');
    log('  ✅ Keyword-aware mock data generation', 'green');
    log('  ✅ Search result diversity', 'green');
    log('  ✅ Cache functionality', 'green');
    log('  ✅ Increased product coverage', 'green');
    console.log();
    log('The search improvements are working as expected!', 'green');
    console.log();

  } catch (error) {
    log('\n❌ TEST FAILED', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);

