/**
 * Generate Secure Secrets Script
 * Generates cryptographically secure secrets for the application
 * 
 * Usage: node generate-secrets.js
 */

const { generateAllSecrets } = require('./src/utils/security');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔐  SECURE SECRETS GENERATOR');
console.log('='.repeat(70));
console.log('\nGenerating cryptographically secure secrets...\n');

const secrets = generateAllSecrets();

console.log('✅ Secrets generated successfully!\n');
console.log('📋 Copy these values to your .env file:\n');
console.log('─'.repeat(70));
console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
console.log(`ADMIN_API_SECRET=${secrets.ADMIN_API_SECRET}`);
console.log(`SESSION_SECRET=${secrets.SESSION_SECRET}`);
console.log(`ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}`);
console.log('─'.repeat(70));

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('   1. Keep these secrets secure and never commit them to version control');
console.log('   2. Use different secrets for development and production');
console.log('   3. Rotate secrets periodically (every 90 days recommended)');
console.log('   4. If a secret is compromised, generate new ones immediately');
console.log('\n' + '='.repeat(70) + '\n');

// Optionally save to a file (not .env to avoid accidental commits)
const secretsFile = path.join(__dirname, 'secrets.txt');
const secretsContent = `
# Generated Secrets - ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

JWT_SECRET=${secrets.JWT_SECRET}
ADMIN_API_SECRET=${secrets.ADMIN_API_SECRET}
SESSION_SECRET=${secrets.SESSION_SECRET}
ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}

# Copy these to your .env file and delete this file
`;

fs.writeFileSync(secretsFile, secretsContent);
console.log(`💾 Secrets also saved to: ${secretsFile}`);
console.log('   (Remember to delete this file after copying to .env)\n');

