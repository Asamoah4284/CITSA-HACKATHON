#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎨 Unsplash API Setup for Real Product Images');
console.log('=============================================\n');

console.log('This script will help you set up the Unsplash API to fetch real product images.');
console.log('Follow these steps:\n');

console.log('1. Go to https://unsplash.com/developers');
console.log('2. Sign up for a free account');
console.log('3. Create a new application');
console.log('4. Copy your Access Key\n');

rl.question('Enter your Unsplash Access Key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('\n❌ No API key provided. Setup cancelled.');
    rl.close();
    return;
  }

  const envContent = `# Unsplash API Key for fetching real product images
# Get your free API key from: https://unsplash.com/developers
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=${apiKey.trim()}

# Note: The API is free and allows 50 requests per hour for demo purposes
# For production, consider upgrading to a paid plan
`;

  const envPath = path.join(process.cwd(), '.env.local');

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Success! Your Unsplash API key has been saved to .env.local');
    console.log('\n🚀 You can now run your development server and see real product images!');
    console.log('\n📝 Next steps:');
    console.log('   - Run: npm run dev');
    console.log('   - Visit: http://localhost:3000/marketplace');
    console.log('   - You should see real African product images loading');
  } catch (error) {
    console.error('\n❌ Error saving API key:', error.message);
    console.log('\n📝 Manual setup:');
    console.log('   - Create a .env.local file in your project root');
    console.log('   - Add: NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_api_key_here');
  }

  rl.close();
});

rl.on('close', () => {
  console.log('\n🎉 Setup complete! Happy coding!');
  process.exit(0);
}); 