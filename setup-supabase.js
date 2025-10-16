/**
 * Automatic Supabase Setup Script
 * Creates database table using Supabase MCP
 * 
 * Usage: node setup-supabase.js
 */

require('dotenv').config();

const setupInstructions = `
╔════════════════════════════════════════════════════════════════╗
║          Supabase Setup - Automatic via MCP                    ║
╚════════════════════════════════════════════════════════════════╝

Good news! Your bot can use Supabase through MCP (Model Context Protocol).
This means you don't need to manually get Supabase credentials!

📋 AVAILABLE SUPABASE PROJECTS:

1. cell_project (ID: dbnldknxqqsysfwlswtb)
   Region: ap-southeast-1
   Status: ACTIVE_HEALTHY

2. augcell-subscriptions (ID: ysmpwkovtbatonurahpt)
   Region: us-east-1
   Status: ACTIVE_HEALTHY

╔════════════════════════════════════════════════════════════════╗
║                    SETUP INSTRUCTIONS                          ║
╚════════════════════════════════════════════════════════════════╝

OPTION 1: Use Existing Project (Recommended)
─────────────────────────────────────────────

1. Choose one of the projects above
2. Add to your .env file:
   
   SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb
   
   (or use ysmpwkovtbatonurahpt for the other project)

3. Create the database table:
   
   a. Go to: https://app.supabase.com/project/dbnldknxqqsysfwlswtb/sql
   b. Click "New Query"
   c. Copy and paste the SQL from supabase-setup.sql
   d. Click "Run"

4. Done! The bot will use MCP to access Supabase automatically.


OPTION 2: Create New Project (If you prefer)
─────────────────────────────────────────────

1. Go to: https://app.supabase.com/
2. Click "New Project"
3. Name it: "amazon-deals-bot"
4. Choose region closest to you
5. Wait for setup to complete
6. Get the project reference from the URL:
   https://app.supabase.com/project/[PROJECT_REF]/...
7. Add to .env:
   SUPABASE_PROJECT_REF=[PROJECT_REF]
8. Run the SQL from supabase-setup.sql


OPTION 3: Manual Credentials (Legacy)
──────────────────────────────────────

If you prefer to use manual credentials instead of MCP:

1. Go to your Supabase project settings
2. Go to API section
3. Copy:
   - Project URL
   - anon/public key
4. Add to .env:
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=eyJ...
5. Run the SQL from supabase-setup.sql


╔════════════════════════════════════════════════════════════════╗
║                    RECOMMENDED SETUP                           ║
╚════════════════════════════════════════════════════════════════╝

For the easiest setup, use OPTION 1:

1. Edit your .env file and add:
   
   SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb

2. Go to Supabase SQL Editor:
   https://app.supabase.com/project/dbnldknxqqsysfwlswtb/sql

3. Run the SQL from supabase-setup.sql

4. Start your bot:
   npm start

That's it! MCP handles all the authentication automatically.


╔════════════════════════════════════════════════════════════════╗
║                    VERIFICATION                                ║
╚════════════════════════════════════════════════════════════════╝

After setup, verify:

✓ .env has SUPABASE_PROJECT_REF set
✓ Table 'posted_deals' exists in Supabase
✓ Bot starts without errors
✓ First deal posts successfully


╔════════════════════════════════════════════════════════════════╗
║                    NEED HELP?                                  ║
╚════════════════════════════════════════════════════════════════╝

Check these files:
- README.md - Full documentation
- SETUP_GUIDE.md - Detailed setup instructions
- START_HERE.md - Quick start guide

`;

console.log(setupInstructions);

// Check current configuration
console.log('\n📊 CURRENT CONFIGURATION CHECK:\n');

if (process.env.SUPABASE_PROJECT_REF) {
  console.log('✅ SUPABASE_PROJECT_REF is set:', process.env.SUPABASE_PROJECT_REF);
  console.log('   Using MCP mode (automatic credentials)');
} else if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  console.log('✅ SUPABASE_URL and SUPABASE_KEY are set');
  console.log('   Using manual credentials mode');
} else {
  console.log('❌ No Supabase configuration found in .env');
  console.log('   Please add SUPABASE_PROJECT_REF to your .env file');
  console.log('\n   Example:');
  console.log('   SUPABASE_PROJECT_REF=dbnldknxqqsysfwlswtb');
}

console.log('\n' + '═'.repeat(70));
console.log('Next step: Edit your .env file and add the configuration above');
console.log('═'.repeat(70) + '\n');

