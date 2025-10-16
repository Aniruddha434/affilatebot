/**
 * Verify Affiliate Tag is Correct
 * Checks that products have the correct affiliate tag: 4340c5-21
 */

require('dotenv').config();
const AmazonScraperAdapter = require('./src/modules/platforms/AmazonScraperAdapter');

async function verifyAffiliateTag() {
  console.log('='.repeat(80));
  console.log('🔍 Verifying Affiliate Tag Configuration');
  console.log('='.repeat(80));
  console.log();

  const adapter = new AmazonScraperAdapter();

  console.log('📋 Configuration Check:');
  console.log('-'.repeat(80));
  console.log(`   Expected Tag: 4340c5-21`);
  console.log(`   Configured Tag: ${process.env.AMAZON_PARTNER_TAG}`);
  console.log();

  if (process.env.AMAZON_PARTNER_TAG === '4340c5-21') {
    console.log('✅ Environment variable is correct!');
  } else {
    console.log('❌ Environment variable is incorrect!');
    console.log(`   Please update AMAZON_PARTNER_TAG in .env to: 4340c5-21`);
    return;
  }

  console.log();
  console.log('📋 Testing Affiliate Link Generation:');
  console.log('-'.repeat(80));
  console.log();

  // Test with a sample ASIN
  const testAsin = 'B0B854R7NS';
  const affiliateLink = adapter.getAffiliateLink(testAsin);

  console.log(`   Test ASIN: ${testAsin}`);
  console.log(`   Generated Link: ${affiliateLink}`);
  console.log();

  // Verify the link contains the correct tag
  if (affiliateLink.includes('tag=4340c5-21')) {
    console.log('✅ Affiliate link contains correct tag: 4340c5-21');
  } else {
    console.log('❌ Affiliate link does NOT contain correct tag!');
    console.log(`   Expected: tag=4340c5-21`);
    console.log(`   Found: ${affiliateLink}`);
    return;
  }

  console.log();
  console.log('📋 Testing with Real Products:');
  console.log('-'.repeat(80));
  console.log();

  // Fetch some real products
  const products = await adapter.searchProducts('deals', {
    minDiscount: 50,
    maxResults: 5
  });

  if (products.length === 0) {
    console.log('⚠️  No products found to test with');
    console.log('   But configuration is correct!');
    console.log();
    return;
  }

  console.log(`✅ Found ${products.length} products to test`);
  console.log();

  let allCorrect = true;

  products.forEach((product, index) => {
    const hasCorrectTag = product.affiliateLink.includes('tag=4340c5-21');
    const status = hasCorrectTag ? '✅' : '❌';
    
    console.log(`${status} Product ${index + 1}: ${product.title.substring(0, 50)}...`);
    console.log(`   ASIN: ${product.productId}`);
    console.log(`   Link: ${product.affiliateLink}`);
    
    if (!hasCorrectTag) {
      allCorrect = false;
      console.log(`   ❌ ERROR: Link does not contain tag=4340c5-21`);
    }
    console.log();
  });

  console.log('='.repeat(80));
  if (allCorrect) {
    console.log('✅ SUCCESS: All affiliate links have correct tag!');
  } else {
    console.log('❌ FAILURE: Some affiliate links have incorrect tag!');
  }
  console.log('='.repeat(80));
  console.log();

  console.log('📝 Summary:');
  console.log(`   - Environment Variable: ${process.env.AMAZON_PARTNER_TAG === '4340c5-21' ? '✅ Correct' : '❌ Incorrect'}`);
  console.log(`   - Link Generation: ${affiliateLink.includes('tag=4340c5-21') ? '✅ Correct' : '❌ Incorrect'}`);
  console.log(`   - Product Links: ${allCorrect ? '✅ All Correct' : '❌ Some Incorrect'}`);
  console.log();

  console.log('🎯 Expected Link Format:');
  console.log('   https://www.amazon.in/dp/{ASIN}?tag=4340c5-21');
  console.log();

  console.log('📱 Your Affiliate Link Example:');
  console.log('   https://www.amazon.in/dp/B0B854R7NS?tag=4340c5-21');
  console.log();

  console.log('✅ All products posted to Telegram will now have your affiliate tag!');
  console.log();
}

verifyAffiliateTag().catch(error => {
  console.error('❌ Verification failed:', error.message);
  console.error(error);
});

