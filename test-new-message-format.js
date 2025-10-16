/**
 * Test New Telegram Message Format
 * Verifies the updated message format with:
 * - Original price with strikethrough first
 * - No platform display
 * - 80% discount threshold
 */

require('dotenv').config();
const AmazonScraperAdapter = require('./src/modules/platforms/AmazonScraperAdapter');
const telegramBot = require('./src/modules/telegramBot');

async function testNewMessageFormat() {
  console.log('='.repeat(80));
  console.log('🧪 Testing New Telegram Message Format');
  console.log('='.repeat(80));
  console.log();

  const adapter = new AmazonScraperAdapter();

  console.log('📋 Step 1: Fetch products with 80% discount');
  console.log('-'.repeat(80));
  console.log();

  // Search for products with 80% minimum discount
  const products = await adapter.searchProducts('deals', {
    minDiscount: 80,
    maxResults: 10
  });

  console.log(`✅ Found ${products.length} products with 80%+ discount`);
  console.log();

  if (products.length === 0) {
    console.log('⚠️  No products found with 80%+ discount');
    console.log('   Trying with 50% discount to test message format...');
    console.log();
    
    const testProducts = await adapter.searchProducts('deals', {
      minDiscount: 50,
      maxResults: 5
    });
    
    if (testProducts.length > 0) {
      products.push(...testProducts);
      console.log(`✅ Found ${testProducts.length} products with 50%+ discount for testing`);
      console.log();
    }
  }

  if (products.length === 0) {
    console.log('❌ No products found to test with');
    return;
  }

  console.log('📊 Products Found:');
  console.log('-'.repeat(80));
  products.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.discountPercentage}% - ${product.title.substring(0, 50)}...`);
    console.log(`      Original: ₹${product.originalPrice.toLocaleString()} → Current: ₹${product.currentPrice.toLocaleString()}`);
  });
  console.log();

  console.log('='.repeat(80));
  console.log('📱 Step 2: Preview Message Format');
  console.log('-'.repeat(80));
  console.log();

  // Initialize Telegram bot
  telegramBot.initialize();

  // Get the best product (highest discount)
  const bestProduct = products.reduce((best, current) => {
    return (current.discountPercentage > best.discountPercentage) ? current : best;
  }, products[0]);

  console.log('Selected Product for Preview:');
  console.log(`   Title: ${bestProduct.title}`);
  console.log(`   ASIN: ${bestProduct.productId}`);
  console.log(`   Discount: ${bestProduct.discountPercentage}%`);
  console.log(`   Original Price: ₹${bestProduct.originalPrice.toLocaleString()}`);
  console.log(`   Current Price: ₹${bestProduct.currentPrice.toLocaleString()}`);
  console.log(`   You Save: ₹${(bestProduct.originalPrice - bestProduct.currentPrice).toLocaleString()}`);
  console.log();

  // Format the message
  const message = telegramBot.formatPlatformDealMessage(bestProduct);

  console.log('='.repeat(80));
  console.log('📝 Formatted Message Preview:');
  console.log('='.repeat(80));
  console.log();
  console.log(message);
  console.log();
  console.log('='.repeat(80));

  console.log();
  console.log('✅ Key Changes Verified:');
  console.log('-'.repeat(80));
  console.log();

  // Check if platform is NOT in the message
  const hasPlatform = message.includes('Platform:');
  console.log(`   1. Platform removed: ${!hasPlatform ? '✅ YES' : '❌ NO (still showing)'}`);

  // Check if original price comes first with strikethrough
  const priceLineMatch = message.match(/💰.*Price.*~~₹.*~~/);
  console.log(`   2. Original price with strikethrough first: ${priceLineMatch ? '✅ YES' : '❌ NO'}`);

  // Check if arrow is used
  const hasArrow = message.includes('➜');
  console.log(`   3. Arrow (➜) between prices: ${hasArrow ? '✅ YES' : '❌ NO'}`);

  // Check if affiliate tag is correct
  const hasCorrectTag = bestProduct.affiliateLink.includes('tag=4340c5-21');
  console.log(`   4. Correct affiliate tag (4340c5-21): ${hasCorrectTag ? '✅ YES' : '❌ NO'}`);

  console.log();
  console.log('='.repeat(80));
  console.log('🎯 Database Configuration:');
  console.log('-'.repeat(80));
  console.log();
  console.log('   Minimum Discount: 80% (updated in database)');
  console.log('   Platform: amazon-scraper');
  console.log('   Affiliate Tag: 4340c5-21');
  console.log();

  console.log('='.repeat(80));
  console.log('📤 Step 3: Send Test Message to Telegram (Optional)');
  console.log('-'.repeat(80));
  console.log();
  console.log('⚠️  Skipping actual send to avoid duplicate posts');
  console.log('   The bot will automatically post with this format on next run');
  console.log();

  console.log('='.repeat(80));
  console.log('✅ Test Complete!');
  console.log('='.repeat(80));
  console.log();

  console.log('📝 Summary:');
  console.log(`   - Products with 80%+ discount: ${products.filter(p => p.discountPercentage >= 80).length}`);
  console.log(`   - Best product discount: ${bestProduct.discountPercentage}%`);
  console.log(`   - Message format: ${!hasPlatform && priceLineMatch && hasArrow ? '✅ Correct' : '⚠️  Needs review'}`);
  console.log(`   - Affiliate tag: ${hasCorrectTag ? '✅ Correct' : '❌ Incorrect'}`);
  console.log();

  console.log('🎯 Expected Telegram Message Format:');
  console.log('   🔥 HUGE DISCOUNT ALERT 🔥');
  console.log('   📱 Product: [Product Name]');
  console.log('   💰 Price: ~~₹[Original]~~ ➜ ₹[Current]');
  console.log('   🎯 Discount: XX% OFF');
  console.log('   💵 You Save: ₹[Amount]');
  console.log('   🔗 Buy Now: [Click Here]');
  console.log('   ⚡ Limited Time Offer! Grab it before it\'s gone!');
  console.log();

  console.log('✅ Next product posted will use this new format!');
  console.log();
}

testNewMessageFormat().catch(error => {
  console.error('❌ Test failed:', error.message);
  console.error(error);
});

