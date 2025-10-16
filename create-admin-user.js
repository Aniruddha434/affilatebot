/**
 * Create Admin User Script
 * Run this script to create the first admin user for the admin panel
 * Usage: node create-admin-user.js
 */

require('dotenv').config();
const readline = require('readline');
const adminDatabase = require('./src/modules/adminDatabase');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  try {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🔐  Create Admin User for Bot Management Panel');
    console.log('═══════════════════════════════════════════════════\n');

    // Initialize admin database
    await adminDatabase.initialize();
    console.log('✅ Database connected\n');

    // Get user input
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const confirmPassword = await question('Confirm password: ');

    // Validate input
    if (!username || username.length < 3) {
      console.error('❌ Username must be at least 3 characters');
      process.exit(1);
    }

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      process.exit(1);
    }

    // Create admin user
    console.log('\n⏳ Creating admin user...');
    const user = await adminDatabase.createAdminUser(username, password, email);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Admin user created successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\nUsername: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Created: ${user.created_at}`);
    console.log('\nYou can now login to the admin panel with these credentials.');
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === '23505') {
      console.error('This username or email already exists. Please choose a different one.');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createAdminUser();

