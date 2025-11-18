// Debug script to check server environment variables
require('dotenv').config({ path: '.env.local' });

console.log('=== Server Environment Debug ===');
console.log('FROG_API_KEY:', process.env.FROG_API_KEY);
console.log('FROG_API_KEY length:', process.env.FROG_API_KEY?.length);
console.log('FROG_API_KEY starts with:', process.env.FROG_API_KEY?.substring(0, 20));
console.log('FROG_USERNAME:', process.env.FROG_USERNAME);

// Test the exact same API call as the server would make
const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;

console.log('\n=== Testing API Call ===');
console.log('Using API_KEY length:', API_KEY?.length);
console.log('Using USERNAME:', USERNAME);

// Simulate the exact request the server makes
const requestBody = {
  number: "233501234567",
  expiry: 5,
  length: 6,
  messagetemplate: "Your FeeFlow verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.",
  type: "NUMERIC",
  senderid: "FeeFlow",
};

console.log('Request body:', JSON.stringify(requestBody, null, 2));
console.log('Headers:', {
  "Content-Type": "application/json",
  "API-KEY": API_KEY?.substring(0, 10) + '...',
  "USERNAME": USERNAME
});