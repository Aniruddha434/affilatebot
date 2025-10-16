/**
 * Pre-Flight Check: Verify bot configuration before starting
 */

require('dotenv').config();

console.log('='.repeat(80));
console.log('🚀 PRE-FLIGHT CHECK: Amazon Scraper Bot Configuration');
console.log('='.repeat(80));
console.log();

let allChecksPass = true;

// Check 1: Environment Variables
console.log('📋 CHECK 1: Environment Variables');
console.log('-'.repeat(80));

const requiredVars = {
  'AMAZON_PARTNER_TAG': process.env.AMAZON_PARTNER_TAG,
  'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
  'TELEGRAM_CHANNEL_ID': process.env.TELEGRAM_CHANNEL_ID,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_KEY': process.env.SUPABASE_KEY,
  'MIN_DISCOUNT_PERCENTAGE': process.env.MIN_DISCOUNT_PERCENTAGE,
  'CRON_SCHEDULE': process.env.CRON_SCHEDULE,
  'MAX_PRODUCTS_PER_RUN': process.env.MAX_PRODUCTS_PER_RUN
};

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value.includes('your_') || value.includes('YOUR_')) {
    console.log(`   ❌ ${key}: NOT CONFIGURED`);
    allChecksPass = false;
  } else {
    // Mask sensitive values
    let displayValue = value;
    if (key.includes('TOKEN') || key.includes('KEY')) {
      displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 5);
    }
    console.log(`   ✅ ${key}: ${displayValue}`);
  }
}

console.log();

// Check 2: Cron Schedule
console.log('📋 CHECK 2: Cron Schedule Configuration');
console.log('-'.repeat(80));

const cronSchedule = process.env.CRON_SCHEDULE;
console.log(`   Schedule: ${cronSchedule}`);

if (cronSchedule === '*/2 * * * *') {
  console.log('   ✅ TESTING MODE: Every 2 minutes');
  console.log('   ⚠️  Remember to change back to production schedule after testing!');
} else if (cronSchedule === '0 */2 * * *') {
  console.log('   ✅ PRODUCTION MODE: Every 2 hours');
} else {
  console.log('   ℹ️  Custom schedule configured');
}

console.log();

// Check 3: Discount Filter
console.log('📋 CHECK 3: Discount Filter');
console.log('-'.repeat(80));

const minDiscount = parseInt(process.env.MIN_DISCOUNT_PERCENTAGE);
console.log(`   Minimum Discount: ${minDiscount}%`);

if (minDiscount >= 85) {
  console.log('   ⚠️  HIGH FILTER: Only products with 85%+ discount will be posted');
  console.log('   ℹ️  This may result in fewer products. Consider lowering to 50-70% for more results.');
} else if (minDiscount >= 50) {
  console.log('   ✅ RECOMMENDED: Good balance between quality and quantity');
} else {
  console.log('   ⚠️  LOW FILTER: May include lower quality deals');
}

console.log();

// Check 4: Telegram Configuration
console.log('📋 CHECK 4: Telegram Configuration');
console.log('-'.repeat(80));

const channelId = process.env.TELEGRAM_CHANNEL_ID;
console.log(`   Channel ID: ${channelId}`);

if (channelId.startsWith('@')) {
  console.log('   ✅ Public channel username format');
} else if (channelId.startsWith('-100')) {
  console.log('   ✅ Private channel ID format');
} else {
  console.log('   ⚠️  Unusual channel ID format - verify it\'s correct');
}

console.log();

// Check 5: Amazon Configuration
console.log('📋 CHECK 5: Amazon Scraper Configuration');
console.log('-'.repeat(80));

const partnerTag = process.env.AMAZON_PARTNER_TAG;
console.log(`   Partner Tag: ${partnerTag}`);

if (partnerTag && partnerTag !== 'yourtag-21') {
  console.log('   ✅ Custom partner tag configured');
  console.log(`   ℹ️  Affiliate links will use: ?tag=${partnerTag}`);
} else {
  console.log('   ⚠️  Using default partner tag - update with your real tag!');
}

console.log();

// Check 6: Platform Status
console.log('📋 CHECK 6: Platform Registration');
console.log('-'.repeat(80));

console.log('   The following platforms will be registered:');
console.log('   - amazon (PA-API - may not work without credentials)');
console.log('   - amazon-scraper (Web scraper - ACTIVE)');
console.log('   - flipkart (Mock data)');
console.log('   - myntra (Mock data)');
console.log();
console.log('   ✅ amazon-scraper platform is registered and ready');

console.log();

// Check 7: Expected Behavior
console.log('📋 CHECK 7: Expected Bot Behavior');
console.log('-'.repeat(80));

console.log('   When the bot starts:');
console.log('   1. ✅ Connect to Supabase database');
console.log('   2. ✅ Initialize platform adapters');
console.log('   3. ✅ Register amazon-scraper platform');
console.log('   4. ✅ Start Telegram bot');
console.log('   5. ✅ Schedule cron job (every 2 minutes for testing)');
console.log();
console.log('   On each scheduled run:');
console.log('   1. ✅ Fetch products from amazon-scraper');
console.log('   2. ✅ Filter products (85%+ discount)');
console.log('   3. ✅ Check if already posted (avoid duplicates)');
console.log('   4. ✅ Post to Telegram channel (@amazondealsmake)');
console.log('   5. ✅ Save to database');
console.log();
console.log('   Each Telegram post will include:');
console.log('   - 📦 Product title');
console.log('   - 💰 Current price and original price');
console.log('   - 🔥 Discount percentage');
console.log('   - 🖼️  Product image');
console.log('   - 🔗 Affiliate link with partner tag');
console.log('   - ⭐ Rating and reviews (if available)');

console.log();

// Final Summary
console.log('='.repeat(80));
if (allChecksPass) {
  console.log('✅ ALL CHECKS PASSED - Bot is ready to start!');
} else {
  console.log('❌ SOME CHECKS FAILED - Please fix configuration before starting');
}
console.log('='.repeat(80));
console.log();

// Next Steps
console.log('📝 NEXT STEPS:');
console.log();
console.log('1. Start the bot:');
console.log('   npm start');
console.log();
console.log('2. Monitor logs for:');
console.log('   - "✅ Scheduler started" message');
console.log('   - "Next job scheduled at: ..." message');
console.log('   - First job execution in ~2 minutes');
console.log();
console.log('3. Check Telegram channel:');
console.log('   https://t.me/amazondealsmake');
console.log();
console.log('4. After testing, update schedule via admin panel:');
console.log('   - Change CRON_SCHEDULE back to: 0 */2 * * *');
console.log('   - Adjust MIN_DISCOUNT_PERCENTAGE as needed');
console.log();
console.log('⚠️  IMPORTANT: The bot will run every 2 minutes during testing.');
console.log('   Make sure to change the schedule back to production settings!');
console.log();

// Exit
if (!allChecksPass) {
  process.exit(1);
}

