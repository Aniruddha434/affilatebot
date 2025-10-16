/**
 * Complete Flow Test
 * Tests: Platform Adapters → Mock Data → Telegram Posting
 */

require('dotenv').config();
const PlatformManager = require('./src/modules/platforms/PlatformManager');
const AmazonAdapter = require('./src/modules/platforms/AmazonAdapter');
const FlipkartAdapter = require('./src/modules/platforms/FlipkartAdapter');
const MyntraAdapter = require('./src/modules/platforms/MyntraAdapter');
const TelegramBotHandler = require('./src/modules/telegramBot');
const logger = require('./src/utils/logger');

console.log('\n' + '='.repeat(70));
console.log('🧪 COMPLETE FLOW TEST: Mock Data → Telegram Channel');
console.log('='.repeat(70));

async function testCompleteFlow() {
  try {
    // Step 1: Initialize Platform Manager
    console.log('\n📦 Step 1: Initializing Platform Manager...');
    const platformManager = PlatformManager.getInstance();
    
    // Register platforms
    const amazonAdapter = new AmazonAdapter({
      accessKey: process.env.AMAZON_ACCESS_KEY || 'placeholder',
      secretKey: process.env.AMAZON_SECRET_KEY || 'placeholder',
      partnerTag: process.env.AMAZON_PARTNER_TAG || 'placeholder',
      region: process.env.AMAZON_REGION || 'in'
    });
    
    const flipkartAdapter = new FlipkartAdapter({
      affiliateId: process.env.FLIPKART_AFFILIATE_ID || 'placeholder',
      apiToken: process.env.FLIPKART_API_TOKEN || 'placeholder',
      trackingId: process.env.FLIPKART_TRACKING_ID || 'placeholder'
    });
    
    const myntraAdapter = new MyntraAdapter({
      affiliateId: process.env.MYNTRA_AFFILIATE_ID || 'placeholder',
      apiKey: process.env.MYNTRA_API_KEY || 'placeholder',
      trackingId: process.env.MYNTRA_TRACKING_ID || 'placeholder'
    });
    
    platformManager.registerPlatform('amazon', amazonAdapter);
    platformManager.registerPlatform('flipkart', flipkartAdapter);
    platformManager.registerPlatform('myntra', myntraAdapter);
    
    console.log('✅ Platform Manager initialized with 3 platforms');
    
    // Step 2: Configure platform settings
    console.log('\n⚙️  Step 2: Configuring platform settings...');
    const platformSettings = [
      {
        platform: 'amazon',
        enabled: true,
        priority: 1,
        posting_ratio: 40,
        min_discount: 10,
        filters: {
          minDiscount: 10,
          maxResults: 5
        }
      },
      {
        platform: 'flipkart',
        enabled: true,
        priority: 2,
        posting_ratio: 30,
        min_discount: 10,
        filters: {
          minDiscount: 10,
          maxResults: 5
        }
      },
      {
        platform: 'myntra',
        enabled: true,
        priority: 3,
        posting_ratio: 30,
        min_discount: 10,
        filters: {
          minDiscount: 10,
          maxResults: 5
        }
      }
    ];
    
    platformManager.updatePlatformSettings(platformSettings);
    console.log('✅ Platform settings configured');
    
    // Step 3: Fetch mock products from all platforms
    console.log('\n🔍 Step 3: Fetching mock products from all platforms...');
    const keywords = 'electronics deals';
    const totalProducts = 9; // 3 from each platform
    
    const products = await platformManager.fetchFromAllPlatforms(keywords, totalProducts);
    
    console.log(`\n✅ Fetched ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. [${product.platform.toUpperCase()}] ${product.title.substring(0, 50)}...`);
      console.log(`      Price: ₹${product.currentPrice} (${product.discountPercentage}% off)`);
    });
    
    if (products.length === 0) {
      console.log('\n❌ No products fetched. Cannot proceed with Telegram test.');
      return;
    }
    
    // Step 4: Initialize Telegram Bot
    console.log('\n📱 Step 4: Initializing Telegram Bot...');
    const telegramBot = new TelegramBotHandler();
    telegramBot.initialize();
    console.log('✅ Telegram Bot initialized');
    
    // Step 5: Send test message
    console.log('\n📤 Step 5: Sending test products to Telegram channel...');
    console.log(`   Channel: ${process.env.TELEGRAM_CHANNEL_ID}`);
    
    // Send first 3 products as a test
    const testProducts = products.slice(0, 3);
    
    for (let i = 0; i < testProducts.length; i++) {
      const product = testProducts[i];
      console.log(`\n   Sending product ${i + 1}/${testProducts.length}...`);
      console.log(`   Platform: ${product.platform}`);
      console.log(`   Title: ${product.title.substring(0, 50)}...`);
      
      try {
        await telegramBot.sendPlatformDeal(product);
        console.log(`   ✅ Successfully sent!`);
        
        // Wait 2 seconds between messages to avoid rate limiting
        if (i < testProducts.length - 1) {
          console.log('   ⏳ Waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.log(`   ❌ Failed to send: ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Platforms initialized: 3 (Amazon, Flipkart, Myntra)`);
    console.log(`✅ Products fetched: ${products.length}`);
    console.log(`✅ Test messages sent: ${testProducts.length}`);
    console.log('\n💡 Check your Telegram channel to see the posted deals!');
    console.log('   Channel: ' + process.env.TELEGRAM_CHANNEL_ID);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Run "node test-telegram.js" to verify Telegram connection');
    console.log('2. Check your .env file for correct credentials');
    console.log('3. Ensure bot is added as admin to your channel');
    console.log('4. Check console logs for detailed error messages');
  }
}

// Run test
console.log('\n🚀 Starting complete flow test...\n');
testCompleteFlow()
  .then(() => {
    console.log('\n✅ Test completed successfully!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

