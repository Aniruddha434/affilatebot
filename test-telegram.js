/**
 * Test Telegram Bot Connection
 * This script tests if the bot can send messages to your channel
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

console.log('\n' + '='.repeat(60));
console.log('🤖 TELEGRAM BOT CONNECTION TEST');
console.log('='.repeat(60));

console.log(`\nBot Token: ${BOT_TOKEN ? '✅ Found' : '❌ Missing'}`);
console.log(`Channel ID: ${CHANNEL_ID || '❌ Missing'}`);

if (!BOT_TOKEN) {
  console.error('\n❌ TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error('\n❌ TELEGRAM_CHANNEL_ID not found in .env file');
  process.exit(1);
}

async function testTelegramConnection() {
  try {
    const bot = new TelegramBot(BOT_TOKEN, { polling: false });
    
    console.log('\n📡 Testing bot connection...');
    
    // Get bot info
    const botInfo = await bot.getMe();
    console.log(`✅ Bot connected: @${botInfo.username} (${botInfo.first_name})`);
    
    // Try different channel ID formats
    const channelFormats = [
      CHANNEL_ID,
      `@${CHANNEL_ID}`,
      `-100${CHANNEL_ID}`
    ];
    
    console.log('\n📤 Attempting to send test message...');
    console.log('Trying different channel ID formats:\n');
    
    let success = false;
    let workingFormat = null;
    
    for (const format of channelFormats) {
      try {
        console.log(`   Testing: ${format}`);
        
        const message = `🧪 *Test Message*\n\nThis is a test message from your affiliate bot!\n\nTimestamp: ${new Date().toLocaleString()}`;
        
        await bot.sendMessage(format, message, { parse_mode: 'Markdown' });
        
        console.log(`   ✅ SUCCESS! Messages can be sent to: ${format}\n`);
        success = true;
        workingFormat = format;
        break;
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
    }
    
    if (success) {
      console.log('='.repeat(60));
      console.log('🎉 TELEGRAM CONNECTION SUCCESSFUL!');
      console.log('='.repeat(60));
      console.log(`\n✅ Working Channel ID: ${workingFormat}`);
      console.log('\n📝 Update your .env file with:');
      console.log(`TELEGRAM_CHANNEL_ID=${workingFormat}`);
      console.log('\n💡 The bot is ready to post deals to your channel!');
    } else {
      console.log('='.repeat(60));
      console.log('❌ TELEGRAM CONNECTION FAILED');
      console.log('='.repeat(60));
      console.log('\n🔍 Troubleshooting Steps:\n');
      console.log('1. Make sure the bot is added to your channel as an administrator');
      console.log('2. Check if your channel is public or private:');
      console.log('   - Public channel: Use @channelname format');
      console.log('   - Private channel: Use numeric ID (e.g., -1001234567890)');
      console.log('\n3. To get your channel ID:');
      console.log('   a. Forward a message from your channel to @userinfobot');
      console.log('   b. It will reply with the channel ID');
      console.log('   c. Use that ID in your .env file');
      console.log('\n4. Make sure the bot has these permissions in the channel:');
      console.log('   - Post messages');
      console.log('   - Edit messages');
      console.log('   - Delete messages (optional)');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run test
testTelegramConnection()
  .then(() => {
    console.log('\n✅ Test completed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

