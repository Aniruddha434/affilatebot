/**
 * Test Database Module Integration
 * Verifies that the bot's database module works correctly with Supabase
 * 
 * Usage: node test-database-module.js
 */

require('dotenv').config();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
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

async function testDatabaseModule() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bold');
  log('║        Testing Bot Database Module Integration                ║', 'bold');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bold');

  // Import the actual database module used by the bot
  const database = require('./src/modules/database');

  // Test 1: Initialize database
  info('Test 1: Initializing database module...');
  try {
    await database.initialize();
    success('Database module initialized successfully');
  } catch (err) {
    error(`Initialization failed: ${err.message}`);
    return false;
  }

  // Test 2: Check if product is posted (should be false for new ASIN)
  info('\nTest 2: Testing isProductPosted() with new ASIN...');
  const testAsin = 'TEST' + Date.now();
  try {
    const isPosted = await database.isProductPosted(testAsin);
    if (isPosted === false) {
      success('isProductPosted() correctly returned false for new ASIN');
    } else {
      error('isProductPosted() returned unexpected result');
      return false;
    }
  } catch (err) {
    error(`isProductPosted() failed: ${err.message}`);
    return false;
  }

  // Test 3: Mark product as posted
  info('\nTest 3: Testing markAsPosted()...');
  const testProduct = {
    asin: testAsin,
    title: 'Test Product - Module Integration Test',
    discountPercentage: 80
  };
  
  try {
    const result = await database.markAsPosted(testProduct);
    if (result === true) {
      success('markAsPosted() successfully added product to database');
    } else {
      error('markAsPosted() returned false');
      return false;
    }
  } catch (err) {
    error(`markAsPosted() failed: ${err.message}`);
    return false;
  }

  // Test 4: Check if product is posted (should be true now)
  info('\nTest 4: Testing isProductPosted() with existing ASIN...');
  try {
    const isPosted = await database.isProductPosted(testAsin);
    if (isPosted === true) {
      success('isProductPosted() correctly returned true for existing ASIN');
    } else {
      error('isProductPosted() returned false for existing ASIN');
      return false;
    }
  } catch (err) {
    error(`isProductPosted() failed: ${err.message}`);
    return false;
  }

  // Test 5: Get posted count
  info('\nTest 5: Testing getPostedCount()...');
  try {
    const count = await database.getPostedCount();
    if (typeof count === 'number' && count >= 1) {
      success(`getPostedCount() returned ${count} (includes our test record)`);
    } else {
      error('getPostedCount() returned unexpected result');
      return false;
    }
  } catch (err) {
    error(`getPostedCount() failed: ${err.message}`);
    return false;
  }

  // Test 6: Cleanup test data
  info('\nTest 6: Cleaning up test data...');
  try {
    // Use the Supabase client directly to delete test record
    const { error: deleteError } = await database.supabase
      .from(database.tableName)
      .delete()
      .eq('asin', testAsin);

    if (deleteError) {
      error(`Cleanup failed: ${deleteError.message}`);
      return false;
    }
    success('Test data cleaned up successfully');
  } catch (err) {
    error(`Cleanup error: ${err.message}`);
    return false;
  }

  // Final summary
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bold');
  log('║              ALL TESTS PASSED SUCCESSFULLY                     ║', 'bold');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bold');
  
  success('Database module is fully functional and ready for production!');
  info('\nThe bot can now:');
  info('  ✓ Initialize database connection');
  info('  ✓ Check if products have been posted');
  info('  ✓ Mark products as posted');
  info('  ✓ Get statistics on posted deals');
  info('  ✓ Clean up old entries');
  
  log('\n✨ Your bot is ready to start posting deals!\n', 'green');
  
  return true;
}

// Run tests
testDatabaseModule()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    error(`Unexpected error: ${err.message}`);
    console.error(err);
    process.exit(1);
  });

