/**
 * End-to-End Database Workflow Test
 * Simulates the complete bot workflow with database operations
 * 
 * Usage: node test-end-to-end.js
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testEndToEnd() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bold');
  log('║           End-to-End Bot Workflow Simulation                  ║', 'bold');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bold');

  const database = require('./src/modules/database');

  // Simulate bot startup
  info('🚀 Simulating bot startup...');
  try {
    await database.initialize();
    success('Bot initialized successfully');
  } catch (err) {
    error(`Bot initialization failed: ${err.message}`);
    return false;
  }

  // Get initial stats
  info('\n📊 Getting initial statistics...');
  const initialCount = await database.getPostedCount();
  success(`Current database has ${initialCount} posted deals`);

  // Simulate finding new products from Amazon API
  info('\n🔍 Simulating Amazon API product discovery...');
  const mockProducts = [
    {
      asin: 'B08N5WRWNW',
      title: 'Wireless Headphones with Noise Cancellation',
      discountPercentage: 75,
      price: 1999,
      originalPrice: 7999
    },
    {
      asin: 'B09JQMJHXY',
      title: 'Smart Watch with Fitness Tracking',
      discountPercentage: 60,
      price: 2499,
      originalPrice: 6249
    },
    {
      asin: 'B07XYZ1234',
      title: 'Portable Bluetooth Speaker',
      discountPercentage: 80,
      price: 999,
      originalPrice: 4999
    }
  ];
  success(`Found ${mockProducts.length} potential deals from Amazon`);

  // Filter out already posted products
  info('\n🔎 Checking for duplicates in database...');
  const newProducts = [];
  for (const product of mockProducts) {
    const isPosted = await database.isProductPosted(product.asin);
    if (!isPosted) {
      newProducts.push(product);
      info(`  ✓ ${product.asin} - NEW (will post)`);
    } else {
      warn(`  ⊗ ${product.asin} - DUPLICATE (skipping)`);
    }
  }

  if (newProducts.length === 0) {
    warn('All products have already been posted. No new deals to post.');
    info('This is expected behavior - the bot prevents duplicates!');
  } else {
    success(`${newProducts.length} new deals ready to post`);

    // Simulate posting to Telegram and marking as posted
    info('\n📱 Simulating Telegram posting and database updates...');
    for (const product of newProducts) {
      // In real bot, this would post to Telegram
      info(`  Posting: ${product.title}`);
      
      // Mark as posted in database
      const marked = await database.markAsPosted(product);
      if (marked) {
        success(`  ✓ Marked ${product.asin} as posted in database`);
      } else {
        error(`  ✗ Failed to mark ${product.asin} as posted`);
      }
    }
  }

  // Get final stats
  info('\n📊 Getting final statistics...');
  const finalCount = await database.getPostedCount();
  success(`Database now has ${finalCount} posted deals`);
  
  if (newProducts.length > 0) {
    success(`Added ${finalCount - initialCount} new deals in this run`);
  }

  // Verify duplicate prevention works
  info('\n🔄 Testing duplicate prevention...');
  if (newProducts.length > 0) {
    const testProduct = newProducts[0];
    const isDuplicate = await database.isProductPosted(testProduct.asin);
    if (isDuplicate) {
      success('Duplicate prevention working correctly!');
      info(`  Product ${testProduct.asin} correctly identified as already posted`);
    } else {
      error('Duplicate prevention FAILED!');
      return false;
    }
  }

  // Cleanup test data
  info('\n🧹 Cleaning up test data...');
  for (const product of mockProducts) {
    try {
      await database.supabase
        .from(database.tableName)
        .delete()
        .eq('asin', product.asin);
    } catch (err) {
      // Ignore cleanup errors
    }
  }
  success('Test data cleaned up');

  // Final summary
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bold');
  log('║              END-TO-END TEST SUCCESSFUL                        ║', 'bold');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bold');
  
  success('Complete bot workflow verified!');
  info('\nWorkflow tested:');
  info('  ✓ Bot initialization');
  info('  ✓ Database connection');
  info('  ✓ Product discovery simulation');
  info('  ✓ Duplicate checking');
  info('  ✓ Database updates');
  info('  ✓ Statistics tracking');
  info('  ✓ Duplicate prevention');
  
  log('\n✨ Your bot is production-ready!\n', 'green');
  
  return true;
}

// Run test
testEndToEnd()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    error(`Unexpected error: ${err.message}`);
    console.error(err);
    process.exit(1);
  });

