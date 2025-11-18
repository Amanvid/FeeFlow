require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Get credentials from .env.local
const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Comprehensive Frog API Test ===');
console.log('API Key length:', apiKey?.length);
console.log('API Key starts with:', apiKey?.substring(0, 10));
console.log('Username:', username);
console.log('Sender ID: FeeFlow');

if (!apiKey || !username) {
  console.error('❌ Missing API credentials');
  process.exit(1);
}

// Test both OTP generation and SMS sending
async function testOtpGeneration() {
  console.log('\n=== Testing OTP Generation ===');
  
  const testPhone = '233501234567';
  const requestBody = {
    number: testPhone,
    expiry: 5,
    length: 6,
    messagetemplate: `Your FeeFlow verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
    type: "NUMERIC",
    senderid: "FeeFlow",
  };

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

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log('Response status:', res.statusCode, res.statusMessage);
      
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
            console.log('✅ OTP Generation: SUCCESS');
            resolve({ success: true, data: parsedData });
          } else {
            console.log('❌ OTP Generation: FAILED');
            console.log('Error message:', parsedData.message || 'Unknown error');
            resolve({ success: false, data: parsedData });
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', e);
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

async function testSmsSending() {
  console.log('\n=== Testing SMS Sending ===');
  
  const testPhone = '233501234567';
  const requestBody = {
    senderid: "FeeFlow",
    destinations: [{
      destination: testPhone,
      message: "Hello, this is a test message from FeeFlow",
      msgid: `test-${Date.now()}`,
      smstype: "text"
    }]
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  const options = {
    hostname: 'frogapi.wigal.com.gh',
    port: 443,
    path: '/api/v3/sms/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': apiKey,
      'USERNAME': username,
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log('Response status:', res.statusCode, res.statusMessage);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response body:', data);
        
        try {
          const parsedData = JSON.parse(data);
          console.log('Parsed response:', JSON.stringify(parsedData, null, 2));
          
          if (res.statusCode === 200 && parsedData.status === 'ACCEPTD') {
            console.log('✅ SMS Sending: SUCCESS');
            resolve({ success: true, data: parsedData });
          } else {
            console.log('❌ SMS Sending: FAILED');
            console.log('Error message:', parsedData.message || 'Unknown error');
            resolve({ success: false, data: parsedData });
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', e);
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

async function testAccountStatus() {
  console.log('\n=== Testing Account Status ===');
  
  // Try to get account info or check if credentials are valid
  const options = {
    hostname: 'frogapi.wigal.com.gh',
    port: 443,
    path: '/api/v3/account/info', // This might not exist, but let's try
    method: 'GET',
    headers: {
      'API-KEY': apiKey,
      'USERNAME': username,
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log('Account info status:', res.statusCode, res.statusMessage);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Account info response:', data);
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.error('Account info error:', error);
      resolve({ error: error.message });
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Starting comprehensive API tests...\n');
  
  // Test OTP generation
  const otpResult = await testOtpGeneration();
  
  // Test SMS sending
  const smsResult = await testSmsSending();
  
  // Test account status
  const accountResult = await testAccountStatus();
  
  console.log('\n=== Test Summary ===');
  console.log('OTP Generation:', otpResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('SMS Sending:', smsResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('Account Status:', accountResult.statusCode === 200 ? '✅ PASS' : '❌ FAIL');
  
  if (!otpResult.success || !smsResult.success) {
    console.log('\n=== Troubleshooting ===');
    console.log('1. Verify that your API key and username are correct');
    console.log('2. Check if your account has the necessary permissions');
    console.log('3. Ensure that "FeeFlow" is an approved sender ID');
    console.log('4. Contact Frog API support to verify account status');
    console.log('5. Check if there are any IP whitelisting requirements');
  }
}

runTests().catch(console.error);