require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Get credentials from .env.local
const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Testing Frog API Credentials ===');
console.log('API Key length:', apiKey?.length);
console.log('API Key starts with:', apiKey?.substring(0, 10));
console.log('Username:', username);

if (!apiKey || !username) {
  console.error('Missing API credentials');
  process.exit(1);
}

// Test data
const testPhone = '233501234567';
const requestBody = {
  number: testPhone,
  expiry: 5,
  length: 6,
  messagetemplate: `Your FeeFlow verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
  type: "NUMERIC",
  senderid: "FeeFlow",
};

console.log('\n=== Making API Request ===');
console.log('Endpoint:', 'https://frogapi.wigal.com.gh/api/v3/sms/otp/generate');
console.log('Request body:', JSON.stringify(requestBody, null, 2));

const options = {
  hostname: 'frogapi.wigal.com.gh',
  port: 443,
  path: '/api/v3/sms/otp/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API-KEY': apiKey,
    'USERNAME': username,
  },
};

const req = https.request(options, (res) => {
  console.log('\n=== Response ===');
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', data);
    
    try {
      const parsedData = JSON.parse(data);
      console.log('Parsed response:', JSON.stringify(parsedData, null, 2));
      
      if (res.statusCode === 200 && parsedData.status === 'SUCCESS') {
        console.log('\n✅ API credentials are working!');
      } else {
        console.log('\n❌ API call failed');
        console.log('Error message:', parsedData.message || 'Unknown error');
      }
    } catch (e) {
      console.log('Failed to parse response:', e);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(JSON.stringify(requestBody));
req.end();