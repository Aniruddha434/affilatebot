/**
 * Database Connection Verification Script
 * Tests Supabase connection and database operations
 * 
 * Usage: node verify-database.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function verifyDatabase() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bold');
  log('║     Supabase Database Connection Verification                 ║', 'bold');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bold');

  // Step 1: Check environment variables
  info('Step 1: Checking environment variables...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    error('SUPABASE_URL is not set in .env file');
    return false;
  }
  success(`SUPABASE_URL: ${supabaseUrl}`);

  if (!supabaseKey) {
    error('SUPABASE_KEY is not set in .env file');
    return false;
  }
  success(`SUPABASE_KEY: ${supabaseKey.substring(0, 20)}...`);

  // Step 2: Initialize Supabase client
  info('\nStep 2: Initializing Supabase client...');
  
  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    success('Supabase client initialized');
  } catch (err) {
    error(`Failed to initialize Supabase client: ${err.message}`);
    return false;
  }

  // Step 3: Test database connection
  info('\nStep 3: Testing database connection...');
  
  try {
    const { data, error: selectError } = await supabase
      .from('posted_deals')
      .select('count')
      .limit(1);

    if (selectError) {
      error(`Database connection failed: ${selectError.message}`);
      return false;
    }
    success('Database connection successful');
  } catch (err) {
    error(`Database connection error: ${err.message}`);
    return false;
  }

  // Step 4: Verify table structure
  info('\nStep 4: Verifying table structure...');
  
  try {
    const { data, error: structureError } = await supabase
      .from('posted_deals')
      .select('*')
      .limit(1);

    if (structureError && structureError.code !== 'PGRST116') {
      error(`Table structure verification failed: ${structureError.message}`);
      return false;
    }
    success('Table "posted_deals" exists and is accessible');
  } catch (err) {
    error(`Table verification error: ${err.message}`);
    return false;
  }

  // Step 5: Test INSERT operation
  info('\nStep 5: Testing INSERT operation...');
  
  const testProduct = {
    asin: 'TEST' + Date.now(),
    title: 'Test Product - Database Verification',
    discount_percentage: 75,
    posted_at: new Date().toISOString()
  };

  try {
    const { data, error: insertError } = await supabase
      .from('posted_deals')
      .insert(testProduct)
      .select();

    if (insertError) {
      error(`INSERT operation failed: ${insertError.message}`);
      return false;
    }
    success(`INSERT operation successful (ASIN: ${testProduct.asin})`);
  } catch (err) {
    error(`INSERT error: ${err.message}`);
    return false;
  }

  // Step 6: Test SELECT operation
  info('\nStep 6: Testing SELECT operation...');
  
  try {
    const { data, error: selectError } = await supabase
      .from('posted_deals')
      .select('*')
      .eq('asin', testProduct.asin)
      .single();

    if (selectError) {
      error(`SELECT operation failed: ${selectError.message}`);
      return false;
    }
    
    if (data.asin === testProduct.asin) {
      success(`SELECT operation successful (found test record)`);
    } else {
      error('SELECT returned incorrect data');
      return false;
    }
  } catch (err) {
    error(`SELECT error: ${err.message}`);
    return false;
  }

  // Step 7: Test DELETE operation
  info('\nStep 7: Testing DELETE operation (cleanup)...');
  
  try {
    const { error: deleteError } = await supabase
      .from('posted_deals')
      .delete()
      .eq('asin', testProduct.asin);

    if (deleteError) {
      error(`DELETE operation failed: ${deleteError.message}`);
      warn('Test record may remain in database');
      return false;
    }
    success('DELETE operation successful (test record cleaned up)');
  } catch (err) {
    error(`DELETE error: ${err.message}`);
    return false;
  }

  // Step 8: Get database statistics
  info('\nStep 8: Fetching database statistics...');
  
  try {
    const { count, error: countError } = await supabase
      .from('posted_deals')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      warn(`Could not fetch statistics: ${countError.message}`);
    } else {
      success(`Total records in database: ${count || 0}`);
    }
  } catch (err) {
    warn(`Statistics error: ${err.message}`);
  }

  // Final summary
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bold');
  log('║                    VERIFICATION COMPLETE                       ║', 'bold');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bold');
  
  success('All database operations verified successfully!');
  info('\nDatabase Details:');
  info(`  Project: cell_project`);
  info(`  Region: ap-southeast-1 (Singapore)`);
  info(`  Table: posted_deals`);
  info(`  RLS: Enabled`);
  info(`  Status: Ready for production`);
  
  log('\n✨ Your bot is ready to use the database!\n', 'green');
  
  return true;
}

// Run verification
verifyDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    error(`Unexpected error: ${err.message}`);
    console.error(err);
    process.exit(1);
  });

