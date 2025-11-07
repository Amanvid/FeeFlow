const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Testing Direct SMS Send Endpoint ===');
console.log('API Key:', apiKey ? 'Set' : 'Not set');
console.log('Username:', username || 'Not set');

if (!apiKey || !username) {
  console.error('Missing API credentials');
  process.exit(1);
}

// Test direct SMS sending
const smsData = {
  number: "233501234567",
  message: "Test message from FeeFlow application",
  senderid: "Stevkky"
};

console.log('\n=== SMS Request Data ===');
console.log(JSON.stringify(smsData, null, 2));

console.log('\n=== Headers ===');
console.log('API-KEY:', apiKey.substring(0, 10) + '...');
console.log('USERNAME:', username);

// Test SMS sending endpoint
fetch('https://frogapi.wigal.com.gh/api/v3/sms/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API-KEY': apiKey,
    'USERNAME': username
  },
  body: JSON.stringify(smsData)
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