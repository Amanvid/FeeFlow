require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Get credentials from .env.local
const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Testing Different Sender IDs ===');
console.log('API Key length:', apiKey?.length);
console.log('Username:', username);

if (!apiKey || !username) {
  console.error('❌ Missing API credentials');
  process.exit(1);
}

// Test different sender IDs that might be approved
const senderIds = ['FeeFlow', 'WIGAL', 'TEST', 'INFO', 'SMS'];

async function testSenderId(senderId) {
  console.log(`\n--- Testing Sender ID: ${senderId} ---`);
  
  const testPhone = '233501234567';
  const requestBody = {
    number: testPhone,
    expiry: 5,
    length: 6,
    messagetemplate: `Your ${senderId} verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
    type: "NUMERIC",
    senderid: senderId,
  };

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
        try {
          const parsedData = JSON.parse(data);
          console.log('Response:', JSON.stringify(parsedData, null, 2));
          
          if (res.statusCode === 200 && parsedData.status === 'SUCCESS') {
            console.log(`✅ Sender ID "${senderId}" WORKS!`);
            resolve({ success: true, senderId });
          } else {
            console.log(`❌ Sender ID "${senderId}" failed:`, parsedData.message);
            resolve({ success: false, senderId, error: parsedData.message });
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', e);
          resolve({ success: false, senderId, error: e.message });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      resolve({ success: false, senderId, error: error.message });
    });

    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

async function testAllSenderIds() {
  console.log('Testing different sender IDs to find one that works...\n');
  
  const results = [];
  
  for (const senderId of senderIds) {
    const result = await testSenderId(senderId);
    results.push(result);
    
    // If we find a working sender ID, stop testing
    if (result.success) {
      console.log(`\n🎉 Found working sender ID: ${senderId}`);
      break;
    }
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== Sender ID Test Summary ===');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.senderId}: ${result.success ? 'WORKS' : result.error}`);
  });
  
  const workingSenderIds = results.filter(r => r.success);
  if (workingSenderIds.length === 0) {
    console.log('\n⚠️  No working sender IDs found. The issue might be:');
    console.log('1. API credentials are invalid');
    console.log('2. Account needs activation/verification');
    console.log('3. IP address needs whitelisting');
    console.log('4. Account has insufficient balance');
    console.log('5. Contact Frog API support for account verification');
  }
}

testAllSenderIds().catch(console.error);