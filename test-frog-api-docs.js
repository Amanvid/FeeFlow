const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Testing Frog API with Documentation Format ===');
console.log('API Key:', apiKey ? 'Set' : 'Not set');
console.log('Username:', username || 'Not set');

if (!apiKey || !username) {
  console.error('Missing API credentials');
  process.exit(1);
}

// Test data from documentation
const postData = {
  number: "233501234567", // Using our test number
  expiry: 1,
  length: 5,
  messagetemplate: "Hello, your OTP is : %OTPCODE%. It will expire after %EXPIRY% mins",
  type: "ALPHANUMERIC",
  senderid: "Stevkky"
};

console.log('\n=== Request Data ===');
console.log(JSON.stringify(postData, null, 2));

console.log('\n=== Headers ===');
console.log('API-KEY:', apiKey.substring(0, 10) + '...');
console.log('USERNAME:', username);

// Make the API call exactly as documented
fetch('https://frogapi.wigal.com.gh/api/v3/sms/otp/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API-KEY': apiKey,
    'USERNAME': username
  },
  body: JSON.stringify(postData)
})
.then(response => {
  console.log('\n=== Response Status ===');
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  return response.json();
})
.then(data => {
  console.log('\n=== Response Data ===');
  console.log(JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('\n=== Error ===');
  console.error('Error:', error.message);
});