// Test error handling for missing credentials
const originalEnv = process.env.FROG_API_KEY;

console.log('Testing error handling with missing API key...');

// Temporarily remove the API key
process.env.FROG_API_KEY = '';

// Import the function after removing the key
const { generateOtp } = require('./dist/lib/actions.js');

generateOtp('233501234567').then(result => {
  console.log('Result:', result);
  // Restore the original key
  process.env.FROG_API_KEY = originalEnv;
}).catch(error => {
  console.error('Error:', error);
  process.env.FROG_API_KEY = originalEnv;
});