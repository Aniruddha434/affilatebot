/**
 * Test Discount Filter and Best Product Selection
 * Verifies:
 * 1. Only products with 85%+ discount are returned
 * 2. The product with highest discount is selected
 */

require('dotenv').config();
const AmazonScraperAdapter = require('./src/modules/platforms/AmazonScraperAdapter');

async function testDiscountFilter() {
  console.log('='.repeat(80));
  console.log('🧪 Testing Discount Filter and Best Product Selection');
  console.log('='.repeat(80));
  console.log();

  const adapter = new AmazonScraperAdapter();

  console.log('📋 Test 1: Verify 85% discount filter');
  console.log('-'.repeat(80));
  console.log();

  // Search for products with 85% minimum discount
  const products = await adapter.searchProducts('deals', {
    minDiscount: 85,
    maxResults: 20
  });

  console.log(`✅ Found ${products.length} products with 85%+ discount`);
  console.log();

  if (products.length === 0) {
    console.log('⚠️  No products found with 85%+ discount');
    console.log('   This is expected - very few products have such high discounts');
    console.log('   Try lowering the filter to 50-70% for more results');
    console.log();
    return;
  }

  // Verify all products meet the 85% threshold
  console.log('🔍 Verifying all products meet 85% discount threshold:');
  console.log();

  let allPass = true;
  products.forEach((product, index) => {
    const pass = product.discountPercentage >= 85;
    const status = pass ? '✅' : '❌';
    console.log(`   ${status} Product ${index + 1}: ${product.discountPercentage}% discount - ${product.title.substring(0, 50)}...`);
    
    if (!pass) {
      allPass = false;
      console.log(`      ❌ FAILED: Product has ${product.discountPercentage}% discount (below 85%)`);
    }
  });

  console.log();

  if (allPass) {
    console.log('✅ PASS: All products meet 85% discount threshold');
  } else {
    console.log('❌ FAIL: Some products do not meet 85% discount threshold');
  }

  console.log();
  console.log('='.repeat(80));
  console.log('📋 Test 2: Select product with highest discount');
  console.log('-'.repeat(80));
  console.log();

  // Find the product with highest discount
  const bestProduct = products.reduce((best, current) => {
    return (current.discountPercentage > best.discountPercentage) ? current : best;
  }, products[0]);

  console.log('🏆 Best Product (Highest Discount):');
  console.log();
  console.log(`   Title: ${bestProduct.title}`);
  console.log(`   ASIN: ${bestProduct.productId}`);
  console.log(`   Current Price: ₹${bestProduct.currentPrice.toLocaleString()}`);
  console.log(`   Original Price: ₹${bestProduct.originalPrice.toLocaleString()}`);
  console.log(`   Discount: ${bestProduct.discountPercentage}%`);
  console.log(`   Rating: ${bestProduct.rating}/5 (${bestProduct.reviewCount.toLocaleString()} reviews)`);
  console.log(`   Platform: ${bestProduct.platform}`);
  console.log();

  // Verify it's actually the highest
  const allDiscounts = products.map(p => p.discountPercentage);
  const maxDiscount = Math.max(...allDiscounts);

  if (bestProduct.discountPercentage === maxDiscount) {
    console.log(`✅ PASS: Selected product has highest discount (${maxDiscount}%)`);
  } else {
    console.log(`❌ FAIL: Selected product discount (${bestProduct.discountPercentage}%) is not the highest (${maxDiscount}%)`);
  }

  console.log();
  console.log('='.repeat(80));
  console.log('📊 All Products Sorted by Discount:');
  console.log('-'.repeat(80));
  console.log();

  // Sort products by discount (highest first)
  const sorted = [...products].sort((a, b) => b.discountPercentage - a.discountPercentage);

  sorted.forEach((product, index) => {
    const marker = index === 0 ? '🏆' : '  ';
    console.log(`${marker} ${index + 1}. ${product.discountPercentage}% - ${product.title.substring(0, 60)}...`);
    console.log(`      ₹${product.currentPrice.toLocaleString()} (was ₹${product.originalPrice.toLocaleString()}) | ${product.rating}/5 | ${product.productId}`);
  });

  console.log();
  console.log('='.repeat(80));
  console.log('✅ Test Complete!');
  console.log('='.repeat(80));
  console.log();
  console.log('📝 Summary:');
  console.log(`   - Total products found: ${products.length}`);
  console.log(`   - All meet 85% threshold: ${allPass ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   - Best product discount: ${bestProduct.discountPercentage}%`);
  console.log(`   - Discount range: ${Math.min(...allDiscounts)}% - ${Math.max(...allDiscounts)}%`);
  console.log();
  console.log('🎯 Expected Bot Behavior:');
  console.log('   1. Bot will scrape products from Amazon');
  console.log('   2. Filter to only products with 85%+ discount');
  console.log('   3. Select the ONE product with highest discount');
  console.log('   4. Post only that ONE product to Telegram');
  console.log('   5. Repeat every 2 minutes');
  console.log();
}

testDiscountFilter().catch(error => {
  console.error('❌ Test failed:', error.message);
  console.error(error);
});

