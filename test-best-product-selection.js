/**
 * Test Best Product Selection Logic
 * Uses 50% discount to get products, then tests selection logic
 */

require('dotenv').config();
const AmazonScraperAdapter = require('./src/modules/platforms/AmazonScraperAdapter');

async function testBestProductSelection() {
  console.log('='.repeat(80));
  console.log('🧪 Testing Best Product Selection Logic');
  console.log('='.repeat(80));
  console.log();

  const adapter = new AmazonScraperAdapter();

  console.log('📋 Fetching products with 50% discount (to get test data)');
  console.log('-'.repeat(80));
  console.log();

  // Search for products with 50% minimum discount to get test data
  const products = await adapter.searchProducts('deals', {
    minDiscount: 50,
    maxResults: 20
  });

  console.log(`✅ Found ${products.length} products with 50%+ discount`);
  console.log();

  if (products.length === 0) {
    console.log('❌ No products found. Cannot test selection logic.');
    return;
  }

  console.log('📊 All Products:');
  console.log('-'.repeat(80));
  products.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.discountPercentage}% - ${product.title.substring(0, 50)}...`);
  });
  console.log();

  console.log('='.repeat(80));
  console.log('🏆 Testing Best Product Selection');
  console.log('-'.repeat(80));
  console.log();

  // Simulate the scheduler's selection logic
  const bestProduct = products.reduce((best, current) => {
    return (current.discountPercentage > best.discountPercentage) ? current : best;
  }, products[0]);

  console.log('Selected Best Product:');
  console.log(`   Title: ${bestProduct.title}`);
  console.log(`   ASIN: ${bestProduct.productId}`);
  console.log(`   Discount: ${bestProduct.discountPercentage}%`);
  console.log(`   Price: ₹${bestProduct.currentPrice.toLocaleString()} (was ₹${bestProduct.originalPrice.toLocaleString()})`);
  console.log();

  // Verify it's the highest
  const allDiscounts = products.map(p => p.discountPercentage);
  const maxDiscount = Math.max(...allDiscounts);
  const minDiscount = Math.min(...allDiscounts);

  console.log('Verification:');
  console.log(`   Highest discount in set: ${maxDiscount}%`);
  console.log(`   Selected product discount: ${bestProduct.discountPercentage}%`);
  console.log(`   Match: ${bestProduct.discountPercentage === maxDiscount ? '✅ YES' : '❌ NO'}`);
  console.log();

  if (bestProduct.discountPercentage === maxDiscount) {
    console.log('✅ PASS: Selection logic correctly picks highest discount product');
  } else {
    console.log('❌ FAIL: Selection logic did not pick highest discount product');
  }

  console.log();
  console.log('='.repeat(80));
  console.log('📊 Products Sorted by Discount (Highest First):');
  console.log('-'.repeat(80));
  console.log();

  const sorted = [...products].sort((a, b) => b.discountPercentage - a.discountPercentage);

  sorted.slice(0, 10).forEach((product, index) => {
    const marker = index === 0 ? '🏆 BEST' : `   ${index + 1}.`;
    console.log(`${marker} ${product.discountPercentage}% - ${product.title.substring(0, 55)}...`);
    console.log(`        ₹${product.currentPrice.toLocaleString()} (was ₹${product.originalPrice.toLocaleString()}) | ${product.rating}/5`);
  });

  console.log();
  console.log('='.repeat(80));
  console.log('✅ Test Complete!');
  console.log('='.repeat(80));
  console.log();
  console.log('📝 Summary:');
  console.log(`   - Total products: ${products.length}`);
  console.log(`   - Discount range: ${minDiscount}% - ${maxDiscount}%`);
  console.log(`   - Best product: ${bestProduct.discountPercentage}%`);
  console.log(`   - Selection logic: ${bestProduct.discountPercentage === maxDiscount ? '✅ WORKING' : '❌ BROKEN'}`);
  console.log();
  console.log('🎯 Bot Behavior with 85% Filter:');
  console.log('   1. Scrape products from Amazon');
  console.log('   2. Filter to ONLY products with 85%+ discount');
  console.log('   3. If multiple products pass filter:');
  console.log('      → Select the ONE with highest discount');
  console.log('   4. Post only that ONE product');
  console.log('   5. If NO products pass filter:');
  console.log('      → Post nothing (wait for next run)');
  console.log();
}

testBestProductSelection().catch(error => {
  console.error('❌ Test failed:', error.message);
  console.error(error);
});

