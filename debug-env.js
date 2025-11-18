// Debug script to check environment variables in server context
console.log('=== Environment Variables Debug ===');
console.log('FROG_API_KEY:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
console.log('FROG_USERNAME:', process.env.FROG_USERNAME ? 'Set' : 'Not set');

// Check if dotenv is loaded
if (require('dotenv').config({ path: '.env.local' }).error) {
  console.log('❌ Failed to load .env.local');
} else {
  console.log('✅ .env.local loaded successfully');
}

console.log('After dotenv load:');
console.log('FROG_API_KEY:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
console.log('FROG_USERNAME:', process.env.FROG_USERNAME ? 'Set' : 'Not set');

// Test the actual values (masked)
if (process.env.FROG_API_KEY) {
  console.log('API_KEY length:', process.env.FROG_API_KEY.length);
  console.log('API_KEY starts with:', process.env.FROG_API_KEY.substring(0, 10) + '...');
}
if (process.env.FROG_USERNAME) {
  console.log('USERNAME:', process.env.FROG_USERNAME);
}