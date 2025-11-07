// Debug script to check Frog API environment variables
require('dotenv').config({ path: '.env.local' });

console.log('=== Frog API Environment Debug ===');
console.log('FROG_API_KEY:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
if (process.env.FROG_API_KEY) {
  console.log('FROG_API_KEY length:', process.env.FROG_API_KEY.length);
  console.log('FROG_API_KEY starts with:', process.env.FROG_API_KEY.substring(0, 10));
}
console.log('FROG_USERNAME:', process.env.FROG_USERNAME);

console.log('\n=== Testing API Call ===');
const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

if (apiKey && username) {
  console.log('Headers that will be sent:');
  console.log('API-KEY:', apiKey.substring(0, 10) + '...');
  console.log('USERNAME:', username);
  
  // Test the actual API call
  fetch('https://frogapi.wigal.com.gh/api/v3/sms/otp/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': apiKey,
      'USERNAME': username,
    },
    body: JSON.stringify({
      number: '233501234567',
      expiry: 5,
      length: 6,
      messagetemplate: 'Your FeeFlow verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.',
      type: 'NUMERIC',
      senderid: 'FeeFlow'
    })
  })
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
} else {
  console.log('❌ Missing API credentials');
}