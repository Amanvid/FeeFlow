require('dotenv').config({ path: '.env.local' });

console.log('=== Direct Environment Check ===');
console.log('FROG_API_KEY length:', process.env.FROG_API_KEY?.length || 0);
console.log('FROG_API_KEY starts with:', process.env.FROG_API_KEY?.substring(0, 20));
console.log('FROG_API_KEY ends with:', process.env.FROG_API_KEY?.slice(-10));

console.log('\n=== Environment File Check ===');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/FROG_API_KEY=(.+)/);
if (apiKeyMatch) {
  const keyFromFile = apiKeyMatch[1].trim();
  console.log('FROG_API_KEY from file length:', keyFromFile.length);
  console.log('FROG_API_KEY from file starts with:', keyFromFile.substring(0, 20));
  console.log('FROG_API_KEY from file ends with:', keyFromFile.slice(-10));
}