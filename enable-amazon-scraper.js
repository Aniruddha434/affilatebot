/**
 * Enable Amazon Scraper Platform
 * This script will:
 * 1. Disable the regular amazon platform (PA-API)
 * 2. Enable the amazon-scraper platform
 * 3. Set appropriate posting ratio
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function enableAmazonScraper() {
  console.log('='.repeat(80));
  console.log('🔧 Configuring Platform Settings');
  console.log('='.repeat(80));
  console.log();

  // Initialize Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  console.log('📊 Step 1: Checking current platform settings...');
  console.log();

  // Get current settings
  const { data: currentSettings, error: fetchError } = await supabase
    .from('platform_settings')
    .select('*')
    .order('priority');

  if (fetchError) {
    console.error('❌ Error fetching settings:', fetchError);
    return;
  }

  console.log('Current Platform Settings:');
  console.log('-'.repeat(80));
  if (currentSettings && currentSettings.length > 0) {
    currentSettings.forEach(setting => {
      console.log(`   ${setting.enabled ? '✅' : '❌'} ${setting.platform.padEnd(20)} | Ratio: ${setting.posting_ratio}% | Priority: ${setting.priority}`);
    });
  } else {
    console.log('   No settings found in database');
  }
  console.log();

  // Step 2: Disable regular amazon platform
  console.log('📊 Step 2: Disabling regular amazon platform (PA-API)...');
  
  const { error: disableAmazonError } = await supabase
    .from('platform_settings')
    .update({ enabled: false })
    .eq('platform', 'amazon');

  if (disableAmazonError) {
    console.log('   ⚠️  Warning: Could not disable amazon platform:', disableAmazonError.message);
  } else {
    console.log('   ✅ Regular amazon platform disabled');
  }
  console.log();

  // Step 3: Enable amazon-scraper platform
  console.log('📊 Step 3: Enabling amazon-scraper platform...');
  
  // First, check if amazon-scraper exists
  const { data: scraperExists } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('platform', 'amazon-scraper')
    .single();

  if (scraperExists) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('platform_settings')
      .update({
        enabled: true,
        posting_ratio: 100,
        priority: 1
      })
      .eq('platform', 'amazon-scraper');

    if (updateError) {
      console.log('   ❌ Error updating amazon-scraper:', updateError.message);
    } else {
      console.log('   ✅ amazon-scraper platform enabled (100% posting ratio)');
    }
  } else {
    // Insert new record with only the columns that exist
    const { error: insertError } = await supabase
      .from('platform_settings')
      .insert({
        platform: 'amazon-scraper',
        enabled: true,
        posting_ratio: 100,
        priority: 1
      });

    if (insertError) {
      console.log('   ❌ Error inserting amazon-scraper:', insertError.message);
    } else {
      console.log('   ✅ amazon-scraper platform created and enabled (100% posting ratio)');
    }
  }
  console.log();

  // Step 4: Disable other platforms for testing
  console.log('📊 Step 4: Disabling other platforms for testing...');
  
  const { error: disableOthersError } = await supabase
    .from('platform_settings')
    .update({ enabled: false })
    .in('platform', ['flipkart', 'myntra']);

  if (disableOthersError) {
    console.log('   ⚠️  Warning: Could not disable other platforms:', disableOthersError.message);
  } else {
    console.log('   ✅ Flipkart and Myntra platforms disabled');
  }
  console.log();

  // Step 5: Verify final settings
  console.log('📊 Step 5: Verifying final settings...');
  console.log();

  const { data: finalSettings, error: finalError } = await supabase
    .from('platform_settings')
    .select('*')
    .order('priority');

  if (finalError) {
    console.error('❌ Error fetching final settings:', finalError);
    return;
  }

  console.log('Final Platform Settings:');
  console.log('-'.repeat(80));
  if (finalSettings && finalSettings.length > 0) {
    finalSettings.forEach(setting => {
      const status = setting.enabled ? '✅ ENABLED ' : '❌ DISABLED';
      console.log(`   ${status} | ${setting.platform.padEnd(20)} | Ratio: ${setting.posting_ratio}% | Priority: ${setting.priority}`);
    });
  } else {
    console.log('   No settings found');
  }
  console.log();

  console.log('='.repeat(80));
  console.log('✅ Configuration Complete!');
  console.log('='.repeat(80));
  console.log();
  console.log('📝 Summary:');
  console.log('   ✅ amazon-scraper: ENABLED (100% posting ratio)');
  console.log('   ❌ amazon (PA-API): DISABLED');
  console.log('   ❌ flipkart: DISABLED');
  console.log('   ❌ myntra: DISABLED');
  console.log();
  console.log('🚀 Next Steps:');
  console.log('   1. Restart the bot (Ctrl+C then npm start)');
  console.log('   2. Bot will now use amazon-scraper only');
  console.log('   3. Monitor logs for "amazon-scraper" messages');
  console.log('   4. Check Telegram channel for posts');
  console.log();
}

enableAmazonScraper().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

