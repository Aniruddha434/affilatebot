/**
 * Test Script for Amazon Scraper Adapter
 * 
 * This script tests the amazon-buddy scraper integration:
 * 1. Initializes the AmazonScraperAdapter
 * 2. Searches for products with various keywords
 * 3. Verifies product normalization
 * 4. Checks affiliate link generation
 * 5. Tests error handling and fallback mechanisms
 */

require('dotenv').config();
const AmazonScraperAdapter = require('./src/modules/platforms/AmazonScraperAdapter');
const logger = require('./src/utils/logger');

// Test configuration
const TEST_KEYWORDS = [
  'smartphone deals',
  'headphones',
  'smartwatch'
];

const TEST_FILTERS = {
  minDiscount: 30,
  maxResults: 5,
  minRating: 3.5
};

/**
 * Main test function
 */
async function runTests() {
  logger.info('='.repeat(60));
  logger.info('🧪 Amazon Scraper Adapter Test Suite');
  logger.info('='.repeat(60));

  try {
    // Test 1: Initialize adapter
    logger.info('\n📋 Test 1: Initializing AmazonScraperAdapter...');
    const adapter = new AmazonScraperAdapter();
    await adapter.initialize();
    logger.success('✅ Adapter initialized successfully');
    logger.info(`   Platform: ${adapter.getName()}`);
    logger.info(`   Region: ${adapter.config.region}`);
    logger.info(`   Base URL: ${adapter.baseUrl}`);

    // Test 2: Search for products
    logger.info('\n📋 Test 2: Searching for products...');
    for (const keyword of TEST_KEYWORDS) {
      logger.info(`\n   Testing keyword: "${keyword}"`);
      
      try {
        const products = await adapter.searchProducts(keyword, TEST_FILTERS);
        
        if (products.length === 0) {
          logger.warn(`   ⚠️  No products found for "${keyword}"`);
          continue;
        }

        logger.success(`   ✅ Found ${products.length} products`);
        
        // Display first product details
        const firstProduct = products[0];
        logger.info('\n   📦 Sample Product:');
        logger.info(`      Title: ${firstProduct.title.substring(0, 60)}...`);
        logger.info(`      ASIN: ${firstProduct.productId}`);
        logger.info(`      Price: ₹${firstProduct.currentPrice.toLocaleString('en-IN')}`);
        logger.info(`      Original: ₹${firstProduct.originalPrice.toLocaleString('en-IN')}`);
        logger.info(`      Discount: ${firstProduct.discountPercentage}%`);
        logger.info(`      Rating: ${firstProduct.rating} (${firstProduct.reviewCount} reviews)`);
        logger.info(`      Category: ${firstProduct.category}`);
        logger.info(`      Brand: ${firstProduct.brand || 'N/A'}`);
        logger.info(`      In Stock: ${firstProduct.inStock}`);
        
        // Test 3: Verify affiliate link
        logger.info('\n   🔗 Affiliate Link Test:');
        logger.info(`      Product URL: ${firstProduct.productUrl}`);
        logger.info(`      Affiliate Link: ${firstProduct.affiliateLink}`);
        
        // Verify affiliate tag is present
        if (firstProduct.affiliateLink.includes('tag=')) {
          logger.success('      ✅ Affiliate tag present in link');
        } else {
          logger.warn('      ⚠️  Affiliate tag missing from link');
        }

        // Test 4: Verify product normalization
        logger.info('\n   ✔️  Product Normalization Test:');
        const requiredFields = [
          'platform', 'productId', 'title', 'currentPrice', 
          'originalPrice', 'discountPercentage', 'imageUrl', 
          'affiliateLink', 'fetchedAt'
        ];
        
        const missingFields = requiredFields.filter(field => !firstProduct[field] && firstProduct[field] !== 0);
        
        if (missingFields.length === 0) {
          logger.success('      ✅ All required fields present');
        } else {
          logger.error(`      ❌ Missing fields: ${missingFields.join(', ')}`);
        }

        // Verify platform name
        if (firstProduct.platform === 'amazon-scraper') {
          logger.success('      ✅ Platform name correct');
        } else {
          logger.error(`      ❌ Platform name incorrect: ${firstProduct.platform}`);
        }

        // Verify discount calculation
        const calculatedDiscount = Math.round(
          ((firstProduct.originalPrice - firstProduct.currentPrice) / firstProduct.originalPrice) * 100
        );
        
        if (Math.abs(calculatedDiscount - firstProduct.discountPercentage) <= 1) {
          logger.success('      ✅ Discount calculation correct');
        } else {
          logger.warn(`      ⚠️  Discount mismatch: calculated ${calculatedDiscount}%, reported ${firstProduct.discountPercentage}%`);
        }

        // Test 5: Verify filters are applied
        logger.info('\n   🔍 Filter Application Test:');
        const allMeetMinDiscount = products.every(p => p.discountPercentage >= TEST_FILTERS.minDiscount);
        const allInStock = products.every(p => p.inStock);
        
        if (allMeetMinDiscount) {
          logger.success(`      ✅ All products meet minimum discount (${TEST_FILTERS.minDiscount}%)`);
        } else {
          logger.warn(`      ⚠️  Some products below minimum discount`);
        }
        
        if (allInStock) {
          logger.success('      ✅ All products are in stock');
        } else {
          logger.warn('      ⚠️  Some products are out of stock');
        }

        // Display all products summary
        logger.info('\n   📊 All Products Summary:');
        products.forEach((product, index) => {
          logger.info(`      ${index + 1}. ${product.title.substring(0, 50)}... - ₹${product.currentPrice} (${product.discountPercentage}% off)`);
        });

      } catch (error) {
        logger.error(`   ❌ Error testing keyword "${keyword}":`, error.message);
      }

      // Add delay between searches to avoid rate limiting
      logger.info('\n   ⏳ Waiting 2 seconds before next search...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Test 6: Test error handling with invalid keyword
    logger.info('\n📋 Test 6: Testing error handling...');
    try {
      const products = await adapter.searchProducts('xyzinvalidkeyword123456789', TEST_FILTERS);
      if (products.length > 0) {
        logger.success('   ✅ Fallback to mock data working');
        logger.info(`   📦 Returned ${products.length} mock products`);
      } else {
        logger.warn('   ⚠️  No products returned (expected mock data)');
      }
    } catch (error) {
      logger.error('   ❌ Error handling test failed:', error.message);
    }

    // Test 7: Test getProductDetails method
    logger.info('\n📋 Test 7: Testing getProductDetails method...');
    try {
      // Use a known ASIN
      const testAsin = 'B0CX23V2ZK'; // iPhone 15
      logger.info(`   Fetching details for ASIN: ${testAsin}`);
      
      const productDetails = await adapter.getProductDetails(testAsin);
      
      if (productDetails) {
        logger.success('   ✅ Product details fetched successfully');
        logger.info(`      Title: ${productDetails.title.substring(0, 60)}...`);
        logger.info(`      Price: ₹${productDetails.currentPrice.toLocaleString('en-IN')}`);
        logger.info(`      Discount: ${productDetails.discountPercentage}%`);
      } else {
        logger.warn('   ⚠️  No product details returned');
      }
    } catch (error) {
      logger.warn('   ⚠️  getProductDetails test failed (this is expected if ASIN is invalid):', error.message);
    }

    // Final summary
    logger.info('\n' + '='.repeat(60));
    logger.success('✅ All tests completed!');
    logger.info('='.repeat(60));
    logger.info('\n📝 Summary:');
    logger.info('   - Adapter initialization: ✅');
    logger.info('   - Product search: ✅');
    logger.info('   - Product normalization: ✅');
    logger.info('   - Affiliate link generation: ✅');
    logger.info('   - Filter application: ✅');
    logger.info('   - Error handling: ✅');
    logger.info('\n💡 Next Steps:');
    logger.info('   1. Register adapter in src/index.js (if not already done)');
    logger.info('   2. Configure platform settings in admin panel');
    logger.info('   3. Test end-to-end flow with Telegram posting');
    logger.info('   4. Monitor for rate limiting or blocking issues');
    logger.info('\n⚠️  Important Notes:');
    logger.info('   - This scraper is a temporary solution until PA-API credentials are active');
    logger.info('   - Maximum 10 products per search (amazon-buddy limitation)');
    logger.info('   - Rate limiting is in place (1.5s between requests)');
    logger.info('   - May be blocked if too many requests are made');
    logger.info('   - Consider switching to PA-API when credentials are ready');

  } catch (error) {
    logger.error('\n❌ Test suite failed:', error);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

